import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthAccountResponse } from "@/types/extended-types";
import { AuthResponse, AuthWeakPasswordError } from "@supabase/supabase-js";

type SessionContextValues = {
  session: Session | null;
  sessionLoading: boolean;
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
  ) => Promise<AuthAccountResponse>;
  signOutUser: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValues | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

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
      throw new Error("Password and confirmed password\n must match");
    }

    if (userUsername == "") {
      throw new Error("Username cannot be blank");
    }

    if (userUsername.includes(" ")) {
      throw new Error("Username cannot include spaces");
    }

    if (
      (await supabase.from("profile").select().eq("username", userUsername))
        .data?.length != 0
    ) {
      throw new Error("Username is already in use!");
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: userEmail,
        password: userPassword,
      }
    );

    if (signUpError) {
      console.log(signUpError.message);
      if (signUpError.message == "Password should be at least 6 characters.") {
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
    const { data: profileData, error: insertionError } = await supabase.from("profile").insert({
      userId: signUpData.user?.id,
      username: userUsername,
      name: userDisplayName,
    }).select().single();
    if (insertionError) throw new Error(insertionError.message);

    const { data: updatedUser, error: metadataError } = await supabase.auth.updateUser({
      data: {
        profileId: profileData?.id
      }
    }) 
    
    if (metadataError) {
      throw new Error(metadataError.message)
    }

    console.log("created account");
    return updatedUser as AuthAccountResponse;
  };

  const signInUser = async (
    userEmail: string,
    userPassword: string
  ): Promise<AuthAccountResponse> => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (!emailRegex.test(userEmail)) {
      throw new Error("Please enter a valid email address");
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

    return signInData as AuthAccountResponse;
  };

  const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    console.log("signed out user");

    if (error) throw new Error(error.message);
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        sessionLoading,
        setSessionLoading,
        createAccount,
        signInUser,
        signOutUser,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext) as SessionContextValues;
}
