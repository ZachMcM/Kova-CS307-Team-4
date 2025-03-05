import { supabase } from "@/lib/supabase";
import { AuthAccountResponse } from "@/types/extended-types";
import { AuthResponse, AuthWeakPasswordError } from "@supabase/supabase-js";

//TODO DEPRECATED remove when we are sure we do not need it

export const createAccount = async (
  userEmail: string,
  userPassword: string,
  confirmPassword: string
): Promise<AuthAccountResponse> => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  if (!emailRegex.test(userEmail)) {
    throw new Error("Please enter a valid email address");
  }
  if (userPassword != confirmPassword) {
    throw new Error("Password and confirmed password\n must match");
  }
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: userEmail,
    password: userPassword,
  });
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

  console.log("created account");
  return data as AuthAccountResponse;
};

export const signInUser = async (
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

  //Checking if profile exists for this user
  if (
    (await supabase.from("profile").select().eq("userId", signInData.user?.id))
      .data?.length == 0
  ) {
    //Create default profile
    console.log("create default profile");
    const { error: insertionError } = await supabase.from("profile").insert({
      userId: signInData.user?.id,
      username: "NewKovaUser",
      name: "John Kova"
    });
    if (insertionError) throw new Error(insertionError.message);
  }

  if (passwordError) {
    throw new Error(passwordError.message);
  }
  console.log("signing in");

  return signInData as AuthAccountResponse;
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  console.log("signed out user");

  if (error) throw new Error(error.message);
};

// TODO fix bug where isUserInSession() always evaluates to false when closing the app after signing out
// then trying to sign back in (right now, you have to sign in twice)
export const isUserInSession = async (): Promise<boolean> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log(session ? "User is in session" : "User is not in session");
  return session == null ? true : false;
};
