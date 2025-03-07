import { PublicProfile } from "@/types/profile-types";
import { friendsToSearch } from "@/types/searcher-types";
import { TouchableOpacity, View } from "react-native";
import { Card } from "../ui/card";
import SearchView from "./skeletons/SearchView";
import { VStack } from "../ui/vstack";
import { Text } from "../ui/text";

export default function FriendSearchView({ data, selectionCallback} : 
    { data: PublicProfile[], selectionCallback: (id: string) => void,}){
    let items = friendsToSearch(data);
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