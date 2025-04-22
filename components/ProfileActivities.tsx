import Container from "@/components/Container";
import { useSession } from "@/components/SessionContext";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "./ui/hstack";
import { WorkoutPost } from "@/components/WorkoutPost";
import { supabase } from "@/lib/supabase";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Dimensions, TouchableOpacity, View } from "react-native";
import { getFollowing, getFriends } from "@/services/profileServices";
import { Heading } from "./ui/heading";
import { Card } from "./ui/card";
import { formatDate, formatDuration, formatTime, Post } from "@/app/(tabs)/feed";
import { DetailedWorkoutData, SummaryWorkoutData, WorkoutHeader } from "./WorkoutData";
import { useNavigation } from "@react-navigation/native";
import { WorkoutData } from "@/types/workout-types";
import { LineChart, BarChart } from 'react-native-chart-kit';
import { RadioGroup, Radio, RadioIndicator, RadioIcon, RadioLabel } from "@/components/ui/radio";
import { Icon, TrashIcon, EditIcon, AddIcon, ChevronLeftIcon, DownloadIcon, CloseIcon, InfoIcon, BellIcon, CheckIcon } from "@/components/ui/icon";
import { Box } from "./ui/box";
import { Accordion, AccordionContent, AccordionContentText, AccordionHeader, AccordionTitleText } from "./ui/accordion";
import { getTagsAndDetails } from "@/services/exerciseServices";
import { TagString } from "./Tag";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalFooter
} from "@/components/ui/modal";
import { Pressable } from "./ui/pressable";
import { Switch } from "./ui/switch";
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProfileActivitiesProps = {
    posts: Post[];
    isLoading: boolean;
    updatePostFunc: (postId: string, title: string, description: string) => Promise<any[]>;
}

export type PopularExercise = {
    name: string;
    count: number;
    weight: number;
    unit: string;
    details: string;
    tags: string[];
}

export const ProfileActivities = ({
    posts,
    isLoading,
    updatePostFunc,
}: ProfileActivitiesProps) => {

    const { session } = useSession();
    const navigation = useNavigation();
    const toast = useToast();
    const queryClient = useQueryClient();

    // Notification preferences state
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [notificationFrequency, setNotificationFrequency] = useState("weekly");
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    
    // Summary popup state
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [summaryData, setSummaryData] = useState({
      frequency: "weekly",
      workoutCount: 0,
      totalMinutes: 0,
      mostPopularExercise: "None"
    });

    const [detailsModal, setDetailsModal] = useState("");

    const [postViewCount, setPostViewCount] = useState(4);
    const [visiblePosts, setVisiblePosts] = useState(posts.length > 4 ? posts.slice(0, 4) : posts.slice());
    const [hasMorePosts, setHasMorePosts] = useState(posts.length > 0 ? true : false);

    const [workouts, setWorkouts] = useState<Post[]>([]);
    const [workoutViewCount, setWorkoutViewCount] = useState(4);
    const [visibleWorkouts, setVisibleWorkouts] = useState<Post[]>([]);
    const [hasMoreWorkouts, setHasMoreWorkouts] = useState(posts.length > 0 ? true : false);
    const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);

    const [favoritesViewCount, setFavoritesViewCount] = useState(4);

    const [timePeriod, setTimePeriod] = useState("week")
    const [userPostCount, setUserPostCount] = useState({
      totalPosts: posts.length,
      totalPostsYear: 0,
      totalPostsMonth: 0,
      totalPostsWeek: 0,
    });
    const [popularExercises, setPopularExercises] = useState([] as PopularExercise[]);
    const [totalWorkouts, setTotalWorkouts] = useState({
      totalWorkouts: workouts.length,
      totalWorkoutsYear: 0,
      totalWorkoutsMonth: 0,
      totalWorkoutsWeek: 0,
    });
    const [totalMinutes, setTotalMinutes] = useState({
      totalMinutes: 0,
      totalMinutesYear: 0,
      totalMinutesMonth: 0,
      totalMinutesWeek: 0,
    });
    const [workoutData, setWorkoutData] = useState({
      workouts: workouts,
      workoutsYear: [] as Post[],
      workoutsMonth: [] as Post[],
      workoutsWeek: [] as Post[],
    })

    // Load notification preferences from storage
    useEffect(() => {
      const loadNotificationPreferences = async () => {
        try {
          const storedEnabled = await AsyncStorage.getItem('notificationsEnabled');
          const storedFrequency = await AsyncStorage.getItem('notificationFrequency');
          
          if (storedEnabled !== null) {
            setNotificationsEnabled(storedEnabled === 'true');
          }
          
          if (storedFrequency !== null) {
            setNotificationFrequency(storedFrequency);
          }
        } catch (error) {
          console.error('Error loading notification preferences:', error);
        }
      };
      
      loadNotificationPreferences();
    }, []);

    // Save notification preferences
    const saveNotificationPreferences = async () => {
      try {
        await AsyncStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
        await AsyncStorage.setItem('notificationFrequency', notificationFrequency);
        
        if (notificationsEnabled) {
          await registerForPushNotifications();
          scheduleWorkoutSummaryNotification();
          showSuccessToast(toast, `Workout summary notifications set to ${notificationFrequency}`);
        } else {
          await cancelAllScheduledNotifications();
          showSuccessToast(toast, "Workout summary notifications disabled");
        }
        
        setShowNotificationModal(false);
      } catch (error) {
        console.error('Error saving notification preferences:', error);
        showErrorToast(toast, "Failed to save notification preferences");
      }
    };

    // Request notification permissions
    const registerForPushNotifications = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        showErrorToast(toast, "Failed to get notification permissions");
        setNotificationsEnabled(false);
        return false;
      }
      
      return true;
    };

    // Cancel all notifications
    const cancelAllScheduledNotifications = async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();
    };

    // Generate notification summary text based on frequency
    const generateSummaryText = (frequency = notificationFrequency) => {
      let summaryStats = {
        frequency,
        workoutCount: 0,
        totalMinutes: 0,
        mostPopularExercise: popularExercises.length > 0 ? popularExercises[0].name : "None",
      };
      
      switch (frequency) {
        case 'daily':
          summaryStats.workoutCount = workoutData.workoutsWeek.filter(
            workout => new Date(workout.createdAt).toDateString() === new Date().toDateString()
          ).length;
          
          // Calculate daily minutes
          workoutData.workoutsWeek.forEach(workout => {
            if (new Date(workout.createdAt).toDateString() === new Date().toDateString() && 
                workout.workoutData?.duration) {
              summaryStats.totalMinutes += parseInt(workout.workoutData.duration.split(':')[0]);
            }
          });
          break;
        case 'weekly':
          summaryStats.workoutCount = totalWorkouts.totalWorkoutsWeek;
          summaryStats.totalMinutes = totalMinutes.totalMinutesWeek;
          break;
        case 'monthly':
          summaryStats.workoutCount = totalWorkouts.totalWorkoutsMonth;
          summaryStats.totalMinutes = totalMinutes.totalMinutesMonth;
          break;
      }
      
      return summaryStats;
    };

    // Schedule workout summary notification based on frequency
    const scheduleWorkoutSummaryNotification = async () => {
      // Cancel any existing notifications first
      await cancelAllScheduledNotifications();
      
      if (!notificationsEnabled) return;
      
      let trigger: any;
      
      switch (notificationFrequency) {
        case 'daily':
          // Schedule for 8 PM every day
          trigger = {
            hour: 20,
            minute: 0,
            repeats: true,
          };
          break;
        case 'weekly':
          // Schedule for Sunday at 8 PM
          trigger = {
            weekday: 1, // Monday is 1, Sunday is 7 in this API
            hour: 20,
            minute: 0,
            repeats: true,
          };
          break;
        case 'monthly':
          // Schedule for 1st day of month at 8 PM
          const now = new Date();
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 20, 0, 0);
          trigger = nextMonth;
          // We'll need to reschedule this monthly since we can't set a simple repeat
          break;
      }
      
      if (trigger) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Workout Summary",
            body: `Your ${notificationFrequency} workout summary is ready!`,
            data: { frequency: notificationFrequency },
          },
          trigger,
        });
      }
    };

    // Show the summary immediately for testing
    const showSummaryNow = () => {
      const stats = generateSummaryText();
      setSummaryData(stats);
      setShowSummaryModal(true);
    };

    // Set up notification handler
    useEffect(() => {
      // Set up notification received handler
      const subscription = Notifications.addNotificationReceivedListener(notification => {
        const frequency = notification.request.content.data?.frequency;
        if (frequency) {
          console.log(`Received ${frequency} summary notification`);
        }
      });
      
      // Set up notification response handler (when user taps notification)
      const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        const frequency = response.notification.request.content.data?.frequency;
        if (frequency) {
          // Navigate to profile activities and focus on the relevant time period
          setTimePeriod(frequency === 'monthly' ? 'month' : frequency.replace('ly', ''));
          
          // Generate summary data and show the modal
          const stats = generateSummaryText(frequency);
          setSummaryData(stats);
          setShowSummaryModal(true);
        }
      });
      
      return () => {
        subscription.remove();
        responseSubscription.remove();
      };
    }, [workoutData, totalWorkouts, totalMinutes, popularExercises]);

    const { mutate, isPending: isTagsPending } = useMutation({
      mutationFn: async (popularExercises: PopularExercise[]) => {
        const temp = await getTagsAndDetails(popularExercises.map((exercise) => {return exercise.name}));
        popularExercises.map((favorite) => {
          favorite.tags = temp.tagMap[favorite.name];
          favorite.details = temp.detailsMap[favorite.name];
          return favorite
        })
        setPopularExercises(popularExercises)
      },
      onError: (err) => {
        showErrorToast(toast, err.message);
      },
      onSuccess: () => {
      },
    });

    const calculateStats = () => {
      const now = new Date();
      const DOWArray = [0, 1, 2, 3, 4, 5, 6].slice(0, now.getDay() + 1);

      const postsYear = posts.filter((post) => 
        (new Date(post.createdAt)).getFullYear() === now.getFullYear()
      );
      
      const workoutsYear = postsYear.filter((post) => 
        post?.workoutData && post.workoutData.exercises.length !== 0
      );
      
      const postsMonth = posts.filter((post) => 
        (new Date(post.createdAt)).getFullYear() === now.getFullYear() &&
        (new Date(post.createdAt)).getMonth() === now.getMonth()
      );
      
      const workoutsMonth = postsMonth.filter((post) => 
        post?.workoutData && post.workoutData.exercises.length !== 0
      );
      
      const postsWeek = posts.filter((post) => 
        (new Date(post.createdAt)).getFullYear() === now.getFullYear() &&
        (new Date(post.createdAt)).getMonth() === now.getMonth() &&
        (Math.abs((new Date(post.createdAt)).getDate() - now.getDate()) <= now.getDay()) &&
        DOWArray.includes((new Date(post.createdAt)).getDay())
      );
      
      const workoutsWeek = postsWeek.filter((post) => 
        post?.workoutData && post.workoutData.exercises.length !== 0
      );
      setUserPostCount({
        totalPosts: posts.length,
        totalPostsYear: postsYear.length,
        totalPostsMonth: postsMonth.length,
        totalPostsWeek: postsWeek.length
      });
      setTotalWorkouts({
        totalWorkouts: workouts.length,
        totalWorkoutsYear: workoutsYear.length,
        totalWorkoutsMonth: workoutsMonth.length,
        totalWorkoutsWeek: workoutsWeek.length
      });
      setWorkoutData({
        workouts: workouts,
        workoutsYear: workoutsYear as Post[],
        workoutsMonth: workoutsMonth as Post[],
        workoutsWeek: workoutsWeek as Post[],
      })
      let secondData = {
        totalSeconds: 0,
        totalSecondsYear: 0,
        totalSecondsMonth: 0,
        totalSecondsWeek: 0,
      };
      let popularData = [] as PopularExercise[];
      const addFavorites = (data: WorkoutData, popularArray: PopularExercise[]) => {
        data.exercises.map((exercise) => {
          let popularIndex = popularArray.findIndex(favorite => favorite.name === exercise.name);
          let weight = exercise.weight ? (
            exercise.weight.split(" ")[1] === "kg" ? (
              parseInt(exercise.weight.split(" ")[0]) * 2.2046226218 //kg to lbs
            ) : (
              parseInt(exercise.weight.split(" ")[0])
            )
          ) : 0
          let oldWeight = popularIndex !== -1 && popularArray[popularIndex].weight && popularArray[popularIndex].unit ? (
            popularArray[popularIndex].unit === "kg" ? (
              popularArray[popularIndex].weight * 2.2046226218 //kg to lbs
            ) : (
              popularArray[popularIndex].weight
            )
          ) : 0
          if (popularIndex > -1) {
            popularArray[popularIndex].count += (exercise.sets ? exercise.sets : 0)
            if (exercise.weight && oldWeight < weight) {
              popularArray[popularIndex].weight = parseInt(exercise.weight.split(" ")[0])
              popularArray[popularIndex].unit = exercise.weight.split(" ")[1]
            }
          } else {
            popularArray.push({
              name: exercise.name,
              count: exercise.sets,
              weight: weight,
              unit: exercise.weight ? exercise.weight.split(" ")[1] : "lbs",
            } as PopularExercise)
          }
        })
      }
      workouts.map((workout) => {
        if (!workout.workoutData || !workout.workoutData.duration) return;
        secondData.totalSeconds += (parseInt(workout.workoutData.duration.split(":")[1]) + parseInt(workout.workoutData.duration.split(":")[0])*60);
        addFavorites(workout.workoutData as WorkoutData, popularData);

        if (workoutsYear.includes(workout)) {
          secondData.totalSecondsMonth += (parseInt(workout.workoutData.duration.split(":")[1]) + parseInt(workout.workoutData.duration.split(":")[0])*60);
        }
        if (workoutsMonth.includes(workout)) {
          secondData.totalSecondsMonth += (parseInt(workout.workoutData.duration.split(":")[1]) + parseInt(workout.workoutData.duration.split(":")[0])*60);
        }
        if (workoutsWeek.includes(workout)) {
          secondData.totalSecondsWeek += (parseInt(workout.workoutData.duration.split(":")[1]) + parseInt(workout.workoutData.duration.split(":")[0])*60);
        }
      });
      setTotalMinutes({
        totalMinutes: secondData.totalSeconds / 60,
        totalMinutesYear: secondData.totalSecondsYear / 60,
        totalMinutesMonth: secondData.totalSecondsMonth / 60,
        totalMinutesWeek: secondData.totalSecondsWeek / 60,
      });
      popularData.sort((a, b) => {
        if (a.count === b.count) return b.weight - a.weight;
        return b.count - a.count;
      });
      setPopularExercises(popularData);
      mutate(popularData);
    }

    // Prepare chart data
    const prepareWorkoutCountChart = () => {
      let labels: string[];
      let data: number[] = [];
      switch (timePeriod) {
        case 'week':
          labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          data = Array(7).fill(0);
          workoutData.workoutsWeek.forEach(workout => {
            if (!workout || !workout.createdAt) return;
            const index = (new Date(workout.createdAt)).getDay();
            data[index] += 1;
          });
          labels.splice((new Date()).getDay() + 1);
          data.splice((new Date()).getDay() + 1);
          break;
        case 'month':
          const month = (new Date()).getMonth() + 1;
          data = Array(29).fill(0);
          labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28"];
          if (month === 4 || month === 6 || month === 9 || month === 11 || month === 2) {
            if (month === 2 && (new Date()).getFullYear() % 4 === 0) {
              labels.push("29")
              data.push(0);
            } else if (month !== 2) {
              labels.push("29");
              labels.push("30");
              data.push(0, 0);
            }
          } else {
            labels.push("29, 30", "31");
            data.push(0, 0, 0);
          }
          workoutData.workoutsMonth.forEach(workout => {
            if (!workout || !workout.createdAt) return;
            const index = (new Date(workout.createdAt)).getDate();
            data[index] += 1;
          });
          labels.splice((new Date()).getDate() + 1);
          data.splice((new Date()).getDate() + 1);
          labels.forEach(label => {
            labels[labels.indexOf(label)] = month + "/" + label;
          })
          break;
        case 'year':
          labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
          data = Array(12).fill(0);
          workoutData.workoutsYear.forEach(workout => {
            if (!workout || !workout.createdAt) return;
            const index = (new Date(workout.createdAt)).getMonth();
            data[index] += 1;
          });
          labels.splice((new Date()).getMonth() + 1);
          data.splice((new Date()).getMonth() + 1);
          break;
        default:
          labels = [] as string[]
          data = [] as number[]
          workoutData.workouts.forEach(workout => {
            if (!workout || !workout.createdAt) return;
            const year = (new Date(workout.createdAt)).getFullYear().toString();
            if (!labels.includes(year)) {
              let low = 0;
              let high = labels.length;
              while (low < high) {
                let mid = Math.floor((low + high)/2);
                if (parseInt(labels[mid]) < parseInt(year)) {
                  low = mid + 1;
                } else {
                  high = mid;
                }
              }
              labels.splice(low, 0, year);
              data.splice(low, 0, 0);
            }
            const index = (labels.indexOf(year));
            data[index] += 1;
          }) //TODO proper sorting here
          break;
      }

      //Making sure graph never gets too crowded
      if (labels.length > 10) {
        if (labels.length < 20) {
          labels.forEach(label => {
            if (labels.indexOf(label) % 2 === 1) {
              labels[labels.indexOf(label)] = "";
            }
          })
        } else {
          labels.forEach(label => {
            if (labels.indexOf(label) % 4 !== 0) {
              labels[labels.indexOf(label)] = "";
            }
          })
        }
      }
      if (data.length === 0) {
        data = Array(1).fill(0);
      }
      return {
        labels: labels,
        datasets: [{
          data: data,
        }],
      };
    };

    const prepareWorkoutMinuteChart = () => {
      let labels: string[];
      let data: number[] = [];
      switch (timePeriod) {
        case 'week':
          labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          data = Array(7).fill(0);
          workoutData.workoutsWeek.forEach(workout => {
            if (!workout || !workout.createdAt) return;
            const index = (new Date(workout.createdAt)).getDay();
            data[index] += workout.workoutData?.duration ? parseInt(workout.workoutData.duration.split(":")[0]) : 0;
          });
          labels.splice((new Date()).getDay() + 1);
          data.splice((new Date()).getDay() + 1);
          break;
        case 'month':
          const month = (new Date()).getMonth() + 1;
          data = Array(29).fill(0);
          labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28"];
          if (month === 4 || month === 6 || month === 9 || month === 11 || month === 2) {
            if (month === 2 && (new Date()).getFullYear() % 4 === 0) {
              labels.push("29")
              data.push(0);
            } else if (month !== 2) {
              labels.push("29");
              labels.push("30");
              data.push(0, 0);
            }
          } else {
            labels.push("29, 30", "31");
            data.push(0, 0, 0);
          }
          workoutData.workoutsMonth.forEach(workout => {
            if (!workout || !workout.createdAt) return;
            const index = (new Date(workout.createdAt)).getDate();
            data[index] += workout.workoutData?.duration ? parseInt(workout.workoutData.duration.split(":")[0]) : 0;
          });
          labels.splice((new Date()).getDate() + 1);
          data.splice((new Date()).getDate() + 1);
          labels.forEach(label => {
            labels[labels.indexOf(label)] = month + "/" + label;
          })
          break;
        case 'year':
          labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
          data = Array(12).fill(0);
          workoutData.workoutsYear.forEach(workout => {
            if (!workout || !workout.createdAt) return;
            const index = (new Date(workout.createdAt)).getMonth();
            data[index] += workout.workoutData?.duration ? parseInt(workout.workoutData.duration.split(":")[0]) : 0;
          });
          labels.splice((new Date()).getMonth() + 1);
          data.splice((new Date()).getMonth() + 1);
          break;
        default:
          labels = [] as string[]
          data = [] as number[]
          workoutData.workouts.forEach(workout => {
            if (!workout || !workout.createdAt) return;
            const year = (new Date(workout.createdAt)).getFullYear().toString();
            if (!labels.includes(year)) {
              let low = 0;
              let high = labels.length;
              while (low < high) {
                let mid = Math.floor((low + high)/2);
                if (parseInt(labels[mid]) < parseInt(year)) {
                  low = mid + 1;
                } else {
                  high = mid;
                }
              }
              labels.splice(low, 0, year);
              data.splice(low, 0, 0);
            }
            const index = (labels.indexOf(year));
            data[index] += workout.workoutData?.duration ? parseInt(workout.workoutData.duration.split(":")[0]) : 0;
          }) //TODO proper sorting here
          break;
      }

      //Making sure graph never gets too crowded
      if (labels.length > 10) {
        if (labels.length < 20) {
          labels.forEach(label => {
            if (labels.indexOf(label) % 2 === 1) {
              labels[labels.indexOf(label)] = "";
            }
          })
        } else {
          labels.forEach(label => {
            if (labels.indexOf(label) % 4 !== 0) {
              labels[labels.indexOf(label)] = "";
            }
          })
        }
      }

      if (data.length === 0) {
        data = Array(1).fill(0);
      }
      return {
        labels: labels,
        datasets: [{
          data: data,
        }],
      };
    };

    const fetchWorkouts = () => {
        let fetchedWorkouts: Post[] = [];
        let indexCount: number = 0;
        while (indexCount < posts.length) {
          if (posts[indexCount].workoutData && posts[indexCount].workoutData?.exercises.length !== 0) {
            fetchedWorkouts.push(posts[indexCount]);
          }
          indexCount++;
        }
        setWorkouts(fetchedWorkouts);
        setVisibleWorkouts(fetchedWorkouts.slice(0, workoutViewCount));
    }

    const addMorePostsToView = (amount: number) => {
        if (posts.length <= postViewCount + amount) {
            setPostViewCount(posts.length);
            setVisiblePosts(posts);
            setHasMorePosts(false);
            return;
        }
        setPostViewCount(postViewCount + amount);
        setVisiblePosts(posts.slice(0, postViewCount));
        setHasMorePosts(true);
    }

    const addMoreWorkoutsToView = (amount: number) => {
        if (workouts.length <= workoutViewCount + amount) {
            setWorkoutViewCount(workouts.length);
            setVisibleWorkouts(workouts);
            setHasMoreWorkouts(false);
            return;
        }
        setWorkoutViewCount(workoutViewCount + amount);
        setVisibleWorkouts(workouts.slice(0, workoutViewCount));
        setHasMoreWorkouts(true);
    }

    //This useEffect is for resetting the histories if the user leaves and then comes back
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
          {
            setPostViewCount(4);
            setWorkoutViewCount(4);
            setFavoritesViewCount(4);
            setVisiblePosts(posts.length > 4 ? posts.slice(0, 4) : posts.slice());
            setHasMorePosts(posts.length > 0 ? true : false);
            setVisibleWorkouts([]);
            setSelectedWorkout(null);
            fetchWorkouts();
            calculateStats();
          }
        });
    
        return unsubscribe;
      }, [navigation]);     

    useEffect(() => {
        setVisiblePosts(posts.slice(0, postViewCount));
        setHasMorePosts(true);
        let oldWorkoutLength = workoutViewCount;
        fetchWorkouts();
        calculateStats();
        if (oldWorkoutLength !== workouts.length) setHasMoreWorkouts(true);
    }, [posts])

    useEffect(() => {
        fetchWorkouts();
        calculateStats();
        if (posts.length === visiblePosts.length) setHasMorePosts(false);
    }, [])

    useEffect(() => {
      calculateStats();
    }, [workouts])

    return (
        <View className="mb-10">
            <VStack space="2xl">
              <VStack space="sm">
                <HStack className="justify-between">
                  <Heading size="2xl">Profile Summary</Heading>
                  <HStack space="md">
                    <Pressable onPress={showSummaryNow}>
                      <Icon as={CheckIcon} size="xl" />
                    </Pressable>
                    <Pressable onPress={() => setShowNotificationModal(true)}>
                      <Icon as={BellIcon} size="xl" />
                    </Pressable>
                  </HStack>
                </HStack>
                
                {/* Notification Preferences Modal */}
                <Modal
                  isOpen={showNotificationModal}
                  onClose={() => setShowNotificationModal(false)}
                  size="md"
                  closeOnOverlayClick
                >
                  <ModalBackdrop />
                  <ModalContent>
                    <ModalHeader>
                      <Heading size="lg">Workout Summary Notifications</Heading>
                      <ModalCloseButton>
                        <Icon
                          as={CloseIcon}
                          className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
                        />
                      </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                      <VStack space="md" className="py-2">
                        <HStack space="md" className="items-center justify-between">
                          <Text size="lg">Enable Notifications</Text>
                          <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            size="md"
                          />
                        </HStack>
                        
                        {notificationsEnabled && (
                          <VStack space="md" className="mt-2">
                            <Text size="lg">Notification Frequency</Text>
                            <RadioGroup value={notificationFrequency} onChange={setNotificationFrequency as (value: string) => void}>
                              <VStack space="sm">
                                <Radio value="daily" isInvalid={false} isDisabled={false}>
                                  <RadioIndicator>
                                    <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                                  </RadioIndicator>
                                  <RadioLabel>Daily</RadioLabel>
                                </Radio>
                                <Radio value="weekly" isInvalid={false} isDisabled={false}>
                                  <RadioIndicator>
                                    <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                                  </RadioIndicator>
                                  <RadioLabel>Weekly</RadioLabel>
                                </Radio>
                                <Radio value="monthly" isInvalid={false} isDisabled={false}>
                                  <RadioIndicator>
                                    <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                                  </RadioIndicator>
                                  <RadioLabel>Monthly</RadioLabel>
                                </Radio>
                              </VStack>
                            </RadioGroup>
                            
                            <Text size="md" className="mt-2">
                              You'll receive a notification with your {notificationFrequency} workout summary,
                              including total workouts, time spent, and most popular exercises.
                            </Text>
                          </VStack>
                        )}
                        
                        <Button
                          className="mt-4"
                          onPress={saveNotificationPreferences}
                        >
                          <ButtonText>Save Preferences</ButtonText>
                        </Button>
                      </VStack>
                    </ModalBody>
                  </ModalContent>
                </Modal>
                
                {/* Workout Summary Modal */}
                <Modal
                  isOpen={showSummaryModal}
                  onClose={() => setShowSummaryModal(false)}
                  size="md"
                  closeOnOverlayClick
                >
                  <ModalBackdrop />
                  <ModalContent>
                    <ModalHeader>
                      <Heading size="lg">
                        {summaryData.frequency.charAt(0).toUpperCase() + summaryData.frequency.slice(1)} Workout Summary
                      </Heading>
                      <ModalCloseButton>
                        <Icon
                          as={CloseIcon}
                          className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
                        />
                      </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                      <VStack space="lg" className="py-2">
                        <Card variant="outline" className="p-3">
                          <Heading size="md">Total Workouts</Heading>
                          <Heading size="2xl" className="text-center">
                            {summaryData.workoutCount}
                          </Heading>
                        </Card>
                        
                        <Card variant="outline" className="p-3">
                          <Heading size="md">Total Minutes</Heading>
                          <Heading size="2xl" className="text-center">
                            {summaryData.totalMinutes}
                          </Heading>
                        </Card>
                        
                        <Card variant="outline" className="p-3">
                          <Heading size="md">Most Popular Exercise</Heading>
                          <Heading size="lg" className="text-center">
                            {summaryData.mostPopularExercise}
                          </Heading>
                        </Card>
                      </VStack>
                    </ModalBody>
                    <ModalFooter>
                      <Button onPress={() => setShowSummaryModal(false)}>
                        <ButtonText>Close</ButtonText>
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
                
                <Card variant="outline">
                  <HStack className="justify-between mb-4">
                    <RadioGroup value={timePeriod} onChange={setTimePeriod as (value: string) => void}>
                      <HStack space="xl">
                        <Radio value="week" isInvalid={false} isDisabled={false}>
                          <RadioIndicator>
                            <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                          </RadioIndicator>
                          <RadioLabel>Week</RadioLabel>
                        </Radio>
                        <Radio value="month" isInvalid={false} isDisabled={false}>
                          <RadioIndicator>
                            <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                          </RadioIndicator>
                          <RadioLabel>Month</RadioLabel>
                        </Radio>
                        <Radio value="year" isInvalid={false} isDisabled={false}>
                          <RadioIndicator>
                            <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                          </RadioIndicator>
                          <RadioLabel>Year</RadioLabel>
                        </Radio>
                        <Radio value="all" isInvalid={false} isDisabled={false}>
                          <RadioIndicator>
                            <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                          </RadioIndicator>
                          <RadioLabel>All</RadioLabel>
                        </Radio>
                      </HStack>
                    </RadioGroup>
                  </HStack>
                  <Heading size="xl">Workout Count: {timePeriod === "month" ? (
                      (new Date()).toLocaleDateString('en-us', {month: "long"})
                    )  : timePeriod === "year" ? (
                      (new Date()).toLocaleDateString('en-us', {year: "numeric"})
                    ) : ( 
                      timePeriod[0].toUpperCase() + timePeriod.slice(1)
                    )}
                  </Heading>
                  {prepareWorkoutCountChart().labels.length > 1 ? (
                    <LineChart
                    data={prepareWorkoutCountChart()}
                    width={Dimensions.get('window').width - 85}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    fromZero
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(111, 168, 220, ${opacity})`,
                      barPercentage: 0.95,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      propsForLabels: {
                        fontSize: 12,
                      },
                    }}
                    style={{
                      marginVertical: 8,
                    }}
                  />
                  ) : (
                    <BarChart
                    data={prepareWorkoutCountChart()}
                    width={Dimensions.get('window').width - 85}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    fromZero
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(111, 168, 220, ${opacity})`,
                      barPercentage: 0.95,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      propsForLabels: {
                        fontSize: 12,
                      },
                    }}
                    style={{
                      marginVertical: 8,
                    }}
                  />
                  )}
                  <Heading size="xl">Workout Minutes: {timePeriod === "month" ? (
                      (new Date()).toLocaleDateString('en-us', {month: "long"})
                    )  : timePeriod === "year" ? (
                      (new Date()).toLocaleDateString('en-us', {year: "numeric"})
                    ) : ( 
                      timePeriod[0].toUpperCase() + timePeriod.slice(1)
                    )}
                  </Heading>
                  {prepareWorkoutMinuteChart().labels.length > 1 ? (
                    <LineChart
                    data={prepareWorkoutMinuteChart()}
                    width={Dimensions.get('window').width - 85}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    fromZero
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(111, 168, 220, ${opacity})`,
                      barPercentage: 0.95,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      propsForLabels: {
                        fontSize: 12,
                      },
                    }}
                    style={{
                      marginVertical: 8,
                    }}
                  />
                  ) : (
                    <BarChart
                    data={prepareWorkoutMinuteChart()}
                    width={Dimensions.get('window').width - 85}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    fromZero
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(111, 168, 220, ${opacity})`,
                      barPercentage: 0.95,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      propsForLabels: {
                        fontSize: 12,
                      },
                    }}
                    style={{
                      marginVertical: 8,
                    }}
                  />
                  )}
                  <Card variant="outline">
                    <Heading className="mb-5" size="xl">Most Popular Exercises ⭐</Heading>
                    {popularExercises.length === 0 && (
                      <Heading size="lg">No workouts recorded yet. Do a workout to get some data!</Heading>
                    )}

                    {popularExercises && popularExercises.slice(0, favoritesViewCount).map((favorite) => (
                      <Card className="mb-3" variant="filled" key={favorite.name}>
                        <HStack space="md" className="justify-between">
                          <Heading size="lg">{favorite.name}</Heading>
                          <Pressable onPress={() => setDetailsModal(favorite.name)}>
                            <Icon as={InfoIcon} size="xl" />
                          </Pressable>
                        </HStack>
                        <Heading size="md">Personal Best: {favorite.weight} {favorite.unit}</Heading>
                        <Text size="md">You have done {favorite.count} sets of this exercise!</Text>
                        <Box className="flex flex-row flex-wrap gap-2">
                          {favorite.tags && favorite.tags.map((tag) => (
                            <TagString key={tag} tag={tag} />
                          ))}
                        </Box>
                        <Modal
                          isOpen={detailsModal === favorite.name}
                          onClose={() => setDetailsModal("")}
                          size="md"
                          closeOnOverlayClick
                        >
                        <ModalBackdrop />
                        <ModalContent>
                          <ModalHeader>
                            <Heading size="lg">Details</Heading>
                            <ModalCloseButton>
                              <Icon
                                as={CloseIcon}
                                className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
                              />
                            </ModalCloseButton>
                          </ModalHeader>
                          <ModalBody>
                            <Text size="md" className="text-typography-700">
                              {favorite.details}
                            </Text>
                          </ModalBody>
                        </ModalContent>
                      </Modal>
                      </Card>
                    ))}

                    {popularExercises && popularExercises.length > favoritesViewCount && (
                      <Button
                        onPress={() => { setFavoritesViewCount(favoritesViewCount + 4); }}
                      >
                        <ButtonText>Render more Exercises</ButtonText>
                      </Button>
                    )}
                  </Card>
                </Card>
              </VStack>
              <VStack>
                <Heading size="2xl">Workout History</Heading>
                <Card className="my-3" variant="outline">
                    {isLoading && (
                        <Text>Loading Workouts...</Text>
                    )}

                    {visibleWorkouts && posts.length === 0 && !isLoading && (
                        <Text>No Workouts found. Finish a workout to see some here!</Text>
                    )}

                    {visibleWorkouts && visibleWorkouts.map((post) => (
                        post.workoutData && (
                            <TouchableOpacity
                              key={post.id}
                              onPress={() => {
                                if (selectedWorkout !== post.id) {
                                  setSelectedWorkout(post.id);
                                } else {
                                  setSelectedWorkout(null);
                                }
                              }}
                            >
                              {selectedWorkout === post.id ? (
                                <SummaryWorkoutData workoutData={post.workoutData} date={formatTime(post.createdAt)}></SummaryWorkoutData>
                              ) : (
                                <WorkoutHeader dateTime={formatDate(post.createdAt)} duration={formatDuration(post.workoutData.duration!)}></WorkoutHeader>
                              )}
                            </TouchableOpacity>
                        )
                    ))}
                </Card>
                {posts && posts.length > 0 && hasMoreWorkouts && (
                  <Button
                    onPress={() => { addMoreWorkoutsToView(10);}}
                  >
                    <ButtonText>{'Render more workouts'}</ButtonText>
                  </Button>
                )}
              </VStack>
                <Heading size="2xl">Post History</Heading>
                <Card variant="outline">
                    {isLoading && (
                      <Text>Loading posts...</Text>
                    )}

                    {visiblePosts && posts.length === 0 && !isLoading && (
                      <Text>No posts found. Post a workout to see some here!</Text>
                    )}

                    {visiblePosts && visiblePosts.map((post) => (
                        <WorkoutPost
                            id={post.profile?.userId || ""}
                            key={post.id}
                            postId={post.id}
                            username={post.profile?.username || "Unknown user"}
                            name={post.profile?.name || "Unkown user"}
                            avatar={post.profile?.avatar || ""}
                            date={formatDate(post.createdAt)}
                            title={post.title || ""}
                            description={post.description || ""}
                            exercises={
                                post.workoutData?.exercises ?
                                    post.workoutData.exercises.map(exercise => {
                                            return {
                                                name: exercise.name,
                                                sets: exercise.sets,
                                                reps: exercise.reps,
                                                weight: exercise.weight ? String(exercise.weight) : undefined
                                            };
                                    })
                                    : []
                            }
                            workoutDuration={post.workoutData?.duration || undefined}
                            workoutCalories={post.workoutData?.calories || undefined}
                            userId={session?.user.id!}
                            comments={post.comments}
                            imageUrls={post.images || undefined}
                            weighIn={post.weighIn}
                            isOwnPost={true}
                            taggedFriends={post.taggedFriendsData}
                            onUpdatePost={updatePostFunc}
                        />
                    ))}
                </Card>
                {posts && posts.length > 0 && hasMorePosts && (
                    <Button
                        onPress={() => {addMorePostsToView(10)}}
                    >
                        <ButtonText>{'Render more posts'}</ButtonText>
                    </Button>
                )}
            </VStack>
        </View>
    );
}