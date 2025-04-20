import {
  signInWithPopup,
  signOut,
  UserCredential,
  AuthProvider,
  getAdditionalUserInfo
} from "firebase/auth";
import { auth, googleProvider, appleProvider } from "./firebase";
import { apiRequest } from "./queryClient";

export type AuthResponse = {
  user: {
    id: number;
    username: string;
    email: string;
  };
};

async function handleSocialSignIn(provider: AuthProvider): Promise<AuthResponse> {
  try {
    // Sign in with Firebase
    const result: UserCredential = await signInWithPopup(auth, provider);
    
    // Get additional user info and token
    const additionalInfo = getAdditionalUserInfo(result);
    const idToken = await result.user.getIdToken();
    
    // Send Firebase token to our server for validation and session creation
    const response = await apiRequest("POST", "/api/login/social", {
      idToken,
      provider: provider.providerId,
      isNewUser: additionalInfo?.isNewUser,
      email: result.user.email,
      displayName: result.user.displayName
    });
    
    return await response.json();
  } catch (error) {
    console.error("Social sign-in error:", error);
    throw error;
  }
}

export async function signInWithGoogle(): Promise<AuthResponse> {
  return handleSocialSignIn(googleProvider);
}

export async function signInWithApple(): Promise<AuthResponse> {
  return handleSocialSignIn(appleProvider);
}

export async function logoutUser(): Promise<void> {
  try {
    // Sign out from Firebase
    await signOut(auth);
    
    // Sign out from our server
    await apiRequest("POST", "/api/logout");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}