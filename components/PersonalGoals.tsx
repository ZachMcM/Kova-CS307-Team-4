import { useEffect, useState } from "react";
import { Alert, AlertIcon, AlertText } from "./ui/alert";
import { Heading } from "./ui/heading";
import { CheckCircleIcon, CheckIcon, CircleIcon, CloseIcon, Icon, InfoIcon } from "./ui/icon";
import { VStack } from "./ui/vstack";
import GoalCard from "./GoalCard";
import { Card } from "./ui/card";
import { TouchableOpacity } from "react-native";
import { HStack } from "./ui/hstack";
import { formatDate } from "./CommentCard";
import { Text } from "./ui/text";
import { Button, ButtonText } from "./ui/button";
import { updateProfileGoals } from "@/services/profileServices";
import { useToast } from "./ui/toast";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { Center } from "./ui/center";
import { set } from "zod";
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalHeader } from "./ui/modal";
import { Box } from "./ui/box";
import { Input, InputField } from "./ui/input";
import { getExercisesFromStorage } from "@/services/asyncStorageServices";
import { ExtendedExercise } from "@/types/extended-types";
import ExerciseCard from "./forms/workout-template/ExerciseCard";
import { ScrollView } from "@/components/ui/scroll-view";
import { parse } from "@babel/core";

export default function PersonalGoals({goals, userId, profileUserId, exercises} : {goals: JSON[], userId: string, profileUserId: string, exercises: ExtendedExercise[]}) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [exercisesModal, setExercisesModal] = useState(false);
  const [reps, setReps] = useState("");
  const [weights, setWeights] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<ExtendedExercise | null>();

  const [exercisesAmt, setExercisesAmt] = useState(20);
  const totalExercises = exercises ? exercises.length : 0;
  const [exercisesResult, setExercisesResult] = useState(0);
  const [searchExercise, setSearchExercise] = useState<string>("");
  const [searchResult, setSearchResult] = useState<ExtendedExercise[]>([]);
  const [pendingEdits, setPendingEdits] = useState(false);

  const [goalsLength, setGoalsLength] = useState(0);
  
  // Parse goals once during initial state setup
  const [userGoals, setUserGoals] = useState<JSON[]>(() => {
    setGoalsLength(goals ? goals.length : 0);
    return goals || [];
  });

  useEffect(() => {
    setUserGoals(goals || []);
    setGoalsLength(goals ? goals.length : 0);
  }, [goals]);

  const deleteGoal = (goal: JSON) => {
    setUserGoals((prevGoals: JSON[]) => prevGoals.filter((g) => g !== goal));
    setGoalsLength(goalsLength - 1);
    setPendingEdits(true);
  }

  const handleGoalPress = (goal: JSON) => {
    if (userId === profileUserId) {
      setPendingEdits(true);
      setUserGoals((prevGoals: JSON[]) => {
        const updatedGoals = prevGoals.map((g: any) => {
          if (g === goal) {
            return { ...g, progress: g.progress === 100 ? 0 : 100 };
          }
          return g;
        });
        return updatedGoals;
      });
    }
  };

  const handleSaveGoals = async () => {
    setPendingEdits(false);
    // Pass userGoals directly, not as a parameter
    const success = await updateProfileGoals(userId, userGoals)
    
    if (success) {
      showSuccessToast(toast, "Goals saved successfully!");
    }
    else {
      setPendingEdits(true);
      showErrorToast(toast, "Failed to save goals. Please try again.");
    }
  };

  const handleCloseNewGoal = () => {
    setIsAdding(false);
  };

  const handleOpenNewGoal = () => {
    setIsAdding(true);
  };

  const filterExercises = (exercises: ExtendedExercise[], search: string) => {
    const results = exercises.filter((exercise) => exercise.name?.toLowerCase().includes(search.toLowerCase()));
    setExercisesResult(results ? results.length : 0);

    return results.slice(0, exercisesAmt);
  }

  useEffect(() => {
    setSearchResult(filterExercises(exercises, searchExercise));
  }, [exercises, exercisesAmt]);

  useEffect(() => {
    setExercisesAmt(20);
    setSearchResult(filterExercises(exercises, searchExercise));
  }, [searchExercise]);

  const parseInput = (input: string) => {
    const parsed = parseInt(input);
    if (isNaN(parsed)) {
      return null;
    }
    return parsed;
  }

  const handleAddGoal = () => {
    if (userId === profileUserId) {
      if (goalsLength < 5) {
        if (selectedExercise && reps && weights) {
          console.log("1");
          const parsedReps = parseInput(reps);
          const parsedWeights = parseInput(weights);

          if (parsedReps === null || parsedWeights === null) {
            showErrorToast(toast, "Please enter valid numbers for reps and weights.");
            return;
          }

          console.log("2");
          const newGoal = {
            exercise: selectedExercise.name,
            reps: parsedReps,
            weight: parsedWeights,
            progress: 0,
            created: new Date().toISOString(),
          };

          console.log("3");
          setUserGoals((prevGoals: any) => [...(prevGoals || []), newGoal]);
          setGoalsLength(goalsLength + 1);
          setReps("");
          setWeights("");
          setSelectedExercise(null);
          setPendingEdits(true);
          console.log("4");
        } else {
          showErrorToast(toast, "Please fill in all fields.");
        }
      } else {
        showErrorToast(toast, "You can only add up to 5 personal goals.");
      }
    }
  };

  return (
    <VStack>
      <Heading size="2xl">Personal Goals</Heading>
      {userId === profileUserId && (
        <Text size = "sm" className="text-gray-600">You can add up to 5 personal goals.</Text>
      )}
      {userGoals && goalsLength > 0 ? (
        <VStack space="md" className = "mt-3">
          {userGoals?.map((goal: any) => (
            <Card variant="outline" className="p-6" key = {goal.reps + goal.weight + goal.exercise}>
              {userId === profileUserId && (
                <TouchableOpacity className = "absolute top-2 right-2" onPress = {() => deleteGoal(goal)}>
                  <Icon as={CloseIcon} className = "text-gray-400"></Icon>
                </TouchableOpacity>
              )}
              <HStack className="justify-between flex-row w-full">
                <VStack className="flex-1 flex-shrink">
                  <Heading className="flex-wrap">{goal.reps} x {goal.exercise} @ {goal.weight} lbs</Heading>
                  <Text>Set on: {formatDate(goal.created)}</Text>
                </VStack>
                <TouchableOpacity onPress={() => {handleGoalPress(goal)}}>
                  {goal.progress == 100 ? (
                    <Icon as={CheckCircleIcon} className="ml-2 mt-2 text-[#6FA8DC] h-10 w-10" />
                  ) : (
                    <Icon as={CircleIcon} className="ml-2 mt-2 text-[#6FA8DC] h-10 w-10" />
                  )}
                </TouchableOpacity>
              </HStack>
            </Card>
          ))}
        </VStack>
      ) : (
        <Alert action="muted" variant="solid" className = "mt-3">
          <AlertIcon as={InfoIcon} />
          <AlertText>No personal goals</AlertText>
        </Alert>
      )} 
      {userId === profileUserId && goalsLength < 5 && (
        <VStack className = "mt-3">
          {isAdding && (
            <Box className = "border border-gray-300 rounded-md p-4 mb-3">
              <VStack>
                <Heading size = "md" className = "mb-2">Add a new goal</Heading>
                <HStack space = "lg" className = "mb-2">
                  <Input className="border border-gray-300 rounded-md p-2 w-24">
                    <InputField placeholder="Reps" keyboardType="numeric" onChangeText={(text) => setReps(text)} value={reps}/>
                  </Input>
                  <Input className="border border-gray-300 rounded-md p-2 w-24">
                    <InputField placeholder="Weight" keyboardType="numeric" onChangeText={(text) => setWeights(text)} value={weights}/>
                  </Input>
                  <Button onPress = {handleAddGoal} className = "pl-8 pr-6">
                    <ButtonText>Create</ButtonText>
                    <Icon as={CheckIcon} className = "text-white" />
                  </Button>
                </HStack>
                {selectedExercise && selectedExercise.name && (
                  <Box className = "mb-2">
                    <ExerciseCard exercise={selectedExercise} displayDetails={false} />
                  </Box>
                )}
                <Box className = "mb-2">
                  <Button onPress = {() => setExercisesModal(true)} className = "border-[#6FA8DC] p-1 rounded-md" variant="outline">
                    <ButtonText className = "text-[#6FA8DC]">{selectedExercise ? "Select new exercise" : "Select exercise"}</ButtonText>
                  </Button>
                  <Modal isOpen={exercisesModal} onClose={() => {
                    setExercisesModal(false)
                    setExercisesAmt(20);
                    setSearchExercise("");
                    }} size = "lg">
                    <ModalBackdrop />
                    <ModalContent>
                      <ModalHeader>
                        <Heading size = "md">Select an exercise</Heading>
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
                          <InputField placeholder="Search for an exercise" onChangeText={(text) => setSearchExercise(text)}/>
                        </Input>
                        <ScrollView className = "h-[580px]">
                          <VStack space = "md" className = "p-2">
                            {searchResult.map((exercise: ExtendedExercise) => (
                              <TouchableOpacity key = {exercise.id} onPress = {() => {
                                setSelectedExercise(exercise);
                                setExercisesModal(false);
                              }}>
                                <ExerciseCard key={exercise.id} exercise={exercise} displayDetails={false} />
                              </TouchableOpacity>
                            ))}
                            {exercisesResult > exercisesAmt && (
                              <Button onPress = {() => {setExercisesAmt(exercisesAmt + 20)}}>
                                <ButtonText>More</ButtonText>
                              </Button>
                            )}

                          </VStack>
                        </ScrollView>
                        {totalExercises > exercisesAmt && (
                          <Text className = "text-gray-500 mt-1">Showing {exercisesAmt < exercisesResult ? exercisesAmt : exercisesResult} of {exercisesResult} exercises</Text>
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
          <Button onPress = {handleOpenNewGoal}>
            <ButtonText>+ Add Goal</ButtonText>
          </Button>
        ) : userId === profileUserId && goalsLength < 5 ? (
          <Button className = "bg-[#db5b4d]" onPress = {handleCloseNewGoal}>
            <ButtonText>- Cancel</ButtonText>
          </Button>
        ) : userId === profileUserId && pendingEdits && (
          <Text></Text>
        )}
        {userId === profileUserId && pendingEdits && (
          <Button className = "bg-[#397a2c]" onPress = {handleSaveGoals}>
            <ButtonText>Save</ButtonText>
          </Button>
        )}
      </HStack>
    </VStack>
  );
}
