import { NextRequest, NextResponse } from 'next/server';
import { uploadToFirebase } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload to Firebase Storage
    const downloadURL = await uploadToFirebase(file, 'projects');

    return NextResponse.json({ url: downloadURL });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}