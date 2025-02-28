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
    let score = 0;
    let terms = query.split(" ");
    terms.forEach( (term) => {
        if (item.name.includes(term)) {
            score += term.length;
        }
    });
    return score;
}

function compare_to_tagged_query(query: string, item: TaggedItem): number {
    let score = 0;
    let terms = query.split(" ");
    terms.forEach( (term) => {
        if (item.name.includes(term)) {
            score += term.length;
        }
        item.tags.forEach( (tag) => {
            if (tag.name.includes(term)) {
                score += 3 * term.length;
            }
        });
    });
    return score;
}