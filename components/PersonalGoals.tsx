import { useState } from "react";
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

export default function PersonalGoals({goals, userId, profileUserId} : {goals: string, userId: string, profileUserId: string}) {
  console.log("User goals:", goals);

  const stringifiedGoals = JSON.stringify(goals);
  
  const [userGoals, setUserGoals] = useState<any[]>(() => {
    try {
      return JSON.parse(stringifiedGoals);
    }
    catch (error) {
      console.error("Error parsing user goals:", error);
      return [];
    }
  });

  const deleteGoal = (goal: any) => {
    setUserGoals((prevGoals) => prevGoals.filter((g) => g !== goal));
  }

  const handleGoalPress = (goal: any) => {
    setUserGoals((prevGoals) => {
      const updatedGoals = prevGoals.map((g) => {
        if (g === goal) {
          return { ...g, progress: g.progress === 100 ? 0 : 100 };
        }
        return g;
      });
      return updatedGoals;
    });
  };

  return (
    <VStack>
      <Heading size="2xl">Personal Goals</Heading>
      {userId === profileUserId && (
        <Text size = "sm" className="text-gray-600">You can add up to 5 personal goals.</Text>
      )}
      {userGoals && userGoals.length > 0 ? (
        <VStack space="md" className = "mt-3 mb-3">
          {userGoals.map((goal) => (
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
        <Alert action="muted" variant="solid" className = "mt-3 mb-3">
          <AlertIcon as={InfoIcon} />
          <AlertText>No personal goals</AlertText>
        </Alert>
      )}
      {userId === profileUserId && goals.length < 5 && (
        <VStack>
          <HStack className="items-stretch justify-between flex-row">
            <Button onPress = {() => {updateProfileGoals(userId, JSON.stringify(userGoals))}}>
              <ButtonText>+ Add Goal</ButtonText>
            </Button>
            <Button className = "bg-[#397a2c]" onPress = {() => {updateProfileGoals(userId, JSON.stringify(userGoals))}}>
              <ButtonText>Save</ButtonText>
            </Button>
          </HStack>
        </VStack>
      )}
    </VStack>
  );
}
