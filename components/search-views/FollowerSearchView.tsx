import { PublicProfile } from "@/types/profile-types";
import { followerToSearch } from "@/types/searcher-types";
import { TouchableOpacity, View } from "react-native";
import SearchView from "./skeletons/SearchView";
import { Card } from "../ui/card";
import { VStack } from "../ui/vstack";
import { Text } from "../ui/text";

export default function FollowerSearchView({ data, selectionCallback} : 
        { data: PublicProfile[], selectionCallback: (id: string) => void}){
    let items = followerToSearch(data);
    return SearchView(items, selectionCallback, (id) => {
        for (const element of data) {
            if (element.user_id == id) {
                return (<TouchableOpacity onPress={() => {selectionCallback(element.user_id);}}>
                            <VStack>
                                <Text>{element.username}</Text>
                            </VStack>
                        </TouchableOpacity>);
            }
        }
        return (<Card></Card>);
    });
}