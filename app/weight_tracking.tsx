import StaticContainer from "@/components/StaticContainer";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import {
  AddIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  DownloadIcon,
  EditIcon,
  Icon,
  TrashIcon,
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
import { WeightEntry } from "@/types/weight-types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, ScrollView } from "react-native";
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
      await deleteWeightEntry(id);
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

    return {
      labels: sortedEntries.map((entry) =>
        new Date(entry.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      ),
      datasets: [
        {
          data: sortedEntries.map((entry) => entry.weight),
        },
      ],
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
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
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
