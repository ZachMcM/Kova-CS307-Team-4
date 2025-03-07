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

    const names: string[] = []
    for (const like of data) {
        const { data: profile, error: profileErr } = await supabase.from("profile").select('name').eq("userId", like.user_id).single()
        if (profileErr) throw new Error(profileErr.message)
        names.push(profile.name)
    }

    const likeRelations = data.map((likeInfo, i) => ({
        postId: likeInfo.post_id,
        userId: likeInfo.user_id,
        name: names[i]
    }));
    if (likeRelations == undefined) {
        return [] as LikeRelation[];
    }

    console.log("Likes", JSON.stringify(likeRelations))

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

