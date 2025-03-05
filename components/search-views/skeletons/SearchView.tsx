// Each requires two things: a callback function to determine which item was selected (Determined by ID)
// and a list of items
import {SearchItem, WordCounter, sortItemList} from "@/types/searcher-types"
import { Component } from "react";

export default function SearchView(items: SearchItem[], callback: (id: string) => void, templateGetter: (id: string) => any) {

}