import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, 'careers'));
    const jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching careers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch careers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, position, experience, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !position) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'careerApplications'), {
      name,
      email,
      phone,
      position,
      experience: experience || '',
      message: message || '',
      timestamp: serverTimestamp(),
      status: 'new',
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
    });
  } catch (error) {
    console.error('Career application error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
