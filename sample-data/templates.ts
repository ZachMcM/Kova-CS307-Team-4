import { ExtendedTemplateWithCreator } from "@/types/extended-types";
import { sampleWorkoutData } from "./workoutData";

export const sampleTemplates: ExtendedTemplateWithCreator[] = [
  {
    // Template data
    id: "t_01HNYVM3D5VWQP2GX4ZNBK8RJ",
    created_at: "2024-02-19T10:00:00Z",
    name: "Full Body Strength Workout",
    creatorUserId: "u_01HNYVM3D5VWQP2GX4ZNBK8RK",
    data: sampleWorkoutData,
    // Creator's profile
    creator: {
      profile: {
        id: "p_01HNYVM3D5VWQP2GX4ZNBK8RL",
        created_at: "2024-01-15T08:30:00Z",
        username: "fitpro_sarah",
        userId: "u_01HNYVM3D5VWQP2GX4ZNBK8RK",
        avatar: "https://example.com/avatars/sarah.jpg",
        bio: "Certified Personal Trainer | Helping you achieve your fitness goals",
        age: 29,
        gender: "female",
        goal: "Help others achieve their fitness potential",
        private: false,
      },
    },
  },
  {
    // Template data
    id: "t_01HNYVM3D5VWQP2GX4ZNBK8RM",
    created_at: "2024-02-18T15:30:00Z",
    name: "HIIT Cardio Blast",
    creatorUserId: "u_01HNYVM3D5VWQP2GX4ZNBK8RN",
    data: sampleWorkoutData,
    // Creator's profile
    creator: {
      profile: {
        id: "p_01HNYVM3D5VWQP2GX4ZNBK8RO",
        created_at: "2024-01-20T14:15:00Z",
        username: "hiit_master_mike",
        userId: "u_01HNYVM3D5VWQP2GX4ZNBK8RN",
        avatar: "https://example.com/avatars/mike.jpg",
        bio: "HIIT Specialist | Former athlete turned fitness coach",
        age: 32,
        gender: "male",
        goal: "Make high-intensity training accessible to everyone",
        private: false,
      },
    },
  },
];
