import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Exercise } from "@/components/WorkoutPost";
import { Box } from "@/components/ui/box";
import { Ionicons } from "@expo/vector-icons";
import { Post } from '@/app/(tabs)/feed';
import { postStyles } from '@/app/(tabs)/post';

type WorkoutHeaderProps = {
  duration: string,
  dateTime?: string,
}

export const WorkoutHeader = ({
  duration,
  dateTime,
}: WorkoutHeaderProps) => {
  return (
    <View style={postStyles.workoutDataContainer}>
      {dateTime ? (
        <Text size='sm' bold style={postStyles.sectionTitle}>Workout On {dateTime}</Text>
      ) : (
        <Text size='sm' bold style={postStyles.sectionTitle}>Workout</Text>
      )}
        <Text size='sm' bold style={postStyles.summaryItem}>Duration: {duration}</Text>
    </View>
  )
}

type SummaryWorkoutDataProps = {
    workoutData: any;
    date?: string;
}

export const SummaryWorkoutData = ({
    workoutData,
    date,
}: SummaryWorkoutDataProps) => {
  return (
    <View style={postStyles.workoutDataContainer}>
      <VStack>
        {date ? (
          <Text size="md" bold style={postStyles.sectionTitle}>Workout Summary for {date}</Text>
        ) : (
          <Text size="sm" bold style={postStyles.sectionTitle}>Workout Summary</Text>
        )}
      </VStack>
      
      <HStack style={postStyles.workoutSummary} space="lg">
        <VStack style={postStyles.summaryItem}>
          <Text size="xs">Duration</Text>
          <Text size="sm" bold>{workoutData.duration}</Text>
        </VStack>
        <VStack style={postStyles.summaryItem}>
          <Text size="xs">Calories</Text>
          <Text size="sm" bold>{workoutData.calories}</Text>
        </VStack>
      </HStack>

      <Text size="sm" bold style={postStyles.exercisesTitle}>Exercises</Text>
      {workoutData.exercises.map((exercise: { name: string; sets: number; reps: number; weight: string }, index: number) => (
        <View key={index} style={postStyles.exerciseItem}>
          <Text size="sm" bold>{exercise.name}</Text>
          <Text size="xs">{exercise.sets} sets × {exercise.reps} reps • {exercise.weight}</Text>
        </View>
      ))}
    </View>
  );
}

type DetailedWorkoutDataProps = {
    post: Post;
}

export const DetailedWorkoutData = ({
    post,
}: DetailedWorkoutDataProps) => {
  return (
    post.workoutData?.exercises && post.workoutData?.exercises?.length > 0 && (
      <VStack>
        <Text size="lg" bold>
          Exercise Details
        </Text>
        <HStack space = "xs" className = "h-16 w-full mb-2 mt-2 border border-gray-300 rounded">
          {post.workoutData?.duration && (
            <Box className="flex-1 h-full justify-center items-center">
              <Text size="md">Duration</Text>
              <HStack space = "xs">
                <Text size = "lg" bold>{post.workoutData.duration}</Text>
              </HStack>
            </Box>
          )}
          {post.workoutData?.calories && (
            <Box className="flex-1 h-full justify-center items-center">
              <Text size="md">Calories</Text>
              <HStack>
                <Text size = "lg" bold>{post.workoutData.calories}</Text>
                <Ionicons name="flame-outline" size={22} color="#FF9500"/>
              </HStack>
            </Box>
          )}
          {post.weighIn && (
            <Box className="flex-1 h-full justify-center items-center">
              <Text size="md">Weigh-In</Text>
              <HStack>
                <Text size = "lg" bold>{post.weighIn} lbs</Text>
              </HStack>
            </Box>
          )}
        </HStack>
        {post.workoutData.exercises.reduce((rows, exercise, index) => {
          if (index % 2 === 0) {
            rows.push([exercise]);
          } else {
            rows[rows.length - 1].push(exercise);
          }
          return rows;
        }, [] as Exercise[][]).map((row, rowIndex) => (
          <HStack key={rowIndex} space="xs" className="w-full mb-2">
            {row.map((exercise, index) => (
              <Box key={index} className="flex-1 rounded border border-gray-300 p-2">
                <Text className="font-bold">{exercise.name}</Text>
                <View>
                  {exercise.sets !== undefined && (
                    <Text>
                      <Text>Sets: </Text>
                      <Text>{String(exercise.sets)}</Text>
                    </Text>
                  )}
                  {exercise.reps !== undefined && (
                    <Text>
                      <Text>Reps: </Text>
                      <Text>{String(exercise.reps)}</Text>
                    </Text>
                  )}
                  {exercise.weight && (
                    <Text>
                      <Text>Weight: </Text>
                      <Text>{exercise.weight}</Text>
                    </Text>
                  )}
                </View>
              </Box>
            ))}
            {/* Add an empty box if there is only one exercise in the row */}
            {row.length === 1 && <Box className="flex-1 p-2" />}
          </HStack>
        ))}
      </VStack>
    )
  )
} 