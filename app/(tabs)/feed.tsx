import { ScrollView, RefreshControl, View, StyleSheet } from 'react-native';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showErrorToast } from '@/services/toastServices';
import { Redirect, useRouter } from "expo-router";
import Container from '@/components/Container';
import { Exercise, WorkoutPost } from '@/components/WorkoutPost';
import React, { useState, useCallback } from 'react';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { useSession } from '@/components/SessionContext';
import { useToast } from '@/components/ui/toast';
import { fetchFeed, resetFeed, updateFeed } from '@/services/asyncStorageServices';
import { PostAsyncStorage } from '@/types/post.types';

// Mock data for the feed
// type Post = {
//   id: string;
//   username: string;
//   date: string;
//   title: string;
//   description: string;
//   exercises: {
//       name: string;
//   }[];
//   likes: number;
//   comments: number;
//   imageUrl: string;
// }

// const mockPosts = [
//   {
//     id: '1',
//     username: 'fitness_enthusiast',
//     date: 'May 15, 2023',
//     title: 'Morning Cardio Session',
//     description: 'Started my day with an intense 30-minute HIIT session. Feeling energized!',
//     exercises: [
//       { name: 'Burpees' },
//       { name: 'Mountain Climbers' },
//       { name: 'Jumping Jacks' }
//     ],
//     likes: 24,
//     comments: 5,
//     imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
//   },
//   {
//     id: '2',
//     username: 'strength_trainer',
//     date: 'May 14, 2023',
//     title: 'Leg Day Completed',
//     description: 'Pushed through a challenging leg workout today. My quads are on fire!',
//     exercises: [
//       { name: 'Squats' },
//       { name: 'Deadlifts' },
//       { name: 'Lunges' }
//     ],
//     likes: 42,
//     comments: 8,
//     imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
//   },
//   {
//     id: '3',
//     username: 'yoga_master',
//     date: 'May 13, 2023',
//     title: 'Peaceful Yoga Flow',
//     description: 'Found my center with a 60-minute yoga session. Perfect way to end the week.',
//     exercises: [
//       { name: 'Downward Dog' },
//       { name: 'Warrior Pose' },
//       { name: 'Child\'s Pose' }
//     ],
//     likes: 36,
//     comments: 4,
//     imageUrl: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
//   }
// ];

export default function FeedScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const toast= useToast();
  const queryClient = useQueryClient();
  const { signOutUser } = useSession();

  const onRefresh = useCallback( async () => {
    setRefreshing(true);
    await resetFeed();
    queryClient.invalidateQueries( {queryKey: ["feed-data"]} )
    // In a real app, you would fetch new data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleLogout = () => {
    signOutUser().then(() => { router.replace("/login") }).catch(error => {
      console.log(error);
      showErrorToast(toast, error.message);
    });
  };

  const { data: feed_data } = useQuery({
      queryKey: ["feed-data"],
      queryFn: async () => {
        const feed_data = await fetchFeed();
        console.log(feed_data)
        return feed_data;
      },
  });

  const { mutate: load_data } = useMutation({
    mutationFn: async () => {
      await fetchFeed();
      await updateFeed();
      queryClient.invalidateQueries( {queryKey: ["feed-data"]} )
    }
  })

  return (
    <ScrollView 
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Container>
        <View style={styles.header}>
          <Text style={styles.headerTitle} size="xl" bold>Workout Feed</Text>
        </View>
        
        {/* Logout Button */}
        <VStack style={styles.logoutContainer}>
          <Button onPress={handleLogout}>
            <Text className="text-white">Logout</Text>
          </Button>
        </VStack>
        
        {feed_data != null ? (JSON.parse(feed_data).map((post: PostAsyncStorage) => (
          <WorkoutPost
            key={post.id}
            username={post.username}
            date={post.date}
            title={post.title}
            description={post.description}
            exercises={(post.exerciseData || []).map(exerciseData => ({
              name: exerciseData.info.name
            }))}
            likes={post.likes}
            comments={post.comments}
            imageUrl={post.imageUrl}
          />
        ))) : <></>}
        <Button onPress={() => {load_data()}}>
          <ButtonText>Load more posts</ButtonText>
        </Button>
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
  logoutContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  }
}); 