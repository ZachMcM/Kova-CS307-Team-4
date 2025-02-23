import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, View } from 'react-native';
import { WorkoutPost } from '../components/WorkoutPost';
import { supabase } from '@/lib/supabase';

type WorkoutPostType = {
  id: string;
  title: string;
  description: string;
  exercises: { name: string }[];
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    username: string;
  };
};

export const FeedScreen = () => {
  const [posts, setPosts] = useState<WorkoutPostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_posts')
        .select(`
          *,
          profiles (
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {posts.map((post) => (
        <WorkoutPost
          key={post.id}
          username={post.profiles.username}
          date={new Date(post.created_at).toLocaleDateString()}
          title={post.title}
          description={post.description}
          exercises={post.exercises}
          likes={post.likes_count}
          comments={post.comments_count}
          imageUrl={post.image_url || undefined}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
}); 