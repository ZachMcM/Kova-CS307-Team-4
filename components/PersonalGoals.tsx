import { useCallback, useEffect, useReducer, useState, memo, useMemo } from "react";
import { Alert, AlertIcon, AlertText } from "./ui/alert";
import { Heading } from "./ui/heading";
import { CheckCircleIcon, CheckIcon, CircleIcon, CloseIcon, Icon, InfoIcon } from "./ui/icon";
import { VStack } from "./ui/vstack";
import { Card } from "./ui/card";
import { TouchableOpacity, FlatList } from "react-native";
import { HStack } from "./ui/hstack";
import { formatDate } from "./CommentCard";
import { Text } from "./ui/text";
import { Button, ButtonText } from "./ui/button";
import { updateProfileGoals } from "@/services/profileServices";
import { useToast } from "./ui/toast";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalHeader } from "./ui/modal";
import { Box } from "./ui/box";
import { Input, InputField } from "./ui/input";
import { ExtendedExercise } from "@/types/extended-types";
import ExerciseCard from "./forms/workout-template/ExerciseCard";
import { ScrollView } from "@/components/ui/scroll-view";

// Define reducer actions
const ACTIONS = {
  SET_GOALS: 'SET_GOALS',
  ADD_GOAL: 'ADD_GOAL',
  DELETE_GOAL: 'DELETE_GOAL',
  TOGGLE_GOAL: 'TOGGLE_GOAL',
  SET_PENDING_EDITS: 'SET_PENDING_EDITS',
  RESET_PENDING_EDITS: 'RESET_PENDING_EDITS',
  UPDATE_SEARCH_RESULTS: 'UPDATE_SEARCH_RESULTS',
  SET_SELECTED_EXERCISE: 'SET_SELECTED_EXERCISE',
  UPDATE_INPUT: 'UPDATE_INPUT',
  RESET_FORM: 'RESET_FORM',
  LOAD_MORE_EXERCISES: 'LOAD_MORE_EXERCISES',
  RESET_EXERCISES_AMT: 'RESET_EXERCISES_AMT'
};

// Memoize the ExerciseCard component to prevent unnecessary re-renders
const MemoizedExerciseCard = memo(ExerciseCard);

// Memoize the Goal card to prevent unnecessary re-renders
const GoalCard = memo(({ goal, userId, profileUserId, onDelete, onPress }: any) => (
  <Card variant="outline" className="p-6" key={goal.reps + goal.weight + goal.exercise}>
    {userId === profileUserId && (
      <TouchableOpacity className="absolute top-2 right-2" onPress={() => onDelete(goal)}>
        <Icon as={CloseIcon} className="text-gray-400"></Icon>
      </TouchableOpacity>
    )}
    <HStack className="justify-between flex-row w-full">
      <VStack className="flex-1 flex-shrink">
        <Heading className="flex-wrap">{goal.reps} x {goal.exercise} @ {goal.weight} lbs</Heading>
        <Text>Set on: {formatDate(goal.created)}</Text>
      </VStack>
      <TouchableOpacity onPress={() => onPress(goal)}>
        {goal.progress == 100 ? (
          <Icon as={CheckCircleIcon} className="ml-2 mt-2 text-[#6FA8DC] h-10 w-10" />
        ) : (
          <Icon as={CircleIcon} className="ml-2 mt-2 text-[#6FA8DC] h-10 w-10" />
        )}
      </TouchableOpacity>
    </HStack>
  </Card>
));

export default function PersonalGoals({goals, userId, profileUserId, exercises} : {goals: JSON[], userId: string, profileUserId: string, exercises: ExtendedExercise[]}) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [exercisesModal, setExercisesModal] = useState(false);
  
  // Consolidate related state with useReducer
  const [state, dispatch] = useReducer((state: any, action: any) => {
    switch (action.type) {
      case ACTIONS.SET_GOALS:
        return {
          ...state,
          userGoals: action.payload || []
        };
      case ACTIONS.ADD_GOAL:
        return {
          ...state,
          userGoals: [...state.userGoals, action.payload],
          reps: '',
          weights: '',
          selectedExercise: null,
          pendingEdits: true
        };
      case ACTIONS.DELETE_GOAL:
        return {
          ...state,
          userGoals: state.userGoals.filter((g: any) => g !== action.payload),
          pendingEdits: true
        };
      case ACTIONS.TOGGLE_GOAL:
        return {
          ...state,
          userGoals: state.userGoals.map((g: any) => 
            g === action.payload ? { ...g, progress: g.progress === 100 ? 0 : 100 } : g
          ),
          pendingEdits: true
        };
      case ACTIONS.SET_PENDING_EDITS:
        return {
          ...state,
          pendingEdits: action.payload
        };
      case ACTIONS.RESET_PENDING_EDITS:
        return {
          ...state,
          pendingEdits: false
        };
      case  ACTIONS.UPDATE_SEARCH_RESULTS:
        return {
          ...state,
          searchResult: action.payload.results,
          exercisesResult: action.payload.count
        };
      case ACTIONS.SET_SELECTED_EXERCISE:
        return {
          ...state,
          selectedExercise: action.payload
        };
      case ACTIONS.UPDATE_INPUT:
        return {
          ...state,
          [action.payload.field]: action.payload.value
        };
      case ACTIONS.RESET_FORM:
        return {
          ...state,
          reps: '',
          weights: '',
          selectedExercise: null
        };
      case ACTIONS.LOAD_MORE_EXERCISES:
        return {
          ...state,
          exercisesAmt: state.exercisesAmt + 20
        };
      case ACTIONS.RESET_EXERCISES_AMT:
        return {
          ...state,
          exercisesAmt: 20,
          searchExercise: action.payload || state.searchExercise
        };
      default:
        return state;
    }
  }, {
    userGoals: goals || [],
    reps: '',
    weights: '',
    selectedExercise: null,
    pendingEdits: false,
    searchExercise: '',
    searchResult: [],
    exercisesResult: 0,
    exercisesAmt: 20
  });
  
  // Destructure state for easier access
  const { 
    userGoals, 
    reps, 
    weights, 
    selectedExercise, 
    pendingEdits,
    searchExercise,
    searchResult,
    exercisesResult,
    exercisesAmt
  } = state;
  
  // Calculate derived state
  const goalsLength = userGoals.length;
  const totalExercises = exercises ? exercises.length : 0;
  const canAddMoreGoals = userId === profileUserId && goalsLength < 5;

  // Memoize filterExercises function to prevent recreating on each render
  const filterExercises = useCallback((exercises: ExtendedExercise[], search: string) => {
    if (!exercises || !Array.isArray(exercises)) {
      return { results: [], count: 0 };
    }
    
    try {
      const results = exercises.filter((exercise) => 
        exercise && exercise.name && typeof exercise.name === 'string' && 
        exercise.name.toLowerCase().includes((search || '').toLowerCase())
      );
      
      const count = results ? results.length : 0;
      const safeExercisesAmt = Math.max(1, exercisesAmt || 20);
      
      return {
        results: results.slice(0, safeExercisesAmt),
        count
      };
    } catch (error) {
      console.error("Error in filterExercises:", error);
      return { results: [], count: 0 };
    }
  }, [exercisesAmt]);

  // Effect to update goals when props change
  useEffect(() => {
    dispatch({ type: ACTIONS.SET_GOALS, payload: goals });
  }, [goals]);

  // Effect to update search results when dependencies change
  useEffect(() => {
    // Prevent unnecessary work if modal isn't open
    if (!exercisesModal) return;
    
    // Add debounce to prevent too many updates
    const debounceTimer = setTimeout(() => {
      try {
        const { results, count } = filterExercises(exercises, searchExercise);
        dispatch({ 
          type: ACTIONS.UPDATE_SEARCH_RESULTS, 
          payload: { results, count } 
        });
      } catch (error) {
        console.error("Error filtering exercises:", error);
      }
    }, 100);
    
    // Clean up
    return () => clearTimeout(debounceTimer);
  }, [exercises, exercisesAmt, searchExercise, filterExercises, exercisesModal]);

  const deleteGoal = (goal: JSON) => {
    dispatch({ type: ACTIONS.DELETE_GOAL, payload: goal });
  };

  const handleGoalPress = (goal: JSON) => {
    if (userId === profileUserId) {
      dispatch({ type: ACTIONS.TOGGLE_GOAL, payload: goal });
    }
  };

  const handleSaveGoals = async () => {
    setIsLoading(true);
    
    // Add a small delay to ensure UI updates before the async operation
    await new Promise(resolve => setTimeout(resolve, 50));
    
    try {
      const success = await updateProfileGoals(userId, userGoals);
      
      if (success) {
        dispatch({ type: ACTIONS.RESET_PENDING_EDITS });
        showSuccessToast(toast, "Goals saved successfully!");
      } else {
        dispatch({ type: ACTIONS.SET_PENDING_EDITS, payload: true });
        showErrorToast(toast, "Failed to save goals. Please try again.");
      }
    } catch (error) {
      console.error("Error saving goals:", error);
      dispatch({ type: ACTIONS.SET_PENDING_EDITS, payload: true });
      showErrorToast(toast, "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseNewGoal = () => {
    setIsAdding(false);
    dispatch({ type: ACTIONS.RESET_FORM });
  };

  const handleOpenNewGoal = () => {
    setIsAdding(true);
  };

  const parseInput = (input: string) => {
    const parsed = parseInt(input);
    return isNaN(parsed) ? null : parsed;
  };

  const handleAddGoal = () => {
    if (userId === profileUserId) {
      if (goalsLength < 5) {
        if (!selectedExercise || !selectedExercise.name) {
          showErrorToast(toast, "Please select an exercise.");
          return;
        }
        
        if (!reps || !weights) {
          showErrorToast(toast, "Please fill in all fields.");
          return;
        }
        
        const parsedReps = parseInput(reps);
        const parsedWeights = parseInput(weights);

        if (parsedReps === null || parsedWeights === null) {
          showErrorToast(toast, "Please enter valid numbers for reps and weights.");
          return;
        }

        try {
          const newGoal = {
            exercise: selectedExercise.name,
            reps: parsedReps,
            weight: parsedWeights,
            progress: 0,
            created: new Date().toISOString(),
          };

          dispatch({ type: ACTIONS.ADD_GOAL, payload: newGoal });
          
          // Close the add form after successful addition
          if (isAdding) {
            setIsAdding(false);
          }
        } catch (error) {
          console.error("Error adding goal:", error);
          showErrorToast(toast, "Failed to add goal. Please try again.");
        }
      } else {
        showErrorToast(toast, "You can only add up to 5 personal goals.");
      }
    }
  };

  const handleExerciseSelect = (exercise: ExtendedExercise) => {
    dispatch({ type: ACTIONS.SET_SELECTED_EXERCISE, payload: exercise });
    setExercisesModal(false);
  };

  const handleModalClose = () => {
    setExercisesModal(false);
    dispatch({ type: ACTIONS.RESET_EXERCISES_AMT, payload: '' });
  };

  const handleSearchChange = (text: string) => {
    dispatch({ type: ACTIONS.RESET_EXERCISES_AMT, payload: text });
  };

  const handleLoadMore = () => {
    dispatch({ type: ACTIONS.LOAD_MORE_EXERCISES });
  };

  return (
    <VStack>
      <Heading size="2xl">Personal Goals</Heading>
      {userId === profileUserId && (
        <Text size="sm" className="text-gray-600">You can add up to 5 personal goals.</Text>
      )}
      {userGoals && goalsLength > 0 ? (
        <VStack space="md" className="mt-3">
          {userGoals?.map((goal: any) => (
            <GoalCard 
              key={`${goal.exercise}-${goal.reps}-${goal.weight}-${goal.created}`}
              goal={goal}
              userId={userId}
              profileUserId={profileUserId}
              onDelete={deleteGoal}
              onPress={handleGoalPress}
            />
          ))}
        </VStack>
      ) : (
        <Alert action="muted" variant="solid" className="mt-3">
          <AlertIcon as={InfoIcon} />
          <AlertText>No personal goals</AlertText>
        </Alert>
      )} 
      {canAddMoreGoals && (
        <VStack className="mt-3">
          {isAdding && (
            <Box className="border border-gray-300 rounded-md p-4 mb-3">
              <VStack>
                <Heading size="md" className="mb-2">Add a new goal</Heading>
                <HStack space="lg" className="mb-2">
                  <Input className="border border-gray-300 rounded-md p-2 w-24">
                    <InputField 
                      placeholder="Reps" 
                      keyboardType="numeric" 
                      onChangeText={(text) => dispatch({ 
                        type: ACTIONS.UPDATE_INPUT, 
                        payload: { field: 'reps', value: text } 
                      })} 
                      value={reps}
                    />
                  </Input>
                  <Input className="border border-gray-300 rounded-md p-2 w-24">
                    <InputField 
                      placeholder="Weight" 
                      keyboardType="numeric" 
                      onChangeText={(text) => dispatch({ 
                        type: ACTIONS.UPDATE_INPUT, 
                        payload: { field: 'weights', value: text } 
                      })}
                      value={weights}
                    />
                  </Input>
                  <Button onPress={handleAddGoal} className="pl-8 pr-6">
                    <ButtonText>Create</ButtonText>
                    <Icon as={CheckIcon} className="text-white" />
                  </Button>
                </HStack>
                {selectedExercise && selectedExercise.name && (
                  <Box className="mb-2">
                    <MemoizedExerciseCard exercise={selectedExercise} displayDetails={false} />
                  </Box>
                )}
                <Box className="mb-2">
                  <Button onPress={() => setExercisesModal(true)} className="border-[#6FA8DC] p-1 rounded-md" variant="outline">
                    <ButtonText className="text-[#6FA8DC]">{selectedExercise ? "Select new exercise" : "Select exercise"}</ButtonText>
                  </Button>
                  <Modal isOpen={exercisesModal} onClose={handleModalClose} size="lg">
                    <ModalBackdrop />
                    <ModalContent>
                      <ModalHeader>
                        <Heading size="md">Select an exercise</Heading>
                        <ModalCloseButton>
                          <Icon
                            as={CloseIcon}
                            size="md"
                            className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
                          />
                        </ModalCloseButton>
                      </ModalHeader>
                      <ModalBody>
                        <Input className="border border-gray-300 rounded-md p-2 mb-2">
                          <InputField 
                            placeholder="Search for an exercise" 
                            onChangeText={handleSearchChange}
                          />
                        </Input>
                        {/* Use FlatList instead of ScrollView for better performance */}
                        <Box className="h-[580px]">
                          {searchResult.length > 0 ? (
                            <FlatList
                              data={searchResult}
                              keyExtractor={(item) => item.id || String(Math.random())}
                              initialNumToRender={10}
                              maxToRenderPerBatch={10}
                              windowSize={5}
                              removeClippedSubviews={true}
                              renderItem={({ item }) => (
                                <Box className="p-2">
                                  <TouchableOpacity 
                                    onPress={() => handleExerciseSelect(item)}
                                  >
                                    <ExerciseCard exercise={item} displayDetails={false} />
                                  </TouchableOpacity>
                                </Box>
                              )}
                              onEndReached={exercisesResult > exercisesAmt ? handleLoadMore : undefined}
                              onEndReachedThreshold={0.5}
                              ListEmptyComponent={<Text className="p-4">No exercises found</Text>}
                              ListFooterComponent={
                                exercisesResult > exercisesAmt ? (
                                  <Button onPress={handleLoadMore} className="m-2">
                                    <ButtonText>Load More</ButtonText>
                                  </Button>
                                ) : null
                              }
                            />
                          ) : (
                            <Text className="p-4">No exercises found</Text>
                          )}
                        </Box>
                        {totalExercises > exercisesAmt && (
                          <Text className="text-gray-500 mt-1">
                            Showing {exercisesAmt < exercisesResult ? exercisesAmt : exercisesResult} of {exercisesResult} exercises
                          </Text>
                        )}
                      </ModalBody>
                    </ModalContent>
                  </Modal>
                </Box>
              </VStack>
            </Box>
          )}
        </VStack>
      )}
      <HStack className="items-stretch justify-between flex-row mt-2">
        {userId === profileUserId && !isAdding && goalsLength < 5 ? (
          <Button onPress={handleOpenNewGoal}>
            <ButtonText>+ Add Goal</ButtonText>
          </Button>
        ) : userId === profileUserId && goalsLength < 5 ? (
          <Button className="bg-[#db5b4d]" onPress={handleCloseNewGoal}>
            <ButtonText>- Cancel</ButtonText>
          </Button>
        ) : userId === profileUserId && pendingEdits && (
          <Text></Text>
        )}
        {userId === profileUserId && pendingEdits && (
          <Button 
            className="bg-[#397a2c]" 
            onPress={handleSaveGoals}
            disabled={isLoading}
          >
            <ButtonText>{isLoading ? "Saving..." : "Save"}</ButtonText>
          </Button>
        )}
      </HStack>
    </VStack>
  );
}