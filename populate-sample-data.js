const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // You'll need to add your Firebase service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function populateSampleData() {
  try {
    console.log('Starting to populate sample data...');

    // Sample Projects
    const projects = [
      {
        title: 'Residential Solar Installation',
        description: 'Complete solar panel installation for a 3-bedroom house in Bangalore',
        location: 'Bangalore, Karnataka',
        capacity: '5 kW',
        image: '/images/projects/residential1.jpg',
        date: '2024-01-15'
      },
      {
        title: 'Commercial Solar Farm',
        description: 'Large-scale solar farm installation for industrial complex',
        location: 'Mumbai, Maharashtra',
        capacity: '100 kW',
        image: '/images/projects/commercial1.jpg',
        date: '2024-02-20'
      },
      {
        title: 'Rooftop Solar System',
        description: 'Rooftop solar installation for apartment complex',
        location: 'Delhi, NCR',
        capacity: '25 kW',
        image: '/images/projects/rooftop1.jpg',
        date: '2024-03-10'
      }
    ];

    for (const project of projects) {
      await db.collection('projects').add({
        ...project,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('Projects added');

    // Sample Brands
    const brands = [
      { name: 'SunPower', logo: '/images/brands/sunpower.png' },
      { name: 'LG Solar', logo: '/images/brands/lg.png' },
      { name: 'Canadian Solar', logo: '/images/brands/canadian.png' }
    ];

    for (const brand of brands) {
      await db.collection('brands').add({
        ...brand,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('Brands added');

    // Sample Employees
    const employees = [
      {
        mobileNumber: '9876543210',
        name: 'John Doe',
        email: 'john.doe@mgsolar.com',
        password: 'password123',
        empId: 'EMP001',
        role: 'employee',
        isBlocked: false
      },
      {
        mobileNumber: '9876543211',
        name: 'Jane Smith',
        email: 'jane.smith@mgsolar.com',
        password: 'password123',
        empId: 'EMP002',
        role: 'engineer',
        isBlocked: false
      },
      {
        mobileNumber: '9876543212',
        name: 'Bob Johnson',
        email: 'bob.johnson@mgsolar.com',
        password: 'password123',
        empId: 'EMP003',
        role: 'employee',
        isBlocked: false
      },
      {
        mobileNumber: '9876543213',
        name: 'Alice Wilson',
        email: 'alice.wilson@mgsolar.com',
        password: 'password123',
        empId: 'EMP004',
        role: 'engineer',
        isBlocked: false
      },
      {
        mobileNumber: '9876543214',
        name: 'Charlie Brown',
        password: 'password123',
        empId: 'EMP005',
        role: 'employee',
        isBlocked: true
      },
      {
        mobileNumber: '9876543215',
        name: 'Diana Prince',
        email: 'diana.prince@mgsolar.com',
        password: 'password123',
        empId: 'EMP006',
        role: 'engineer',
        isBlocked: false
      }
    ];

    for (const employee of employees) {
      let firebaseUid;
      if (employee.email) {
        try {
          const userRecord = await auth.createUser({
            email: employee.email,
            password: employee.password,
            displayName: employee.name,
          });
          firebaseUid = userRecord.uid;
          console.log(`Created Firebase Auth user for ${employee.name}`);
        } catch (error) {
          console.error(`Error creating auth user for ${employee.name}:`, error);
        }
      }

      await db.collection('employees').add({
        ...employee,
        firebaseUid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('Employees added');

    // Sample Contact Messages
    const messages = [
      {
        name: 'Alice Wilson',
        email: 'alice@example.com',
        phone: '9876543213',
        message: 'Interested in solar installation for my home',
        read: false
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        phone: '9876543214',
        message: 'Need quote for commercial solar panels',
        read: false
      }
    ];

    for (const message of messages) {
      await db.collection('contactMessages').add({
        ...message,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('Contact messages added');

    // Sample Career Applications
    const applications = [
      {
        name: 'David Lee',
        email: 'david@example.com',
        phone: '9876543215',
        position: 'Solar Technician',
        experience: '3 years',
        resume: '/resumes/david_lee.pdf',
        message: 'Passionate about renewable energy'
      },
      {
        name: 'Eva Martinez',
        email: 'eva@example.com',
        phone: '9876543216',
        position: 'Project Manager',
        experience: '5 years',
        resume: '/resumes/eva_martinez.pdf',
        message: 'Experienced in solar project management'
      }
    ];

    for (const application of applications) {
      await db.collection('careerApplications').add({
        ...application,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('Career applications added');

    console.log('Sample data populated successfully!');
  } catch (error) {
    console.error('Error populating data:', error);
  } finally {
    process.exit();
  }
}

populateSampleData();