// firebase-config.js  (Compat SDK)
try {
  // 1) Paste your real config here (Firebase Console → Project settings → Web app)
  const firebaseConfig = {
    apiKey: "PASTE",
    authDomain: "PASTE.firebaseapp.com",
    projectId: "PASTE",
    storageBucket: "PASTE.appspot.com",
    messagingSenderId: "PASTE",
    appId: "PASTE"
  };

  // 2) Init + Anonymous auth
  firebase.initializeApp(firebaseConfig);
  firebase.auth().signInAnonymously().catch(console.error);

  // 3) Firestore handle
  window.db = firebase.firestore();
} catch (e) {
  console.warn("Firebase not initialized yet. Paste your config in firebase-config.js", e);
  window.db = null;
}
