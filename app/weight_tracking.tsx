import StaticContainer from "@/components/StaticContainer";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import {
  AddIcon,
  ArrowRightIcon,
  BellIcon,
  ChevronLeftIcon,
  DownloadIcon,
  EditIcon,
  Icon,
  TrashIcon,
  CheckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SlashIcon,
} from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from "@/components/ui/radio";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import {
  addWeightEntry,
  deleteWeightEntry,
  getWeightEntries,
  updateWeightEntry,
} from "@/services/weightServices";
import {
  addWeightGoal,
  checkGoalAchievement,
  deleteWeightGoal,
  getCurrentWeightGoal, 
  getWeightGoals,
  updateWeightGoal,
} from "@/services/weightGoalServices";
import {
  cancelNotification,
  getNotificationSettings,
  requestNotificationPermissions,
  scheduleDailyNotification,
} from "@/services/notificationServices";
import { WeightEntry, WeightGoal, GoalType } from "@/types/weight-types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, ScrollView, TextInput } from "react-native";
import { LineChart } from "react-native-chart-kit";

export default function WeightTrackingScreen() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  // User state
  const [userId, setUserId] = useState<string | null>(null);

  // Weight entry form state
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"kg" | "lbs">("lbs");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Edit state
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);

  // Time period filter state
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "year">(
    "month"
  );

  // Statistics state
  const [stats, setStats] = useState({
    totalChange: 0,
    averageWeight: 0,
    highestWeight: 0,
    lowestWeight: 0,
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: false,
    time: '',
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  
  // Weight goal state
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalFormData, setGoalFormData] = useState({
    targetWeight: "",
    goalType: "loss" as GoalType,
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  });
  const [showGoalDatePicker, setShowGoalDatePicker] = useState(false);
  const [editingGoal, setEditingGoal] = useState<WeightGoal | null>(null);

  // Fetch user ID
  useEffect(() => {
    const fetchUserId = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };

    fetchUserId();
  }, []);

  // Fetch weight entries
  const {
    data: weightEntries,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["weightEntries", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await getWeightEntries(userId);
    },
    enabled: !!userId,
  });

  // Fetch current weight goal
  const {
    data: currentGoal,
    isPending: isGoalPending,
    refetch: refetchGoal,
  } = useQuery({
    queryKey: ["currentWeightGoal", userId],
    queryFn: async () => {
      if (!userId) return null;
      return await getCurrentWeightGoal(userId);
    },
    enabled: !!userId,
  });

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Reset form
  const resetForm = () => {
    setWeight("");
    setUnit("lbs");
    setDate(new Date());
    setEditingEntry(null);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (!userId) {
        showErrorToast(toast, "You must be logged in to track weight");
        return;
      }

      if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
        showErrorToast(toast, "Please enter a valid weight");
        return;
      }

      const weightValue = Number(weight);

      if (editingEntry) {
        // Update existing entry
        updateWeightEntry(editingEntry.id, {
          weight: weightValue,
          unit,
          date: date.toISOString(),
        });
        showSuccessToast(toast, "Weight entry updated");
      } else {
        // Add new entry
        addWeightEntry({
          user_id: userId,
          weight: weightValue,
          unit,
          date: date.toISOString(),
        });
        showSuccessToast(toast, "Weight entry added");
      }

      // Reset form and refetch data
      resetForm();
      refetch();
    } catch (error) {
      console.error(error);
      showErrorToast(toast, "Failed to save weight entry");
    }
  };

  // Handle edit
  const handleEdit = (entry: WeightEntry) => {
    setEditingEntry(entry);
    setWeight(entry.weight.toString());
    setUnit(entry.unit as "kg" | "lbs");
    setDate(new Date(entry.date));
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      deleteWeightEntry(id);
      showSuccessToast(toast, "Weight entry deleted");
      refetch();
    } catch (error) {
      console.error(error);
      showErrorToast(toast, "Failed to delete weight entry");
    }
  };

  // Confirm delete
  const confirmDelete = (id: string) => {
    Alert.alert(
      "Delete Weight Entry",
      "Are you sure you want to delete this weight entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => handleDelete(id),
          style: "destructive",
        },
      ]
    );
  };

  // Calculate statistics
  const calculateStats = (entries: WeightEntry[]) => {
    if (entries.length === 0) return;

    const weights = entries.map((entry) => entry.weight);
    const totalChange = entries[0].weight - entries[entries.length - 1].weight;
    const averageWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
    const highestWeight = Math.max(...weights);
    const lowestWeight = Math.min(...weights);

    setStats({
      totalChange,
      averageWeight,
      highestWeight,
      lowestWeight,
    });
    
    // Check if goal has been achieved with latest weight
    if (currentGoal && currentGoal.status === "in_progress") {
      checkGoalAchievement(currentGoal.id, entries[0].weight)
        .then(achieved => {
          if (achieved) {
            refetchGoal();
            // Navigate to post creation with auto-filled content
            const goalType = currentGoal.goal_type === 'loss' ? 'lost' : 
                             currentGoal.goal_type === 'gain' ? 'gained' : 'maintained';
            const goalAmount = Math.abs(currentGoal.start_weight - currentGoal.target_weight).toFixed(1);
            const message = `I just reached my weight goal! I ${goalType} ${goalAmount} ${currentGoal.unit}!`;
            
            router.push({
              pathname: "/post",
              params: { 
                auto_content: message,
                category: "weightgoal"
              }
            });
          }
        })
        .catch(error => console.error("Error checking goal achievement:", error));
    }
  };

  // Filter entries by time period
  const filterEntriesByTimePeriod = (entries: WeightEntry[]) => {
    const now = new Date();
    const filteredEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const diffTime = Math.abs(now.getTime() - entryDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (timePeriod) {
        case "week":
          return diffDays <= 7;
        case "month":
          return diffDays <= 30;
        case "year":
          return diffDays <= 365;
        default:
          return true;
      }
    });

    return filteredEntries;
  };

  // Prepare chart data
  const prepareChartData = (entries: WeightEntry[]) => {
    const filteredEntries = filterEntriesByTimePeriod(entries);
    const sortedEntries = [...filteredEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const datasets = [
      {
        data: sortedEntries.map((entry) => entry.weight),
        color: (opacity = 1) => `rgba(111, 168, 220, ${opacity})`,
        strokeWidth: 2,
      }
    ];
    
    // Add target weight line if goal exists
    if (currentGoal && currentGoal.status === "in_progress") {
      const { target_weight } = currentGoal;
      // Create a flat line at the target weight
      datasets.push({
        data: Array(sortedEntries.length).fill(target_weight),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green line for target
        strokeWidth: 1,
        // Note: strokeDasharray is not supported directly, will use withDots: false instead
      });
    }

    return {
      labels: sortedEntries.map((entry) =>
        new Date(entry.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      ),
      datasets: datasets,
    };
  };

  // Export data to CSV
  const exportToCSV = async () => {
    try {
      if (!weightEntries) return;

      const csvContent = [
        ["Date", "Weight", "Unit"],
        ...weightEntries.map((entry) => [
          new Date(entry.date).toLocaleDateString(),
          entry.weight,
          entry.unit,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const fileUri = `${FileSystem.documentDirectory}weight_history.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error(error);
      showErrorToast(toast, "Failed to export data");
    }
  };

  // Update statistics when entries change
  useEffect(() => {
    if (weightEntries) {
      calculateStats(weightEntries);
    }
  }, [weightEntries]);

  // Load notification settings
  useEffect(() => {
    const loadNotificationSettings = async () => {
      const settings = await getNotificationSettings();
      setNotificationSettings(settings);
      if (settings.time) {
        const [hours, minutes] = settings.time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes);
        setNotificationTime(date);
      }
    };
    loadNotificationSettings();
  }, []);

  // Handle notification time change
  const onTimeChange = async (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setNotificationTime(selectedTime);
      const timeString = `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`;
      
      try {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
          showErrorToast(toast, "Please enable notifications in your device settings");
          return;
        }

        const notificationId = await scheduleDailyNotification(timeString);
        setNotificationSettings({ enabled: true, time: timeString });
        showSuccessToast(toast, "Daily reminder set successfully");
      } catch (error) {
        console.error(error);
        showErrorToast(toast, "Failed to set reminder");
      }
    }
  };

  // Handle notification toggle
  const toggleNotification = async () => {
    if (notificationSettings.enabled) {
      try {
        await cancelNotification(notificationSettings.time);
        setNotificationSettings({ enabled: false, time: '' });
        showSuccessToast(toast, "Reminder cancelled");
      } catch (error) {
        console.error(error);
        showErrorToast(toast, "Failed to cancel reminder");
      }
    } else {
      setShowTimePicker(true);
    }
  };

  // Calculate goal progress
  const calculateGoalProgress = () => {
    if (!currentGoal || !weightEntries || weightEntries.length === 0) return null;
    
    const latestWeight = weightEntries[0].weight;
    const { start_weight, target_weight, start_date, target_date, goal_type } = currentGoal;
    
    // Calculate weight progress
    const totalWeightChange = target_weight - start_weight;
    const currentWeightChange = latestWeight - start_weight;
    const weightProgressPercent = Math.min(
      100,
      Math.max(0, (currentWeightChange / totalWeightChange) * 100)
    );
    
    // Calculate time progress
    const startTime = new Date(start_date).getTime();
    const targetTime = new Date(target_date).getTime();
    const currentTime = new Date().getTime();
    const totalDuration = targetTime - startTime;
    const elapsedDuration = currentTime - startTime;
    const timeProgressPercent = Math.min(
      100, 
      Math.max(0, (elapsedDuration / totalDuration) * 100)
    );
    
    // Days remaining
    const daysRemaining = Math.max(
      0,
      Math.ceil((targetTime - currentTime) / (1000 * 60 * 60 * 24))
    );
    
    // Weight remaining
    const weightRemaining = latestWeight - target_weight;
    
    // Goal direction
    let goalDirection: "ahead" | "behind" | "on-track" = "on-track";
    if (goal_type === "loss") {
      goalDirection = weightProgressPercent > timeProgressPercent ? "ahead" : 
                      weightProgressPercent < timeProgressPercent ? "behind" : "on-track";
    } else if (goal_type === "gain") {
      goalDirection = weightProgressPercent > timeProgressPercent ? "ahead" : 
                      weightProgressPercent < timeProgressPercent ? "behind" : "on-track";
    }
    
    return {
      weightProgressPercent,
      timeProgressPercent,
      daysRemaining,
      weightRemaining,
      goalDirection,
    };
  };

  // Reset goal form
  const resetGoalForm = () => {
    setGoalFormData({
      targetWeight: "",
      goalType: "loss",
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
    setEditingGoal(null);
    setShowGoalForm(false);
  };

  // Handle goal date change
  const onGoalDateChange = (event: any, selectedDate?: Date) => {
    setShowGoalDatePicker(false);
    if (selectedDate) {
      setGoalFormData(prev => ({
        ...prev,
        targetDate: selectedDate
      }));
    }
  };

  // Handle goal edit
  const handleEditGoal = (goal: WeightGoal) => {
    setEditingGoal(goal);
    setGoalFormData({
      targetWeight: goal.target_weight.toString(),
      goalType: goal.goal_type,
      targetDate: new Date(goal.target_date),
    });
    setShowGoalForm(true);
  };

  // Handle goal delete
  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteWeightGoal(id);
      showSuccessToast(toast, "Weight goal deleted");
      refetchGoal();
    } catch (error) {
      console.error(error);
      showErrorToast(toast, "Failed to delete weight goal");
    }
  };

  // Confirm goal delete
  const confirmDeleteGoal = (id: string) => {
    Alert.alert(
      "Delete Weight Goal",
      "Are you sure you want to delete this weight goal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => handleDeleteGoal(id),
          style: "destructive",
        },
      ]
    );
  };

  // Handle goal submission
  const handleGoalSubmit = async () => {
    try {
      if (!userId) {
        showErrorToast(toast, "You must be logged in to set a weight goal");
        return;
      }

      if (!goalFormData.targetWeight || 
          isNaN(Number(goalFormData.targetWeight)) || 
          Number(goalFormData.targetWeight) <= 0) {
        showErrorToast(toast, "Please enter a valid target weight");
        return;
      }

      if (!weightEntries || weightEntries.length === 0) {
        showErrorToast(toast, "You need at least one weight entry before setting a goal");
        return;
      }

      const targetWeight = Number(goalFormData.targetWeight);
      const currentWeight = weightEntries[0].weight;
      const goalType = goalFormData.goalType;

      // Validate goal type matches target weight
      if (goalType === "loss" && targetWeight >= currentWeight) {
        showErrorToast(toast, "For weight loss, target weight should be less than current weight");
        return;
      } else if (goalType === "gain" && targetWeight <= currentWeight) {
        showErrorToast(toast, "For weight gain, target weight should be more than current weight");
        return;
      }

      if (editingGoal) {
        // Update existing goal
        await updateWeightGoal(editingGoal.id, {
          target_weight: targetWeight,
          target_date: goalFormData.targetDate.toISOString(),
          goal_type: goalFormData.goalType,
        });
        showSuccessToast(toast, "Weight goal updated");
      } else {
        // Add new goal
        await addWeightGoal({
          user_id: userId,
          start_weight: currentWeight,
          target_weight: targetWeight,
          unit: unit,
          start_date: new Date().toISOString(),
          target_date: goalFormData.targetDate.toISOString(),
          goal_type: goalFormData.goalType,
        });
        showSuccessToast(toast, "Weight goal added");
      }

      // Reset form and refetch data
      resetGoalForm();
      refetchGoal();
    } catch (error) {
      console.error(error);
      showErrorToast(toast, "Failed to save weight goal");
    }
  };

  return (
    <StaticContainer className="flex">
      <ScrollView className="flex px-6 py-16" keyboardShouldPersistTaps="handled">
        <VStack space="md">
          <HStack space="md" className="items-center">
            <Pressable onPress={() => router.back()}>
              <Icon as={ChevronLeftIcon} size="xl" />
            </Pressable>
            <Heading size="xl">Weight Tracking</Heading>
          </HStack>

          <Box className="border border-gray-300 rounded-lg p-4 mt-2">
            <VStack space="md">
              <Heading size="md">
                {editingEntry ? "Edit Weight Entry" : "Add Weight Entry"}
              </Heading>

              <HStack space="md" className="items-center">
                <Text size="md" className="w-20">
                  Weight:
                </Text>
                <Input className="flex-1">
                  <InputField
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    placeholder="Enter weight"
                  />
                </Input>
              </HStack>

              <HStack space="md" className="items-center">
                <Text size="md" className="w-20">
                  Unit:
                </Text>
                <RadioGroup
                  value={unit}
                  onChange={setUnit as (value: string) => void}
                >
                  <HStack space="xl">
                    <Radio value="lbs" isInvalid={false} isDisabled={false}>
                      <RadioIndicator>
                        <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                      </RadioIndicator>
                      <RadioLabel>lbs</RadioLabel>
                    </Radio>
                    <Radio value="kg" isInvalid={false} isDisabled={false}>
                      <RadioIndicator>
                        <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                      </RadioIndicator>
                      <RadioLabel>kg</RadioLabel>
                    </Radio>
                  </HStack>
                </RadioGroup>
              </HStack>

              <HStack space="md" className="items-center">
                <Text size="md" className="w-20">
                  Date:
                </Text>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  className="flex-1 h-10 border border-gray-300 rounded-md px-3 justify-center"
                >
                  <Text>{date.toLocaleDateString()}</Text>
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </HStack>

              <HStack space="md">
                {editingEntry ? (
                  <>
                    <Button
                      size="md"
                      variant="outline"
                      action="secondary"
                      className="flex-1"
                      onPress={resetForm}
                    >
                      <ButtonText>Cancel</ButtonText>
                    </Button>
                    <Button
                      size="md"
                      variant="solid"
                      action="primary"
                      className="flex-1 bg-[#6FA8DC]"
                      onPress={handleSubmit}
                    >
                      <ButtonText className="text-white">Update</ButtonText>
                    </Button>
                  </>
                ) : (
                  <Button
                    size="md"
                    variant="solid"
                    action="primary"
                    className="flex-1 bg-[#6FA8DC]"
                    onPress={handleSubmit}
                  >
                    <ButtonText className="text-white">Add Entry</ButtonText>
                    <ButtonIcon as={AddIcon} className="text-white" />
                  </Button>
                )}
              </HStack>
            </VStack>
          </Box>

          {/* Weight Goal Section */}
          <Box className="border border-gray-300 rounded-lg p-4 mt-2">
            <VStack space="md">
              <HStack className="justify-between items-center">
                <Heading size="md">Weight Goal</Heading>
                {!showGoalForm && (
                  <Button
                    size="sm"
                    variant="solid"
                    action="primary"
                    className="bg-[#6FA8DC]"
                    onPress={() => setShowGoalForm(true)}
                    disabled={!weightEntries || weightEntries.length === 0}
                  >
                    <ButtonText className="text-white">
                      {currentGoal && currentGoal.status === "in_progress"
                        ? "Change Goal"
                        : "Set Goal"}
                    </ButtonText>
                  </Button>
                )}
              </HStack>

              {showGoalForm ? (
                <VStack space="md">
                  <HStack space="md" className="items-center">
                    <Text size="md" className="w-24">
                      Target Weight:
                    </Text>
                    <Input className="flex-1">
                      <InputField
                        value={goalFormData.targetWeight}
                        onChangeText={(value) =>
                          setGoalFormData((prev) => ({
                            ...prev,
                            targetWeight: value,
                          }))
                        }
                        keyboardType="numeric"
                        placeholder="Enter target weight"
                      />
                    </Input>
                  </HStack>

                  <HStack space="md" className="items-center">
                    <Text size="md" className="w-24">
                      Goal Type:
                    </Text>
                    <RadioGroup
                      value={goalFormData.goalType}
                      onChange={(value) =>
                        setGoalFormData((prev) => ({
                          ...prev,
                          goalType: value as GoalType,
                        }))
                      }
                    >
                      <VStack space="sm">
                        <Radio value="loss" isInvalid={false} isDisabled={false}>
                          <RadioIndicator>
                            <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                          </RadioIndicator>
                          <RadioLabel>Weight Loss</RadioLabel>
                        </Radio>
                        <Radio value="gain" isInvalid={false} isDisabled={false}>
                          <RadioIndicator>
                            <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                          </RadioIndicator>
                          <RadioLabel>Weight Gain</RadioLabel>
                        </Radio>
                        <Radio
                          value="maintain"
                          isInvalid={false}
                          isDisabled={false}
                        >
                          <RadioIndicator>
                            <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                          </RadioIndicator>
                          <RadioLabel>Maintain Weight</RadioLabel>
                        </Radio>
                      </VStack>
                    </RadioGroup>
                  </HStack>

                  <HStack space="md" className="items-center">
                    <Text size="md" className="w-24">
                      Target Date:
                    </Text>
                    <Pressable
                      onPress={() => setShowGoalDatePicker(true)}
                      className="flex-1 h-10 border border-gray-300 rounded-md px-3 justify-center"
                    >
                      <Text>{goalFormData.targetDate.toLocaleDateString()}</Text>
                    </Pressable>
                    {showGoalDatePicker && (
                      <DateTimePicker
                        value={goalFormData.targetDate}
                        mode="date"
                        display="default"
                        onChange={onGoalDateChange}
                        minimumDate={new Date()}
                      />
                    )}
                  </HStack>

                  <HStack space="md">
                    <Button
                      size="md"
                      variant="outline"
                      action="secondary"
                      className="flex-1"
                      onPress={resetGoalForm}
                    >
                      <ButtonText>Cancel</ButtonText>
                    </Button>
                    <Button
                      size="md"
                      variant="solid"
                      action="primary"
                      className="flex-1 bg-[#6FA8DC]"
                      onPress={handleGoalSubmit}
                    >
                      <ButtonText className="text-white">
                        {editingGoal ? "Update Goal" : "Set Goal"}
                      </ButtonText>
                    </Button>
                  </HStack>
                </VStack>
              ) : isGoalPending ? (
                <Spinner />
              ) : currentGoal && currentGoal.status === "in_progress" ? (
                <VStack space="md">
                  <HStack className="items-center">
                    <Box
                      className={
                        currentGoal.goal_type === "loss"
                          ? "bg-blue-100 p-2 rounded-full mr-2"
                          : currentGoal.goal_type === "gain"
                          ? "bg-green-100 p-2 rounded-full mr-2"
                          : "bg-gray-100 p-2 rounded-full mr-2"
                      }
                    >
                      <Icon
                        as={
                          currentGoal.goal_type === "loss"
                            ? ArrowDownIcon
                            : currentGoal.goal_type === "gain"
                            ? ArrowUpIcon
                            : SlashIcon
                        }
                        size="md"
                        className={
                          currentGoal.goal_type === "loss"
                            ? "text-blue-500"
                            : currentGoal.goal_type === "gain"
                            ? "text-green-500"
                            : "text-gray-500"
                        }
                      />
                    </Box>
                    <VStack>
                      <Text size="sm" className="text-gray-600">
                        {currentGoal.goal_type === "loss"
                          ? "Weight Loss Goal"
                          : currentGoal.goal_type === "gain"
                          ? "Weight Gain Goal"
                          : "Weight Maintenance Goal"}
                      </Text>
                      <Heading size="md">
                        {currentGoal.target_weight} {currentGoal.unit} by{" "}
                        {new Date(currentGoal.target_date).toLocaleDateString()}
                      </Heading>
                    </VStack>
                  </HStack>

                  {weightEntries && weightEntries.length > 0 && (
                    <>
                      {(() => {
                        const progress = calculateGoalProgress();
                        if (!progress) return null;

                        return (
                          <VStack space="sm" className="mt-2">
                            <HStack className="justify-between items-center">
                              <Text size="sm" className="text-gray-600">
                                Weight Progress:
                              </Text>
                              <Text
                                size="sm"
                                className={
                                  currentGoal.goal_type === "loss"
                                    ? "text-blue-500 font-bold"
                                    : currentGoal.goal_type === "gain"
                                    ? "text-green-500 font-bold"
                                    : "text-gray-500 font-bold"
                                }
                              >
                                {progress.weightProgressPercent.toFixed(0)}%
                              </Text>
                            </HStack>
                            <Box className="bg-gray-200 h-2 rounded-full overflow-hidden">
                              <Box
                                className={
                                  currentGoal.goal_type === "loss"
                                    ? "bg-blue-500 h-full"
                                    : currentGoal.goal_type === "gain"
                                    ? "bg-green-500 h-full"
                                    : "bg-gray-500 h-full"
                                }
                                style={{
                                  width: `${progress.weightProgressPercent}%`,
                                }}
                              />
                            </Box>

                            <HStack className="justify-between items-center mt-2">
                              <Text size="sm" className="text-gray-600">
                                Time Progress:
                              </Text>
                              <Text size="sm" className="text-orange-500 font-bold">
                                {progress.timeProgressPercent.toFixed(0)}%
                              </Text>
                            </HStack>
                            <Box className="bg-gray-200 h-2 rounded-full overflow-hidden">
                              <Box
                                className="bg-orange-500 h-full"
                                style={{
                                  width: `${progress.timeProgressPercent}%`,
                                }}
                              />
                            </Box>

                            <HStack className="justify-between mt-2">
                              <Box className="bg-gray-100 p-2 rounded-lg flex-1 mr-1">
                                <Text size="xs" className="text-gray-600">
                                  Remaining:
                                </Text>
                                <HStack className="items-baseline">
                                  <Heading size="sm">
                                    {progress.weightRemaining.toFixed(1)}{" "}
                                  </Heading>
                                  <Text size="xs">{currentGoal.unit}</Text>
                                </HStack>
                              </Box>
                              <Box className="bg-gray-100 p-2 rounded-lg flex-1 ml-1">
                                <Text size="xs" className="text-gray-600">
                                  Days Left:
                                </Text>
                                <Heading size="sm">
                                  {progress.daysRemaining}
                                </Heading>
                              </Box>
                            </HStack>

                            <HStack className="items-center mt-2">
                              <Icon
                                as={
                                  progress.goalDirection === "ahead"
                                    ? CheckIcon
                                    : progress.goalDirection === "behind"
                                    ? ArrowDownIcon
                                    : SlashIcon
                                }
                                size="sm"
                                className={
                                  progress.goalDirection === "ahead"
                                    ? "text-green-500 mr-1"
                                    : progress.goalDirection === "behind"
                                    ? "text-red-500 mr-1"
                                    : "text-gray-500 mr-1"
                                }
                              />
                              <Text
                                size="sm"
                                className={
                                  progress.goalDirection === "ahead"
                                    ? "text-green-500"
                                    : progress.goalDirection === "behind"
                                    ? "text-red-500"
                                    : "text-gray-500"
                                }
                              >
                                {progress.goalDirection === "ahead"
                                  ? "You're ahead of schedule!"
                                  : progress.goalDirection === "behind"
                                  ? "You're a bit behind schedule."
                                  : "You're right on track!"}
                              </Text>
                            </HStack>
                          </VStack>
                        );
                      })()}

                      <HStack space="md" className="mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          action="secondary"
                          className="flex-1 border-[#6FA8DC]"
                          onPress={() => handleEditGoal(currentGoal)}
                        >
                          <ButtonIcon as={EditIcon} className="text-[#6FA8DC]" />
                          <ButtonText className="text-[#6FA8DC]">
                            Edit Goal
                          </ButtonText>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          action="secondary"
                          className="flex-1 border-red-500"
                          onPress={() => confirmDeleteGoal(currentGoal.id)}
                        >
                          <ButtonIcon as={TrashIcon} className="text-red-500" />
                          <ButtonText className="text-red-500">
                            Delete Goal
                          </ButtonText>
                        </Button>
                      </HStack>
                    </>
                  )}
                </VStack>
              ) : (
                <VStack space="md" className="items-center py-4">
                  <Text className="text-center text-gray-500">
                    You don't have an active weight goal.
                  </Text>
                  <Text className="text-center text-gray-500 mb-2">
                    Set a goal to track your progress!
                  </Text>
                </VStack>
              )}
            </VStack>
          </Box>

          {/* Add notification settings section */}
          <Box className="border border-gray-300 rounded-lg p-4 mt-2">
            <VStack space="md">
              <Heading size="md">Daily Reminder</Heading>
              <HStack space="md" className="items-center">
                <Text size="md">Set a daily reminder to track your weight</Text>
                <Button
                  size="sm"
                  variant={notificationSettings.enabled ? "outline" : "solid"}
                  action={notificationSettings.enabled ? "secondary" : "primary"}
                  className={notificationSettings.enabled ? "border-[#6FA8DC]" : "bg-[#6FA8DC]"}
                  onPress={toggleNotification}
                >
                  <ButtonIcon as={BellIcon} className={notificationSettings.enabled ? "text-[#6FA8DC]" : "text-white"} />
                  <ButtonText className={notificationSettings.enabled ? "text-[#6FA8DC]" : "text-white"}>
                    {notificationSettings.enabled ? "Disable" : "Enable"}
                  </ButtonText>
                </Button>
              </HStack>
              {notificationSettings.enabled && (
                <Text size="sm" className="text-gray-500">
                  Reminder set for {notificationSettings.time}
                </Text>
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={notificationTime}
                  mode="time"
                  display="default"
                  onChange={onTimeChange}
                />
              )}
            </VStack>
          </Box>

          {weightEntries && weightEntries.length > 0 && (
            <Box className="mt-4">
              <HStack className="justify-between items-center mb-4">
                <Heading size="md">Weight Progress</Heading>
                <HStack space="sm">
                  <Button
                    size="sm"
                    variant="outline"
                    action="secondary"
                    className="border-[#6FA8DC]"
                    onPress={() => refetch()}
                  >
                    <ButtonText className="text-[#6FA8DC]">Refresh</ButtonText>
                    <ButtonIcon as={ArrowRightIcon} className="text-[#6FA8DC]" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    action="secondary"
                    className="border-[#6FA8DC]"
                    onPress={exportToCSV}
                  >
                    <ButtonText className="text-[#6FA8DC]">Export</ButtonText>
                    <ButtonIcon as={DownloadIcon} className="text-[#6FA8DC]" />
                  </Button>
                </HStack>
              </HStack>

              <Box className="bg-white p-4 rounded-lg border border-gray-300">
                <HStack className="justify-between mb-4">
                  <RadioGroup
                    value={timePeriod}
                    onChange={setTimePeriod as (value: string) => void}
                  >
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
                    </HStack>
                  </RadioGroup>
                </HStack>

                <LineChart
                  data={prepareChartData(weightEntries)}
                  width={Dimensions.get("window").width - 65}
                  height={220}
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(111, 168, 220, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: "4",
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: "",
                    },
                  }}
                  withShadow={false}
                  withDots
                  withVerticalLines={false}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                  
                  // Add a custom legend if needed
                  decorator={() => {
                    return (
                      currentGoal && currentGoal.status === "in_progress" ? (
                        <Box
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            borderRadius: 4,
                            padding: 4,
                          }}
                        >
                          <HStack space="md" className="items-center">
                            <Box style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#6FA8DC" }} />
                            <Text size="xs">Current Weight</Text>
                            <Box style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#4CAF50" }} />
                            <Text size="xs">Goal Weight</Text>
                          </HStack>
                        </Box>
                      ) : null
                    );
                  }}
                />

                <VStack space="md" className="mt-4">
                  <Heading size="sm">Statistics</Heading>
                  <HStack className="flex-wrap justify-between">
                    <Box className="w-[48%] bg-gray-100 p-3 rounded-lg">
                      <Text size="sm" className="text-gray-600">
                        Total Change
                      </Text>
                      <Heading
                        size="md"
                        className={
                          stats.totalChange >= 0
                            ? "text-red-500"
                            : "text-green-500"
                        }
                      >
                        {stats.totalChange >= 0 ? "+" : ""}
                        {stats.totalChange.toFixed(1)} {unit}
                      </Heading>
                    </Box>
                    <Box className="w-[48%] bg-gray-100 p-3 rounded-lg">
                      <Text size="sm" className="text-gray-600">
                        Average Weight
                      </Text>
                      <Heading size="md">
                        {stats.averageWeight.toFixed(1)} {unit}
                      </Heading>
                    </Box>
                    <Box className="w-[48%] bg-gray-100 p-3 rounded-lg mt-2">
                      <Text size="sm" className="text-gray-600">
                        Highest Weight
                      </Text>
                      <Heading size="md">
                        {stats.highestWeight.toFixed(1)} {unit}
                      </Heading>
                    </Box>
                    <Box className="w-[48%] bg-gray-100 p-3 rounded-lg mt-2">
                      <Text size="sm" className="text-gray-600">
                        Lowest Weight
                      </Text>
                      <Heading size="md">
                        {stats.lowestWeight.toFixed(1)} {unit}
                      </Heading>
                    </Box>
                    
                    {currentGoal && currentGoal.status === "in_progress" && (
                      <Box className="w-full bg-blue-50 p-3 rounded-lg mt-2 border border-blue-200">
                        <HStack className="justify-between items-center">
                          <VStack>
                            <Text size="sm" className="text-gray-600">
                              Goal Progress
                            </Text>
                            <Heading size="md">
                              {currentGoal.target_weight} {currentGoal.unit} by{" "}
                              {new Date(currentGoal.target_date).toLocaleDateString()}
                            </Heading>
                          </VStack>
                          <Icon 
                            as={
                              currentGoal.goal_type === "loss"
                                ? ArrowDownIcon
                                : currentGoal.goal_type === "gain"
                                ? ArrowUpIcon
                                : SlashIcon
                            }
                            size="lg"
                            className={
                              currentGoal.goal_type === "loss"
                                ? "text-blue-500"
                                : currentGoal.goal_type === "gain"
                                ? "text-green-500"
                                : "text-gray-500"
                            }
                          />
                        </HStack>
                      </Box>
                    )}
                  </HStack>
                </VStack>
              </Box>
            </Box>
          )}

          <Box className="mt-4">
            <Heading size="md" className="mb-2">
              Weight History
            </Heading>

            {isPending ? (
              <Spinner />
            ) : weightEntries && weightEntries.length > 0 ? (
              <VStack space="sm">
                {weightEntries.map((item) => (
                  <Box
                    key={item.id}
                    className="border border-gray-300 rounded-md p-3 mb-2"
                  >
                    <HStack className="justify-between items-center">
                      <VStack>
                        <HStack space="sm">
                          <Heading size="sm">
                            {item.weight} {item.unit}
                          </Heading>
                          <Text size="sm" className="text-gray-500">
                            {formatDate(item.date)}
                          </Text>
                        </HStack>
                      </VStack>
                      <HStack space="sm">
                        <Pressable onPress={() => handleEdit(item)}>
                          <Icon as={EditIcon} size="md" />
                        </Pressable>
                        <Pressable onPress={() => confirmDelete(item.id)}>
                          <Icon
                            as={TrashIcon}
                            size="md"
                            className="text-red-500"
                          />
                        </Pressable>
                      </HStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text className="text-center py-4">No weight entries yet</Text>
            )}
          </Box>
        </VStack>
      </ScrollView>
    </StaticContainer>
  );
}
