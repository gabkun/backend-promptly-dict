import mongoose from "mongoose";

const eventPlannerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to a user in another collection
    required: true,
    ref: 'User', // Name of the referenced collection
  },
  eventName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100, // Optional: limit the length of the event name
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500, // Optional: limit the length of the description
  },
  eventDate: {
    type: Date,
    required: true,
  },
  eventTime: {
    type: String, // Use a string to capture time in HH:MM format or other custom formats
    required: true,
    validate: {
      validator: function (v) {
        // Regex to validate time in HH:MM 24-hour format
        return /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: props => `${props.value} is not a valid time format! Use HH:MM.`
    }
  },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

const EventPlanner = mongoose.model('EventPlanner', eventPlannerSchema);

module.exports = EventPlanner;
