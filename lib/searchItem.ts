interface Item {
    name: String;
}

interface Tag {
    name: String
}

interface TaggedItem extends Item {
    tags: Array<Tag>;
}

function compare_items()