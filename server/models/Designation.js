const mongoose = require('mongoose');

const designationSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

const Designation = mongoose.model('Designation', designationSchema);

module.exports = Designation;
