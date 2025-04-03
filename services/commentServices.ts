import { supabase } from "@/lib/supabase";

export type Comment = {
  id: string;
  created_at: string;
  profile: {
    userId: string;
    name: string;
    username: string;
    avatar: string;
  };
  postId: string;
  content: string;
}

export const getComments = async (postId: string, pageStart: number, pageEnd: number) => {
  const { data: commentData } = await supabase
    .from('comment')
    .select('*, profile:userId ( userId, username, name, avatar )')
    .eq("postId", postId)
    .order("created_at", { ascending: false })
    .range(pageStart, pageEnd);

    return commentData;
}

export const pushComment = async (postId: string, comment: any) => {
  try {
    // Start a transaction to ensure both operations succeed or fail together
    const { data, error } = await supabase
      .from("comment")
      .insert(comment)
      .select();
    
    if (error) {
      console.error("Error inserting comment:", error);
      throw error;
    }
    
    // Only increment the comment count if the insert was successful
    const { error: rpcError } = await supabase
      .rpc('increment_comments', { post_id: postId });
    
    if (rpcError) {
      console.error("Error incrementing comment count:", rpcError);
      throw rpcError;
    }
    
    return { data, success: true };
  } catch (err) {
    console.error("Failed to push comment:", err);
    return { error: err, success: false };
  }
}