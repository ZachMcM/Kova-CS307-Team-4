import { useEffect, useState } from "react";
import { Alert, AlertIcon, AlertText } from "./ui/alert";
import { Heading } from "./ui/heading";
import { CheckCircleIcon, CircleIcon, CloseIcon, Icon, InfoIcon } from "./ui/icon";
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

export default function PersonalGoals({goals, userId, profileUserId} : {goals: JSON[], userId: string, profileUserId: string}) {
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);
  
  // Parse goals once during initial state setup
  const [userGoals, setUserGoals] = useState<JSON[]>(() => {
    return goals;
  });

  useEffect(() => {
    setUserGoals(goals);
  }, [goals]);

  const deleteGoal = (goal: JSON) => {
    setUserGoals((prevGoals: JSON[]) => prevGoals.filter((g) => g !== goal));
  }

  const handleGoalPress = (goal: JSON) => {
    if (userId === profileUserId) {
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
    // Pass userGoals directly, not as a parameter
    const success = await updateProfileGoals(userId, userGoals)
    
    if (success) {
      showSuccessToast(toast, "Goals saved successfully!");
    }
    else {
      showErrorToast(toast, "Failed to save goals. Please try again.");
    }
  };

  return (
    <VStack>
      <Heading size="2xl">Personal Goals</Heading>
      {userId === profileUserId && (
        <Text size = "sm" className="text-gray-600">You can add up to 5 personal goals.</Text>
      )}
      {userGoals && userGoals.length > 0 ? (
        <VStack space="md" className = "mt-3">
          {userGoals.map((goal: any) => (
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
      {userId === profileUserId && goals.length < 5 && (
        <VStack className = "mt-3">
          <HStack className="items-stretch justify-between flex-row">
            {!isAdding ? (
              <Button onPress = {() => {}}>
                <ButtonText>+ Add Goal</ButtonText>
              </Button>
            ) : (
              <Button onPress = {() => {}}>
                <ButtonText>Create Goal</ButtonText>
              </Button>
            )}
            <Button className = "bg-[#397a2c]" onPress = {handleSaveGoals}>
              <ButtonText>Save</ButtonText>
            </Button>
          </HStack>
        </VStack>
      )}
    </VStack>
  );
}
