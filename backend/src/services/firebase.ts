// Firebase Admin SDK for backend operations

import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!admin.apps.length) {
  // For development, use default credentials if available
  // For production, use service account key from environment
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      // Parse the service account JSON
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      console.log('✅ Firebase Admin initialized with service account');
    } catch (error) {
      console.error('❌ Failed to parse Firebase service account JSON:', error);
      console.error('Please check your FIREBASE_SERVICE_ACCOUNT_KEY in .env file');
      throw error;
    }
  } else {
    // Use default credentials (for development with Firebase CLI)
    console.log('⚠️ No service account key found, using default credentials');
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  }
}

export const db = getFirestore();
export const auth = admin.auth();
export default admin;