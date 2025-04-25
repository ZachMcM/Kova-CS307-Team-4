import {
  updateProfile,
  getProfile,
  unfollowUser,
  followUser,
} from "./profileServices";
import {
  AuthAccountResponse,
  ExtendedExercise,
} from "@/types/extended-types";
import { supabase } from "@/lib/supabase";
import {
  SearchItem,
  TaggedSearchItem,
  createWordCounter,
  createTagCounter,
  profilesToSearch,
  templatesToSearch,
  exercisesToSearch,
  compareToQuery,
  compareToTaggedQuery,
} from "@/types/searcher-types";
import { clearComments, Comment, getComments, pushComment } from "./commentServices";
import { getExercisePoints } from "./groupEventServices";
import { ExerciseData } from "@/types/workout-types";
import { Tables } from "@/types/database.types";
import { getAreasFromTags, getExercisesWithoutTags, getIntensities } from "@/services/intensityServices"

const burnerProfileIds = ["36a95bc3-ccfc-4b6c-a1f4-b37ee68ba40a", "11e43cae-f818-42a9-97af-52125d09b85e"];
const burnerProfileUserIds = ["e849d723-76bb-4b95-a028-9f7a382299da", "e159c552-2c1c-40a4-9505-49655e09593b"];
const burnerPostId = "49776590-5af7-43e6-a457-f3aa6d862a00";
const texts = ["PS9opsNroBbzlJw6gLON9xkryVGGgghB", "HvufBHil7062y5OC3TJXUt1WU6n19sxL", "w0HKoemRJzGTx0c52MvpOvHFaJdCe1MQ", "8Ijs9GRJnf7soSFBWCZacYeI8YIyk5E2", "e73IDKaLCSYnS9kg2zK38Useaa8xiroq", "vd0EskGYiZfnwm02UncQOv6jEk6uLgoq", "YH7AWQAd8h4gheA5RVRQtOWq3Dt5aiwY", "0Fmp1JnuaMEzZpl7xmJpjszqe4fKAvXr", "hdO06iOORfIcD73htbo0mdzMF0tsCQgN", "TZbZoZggx3t5dftRrr5XbrKbfWe9Zunk", "C6KqEo5UADSxYRrk9qFekx0nU53BqZuV", "OxGTfbMCo8LREWbD5ZYGSs24KSKgUpMx", "Yt0PJKNDuHp5iOOIK5cFmhG5pmri7eGk", "gk0ridea8ZVDTb7RF5ZRtrpGUFqqXHdW", "0CtmpWVPlzsSOgil7nv59O9Pzo6ceRIv", "tRpe4L2YlIbEpTx0PBtoDTdwRHwFKTr8", "68bopi25Pt4KmzhZLCGtgH6NUWMzOIJw", "kPmuMGOSSaMTaFisIBW9U49y3KxVD9S6", "xlbXKUdan7BHIpjazQ2wfOuTOcddwoCV", "9hZgi1PEIPAMr0Wib9j7W3taeal1hO4j", "4O3DiblFg1pUk0p4qhb5NoghyFp366Ko", "gdQNizPEve5HUTAUGWhJvERSdyACn6dg", "zXcEtQ1xvmVLkGg16OGSXMcbXVP3VbEt", "sO6KC07lRxz4kPUhH6EFFRNBpNNSJFmB", "e5FpKyZ3PKH2Y6v5l8mHFyNFVUaQ7aGF", "EAan6TtLjigUfLRrbrM8q7Hs1NIj2I3f", "JChIRpIPb3oAp333hyFM6BI1BjTyyieS", "Sfd8631w3wvQJUXPc6XDhIkRQ6LLqBLb", "RvMBilvWWYMsBrQ7p9yNBMclqshcKBMr", "33vOXJ6bIdv2RicRw79u1txgHbavo8VB", "q0ZiQanhr0JIGTrZ6Sv5szlI1bxHnmfP", "aF5PiMceXaogrrzZG9gf06ZS8tcbNX35", "MXhreVoYsIFnz2dtrbhXO3GITcBCU77X", "MUV6yLgJ2a7JX6Pt8nz7lvX5RgR6x63I", "IFh7u8iEijuZWaDhHquFKYjedKA6lkqG", "9sAyw0rnL5ZBf0Kl3CfjYclLd8UYfWSD", "5U07JMl2UH6R2G9kOCcSox0jFFQ0UAfD", "sUmO0xJX0wevTIhEwOdZNoAyC6wnSuY7", "OVrT1r8tBCiPTcLww276oFa7uq8Ww76H", "SbeZ9PIaKLFIU4Lteh2virQSU4gHDaFy", "WwAnHCppkSAwjCr2DkvmffMvUI9NObk7", "cbCc3guly83j11kwEpBymOJoru4oNGOd", "MGUYdWTRAMn0bIrNoeNSMFi7fSBuHzN5", "2DptrQcr4Rcq7fU8mN2OQvspABKdT2xi", "cSAy4lsEXxPz3RPPI0fX83qvBxu0eCnU", "JBezGBCZfIwYY4E2xSBTII7cqEN6d9rP", "wDIsbBD21yg01eo9rDYs072dxd0Dwyay", "FPAHPn0WsmxOzwUDqVy1KzbGSNvBf4N5", "Zu3Pq2m1McUcTpUmooaUnYMTjk2vfiDN", "s5vMYuzDaBdEx3Lw1ul3u3jCqhazeZzv"];

// This is just an example
export const exampleTests = (num: number) => {
  let output = "";
  if (num < 3) {
    output += "SUCCESS";
  } else {
    output += "FAILURE";
  }

  output += "\nfollowerTests: " + num;

  return output;
};

export type LoginTestParams = {
  signInUser: (userEmail: string, userPassword: string) => Promise<boolean>,
  testCaseName: string
  testEmail: string,
  testPassword: string,
  expectedError: string | null,
}

//Login tests
export const loginTests = async (params: LoginTestParams) => {
  let valid = true;
  let output = "";
  let error_message = "";

  const cur_session_refresh_token = (await supabase.auth.getSession()).data
    .session?.refresh_token!;
  await params
    .signInUser(params.testEmail, params.testPassword)
    .then(async () => {
      if (params.expectedError == null) {
        output += "SUCCESS";
      } else {
        valid = false;
        output += "FAILURE";
        error_message = "Did not throw expected error " + params.expectedError;
      }
      await supabase.auth.refreshSession({
        refresh_token: cur_session_refresh_token,
      });
    })
    .catch((error: Error) => {
      if (params.expectedError == null) {
        valid = false;
        output += "FAILURE";
        error_message =
          "Error was thrown when success was expected " + error.message;
      } else if (params.expectedError !== error.message) {
        valid = false;
        output += "FAILURE";
        error_message =
          "Unexpected error was thrown '" +
          error.message +
          "' expected was '" +
          params.expectedError +
          "'";
      } else {
        output += "SUCCESS";
      }
    });

  if (valid == true) {
    output += " | " + params.testCaseName;
  } else {
    output += " | " + params.testCaseName + ": " + error_message;
  }
  return output;
};

const sampleGroupEvent = {
  id: "211746ed-2c1f-45aa-a563-2bfaedc4a29e",
  groupId: "13e04401-97c9-47a0-992b-62bcd2238140",
  start_date: new Date().toDateString(),
  title: "The Olympics",
  end_date: new Date().toDateString(),
  exercise_points: [
    {
      exerciseId: "5894fa40-c745-4168-a73f-99b0e8a33e07",
      exerciseName: "Chest Press Machine",
      points: 8,
    },
  ],
  rep_multiplier: 2,
  weight_multiplier: 1,
  goal: 1000000,
  type: "competition"
} as Tables<"groupEvent">;

const sampleExercise = {
  info: {
    id: "5894fa40-c745-4168-a73f-99b0e8a33e07",
    name: "Chest Press Machine"
  },
  sets: [
    {
      reps: 10,
      weight: 100
    },
    {
      reps: 10,
      weight: 100
    },
    {
      reps: 10,
      weight: 100
    }
  ]
} as ExerciseData

export const pointsTest = () => {
  const points = getExercisePoints(sampleGroupEvent, sampleExercise)
  if (points != 2880) {
    return `FAILURE | Expected value was 2880, value was ${points}`
  } else {
    return "SUCCESS | Expected value was 2880 was returned"
  }
};

export type RegisterTestParams = {
  createAccount: (
    userEmail: string,
    userPassword: string,
    confirmPassword: string,
    username: string,
    displayName: string
  ) => Promise<AuthAccountResponse>;
  testCaseName: string;
  addRandom: boolean;
  testEmail: string;
  testPassword: string;
  testConfirmPassword: string;
  testUsername: string;
  testDisplayName: string;
  expectedError: string | null;
};

//Registration tests
export const registrationTests = async (params: RegisterTestParams) => {
  let valid = true;
  let output = "";
  let error_message = "";
  let randNum = "";
  if (params.addRandom == true) {
    randNum = Math.floor(Math.random() * (999_999_999 + 1)).toString();
  }

  const cur_session_refresh_token = (await supabase.auth.getSession()).data
    .session?.refresh_token!;
  await params
    .createAccount(
      randNum + params.testEmail,
      params.testPassword,
      params.testConfirmPassword,
      randNum + params.testUsername,
      params.testDisplayName
    )
    .then(async () => {
      if (params.expectedError == null) {
        output += "SUCCESS";
      } else {
        valid = false;
        output += "FAILURE";
        error_message = "Did not throw expected error " + params.expectedError;
      }
      await supabase.auth.refreshSession({
        refresh_token: cur_session_refresh_token,
      });
    })
    .catch((error: Error) => {
      if (params.expectedError == null) {
        valid = false;
        output += "FAILURE";
        error_message =
          "Error was thrown when success was expected " + error.message;
      } else if (params.expectedError !== error.message) {
        valid = false;
        output += "FAILURE";
        error_message =
          "Unexpected error was thrown '" +
          error.message +
          "' expected was '" +
          params.expectedError +
          "'";
      } else {
        output += "SUCCESS";
      }
    });

  if (valid == true) {
    output += " | " + params.testCaseName;
  } else {
    output += " | " + params.testCaseName + ": " + error_message;
  }
  return output;
};

export type PasswordResetTestParams = {
  signInUser: (userEmail: string, userPassword: string) => Promise<boolean>,
  correctPassword: string
  updatePassword: (oldPassword: string, updatePassword: string, verifyPassword: string) => Promise<boolean>,
  testCaseName: string, 
  testEmail: string, 
  testOldPassword: string,
  testNewPassword: string,
  testVerifyPassword: string, 
  expectedError: string
}

export const passwordResetTests = async (params: PasswordResetTestParams) => {
  let valid = true;
  let output = ""
  let error_message = ""
  
  const cur_session_refresh_token = (await supabase.auth.getSession()).data.session?.refresh_token!
  await params.signInUser(params.testEmail, params.correctPassword);
  await params.updatePassword(params.testOldPassword, params.testNewPassword, params.testVerifyPassword)
    .then( async () => {
      if (params.expectedError == null) {
        output += "SUCCESS"
      } else {
        valid = false;
        output += "FAILURE"
        error_message = "Did not throw expected error " + params.expectedError;
      }
      await params.updatePassword(params.testNewPassword, params.correctPassword, params.correctPassword); // Resetting unit testers password
    }).catch((error: Error) => {
      if (params.expectedError == null) {
        valid = false;
        output += "FAILURE"
        error_message = "Error was thrown when success was expected " + error.message;
      } else if (params.expectedError !== error.message) {
        valid = false;
        output += "FAILURE"
        error_message = "Unexpected error was thrown '" + error.message + "' expected was '" + params.expectedError + "'";
      } else {
        output += "SUCCESS"
      }
    })

    if (valid == true) {
      output += " | " + params.testCaseName
    } else {
      output += " | " + params.testCaseName + ": " + error_message  
    }
    await supabase.auth.refreshSession({ refresh_token: cur_session_refresh_token })
    return output
}

export const followerTests = async () => {
  let valid = true;

  let output = "";

  await followUser(burnerProfileUserIds[0], burnerProfileUserIds[1]);
  output += "followUser: a->b ";

  let profile = await getProfile(burnerProfileUserIds[0]);

  if (profile.following !== 1) {
    valid = false;
  }

  await followUser(burnerProfileUserIds[1], burnerProfileUserIds[0]);
  output += "followUser: b->a ";

  profile = await getProfile(burnerProfileUserIds[0]);

  if (profile.followers !== 1) {
    valid = false;
  }
  if (profile.following !== 1) {
    valid = false;
  }
  if (profile.friends !== 1) {
    valid = false;
  }

  await unfollowUser(burnerProfileUserIds[0], burnerProfileUserIds[1]);
  output += "unfollowUser: a->b ";
  await unfollowUser(burnerProfileUserIds[1], burnerProfileUserIds[0]);
  output += "unfollowUser: b->a ";
  profile = await getProfile(burnerProfileUserIds[0]);

  if (profile.followers !== 0) {
    valid = false;
  }
  if (profile.following !== 0) {
    valid = false;
  }
  if (profile.friends !== 0) {
    valid = false;
  }

  if (valid) {
    return "SUCCESS\n" + output;
  } else {
    return "FAILURE\n" + output;
  }
};

export const socialInformationTests = async () => {
  const names = [
    "Octavio Brill",
    "Yisroel Rainey",
    "Ken Caruso",
    "Stephan Wyatt",
    "Brandy Hagan",
    "Keely Stiles",
    "Stella Le",
    "Cayden Sepulveda",
    "Shyanne Noe",
    "Chauncey Wharton",
    "Devonta Fortner",
    "Treyvon Santos",
    "Abby Knapp",
    "Trevion Gilman",
    "Chelsie Hulsey",
    "Raelynn Worthington",
    "Brice Aquino",
    "Leeann Goad",
    "Shelbi Huffman",
    "Donavan Redding",
    "Theresa Schmidt",
    "Shirley Alexander",
    "Kenyon Snodgrass",
    "Derrick Adame",
    "Ariel Saldana",
    "Kristina Gillette",
    "Jayden Conte",
    "Alize New",
    "Annalise Shearer",
    "Estrella Hoppe",
    "Terence Michael",
    "Lyndsay Kauffman",
    "Arjun Rincon",
    "Ruth Myles",
    "Laken Vogt",
    "Benito Fleck",
    "Alvaro Yoo",
    "Carson Mackay",
    "Issac Meredith",
    "Khalil Colbert",
    "Caden Arce",
    "Duane Triplett",
    "Christine Rhodes",
    "Harry Gonzales",
    "Lukas London",
    "Jaiden Lim",
    "Anastasia Ralston",
    "Andres Christy",
    "Dashawn Moffitt",
    "Savanah Titus",
  ];
  const name = names[Math.floor(Math.random() * 50)];

  const text = texts[Math.floor(Math.random() * 50)];

  const age = Math.floor(Math.random() * 60);

  const genders = ["Male", "Female", "Other"];
  const gender = genders[Math.floor(Math.random() * 3)];

  const weight = Math.floor(Math.random() * 300);

  const privacies = ["PRIVATE", "PUBLIC", "FRIENDS"];
  const privacy = privacies[Math.floor(Math.random() * 3)];

  let valid = true;
  let output = "";

  await updateProfile(burnerProfileIds[0], text, text, text, text, privacy, name, age, gender, weight);
  output += "updateProfile: " + text + "," + text + "," + text + "," + text + "," + privacy + "," + name + ",";

  const profile = await getProfile(burnerProfileUserIds[0]);
  output += "\ngetProfile: " + profile.goal + "," + profile.bio + "," + profile.location + "," + profile.achievement + "," + profile.private + "," + profile.name + ",";

  if (profile.name !== name) {
    valid = false;
  }
  if (profile.location !== text) {
    valid = false;
  }
  if (profile.goal !== text) {
    valid = false;
  }
  if (profile.achievement !== text) {
    valid = false;
  }
  if (profile.bio !== text) {
    valid = false;
  }
  if (profile.private !== privacy) {
    valid = false;
  }

  if (valid === true) {
    return "SUCCESS\n" + output;
  } else {
    return "FAILURE\n" + output;
  }
};

// ALL SEARCH TESTS //

// Test the counter creation.
export const testCounters = () => {
  let output = "Output:\n\n";

  let searchItems = [
    { name: "aa", id: "1" },
    { name: "bb", id: "2" },
    { name: "aa bb", id: "3" },
    { name: "cc", id: "4" },
    { name: "dd -- a aa", id: "5" },
    { name: "zz !sdj s", id: "5" },
  ] as SearchItem[];
  output += "Basic:\n\n" + searchItems + "\n\n";
  let basicWordCounter = createWordCounter(searchItems);
  output += "Total -- " + basicWordCounter.totalItems + "\n";
  if (basicWordCounter.totalItems != 6) {
    return "FAILURE\n\n" + output;
  }
  output += "aa -- " + basicWordCounter.frequencies.get("aa") + "\n";
  if (basicWordCounter.frequencies.get("aa") != 3) {
    return "FAILURE\n\n" + output;
  }
  output +=
    "yy -- " +
    (basicWordCounter.frequencies.has("yy")
      ? "None"
      : basicWordCounter.frequencies.get("yy")) +
    "\n";
  if (basicWordCounter.frequencies.has("yy")) {
    return "FAILURE\n\n" + output;
  }
  output += "Inv(cc) -- " + basicWordCounter.getInverseFrequency("cc") + "\n";
  if (basicWordCounter.getInverseFrequency("cc") != 5) {
    return "FAILURE\n\n" + output;
  }
  output += "Inv(aa) -- " + basicWordCounter.getInverseFrequency("aa") + "\n";
  if (basicWordCounter.getInverseFrequency("aa") != 3) {
    return "FAILURE\n\n" + output;
  }
  output += "Inv(ee) -- " + basicWordCounter.getInverseFrequency("ee") + "\n\n";
  if (basicWordCounter.getInverseFrequency("ee") != 0) {
    return "FAILURE\n\n" + output;
  }

  let emptyWordCounter = createWordCounter([]);
  output += "Empty:\n" + [] + "\n\n";
  output += "Total -- " + emptyWordCounter.totalItems + "\n";
  if (emptyWordCounter.totalItems != 0) {
    return "FAILURE\n\n" + output;
  }
  output += "inv(aa) -- " + emptyWordCounter.getInverseFrequency("aa") + "\n\n";
  if (emptyWordCounter.getInverseFrequency("aa") != 0) {
    return "FAILURE\n\n" + output;
  }

  let taggedItems = [
    { name: "aa", id: "0", tags: [{ name: "aa dd" }] },
    { name: "bb", id: "1", tags: [{ name: "bb" }, { name: "aa" }] },
    { name: "cc", id: "2", tags: [{ name: "cc" }] },
    { name: "dd", id: "3", tags: [] },
    { name: "ee", id: "4", tags: [{ name: "aa" }, { name: "dd" }] },
    { name: "gg", id: "5", tags: [{ name: "aa" }, { name: "ee" }] },
    {
      name: "ff",
      id: "6",
      tags: [{ name: "ff" }, { name: "ll" }, { name: "zzz" }, { name: "yyyy" }],
    },
  ] as TaggedSearchItem[];
  let tagCounter = createTagCounter(taggedItems);
  output += "Tagged Items:\n" + taggedItems + "\n\n";
  output += "Total Tags: " + tagCounter.totalItems + "\n";
  if (tagCounter.totalItems != 7) {
    return "FAILURE\n\n" + output;
  }
  output += "aa -- " + tagCounter.tagFrequencies.get("aa") + "\n";
  if (tagCounter.tagFrequencies.get("aa") != 3) {
    return "FAILURE\n\n" + output;
  }
  output += "dd -- " + tagCounter.tagFrequencies.get("dd") + "\n";
  if (tagCounter.tagFrequencies.get("dd") != 1) {
    return "FAILURE\n\n" + output;
  }
  output += "zzz -- " + tagCounter.tagFrequencies.get("zzz") + "\n";
  if (tagCounter.tagFrequencies.get("zzz") != 1) {
    return "FAILURE\n\n" + output;
  }
  output += "mm -- " + tagCounter.tagFrequencies.has("mm") + "\n";
  if (tagCounter.tagFrequencies.has("mm")) {
    return "FAILURE\n\n" + output;
  }
  output += "inv(aa) -- " + tagCounter.getInverseFrequency("aa") + "\n";
  if (tagCounter.getInverseFrequency("aa") != 4) {
    return "FAILURE\n\n" + output;
  }
  output += "inv(yyyy) -- " + tagCounter.getInverseFrequency("yyyy") + "\n";
  if (tagCounter.getInverseFrequency("yyyy") != 6) {
    return "FAILURE\n\n" + output;
  }
  output += "inv(zz) -- " + tagCounter.getInverseFrequency("zz") + "\n";
  if (tagCounter.getInverseFrequency("zz") != 0) {
    return "FAILURE\n\n" + output;
  }

  let emptyTagCounter = createTagCounter([]);
  output += "Empty Tagged Items:\n" + [] + "\n\n";
  output += "Total Tags: " + emptyTagCounter.totalItems + "\n";
  if (emptyTagCounter.totalItems != 0) {
    return "FAILURE\n\n" + output;
  }
  output += "inv(aa) -- " + emptyTagCounter.getInverseFrequency("aa") + "\n\n";
  if (emptyTagCounter.getInverseFrequency("aa") != 0) {
    return "FAILURE\n\n" + output;
  }
  return "SUCCESS\n\n" + output;
};

// Test the more advanced creators.
export const testCreators = () => {
  let output = "Output:\n\n";
  let exercises = [
    {
      name: "Chest Bumps",
      id: "0",
      created_at: "Big Bang",
      tags: [
        { color: "red", created_at: "a", id: "0", name: "chest" },
        { color: "blue", created_at: "b", id: "1", name: "core" },
      ],
    },
    {
      name: "Leg Twists",
      id: "1",
      created_at: "BCE",
      tags: [{ color: "green", created_at: "c", id: "0", name: "legs" }],
    },
    {
      name: "Burpee",
      id: "2",
      created_at: "Heat Death",
      tags: [{ color: "blue", created_at: "b", id: "1", name: "core" }],
    },
    {
      name: "Chaos",
      id: "3",
      created_at: "Inexistance",
      tags: [],
    },
  ] as ExtendedExercise[];
  output += "Standard Exercises: \n" + exercises + "\n\n";
  let exerciseItems = exercisesToSearch(exercises);
  output += "Items: " + exerciseItems + "\n\n";
  if (
    exerciseItems[0].name !== "Chest Bumps" ||
    exerciseItems[0].id !== "0" ||
    exerciseItems[0].tags[0].name !== "chest" ||
    exerciseItems[0].tags[1].name !== "core" ||
    exerciseItems[0].tags.length != 2 ||
    exerciseItems[1].name !== "Leg Twists" ||
    exerciseItems[1].id !== "1" ||
    exerciseItems[1].tags[0].name !== "legs" ||
    exerciseItems[1].tags.length != 1 ||
    exerciseItems[2].name !== "Burpee" ||
    exerciseItems[2].id !== "2" ||
    exerciseItems[2].tags[0].name != "core" ||
    exerciseItems[2].tags.length != 1 ||
    exerciseItems[3].name !== "Chaos" ||
    exerciseItems[3].id !== "3" ||
    exerciseItems[3].tags.length != 0 ||
    exerciseItems.length != 4
  ) {
    return "FAILURE\n\n" + output;
  }

  let noExercises = exercisesToSearch([]);
  output += "No exercises: " + noExercises + "\n\n";
  if (noExercises.length != 0) {
    return "FAILURE\n\n" + output;
  }

  let profiles = [
    { userId: "0", name: "John Purdue", avatar: "Imagine pic link A" },
    { userId: "1", name: "Peet", avatar: "Imagine pic link B" },
    { userId: "2", name: "Levina Drusselberry", avatar: "Imagine pic link C" },
  ] as any[];
  let profileItems = profilesToSearch(profiles);
  output += "Profiles: " + profileItems + "\n\n";
  if (
    profileItems.length != 3 ||
    profileItems[0].name !== "John Purdue" ||
    profileItems[0].id !== "0" ||
    profileItems[1].name !== "Peet" ||
    profileItems[1].id !== "1" ||
    profileItems[2].name !== "Levina Drusselberry" ||
    profileItems[2].id !== "2"
  ) {
    return "FAILURE\n\n" + output;
  }

  let noProfiles = profilesToSearch([]);
  output += "No profiles: " + noExercises + "\n\n";
  if (noProfiles.length != 0) {
    return "FAILURE\n\n" + output;
  }

  // TODO
  // let templates = [{
  //   created_at: "a", creatorProfileId: "0",
  //   id: "1", name: "First", profileId: "A",
  //   data: [], creatorProfile: {age: 0, avatar: "aa",
  //     bio: "nothing at all", created_at: "asdf", gender: "N/A", goal: "None",
  //     id: "0", private: false, userId: "0", username: "John"}
  // }, {
  //   created_at: "b", creatorProfileId: "53",
  //   id: "10", name: "Second", profileId: "AB",
  //   data: [], creatorProfile: {age: 0, avatar: "aa",
  //     bio: "nothing at all", created_at: "asdf", gender: "N/A", goal: "None",
  //     id: "0", private: false, userId: "0", username: "John"}
  // }] as ExtendedTemplateWithCreator[];
  // let templateItems = templatesToSearch(templates);
  // output += "Templates: " + templateItems + "\n\n";
  // if (templateItems.length != 2
  //   || templateItems[0].name !== "First"
  //   || templateItems[0].id !== "1"
  //   || templateItems[1].name !== "Second"
  //   || templateItems[1].id !== "10"
  // ) {
  //   return "FAILURE\n\n" + output;
  // }

  let noTemplates = templatesToSearch([]);
  output += "No templates: " + noTemplates + "\n\n";
  if (noTemplates.length != 0) {
    return "FAILURE\n\n" + output;
  }

  return "SUCCESS\n\n" + output;
};

// Test the query scorers.
export const testScorers = () => {
  let output = "Output:\n\n";
  let searchItems = [
    { name: "aa", id: "1" },
    { name: "bb", id: "2" },
    { name: "aa bb", id: "3" },
    { name: "cc", id: "4" },
    { name: "dd -- a aa", id: "5" },
    { name: "zz !sdj s", id: "5" },
  ] as SearchItem[];
  let sWordCounter = createWordCounter(searchItems);

  let sQueries = ["a", "A", "Aa a", "bc", "!sd", "1", "b 1", "a a", "cc"];
  let expectedResultsForSSearch = [
    [1 + 3, 0, 1 + 3, 0, 2 + 5 + 3, 0],
    [1 + 3, 0, 1 + 3, 0, 2 + 5 + 3, 0],
    [2 + 3 + 1 + 3, 0, 2 + 3 + 1 + 3, 0, 2 + 3 + 1 + 3 + 1 + 5, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3 + 5],
    [0, 0, 0, 0, 0, 0],
    [0, 1 + 4, 1 + 4, 0, 0, 0],
    [2 * (1 + 3), 0, 2 * (1 + 3), 0, 2 * (1 + 5 + 1 + 3), 0],
    [0, 0, 0, 2 + 5, 0, 0],
  ];

  for (let i = 0; i < sQueries.length; i++) {
    output += "Query: " + sQueries[i] + "\n";
    for (let j = 0; j < searchItems.length; j++) {
      output +=
        "- " +
        searchItems[j].name +
        ": " +
        compareToQuery(sQueries[i], searchItems[j], sWordCounter) +
        "\n";
      if (
        compareToQuery(sQueries[i], searchItems[j], sWordCounter) !=
        expectedResultsForSSearch[i][j]
      ) {
        return "FAILURE \n\n" + output;
      }
    }
  }
  output += "\n";

  let taggedItems = [
    { name: "aa", id: "0", tags: [{ name: "aa dd" }] },
    { name: "bb", id: "1", tags: [{ name: "bb" }, { name: "aa" }] },
    { name: "cc", id: "2", tags: [{ name: "cc" }] },
    { name: "dd aa", id: "3", tags: [] },
    { name: "ee", id: "4", tags: [{ name: "aa" }, { name: "dd" }] },
    { name: "gg", id: "5", tags: [{ name: "aa" }, { name: "ee" }] },
    {
      name: "ff",
      id: "6",
      tags: [{ name: "ff" }, { name: "ll" }, { name: "zzz" }, { name: "yyyy" }],
    },
  ] as TaggedSearchItem[];
  let tWordCounter = createWordCounter(taggedItems);
  let tTagCounter = createTagCounter(taggedItems);
  let tQueries = ["zzz", "aa", "zz", "b", "fff", "yyy", "dd"];
  let expectedResultsForTSearch = [
    [0, 0, 0, 0, 0, 0, 2 * (3 + 6)],
    [2 + 5 + 2 * (2 + 6), 2 * (2 + 4), 0, 2 + 5, 2 * (2 + 4), 2 * (2 + 4), 0],
    [0, 0, 0, 0, 0, 0, 2 * (2 + 6)],
    [0, 1 + 6 + 2 * (1 + 6), 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2 * (3 + 6)],
    [2 * (2 + 6), 0, 0, 2 + 6, 2 * (2 + 6), 0, 0],
  ];

  output += "Tagged Items:\n";
  for (let i = 0; i < tQueries.length; i++) {
    output += "Query: " + tQueries[i] + "\n";
    for (let j = 0; j < taggedItems.length; j++) {
      output +=
        "- " +
        taggedItems[j].name +
        ": " +
        compareToTaggedQuery(
          tQueries[i],
          taggedItems[j],
          tWordCounter,
          tTagCounter,
          []
        ) +
        "\n";
      if (
        compareToTaggedQuery(
          tQueries[i],
          taggedItems[j],
          tWordCounter,
          tTagCounter,
          []
        ) != expectedResultsForTSearch[i][j]
      ) {
        return "FAILURE \n\n" + output;
      }
    }
  }
  return "SUCCESS\n\n" + output; 
}

export const commentTests = async () => {
  let output = "";
  const postId = burnerPostId;
  const userId = burnerProfileUserIds[0];

  const commentNum = Math.floor(Math.random() * 10);

  output += "Inserting " + commentNum + " comments:" + "\n";
  console.log("Inserting " + commentNum + " comments:");
  
  for (let i = 0; i < commentNum; i++) {
    const commentContent = texts[Math.floor(Math.random() * 50)];

    const comment = {
      userId: userId,
      postId: postId,
      content: commentContent,
      created_at: new Date().toISOString()
    };

    output += "Comment: " + commentContent + ", at: " + comment.created_at + "\n";
    console.log("Comment: " + commentContent + ", at: " + comment.created_at);

    await pushComment(postId, comment);
  }

  const commentData = await getComments(postId, 0, 20);
  const comments = commentData as Comment[];

  console.log(comments.length);

  if (comments.length == commentNum) {
    output += "SUCCESS";
  }
  else {
    output += "FAILURE";
  }

  console.log("Clearing: " + postId);
  await clearComments(postId);

  return output;
}

export async function testIntensityCalculations(): Promise<string> {
  let output = "Output:\n\n"
  output += "\nExercises without tags:\n"
  let numWithoutTags = await getExercisesWithoutTags()
  output += "\n [without tags:] " + numWithoutTags + "\n"
  if (numWithoutTags.length != 0) {
    return "FAILURE\n\n" + output
  }
  /* Testing tags. */
  output += "\nTags only:\n"

  // 'Stability' only, having no mapped areas.
  let parts = getAreasFromTags(["Stability"])
  output += "\n['Stability'] -- " + parts.map((part) => JSON.stringify(part)) + "\n"
  if (parts.length != 0) {
    return "FAILURE\n\n " + output
  }

  // 'Core' only, which has 4 areas.
  parts = getAreasFromTags(["Core"])
  output += "\n['Core'] -- " + parts.map((part) => JSON.stringify(part)) + "\n"
  if (parts.length != 4) {
    return "FAILURE\n\n" + output
  }
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].intensity! != 7) {
      return "FAILURE\n\n" + output
    }
  }

  // 'Core' and 'Arms' only, which has 5 areas.
  parts = getAreasFromTags(["Core", "Arms"])
  output += "\n['Core', 'Arms'] -- " + parts.map((part) => JSON.stringify(part)) + "\n"
  if (parts.length != 5) {
    return "FAILURE\n\n" + output
  }
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].intensity! != 7) {
      return "FAILURE\n\n" + output
    }
  }

  // 'Core' and 'Back' only, which has 4 areas. Two overlap.
  parts = getAreasFromTags(["Core", "Back"])
  output += "\n['Core', 'Arms'] -- " + parts.map((part) => JSON.stringify(part)) + "\n"
  if (parts.length != 5) {
    return "FAILURE\n\n" + output
  }
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].intensity! != 7) {
      if (parts[i].slug !== "lower-back") {
        return "FAILURE\n\n" + output
      } else if (parts[i].intensity != 8) {
        return "FAILURE\n\n" + output
      }
    }
  }

  /* Testing Exercise Data */
  output += "\nTesting exercises\n"
  // 1 set of Incline Chest Press, min of 2. Has Shoulders, Chest, and Pecs
  parts = await getIntensities([{name: "Incline Chest Press", sets: 1}], 2)
  output += "\n([{'Incline Chest Press', 1}], 2) -- " + parts.map((part) => JSON.stringify(part)) + "\n"
  if (parts.length != 3) {
    return "FAILURE\n\n" + output
  } 
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].intensity != 3) {
      if (parts[i].slug !== "chest") {
        return "FAILURE\n\n" + output
      }
      else if (parts[i].intensity != 5) {
        return "FAILURE\n\n" + output
      }
    }
  }

  // 1 set of Incline Chest Press, min of 4. Has Shoulders, Chest, and Pecs
  parts = await getIntensities([{name: "Incline Chest Press", sets: 1}], 4)
  output += "\n([{'Incline Chest Press', 1}], 4) -- " + parts.map((part) => JSON.stringify(part)) + "\n"
  if (parts.length != 3) {
    return "FAILURE\n\n" + output
  } 
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].intensity != 5) {
      if (parts[i].slug !== "chest") {
        return "FAILURE\n\n" + output
      }
      else if (parts[i].intensity != 7) {
        return "FAILURE\n\n" + output
      }
    }
  }

  // 5 sets of Incline Chest Press, min of 2. Has Shoulders, Chest, and Pecs
  parts = await getIntensities([{name: "Incline Chest Press", sets: 5}], 2)
  output += "\n([{'Incline Chest Press', 5}], 2) -- " + parts.map((part) => JSON.stringify(part)) + "\n"
  if (parts.length != 3) {
    return "FAILURE\n\n" + output
  } 
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].intensity != 5) {
      if (parts[i].slug !== "chest") {
        return "FAILURE\n\n" + output
      }
      else if (parts[i].intensity != 9) {
        return "FAILURE\n\n" + output
      }
    }
  }

  // 1 set of Incline Chest Press and 1 set of Kettlebell Sumo Deadlift, min of 4.
  // Incline Has Shoulders, Chest, and Pecs
  // Kettlebell has Legs, Glutes, and Hamstrings
  parts = await getIntensities([{name: "Incline Chest Press", sets: 1}, {name: "Kettlebell Sumo Deadlift", sets: 1}], 4)
  output += "\n([{'Incline Chest Press', 1}, {'Kettlebell Sumo Deadleft', 1}], 4) -- " + parts.map((part) => JSON.stringify(part)) + "\n"
  if (parts.length != 13) {
    return "FAILURE\n\n" + output
  } 
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].intensity != 5) {
      if (parts[i].slug !== "chest") {
        return "FAILURE\n\n" + output
      }
      else if (parts[i].intensity != 7) {
        return "FAILURE\n\n" + output
      }
    }
  }

  // 4 sets of Incline Chest Press and 1 set of Kettlebell Sumo Deadlift, min of 4.
  // Incline Has Shoulders, Chest, and Pecs
  // Kettlebell has Legs, Glutes, and Hamstrings
  parts = await getIntensities([{name: "Incline Chest Press", sets: 4}, {name: "Kettlebell Sumo Deadlift", sets: 1}], 4)
  output += "\n([{'Incline Chest Press', 4}, {'Kettlebell Sumo Deadleft', 1}], 4) -- " + parts.map((part) => JSON.stringify(part)) + "\n"
  if (parts.length != 13) {
    return "FAILURE\n\n" + output
  } 
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].intensity != 5) {
      if (parts[i].slug !== "chest" && parts[i].slug !== "deltoids" && parts[i].slug !== "triceps" && parts[i].slug) {
        return "FAILURE\n\n" + output
      }
      else if (parts[i].slug !== "chest" && parts[i].intensity != 7) {
        return "FAILURE\n\n" + output
      }
      else if (parts[i].slug === "chest" && parts[i].intensity != 10) {
        return "FAILURE\n\n" + output
      }
    }
  }

  // 20 sets of Incline Chest Press and 20 set of Kettlebell Sumo Deadlift, min of 4. 
  // Incline Has Shoulders, Chest, and Pecs
  // Kettlebell has Legs, Glutes, and Hamstrings
  parts = await getIntensities([{name: "Incline Chest Press", sets: 20}, {name: "Kettlebell Sumo Deadlift", sets: 20}], 4)
  output += "\n([{'Incline Chest Press', 20}, {'Kettlebell Sumo Deadleft', 20}], 4) -- " + parts.map((part) => JSON.stringify(part)) + "\n"
  if (parts.length != 13) {
    return "FAILURE\n\n" + output
  } 
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].intensity != 12) {
      return "FAILURE\n\n" + output
    }
  }
  return "SUCCESS\n\n" + output
}
