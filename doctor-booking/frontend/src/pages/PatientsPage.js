import React, { useState, useEffect, useCallback } from 'react';
import { getPatients, createPatient, updatePatient, deletePatient } from '../utils/api';
import Modal from '../components/Modal';
import PatientForm from '../components/PatientForm';

const avatarBg = (name) => {
  const colors = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'];
  let h = 0;
  for (const c of (name || '')) h = c.charCodeAt(0) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};
const initials = (name) => name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export default function PatientsPage({ addToast }) {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const PER_PAGE = 8;

  const fetchPatients = useCallback(() => {
    setLoading(true);
    getPatients({ page, limit: PER_PAGE, search, gender: filterGender })
      .then((res) => {
        setPatients(res.data.data);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .catch(() => addToast('Failed to load patients', 'error'))
      .finally(() => setLoading(false));
  }, [page, search, filterGender, addToast]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  // Debounce search
  useEffect(() => { setPage(1); }, [search, filterGender]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (selected) {
        await updatePatient(selected._id, data);
        addToast('Patient updated successfully');
      } else {
        await createPatient(data);
        addToast('Patient added successfully');
      }
      fetchPatients();
      setModal(null); setSelected(null);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save patient', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Deactivate "${p.name}"? Their scheduled appointments will be cancelled.`)) return;
    try {
      await deletePatient(p._id);
      addToast('Patient deactivated', 'warning');
      fetchPatients();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete patient', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: 'var(--slate)' }}>Patients</h1>
          <p style={{ color: 'var(--slate-light)', fontSize: 14, marginTop: 2 }}>{total} patients found</p>
        </div>
        <button onClick={() => { setSelected(null); setModal('form'); }}
          style={{ padding: '10px 20px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14 }}>
          + Add Patient
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone..."
          style={{ flex: 1, maxWidth: 360, padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }}
        />
        <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)}
          style={{ width: 140, padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }}>
          <option value="">All genders</option>
          {['Male', 'Female', 'Other'].map((g) => <option key={g}>{g}</option>)}
        </select>
        {(search || filterGender) && (
          <button onClick={() => { setSearch(''); setFilterGender(''); }}
            style={{ padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, background: '#fff', color: 'var(--slate-mid)', fontSize: 13 }}>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--slate-light)' }}>Loading patients...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                {['Patient', 'Contact', 'Blood Group', 'Registered', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--slate-mid)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--slate-light)' }}>No patients found</td></tr>
              ) : patients.map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: avatarBg(p.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials(p.name)}</div>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--slate)' }}>{p.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--slate-light)' }}>{p.age}y · {p.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ fontSize: 13, color: 'var(--slate)' }}>{p.contact.phone}</p>
                    <p style={{ fontSize: 12, color: 'var(--slate-light)' }}>{p.contact.email}</p>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: 'var(--teal-light)', color: 'var(--teal-dark)' }}>{p.bloodGroup}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--slate-light)' }}>{formatDate(p.createdAt)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setSelected(p); setModal('view'); }}
                        style={{ padding: '6px 12px', fontSize: 12, border: '1.5px solid var(--border)', borderRadius: 7, background: '#fff', color: 'var(--slate-mid)', fontWeight: 500 }}>View</button>
                      <button onClick={() => { setSelected(p); setModal('form'); }}
                        style={{ padding: '6px 12px', fontSize: 12, border: '1.5px solid #bfdbfe', borderRadius: 7, background: '#eff6ff', color: '#1d4ed8', fontWeight: 500 }}>Edit</button>
                      <button onClick={() => handleDelete(p)}
                        style={{ padding: '6px 12px', fontSize: 12, border: '1.5px solid #fecaca', borderRadius: 7, background: '#fff5f5', color: 'var(--red)', fontWeight: 500 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {pages > 1 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--slate-light)' }}>Page {page} of {pages}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '6px 14px', border: '1.5px solid var(--border)', borderRadius: 7, background: page === 1 ? '#f8fafc' : '#fff', fontSize: 13, color: page === 1 ? 'var(--slate-light)' : 'var(--slate)' }}>← Prev</button>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                style={{ padding: '6px 14px', border: '1.5px solid var(--border)', borderRadius: 7, background: page === pages ? '#f8fafc' : '#fff', fontSize: 13, color: page === pages ? 'var(--slate-light)' : 'var(--slate)' }}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal === 'form'} onClose={() => { setModal(null); setSelected(null); }} title={selected ? `Edit: ${selected.name}` : 'Add New Patient'}>
        <PatientForm patient={selected} onSave={handleSave} onClose={() => { setModal(null); setSelected(null); }} loading={saving} />
      </Modal>

      {/* View Modal */}
      <Modal open={modal === 'view'} onClose={() => { setModal(null); setSelected(null); }} title="Patient Details" width={520}>
        {selected && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 20, background: '#f8fafc', borderRadius: 12 }}>
              <div style={{ width: 60, height: 60, borderRadius: 14, background: avatarBg(selected.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff' }}>{initials(selected.name)}</div>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: 18, color: 'var(--slate)' }}>{selected.name}</h3>
                <p style={{ color: 'var(--slate-light)', fontSize: 14 }}>{selected.age} years · {selected.gender} · <strong style={{ color: 'var(--teal-dark)' }}>{selected.bloodGroup}</strong></p>
              </div>
            </div>
            {[['Phone', selected.contact.phone], ['Email', selected.contact.email], ['Address', selected.contact.address || '—']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: 'var(--slate-light)', width: 80, flexShrink: 0, fontWeight: 500 }}>{k}</span>
                <span style={{ fontSize: 14, color: 'var(--slate)' }}>{v}</span>
              </div>
            ))}
            {selected.medicalHistory && (
              <div style={{ marginTop: 16, padding: 14, background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 6 }}>MEDICAL HISTORY</p>
                <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6 }}>{selected.medicalHistory}</p>
              </div>
            )}
            <p style={{ fontSize: 12, color: 'var(--slate-light)', marginTop: 16 }}>Registered: {formatDate(selected.createdAt)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
