import { supabase } from "@/lib/supabase";
import { AuthAccountResponse } from "@/types/extended-types";
import { Session } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

type SessionContextValues = {
  session: Session | null;
  sessionLoading: boolean;
  OTPSignIn: boolean;
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
  signInWithGoogle: () => Promise<Session | null>;
};

const SessionContext = createContext<SessionContextValues | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [OTPSignIn, setOTPSignIn] = useState(false);

  useEffect(() => {



    GoogleSignin.configure({
      scopes: ["email", "profile"], // Request basic profile info and email
      iosClientId: process.env.GOOGLE_IOS_CLIENT_ID, // Add if you have one for iOS standalone builds
    });
  }, []);

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

    if (userUsername == "") {
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
    return updatedUser as AuthAccountResponse;
  };

  const checkAndCreateProfile = async (user: any) => {
    const { data: profileData, error: profileError } = await supabase
      .from("profile")
      .select("id")
      .eq("userId", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 means no rows found, which is expected for new users
      console.error("Error checking profile:", profileError);
      throw new Error(`Failed to check profile: ${profileError.message}`);
    }

    if (!profileData) {
      // Profile doesn't exist, create it
      console.log("Profile not found for user, creating one...");
      const { error: insertError } = await supabase.from("profile").insert({
        userId: user.id,
        // Extract username and name from Google data if available
        username:
          user.user_metadata?.email?.split("@")[0] || // Default username from email
          `user_${user.id.substring(0, 8)}`, // Fallback username
        name: user.user_metadata?.full_name || "Kova User", // Google display name
        avatar: user.user_metadata?.avatar_url || null, // Google avatar
        show_tutorial: true, // Or your default value
        // Initialize privacy settings
        privacy_settings: {
          friends_following: "PUBLIC",
          age: "PRIVATE",
          weight: "PRIVATE",
          location: "PRIVATE",
          goal: "FRIENDS",
          bio: "FRIENDS",
          achievement: "FRIENDS",
          gender: "PRIVATE",
          posts: "PUBLIC", // Default post privacy
        },
      });

      if (insertError) {
        console.error("Error creating profile:", insertError);
        throw new Error(`Failed to create profile: ${insertError.message}`);
      }
      console.log("Profile created successfully for:", user.id);

      // Re-fetch session data to potentially include profileId in user_metadata
      const { data: updatedSessionData } = await supabase.auth.getSession();
      if (updatedSessionData.session) {
        const { data: newProfileData } = await supabase
          .from("profile")
          .select("id")
          .eq("userId", user.id)
          .single();
        if (newProfileData) {
          // Manually add profileId to user_metadata if Supabase doesn't do it automatically
          // Note: Supabase might handle this via triggers/functions, check your setup
          updatedSessionData.session.user.user_metadata = {
            ...updatedSessionData.session.user.user_metadata,
            profileId: newProfileData.id,
          };
          setSession(updatedSessionData.session); // Update session state
        }
      }
    } else {
        console.log("Profile already exists for user:", user.id);
        // Optionally update existing profile data (e.g., avatar) if needed
        // const { error: updateError } = await supabase
        //   .from('profile')
        //   .update({ avatar: user.user_metadata?.avatar_url })
        //   .eq('userId', user.id);
        // if (updateError) console.error("Error updating profile avatar:", updateError);

        // Ensure profileId is in session metadata
        if (!user.user_metadata?.profileId) {
             const { data: updatedSessionData } = await supabase.auth.getSession();
             if (updatedSessionData.session) {
                updatedSessionData.session.user.user_metadata = {
                    ...updatedSessionData.session.user.user_metadata,
                    profileId: profileData.id,
                };
                setSession(updatedSessionData.session);
             }
        }
    }
  };

  const signInWithGoogle = async (): Promise<Session | null> => {
    setSessionLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.data?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.data.idToken,
        });

        if (error) {
          console.error("Supabase Google Sign-In Error:", error);
          throw new Error(
            error.message || "Failed to sign in with Google via Supabase."
          );
        }

        if (data.session) {
          console.log("Supabase session established via Google:", data.session.user.id);
          await checkAndCreateProfile(data.user); // Check/create profile
           // Fetch the session again AFTER profile check/creation to ensure metadata is fresh
          const { data: finalSessionData } = await supabase.auth.getSession();
          if (finalSessionData.session) {
            setSession(finalSessionData.session);
            setOTPSignIn(false);
            return finalSessionData.session;
          } else {
             throw new Error("Failed to retrieve final session after profile check.");
          }
        } else {
          throw new Error("Supabase did not return a session.");
        }
      } else {
        throw new Error("Google Sign-In did not return an ID token.");
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Google Sign-In Cancelled");
        // Optional: Show a toast or message
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Google Sign-In already in progress");
        // Optional: Show a toast
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.error("Google Play Services not available or outdated");
        throw new Error("Google Play Services are required for Google Sign-In.");
      } else {
        console.error("Google Sign-In Error:", error);
        throw new Error(error.message || "An unknown Google Sign-In error occurred.");
      }
      return null; // Return null on handled errors like cancellation
    } finally {
      setSessionLoading(false);
    }
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

    const { error: passwordError } =
      await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword,
      });

    if (passwordError) {
      throw new Error(passwordError.message);
    }
    console.log("signing in");

    setOTPSignIn(false)
    return false;
  };

  const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    console.log("signed out user");

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

    if (newUsername == "") {
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

  return (
    <SessionContext.Provider
      value={{
        session,
        sessionLoading,
        OTPSignIn,
        setSessionLoading,
        createAccount,
        signInUser,
        signOutUser,
        updatePassword,
        updateEmail,
        updateUsername,
        signInWithGoogle
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext) as SessionContextValues;
}
