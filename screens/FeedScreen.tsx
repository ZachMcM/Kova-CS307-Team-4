import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { WorkoutPost } from '../components/WorkoutPost';

export const FeedScreen = () => {
  // Hardcoded data for testing
  const samplePost = {
    username: 'MuscleMan',
    date: '01/08/2025',
    title: 'Chest Tris',
    description: 'Seeing a lot of progress with this split',
    exercises: [
      { name: 'Pec Flys' },
      { name: 'Tricep Pulldowns' },
      { name: 'Skull-crushers' },
      { name: 'Dips' },
      { name: 'Incline Chest Press' },
      { name: 'Dumbell Pullovers' },
    ],
    likes: 575,
    comments: 20,
    imageUrl: 'https://example.com/workout-image.jpg', // Replace with actual image URL
  };

  return (
    <ScrollView style={styles.container}>
      <WorkoutPost {...samplePost} />
      {/* Add more posts as needed */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 