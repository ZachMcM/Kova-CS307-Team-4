import { supabase } from "@/lib/supabase";
//import { sampleProfileId } from "@/sample-data/sampleProfile";

export interface PostData {
  title: string;
  description: string;
  location?: string;
  isPublic: boolean;
  imageUrl?: string;
  workoutData?: any; // Replace with proper workout data type when available
}
/*
// Function to create a new post
export const createPost = async (postData: PostData) => {
  // TODO: Replace with actual session.user.profile.id
  const { data: post, error } = await supabase
    .from("post")
    .insert({
      ...postData,
      profileId: sampleProfileId,
      createdAt: new Date().toISOString(),
    })
    .select();

  if (error) throw new Error(error.message);
  return post;
};

// Function to get all posts (with optional filtering)
export const getPosts = async (isPublicOnly = false) => {
  let query = supabase
    .from("post")
    .select(`
      *,
      profile:profileId(*)
    `)
    .order("createdat", { ascending: false });

  if (isPublicOnly) {
    query = query.eq("isPublic", true);
  } else {
    // If not public only, get all public posts plus the user's private posts
    query = query.or(`isPublic.eq.true,profileId.eq.${sampleProfileId}`);
  }

  const { data: posts, error } = await query;

  if (error) throw new Error(error.message);
  return posts || [];
};

// Function to get a single post by ID
export const getPostById = async (postId: string) => {
  const { data: post, error } = await supabase
    .from("post")
    .select(`
      *,
      profile:profileId(*)
    `)
    .eq("id", postId)
    .single();

  if (error) throw new Error(error.message);
  return post;
};

// Function to update a post
export const updatePost = async (postId: string, postData: Partial<PostData>) => {
  const { data: updatedPost, error } = await supabase
    .from("post")
    .update(postData)
    .eq("id", postId)
    .eq("profileId", sampleProfileId) // Ensure user can only update their own posts
    .select();

  if (error) throw new Error(error.message);
  return updatedPost;
};

// Function to delete a post
export const deletePost = async (postId: string) => {
  const { error } = await supabase
    .from("post")
    .delete()
    .eq("id", postId)
    .eq("profileId", sampleProfileId); // Ensure user can only delete their own posts

  if (error) throw new Error(error.message);
  return true;
};
*/
// Function to upload an image for a post
export const uploadPostImage = async (uri: string, profileId: string, fileType = 'image/jpeg') => {
  try {
    const fileName = `post_${Date.now()}.jpg`;
    const filePath = `posts/${profileId}/${fileName}`;
    
    // Convert URI to Blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filePath, blob, {
        contentType: fileType,
        upsert: true,
      });
    
    if (error) throw new Error(error.message);
    
    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}; 

const convertBlobToFile = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, { type: blob.type, lastModified: Date.now() });
};

export const uploadPostImages = async (userId: string, files: File[]) => {
  console.log("UPLOADING IMAGES");
  console.log("userId: " + userId);

  if (files.length === 0) {
    return null;
  }

  try {
    const publicURLs: string[] = [];

    for (const file of files) {
      const fileName = file.name || `image_${Date.now()}`; // Use the file's name or a fallback
      const filePath = `${userId}/${fileName}`;

      console.log("Uploading:", fileName);

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file, {
          contentType: file.type, // Use the file's MIME type
          upsert: true, // Overwrite if the file already exists
        });

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        throw new Error(`Failed to upload file: ${fileName}`);
      }

      console.log("Uploaded:", fileName);

      // Get the public URL for the uploaded file
      const { data: publicURLData} = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      if (!publicURLData || !publicURLData.publicUrl) {
        throw new Error(`Public URL is undefined for file: ${fileName}`);
      }

      publicURLs.push(publicURLData.publicUrl);
    }

    return publicURLs;
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
};
/*
export const getPostDetailsById = async (postId: string) => {
  const { data: post, error } = await supabase
    .from("post")
    .select(`
      *,
      profile:profileId(*)
    `)
    .eq("id", postId)
    .single();

  if (error) throw new Error(error.message);
  return post;
}
  */