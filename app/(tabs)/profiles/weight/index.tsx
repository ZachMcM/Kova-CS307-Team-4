import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import StaticContainer from "@/components/StaticContainer";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from '@/components/ui/vstack';
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Icon, TrashIcon, EditIcon, AddIcon, ChevronLeftIcon } from "@/components/ui/icon";
import { useRouter } from "expo-router";
import { useToast } from "@/components/ui/toast";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { Pressable } from "@/components/ui/pressable";
import { RadioGroup, Radio, RadioIndicator, RadioIcon, RadioLabel } from "@/components/ui/radio";
import { FlatList } from "@/components/ui/flat-list";
import { Spinner } from "@/components/ui/spinner";
import DateTimePicker from '@react-native-community/datetimepicker';

// Local type definition for weight entries
type WeightEntry = {
  id: string;
  weight: number;
  unit: 'kg' | 'lbs';
  date: string; // ISO date string
  created_at: string;
};

export default function WeightTrackingScreen() {
  const router = useRouter();
  const toast = useToast();
  
  // Weight entry form state
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Local state for weight entries
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Edit state
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
  
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
    setUnit('kg');
    setDate(new Date());
    setEditingEntry(null);
  };
  
  // Generate a simple UUID for local entries
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    try {
      if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
        showErrorToast(toast, "Please enter a valid weight");
        return;
      }
      
      const weightValue = Number(weight);
      
      if (editingEntry) {
        // Update existing entry
        setWeightEntries(entries => 
          entries.map(entry => 
            entry.id === editingEntry.id 
              ? {
                  ...entry,
                  weight: weightValue,
                  unit,
                  date: date.toISOString(),
                }
              : entry
          )
        );
        showSuccessToast(toast, "Weight entry updated");
      } else {
        // Add new entry
        const newEntry: WeightEntry = {
          id: generateId(),
          weight: weightValue,
          unit,
          date: date.toISOString(),
          created_at: new Date().toISOString(),
        };
        
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
  const handleDelete = (id: string) => {
    try {
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
    <StaticContainer className="flex px-6 py-16">
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
              <Text size="md" className="w-20">Weight:</Text>
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
              <Text size="md" className="w-20">Unit:</Text>
              <RadioGroup value={unit} onChange={setUnit as (value: string) => void}>
                <HStack space="xl">
                  <Radio value="kg" isInvalid={false} isDisabled={false}>
                    <RadioIndicator>
                      <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                    </RadioIndicator>
                    <RadioLabel>kg</RadioLabel>
                  </Radio>
                  <Radio value="lbs" isInvalid={false} isDisabled={false}>
                    <RadioIndicator>
                      <RadioIcon as={ChevronLeftIcon}></RadioIcon>
                    </RadioIndicator>
                    <RadioLabel>lbs</RadioLabel>
                  </Radio>
                </HStack>
              </RadioGroup>
            </HStack>
            
            <HStack space="md" className="items-center">
              <Text size="md" className="w-20">Date:</Text>
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
        
        <Box className="mt-4">
          <Heading size="md" className="mb-2">Weight History</Heading>
          
          {isLoading ? (
            <Spinner />
          ) : weightEntries.length > 0 ? (
            <FlatList
              data={weightEntries}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Box className="border border-gray-300 rounded-md p-3 mb-2">
                  <HStack className="justify-between items-center">
                    <VStack>
                      <HStack space="sm">
                        <Heading size="sm">{item.weight} {item.unit}</Heading>
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
                        <Icon as={TrashIcon} size="md" className="text-red-500" />
                      </Pressable>
                    </HStack>
                  </HStack>
                </Box>
              )}
            />
          ) : (
            <Text className="text-center py-4">No weight entries yet</Text>
          )}
        </Box>
      </VStack>
    </StaticContainer>
  );
} 