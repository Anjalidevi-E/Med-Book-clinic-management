import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../utils/api';

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '20px 22px',
      boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: color + '22', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <p style={{ fontSize: 13, color: 'var(--slate-light)', fontWeight: 500, marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--slate)', lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: 'var(--slate-light)', marginTop: 3 }}>{sub}</p>}
      </div>
    </div>
  );
}

const avatarBg = (name) => {
  const colors = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'];
  let h = 0;
  for (const c of (name || '')) h = c.charCodeAt(0) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};
const initials = (name) => name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';
const formatDate = (d) => {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const statusColors = {
  Scheduled: { bg: '#dbeafe', color: '#1d4ed8' },
  Completed: { bg: '#dcfce7', color: '#15803d' },
  Cancelled: { bg: '#fee2e2', color: '#b91c1c' },
  'No-Show': { bg: '#fef3c7', color: '#92400e' },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: 'var(--slate-light)', fontSize: 15 }}>Loading dashboard...</p>
    </div>
  );

  if (error) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p style={{ color: 'var(--red)', fontSize: 15 }}>{error}</p>
    </div>
  );

  const statusMap = {};
  (stats?.statusBreakdown || []).forEach((s) => { statusMap[s._id] = s.count; });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--slate)' }}>Good day! 👋</h1>
        <p style={{ color: 'var(--slate-light)', marginTop: 4, fontSize: 15 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Patients" value={stats?.totalPatients || 0} icon="👥" color="#0d9488" sub="registered patients" />
        <StatCard label="Today's Appointments" value={stats?.todayAppointments || 0} icon="📅" color="#3b82f6" sub="scheduled today" />
        <StatCard label="Scheduled" value={statusMap['Scheduled'] || 0} icon="⏰" color="#8b5cf6" sub="upcoming" />
        <StatCard label="Completed" value={statusMap['Completed'] || 0} icon="✅" color="#22c55e" sub="all time" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Upcoming appointments */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontWeight: 600, fontSize: 15, color: 'var(--slate)' }}>Upcoming Appointments</h3>
            <button onClick={() => navigate('/appointments')} style={{ fontSize: 12, color: 'var(--teal)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>View all →</button>
          </div>
          <div>
            {!stats?.upcomingAppointments?.length ? (
              <p style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--slate-light)', fontSize: 14 }}>No upcoming appointments</p>
            ) : stats.upcomingAppointments.map((a) => {
              const sc = statusColors[a.status] || {};
              return (
                <div key={a._id} style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: avatarBg(a.patient?.name) + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: avatarBg(a.patient?.name) }}>
                    {initials(a.patient?.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--slate)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.patient?.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--slate-light)' }}>{a.doctorName} · {a.time}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)' }}>{formatDate(a.date)}</p>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color }}>{a.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status breakdown */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: 600, fontSize: 15, color: 'var(--slate)' }}>Appointment Overview</h3>
          </div>
          <div style={{ padding: '20px' }}>
            {['Scheduled', 'Completed', 'Cancelled', 'No-Show'].map((status) => {
              const count = statusMap[status] || 0;
              const total = stats?.totalAppointments || 1;
              const pct = Math.round((count / total) * 100);
              const sc = statusColors[status];
              return (
                <div key={status} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--slate)' }}>{status}</span>
                    <span style={{ fontSize: 13, color: 'var(--slate-light)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: sc.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 20, padding: '14px', background: '#f8fafc', borderRadius: 10, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--slate-light)' }}>Total Appointments</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--slate)' }}>{stats?.totalAppointments || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
