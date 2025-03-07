import { supabase } from "@/lib/supabase";
import { LikeRelation } from "@/types/extended-types";



export async function getLikes(): Promise<LikeRelation[]> {
    const {data, error} = await supabase
        .from("likeRel")
        .select('post_id,user_id');
    
    if (error) {
        throw new Error(error.message);
    }

    const likeRelations = data.map((likeInfo) => ({
        postId: likeInfo.post_id,
        userId: likeInfo.user_id
    }));
    return likeRelations as LikeRelation[]
}

export function getNumOfLikes(postId: string, likeRelations: LikeRelation[]): number {
    let count = 0;
    for (const likeRel of likeRelations) {
        if (likeRel.postId === postId) {
            count++;
        }
    }
    return count;
}

export function getIfUserLikes(postId: string, userId: string, likeRelations: LikeRelation[]): boolean {
    for (const likeRel of likeRelations) {
        if (likeRel.postId === postId && likeRel.userId === userId) {
            return true;
        }
    }
    return false;
}

export async function addUserLike(postId: string, userId: string, likeRelations: LikeRelation[]) {
    likeRelations.push({postId, userId});
    supabase.from('likeRel')
        .insert({post_id: postId, user_id: userId});
}

export async function removeUserLike(postId: string, userId: string, likeRelations: LikeRelation[]) {
    for (let i = 0; i < likeRelations.length; i++) {
        if (likeRelations[i].postId === postId && likeRelations[i].userId === userId) {
            likeRelations.splice(i, 1);
            break;
        }
    }
    supabase.from('likeRel')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
}

