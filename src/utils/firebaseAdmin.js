import admin from "firebase-admin";
import serviceAccountKey from "./serviceAccountKey.js";

// Load Firebase service account key (Replace with your actual credentials)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

export default admin;
