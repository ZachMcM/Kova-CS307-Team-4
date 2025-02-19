import { ExerciseErrorMessage } from "@/config";
import { ExerciseData } from "@/types/exercise-data";
import { createContext, useContext, useEffect, useState } from "react";
// provider to wrap the template form to grab values at any level

type NewTemplateFormProviderValues = {
  name: string;
  setName: (name: string) => void;
  exercises: ExerciseData[];
  setExercises: (exercises: ExerciseData[]) => void;
  nameError: string | null;
  exercisesError: string | null;
  editReps: (id: string, setIndex: number, newReps: string) => void;
  editWeight: (id: string, setIndex: number, newWeight: string) => void;
  removeSet: (id: string, setIndex: number) => void;
  addSet: (id: string) => void;
  addExercise: (exercise: any) => void;
  handleSubmit: () => void;
};

const NewTemplateContext = createContext<NewTemplateFormProviderValues | null>(
  null
);

export function NewTemplateFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [nameError, setNameError] = useState<
    null | "Name cannot be empty" | "Name cannot be longer than 100 characters"
  >(null);
  const [exercisesError, setExercisesError] = useState<null | ExerciseErrorMessage>(null);

  // debugging purposes

  useEffect(() => {
    for (const exercise of exercises) {
      console.log(exercise);
    }
  }, [exercises]);

  // removes errors in real time if there are errors

  useEffect(() => {
    //  checks if the name error is still there
    if (nameError == "Name cannot be empty") {
      if (name.length > 0) {
        setNameError(null);
      }
    }
    if (nameError == "Name cannot be longer than 100 characters") {
      if (name.length <= 100) {
        setNameError(null);
      }
    }

    // checks if the negative error is still there

    if (exercisesError == "You must have at least 1 exercise") {
      if (exercises.length > 0) {
        setExercisesError(null);
      }
    }

    if (exercisesError == "Reps cannot be negative") {
      let invalidExercises = false;

      for (const exercise of exercises) {
        for (const set of exercise.sets) {
          const repsVal = parseInt(set.reps);
          if (!isNaN(repsVal) && repsVal < 0) {
            invalidExercises = true;
          }
        }
      }

      if (!invalidExercises) {
        setExercisesError(null);
      }
    }

    if (exercisesError == "Weight cannot be negative") {
      let invalidExercises = false;

      for (const exercise of exercises) {
        for (const set of exercise.sets) {
          const weightVal = parseFloat(set.weight);
          if (!isNaN(weightVal) && weightVal < 0) {
            invalidExercises = true;
          }
        }
      }

      if (!invalidExercises) {
        setExercisesError(null);
      }
    }
  }, [name, exercises]);

  function editReps(id: string, setIndex: number, newReps: string) {
    setExercises((prevExercises) =>
      prevExercises.map((exercise) => {
        if (exercise.info.id === id) {
          return {
            ...exercise,
            sets: exercise.sets.map((set, i) =>
              i === setIndex ? { ...set, reps: newReps } : set
            ),
          };
        }
        return exercise;
      })
    );
  }
  
  function editWeight(id: string, setIndex: number, newWeight: string) {
    setExercises((prevExercises) =>
      prevExercises.map((exercise) => {
        if (exercise.info.id === id) {
          return {
            ...exercise,
            sets: exercise.sets.map((set, i) =>
              i === setIndex ? { ...set, weight: newWeight } : set
            ),
          };
        }
        return exercise;
      })
    );
  }

  function removeSet(id: string, setIndex: number) {
    setExercises(
      exercises.map((exercise) => {
        if (exercise.info.id === id) {
          return {
            ...exercise,
            sets: exercise.sets.filter((_, i) => i !== setIndex),
          };
        }
        return exercise;
      })
    );
  }

  function addSet(id: string) {
    setExercises(
      exercises.map((exercise) => {
        if (exercise.info.id === id) {
          return {
            ...exercise,
            sets: [...exercise.sets, { reps: "0", weight: "0" }],
          };
        }
        return exercise;
      })
    );
  }

  function addExercise(exercise: any) {
    setExercises([
      ...exercises,
      {
        info: exercise,
        sets: [
          {
            reps: "0",
            weight: "0",
          },
        ],
      },
    ]);
  }

  function handleSubmit() {
    if (name.length < 1) {
      setNameError("Name cannot be empty");
      return;
    }
    if (name.length > 100) {
      setNameError("Name cannot be longer than 100 characters");
      return;
    }
    if (exercises.length === 0) {
      setExercisesError("You must have at least 1 exercise");
      return;
    }

    for (const exercise of exercises) {
      for (const set of exercise.sets) {
        // error checking for reps
        const repsVal = parseInt(set.reps)
        if (repsVal < 0) {
          setExercisesError("Reps cannot be negative");
          return;
        }
        if (isNaN(repsVal)) {
          setExercisesError("Reps must be a valid number")
        }
    
        // error checking for weight
        const weightVal = parseInt(set.weight)
        if (weightVal < 0) {
          setExercisesError("Weight cannot be negative");
          return;
        }
        if (isNaN(weightVal)) {
          setExercisesError("Weight must be a valid number")
        }
      }
    }

    // TODO handle submit in database
  }

  return (
    <NewTemplateContext.Provider
      value={{
        name,
        setName,
        exercises,
        setExercises,
        nameError,
        exercisesError,
        editReps,
        editWeight,
        addSet,
        removeSet,
        addExercise,
        handleSubmit,
      }}
    >
      {children}
    </NewTemplateContext.Provider>
  );
}

export function useNewTemplateFormValues() {
  const context = useContext(NewTemplateContext);
  if (context === null) {
    throw new Error(
      "useNewTemplateFormValues must be used within a NewTemplateFormProvider"
    );
  }
  return context as NewTemplateFormProviderValues;
}
