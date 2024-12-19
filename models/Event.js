import mongoose from "mongoose";

const eventPlannerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User', 
  },
  eventName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100, 
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500, 
  },
  eventDate: {
    type: Date,
    required: true,
  },
  eventTime: {
    type: String, 
    required: true,
    validate: {
      validator: function (v) {
        return /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: props => `${props.value} is not a valid time format! Use HH:MM.`
    }
  },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

const EventPlanner = mongoose.model('EventPlanner', eventPlannerSchema);

module.exports = EventPlanner;
