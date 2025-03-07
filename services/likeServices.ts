import { supabase } from "@/lib/supabase";
import { LikeRelation } from "@/types/extended-types";



export async function getLikes(postId: string): Promise<LikeRelation[]> {
    const {data, error} = await supabase
        .from("likeRel")
        .select('post_id,user_id')
        .eq('post_id',postId);
    
    if (error) {
        throw new Error(error.message);
    }

    const likeRelations = data.map((likeInfo) => ({
        postId: likeInfo.post_id,
        userId: likeInfo.user_id
    }));
    if (likeRelations == undefined) {
        return [] as LikeRelation[];
    }
    return likeRelations as LikeRelation[]
}

export function getNumOfLikes(likeRelations: LikeRelation[], userId: string, userHasLiked: boolean): number {
    console.log("Testing -- " + doesUserLike(userId, likeRelations) + ", " + userHasLiked);
    return likeRelations.length + ((userHasLiked && 
        !(doesUserLike(userId, likeRelations))) ? 1 : 0);
}

export function doesUserLike(userId: string, likeRelations: LikeRelation[]): boolean {
    for (const likeRel of likeRelations) {
        if (likeRel.userId === userId) {
            return true;
        }
    }
    return false;
}

export async function addUserLike(postId: string, userId: string) {
    console.log("Adding user like");
    let {data, error} = await supabase.from('likeRel')
        .insert({post_id: postId, user_id: userId});
    console.log(error);
    console.log(data);
}

export async function removeUserLike(postId: string, userId: string) {
    console.log("removing user like");
    let {data, error} = await supabase.from('likeRel')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
    console.log(error);
    console.log(data);
}

