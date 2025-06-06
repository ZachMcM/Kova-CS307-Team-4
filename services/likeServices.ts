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

    console.log("database likes: ", JSON.stringify(data));

    const names: string[] = []
    for (const like of data) {
        const { data: profile, error: profileErr } = await supabase.from("profile").select('name, avatar').eq("userId", like.user_id).single()
        if (profileErr) throw new Error(profileErr.message)
        names.push(profile.name)
    }

    console.log("names: ", names)

    const likeRelations = data.map((likeInfo, i) => ({
        postId: likeInfo.post_id,
        userId: likeInfo.user_id,
        name: names[i]
    }));
    console.log("Like relations: " + JSON.stringify(likeRelations));
    if (likeRelations == undefined) {
        return [] as LikeRelation[];
    }

    return likeRelations as LikeRelation[]
}

export function getNumOfLikes(likeRelations: LikeRelation[], userId: string, userHasLiked: boolean): number {
    if (!likeRelations || !userId) return 0;
    return likeRelations.length + ((userHasLiked && 
        !(doesUserLike(userId, likeRelations))) ? 1 : 0);
}

export function doesUserLike(userId: string, likeRelations: LikeRelation[]): boolean {
    if (!likeRelations) return false;
    for (const likeRel of likeRelations) {
        if (likeRel && likeRel.userId === userId) {
            return true;
        }
    }
    return false;
}

export async function addUserLike(postId: string, userId: string) {
    let {data, error} = await supabase.from('likeRel')
        .insert({post_id: postId, user_id: userId});

    if (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export async function removeUserLike(postId: string, userId: string) {
    let {data, error} = await supabase.from('likeRel')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
        
    if (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

export async function deleteAllUserLikes(userId: string) {
    let {data, error} = await supabase.from('likeRel')
        .delete()
        .eq('user_id', userId);
    
    if (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

