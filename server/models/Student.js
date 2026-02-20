const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  email: {
  type: String,
  required: true,
  unique: true
  },

  phone: String,
  dob: Date,
  gender: String,
  studentId: String,
  course: String,
  department: String,
  year: String,

  profilePic: {
    url: String,
    public_id: String,
    name: String,
  },

  idFile: {
    url: String,
    public_id: String,
    name: String,
  },

  certificateFile: {
    url: String,
    public_id: String,
    name: String,
  },

  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  }

}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
