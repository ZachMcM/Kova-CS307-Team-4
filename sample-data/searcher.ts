export interface Item {
    name: string;
}

export interface Tag {
    name: string;
}

export interface TaggedItem extends Item {
    tags: Tag[];
}

// Counts how many words exist within a term.
// * frequencies -- the number of frequencies.
// * total_terms -- the total number of terms in the list
// * get_inverse_frequency -- the inverse frequency, defined as the 
//      total number of terms, minus the terms that don't have a given word.
//      (is a loose interpretation.)
export interface WordCounter {
    frequencies: Map<string, number>;
    total_terms: number;
    get_inverse_frequency: (name: string) => number;
}

export interface TagCounter {
    tag_frequencies: Map<string, number>;
    total_terms: number;
    get_inverse_frequency: (tag: string) => number;
}

export function createItem(name: string) : Item {
    let item = {name: name};
    return item;
}

export function createTag(name: string) : Tag {
    let tag = {name: name};
    return tag;
}

export function createTaggedItem(name: string, tags: Tag[]) : TaggedItem {
    let item = {name: name, tags: tags};
    return item;
}

// Returns a word counter from a list.
// * terms -- the terms to build the word counter from.
export function createWordCounter(terms: string[]): WordCounter {
    let counter = {frequencies: new Map<string, number>(),
        total_terms: 0, 
        get_inverse_frequency: (name: string) => {
            return counter.total_terms - counter.frequencies.get(name)!;
        }};
    terms.forEach((term) => {
        let words = term.split(" ");
        let words_present = new Set<string>();
        counter.total_terms++;
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
export function createTagCounter(items: TaggedItem[]) {
    let counter = {tag_frequencies: new Map<string, number>(),
        total_terms: 0,
        get_inverse_frequency: (tag: string) => {
            return counter.total_terms - counter.tag_frequencies.get(tag)!;
        }};
    items.forEach((taggedItem) => {
        counter.total_terms++;
        taggedItem.tags.forEach((tag) => {
            if (!counter.tag_frequencies.has(tag.name)) {
                counter.tag_frequencies.set(tag.name, 0);
            }
            counter.tag_frequencies.set(tag.name,
                counter.tag_frequencies.get(tag.name)! + 1);
        });
    });
}

// Conducts a search for regular items.
// * query -- the query itself
// * item -- the item to compare to
// * counter -- the counter that helps to find the frequency.
export function compare_to_query(query: String, 
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