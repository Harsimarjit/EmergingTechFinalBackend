const mongoose = require('mongoose');

const symptomChecklistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  symptoms: [{
    type: String,
    required: true
  }],
  submittedAt: {
    type: Date,
    required: true
  },
});

const SymptomChecklist = mongoose.model('SymptomChecklist', symptomChecklistSchema);

module.exports = SymptomChecklist;
