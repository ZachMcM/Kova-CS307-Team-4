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
  editReps: (id: string, setIndex: number, newReps: number) => void;
  editWeight: (id: string, setIndex: number, newWeight: number) => void;
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
  const [nameError, setNameError] = useState<null | string>(null);
  const [exercisesError, setExercisesError] = useState<null | string>(null);

  // debugging purposes 

  useEffect(() => {
    console.log(exercises)
  }, [exercises])

  function editReps(id: string, setIndex: number, newReps: number) {
    setExercises(exercises.map((exercise) => {
      if (exercise.info.id === id) {
        return {
          ...exercise,
          sets: exercise.sets.map((set, i) => {
            if (i === setIndex) {
              return {
                ...set,
                reps: newReps,
              };
            }
            return set;
          }),
        };
      }
      return exercise;
    }));
  }

  function editWeight(id: string, setIndex: number, newWeight: number) {
    setExercises(exercises.map((exercise) => {
      if (exercise.info.id === id) {
        return {
          ...exercise,
          sets: exercise.sets.map((set, i) => {
            if (i === setIndex) {
              return {
                ...set,
                weight: newWeight,
              };
            }
            return set;
          }),
        };
      }
      return exercise;
    }));
  }

  function removeSet(id: string, setIndex: number) {
    setExercises(exercises.map((exercise) => {
      if (exercise.info.id === id) {
        return {
          ...exercise,
          sets: exercise.sets.filter((_, i) => i !== setIndex),
        };
      }
      return exercise;
    }));
  }

  function addSet(id: string) {
    setExercises(exercises.map((exercise) => {
      if (exercise.info.id === id) {
        return {
          ...exercise,
          sets: [...exercise.sets, { reps: 0, weight: 0 }],
        };
      }
      return exercise;
    }));
  }

  function addExercise(exercise: any) {
    setExercises([
      ...exercises,
      {
        info: exercise,
        sets: [
          {
            reps: 0,
            weight: 0,
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
        if (set.reps < 0) {
          setExercisesError("Sets cannot be negative");
          return;
        }
        if (set.weight < 0) {
          setExercisesError("Reps cannot be negative");
          return;
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