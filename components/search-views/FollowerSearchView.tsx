import { PublicProfile } from "@/types/profile-types";
import { followerToSearch } from "@/types/searcher-types";
import { View } from "react-native";
import SearchView from "./skeletons/SearchView";
import { Card } from "../ui/card";

export default function FollowerSearchView({ data, selectionCallback, displayGetter} : 
        { data: PublicProfile[], selectionCallback: (id: string) => void, displayGetter: (id:string) => View}){
    let items = followerToSearch(data);
    return SearchView(items, selectionCallback, (id) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].user_id = id) {
                
            }
        }
        return (<Card></Card>);
    });
}