/**
 * Firebase project configuration for the Egyptian Trivia Engine.
 *
 * This file contains the client-side (web API) Firebase configuration.
 * The web API key is intentionally a public client configuration value
 * per Firebase's model — it is NOT a substitute for Firestore Security
 * Rules, which protect all collections (see firestore.rules).
 *
 * DO NOT put Firebase Admin service account credentials, OpenRouter API
 * keys, or any privileged secrets in this file or any frontend code.
 */

export const FIREBASE_PROJECT_ID = "wafaa-game";

export const firebaseConfig = {
  apiKey: "AIzaSyD6UYqN_qDq5G1OnajDaAEOe34ZXowpfnM",
  authDomain: "wafaa-game.firebaseapp.com",
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: "wafaa-game.firebasestorage.app",
  messagingSenderId: "604019598630",
  appId: "1:604019598630:web:47e5d53aa4e86b1c1d8de7",
} as const;
