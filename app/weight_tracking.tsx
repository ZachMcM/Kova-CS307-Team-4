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
 InfoIcon,
  TrashIcon,
 TargetIcon,
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
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
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
  getActiveWeightGoal,
  createWeightGoal,
  updateWeightGoal,
  achieveWeightGoal,
  deactivateGoal,
} from "@/services/goalServices";
import {
  cancelNotification,
  getNotificationSettings,
  requestNotificationPermissions,
  scheduleDailyNotification,
} from "@/services/notificationServices";
import { WeightEntry } from "@/types/weight-types";
import { WeightGoal, WeightGoalInsert, WeightGoalUpdate } from "@/types/goal-types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";

// Helper to format date as YYYY-MM-DD for input[type=date] if needed, or keep using localeString
const formatDateForDisplay = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString(); // Adjust format as needed
};

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
   // Goal related stats
   weightToGo: 0,
   progressPercentage: 0,
   goalTargetWeight: 0,
   goalUnit: '',
   goalType: '',
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: false,
    time: '',
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());

 // Goal state
 const [showGoalModal, setShowGoalModal] = useState(false);
 const [isEditingGoal, setIsEditingGoal] = useState(false);
 const [goalFormData, setGoalFormData] = useState<Partial<WeightGoalUpdate>>({});
 const [showGoalTargetDatePicker, setShowGoalTargetDatePicker] = useState(false);

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
    isPending: isWeightPending,
    refetch: refetchWeight,
  } = useQuery({
    queryKey: ["weightEntries", userId],
    queryFn: async () => {
      if (!userId) return [];
      const entries = await getWeightEntries(userId);
     // Sort entries by date ascending for calculations
     return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
    enabled: !!userId,
  });

 // Fetch active weight goal
 const {
   data: activeGoal,
   isPending: isGoalPending,
   refetch: refetchGoal,
 } = useQuery({
   queryKey: ["activeWeightGoal", userId],
   queryFn: async () => {
     if (!userId) return null;
     return await getActiveWeightGoal(userId);
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

 // Handle Goal Target date change
 const onGoalTargetDateChange = (event: any, selectedDate?: Date) => {
   setShowGoalTargetDatePicker(false);
   if (selectedDate) {
     setGoalFormData({ ...goalFormData, target_date: selectedDate.toISOString() });
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
        await updateWeightEntry(editingEntry.id, {
          weight: weightValue,
          unit,
          date: date.toISOString(),
        });
        showSuccessToast(toast, "Weight entry updated");
      } else {
        // Add new entry
        await addWeightEntry({
          user_id: userId,
          weight: weightValue,
          unit,
          date: date.toISOString(),
        });
        showSuccessToast(toast, "Weight entry added");
      }

      // Reset form and refetch data
      resetForm();
     queryClient.invalidateQueries({ queryKey: ["weightEntries", userId] });
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
     await deleteWeightEntry(id);
      showSuccessToast(toast, "Weight entry deleted");
     queryClient.invalidateQueries({ queryKey: ["weightEntries", userId] });
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
 const calculateStats = (entries: WeightEntry[], goal: WeightGoal | null) => {
   let totalChange = 0;
   let averageWeight = 0;
   let highestWeight = 0;
   let lowestWeight = Infinity;
   let weightToGo = 0;
   let progressPercentage = 0;

   if (entries.length > 0) {
       const weights = entries.map((entry) => entry.weight);
       // Ensure entries are sorted by date ascending before calculating totalChange
       const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
       totalChange = sortedEntries[sortedEntries.length - 1].weight - sortedEntries[0].weight;
       averageWeight = weights.reduce((a, b) => a  b, 0) / weights.length;
       highestWeight = Math.max(...weights);
       lowestWeight = Math.min(...weights);

       if (goal) {
           const currentWeight = sortedEntries[sortedEntries.length - 1].weight;
           const initialWeight = goal.initial_weight;
           const targetWeight = goal.target_weight;

           weightToGo = currentWeight - targetWeight;

           const totalGoalChange = targetWeight - initialWeight;
           const currentProgress = currentWeight - initialWeight;

           if (totalGoalChange !== 0) {
               progressPercentage = (currentProgress / totalGoalChange) * 100;
               // Cap progress at 100% if goal is met or exceeded in the intended direction
               if ((goal.goal_type === 'loss' && currentWeight <= targetWeight) || (goal.goal_type === 'gain' && currentWeight >= targetWeight)) {
                   progressPercentage = 100;
               } else if (progressPercentage < 0) {
                   // Don't show negative progress if moving away from goal
                   progressPercentage = 0;
               }
           } else {
               progressPercentage = currentWeight === targetWeight ? 100 : 0; // Handle case where initial and target are the same
           }
       }
   }

    setStats({
      totalChange,
      averageWeight,
     highestWeight: highestWeight || 0,
     lowestWeight: lowestWeight === Infinity ? 0 : lowestWeight,
     weightToGo: goal ? weightToGo : 0,
     progressPercentage: goal ? Math.max(0, Math.min(100, progressPercentage)) : 0, // Clamp between 0 and 100
     goalTargetWeight: goal ? goal.target_weight : 0,
     goalUnit: goal ? goal.unit : '',
     goalType: goal ? goal.goal_type : '',
    });
  };

  // Filter entries by time period
  const filterEntriesByTimePeriod = (entries: WeightEntry[]) => {
    const now = new Date();
   // Ensure entries are sorted by date descending for filtering recent entries
   const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const filteredEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const diffTime = Math.abs(now.getTime() - entryDate.getTime());
   // Prepare chart data
   const prepareChartData = (entries: WeightEntry[]) => {
     const filteredEntries = filterEntriesByTimePeriod(entries);
    const sortedEntriesForChart = [...filteredEntries].sort(
       (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
     );
       ),
       datasets: [
         {
          data: sortedEntriesForChart.map((entry) => entry.weight),
         },
       ],
     };
     }
   };
 
 // --- Goal Management ---

 const openGoalModal = (edit = false) => {
   setIsEditingGoal(edit);
   if (edit && activeGoal) {
     setGoalFormData({
       target_weight: activeGoal.target_weight,
       target_date: activeGoal.target_date,
       goal_type: activeGoal.goal_type,
       unit: activeGoal.unit,
     });
   } else {
     // Pre-fill unit based on last entry or default
     const lastUnit = weightEntries && weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].unit : 'lbs';
     setGoalFormData({ unit: lastUnit, goal_type: 'loss' }); // Default to loss
   }
   setShowGoalModal(true);
 };

 const closeGoalModal = () => {
   setShowGoalModal(false);
   setGoalFormData({});
   setIsEditingGoal(false);
 };

 const handleGoalSubmit = async () => {
   if (!userId || !weightEntries || weightEntries.length === 0) {
     showErrorToast(toast, "Please add at least one weight entry before setting a goal.");
     return;
   }
   if (!goalFormData.target_weight || !goalFormData.target_date || !goalFormData.goal_type || !goalFormData.unit) {
     showErrorToast(toast, "Please fill all goal fields.");
     return;
   }

   goalMutation.mutate(goalFormData);
 };

 // --- Effects ---

   // Update statistics when entries change
   useEffect(() => {
     if (weightEntries) {
      calculateStats(weightEntries, activeGoal);
     }
   }, [weightEntries]);
     }
   };
 
 // --- Goal Achievement Check ---
 useEffect(() => {
    if (activeGoal && weightEntries && weightEntries.length > 0) {
      const latestEntry = weightEntries[weightEntries.length - 1]; // Assuming sorted ascending

      let goalMet = false;
      if (activeGoal.goal_type === 'loss' && latestEntry.weight <= activeGoal.target_weight) {
        goalMet = true;
      } else if (activeGoal.goal_type === 'gain' && latestEntry.weight >= activeGoal.target_weight) {
        goalMet = true;
      }

      if (goalMet) {
        achieveGoalMutation.mutate(activeGoal.id);
      }
    }
  }, [weightEntries, activeGoal]); // Re-run when entries or goal changes

 // --- Mutations ---

 const goalMutation = useMutation({
    mutationFn: async (formData: Partial<WeightGoalUpdate>) => {
        if (!userId || !weightEntries || weightEntries.length === 0) throw new Error("User or weight data missing");

        const latestWeightEntry = weightEntries[weightEntries.length - 1]; // Assuming sorted ascending

        if (isEditingGoal && activeGoal) {
            // Update existing goal
            return await updateWeightGoal(activeGoal.id, formData as WeightGoalUpdate);
        } else {
            // Create new goal
            const newGoalData: WeightGoalInsert = {
                user_id: userId,
                target_weight: formData.target_weight!,
                initial_weight: latestWeightEntry.weight, // Use the latest weight as initial
                unit: formData.unit!,
                goal_type: formData.goal_type!,
                target_date: formData.target_date!,
            };
            return await createWeightGoal(newGoalData);
        }
    },
    onSuccess: () => {
        showSuccessToast(toast, `Weight goal ${isEditingGoal ? 'updated' : 'set'} successfully!`);
        closeGoalModal();
        queryClient.invalidateQueries({ queryKey: ["activeWeightGoal", userId] });
    },
    onError: (error) => {
        showErrorToast(toast, `Failed to ${isEditingGoal ? 'update' : 'set'} weight goal: ${error.message}`);
    }
 });

 const achieveGoalMutation = useMutation({
     mutationFn: achieveWeightGoal,
     onSuccess: (achievedGoal) => {
         showSuccessToast(toast, "Congratulations! You reached your weight goal!");
         queryClient.invalidateQueries({ queryKey: ["activeWeightGoal", userId] });
         // Prepare data and navigate to post screen
         const latestEntry = weightEntries?.[weightEntries.length - 1];
         if (latestEntry) {
             const postData = {
                 goalAchieved: true,
                 title: "Reached my weight goal!",
                 description: `Started at ${achievedGoal.initial_weight} ${achievedGoal.unit}, aimed for ${achievedGoal.target_weight} ${achievedGoal.unit} by ${formatDateForDisplay(achievedGoal.target_date)}, and reached ${latestEntry.weight} ${latestEntry.unit} today!`,
                 weighIn: latestEntry.weight // Optionally prefill weigh-in
             };
             router.push({
                 pathname: "/(tabs)/post",
                 params: { goalAchievedData: JSON.stringify(postData) },
             });
         }
     },
     onError: (error) => {
         showErrorToast(toast, `Failed to mark goal as achieved: ${error.message}`);
     }
 });

 const deactivateGoalMutation = useMutation({
     mutationFn: deactivateGoal,
     onSuccess: () => {
         showSuccessToast(toast, "Weight goal deactivated.");
         queryClient.invalidateQueries({ queryKey: ["activeWeightGoal", userId] });
     },
     onError: (error) => {
         showErrorToast(toast, `Failed to deactivate goal: ${error.message}`);
     }
 });

 // Confirm goal deactivation
 const confirmDeactivateGoal = (goalId: string) => {
     Alert.alert(
         "Deactivate Goal",
         "Are you sure you want to deactivate this goal? You can set a new one later.",
         [
             { text: "Cancel", style: "cancel" },
             {
                 text: "Deactivate",
                 onPress: () => deactivateGoalMutation.mutate(goalId),
                 style: "destructive",
             },
         ]
     );
 };

   return (
     <StaticContainer className="flex">
       <ScrollView className="flex px-6 py-16" keyboardShouldPersistTaps="handled">
             </VStack>
           </Box>
 
          {/* --- Goal Section --- */}
          <Box className="border border-gray-300 rounded-lg p-4 mt-2">
            <VStack space="md">
              <HStack space="md" className="items-center justify-between">
                <Heading size="md">Weight Goal</Heading>
                <Button
                  size="sm"
                  variant="outline"
                  action="primary"
                  className="border-[#6FA8DC]"
                  onPress={() => openGoalModal(!!activeGoal)}
                  isDisabled={isGoalPending}
                >
                  <ButtonIcon as={activeGoal ? EditIcon : TargetIcon} className="text-[#6FA8DC]" />
                  <ButtonText className="text-[#6FA8DC]">
                    {isGoalPending ? "Loading..." : activeGoal ? "Edit Goal" : "Set Goal"}
                  </ButtonText>
                </Button>
              </HStack>
              {activeGoal && (
                <Text size="sm" className="text-gray-500">
                  Target: {activeGoal.target_weight} {activeGoal.unit} by {formatDateForDisplay(activeGoal.target_date)}
                </Text>
              )}
              {!activeGoal && !isGoalPending && <Text size="sm" className="text-gray-500">No active goal set.</Text>}
            </VStack>
          </Box>

           {/* Add notification settings section */}
           <Box className="border border-gray-300 rounded-lg p-4 mt-2">
             <VStack space="md">
             </VStack>
           </Box>
 
          {weightEntries && weightEntries.length > 0 ? (
             <Box className="mt-4">
               <HStack className="justify-between items-center mb-4">
                 <Heading size="md">Weight Progress</Heading>
                     variant="outline"
                     action="secondary"
                     className="border-[#6FA8DC]"
                    onPress={() => refetchWeight()}
                   >
                     <ButtonText className="text-[#6FA8DC]">Refresh</ButtonText>
                     <ButtonIcon as={ArrowRightIcon} className="text-[#6FA8DC]" />
                       >
                         {stats.totalChange >= 0 ? "" : ""}
                         {stats.totalChange.toFixed(1)} {unit}
                      </Heading> */}
                     </Box>
                     <Box className="w-[48%] bg-gray-100 p-3 rounded-lg">
                       <Text size="sm" className="text-gray-600">
                         Lowest Weight
                       </Text>
                       <Heading size="md">
                        {stats.lowestWeight.toFixed(1)} {unit}
                      </Heading>
                    </Box>
                    {/* Goal Stats */}
                    {activeGoal && (
                      <>
                        <Box className="w-[48%] bg-gray-100 p-3 rounded-lg mt-2">
                          <Text size="sm" className="text-gray-600">
                            Goal Progress
                          </Text>
                          <Heading size="md">
                            {stats.progressPercentage.toFixed(0)}%
                          </Heading>
                        </Box>
                        <Box className="w-[48%] bg-gray-100 p-3 rounded-lg mt-2">
                          <Text size="sm" className="text-gray-600">
                            Weight to {stats.goalType === 'loss' ? 'Lose' : 'Gain'}
                          </Text>
                          <Heading size="md" className={stats.weightToGo <= 0 ? "text-green-500" : "text-red-500"}>
                            {Math.abs(stats.weightToGo).toFixed(1)} {stats.goalUnit}
                          </Heading>
                        </Box>
                      </>
                    )}
                       </Heading>
                     </Box>
                   </HStack>
               Weight History
             </Heading>
 
            {isWeightPending ? (
               <Spinner />
             ) : weightEntries && weightEntries.length > 0 ? (
               <VStack space="sm">
             ) : (
               <Text className="text-center py-4">No weight entries yet</Text>
             )}
          </Box>) : (
             <Text className="text-center py-4 mt-4">Add your first weight entry to see progress!</Text>
          )}
         </VStack>

        {/* Goal Setting/Editing Modal */}
        <Modal isOpen={showGoalModal} onClose={closeGoalModal} size="lg">
          <ModalBackdrop />
          <ModalContent>
            <ModalHeader>
              <Heading size="lg">{isEditingGoal ? "Edit" : "Set"} Weight Goal</Heading>
              <ModalCloseButton>
                <Icon as={InfoIcon} /> {/* Using InfoIcon as placeholder */}
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <VStack space="md">
                {/* Goal Type */}
                <HStack space="md" className="items-center">
                  <Text size="md" className="w-24">Goal Type:</Text>
                  <RadioGroup
                    value={goalFormData.goal_type || 'loss'}
                    onChange={(value) => setGoalFormData({ ...goalFormData, goal_type: value as 'loss' | 'gain' })}
                  >
                    <HStack space="xl">
                      <Radio value="loss">
                        <RadioIndicator mr="$2">
                          <RadioIcon as={CircleIcon} />
                        </RadioIndicator>
                        <RadioLabel>Loss</RadioLabel>
                      </Radio>
                      <Radio value="gain">
                        <RadioIndicator mr="$2">
                          <RadioIcon as={CircleIcon} />
                        </RadioIndicator>
                        <RadioLabel>Gain</RadioLabel>
                      </Radio>
                    </HStack>
                  </RadioGroup>
                </HStack>

                {/* Target Weight */}
                <HStack space="md" className="items-center">
                  <Text size="md" className="w-24">Target:</Text>
                  <Input className="flex-1">
                    <InputField
                      value={goalFormData.target_weight?.toString() || ''}
                      onChangeText={(text) => setGoalFormData({ ...goalFormData, target_weight: Number(text) || undefined })}
                      keyboardType="numeric"
                      placeholder="Enter target weight"
                    />
                  </Input>
                  {/* Unit Selection (Optional - could default to user preference) */}
                  <RadioGroup
                      value={goalFormData.unit || 'lbs'}
                      onChange={(value) => setGoalFormData({ ...goalFormData, unit: value as 'kg' | 'lbs' })}
                  >
                      <HStack space="md">
                          <Radio value="lbs"><RadioLabel>lbs</RadioLabel></Radio>
                          <Radio value="kg"><RadioLabel>kg</RadioLabel></Radio>
                      </HStack>
                  </RadioGroup>
                </HStack>

                {/* Target Date */}
                <HStack space="md" className="items-center">
                  <Text size="md" className="w-24">Target Date:</Text>
                  <Pressable
                    onPress={() => setShowGoalTargetDatePicker(true)}
                    className="flex-1 h-10 border border-gray-300 rounded-md px-3 justify-center"
                  >
                    <Text>{goalFormData.target_date ? formatDateForDisplay(goalFormData.target_date) : 'Select Date'}</Text>
                  </Pressable>
                  {showGoalTargetDatePicker && (
                    <DateTimePicker
                      value={goalFormData.target_date ? new Date(goalFormData.target_date) : new Date()}
                      mode="date"
                      display="default"
                      onChange={onGoalTargetDateChange}
                      minimumDate={new Date()} // Can't set goal in the past
                    />
                  )}
                </HStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              {isEditingGoal && activeGoal && (
                  <Button variant="outline" action="negative" mr="$3" onPress={() => confirmDeactivateGoal(activeGoal.id)} isDisabled={deactivateGoalMutation.isPending}>
                      <ButtonText>Deactivate Goal</ButtonText>
                  </Button>
              )}
              <Button variant="outline" action="secondary" mr="$3" onPress={closeGoalModal}>
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button onPress={handleGoalSubmit} isDisabled={goalMutation.isPending}>
                <ButtonText>{isEditingGoal ? "Update" : "Set"} Goal</ButtonText>
                {goalMutation.isPending && <Spinner ml="$2" color="$white"/>}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

       </ScrollView>
     </StaticContainer>
   );