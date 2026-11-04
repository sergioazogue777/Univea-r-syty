const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Set GOOGLE_APPLICATION_CREDENTIALS to an external service-account JSON file.
initializeApp({ credential: applicationDefault() });
module.exports = getFirestore();
