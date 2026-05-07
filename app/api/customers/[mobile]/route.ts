import { NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: Request, { params }: { params: Promise<{ mobile: string }> }) {
  try {
    const { mobile } = await params;
    const normalizedMobile = mobile.replace(/\D/g, ''); // Keep only digits
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('mobileNumber', '==', normalizedMobile));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'Customer not found'
      }, { status: 404 });
    }

    // If employee ID is provided, filter results by createdBy field
    const customers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    let customer;
    if (employeeId) {
      const filtered = customers.filter(c => (c as any).createdBy === employeeId);
      if (filtered.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Customer not found'
        }, { status: 404 });
      }
      customer = filtered[0];
    } else {
      customer = customers[0];
    }

    return NextResponse.json({
      success: true,
      customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch customer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}