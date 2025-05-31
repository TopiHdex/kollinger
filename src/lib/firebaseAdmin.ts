import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.API_KEY as string,
    authDomain: import.meta.env.AUTH_DOMAIN as string,
    projectId: import.meta.env.PROJECT_ID as string,
    storageBucket: import.meta.env.STORAGE_BUCKET as string,
    messagingSenderId: import.meta.env.MESSAGING_SENDER_ID as string,
    appId: import.meta.env.APP_ID as string,
    measurementId: import.meta.env.MEASUREMENT_ID as string
};

if (!getApps().length) {
    initializeApp(firebaseConfig);
}

export const db = getFirestore();
