import { supabase } from "@/lib/supabase";
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
};

const SessionContext = createContext<SessionContextValues | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [OTPSignIn, setOTPSignIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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

  const deleteAccount = async (verifyPassword: string) => {
    
    const { data: verifyData, error: verifyError } = await supabase.rpc('verify_user_password', {
      password: verifyPassword
    });

    if (verifyError || !verifyData) {
      throw new Error("Verification Password is not correct")
    }

    //TODO check if these are the correct steps
    signOutUser();
    console.log("Delete account to be implemented");
    AsyncStorage.clear();
    setSession(null);
    setSessionLoading(false);
    setOTPSignIn(false);
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
        deleteAccount,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext) as SessionContextValues;
}
