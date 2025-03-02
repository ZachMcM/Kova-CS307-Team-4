import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import Container from '@/components/Container';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Mock workout data that would come from the workout session
const mockWorkoutData = {
  duration: '45 minutes',
  calories: '320 kcal',
  exercises: [
    { name: 'Bench Press', sets: 3, reps: 10, weight: '135 lbs' },
    { name: 'Squats', sets: 4, reps: 12, weight: '185 lbs' },
    { name: 'Pull-ups', sets: 3, reps: 8, weight: 'Body weight' }
  ]
};

export default function PostScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [includeWorkoutData, setIncludeWorkoutData] = useState(true);

  // Function to pick an image from the gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Function to handle post submission
  const handleSubmit = () => {
    // Here you would connect to Supabase and save the post
    console.log({
      title,
      description,
      location,
      isPublic,
      image,
      includeWorkoutData,
      workoutData: includeWorkoutData ? mockWorkoutData : null
    });
    
    // Reset form after submission
    setTitle('');
    setDescription('');
    setLocation('');
    setIsPublic(true);
    setImage(null);
    setIncludeWorkoutData(true);
  };

  return (
    <ScrollView style={styles.scrollView}>
      <Container>
        <View style={styles.header}>
          <Text style={styles.headerTitle} size="xl" bold>Create Post</Text>
        </View>

        <VStack space="md" style={styles.formContainer}>
          {/* Title Input */}
          <VStack space="xs">
            <Text size="sm" bold>Title</Text>
            <Input variant="outline">
              <InputField
                placeholder="Enter a title for your post"
                value={title}
                onChangeText={setTitle}
              />
            </Input>
          </VStack>

          {/* Description Input */}
          <VStack space="xs">
            <Text size="sm" bold>Description</Text>
            <Textarea>
              <TextareaInput
                placeholder="Share details about your workout..."
                value={description}
                onChangeText={setDescription}
              />
            </Textarea>
          </VStack>

          {/* Workout Data Toggle */}
          <VStack space="xs">
            <HStack style={styles.toggleContainer} space="md">
              <Text size="sm" bold>Include Workout Data</Text>
              <Switch
                value={includeWorkoutData}
                onValueChange={setIncludeWorkoutData}
                size="md"
              />
            </HStack>
          </VStack>

          {/* Workout Data Display (if toggled on) */}
          {includeWorkoutData && (
            <View style={styles.workoutDataContainer}>
              <Text size="sm" bold style={styles.sectionTitle}>Workout Summary</Text>
              
              <HStack style={styles.workoutSummary} space="lg">
                <VStack style={styles.summaryItem}>
                  <Text size="xs">Duration</Text>
                  <Text size="sm" bold>{mockWorkoutData.duration}</Text>
                </VStack>
                <VStack style={styles.summaryItem}>
                  <Text size="xs">Calories</Text>
                  <Text size="sm" bold>{mockWorkoutData.calories}</Text>
                </VStack>
              </HStack>

              <Text size="sm" bold style={styles.exercisesTitle}>Exercises</Text>
              {mockWorkoutData.exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <Text size="sm" bold>{exercise.name}</Text>
                  <Text size="xs">{exercise.sets} sets × {exercise.reps} reps • {exercise.weight}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Photo Upload */}
          <VStack space="xs">
            <Text size="sm" bold>Photo</Text>
            <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <VStack style={styles.uploadPlaceholder}>
                  <Ionicons name="camera-outline" size={24} color="#666" />
                  <Text size="sm" style={styles.uploadText}>Tap to add a photo</Text>
                </VStack>
              )}
            </TouchableOpacity>
          </VStack>

          {/* Location Input */}
          <VStack space="xs">
            <Text size="sm" bold>Location</Text>
            <Input variant="outline">
              <InputField
                placeholder="Add location (optional)"
                value={location}
                onChangeText={setLocation}
              />
            </Input>
          </VStack>

          {/* Public/Private Toggle */}
          <VStack space="xs">
            <HStack style={styles.toggleContainer} space="md">
              <Text size="sm" bold>Make Post Public</Text>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                size="md"
              />
            </HStack>
            <Text size="xs" style={styles.privacyHint}>
              {isPublic 
                ? "Public posts can be seen by everyone" 
                : "Private posts are only visible to you"}
            </Text>
          </VStack>

          {/* Submit Button */}
          <Button
            size="lg"
            action="kova"
            variant="solid"
            onPress={handleSubmit}
            style={styles.submitButton}
          >
            <Text style={styles.buttonText} bold>Post Workout</Text>
          </Button>
        </VStack>
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 16,
  },
  toggleContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutDataContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  workoutSummary: {
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  exercisesTitle: {
    marginBottom: 8,
  },
  exerciseItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  imageUpload: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  uploadText: {
    color: '#666',
    marginTop: 8,
  },
  privacyHint: {
    color: '#666',
    marginTop: 4,
  },
  submitButton: {
    marginTop: 24,
  },
  buttonText: {
    color: 'white',
  },
});

