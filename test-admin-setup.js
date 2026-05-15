// test-admin-setup.js
// Quick test to verify admin user setup

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAzbpiD5-HUmvO4ir26kGSkZuo807RbeBs",
  authDomain: "mgsolar-934cc.firebaseapp.com",
  projectId: "mgsolar-934cc",
  storageBucket: "mgsolar-934cc.firebasestorage.app",
  messagingSenderId: "1059258349746",
  appId: "1:1059258349746:web:7cb0819ee6ba1436f7f1ab"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testAdminSetup() {
  try {
    console.log('🔍 Testing admin user setup...');

    // Test if adminUsers collection exists and has the admin user
    const q = query(collection(db, 'adminUsers'), where('email', '==', 'vipingaur89@gmail.com'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('❌ Admin user not found in Firestore!');
      console.log('📝 Please add the admin user to Firestore as described in FIRESTORE_DEPLOYMENT.md');
      return;
    }

    const adminDoc = querySnapshot.docs[0];
    const adminData = adminDoc.data();

    console.log('✅ Admin user found in Firestore!');
    console.log('👤 Name:', adminData.name);
    console.log('📧 Email:', adminData.email);
    console.log('👑 Role:', adminData.role);
    console.log('🔓 Active:', adminData.active);
    console.log('🗝️ Permissions:', adminData.permissions);

    if (adminData.role === 'super_admin' && adminData.active === true) {
      console.log('✅ Admin user is properly configured for login!');
    } else {
      console.log('⚠️ Admin user role or active status may need adjustment');
    }

  } catch (error) {
    console.error('❌ Error testing admin setup:', error.message);

    if (error.message.includes('permission-denied')) {
      console.log('🔒 Firestore rules may not be deployed yet');
      console.log('📋 Follow FIRESTORE_DEPLOYMENT.md to deploy rules');
    }
  }
}

testAdminSetup();</content>
<parameter name="filePath">test-admin-setup.js