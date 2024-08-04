import { ServiceAccount } from 'firebase-admin/app';
import * as admin from 'firebase-admin';

import serviceAccount from './serviceaccount.json';

export const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});
