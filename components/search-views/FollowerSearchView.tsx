import { PublicProfile } from "@/types/profile-types";
import { View } from "react-native";

export default function FollowerSearchView({ data, selectionCallback, displayGetter} : 
        { data: PublicProfile[], selectionCallback: (id: string) => void, displayGetter: (id:string) => View}){
    return ;
}