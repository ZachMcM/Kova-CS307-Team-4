import { ExercisePoints } from "@/types/competition-types";
import { CompetitionWithGroup } from "@/types/extended-types";
import { useState } from "react";
import { Box } from "../ui/box";
import { Card } from "../ui/card";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";
import { AlertCircleIcon, ArrowDownIcon, ArrowUpIcon, Icon } from "../ui/icon";
import { Input, InputField } from "../ui/input";
import { Pressable } from "../ui/pressable";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

export default function ExercisePointsView({
  competition,
}: {
  competition: CompetitionWithGroup;
}) {
  const exercisePoints: ExercisePoints[] = competition.exercise_points as any;

  const [exerciseQuery, setExerciseQuery] = useState("");
  const [sort, setSort] = useState<"ascending" | "descending">("descending");

  return (
    <VStack space="lg">
      <VStack>
        <Heading size="xl">Exercise Point Values</Heading>
        <Text>See the point values for different exercises</Text>
      </VStack>
      {!exercisePoints || exercisePoints.length <= 0 ? (
        <VStack space="sm" className="flex items-center justify-center">
          <Icon as={AlertCircleIcon} size="xl" />
          <Text className="text-typography-950">
            All exercises have default values (worth 1 pt)
          </Text>
        </VStack>
      ) : (
        <VStack space="md">
          <HStack className="items-center" space="lg">
            <Input variant="outline" size="md" className="flex-1">
              <InputField
                placeholder="Search for a specific exercise"
                value={exerciseQuery}
                onChangeText={setExerciseQuery}
              />
            </Input>
            <Pressable
              onPress={() =>
                setSort(sort == "ascending" ? "descending" : "ascending")
              }
            >
              <HStack className="items-center gap-1">
                <Text className="text-typography-950">Sort</Text>
                <Icon as={sort == "ascending" ? ArrowUpIcon : ArrowDownIcon} />
              </HStack>
            </Pressable>
          </HStack>
          {exercisePoints
            .filter(({ exerciseName }) => exerciseName.includes(exerciseQuery))
            .sort((a, b) =>
              sort == "ascending" ? a.points - b.points : b.points - a.points
            )
            .map(({ exerciseId, exerciseName, points }) => (
              <Card key={exerciseId} variant="outline">
                <HStack className="items-center justify-between">
                  <Heading>{exerciseName}</Heading>
                  <Box className="bg-secondary-400 rounded-full py-1 px-3">
                    <Heading size="sm">{points} pts</Heading>
                  </Box>
                </HStack>
              </Card>
            ))}
        </VStack>
      )}
    </VStack>
  );
}
