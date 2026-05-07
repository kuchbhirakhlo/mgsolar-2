import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const collections = [
      'customers', 'employees', 'projects', 'materialDispatches',
      'payments', 'leads', 'contacts', 'adminUsers', 'jobs', 'careers'
    ];

    const results: Record<string, any> = {};

    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        results[collectionName] = {
          count: documents.length,
          documents
        };
      } catch (error) {
        results[collectionName] = {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      collections: results
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}