import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import Container from '@/components/Container';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/components/SessionContext';
import { getFriends } from '@/services/profileServices';
import { useQuery } from '@tanstack/react-query';
import { Checkbox, CheckboxIndicator, CheckboxLabel, CheckboxIcon } from '@/components/ui/checkbox';
import { CheckIcon } from '@/components/ui/icon';
import { Avatar, AvatarImage, AvatarFallbackText } from '@/components/ui/avatar';

const defaultWorkoutData = {
  duration: '0 minutes',
  calories: '0 kcal',
  exercises: []
};

export default function PostScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [includeWorkoutData, setIncludeWorkoutData] = useState(true);
  const [workoutData, setWorkoutData] = useState<any>(defaultWorkoutData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const [friendSearch, setFriendSearch] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  
  const { session } = useSession();
  const userId = session?.user?.id || null;
  
  const params = useLocalSearchParams();
  
  const { data: friends, isLoading: isLoadingFriends } = useQuery({
    queryKey: ["friends", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await getFriends(userId);
    },
    enabled: !!userId,
  });

  useEffect(() => {

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log("Direct Supabase user ID:", data.session.user.id);
      } else {
        console.log("No active session found directly from Supabase");
      }
    };
    
    checkSession();
    
    const workoutDataParam = params.workoutData || (params.params && JSON.parse(params.params as string).workoutData);
    
    if (workoutDataParam) {
      try {
        const parsedData = JSON.parse(workoutDataParam as string);
        const processedWorkoutData = {
          duration: parsedData.duration || '0 minutes',
          calories: '0 kcal',
          exercises: []
        };
        
        if (parsedData.stats) {
          if (typeof parsedData.stats.totalReps === 'number') {
            processedWorkoutData.calories = `${Math.round(parsedData.stats.totalReps * 0.5)} kcal`;
          }
        }
        
        if (parsedData.exercises && Array.isArray(parsedData.exercises)) {
          processedWorkoutData.exercises = parsedData.exercises.map((exercise: any) => {
            let totalReps = 0;
            let lastWeight = 0;
            
            if (Array.isArray(exercise.sets)) {
              totalReps = exercise.sets.reduce((acc: number, set: any) => {
                if (set.weight) lastWeight = set.weight;
                return acc + (set.reps || 0);
              }, 0);
            }
            
            return {
              name: exercise.info?.name || 'Unknown Exercise',
              sets: Array.isArray(exercise.sets) ? exercise.sets.length : 0,
              reps: totalReps,
              weight: `${lastWeight} lbs`
            };
          });
        }
        
        setWorkoutData(processedWorkoutData);
        setIncludeWorkoutData(true);
        
        if (parsedData.exercises && Array.isArray(parsedData.exercises) && parsedData.exercises.length > 0) {
          try {
            const exerciseNames = parsedData.exercises
              .filter((ex: any) => ex.info && ex.info.name)
              .map((ex: any) => ex.info.name)
              .slice(0, 2);
            
            if (exerciseNames.length > 0) {
              setTitle(`${exerciseNames.join(' & ')} Workout`);
            } else {
              setTitle('My Workout');
            }
          } catch (titleError) {
            console.error('Error generating title:', titleError);
            setTitle('My Workout');
          }
        } else {
          setTitle('My Workout');
        }
      } catch (error) {
        console.error('Error parsing workout data:', error);
        setWorkoutData(defaultWorkoutData);
        setTitle('My Workout');
      }
    } else {
      setWorkoutData(defaultWorkoutData);
    }
  }, [session, userId, params.workoutData]);

  const toggleFriend = (friendId: string) => {
    setTaggedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  const validateText = (text: string): boolean => {
    const illegalCharactersRegex = /[<>{}[\]\\^~|`]/g;
    return !illegalCharactersRegex.test(text);
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (!validateText(text)) {
      setTitleError('Title contains illegal characters');
    } else {
      setTitleError('');
    }
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    if (!validateText(text)) {
      setDescriptionError('Description contains illegal characters');
    } else {
      setDescriptionError('');
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    const illegalCharactersRegex = /[<>{}[\]\\^~|`]/g;
    
    if (illegalCharactersRegex.test(title)) {
      Alert.alert(
        "Invalid Title",
        "Your title contains illegal characters. Please remove special characters like < > { } [ ] \\ ^ ~ | `"
      );
      return;
    }
    
    if (illegalCharactersRegex.test(description)) {
      Alert.alert(
        "Invalid Description",
        "Your description contains illegal characters. Please remove special characters like < > { } [ ] \\ ^ ~ | `"
      );
      return;
    }
    
    if (!title.trim()) {
      Alert.alert(
        "Missing Title",
        "Please enter a title for your post"
      );
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("User ID from session:", userId);
      if (!userId) {
        throw new Error('You must be logged in to create a post');
      }
    
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("id")
        .eq("userId", userId)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error(`Failed to get profile: ${profileError.message}`);
      }
      
      if (!profileData) {
        throw new Error('Profile not found for the current user');
      }
      
      const profileId = profileData.id;
      
      const postData = {
        profileId: profileId,
        title,
        description,
        location: location || null,
        isPublic: isPublic,
        imageUrl: null,
        workoutData: includeWorkoutData ? workoutData : null,
        taggedFriends: taggedFriends.length > 0 ? taggedFriends : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('post')
        .insert(postData)
        .select();
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log('Post created successfully:', data);

      Alert.alert(
        "Post Created",
        "Your workout has been posted successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              router.push('/(tabs)/feed');
            }
          }
        ]
      );
      
      setTitle('');
      setDescription('');
      setLocation('');
      setIsPublic(true);
      setIncludeWorkoutData(true);
      setWorkoutData(defaultWorkoutData);
      setTaggedFriends([]);
      
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert(
        "Error",
        `Failed to create post: ${error.message || 'Unknown error'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFriends = friends?.filter(friend => 
    friend.name.toLowerCase().includes(friendSearch.toLowerCase())
  ) || [];

  return (
    <ScrollView style={styles.scrollView}>
      <Container>
        <View style={styles.header}>
          <Text style={styles.headerTitle} size="xl" bold>Create Post</Text>
        </View>

        <VStack space="md" style={styles.formContainer}>
          <VStack space="xs">
            <Text size="sm" bold>Title</Text>
            <Input variant="outline" isInvalid={!!titleError}>
              <InputField
                placeholder="Enter a title for your post"
                value={title}
                onChangeText={handleTitleChange}
              />
            </Input>
            {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
          </VStack>

          <VStack space="xs">
            <Text size="sm" bold>Description</Text>
            <Textarea isInvalid={!!descriptionError}>
              <TextareaInput
                placeholder="Share details about your workout..."
                value={description}
                onChangeText={handleDescriptionChange}
              />
            </Textarea>
            {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}
          </VStack>

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

          {includeWorkoutData && (
            <View style={styles.workoutDataContainer}>
              <Text size="sm" bold style={styles.sectionTitle}>Workout Summary</Text>
              
              <HStack style={styles.workoutSummary} space="lg">
                <VStack style={styles.summaryItem}>
                  <Text size="xs">Duration</Text>
                  <Text size="sm" bold>{workoutData.duration}</Text>
                </VStack>
                <VStack style={styles.summaryItem}>
                  <Text size="xs">Calories</Text>
                  <Text size="sm" bold>{workoutData.calories}</Text>
                </VStack>
              </HStack>

              <Text size="sm" bold style={styles.exercisesTitle}>Exercises</Text>
              {workoutData.exercises.map((exercise: { name: string; sets: number; reps: number; weight: string }, index: number) => (
                <View key={index} style={styles.exerciseItem}>
                  <Text size="sm" bold>{exercise.name}</Text>
                  <Text size="xs">{exercise.sets} sets × {exercise.reps} reps • {exercise.weight}</Text>
                </View>
              ))}
            </View>
          )}

          <VStack space="xs">
            <HStack style={styles.toggleContainer} space="md">
              <Text size="sm" bold>Tag Friends</Text>
              <Button 
                size="sm" 
                variant="outline" 
                onPress={() => setShowFriendSelector(!showFriendSelector)}
              >
                <Text>{showFriendSelector ? 'Hide' : 'Select Friends'}</Text>
              </Button>
            </HStack>
            
            {taggedFriends.length > 0 && (
              <HStack style={styles.selectedFriendsContainer} space="sm" className="flex-wrap">
                {taggedFriends.map(friendId => {
                  const friend = friends?.find(f => f.userId === friendId);
                  return friend ? (
                    <HStack key={friendId} style={styles.selectedFriendChip} space="xs" className="items-center">
                      <Avatar size="xs">
                        {friend.avatar ? (
                          <AvatarImage source={{ uri: friend.avatar }} />
                        ) : (
                          <AvatarFallbackText>{friend.name}</AvatarFallbackText>
                        )}
                      </Avatar>
                      <Text size="xs">{friend.name}</Text>
                      <TouchableOpacity onPress={() => toggleFriend(friendId)}>
                        <Ionicons name="close-circle" size={16} color="#666" />
                      </TouchableOpacity>
                    </HStack>
                  ) : null;
                })}
              </HStack>
            )}
            
            {showFriendSelector && (
              <VStack style={styles.friendSelectorContainer} space="sm">
                <Input variant="outline">
                  <InputField
                    placeholder="Search friends..."
                    value={friendSearch}
                    onChangeText={setFriendSearch}
                  />
                </Input>
                
                {isLoadingFriends ? (
                  <Text>Loading friends...</Text>
                ) : filteredFriends.length === 0 ? (
                  <Text>No friends found</Text>
                ) : (
                  <ScrollView style={styles.friendsList} nestedScrollEnabled={true}>
                    {filteredFriends.map(friend => (
                      <HStack key={friend.userId} style={styles.friendItem} space="md" className="items-center">
                        <Checkbox 
                          value="checked"
                          isChecked={taggedFriends.includes(friend.userId)}
                          onChange={() => toggleFriend(friend.userId)}
                        >
                          <CheckboxIndicator>
                            <CheckboxIcon as={CheckIcon} />
                          </CheckboxIndicator>
                        </Checkbox>
                        <Avatar size="sm">
                          {friend.avatar ? (
                            <AvatarImage source={{ uri: friend.avatar }} />
                          ) : (
                            <AvatarFallbackText>{friend.name}</AvatarFallbackText>
                          )}
                        </Avatar>
                        <Text>{friend.name}</Text>
                      </HStack>
                    ))}
                  </ScrollView>
                )}
              </VStack>
            )}
          </VStack>

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

          <Button
            size="lg"
            action="kova"
            variant="solid"
            onPress={handleSubmit}
            isDisabled={isSubmitting || !!titleError || !!descriptionError}
            style={styles.submitButton}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText} bold>
              {isSubmitting ? 'Posting...' : 'Post Workout'}
            </Text>
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
  friendSelectorContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 8,
  },
  friendsList: {
    maxHeight: 200,
  },
  friendItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedFriendsContainer: {
    marginTop: 8,
  },
  selectedFriendChip: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    marginRight: 8,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 12,
    marginTop: 2,
  },
});


