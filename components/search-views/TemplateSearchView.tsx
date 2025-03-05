import { templatesToSearch } from "@/types/searcher-types";
import { Workout } from "@/types/workout-types";
import { View } from "react-native";
import SearchView from "./skeletons/SearchView";
import { Card } from "../ui/card";

export default function FollowerSearchView({ data, selectionCallback, displayGetter} : 
        { data: Workout[], selectionCallback: (id: string) => void, displayGetter: (id:string) => View}){
    let items = templatesToSearch(data);
    return SearchView(items, selectionCallback, (id) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].templateId = id) {
                
            }
        }
        return (<Card></Card>);
    });
}