import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const lead = {
      name: body.name,
      phone: body.mobile,
      city: body.city,
      kw: body.kw || '',
      type: 'quick-lead',
      createdAt: body.createdAt || new Date().toISOString(),
      read: false,
    };

    const docRef = await addDoc(collection(db, 'leads'), lead);

    return NextResponse.json({ success: true, lead: { id: docRef.id, ...lead } });
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json({ success: false, error: 'Failed to save lead' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const leads = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error reading leads:', error);
    return NextResponse.json({ error: 'Failed to read leads' }, { status: 500 });
  }
}