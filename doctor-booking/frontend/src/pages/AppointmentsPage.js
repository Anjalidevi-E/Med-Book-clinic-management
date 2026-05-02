import React, { useState, useEffect, useCallback } from 'react';
import { getAppointments, createAppointment, updateAppointment, cancelAppointment, deleteAppointment, getPatients } from '../utils/api';
import Modal from '../components/Modal';
import AppointmentForm from '../components/AppointmentForm';

const avatarBg = (name) => {
  const colors = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'];
  let h = 0;
  for (const c of (name || '')) h = c.charCodeAt(0) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};
const initials = (name) => name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';
const formatDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const statusColors = {
  Scheduled: { bg: '#dbeafe', color: '#1d4ed8' },
  Completed: { bg: '#dcfce7', color: '#15803d' },
  Cancelled: { bg: '#fee2e2', color: '#b91c1c' },
  'No-Show': { bg: '#fef3c7', color: '#92400e' },
};

export default function AppointmentsPage({ addToast }) {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const PER_PAGE = 9;

  const fetchAppointments = useCallback(() => {
    setLoading(true);
    getAppointments({ page, limit: PER_PAGE, search, status: filterStatus, date: filterDate })
      .then((res) => {
        setAppointments(res.data.data);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .catch(() => addToast('Failed to load appointments', 'error'))
      .finally(() => setLoading(false));
  }, [page, search, filterStatus, filterDate, addToast]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
  useEffect(() => { setPage(1); }, [search, filterStatus, filterDate]);

  useEffect(() => {
    getPatients({ limit: 200 }).then((res) => setPatients(res.data.data)).catch(() => {});
  }, []);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (selected) {
        await updateAppointment(selected._id, data);
        addToast('Appointment updated');
      } else {
        await createAppointment(data);
        addToast('Appointment booked successfully!');
      }
      fetchAppointments();
      setModal(null); setSelected(null);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save appointment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (a) => {
    if (!window.confirm(`Cancel appointment for ${a.patient?.name}?`)) return;
    try {
      await cancelAppointment(a._id);
      addToast('Appointment cancelled', 'warning');
      fetchAppointments();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel', 'error');
    }
  };

  const handleDelete = async (a) => {
    if (!window.confirm('Permanently delete this appointment?')) return;
    try {
      await deleteAppointment(a._id);
      addToast('Appointment deleted', 'warning');
      fetchAppointments();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: 'var(--slate)' }}>Appointments</h1>
          <p style={{ color: 'var(--slate-light)', fontSize: 14, marginTop: 2 }}>{total} appointments found</p>
        </div>
        <button onClick={() => { setSelected(null); setModal('form'); }}
          style={{ padding: '10px 20px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14 }}>
          + Book Appointment
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient, doctor, reason..."
          style={{ flex: 1, minWidth: 200, maxWidth: 320, padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }} />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          style={{ width: 150, padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }}>
          <option value="">All statuses</option>
          {['Scheduled', 'Completed', 'Cancelled', 'No-Show'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
          style={{ width: 160, padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }} />
        {(search || filterStatus || filterDate) && (
          <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterDate(''); }}
            style={{ padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, background: '#fff', color: 'var(--slate-mid)', fontSize: 13 }}>Clear</button>
        )}
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--slate-light)' }}>Loading appointments...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {appointments.length === 0 ? (
            <div style={{ gridColumn: '1/-1', padding: 60, textAlign: 'center', background: '#fff', borderRadius: 14, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 16, color: 'var(--slate-light)' }}>No appointments found</p>
            </div>
          ) : appointments.map((a) => {
            const sc = statusColors[a.status] || { bg: '#f1f5f9', color: '#475569' };
            return (
              <div key={a._id} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: avatarBg(a.patient?.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>{initials(a.patient?.name)}</div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--slate)' }}>{a.patient?.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--slate-light)' }}>{a.patient?.age}y · {a.patient?.gender}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}>{a.status}</span>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 0', marginBottom: 10 }}>
                    <div><p style={{ fontSize: 11, color: 'var(--slate-light)', fontWeight: 500 }}>DOCTOR</p><p style={{ fontSize: 13, color: 'var(--slate)', fontWeight: 500 }}>{a.doctorName}</p></div>
                    <div><p style={{ fontSize: 11, color: 'var(--slate-light)', fontWeight: 500 }}>SPECIALTY</p><p style={{ fontSize: 13, color: 'var(--slate)' }}>{a.specialty}</p></div>
                    <div style={{ marginTop: 8 }}><p style={{ fontSize: 11, color: 'var(--slate-light)', fontWeight: 500 }}>DATE & TIME</p><p style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>{formatDate(a.date)} at {a.time}</p></div>
                    <div style={{ marginTop: 8 }}><p style={{ fontSize: 11, color: 'var(--slate-light)', fontWeight: 500 }}>FEE</p><p style={{ fontSize: 13, color: 'var(--slate)', fontWeight: 500 }}>₹{a.fee || 0}</p></div>
                  </div>
                  <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: 8, marginBottom: 12 }}>
                    <p style={{ fontSize: 12, color: 'var(--slate-mid)' }}><strong>Reason:</strong> {a.reason}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setSelected(a); setModal('form'); }}
                      style={{ flex: 1, padding: '7px', fontSize: 12, border: '1.5px solid #bfdbfe', borderRadius: 7, background: '#eff6ff', color: '#1d4ed8', fontWeight: 500 }}>Edit</button>
                    {a.status === 'Scheduled' && (
                      <button onClick={() => handleCancel(a)}
                        style={{ flex: 1, padding: '7px', fontSize: 12, border: '1.5px solid #fde68a', borderRadius: 7, background: '#fffbeb', color: '#92400e', fontWeight: 500 }}>Cancel</button>
                    )}
                    <button onClick={() => handleDelete(a)}
                      style={{ padding: '7px 10px', fontSize: 12, border: '1.5px solid #fecaca', borderRadius: 7, background: '#fff5f5', color: 'var(--red)', fontWeight: 500 }}>✕</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '8px 16px', border: '1.5px solid var(--border)', borderRadius: 8, background: '#fff', fontSize: 13 }}>← Prev</button>
          <span style={{ fontSize: 13, color: 'var(--slate-light)' }}>Page {page} / {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
            style={{ padding: '8px 16px', border: '1.5px solid var(--border)', borderRadius: 8, background: '#fff', fontSize: 13 }}>Next →</button>
        </div>
      )}

      <Modal open={modal === 'form'} onClose={() => { setModal(null); setSelected(null); }} title={selected ? 'Edit Appointment' : 'Book Appointment'} width={640}>
        <AppointmentForm
          appointment={selected}
          patients={patients}
          onSave={handleSave}
          onClose={() => { setModal(null); setSelected(null); }}
          loading={saving}
        />
      </Modal>
    </div>
  );
}
