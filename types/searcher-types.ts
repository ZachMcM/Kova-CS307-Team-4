// Contains search item types, as well as some helper methods for sorting.

import ExerciseDataForm from "@/components/forms/workout-template/ExerciseDataForm";
import { Tables } from "./database.types";
import { ExtendedExercise } from "./extended-types";
import { PublicProfile } from "./profile-types";
import { Workout } from "./workout-types";

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
  * * totalItems -- the total number of items in the list
  * * getInverseFrequency -- the inverse frequency, defined as the 
  *      total number of items, minus the terms that don't have a given word.
  *     (is a loose interpretation.)
  */
export type WordCounter = {
    frequencies: Map<string, number>;
    totalItems: number;
    getInverseFrequency: (name: string) => number;
}

/** Counts how many tags exist within the item set.
 * * frequencies -- the frequencies of the tags.
 * * totalItems -- the total number of items in the list
 * * getInverseFrequency -- the inverse frequency, defined as the 
 *      total number of items, minus the items that don't have a given tag.
 *     (is a loose interpretation.)
 */
export type TagCounter = {
    tagFrequencies: Map<string, number>;
    totalItems: number;
    getInverseFrequency: (tag: string) => number;
}

// BASIC CREATORS

/**
 * Creates a basic SearchItem.
 * 
 * @param name -- The name of the item.
 * @param id -- The id of the item.
 * @returns a SearchItem
 */
function createSearchItem(name: string, id: string) : SearchItem {
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
function createSearchTaggedItem(name: string, 
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
        totalItems: 0, 
        getInverseFrequency: (name: string) => {
            if (!counter.frequencies.has(name)) {
                return 0;
            }
            return counter.totalItems - counter.frequencies.get(name)!;
        }};
    terms.forEach((term) => {
        let words = term.split(" ");
        let wordsPresent = new Set<string>();
        counter.totalItems++;
        words.forEach((word) => {
            if (!wordsPresent.has(word)) {
                if (!counter.frequencies.has(word)) {
                    counter.frequencies.set(word, 0);
                }
                counter.frequencies.set(word, counter.frequencies.get(word)! + 1);
                wordsPresent.add(word);
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
    let counter = {tagFrequencies: new Map<string, number>(),
        totalItems: 0,
        getInverseFrequency: (tag: string) => {
            if (!counter.tagFrequencies.has(tag)) {
                return 0;
            }
            return counter.totalItems - counter.tagFrequencies.get(tag)!;
        }};
    items.forEach((taggedItem) => {
        counter.totalItems++;
        taggedItem.tags.forEach((tag) => {
            if (!counter.tagFrequencies.has(tag.name)) {
                counter.tagFrequencies.set(tag.name, 0);
            }
            counter.tagFrequencies.set(tag.name,
                counter.tagFrequencies.get(tag.name)! + 1);
        });
    });
    return counter;
}

// ADVANCED CREATORS [For user stories]

/**
 * Converts a list of followers to a list of search items.
 * 
 * @param followers -- the followers to create the list from.
 * 
 * @returns a list of SearchItems
 */
export function followerToSearch(followers: PublicProfile[]) : SearchItem[] {
    let sItems: SearchItem[] = [];
    followers.forEach((follower) => {
        sItems.push(createSearchItem(follower.username, follower.user_id));
    });
    return sItems;
}

/**
 * Converts a list of friends to a list of search items.
 * 
 * @param friends -- the friends to create the list from.
 * 
 * @returns a list of SearchItems
 */
export function friendsToSearch(friends: PublicProfile[]) : SearchItem[] {
    let sItems: SearchItem[] = [];
    friends.forEach((friend) => {
        sItems.push(createSearchItem(friend.username, friend.user_id));
    });
    return sItems;
}

/**
 * Converts a list of templates to a list of search items.
 * 
 * @param templates -- the templates to create the list from.
 * 
 * @returns a list of SearchItems
 */
export function templatesToSearch(templates: Workout[]) : SearchItem[] {
    let sItems: SearchItem[] = [];
    templates.forEach((template) => {
        sItems.push(createSearchItem(template.templateName, template.templateId));
    });
    return sItems;
}

/**
 * Converts a list of exercises to a list of search items.
 * 
 * @param exercises -- the exercises to create the list from.
 * 
 * @returns a list of TaggedSearchItems.
 */
export function exercisesToSearch(exercises: ExtendedExercise[]) : TaggedSearchItem[] {
    let tSItems: TaggedSearchItem[] = [];
    let nameToTag = new Map<string, SearchTag>();
    exercises.forEach((exercise) => {
        let searchTags: SearchTag[] = [];
        exercise.tags.forEach((tag: Tables<'tag'>) => {
            if (!nameToTag.has(tag.name!)) {
                nameToTag.set(tag.name!, createSearchTag(tag.name!, tag.id));
                // tSItems.push(createSearchTaggedItem(tag.name, [], tag.id, true));
            }
            searchTags.push(nameToTag.get(tag.name!)!);
        });
        tSItems.push(createSearchTaggedItem(exercise.name!, searchTags, exercise.id, false));
    });
    return tSItems;
}

// COMPARERS

/** Conducts a score calculation for regular items. Simply checks if any 
 *      word in the query matches that of the item. If true, the score is
 *      incremented based on the inverse frequency.
 * @param query -- the query itself
 * @param item -- the item to compare to.
 * @param counter -- the counter that helps to find the frequency.
 */
function compareToQuery(query: string, 
        item: SearchItem, 
        counter: WordCounter): number {
    let score = 0;
    let terms = query.split(" ");
    terms.forEach( (term) => {
        if (item.name.includes(term)) {
            score += counter.getInverseFrequency(term) + term.length;
        }
    });
    return score;
}

/** Conducts a search for tagged items. Performs the basic 'compareTo', as well as 
 *      doubling any score values that come from matching a tag. Tag scores are also
 *      calculated using inverse frequency.
 * @param query -- the query itself
 * @param item -- the item to compare to
 * @param counter -- the counter that helps to find the frequency.
 * @param selectedTags -- the selected tags to filter by. If blank, ignore.
 * @returns the score of the given item.
 */
function compareToTaggedQuery(query: string,
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

    let score = compareToQuery(query, item, wordCounter);
    if (item.isTag) {
        score *= 2;
    }
    else {
        let terms = query.split(" ");
        terms.forEach( (term) => {
            item.tags.forEach( (tag) => {
                if (tag.name.includes(term)) {
                    score += 2 * (tagCounter.getInverseFrequency(tag.name) + term.length);
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
function sortList(items: SearchItem[],
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
export function sortItemList(query: string,
        items: SearchItem[],
        wordCounter :WordCounter): void {
    let idToScore = new Map<string, number>();
    items.forEach((item) => {
        idToScore.set(item.id, compareToQuery(query, item, wordCounter));
    });
    sortList(items, idToScore);
}

/**
 * Sorts a list of tagged items.
 * 
 * @param query The query to compare to.
 * @param items The list of search items.
 * @param selectedTags The tags that must be present, or none if they don't matter.
 * @param wordCounter The word counter to find inverse-frequency.
 * @param tagCounter The tag counter to find inverse-frequency.
 */
export function sortTaggedList(query: string,
        items: TaggedSearchItem[],
        selectedTags: SearchTag[],
        wordCounter: WordCounter,
        tagCounter: TagCounter): void {
    let idToScore = new Map<string, number>();
    items.forEach((item) => {
        idToScore.set(item.id, compareToTaggedQuery(query, item, wordCounter,
            tagCounter, selectedTags));
    });
    sortList(items, idToScore);
}

