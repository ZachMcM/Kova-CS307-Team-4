import {TaggedSearchItem, WordCounter, TagCounter, sortTaggedList, createWordCounter, createTagCounter} from "@/types/searcher-types"
import { Component, useState } from "react";
import { Text } from "../../ui/text";
import { ScrollView } from "@/components/ui/scroll-view";
import { Card } from "@/components/ui/card";
import { View } from "@/components/ui/view";
import { StyleSheet, TextInput } from "react-native";

export default function TaggedSearchView(items: TaggedSearchItem[],
    templateGetter: (id: string) => any) {
    const [content, onContentChange] = useState('');
    let wordCounter = createWordCounter(items);
    let tagCounter = createTagCounter(items);
    let displayItems = createDisplayItems(items, templateGetter);
    let [itemOrder, setItemOrder] = useState(displayItems);

    return (<View style={styles.itemContainer}>
            <TextInput style={styles.searchBox}
                onChangeText={onContentChange}
                value={content}
                onChange={
                    () => {
                        sortTaggedList(content, items, [], wordCounter, tagCounter);
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

function createDisplayItems(items: TaggedSearchItem[], 
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