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

const mockPosts = [
  {
    id: '1',
    username: 'fitness_enthusiast',
    date: 'May 15, 2023',
    title: 'Morning Cardio Session',
    description: 'Started my day with an intense 30-minute HIIT session. Feeling energized!',
    exercises: [
      { name: 'Burpees' },
      { name: 'Mountain Climbers' },
      { name: 'Jumping Jacks' }
    ],
    likes: 24,
    comments: 5,
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: '2',
    username: 'strength_trainer',
    date: 'May 14, 2023',
    title: 'Leg Day Completed',
    description: 'Pushed through a challenging leg workout today. My quads are on fire!',
    exercises: [
      { name: 'Squats' },
      { name: 'Deadlifts' },
      { name: 'Lunges' }
    ],
    likes: 42,
    comments: 8,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: '3',
    username: 'yoga_master',
    date: 'May 13, 2023',
    title: 'Peaceful Yoga Flow',
    description: 'Found my center with a 60-minute yoga session. Perfect way to end the week.',
    exercises: [
      { name: 'Downward Dog' },
      { name: 'Warrior Pose' },
      { name: 'Child\'s Pose' }
    ],
    likes: 36,
    comments: 4,
    imageUrl: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
  },
];

export async function fetchFeed() {
  if (await AsyncStorage.getItem("feed-items") == null) {
    const feed_items = JSON.stringify(mockPosts);
    console.log("feed-items first time " + feed_items);
    AsyncStorage.setItem("feed-items", feed_items);
    return feed_items;
  } else {
    const feed_items = AsyncStorage.getItem("feed-items");
  console.log("feed-items " + feed_items);
  return feed_items;
  }
}

export async function updateFeed() {
  const current_item = await AsyncStorage.getItem("feed-items");
  const parsed_item = JSON.parse(current_item!) as typeof mockPosts
  parsed_item.push({
    id: '1',
    username: 'fitness_enthusiast',
    date: 'May 15, 2023',
    title: 'Morning Cardio Session',
    description: 'Started my day with an intense 30-minute HIIT session. Feeling energized!',
    exercises: [
      { name: 'Burpees' },
      { name: 'Mountain Climbers' },
      { name: 'Jumping Jacks' }
    ],
    likes: 24,
    comments: 5,
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
  })
  const stringified_item = JSON.stringify(parsed_item);
  console.log("Stringified item: " + stringified_item);
  AsyncStorage.setItem("feed-items", stringified_item);
}

export async function resetFeed() {
  console.log("removing feed items")
  AsyncStorage.removeItem("feed-items");
  console.log("removed_key: " + await AsyncStorage.getItem("feed-items"))
}