import { Component } from "react";
import { Card } from "../ui/card";
import { ExtendedExercise } from "@/types/extended-types";
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
}