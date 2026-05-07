// Quick test script for employee login debugging
// Run this in browser console on the employee login page

import { db } from './lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function checkEmployeeData() {
  try {
    console.log('Checking employee data in Firestore...');

    // Check all employees
    const allEmployees = await getDocs(collection(db, 'employees'));
    console.log(`Found ${allEmployees.size} employees in database:`);

    allEmployees.forEach((doc) => {
      const data = doc.data();
      console.log(`- ${data.empId}: ${data.name} (${data.role}) - ${data.isBlocked ? 'BLOCKED' : 'ACTIVE'}`);
    });

    // Test specific employee lookup
    const testEmpId = 'EMP001';
    const q = query(collection(db, 'employees'), where('empId', '==', testEmpId));
    const employeeDocs = await getDocs(q);

    if (!employeeDocs.empty) {
      const employee = employeeDocs.docs[0].data();
      console.log(`\nTest lookup for ${testEmpId}:`);
      console.log('Employee data:', {
        id: employeeDocs.docs[0].id,
        ...employee
      });
    } else {
      console.log(`\nNo employee found with empId: ${testEmpId}`);
    }

  } catch (error) {
    console.error('Error checking employee data:', error);
  }
}

// Make it available globally
window.checkEmployeeData = checkEmployeeData;

console.log('Run checkEmployeeData() to test employee data lookup');