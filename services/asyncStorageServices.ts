import { Workout } from "@/types/workout-types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// we start workout button is clicked we add the workout to local storage
export async function startWorkout(workout: Workout) {
  try {
    const jsonValue = JSON.stringify(workout)
    await AsyncStorage.setItem("live-workout", jsonValue)
  } catch (e) {
    console.log(e)
    throw new Error("Error starting workout")
  }
}

// just wrapping startWorkout as update workout since they have the same underlying functionalities
export const updateWorkout = async (workout: Workout) => {startWorkout(workout)}

// checks if we have a live workout
export async function getWorkout(): Promise<Workout | null> {
  try {
    const stringVal = await AsyncStorage.getItem("live-workout")
    if (stringVal == null) {
      return null
    }
    const workout = JSON.parse(stringVal)
    console.log(workout)
    return workout
  } catch (e) {
    console.log(e)
    return null
  }
}

export async function setWorkoutEndTime(endTime: number) {
  try {
    const currentWorkout = await getWorkout()
    if (currentWorkout == null) {
      throw new Error("No workout to end")
    }
    currentWorkout.endTime = endTime
    const jsonValue = JSON.stringify(currentWorkout)
    await AsyncStorage.setItem("live-workout", jsonValue)
  }
  catch (e) {
    console.log(e)
    throw new Error("Error ending workout")
  }
}

// clears the workout once its finished

export async function clearWorkout() {
  await AsyncStorage.clear()
}