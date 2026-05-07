import { db } from './lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function testConnection() {
  try {
    console.log('Testing Firebase connection...');
    const querySnapshot = await getDocs(collection(db, 'projects'));
    console.log('Connection successful! Found', querySnapshot.size, 'projects');
  } catch (error) {
    console.error('Firebase connection failed:', error);
  }
}

testConnection();