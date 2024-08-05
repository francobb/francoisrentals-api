import { ServiceAccount } from 'firebase-admin/app';
import * as admin from 'firebase-admin';

import { CLIENT_EMAIL, FR_FIREBASE_PROJECT_ID, FR_FIREBASE_PRIVATE_NEW_KEY, FR_FIREBASE_CLIENT_ID, FR_FIREBASE_PRIVATE_NEW_KEY_ID } from '@config';

export const firebaseApp = admin.initializeApp({
  // credential: admin.credential.cert(serviceAccount as ServiceAccount),
  credential: admin.credential.cert({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    type: 'service_account',
    project_id: FR_FIREBASE_PROJECT_ID || 'fakeApp',
    private_key_id: FR_FIREBASE_PRIVATE_NEW_KEY_ID || 'fakeApp',
    private_key: FR_FIREBASE_PRIVATE_NEW_KEY || '---BEGIN PRIVATE KEY---\nfakeApp\n---END PRIVATE KEY---',
    client_email: CLIENT_EMAIL || 'fakeApp@email.com',
    client_id: FR_FIREBASE_CLIENT_ID || 'fakeApp',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-kw94n%40coughee-pot.iam.gserviceaccount.com',
    universe_domain: 'googleapis.com',
  }),
});
