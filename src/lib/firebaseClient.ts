import { initializeApp, type FirebaseOptions } from "firebase/app";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

export interface GalleryItem {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    position: number;
    span: number;
    isHighlight: boolean;
}

const firebaseConfig: FirebaseOptions = {
    apiKey: import.meta.env.PUBLIC_API_KEY,
    authDomain: import.meta.env.PUBLIC_AUTH_DOMAIN,
    projectId: import.meta.env.PUBLIC_PROJECT_ID,
    storageBucket: import.meta.env.PUBLIC_STORAGE_BUCKET,
    appId: import.meta.env.PUBLIC_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export async function updateGalleryItem(id: string, data: Partial<GalleryItem>) {
  const ref = doc(db, "gallery", id);
  await updateDoc(ref, data);
}
