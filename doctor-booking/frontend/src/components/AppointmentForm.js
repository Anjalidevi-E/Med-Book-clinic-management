import React, { useState } from 'react';
import { Field, FormGrid, inputStyle, PrimaryButton, SecondaryButton } from './FormComponents';

export const SPECIALTIES = [
  'General Practice', 'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics',
  'Pediatrics', 'Psychiatry', 'Radiology', 'Oncology', 'Gynecology',
  'Ophthalmology', 'ENT', 'Urology', 'Endocrinology', 'Other',
];

const today = new Date().toISOString().split('T')[0];

export default function AppointmentForm({ appointment, patients, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    patient: appointment?.patient?._id || appointment?.patient || '',
    doctorName: appointment?.doctorName || '',
    specialty: appointment?.specialty || 'General Practice',
    date: appointment?.date || '',
    time: appointment?.time || '',
    duration: appointment?.duration || 30,
    reason: appointment?.reason || '',
    fee: appointment?.fee || '',
    notes: appointment?.notes || '',
    status: appointment?.status || 'Scheduled',
  });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.patient) e.patient = 'Patient is required';
    if (!form.doctorName.trim()) e.doctorName = 'Doctor name is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.time) e.time = 'Time is required';
    if (!form.reason.trim()) e.reason = 'Reason is required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...form, duration: +form.duration, fee: +form.fee || 0 });
  };

  return (
    <div>
      <Field label="Patient *" error={errors.patient}>
        <select style={inputStyle} value={form.patient} onChange={set('patient')}>
          <option value="">Select patient...</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>{p.name} ({p.age}y, {p.gender})</option>
          ))}
        </select>
      </Field>
      <FormGrid>
        <Field label="Doctor Name *" error={errors.doctorName} half>
          <input style={inputStyle} value={form.doctorName} onChange={set('doctorName')} placeholder="Dr. Full Name" />
        </Field>
        <Field label="Specialty *" half>
          <select style={inputStyle} value={form.specialty} onChange={set('specialty')}>
            {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Date *" error={errors.date} half>
          <input style={inputStyle} type="date" value={form.date} onChange={set('date')} min={today} />
        </Field>
        <Field label="Time *" error={errors.time} half>
          <input style={inputStyle} type="time" value={form.time} onChange={set('time')} />
        </Field>
        <Field label="Duration (minutes)" half>
          <select style={inputStyle} value={form.duration} onChange={set('duration')}>
            {[15, 30, 45, 60, 90, 120].map((d) => <option key={d} value={d}>{d} min</option>)}
          </select>
        </Field>
        <Field label="Consultation Fee (₹)" half>
          <input style={inputStyle} type="number" value={form.fee} onChange={set('fee')} placeholder="0" min="0" />
        </Field>
      </FormGrid>
      <Field label="Reason for Visit *" error={errors.reason}>
        <input style={inputStyle} value={form.reason} onChange={set('reason')} placeholder="Brief reason for visit" />
      </Field>
      <Field label="Notes">
        <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} value={form.notes} onChange={set('notes')} placeholder="Additional notes..." />
      </Field>
      {appointment && (
        <Field label="Status" half>
          <select style={inputStyle} value={form.status} onChange={set('status')}>
            {['Scheduled', 'Completed', 'Cancelled', 'No-Show'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton onClick={handleSubmit} loading={loading}>
          {appointment ? 'Update Appointment' : 'Book Appointment'}
        </PrimaryButton>
      </div>
    </div>
  );
}
