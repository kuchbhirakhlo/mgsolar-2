import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST() {
  try {
    // Test data
    const testCustomer = {
      customerName: 'Test Customer',
      mobileNumber: '9999999999',
      address: 'Test Address',
      systemType: 'on grid',
      kilowatt: '3',
      panelCompanyName: 'Test Panel',
      inverterCompanyName: 'Test Inverter',
      referredBy: 'Test Referral',
      price: '170000',
      createdAt: new Date().toISOString(),
    };

    // Add test document
    const docRef = await addDoc(collection(db, 'customers'), testCustomer);

    // Fetch all customers to verify
    const customersRef = collection(db, 'customers');
    const snapshot = await getDocs(customersRef);
    const customers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      message: 'Test customer added successfully',
      documentId: docRef.id,
      totalCustomers: customers.length,
      customers: customers.slice(-5) // Show last 5 customers
    });
  } catch (error) {
    console.error('Error in test:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add test customer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}