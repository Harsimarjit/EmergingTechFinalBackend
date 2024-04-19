const mongoose = require('mongoose');

const nurseVitalSignsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true,
  },
  patientName:String,
  bodyTemperature: Number,
  heartRate: Number,
  bloodPressure: String, 
  respiratoryRate: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('NurseVitalSigns', nurseVitalSignsSchema);
