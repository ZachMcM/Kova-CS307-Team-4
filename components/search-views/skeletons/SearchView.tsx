import {SearchItem, WordCounter, createWordCounter, sortItemList} from "@/types/searcher-types"
import { Component, useState } from "react";
import { Text } from "../../ui/text";
import { View } from "@/components/ui/view";
import { ScrollView } from "@/components/ui/scroll-view";
import { StyleSheet, TextInput } from "react-native";

export default function SearchView(items: SearchItem[],
        callback: (id: string) => void,
        templateGetter: (id: string) => any) {
    const [content, onContentChange] = useState('');
    let wordCounter = createWordCounter(items);
    let displayItems = createDisplayItems(items, templateGetter);
    let [itemOrder, setItemOrder] = useState(displayItems);

    return (<View style={styles.itemContainer}>
            <TextInput style={styles.searchBox}
                onChangeText={onContentChange}
                value={content}
                onChange={
                    () => {
                        sortItemList(content, items, wordCounter);
                        setItemOrder(createDisplayItems(items, templateGetter));
                    }
                }/>

            (<ScrollView style={styles.scrollView}>
                {
                    itemOrder.map((item, index) => (
                        item
                    ))
                }
            </ScrollView>);
        </View>)
}

function createDisplayItems(items: SearchItem[], 
        templateGetter: (id: string) => any) : any[] {
    let displayItems: any[] = [];
    for (const element of items) {
        displayItems.push(templateGetter(element.id));
    }
    return displayItems;
}

const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
   
    itemContainer: {
      padding: 16,
    },
  
    searchBox: {
      alignItems: 'center',
      flex: 1,
    },
    
    searchText: {
      color: '#66666',
      marginTop: 8,
    },

    searchIcon: {
      color: 'white',
    },
  });