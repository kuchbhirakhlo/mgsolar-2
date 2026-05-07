import { NextResponse } from 'next/server';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    // Fetch total projects
    const projectsRef = collection(db, 'projects');
    const projectsSnapshot = await getDocs(projectsRef);
    const totalProjects = projectsSnapshot.size;

    // Fetch team members (employees + installers)
    const employeesRef = collection(db, 'employees');
    const employeesSnapshot = await getDocs(employeesRef);
    const totalTeamMembers = employeesSnapshot.size; // Assuming all employees are team members

    // Fetch new messages (unread contact messages)
    const messagesRef = collection(db, 'contact_messages');
    const unreadMessagesQuery = query(messagesRef, where('read', '==', false));
    const unreadMessagesSnapshot = await getDocs(unreadMessagesQuery);
    const newMessages = unreadMessagesSnapshot.size;

    // Fetch total capacity (removed as per request)

    // Fetch recent activities
    const recentMessagesQuery = query(
      collection(db, 'contact_messages'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const recentMessagesSnapshot = await getDocs(recentMessagesQuery);
    const recentActivities = recentMessagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: 'message',
      title: doc.data().name ? `New message from ${doc.data().name}` : 'New message',
      timestamp: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      status: doc.data().read ? 'Read' : 'New',
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalProjects,
        totalTeamMembers,
        newMessages,
        recentActivities,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}