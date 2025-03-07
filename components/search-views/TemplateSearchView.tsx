import { templatesToSearch } from "@/types/searcher-types";
import { Workout } from "@/types/workout-types";
import { TouchableOpacity, View } from "react-native";
import SearchView from "./skeletons/SearchView";
import { Card } from "../ui/card";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

export default function FollowerSearchView({ data, selectionCallback} : 
        { data: Workout[], selectionCallback: (id: string) => void}){
    let items = templatesToSearch(data);
    return SearchView(items, selectionCallback, (id) => {
        for (const element of data) {
            if (element.templateId == id) {
                return (<TouchableOpacity onPress={() => {selectionCallback(element.templateId);}}>
                            <VStack>
                                <Text>{element.templateName}</Text>
                            </VStack>
                        </TouchableOpacity>);
            }
        }
        return (<Card></Card>);
    });
}