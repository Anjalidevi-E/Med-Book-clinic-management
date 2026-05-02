const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

// ─── GET ALL APPOINTMENTS ────────────────────────────────────────────────────
exports.getAllAppointments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      date,
      doctorName,
      search,
      sortBy = 'date',
      order = 'asc',
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (date) query.date = date;
    if (doctorName) query.doctorName = { $regex: doctorName, $options: 'i' };
    if (search) {
      query.$or = [
        { doctorName: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'name age gender contact.phone contact.email')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1, time: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count: appointments.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SINGLE APPOINTMENT ──────────────────────────────────────────────────
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      'patient',
      'name age gender contact bloodGroup medicalHistory'
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET APPOINTMENTS BY PATIENT ─────────────────────────────────────────────
exports.getAppointmentsByPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const appointments = await Appointment.find({ patient: req.params.patientId }).sort({
      date: -1,
      time: -1,
    });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
      patient: { name: patient.name, id: patient._id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CREATE APPOINTMENT ──────────────────────────────────────────────────────
exports.createAppointment = async (req, res) => {
  try {
    // Verify patient exists and is active
    const patient = await Patient.findById(req.body.patient);
    if (!patient || !patient.isActive) {
      return res.status(404).json({ success: false, message: 'Patient not found or inactive' });
    }

    // Prevent booking in the past
    const appointmentDateTime = new Date(`${req.body.date}T${req.body.time}`);
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments in the past',
      });
    }

    const appointment = await Appointment.create(req.body);
    const populated = await appointment.populate('patient', 'name age gender contact.phone');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populated,
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({ success: false, message: error.message });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE APPOINTMENT ──────────────────────────────────────────────────────
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a cancelled appointment',
      });
    }

    // Merge update fields
    Object.assign(appointment, req.body);
    await appointment.save(); // triggers pre-save double-booking check

    const updated = await Appointment.findById(appointment._id).populate(
      'patient',
      'name age gender contact.phone'
    );

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: updated,
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({ success: false, message: error.message });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CANCEL APPOINTMENT ──────────────────────────────────────────────────────
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    if (appointment.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Appointment is already cancelled' });
    }
    appointment.status = 'Cancelled';
    await appointment.save();
    res.json({ success: true, message: 'Appointment cancelled successfully', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE APPOINTMENT ──────────────────────────────────────────────────────
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, message: 'Appointment deleted permanently' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalPatients,
      totalAppointments,
      todayAppointments,
      statusBreakdown,
      upcomingAppointments,
    ] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ date: today, status: 'Scheduled' }),
      Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Appointment.find({ date: { $gte: today }, status: 'Scheduled' })
        .populate('patient', 'name contact.phone')
        .sort({ date: 1, time: 1 })
        .limit(5),
    ]);

    res.json({
      success: true,
      data: {
        totalPatients,
        totalAppointments,
        todayAppointments,
        statusBreakdown,
        upcomingAppointments,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
