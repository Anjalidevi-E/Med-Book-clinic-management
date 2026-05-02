const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// ─── GET ALL PATIENTS ────────────────────────────────────────────────────────
exports.getAllPatients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      gender,
      bloodGroup,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'contact.email': { $regex: search, $options: 'i' } },
        { 'contact.phone': { $regex: search, $options: 'i' } },
      ];
    }
    if (gender) query.gender = gender;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count: patients.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: patients,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SINGLE PATIENT ──────────────────────────────────────────────────────
exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Also fetch appointment summary
    const appointmentStats = await Appointment.aggregate([
      { $match: { patient: patient._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: patient,
      appointmentStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CREATE PATIENT ──────────────────────────────────────────────────────────
exports.createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patient,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A patient with this email already exists',
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE PATIENT ──────────────────────────────────────────────────────────
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: patient,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE PATIENT (soft delete) ───────────────────────────────────────────
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Cancel all future appointments
    await Appointment.updateMany(
      { patient: req.params.id, status: 'Scheduled' },
      { status: 'Cancelled' }
    );

    patient.isActive = false;
    await patient.save();

    res.json({
      success: true,
      message: 'Patient deactivated and upcoming appointments cancelled',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
