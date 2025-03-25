import { getGroups } from "@/services/groupServices";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";

export default function GroupView () {
    const { userId } = useLocalSearchParams();

    const { data: groups, isPending } = useQuery({
      queryKey: ["users", userId],
      queryFn: async () => {
        // TODO implement db call
        const groups = (await getGroups(id as string)) || null;
        return groups;
      },
    });

    return {<Input size="md">
            <InputField
              placeholder="Search exercises"
              onChangeText={setExerciseQuery}
              value={exerciseQuery}
            />
            <InputSlot className="p-3">
              <InputIcon as={SearchIcon} />
            </InputSlot>
          </Input>

          {exerciseQuery.length != 0 &&
            allExercises
              .sort((a: ExtendedExercise, b: ExtendedExercise) => {
                let aSearch = searchItems![searchIdToIndex!.get(a.id)!];
                let bSearch = searchItems![searchIdToIndex!.get(b.id)!];
                let diff = compareToTaggedQuery(exerciseQuery, bSearch,
                  wordCounter!, tagCounter!, []) 
                    - compareToTaggedQuery(exerciseQuery, aSearch,
                      wordCounter!, tagCounter!, []);
                return diff;
              })
              .map((exercise) => (
                <Pressable
                  key={exercise.id}
                  onPress={() => {
                    setExerciseQuery("");
                    addExercise({
                      info: {
                        name: exercise.name!,
                        id: exercise.id,
                      },
                      sets: [
                        {
                          reps: 0,
                          weight: 0,
                        },
                      ],
                    });
                  }}
                  className="flex flex-1"
                >
                  <ExerciseCard exercise={exercise} />
                </Pressable>
              ))}};
}