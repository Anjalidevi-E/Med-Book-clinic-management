const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
    },
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      minlength: [2, 'Doctor name must be at least 2 characters'],
      maxlength: [100, 'Doctor name cannot exceed 100 characters'],
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      enum: {
        values: [
          'General Practice',
          'Cardiology',
          'Dermatology',
          'Neurology',
          'Orthopedics',
          'Pediatrics',
          'Psychiatry',
          'Radiology',
          'Oncology',
          'Gynecology',
          'Ophthalmology',
          'ENT',
          'Urology',
          'Endocrinology',
          'Other',
        ],
      },
    },
    date: {
      type: String, // stored as 'YYYY-MM-DD'
      required: [true, 'Appointment date is required'],
    },
    time: {
      type: String, // stored as 'HH:MM'
      required: [true, 'Appointment time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format'],
    },
    duration: {
      type: Number, // duration in minutes
      default: 30,
      min: [15, 'Minimum appointment duration is 15 minutes'],
      max: [180, 'Maximum appointment duration is 180 minutes'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for appointment is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['Scheduled', 'Completed', 'Cancelled', 'No-Show'],
        message: 'Invalid status',
      },
      default: 'Scheduled',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    fee: {
      type: Number,
      min: [0, 'Fee cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to detect double booking for same doctor on same date+time
appointmentSchema.index({ doctorName: 1, date: 1, time: 1 }, { unique: false });

// Pre-save middleware: prevent double booking
appointmentSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('date') || this.isModified('time') || this.isModified('doctorName')) {
    const conflict = await this.constructor.findOne({
      _id: { $ne: this._id },
      doctorName: this.doctorName,
      date: this.date,
      time: this.time,
      status: { $nin: ['Cancelled'] },
    });

    if (conflict) {
      const error = new Error(
        `Dr. ${this.doctorName} already has an appointment on ${this.date} at ${this.time}. Please choose a different time.`
      );
      error.statusCode = 409;
      return next(error);
    }
  }
  next();
});

// Text index for search
appointmentSchema.index({ doctorName: 'text', reason: 'text' });

module.exports = mongoose.model('Appointment', appointmentSchema);
