// create-admin-user.js
// Script to create admin user in Firestore
// Run with: node create-admin-user.js

const admin = require('firebase-admin');

// Initialize Firebase Admin with your project config
const serviceAccount = {
  type: "service_account",
  project_id: "mgsolar-934cc",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    // Admin user data
    const adminUserData = {
      name: "Vipin Gaur",
      email: "vipingaur89@gmail.com",
      role: "super_admin",
      permissions: ["all"],
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Add to adminUsers collection with email as document ID for easy lookup
    await db.collection('adminUsers').doc('vipingaur89@gmail.com').set(adminUserData);

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: vipingaur89@gmail.com');
    console.log('🔑 Role: super_admin');
    console.log('🔓 Permissions: all');

    console.log('\n📋 Next steps:');
    console.log('1. Deploy Firestore rules: firebase deploy --only firestore:rules');
    console.log('2. Create Firebase Auth user in Firebase Console');
    console.log('3. Try logging in at /admin-login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    process.exit();
  }
}

createAdminUser();</content>
<parameter name="filePath">create-admin-user.js