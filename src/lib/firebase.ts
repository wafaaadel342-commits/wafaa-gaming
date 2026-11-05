/**
 * Firebase app initialization module (modular SDK).
 *
 * Ensures the Firebase app is initialized exactly once, even when the module
 * is imported multiple times (important with ESM + Vite + TanStack Start
 * where modules may be evaluated in both client and server contexts).
 *
 * Uses the shared fb-config.ts configuration. Never expose Admin SDK
 * credentials in this client bundle.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

import { firebaseConfig, FIREBASE_PROJECT_ID } from "./fb-config";

/** Stable app name — guarantees a single initialization per runtime. */
const APP_NAME = `tahaddi-trivia-${FIREBASE_PROJECT_ID}`;

/** Client-side Firebase application instance (single app per runtime). */
const existingApp = getApps().find((a) => a.name === APP_NAME);
const app: FirebaseApp = existingApp ?? initializeApp(firebaseConfig, APP_NAME);

/** Firestore database instance. */
export const db: Firestore = getFirestore(app);

/** Firebase Authentication instance (preserved from any existing auth system;
 * the current app has no auth yet — this is prepared for future CFAE/Custom
 * token integration). */
export const auth: Auth = getAuth(app);

export { FIREBASE_PROJECT_ID };
export default app;
