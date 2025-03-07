import { supabase } from "@/lib/supabase";
import { PostAsyncStorage, PostDatabase } from "@/types/post.types";
import { Workout } from "@/types/workout-types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { string } from "zod";

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
    exerciseData: [
      { 
        info: {
          id: "90",
          name: 'Burpees'
        },
        sets: []
      },
      { 
        info: {
          id: "91",
          name: 'Mountain Climbers'
        },
        sets: []
      },
      { 
        info: {
          id: "92",
          name: 'Jumping Jacks'
        },
        sets: []
      },
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
    exerciseData: [
      { 
        info: {
          id: "900",
          name: 'Squats'
        },
        sets: []
      },
      { 
        info: {
          id: "910",
          name: 'Deadlifts'
        },
        sets: []
      },
      { 
        info: {
          id: "920",
          name: 'Lunges'
        },
        sets: []
      },
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
    exerciseData: [
      { 
        info: {
          id: "9001",
          name: 'Downward Dog'
        },
        sets: []
      },
      { 
        info: {
          id: "9101",
          name: 'Warrior Pose'
        },
        sets: []
      },
      { 
        info: {
          id: "9201",
          name: 'Child Pose'
        },
        sets: []
      },
    ],
    likes: 36,
    comments: 4,
    imageUrl: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
  },
];

export async function fetchFeed() {
  if (await AsyncStorage.getItem("feed-items") == null) {
    const feed_items = JSON.stringify(mockPosts);
    AsyncStorage.setItem("feed-items", feed_items);
    return feed_items;
  } else {
    const feed_items = AsyncStorage.getItem("feed-items");
  return feed_items;
  }
}

export async function updateFeed() {
  const current_item = await AsyncStorage.getItem("feed-items");
  const parsed_item = JSON.parse(current_item!) as PostAsyncStorage[]
  try {
    const user_id = (await supabase.auth.getSession()).data.session?.user.id
    const following_list_data = (await supabase.from("followingRel").select("targetId").eq("sourceId", user_id)).data!
    const following_uid_list: string[] = following_list_data.map(following_list_data => following_list_data.targetId)
    const following_id_list: string[] = []
    for (const uid of following_uid_list) {
      following_id_list.push((await supabase.from("profile").select("id").eq("userId", uid)).data![0].id)
    }
    const post_list = JSON.parse(JSON.stringify((await supabase.from("post").select().in("profileId", following_id_list)).data!)) as PostDatabase[]

    for (const post of post_list) {
      const username = (await supabase.from("profile").select("username").eq("id", post.profileId)).data![0].username
      parsed_item.push({
        id: post.id,
        username: username,
        date: post.updatedAt.toString(),
        title: post.title,
        description: post.description,
        exerciseData: post.workoutData.exercises,
        likes: 10,
        comments: 10,
        imageUrl: post.imageUrl
      } as PostAsyncStorage)
    }
  } catch (error) {
    console.log(error);
  }

  const stringified_item = JSON.stringify(parsed_item);
  console.log("Stringified item: " + stringified_item);
  AsyncStorage.setItem("feed-items", stringified_item);
}

export async function resetFeed() {
  console.log("removing feed items")
  AsyncStorage.removeItem("feed-items");
}