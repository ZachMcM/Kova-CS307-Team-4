// Contains search item types, as well as some helper methods for sorting.

/** A simple search item with an id and a name.
 * * name -- the name of item.
 * * id -- the id of the item.
 */
export type SearchItem = {
    name: string;
    id: string
}

/** A simple search tag for support with the search algorithms. 
 * * (Contains 'name' and 'id' of SearchItem.)
 */
export type SearchTag = {
    name: string
};

/** A simple search item with support for tagged items.
 * * (Possesses 'name' and 'id' of SearchItem.)
 * * tags -- the tags this item has.
 * * isTag -- if this item is a tag itself. Note: either tags has at least one item
 *            or isTag is true.
 */
export type TaggedSearchItem = SearchItem & {
    tags: SearchTag[];
    isTag: boolean;
}

/** Counts how many words exist within all the terms.
  * * frequencies -- the frequencies of each word.
  * * total_items -- the total number of items in the list
  * * get_inverse_frequency -- the inverse frequency, defined as the 
  *      total number of items, minus the terms that don't have a given word.
  *     (is a loose interpretation.)
  */
export type WordCounter = {
    frequencies: Map<string, number>;
    total_items: number;
    get_inverse_frequency: (name: string) => number;
}

/** Counts how many tags exist within the item set.
 * * frequencies -- the frequencies of the tags.
 * * total_items -- the total number of items in the list
 * * get_inverse_frequency -- the inverse frequency, defined as the 
 *      total number of items, minus the items that don't have a given tag.
 *     (is a loose interpretation.)
 */
export type TagCounter = {
    tag_frequencies: Map<string, number>;
    total_items: number;
    get_inverse_frequency: (tag: string) => number;
}

// BASIC CREATORS

/**
 * Creates a basic SearchItem.
 * 
 * @param name -- The name of the item.
 * @param id -- The id of the item.
 * @returns a SearchItem
 */
export function createSearchItem(name: string, id: string) : SearchItem {
    let item = {name: name, id: id};
    return item;
}

/**
 * Creates a basic SearchTag
 * @param name -- The name of the item.
 * @param id -- The id of the tag.
 * @returns a SearchTag
 */
export function createSearchTag(name: string, id: string) : SearchTag {
    let tag = {name: name};
    return tag;
}

/**
 * Creates a SearchTaggedItem, representing either an item or a tag.
 * 
 * @param name -- The name of the item.
 * @param tags -- The tags of the item.
 * @param id -- The id of the item.
 * @param isTag -- If the item is itself a tag.
 * @returns a SearchTaggedItem
 */
export function createSearchTaggedItem(name: string, 
        tags: SearchTag[], 
        id: string, 
        isTag: boolean) : TaggedSearchItem {
    let item = {name: name, tags: tags, id: id, isTag: isTag};
    return item;
}

/**  Returns a word counter from a list.
 * 
 * @param terms -- the terms to build the word counter from.
 * @returns a WordCounter
 */
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

/** Returns a tag counter from a list of items.
 * @param items -- the items to build the tag counter from. Assumed that each
 *            tag only has only unique tags.
 * @returns a TagCounter
 */
export function createTagCounter(items: TaggedSearchItem[]): TagCounter {
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

// COMPARERS

/** Conducts a score calculation for regular items. Simply checks if any 
 *      word in the query matches that of the item. If true, the score is
 *      incremented based on the inverse frequency.
 * @param query -- the query itself
 * @param item -- the item to compare to.
 * @param counter -- the counter that helps to find the frequency.
 */
function compare_to_query(query: String, 
        item: SearchItem, 
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

/** Conducts a search for tagged items. Performs the basic 'compare_to', as well as 
 *      doubling any score values that come from matching a tag. Tag scores are also
 *      calculated using inverse frequency.
 * @param query -- the query itself
 * @param item -- the item to compare to
 * @param counter -- the counter that helps to find the frequency.
 * @param selectedTags -- the selected tags to filter by. If blank, ignore.
 * @returns the score of the given item.
 */
function compare_to_tagged_query(query: string,
        item: TaggedSearchItem,
        wordCounter: WordCounter,
        tagCounter: TagCounter,
        selectedTags: SearchTag[]): number {
    let containsATag = selectedTags.length == 0;
    selectedTags.forEach((tag) => {
        if (item.tags.includes(tag)) {
            containsATag = true;
        }
    });
    if (!containsATag && !item.isTag) {
        return -1;
    }

    let score = compare_to_query(query, item, wordCounter);
    if (item.isTag) {
        score *= 2;
    }
    else {
        let terms = query.split(" ");
        terms.forEach( (term) => {
            item.tags.forEach( (tag) => {
                if (tag.name.includes(term)) {
                    score += tagCounter.get_inverse_frequency(tag.name);
                }
            });
        });
    }
    return score;
}

// SORTERS

/**
 * Sorts a given list based on scores. Is a helper method. Highest scores are prioritized.
 * 
 * @param items The items to sort.
 * @param scores The scores associated with each item, pre-calculated.
 */
function sort_list(items: SearchItem[],
        scores: Map<string, number>): void {
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

/**
 * Sorts a list of untagged items.
 * 
 * @param query The query to compare to.
 * @param items The list of search items.
 * @param wordCounter The word counter to find inverse-frequency.
 */
export function sort_item_list(query: String,
        items: SearchItem[],
        wordCounter :WordCounter): void {
    let idToScore = new Map<string, number>();
    items.forEach((item) => {
        idToScore.set(item.id, compare_to_query(query, item, wordCounter));
    });
    sort_list(items, idToScore);
}

/**
 * Sorts a list of tagged items.
 * 
 * @param query The query to compare to.
 * @param items The list of search items.
 * @param selected_tags The tags that must be present, or none if they don't matter.
 * @param wordCounter The word counter to find inverse-frequency.
 * @param tagCounter The tag counter to find inverse-frequency.
 */
export function sort_tagged_list(query: string,
        items: TaggedSearchItem[],
        selected_tags: SearchTag[],
        wordCounter: WordCounter,
        tagCounter: TagCounter): void {
    let idToScore = new Map<string, number>();
    items.forEach((item) => {
        idToScore.set(item.id, compare_to_tagged_query(query, item, wordCounter,
            tagCounter, selected_tags));
    });
    sort_list(items, idToScore);
}

