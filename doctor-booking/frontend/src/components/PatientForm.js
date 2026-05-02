import React, { useState } from 'react';
import { Field, FormGrid, inputStyle, PrimaryButton, SecondaryButton } from './FormComponents';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export default function PatientForm({ patient, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    name: patient?.name || '',
    age: patient?.age || '',
    gender: patient?.gender || 'Male',
    phone: patient?.contact?.phone || '',
    email: patient?.contact?.email || '',
    address: patient?.contact?.address || '',
    bloodGroup: patient?.bloodGroup || 'Unknown',
    medicalHistory: patient?.medicalHistory || '',
  });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.age || +form.age < 0 || +form.age > 150) e.age = 'Valid age required (0–150)';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      name: form.name, age: +form.age, gender: form.gender,
      bloodGroup: form.bloodGroup, medicalHistory: form.medicalHistory,
      contact: { phone: form.phone, email: form.email, address: form.address },
    });
  };

  return (
    <div>
      <FormGrid>
        <Field label="Full Name *" error={errors.name} half>
          <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="Patient full name" />
        </Field>
        <Field label="Age *" error={errors.age} half>
          <input style={inputStyle} type="number" value={form.age} onChange={set('age')} placeholder="Age" />
        </Field>
        <Field label="Gender *" half>
          <select style={inputStyle} value={form.gender} onChange={set('gender')}>
            {['Male', 'Female', 'Other'].map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Blood Group" half>
          <select style={inputStyle} value={form.bloodGroup} onChange={set('bloodGroup')}>
            {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Phone *" error={errors.phone} half>
          <input style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="+91-XXXXXXXXXX" />
        </Field>
        <Field label="Email *" error={errors.email} half>
          <input style={inputStyle} type="email" value={form.email} onChange={set('email')} placeholder="patient@email.com" />
        </Field>
      </FormGrid>
      <Field label="Address">
        <input style={inputStyle} value={form.address} onChange={set('address')} placeholder="Street, City, State" />
      </Field>
      <Field label="Medical History">
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
          value={form.medicalHistory}
          onChange={set('medicalHistory')}
          placeholder="Prior diagnoses, allergies, current medications..."
        />
      </Field>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton onClick={handleSubmit} loading={loading}>
          {patient ? 'Update Patient' : 'Add Patient'}
        </PrimaryButton>
      </div>
    </div>
  );
}
