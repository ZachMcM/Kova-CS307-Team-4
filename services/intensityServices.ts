import { Exercise } from "@/components/WorkoutPost"
import { Workout } from "@/types/workout-types"
import { ExtendedBodyPart } from "react-native-body-highlighter"
import { getTagsAndDetails } from "./exerciseServices"

export enum Areas {
  TRAPEZIUS, TRICEPS, FOREARM, ADDUCTORS, CALVES,
  NECK, DELTOIDS, HANDS, FEET, ANKLES,
  TIBIALIS, OBLIQUES, CHEST, BICEPS, ABS,
  QUADRICEPS, KNEES, UPPER_BACK, LOWER_BACK, HAMSTRING,
  GLUTEAL
}

export function getAreasFromTags(tags: string[]) : ExtendedBodyPart[] {
  const repsOfParts = {} as Record<Areas, number>
  for (let j = 0; j < tags.length; j++) {
    const areas = getAreas(tags[j])
    for (let k = 0; k < areas.length; k++) {
      if (isNaN(repsOfParts[areas[k]])) {
        repsOfParts[areas[k]] = 1;
      }
      else {
        repsOfParts[areas[k]]++;
      }
    }
  }
  const allParts = getParts()
  const partsToReturn = [] as ExtendedBodyPart[]
  const areas = [
    Areas.TRAPEZIUS, Areas.TRICEPS, Areas.FOREARM, Areas.ADDUCTORS, Areas.CALVES,
    Areas.NECK, Areas.DELTOIDS, Areas.HANDS, Areas.FEET, Areas.ANKLES,
    Areas.TIBIALIS, Areas.OBLIQUES, Areas.CHEST, Areas.BICEPS, Areas.ABS,
    Areas.QUADRICEPS, Areas.KNEES, Areas.UPPER_BACK, Areas.LOWER_BACK, Areas.HAMSTRING,
    Areas.GLUTEAL
  ]
  // console.log(repsOfParts)
  for (let i = 0; i < areas.length; i++) {
    let intensity = repsOfParts[areas[i]]
    if (!isNaN(intensity) && intensity != null) {
      const part = allParts.get(areas[i])
      // console.log(intensity)
      part!.intensity = ((intensity + 6 > getRangeOfIntensities() + 1)?  getRangeOfIntensities() + 1: 6 + intensity)
      partsToReturn.push(part!)
    }
  }
  // console.log(partsToReturn)
  return partsToReturn
}

export async function getIntensities(exercises: {name: string, sets: number}[], minIntensity: number) : Promise<ExtendedBodyPart[]> {
  const tagsOfExercises = (await getTagsAndDetails(exercises.map((exercise) => exercise.name))).tagMap
  const repsOfParts = {} as Record<Areas, number>
  const setsOfParts = {} as Record<Areas, number>
  for (let i = 0; i < exercises.length; i++) {
    const tags = tagsOfExercises[exercises[i].name]
    if (tags) {
      for (let j = 0; j < tags.length; j++) {
        const areas = getAreas(tags[j])
        for (let k = 0; k < areas.length; k++) {
          if (isNaN(repsOfParts[areas[k]])) {
            repsOfParts[areas[k]] = 1;
          }
          else {
            repsOfParts[areas[k]]++;
          }
          if (isNaN(setsOfParts[areas[k]])) {
            setsOfParts[areas[k]] = exercises[i].sets
          }
          else {
            setsOfParts[areas[k]] += exercises[i].sets
          }
        }
      }
    }
  }
  const allParts = getParts()
  const partsToReturn = [] as ExtendedBodyPart[]
  const areas = [
    Areas.TRAPEZIUS, Areas.TRICEPS, Areas.FOREARM, Areas.ADDUCTORS, Areas.CALVES,
    Areas.NECK, Areas.DELTOIDS, Areas.HANDS, Areas.FEET, Areas.ANKLES,
    Areas.TIBIALIS, Areas.OBLIQUES, Areas.CHEST, Areas.BICEPS, Areas.ABS,
    Areas.QUADRICEPS, Areas.KNEES, Areas.UPPER_BACK, Areas.LOWER_BACK, Areas.HAMSTRING,
    Areas.GLUTEAL
  ]
  for (let i = 0; i < areas.length; i++) {
    let intensity = repsOfParts[areas[i]] + Math.floor(setsOfParts[areas[i]] / 2)
    if (!isNaN(intensity) && intensity != null) {
      const part = allParts.get(areas[i])
      part!.intensity = ((intensity + minIntensity > getRangeOfIntensities())?
        getRangeOfIntensities(): intensity + minIntensity)
      partsToReturn.push(part!)
    }
  }
  console.log("Left " + exercises.map((exercise) => JSON.stringify(exercise)) + ", \n" + JSON.stringify(repsOfParts))
  console.log(JSON.stringify(setsOfParts))
  console.log("Results: " + partsToReturn.map((part) => JSON.stringify(part)))
  return partsToReturn
}

function getParts() : Map<Areas, ExtendedBodyPart> {
  const parts = new Map<Areas, ExtendedBodyPart>()
  parts.set(Areas.TRAPEZIUS, {slug: "trapezius", intensity: 0})
  parts.set(Areas.TRICEPS, {slug: "triceps", intensity: 0})
  parts.set(Areas.FOREARM, {slug: "forearm", intensity: 0})
  parts.set(Areas.ADDUCTORS, {slug: "adductors", intensity: 0})
  parts.set(Areas.CALVES, {slug: "calves", intensity: 0})
  parts.set(Areas.NECK, {slug: "neck", intensity: 0})
  parts.set(Areas.DELTOIDS, {slug: "deltoids", intensity: 0})
  parts.set(Areas.HANDS, {slug: "hands", intensity: 0})
  parts.set(Areas.FEET, {slug: "feet", intensity: 0})
  parts.set(Areas.ANKLES, {slug: "ankles", intensity: 0})
  parts.set(Areas.TIBIALIS, {slug: "tibialis", intensity: 0})
  parts.set(Areas.OBLIQUES, {slug: "obliques", intensity: 0})
  parts.set(Areas.CHEST, {slug: "chest", intensity: 0})
  parts.set(Areas.BICEPS, {slug: "biceps", intensity: 0})
  parts.set(Areas.ABS, {slug: "abs", intensity: 0})
  parts.set(Areas.QUADRICEPS, {slug: "quadriceps", intensity: 0})
  parts.set(Areas.KNEES, {slug: "knees", intensity: 0})
  parts.set(Areas.UPPER_BACK, {slug: "upper-back", intensity: 0})
  parts.set(Areas.LOWER_BACK, {slug: "lower-back", intensity: 0})
  parts.set(Areas.HAMSTRING, {slug: "hamstring", intensity: 0})
  parts.set(Areas.GLUTEAL, {slug: "gluteal", intensity: 0})
  return parts
}

function getRangeOfIntensities() : number {
  return getColors().length
}

export function getColors() : string[] {
  return [
    "#002222",
    "#003535",
    "#014242",
    "#014f4f",
    "#015c5c",
    "#016a6a",
    "#017777",
    "#018484",
    "#019a9a",
    "#01b0b0",
    "#01c6c6",
    "#01dcdc",
  ]
}

function getAreas(tag: string) : Areas[] {
  const areas = [] as Areas[]
  switch (tag) {    
    case "Grip":
      areas.push(Areas.HANDS);
      break;
    case "Stability":
    
      break;
    case "Arms":
      areas.push(Areas.TRICEPS)
      break;
    case "Obliques":
      areas.push(Areas.OBLIQUES)
      break;
    case "Back":
      areas.push(Areas.LOWER_BACK)
      areas.push(Areas.UPPER_BACK)
      break;
    case "Core":
      areas.push(Areas.OBLIQUES)
      areas.push(Areas.GLUTEAL)
      areas.push(Areas.LOWER_BACK)
      areas.push(Areas.ABS)
      break;
    case "Calves":
      areas.push(Areas.CALVES)
      areas.push(Areas.ANKLES)
      areas.push(Areas.TIBIALIS)
      break;
    case "Shoulders":
      areas.push(Areas.DELTOIDS)
      areas.push(Areas.TRICEPS)
      break;
    case "Legs":
      areas.push(Areas.ADDUCTORS)
      areas.push(Areas.ANKLES)
      areas.push(Areas.QUADRICEPS)
      areas.push(Areas.FEET)
      areas.push(Areas.CALVES)
      areas.push(Areas.KNEES)
      areas.push(Areas.TIBIALIS)
      areas.push(Areas.ABS)
      break;
    case "Forearms":
      areas.push(Areas.FOREARM)
      break;
    case "Quadriceps":
      areas.push(Areas.QUADRICEPS)
      break;
    case "Cardio":

      break;
    case "Pecs":
      areas.push(Areas.CHEST)
      break;
    case "Hamstrings":
      areas.push(Areas.HAMSTRING)
      break;
    case "Deltoids":
      areas.push(Areas.DELTOIDS)
      break;
    case "Wrist":
      areas.push(Areas.HANDS)
      break;
    case "Chest":
      areas.push(Areas.CHEST)
      break;
    case "Biceps":
      areas.push(Areas.BICEPS)
      break;
    case "Neck":
      areas.push(Areas.NECK)
      break;
    case "Lats":
      areas.push(Areas.UPPER_BACK)
      areas.push(Areas.LOWER_BACK)
      break;
    case "Endurance":

      break;
    case "Glutes":
      areas.push(Areas.GLUTEAL)
      break;
    case "Traps":
      areas.push(Areas.TRAPEZIUS)
      break;
    case "Abs":
      areas.push(Areas.ABS)
      break;
  }
  return areas;
}