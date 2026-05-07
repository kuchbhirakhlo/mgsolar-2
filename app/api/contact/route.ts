import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const q = query(collection(db, 'contact_messages'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, lastName, phone, message } = body;

    // Validate required fields
    if (!name || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'contact_messages'), {
      name,
      lastName: lastName || '',
      phone: phone || '',
      message,
      timestamp: serverTimestamp(),
      read: false,
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
