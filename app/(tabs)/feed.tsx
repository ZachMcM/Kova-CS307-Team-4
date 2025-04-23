import Container from "@/components/Container";
import { useSession } from "@/components/SessionContext";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { WorkoutPost } from "@/components/WorkoutPost";
import { supabase } from "@/lib/supabase";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { getFollowing, getFriends } from "@/services/profileServices";
import { getExercises } from "@/services/exerciseServices";
import { asyncExercises } from "@/services/asyncStorageServices";

export type Post = {
  id: string;
  profileId: string;
  title: string;
  description: string;
  location: string | null;
  privacy: string;
  images: string[] | null;
  weighIn: number;
  workoutData: {
    calories?: string;
    duration?: string;
    exercises: Array<
        {
          name: string;
          reps?: number;
          sets?: number;
          weight?: string;
        }
    >;
    originalTemplateId?: string | null;
  } | null;
  template_id?: string | null;
  taggedFriends?: string[] | null;
  taggedFriendsData?: Array<{
    userId: string;
    name: string;
    avatar?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  profile?: {
    username: string;
    userId: string;
    name: string;
    avatar?: string;
  };
  comments: number;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    hour: 'numeric',
    minute: 'numeric',
  });
};

export const formatDuration = (hourMinuteString: string): string => {
  let split = hourMinuteString.split(":");
  let minute = parseInt(split[0]);
  let second = parseInt(split[1]);
  if (minute === 0) {
    return second.toString() + " Sec"
  } else if (minute >= 60) {
    let hour = Math.floor(minute / 60);
    return hour.toString() + " Hr " + (minute % 60).toString() + " Min";
  }
  return minute.toString() + " Min";
};

export default function FeedScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const postsPerPage = 4;

  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { signOutUser, sessionLoading, setSessionLoading, session } = useSession();
  const userId = session?.user?.id;

  const fetchPosts = async (pageNumber = 0, append = false) => {
    try {
      setIsLoading(!append);
      if (append) setLoadingMore(true);

      if (!userId) {
        throw new Error("User not logged in");
      }

      const { data: profileData } = await supabase
        .from("profile")
        .select("id")
        .eq("userId", userId)
        .single();

      if (!profileData) {
        throw new Error("Profile not found");
      }

      const { data: followingData } = await supabase
        .from("followingRel")
        .select("targetId")
        .eq("sourceId", userId);

      const followingUserIds = (await getFollowing(userId)).map(follower => follower.userId);
      const friendUserIds = (await getFriends(userId)).map(friend => friend.userId);
      
      //followingUserIds.push(userId);

      const { data: followingProfiles } = await supabase
        .from("profile")
        .select("id")
        .in("userId", followingUserIds);

      const { data: friendProfiles } = await supabase
        .from("profile")
        .select("id")
        .in("userId", friendUserIds);

      const followingProfileIds = followingProfiles?.map(profile => profile.id) || [];
      const friendProfileIds = friendProfiles?.map(profile => profile.id) || [];

      const from = pageNumber * postsPerPage;
      const to = from + postsPerPage - 1;

      const { data: postsData, error: postsError } = await supabase
      .from("post")
      .select(`
        *,
        profile:profileId (
          username,
          userId,
          name,
          avatar
        )
      `)
      .or(
        `and(privacy.eq.PUBLIC, profileId.neq.${profileData.id}),and(privacy.eq.FOLLOWERS,profileId.in.(${followingProfileIds.join(',')})),and(privacy.eq.FRIENDS,profileId.in.(${friendProfileIds.join(',')}))`
      )
      .order("createdAt", { ascending: false })
      .range(from, to);

      if (postsError) {
        throw postsError;
      }

      setHasMore(postsData.length === postsPerPage);
      
      const postsWithTaggedFriends = await Promise.all(postsData.map(async (post) => {
        if (post.taggedFriends && post.taggedFriends.length > 0) {
          const { data: friendsData, error: friendsError } = await supabase
            .from('profile')
            .select('userId, name, avatar')
            .in('userId', post.taggedFriends);
            
          if (!friendsError && friendsData) {
            return {
              ...post,
              taggedFriendsData: friendsData
            };
          }
        }
        return post;
      }));
      
      if (append) {
        setPosts(prevPosts => [...prevPosts, ...postsWithTaggedFriends]);
      } else {
        setPosts(postsWithTaggedFriends);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  React.useEffect(() => {
    if (session?.user?.id) {
      fetchPosts();
    }
  }, [session?.user?.id]);

  const loadMorePosts = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(0);
    await fetchPosts(0);
    setRefreshing(false);
  }, []);

  const handleLogout = () => {
    setSessionLoading(true);
    signOutUser()
      .then(() => {
        router.replace("/login");
        setSessionLoading(false)
      })
      .catch((error) => {
        console.log(error);
        setSessionLoading(false)
        showErrorToast(toast, error.message);
      });
  };

  const updatePost = async (postId: string, title: string, description: string) => {
    try {
      const { data, error } = await supabase
        .from('post')
        .update({ 
          title, 
          description,
          updatedAt: new Date().toISOString()
        })
        .eq('id', postId)
        .select();
      
      if (error) {
        throw error;
      }
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, title, description, updatedAt: new Date().toISOString() } 
            : post
        )
      );
      
      showSuccessToast(toast, 'Post updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      showErrorToast(toast, 'Failed to update post');
      throw error;
    }
  };

  const isOwnPost = (post: Post) => {
    return post.profile?.userId === userId;
  };

  const asyncStoreExercises = async () => {
    await getExercises().then((exercises) => {
      asyncExercises(exercises);
    });
  }

  asyncStoreExercises();

  return (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Container>
        <View style={styles.header}>
          <Text style={styles.headerTitle} size="xl" bold>
            Workout Feed
          </Text>
        </View>

        {isLoading && !refreshing && (
          <Text style={styles.statusMessage}>Loading posts...</Text>
        )}

        {error && (
          <Text style={styles.statusMessage}>Error loading posts. Pull down to refresh.</Text>
        )}

        {posts && posts.length === 0 && !isLoading && (
          <Text style={styles.statusMessage}>No posts found. Follow some users to see their posts!</Text>
        )}

        {posts && posts.map((post) => (
          <WorkoutPost
            id={post.profile?.userId || ""}
            key={post.id}
            postId={post.id}
            username={post.profile?.username || "Unknown user"}
            name={post.profile?.name || "Unkown user"}
            avatar={post.profile?.avatar || ""}
            date={formatDate(post.createdAt)}
            title={post.title || ""}
            description={post.description || ""}
            exercises={
              post.workoutData?.exercises ? 
                post.workoutData.exercises.map(exercise => {
                    return { 
                      name: exercise.name,
                      sets: exercise.sets,
                      reps: exercise.reps,
                      weight: exercise.weight ? String(exercise.weight) : undefined
                    };
                })
              : []
            }
            workoutDuration={post.workoutData?.duration || undefined}
            workoutCalories={post.workoutData?.calories || undefined}
            userId={userId!}
            comments={post.comments}
            imageUrls={post.images || undefined}
            weighIn={post.weighIn}
            isOwnPost={isOwnPost(post)}
            onUpdatePost={updatePost}
            taggedFriends={post.taggedFriendsData}
            templateId={post.template_id || undefined}
          />
        ))}

        {posts && posts.length > 0 && hasMore && (
          <Button
            onPress={loadMorePosts}
            style={styles.loadMoreButton}
            disabled={loadingMore}
          >
            <ButtonText>{loadingMore ? 'Loading...' : 'Load more posts'}</ButtonText>
            {loadingMore && <ButtonSpinner />}
          </Button>
        )}
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statusMessage: {
    textAlign: "center",
    marginVertical: 20,
    paddingHorizontal: 16,
    color: "#666",
  },
  loadMoreButton: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
});
