import { getProfileGroupRel } from "@/services/groupServices";
import { ExercisePoints } from "@/types/event-types";
import { EventWithGroup } from "@/types/extended-types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSession } from "../SessionContext";
import { Alert, AlertIcon, AlertText } from "../ui/alert";
import { Box } from "../ui/box";
import { Card } from "../ui/card";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  Icon,
  InfoIcon,
} from "../ui/icon";
import { Input, InputField } from "../ui/input";
import { Pressable } from "../ui/pressable";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import { getExercises } from "@/services/exerciseServices";
import EditExercisePoints from "./EditExercisePoints";

export default function ExercisePointsView({
  event,
}: {
  event: EventWithGroup;
}) {
  const exercisePoints: ExercisePoints[] = event.exercise_points as any;

  const [exerciseQuery, setExerciseQuery] = useState("");
  const [sort, setSort] = useState<"ascending" | "descending">("descending");

  const { session } = useSession();

  const { data: groupRel } = useQuery({
    queryKey: ["group", { id: event.id }],
    queryFn: async () => {
      const groupRel = await getProfileGroupRel(
        session?.user.user_metadata.profileId,
        event?.groupId!
      );
      return groupRel;
    },
  });

  const { data: allExercises } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const exercises = await getExercises();
      return exercises;
    },
  });

  const [editPointValues, setEditPointValues] = useState(false);

  return (
    <VStack space="lg">
      <HStack className="items-center justify-between">
        <VStack>
          <Heading size="xl">Exercise Point Values</Heading>
          <Text>
            {editPointValues ? "Edit" : "View"} the point values for different
            exercises
          </Text>
        </VStack>
        {allExercises != undefined && !editPointValues && groupRel?.role == "owner" && (
          <Pressable
            onPress={() => {
              setEditPointValues(true);
            }}
          >
            <Icon size="xl" as={EditIcon} />
          </Pressable>
        )}
      </HStack>
      {editPointValues ? (
        <EditExercisePoints
          event={event}
          setEditPointValues={setEditPointValues}
          allExercises={allExercises!}
        />
      ) : !exercisePoints || exercisePoints.length <= 0 ? (
        <Alert action="muted" variant="solid">
          <AlertIcon as={InfoIcon} />
          <AlertText>All exercises have default values (worth 1 pt)</AlertText>
        </Alert>
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
