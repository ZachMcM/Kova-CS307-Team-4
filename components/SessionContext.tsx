import { supabase } from "@/lib/supabase";
import { deleteAllUserFavorites } from "@/services/exerciseServices";
import { leaveAllUserGroups } from "@/services/groupServices";
import { deleteAllUserLikes } from "@/services/likeServices";
import { updateProfile } from "@/services/profileServices";
import { AuthAccountResponse } from "@/types/extended-types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type SessionContextValues = {
  session: Session | null;
  sessionLoading: boolean;
  OTPSignIn: boolean;
  showTutorial: boolean;
  setSessionLoading: React.Dispatch<React.SetStateAction<boolean>>;
  createAccount: (
    userEmail: string,
    userPassword: string,
    confirmPassword: string,
    username: string,
    displayName: string
  ) => Promise<AuthAccountResponse>;
  signInUser: (
    userEmail: string,
    userPassword: string
  ) => Promise<boolean>;
  signOutUser: () => Promise<void>;
  updatePassword: (
    oldPassword: string,
    updatePassword: string,
    verifyPassword: string
  ) => Promise<boolean>;
  updateEmail: (
    password: string,
    newEmail: string
  ) => Promise<boolean>;
  updateUsername: (
    password: string,
    newUsername: string
  ) => Promise<boolean>;
  deleteAccount: (
    verifyPassword: string
  ) => Promise<void>;
  updateShowTutorial: (
    updateTutorial: boolean
  ) => Promise<void>
};

const SessionContext = createContext<SessionContextValues | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {

  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [OTPSignIn, setOTPSignIn] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  //Function for randomly generating extremely passwords for deleted accounts so they cannot be re-logged into
  //The invalid email should make it impossible, but this is another level of safety added to that
  const random_string = () => {
    let chars = [], output = "jav123ASc8;;";
    for (let i = 35; i < 127; i++) {
        if (i != 92) {
          chars.push(String.fromCharCode(i));
        } else {
          chars.push(String.fromCharCode(91));
        }
    }
    for (let i = 0; i < 28; i++) {
        output += chars[Math.floor(Math.random() * chars.length )];
    }
    return output;
  }

  // put all other sign in related functions in here

  const createAccount = async (
    userEmail: string,
    userPassword: string,
    confirmPassword: string,
    userUsername: string,
    userDisplayName: string
  ): Promise<AuthAccountResponse> => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (!emailRegex.test(userEmail)) {
      throw new Error("Please enter a valid email address");
    }
    if (userPassword != confirmPassword) {
      throw new Error("Password and confirmed password\nmust match");
    }

    if (userUsername == "" || userUsername == null) {
      throw new Error("Username cannot be blank");
    }

    if (userUsername.includes(" ")) {
      throw new Error("Username cannot include spaces");
    }
    //TODO check if we want to make usernames all lowercase / case insensitive
    if (
      (await supabase.from("profile").select().eq("username", userUsername))
        .data?.length != 0
    ) {
      throw new Error("Username is already in use");
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: userEmail,
        password: userPassword,
      }
    );

    if (signUpError) {
      if (signUpError.message.includes("Password")) {
        throw new Error(
          "Password must be at least 6 characters\n and include a letter and number"
        );
      } else {
        throw new Error(
          "This email address has already been taken, please use another address"
        );
      }
    }

    console.log("create default profile");
    //Create default profile
    userDisplayName = userDisplayName.trim();
    if (userDisplayName == "") {
      userDisplayName = "John Kova";
    }
    const { data: profileData, error: insertionError } = await supabase
      .from("profile")
      .insert({
        userId: signUpData.user?.id,
        username: userUsername,
        name: userDisplayName,
      })
      .select()
      .single();
    if (insertionError) throw new Error(insertionError.message);

    const { data: updatedUser, error: metadataError } =
      await supabase.auth.updateUser({
        data: {
          profileId: profileData?.id,
        },
      });

    if (metadataError) {
      throw new Error(metadataError.message);
    }

    console.log("created account");
    setShowTutorial(true);
    return updatedUser as AuthAccountResponse;
  };

  const signInUser = async (
    userEmail: string,
    userPassword: string
  ): Promise<boolean> => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (!emailRegex.test(userEmail)) {
      throw new Error("Please enter a valid email address");
    }
    if (userPassword.length == 0) {
      throw new Error("Password field cannot be empty");
    }

    //Checking for OTP signing in first
      const { data: OTPData, error: OTPError} = await supabase.auth.verifyOtp({
        email: userEmail,
        token: userPassword,
        type: "email"
      })
      if (OTPError) {
      console.log("No OTP with these credentials");
      } else {
        setOTPSignIn(true)
        return true;
      }

    const { data: signInData, error: passwordError } =
      await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword,
      });

    if (passwordError) {
      throw new Error(passwordError.message);
    }
    console.log("signing in");

    setOTPSignIn(false);

    console.log("sign in data", signInData.session.user.id)

    const {data, error: fetchError} = await supabase
    .from('profile')
    .select("show_tutorial")
    .eq('userId', signInData.session.user.id);

    if (!data || data.length == 0 || fetchError) {
      console.log("Error fetching tutorial for user account");
      return false;
    }

    setShowTutorial(data[0].show_tutorial);

    return false;
  };

  const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    console.log("signed out user");
    AsyncStorage.clear();

    if (error) throw new Error(error.message);
  };

  const updatePassword = async (oldPassword: string, updatePassword: string, verifyPassword: string) => {
  
    //When not using OTP to reset a forgotten password, do not ask for the old password
    if (!OTPSignIn) {
      const { data: verifyData, error: verifyError } = await supabase.rpc('verify_user_password', {
        password: oldPassword
      });

      if (verifyError || !verifyData) {
        throw new Error("Old Password is not correct")
      }
    }

    if (updatePassword != verifyPassword) {
      throw new Error("Password and confirmed password\nmust match");
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: updatePassword
    })

    if (updateError) {
      if (updateError.message == "New password should be different from the old password.") {
        throw updateError;  
      }
      else throw new Error("New Password must be at least 6 characters\n and include a letter and number");
    }

    return true;
  }

  const updateEmail = async (password: string, newEmail: string) => {
  
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (!emailRegex.test(newEmail)) {
      throw new Error("Please enter a valid email address");
    }

    const { data: verifyData, error: verifyError } = await supabase.rpc('verify_user_password', {
      password: password
    });

    if (verifyError || !verifyData) {
      throw new Error("Verification Password is not correct")
    }

    if (newEmail == session?.user.email) {
      throw new Error("New email cannot be the same as old email")
    }

    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail
    })

    if (updateError) {
      throw updateError;
    }

    return true;
  }

  const updateUsername = async (password: string, newUsername: string) => {
  
    const { data: verifyData, error: verifyError } = await supabase.rpc('verify_user_password', {
      password: password
    });

    if (verifyError || !verifyData) {
      throw new Error("Verification Password is not correct")
    }

    if (newUsername == "" || newUsername == null) {
      throw new Error("Username cannot be blank");
    }

    if (newUsername.includes(" ")) {
      throw new Error("Username cannot include spaces");
    }

    const {data, error} = await supabase 
      .from('profile')
      .select("userId")
      //.eq('userId', session?.user.id)
      .eq('username', newUsername)

    if (data && data.length != 0) {
      if (data[0].userId == session?.user.id) throw new Error("New username cannot be the same as old username");
      else throw new Error("Username is already in use");
    }
    
    const {error: fetchError} = await supabase
      .from('profile')
      .update({username: newUsername})
      .eq('userId', session?.user.id);

    if (fetchError) {
      throw fetchError;
    }

    return true;
  }

  const deleteAccount = async (verifyPassword: string) => {

      //Verifying the password before making any changes on database side
      const { data: verifyData, error: verifyError } = await supabase.rpc('verify_user_password', {
        password: verifyPassword
      });

      if (verifyError || !verifyData) {
        throw new Error("Verification Password is not correct")
      }

      let userId = session?.user.id;
      let profileId = session?.user?.user_metadata.profileId;

      if (userId === "" || userId === null || profileId === "" || profileId === null || !userId || !profileId) {
        throw new Error("Could not fetch user identification. Please try logging back in.");
      }

      //Making sure the user isn't the sole owner of any group
      const { data: groupData, error: groupError } = await supabase.rpc('delete_profile_groups', {
        profile_id: profileId
      });
      if (groupError || !groupData) {
        console.log("group error: ", groupError);
        throw new Error("You must have at least one other member as an owner in all \nmulti-user groups you own before you can delete your account");
      }
      if (groupData !== true) {
        console.log("Need to promote in groups");
        throw new Error("You must have at least one other member as an owner in all multi-user groups you own before you can delete your account");
      }

      try {
        //Deleting user's favorite exerices
        await deleteAllUserFavorites(profileId);

        //Deleting user's likes
        await deleteAllUserLikes(userId);

        //Deleting user's following and friend relations 
        const { data: followData, error: followError } = await supabase.rpc('unfollow_all', {
          user_id: userId
        });
        if (followError || !followData) {
          console.log("follow error: ", followError);
          throw new Error("Something went wrong! Try again later.");
        }

        //Deleting all of user's group relations 
        await leaveAllUserGroups(profileId);

        //Deleting posts, and all associated likes and comments
        const { data: postData, error: postError } = await supabase.rpc('delete_posts', {
          profile_id: profileId
        });
        if (postError || !postData) {
          console.log("post error: ", postError);
          throw new Error("Something went wrong! Try again later.");
        }

        //Setting user profile fields to deleted profile fields
        await updateProfile(profileId, "", "", "", "", "PRIVATE", "Deleted User", 0, "", 0, 
        {"age": "PRIVATE", "bio": "PRIVATE", "goal": "PRIVATE", "posts": "PRIVATE", "gender": "PRIVATE", "weight": "PRIVATE", "location": "PRIVATE", "achievement": "PRIVATE", "friends_following": "PRIVATE"});
        const {error: usernameError} = await supabase
          .from('profile')
          .update({username: "deleteduser"})
          .eq('userId', userId);
        if (usernameError) {
          console.log("username error: ", usernameError);
          throw new Error("Something went wrong! Try again later.");
        }

        //If everything else has succeeded, set deleted profile fields in the auth table
        const { error: passwordUpdateError } = await supabase.auth.updateUser({
         password: random_string(),
         }
       )
        if (passwordUpdateError) {
         console.log("password update error: ", passwordUpdateError);
         throw new Error("Something went wrong! Try again later.")
        }
        //Email update is done with an edge function, code for it is on supabase API
        let randNum = Math.floor(Math.random() * (999_999_999 + 1)).toString();
        let newEmail = `deleted${randNum}@deleted.com`;
        const { error: emailUpdateError } = await supabase.functions.invoke('swift-api', {
          body: {userId, newEmail: newEmail}
        })
        if (emailUpdateError) {
          console.log("email update error: ", emailUpdateError);
          throw new Error("Something went wrong! Try again later");
        }

        AsyncStorage.clear();
        setSession(null);
        setShowTutorial(false);
        setSessionLoading(false);
        setOTPSignIn(false); 

      } catch (error) {
        console.log("Delete account error: ", error);
        throw new Error("Error in deleting user account. Try again later.")
      }
  }

  const updateShowTutorial = async (updateTutorial: boolean) => {
    setShowTutorial(updateTutorial);
    const {error: fetchError} = await supabase
    .from('profile')
    .update({show_tutorial: updateTutorial})
    .eq('userId', session?.user.id);
  }

  return (
    <SessionContext.Provider
      value={{
        session,
        sessionLoading,
        OTPSignIn,
        showTutorial,
        setSessionLoading,
        createAccount,
        signInUser,
        signOutUser,
        updatePassword,
        updateEmail,
        updateUsername,
        deleteAccount,
        updateShowTutorial,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext) as SessionContextValues;
}
