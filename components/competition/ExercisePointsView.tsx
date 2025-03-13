import { CompetitionWithGroup } from "@/types/extended-types";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import { ExercisePoints } from "@/types/competition-types";
import { AlertCircleIcon, Icon } from "../ui/icon";
import { Card } from "../ui/card";
import { HStack } from "../ui/hstack";
import { Box } from "../ui/box";

export default function ExercisePointsView({
  competition,
}: {
  competition: CompetitionWithGroup;
}) {
  const exercisePoints: ExercisePoints[] = competition.exercise_points as any

  return (
    <VStack space="lg">
      <VStack>
        <Heading size="xl">Exercise Point Values</Heading>
        <Text>See the point values for different exercises</Text>
      </VStack>
      {
        !exercisePoints || exercisePoints.length <= 0 ? 
        <VStack space="sm" className="flex items-center justify-center">
          <Icon as={AlertCircleIcon} size="xl"/>
          <Text className="text-typography-950">No configured point values</Text>
        </VStack> : 
        <VStack space="md">
          {
            exercisePoints.map(({ exerciseId, exerciseName, points }) => (
              <Card key={exerciseId} variant="outline">
                <HStack className="items-center justify-between">
                  <Heading>{exerciseName}</Heading>
                  <Box className="bg-secondary-300 rounded-full py-1 px-3">
                    <Heading size="sm">{points} pts</Heading>
                  </Box>
                </HStack>
              </Card>
            ))
          }
        </VStack>
      }
    </VStack>
  );
}
