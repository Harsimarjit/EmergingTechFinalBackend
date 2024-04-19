const mongoose = require('mongoose');

const symptomChecklistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  fever: {
    type: Boolean,
    default: false
  },
  cough: {
    type: Boolean,
    default: false
  },
  shortnessOfBreath: {
    type: Boolean,
    default: false
  },
  soreThroat: {
    type: Boolean,
    default: false
  },
  musclePain: {
    type: Boolean,
    default: false
  },
  lossOfTasteOrSmell: {
    type: Boolean,
    default: false
  },
  fatigue: {
    type: Boolean,
    default: false
  },
  diarrhea: {
    type: Boolean,
    default: false
  },
  nauseaOrVomiting: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

module.exports = mongoose.model('SymptomChecklist', symptomChecklistSchema);
