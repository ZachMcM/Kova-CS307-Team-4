// Contains search item types, as well as some helper methods for sorting.

export type Item = {
    name: string;
    id: number
}

export type Tag = {
    name: string;
}

export type TaggedItem = Item & {
    tags: Tag[];
}

// Counts how many words exist within all the terms.
// * frequencies -- the frequencies of each word.
// * total_items -- the total number of items in the list
// * get_inverse_frequency -- the inverse frequency, defined as the 
//      total number of items, minus the terms that don't have a given word.
//      (is a loose interpretation.)
export interface WordCounter {
    frequencies: Map<string, number>;
    total_items: number;
    get_inverse_frequency: (name: string) => number;
}

// Counts how many tags exist within the item set.
// * frequencies -- the frequencies of the tags.
// * total_items -- the total number of items in the list
// * get_inverse_frequency -- the inverse frequency, defined as the 
//      total number of items, minus the items that don't have a given tag.
//      (is a loose interpretation.)
export interface TagCounter {
    tag_frequencies: Map<string, number>;
    total_items: number;
    get_inverse_frequency: (tag: string) => number;
}

export function createItem(name: string, id: number) : Item {
    let item = {name: name, id: id};
    return item;
}

export function createTag(name: string) : Tag {
    let tag = {name: name};
    return tag;
}

export function createTaggedItem(name: string, tags: Tag[], id: number) : TaggedItem {
    let item = {name: name, tags: tags, id: id};
    return item;
}

// Returns a word counter from a list.
// * terms -- the terms to build the word counter from.
export function createWordCounter(terms: string[]): WordCounter {
    let counter = {frequencies: new Map<string, number>(),
        total_items: 0, 
        get_inverse_frequency: (name: string) => {
            return counter.total_items - counter.frequencies.get(name)!;
        }};
    terms.forEach((term) => {
        let words = term.split(" ");
        let words_present = new Set<string>();
        counter.total_items++;
        words.forEach((word) => {
            if (!words_present.has(word)) {
                if (!counter.frequencies.has(word)) {
                    counter.frequencies.set(word, 0);
                }
                counter.frequencies.set(word, counter.frequencies.get(word)! + 1);
                words_present.add(word);
            }
        });
    });
    return counter;
}

// Returns a tag counter from a list.
// * items -- the items to build the tag counter from. Assumed that each
//            tag only has only unique tags.
export function createTagCounter(items: TaggedItem[]): TagCounter {
    let counter = {tag_frequencies: new Map<string, number>(),
        total_items: 0,
        get_inverse_frequency: (tag: string) => {
            return counter.total_items - counter.tag_frequencies.get(tag)!;
        }};
    items.forEach((taggedItem) => {
        counter.total_items++;
        taggedItem.tags.forEach((tag) => {
            if (!counter.tag_frequencies.has(tag.name)) {
                counter.tag_frequencies.set(tag.name, 0);
            }
            counter.tag_frequencies.set(tag.name,
                counter.tag_frequencies.get(tag.name)! + 1);
        });
    });
    return counter;
}

// Conducts a search for regular items.
// * query -- the query itself
// * item -- the item to compare to
// * counter -- the counter that helps to find the frequency.
function compare_to_query(query: String, 
        item: Item, 
        counter: WordCounter): number {
    let score = 0;
    let terms = query.split(" ");
    terms.forEach( (term) => {
        if (item.name.includes(term)) {
            score += counter.get_inverse_frequency(term);
        }
    });
    return score;
}

// Conducts a search for tagged items.
// * query -- the query itself
// * item -- the item to compare to
// * counter -- the counter that helps to find the frequency.
// * selectedTags -- the selected tags to filter by. If blank, ignore.
function compare_to_tagged_query(query: string,
        item: TaggedItem,
        wordCounter: WordCounter,
        tagCounter: TagCounter,
        selectedTags: Tag[]): number {
    let score = compare_to_query(query, item, wordCounter);
    let terms = query.split(" ");
    terms.forEach( (term) => {
        item.tags.forEach( (tag) => {
            if (tag.name.includes(term)) {
                score += tagCounter.get_inverse_frequency(tag.name);
            }
        });
    });
    let containsATag = selectedTags.length == 0;
    selectedTags.forEach((tag) => {
        if (item.tags.includes(tag)) {
            containsATag = true;
        }
    });
    if (!containsATag) {
        score = -1;
    }
    return score;
}

function sort_list(items: Item[],
        scores: Map<number, number>): void {
    for (let i = 0; i < items.length; i++) {
        let maxScore = scores.get(items[i].id)!;
        let position = i;
        for (let j = i + 1; j < items.length; j++) {
            let score = scores.get(items[j].id)!;
            if (score > maxScore) {
                maxScore = score;
                position = j;
            }
        }
        let holder = items[i];
        items[i] = items[position];
        items[position] = items[i];
    }
}

export function sort_item_list(query: String,
        items: Item[],
        wordCounter :WordCounter): void {
    let idToScore = new Map<number, number>();
    items.forEach((item) => {
        idToScore.set(item.id, compare_to_query(query, item, wordCounter));
    });
    sort_list(items, idToScore);
}

export function sort_tagged_list(query: string,
        items: TaggedItem[],
        selected_tags: Tag[],
        wordCounter: WordCounter,
        tagCounter: TagCounter): void {
    let idToScore = new Map<number, number>();
    items.forEach((item) => {
        idToScore.set(item.id, compare_to_tagged_query(query, item, wordCounter,
            tagCounter, selected_tags));
    });
    sort_list(items, idToScore);
}