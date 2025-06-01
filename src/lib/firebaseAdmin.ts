import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const serviceAccount = {
    type: "service_account",
    project_id: import.meta.env.ADMIN_PROJECT_ID,
    private_key_id: import.meta.env.ADMIN_PRIVATE_KEY_ID,
    private_key: JSON.parse(import.meta.env.ADMIN_PRIVATE_KEY),
    client_email: import.meta.env.ADMIN_CLIENT_EMAIL,
    client_id: import.meta.env.ADMIN_CLIENT_ID,
    auth_uri: import.meta.env.ADMIN_AUTH_URI,
    token_uri: import.meta.env.ADMIN_TOKEN_URI,
    auth_provider_x509_cert_url: import.meta.env.ADMIN_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: import.meta.env.ADMIN_CLIENT_X509_CERT_URL,
};

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount as ServiceAccount)
    });
}

export const db = getFirestore();
export const storage = getStorage();
