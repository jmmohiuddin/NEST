const admin = require('firebase-admin');

// Initialize Firebase Admin with project credentials
// In production, use a service account key file or GOOGLE_APPLICATION_CREDENTIALS env var.
// For now we initialize with just the projectId (sufficient for ID-token verification
// when the tokens come from the same Firebase project).
admin.initializeApp({
  projectId: 'neest-8369d',
});

module.exports = admin;
