import { Card } from "./ui/card";
import { VStack } from "./ui/vstack";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { CheckCircleIcon, CircleIcon, CloseIcon, Icon } from "./ui/icon";
import { Progress, ProgressFilledTrack } from "./ui/progress";
import { Text } from "./ui/text";
import { formatDate } from "./CommentCard";
import { TouchableOpacity } from "react-native";


export default function GoalCard ({goal, removeFunction}: {goal: any, removeFunction: any}) {
  console.log(goal);

  return (
    <Card variant="outline" className="p-6">
      <TouchableOpacity className = "absolute top-2 right-2" onPress={removeFunction(goal)}>
        <Icon as={CloseIcon} className = "text-gray-400"></Icon>
      </TouchableOpacity>
      <HStack className = "justify-between flex-row">
        <VStack>
          <Heading>{goal.reps} x {goal.exercise} @ {goal.weight}</Heading>
          <Text>Set on: {formatDate(goal.created)}</Text>
        </VStack>
        {goal.progress > 10 ? (
          <Icon as={CheckCircleIcon} className="ml-2 mt-2 text-[#6FA8DC] h-10 w-10" />
        ) : (
          <Icon as={CircleIcon} className="ml-2 mt-2 text-[#6FA8DC] h-10 w-10" />
        )}
      </HStack>
    </Card>
  );
}
