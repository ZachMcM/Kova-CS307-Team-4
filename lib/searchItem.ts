export interface Item {
    name: String;
}

export interface Tag {
    name: String
}

export interface TaggedItem extends Item {
    tags: Array<Tag>;
}

function compare_to_query(query: string, item: Item): number {
    let query_counter = new Map<string, number>();
    let item_counter = new Map<string, number>();
    for (var i = 0; i < query.length; i++) {
        let letter = query[i]
        if (query_counter.has(letter)) {
            query_counter.set(letter, query_counter.get(letter) + 1);
        }
        else {
            query_counter.set(query[i], 1);
        }
    }
    for (var i = 0; i < item.name.length; i++) {
        let letter = item.name[i]
        if (item_counter.has(letter)) {
            item_counter.set(letter, item_counter.get(letter) + 1);
        }
        else {
            item_counter.set(letter, 1);
        }
    }
    var score = 0
    for (let [key, val] of query_counter) {
        if (item_counter.has(key)) {
            let item_val = item_counter.get(key)
            if (item_val >= val) {
                score += val;
            }
            else {
                score += item_val;
            }
        }
    }
    return score;
}