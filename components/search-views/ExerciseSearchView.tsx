import { Component } from "react";
import { Card } from "../ui/card";
import { ExtendedExercise } from "@/types/extended-types";
import { TaggedSearchItem, exercisesToSearch } from "@/types/searcher-types";
import TaggedSearchView from "./skeletons/TaggedSearchView";
import ExerciseCard from "../forms/workout-template/ExerciseCard";
import { TouchableOpacity } from "react-native";

export default function ExerciseSearchView({ data, selectionCallback} : 
        { data: ExtendedExercise[], selectionCallback: (id: string) => void}){
    let items = exercisesToSearch(data);
    return TaggedSearchView(items, (id) => {
        for (const element of data) {
            if (element.id == id) {
                return (<TouchableOpacity onPress={() => {selectionCallback(element.id);}}>
                            <ExerciseCard exercise={element}/>
                        </TouchableOpacity>);
            }
        }
        return <Card></Card>;
    });
}