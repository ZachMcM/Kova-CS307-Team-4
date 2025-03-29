import React, { useState, useEffect } from 'react';
import { View, Alert, Dimensions, Share, ScrollView } from 'react-native';
import StaticContainer from "@/components/StaticContainer";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from '@/components/ui/vstack';
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Icon, TrashIcon, EditIcon, AddIcon, ChevronLeftIcon, DownloadIcon } from "@/components/ui/icon";
import { useRouter } from "expo-router";
import { useToast } from "@/components/ui/toast";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { Pressable } from "@/components/ui/pressable";
import { RadioGroup, Radio, RadioIndicator, RadioIcon, RadioLabel } from "@/components/ui/radio";
import { FlatList } from "@/components/ui/flat-list";
import { Spinner } from "@/components/ui/spinner";
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';
import { getWeightEntries, addWeightEntry, updateWeightEntry, deleteWeightEntry } from '@/services/weightServices';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useSession } from "@/components/SessionContext";
// Local type definition for weight entries
type WeightEntry = {
  id: string;
  weight: number;
  unit: 'kg' | 'lbs';
  date: string;
  created_at: string;
};

type TimeFilter = 'week' | 'month' | 'year';

export default function WeightTrackingScreen() {
  const router = useRouter();
  const toast = useToast();
  const { session } = useSession();
  const userId = session?.user?.id;
  
  // Weight entry form state
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('lbs');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Local state for weight entries
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  
  // Edit state
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
  
  // Load weight entries
  useEffect(() => {
    if (userId) {
      loadWeightEntries();
    }
  }, [userId]);

  const loadWeightEntries = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const entries = await getWeightEntries(userId);
      setWeightEntries(entries);
    } catch (error) {
      console.error(error);
      showErrorToast(toast, "Failed to load weight entries");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter entries based on time period
  const getFilteredEntries = () => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeFilter) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return weightEntries.filter(entry => new Date(entry.date) >= filterDate);
  };

  // Calculate statistics
  const calculateStats = () => {
    const filteredEntries = getFilteredEntries();
    if (filteredEntries.length === 0) return null;

    const weights = filteredEntries.map(entry => entry.weight);
    const totalChange = weights[0] - weights[weights.length - 1];
    const average = weights.reduce((a, b) => a + b, 0) / weights.length;
    const trend = totalChange > 0 ? 'gain' : totalChange < 0 ? 'loss' : 'stable';

    return {
      totalChange: Math.abs(totalChange).toFixed(1),
      average: average.toFixed(1),
      trend,
      entries: filteredEntries.length
    };
  };

  // Prepare chart data
  const getChartData = () => {
    const filteredEntries = getFilteredEntries();
    if (filteredEntries.length === 0) return null;

    const sortedEntries = [...filteredEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      labels: sortedEntries.map(entry => 
        new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      datasets: [{
        data: sortedEntries.map(entry => entry.weight)
      }]
    };
  };

  // Export data to CSV
  const exportData = async () => {
    try {
      const csvContent = [
        ['Date', 'Weight', 'Unit'],
        ...weightEntries.map(entry => [
          new Date(entry.date).toLocaleDateString(),
          entry.weight,
          entry.unit
        ])
      ].map(row => row.join(',')).join('\n');

      const fileUri = `${FileSystem.documentDirectory}weight_data.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error(error);
      showErrorToast(toast, "Failed to export data");
    }
  };
  
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
    setWeight('');
    setUnit('lbs');
    setDate(new Date());
    setEditingEntry(null);
  };
  
  // Generate a simple UUID for local entries
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!userId) return;

    try {
      if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
        showErrorToast(toast, "Please enter a valid weight");
        return;
      }
      
      const weightValue = Number(weight);
      
      if (editingEntry) {
        // Update existing entry
        const updatedEntry = await updateWeightEntry(editingEntry.id, {
          weight: weightValue,
          unit,
          date: date.toISOString(),
        });
        
        setWeightEntries(entries => 
          entries.map(entry => 
            entry.id === editingEntry.id ? updatedEntry : entry
          )
        );
        showSuccessToast(toast, "Weight entry updated");
      } else {
        // Add new entry
        const newEntry = await addWeightEntry({
          user_id: userId,
          weight: weightValue,
          unit,
          date: date.toISOString(),
        });
        
        setWeightEntries(entries => [newEntry, ...entries]);
        showSuccessToast(toast, "Weight entry added");
      }
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error(error);
      showErrorToast(toast, "Failed to save weight entry");
    }
  };
  
  // Handle edit
  const handleEdit = (entry: WeightEntry) => {
    setEditingEntry(entry);
    setWeight(entry.weight.toString());
    setUnit(entry.unit);
    setDate(new Date(entry.date));
  };
  
  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteWeightEntry(id);
      setWeightEntries(entries => entries.filter(entry => entry.id !== id));
      showSuccessToast(toast, "Weight entry deleted");
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
        { text: "Delete", onPress: () => handleDelete(id), style: "destructive" }
      ]
    );
  };
  
  return (
    <StaticContainer>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16, flex: 1 }}>
          <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
            <Pressable
              onPress={() => router.back()}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Icon as={ChevronLeftIcon} size="md" />
              <Text>Back</Text>
            </Pressable>
            <Heading style={{ flex: 1, textAlign: 'center' }}>Weight Tracking</Heading>
          </View>

          {/* Weight Entry Form */}
          <VStack space="md" style={{ marginBottom: 24 }}>
            <View style={{ padding: 16, borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, backgroundColor: '#fff' }}>
              <VStack space="md">
                <HStack space="md" style={{ alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Input>
                      <InputField
                        placeholder="Enter weight"
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="numeric"
                      />
                    </Input>
                  </View>
                  <RadioGroup value={unit} onChange={setUnit}>
                    <HStack space="md">
                      <Radio value="lbs">
                        <RadioIndicator>
                          <RadioIcon as={Icon} />
                        </RadioIndicator>
                        <RadioLabel>lbs</RadioLabel>
                      </Radio>
                      <Radio value="kg">
                        <RadioIndicator>
                          <RadioIcon as={Icon} />
                        </RadioIndicator>
                        <RadioLabel>kg</RadioLabel>
                      </Radio>
                    </HStack>
                  </RadioGroup>
                </HStack>

                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <Text>Date: {date.toLocaleDateString()}</Text>
                </Pressable>

                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                  />
                )}

                <Button onPress={handleSubmit}>
                  <ButtonText>{editingEntry ? 'Update' : 'Add'} Weight</ButtonText>
                </Button>
              </VStack>
            </View>
          </VStack>

          {/* Statistics Section */}
          <VStack space="md" style={{ marginBottom: 24 }}>
            <Heading size="sm">Statistics</Heading>
            <HStack space="md">
              <RadioGroup
                value={timeFilter}
                onChange={setTimeFilter}
                style={{ flexDirection: 'row' }}
              >
                <HStack space="md">
                  <Radio value="week">
                    <RadioIndicator>
                      <RadioIcon as={Icon} />
                    </RadioIndicator>
                    <RadioLabel>Week</RadioLabel>
                  </Radio>
                  <Radio value="month">
                    <RadioIndicator>
                      <RadioIcon as={Icon} />
                    </RadioIndicator>
                    <RadioLabel>Month</RadioLabel>
                  </Radio>
                  <Radio value="year">
                    <RadioIndicator>
                      <RadioIcon as={Icon} />
                    </RadioIndicator>
                    <RadioLabel>Year</RadioLabel>
                  </Radio>
                </HStack>
              </RadioGroup>
            </HStack>

            {calculateStats() && (
              <View style={{ padding: 16, borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, backgroundColor: '#fff' }}>
                <VStack space="sm">
                  <Text>Total {calculateStats()?.trend}: {calculateStats()?.totalChange} {unit}</Text>
                  <Text>Average: {calculateStats()?.average} {unit}</Text>
                  <Text>Entries: {calculateStats()?.entries}</Text>
                </VStack>
              </View>
            )}
          </VStack>

          {/* Chart Section */}
          {getChartData() && (
            <View style={{ marginBottom: 24, alignItems: 'center' }}>
              <LineChart
                data={getChartData()!}
                width={Dimensions.get('window').width - 32}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                bezier
              />
            </View>
          )}

          {/* Weight Entries List */}
          {isLoading ? (
            <Spinner size="large" />
          ) : (
            <VStack space="md">
              <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Heading size="sm">History</Heading>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={exportData}
                >
                  <ButtonIcon as={DownloadIcon} />
                  <ButtonText>Export</ButtonText>
                </Button>
              </HStack>

              <FlatList
                data={weightEntries}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View
                    style={{
                      padding: 16,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: '#e5e5e5',
                      borderRadius: 8,
                      backgroundColor: '#fff'
                    }}
                  >
                    <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <VStack>
                        <Text style={{ fontWeight: 'bold' }}>{item.weight} {item.unit}</Text>
                        <Text style={{ color: '#6b7280' }}>{formatDate(item.date)}</Text>
                      </VStack>
                      <HStack space="sm">
                        <Pressable onPress={() => handleEdit(item)}>
                          <Icon as={EditIcon} />
                        </Pressable>
                        <Pressable onPress={() => handleDelete(item.id)}>
                          <Icon as={TrashIcon} style={{ color: '#ef4444' }} />
                        </Pressable>
                      </HStack>
                    </HStack>
                  </View>
                )}
              />
            </VStack>
          )}
        </View>
      </ScrollView>
    </StaticContainer>
  );
} 