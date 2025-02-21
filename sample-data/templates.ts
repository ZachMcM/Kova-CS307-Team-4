import { ExtendedTemplateWithCreator } from "@/types/extended-types";

export const sampleTemplates: ExtendedTemplateWithCreator[] = [
  {
    // Template data
    id: "t_01HNYVM3D5VWQP2GX4ZNBK8RJ",
    created_at: "2024-02-19T10:00:00Z",
    name: "Full Body Strength Workout",
    creatorUserId: "u_01HNYVM3D5VWQP2GX4ZNBK8RK",
    data: {
      exercises: [
        { id: "e1", name: "Squats", sets: 3, reps: 12 },
        { id: "e2", name: "Bench Press", sets: 4, reps: 8 },
        { id: "e3", name: "Deadlifts", sets: 3, reps: 10 }
      ],
      restBetweenSets: 90,
      difficulty: "intermediate"
    },
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
        private: false
      }
    }
  },
  {
    // Template data
    id: "t_01HNYVM3D5VWQP2GX4ZNBK8RM",
    created_at: "2024-02-18T15:30:00Z",
    name: "HIIT Cardio Blast",
    creatorUserId: "u_01HNYVM3D5VWQP2GX4ZNBK8RN",
    data: {
      exercises: [
        { id: "e4", name: "Burpees", duration: 45, rest: 15 },
        { id: "e5", name: "Mountain Climbers", duration: 45, rest: 15 },
        { id: "e6", name: "Jump Rope", duration: 60, rest: 20 }
      ],
      rounds: 4,
      totalDuration: "20 minutes"
    },
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
        private: false
      }
    }
  }
];