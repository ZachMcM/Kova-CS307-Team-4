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

//Logs in the user and saves that state to async storage
//TODO checking is on the backend, we will return a supabase call of 
//True if it checks out and false otherwise, this is just a placeholder
export async function loginUser(email:string, password:string) {
        if (email === "admin" && password === "admin") {
            await AsyncStorage.setItem("logged-in", "true")
            console.log("User " + email + " has logged in")
            return AsyncStorage.getItem("logged-in")
        } else {
          throw new Error("Incorrect email or password")
        }
}

//Logs out the user
export async function logoutUser() {
    await AsyncStorage.setItem("logged-in", "false")
    console.log("logged out")
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
//TODO this is also a placeholder, checking for if an account exists is on the backend
export async function registerAccount(email:string, password:string): Promise<string | null> {
  if (email === "admin") {
    console.log(email + " already is an account")
    throw new Error("Account with that email has already been created")
  } else {
    console.log(email + " has been successfully registered")
    return "success"
  }
}
