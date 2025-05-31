import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(import.meta.env.FIREBASE_ADMIN_KEY as string);

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

export const db = getFirestore();
