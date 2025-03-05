import { Json } from "./database.types";
import { ExerciseData, Workout } from "./workout-types";

export type PostDatabase = {
    id: string;
    title: string;
    description: string;
    location: string;
    isPublic: boolean;
    imageUrl: string;
    workoutData: Workout;
    profileId: string;
    createdAt: Date;
    updatedAt: Date;
}

export type PostAsyncStorage = {
    id: string;
    username: string;
    date: string;
    title: string;
    description: string;
    exerciseData: ExerciseData[];
    likes: number;
    comments: number;
    imageUrl: string;
}