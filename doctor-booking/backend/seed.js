const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const User = require('./models/User');

dotenv.config();

const patients = [
  {
    name: 'Arjun Mehta',
    age: 34,
    gender: 'Male',
    contact: { phone: '+91-9876543210', email: 'arjun.mehta@email.com', address: '12 MG Road, Bangalore' },
    bloodGroup: 'O+',
    medicalHistory: 'Hypertension diagnosed in 2020. Currently on medication.',
  },
  {
    name: 'Priya Sharma',
    age: 28,
    gender: 'Female',
    contact: { phone: '+91-9123456789', email: 'priya.sharma@email.com', address: '45 Anna Nagar, Chennai' },
    bloodGroup: 'A+',
    medicalHistory: 'Mild asthma. Uses inhaler occasionally.',
  },
  {
    name: 'Rajesh Kumar',
    age: 52,
    gender: 'Male',
    contact: { phone: '+91-8765432109', email: 'rajesh.kumar@email.com', address: '7 Civil Lines, Delhi' },
    bloodGroup: 'B+',
    medicalHistory: 'Type 2 Diabetes. Controlled with diet and Metformin.',
  },
  {
    name: 'Sneha Patel',
    age: 41,
    gender: 'Female',
    contact: { phone: '+91-9988776655', email: 'sneha.patel@email.com', address: '23 Navrangpura, Ahmedabad' },
    bloodGroup: 'AB+',
    medicalHistory: 'No significant history. Annual check-ups only.',
  },
  {
    name: 'Vikram Nair',
    age: 19,
    gender: 'Male',
    contact: { phone: '+91-7654321098', email: 'vikram.nair@email.com', address: '88 Koramangala, Bangalore' },
    bloodGroup: 'O-',
    medicalHistory: 'Seasonal allergies. Prescribed antihistamines.',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Patient.deleteMany();
    await Appointment.deleteMany();
    await User.deleteMany();
    console.log('Cleared existing data');

    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@clinic.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin user created: admin@clinic.com / admin123');

    // Seed patients
    const createdPatients = await Patient.insertMany(patients);
    console.log(`Created ${createdPatients.length} patients`);

    // Seed appointments
    const today = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);

    const appointments = [
      { patient: createdPatients[0]._id, doctorName: 'Dr. Ananya Krishnan', specialty: 'Cardiology', date: fmt(tomorrow), time: '09:00', reason: 'Routine heart checkup', status: 'Scheduled', fee: 500 },
      { patient: createdPatients[1]._id, doctorName: 'Dr. Sanjay Patel', specialty: 'General Practice', date: fmt(tomorrow), time: '10:30', reason: 'Asthma follow-up', status: 'Scheduled', fee: 300 },
      { patient: createdPatients[2]._id, doctorName: 'Dr. Meera Iyer', specialty: 'Endocrinology', date: fmt(dayAfter), time: '11:00', reason: 'Diabetes management', status: 'Scheduled', fee: 600 },
      { patient: createdPatients[3]._id, doctorName: 'Dr. Ananya Krishnan', specialty: 'Cardiology', date: fmt(dayAfter), time: '14:00', reason: 'Blood pressure evaluation', status: 'Scheduled', fee: 500 },
      { patient: createdPatients[4]._id, doctorName: 'Dr. Rahul Verma', specialty: 'Dermatology', date: fmt(today), time: '16:00', reason: 'Skin allergy consultation', status: 'Completed', fee: 400 },
    ];

    await Appointment.insertMany(appointments);
    console.log(`Created ${appointments.length} appointments`);

    console.log('\n✅ Database seeded successfully!');
    console.log('Login: admin@clinic.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
