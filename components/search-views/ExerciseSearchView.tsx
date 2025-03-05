import { Component } from "react";
import { Card } from "../ui/card";
import { ExtendedExercise } from "@/types/extended-types";
<<<<<<< Updated upstream
import { View } from "react-native-reanimated/lib/typescript/Animated";
import { TaggedSearchItem, exercisesToSearch} from "@/types/searcher-types";

export default function ExerciseSearchView({ data, selectionCallback, displayGetter} : 
        { data: ExtendedExercise[], selectionCallback: (id: string) => void, displayGetter: (id:string) => View}){
    TaggedSearchItem[]
    return ;
=======
import { TaggedSearchItem, exercisesToSearch } from "@/types/searcher-types";
import TaggedSearchView from "./skeletons/TaggedSearchView";

export default function ExerciseSearchView({ data, selectionCallback} : 
        { data: ExtendedExercise[], selectionCallback: (id: string) => void}){
    let items = exercisesToSearch(data);
    return TaggedSearchView(data, selectionCallback, (id) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].id = id) {
                return new ExerciseCard
            }
        }
        return null;
    });
>>>>>>> Stashed changes
}