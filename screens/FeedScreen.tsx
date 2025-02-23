import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { WorkoutPost } from '../components/WorkoutPost';

export const FeedScreen = () => {
  // Hardcoded sample data for testing
  const samplePosts = [
    {
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
      imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop',
    },
    {
      username: 'LegDay_Queen',
      date: '01/07/2025',
      title: 'Lower Body Power',
      description: 'Hit new PR on squats today! 💪',
      exercises: [
        { name: 'Back Squats' },
        { name: 'Romanian Deadlifts' },
        { name: 'Hip Thrusts' },
        { name: 'Bulgarian Split Squats' },
        { name: 'Calf Raises' },
      ],
      likes: 842,
      comments: 35,
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop',
    },
    {
      username: 'CoreWarrior',
      date: '01/06/2025',
      title: 'Ab Circuit',
      description: 'Quick but intense core session this morning',
      exercises: [
        { name: 'Planks' },
        { name: 'Russian Twists' },
        { name: 'Leg Raises' },
        { name: 'Mountain Climbers' },
      ],
      likes: 324,
      comments: 15,
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop',
    },
    {
      username: 'BackDay_Beast',
      date: '01/05/2025',
      title: 'Pull Day',
      description: 'Focus on mind-muscle connection today',
      exercises: [
        { name: 'Deadlifts' },
        { name: 'Pull-ups' },
        { name: 'Barbell Rows' },
        { name: 'Face Pulls' },
        { name: 'Lat Pulldowns' },
      ],
      likes: 657,
      comments: 28,
      imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop',
    },
    {
      username: 'CardioKing',
      date: '01/04/2025',
      title: 'HIIT Session',
      description: 'Brutal but effective! 🔥',
      exercises: [
        { name: 'Burpees' },
        { name: 'Box Jumps' },
        { name: 'Battle Ropes' },
        { name: 'Sprint Intervals' },
        { name: 'Jump Rope' },
      ],
      likes: 445,
      comments: 19,
      imageUrl: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=1000&auto=format&fit=crop',
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {samplePosts.map((post, index) => (
        <WorkoutPost key={index} {...post} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 