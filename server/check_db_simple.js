const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');

async function check() {
  const MONGO_URI = 'mongodb+srv://drazacademykaruppaiyan:Ajay.k.123@cluster0.zmfh5.mongodb.net/Dr-Academy?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');
  const count = await Attendance.countDocuments();
  console.log('Attendance count:', count);
  process.exit();
}
check();
