import { Workout } from "@/types/workout-types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// we start workout button is clicked we add the workout to local storage
export async function startWorkout(workout: Workout) {
  try {
    const jsonValue = JSON.stringify(workout)
    await AsyncStorage.setItem("live-workout", jsonValue)
  } catch (e) {
    console.log(e)
    return new Error("Error starting workout")
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
    return JSON.parse(stringVal)
  } catch (e) {
    console.log(e)
    return null
  }
}

// clears the workout once its finished

export async function clearWorkout() {
  await AsyncStorage.clear()
}

//Logs in the user and saves that state to async storage
export async function loginUser(email:string, password:string) {
    const test_data = [{
        email: "admin",
        password: "admin",
    }];
    try {
        if (test_data.includes({email, password})) {
            await AsyncStorage.setItem("logged-in", "true")
            console.log("User " + email + " has logged in")
            return AsyncStorage.getItem("logged-in")
        }
      } catch (e) {
        console.log(e)
        return new Error("Error logging in")
      }
}

//Gets the login state of a user, returns as a "true" or "false"
export async function getLoginState(): Promise<string | null> {
    try {
        const nullCheckVal = await AsyncStorage.getItem("live-workout")
        if (nullCheckVal === null) {
            await AsyncStorage.setItem("logged-in", "false")
        }
      const stringVal = await AsyncStorage.getItem("logged-in")
      return stringVal
    } catch (e) {
      console.log(e)
      return null
    }
  }