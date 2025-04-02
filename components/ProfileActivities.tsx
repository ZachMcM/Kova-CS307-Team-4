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
import { Icon, TrashIcon, EditIcon, AddIcon, ChevronLeftIcon, DownloadIcon } from "@/components/ui/icon";

type ProfileActivitiesProps = {
    posts: Post[];
    isLoading: boolean;
    updatePostFunc: (postId: string, title: string, description: string) => Promise<any[]>;
}

type FavoriteExercise = {
    name: string;
    count: number;
}

type PersonalBest = {
    exerciseName: string;
    weight: number;
    unit: string;
}

export const ProfileActivities = ({
    posts,
    isLoading,
    updatePostFunc,
}: ProfileActivitiesProps) => {

    const { session } = useSession();
    const navigation = useNavigation();

    const [postViewCount, setPostViewCount] = useState(4); //Initially only view 4 posts
    const [visiblePosts, setVisiblePosts] = useState(posts.length > 4 ? posts.slice(0, 4) : posts.slice());
    const [hasMorePosts, setHasMorePosts] = useState(posts.length > 0 ? true : false);

    const [workouts, setWorkouts] = useState<Post[]>([]);
    const [workoutViewCount, setWorkoutViewCount] = useState(4);
    const [visibleWorkouts, setVisibleWorkouts] = useState<Post[]>([]);
    const [hasMoreWorkouts, setHasMoreWorkouts] = useState(posts.length > 0 ? true : false);
    const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);

    const [timePeriod, setTimePeriod] = useState("week")
    const [workoutGraphData, setWorkoutGraphData] = useState<Post[]>([]); //Only take PB's from this, not pulling from all exercises in DB
    const [userPostCount, setUserPostCount] = useState({
      totalPosts: posts.length,
      totalPostsYear: 0,
      totalPostsMonth: 0,
      totalPostsWeek: 0,
    });
    const [favoriteExercises, setFavoriteExercises] = useState({
      favorites: [] as FavoriteExercise[],
      favoritesYear: [] as FavoriteExercise[],
      favoritesMonth: [] as FavoriteExercise[],
      favoritesWeek: [] as FavoriteExercise[],

    });
    const [personalBests, setPersonalBests] = useState({
      personalBests: [] as PersonalBest[],
      personalBestsYear: [] as PersonalBest[],
      personalBestsMonth: [] as PersonalBest[],
      personalBestsWeek: [] as PersonalBest[],
    })
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

    const filterEntriesByTimePeriod = (entries: Post[]) => {
      const now = new Date();
      const filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        const diffTime = Math.abs(now.getTime() - entryDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (timePeriod) {
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          case 'year':
            return diffDays <= 365;
          default:
            return true;
        }
      });
      
      return filteredEntries;
    };

    const calculateStats = () => {
      const now = new Date();
      const DOWArray = [0, 1, 2, 3, 4, 5, 6].slice(0, now.getDay() + 1);
      const postsYear = posts.map((post) => {
        if ((new Date(post.createdAt)).getFullYear()=== now.getFullYear()) return post;
      });
      const workoutsYear = postsYear.map((post) => {
        if (post?.workoutData && post.workoutData.exercises.length !== 0) return post;
      });
      const postsMonth = posts.map((post) => {
        if ((new Date(post.createdAt)).getMonth()=== now.getMonth()) return post;
      });
      const workoutsMonth = postsMonth.map((post) => {
        if (post?.workoutData && post.workoutData.exercises.length !== 0) return post;
      });
      const postsWeek = posts.map((post) => {
        if (DOWArray.includes((new Date(post.createdAt)).getDay())) return post;
      });
      const workoutsWeek = postsWeek.map((post) => {
        if (post?.workoutData && post.workoutData.exercises.length !== 0) return post;
      });
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
      let favoriteData = {
        favorites: [] as FavoriteExercise[],
        favoritesYear: [] as FavoriteExercise[],
        favoritesMonth: [] as FavoriteExercise[],
        favoritesWeek: [] as FavoriteExercise[],
      };
      let personalBestData = {
        personalBests: [] as PersonalBest[],
        personalBestsYear: [] as PersonalBest[],
        personalBestsMonth: [] as PersonalBest[],
        personalBestsWeek: [] as PersonalBest[],
      }
      const addFavorites = (data: WorkoutData, favoriteArray: FavoriteExercise[], personalBestArray: PersonalBest[]) => {
        data.exercises.map((exercise) => {
          let favoriteIndex = favoriteArray.findIndex(favorite => favorite.name === exercise.name);
          let personalBestIndex = personalBestArray.findIndex(pb => pb.exerciseName === exercise.name);
          let weight = exercise.weight ? (
            exercise.weight.split(" ")[1] === "kg" ? (
              parseInt(exercise.weight.split(" ")[0]) * 2.2046226218 //kg to lbs
            ) : (
              parseInt(exercise.weight.split(" ")[0])
            )
          ) : 0
          if (favoriteIndex > -1) {
            favoriteArray[favoriteIndex].count += ((exercise.reps ? exercise.reps : 0) + 0.5*(exercise.sets ? exercise.sets : 0)); //Set multiplier included here
          } else {
            favoriteArray.push({
              name: exercise.name,
              count: exercise.sets
            } as FavoriteExercise)
          }
          if (personalBestIndex > -1) {
            if (exercise.weight && personalBestArray[personalBestIndex].weight < weight) {
              personalBestArray[personalBestIndex].weight = weight;
            }
          } else {
            personalBestArray.push({
              exerciseName: exercise.name,
              weight: weight,
              unit: exercise.weight ? exercise.weight?.split(" ")[1] : "lbs",
            })
          }
        })
      }
      workouts.map((workout) => {
        if (!workout.workoutData || !workout.workoutData.duration) return;
        secondData.totalSeconds += (parseInt(workout.workoutData.duration.split(":")[1]) + parseInt(workout.workoutData.duration.split(":")[0])*60);
        addFavorites(workout.workoutData as WorkoutData, favoriteData.favorites, personalBestData.personalBests);

        if (workoutsYear.includes(workout)) {
          secondData.totalSecondsMonth += (parseInt(workout.workoutData.duration.split(":")[1]) + parseInt(workout.workoutData.duration.split(":")[0])*60);
          addFavorites(workout.workoutData as WorkoutData, favoriteData.favoritesYear, personalBestData.personalBestsYear);
        }
        if (workoutsMonth.includes(workout)) {
          secondData.totalSecondsMonth += (parseInt(workout.workoutData.duration.split(":")[1]) + parseInt(workout.workoutData.duration.split(":")[0])*60);
          addFavorites(workout.workoutData as WorkoutData, favoriteData.favoritesMonth, personalBestData.personalBestsMonth);
        }
        if (workoutsWeek.includes(workout)) {
          secondData.totalSecondsWeek += (parseInt(workout.workoutData.duration.split(":")[1]) + parseInt(workout.workoutData.duration.split(":")[0])*60);
          addFavorites(workout.workoutData as WorkoutData, favoriteData.favoritesWeek, personalBestData.personalBestsWeek);
        }
      });
      setTotalMinutes({
        totalMinutes: secondData.totalSeconds / 60,
        totalMinutesYear: secondData.totalSecondsYear / 60,
        totalMinutesMonth: secondData.totalSecondsMonth / 60,
        totalMinutesWeek: secondData.totalSecondsWeek / 60,
      });
      setFavoriteExercises(favoriteData);
      setPersonalBests(personalBestData);
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
            console.log("year ", year)
            if (!labels.includes(year)) {
              labels.push(year);
              data.push(0);
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

      console.log("labels: ", labels, "data: ", data);
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
            console.log("year ", year)
            if (!labels.includes(year)) {
              labels.push(year);
              data.push(0);
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

      console.log("labels: ", labels, "data: ", data);
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

    return (
        <View>
            <VStack space="2xl">
              <VStack>
                <Heading size="2xl">Profile Summary</Heading>
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
                  <Heading size="xl">Workout Minutes: {timePeriod === "month" ? (
                      (new Date()).toLocaleDateString('en-us', {month: "long"})
                    )  : timePeriod === "year" ? (
                      (new Date()).toLocaleDateString('en-us', {year: "numeric"})
                    ) : ( 
                      timePeriod[0].toUpperCase() + timePeriod.slice(1)
                    )}
                  </Heading>
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
                </Card>
              </VStack>
              <VStack>
                <Heading size="2xl">Workout History</Heading>
                <Card variant="outline">
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