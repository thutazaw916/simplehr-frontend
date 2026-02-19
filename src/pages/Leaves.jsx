import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import API from '../services/api';
import toast from 'react-hot-toast';

const Leaves = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leaveType: 'sick', startDate: '', endDate: '', reason: '' });

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try { const res = await API.get('/leaves'); setLeaves(res.data.data); }
    catch (error) { toast.error(t('error')); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/leaves', form);
      toast.success(t('success'));
      setForm({ leaveType: 'sick', startDate: '', endDate: '', reason: '' });
      setShowForm(false);
      fetchLeaves();
    } catch (error) { toast.error(error.response?.data?.message || t('error')); }
  };

  const handleApprove = async (id) => {
    try { await API.put(`/leaves/${id}/approve`); toast.success(t('approved')); fetchLeaves(); }
    catch (error) { toast.error(t('error')); }
  };

  const handleReject = async (id) => {
    try { await API.put(`/leaves/${id}/reject`, { reason: 'Rejected' }); toast.success(t('rejected')); fetchLeaves(); }
    catch (error) { toast.error(t('error')); }
  };

  const statusStyles = {
    pending: { bg: theme.warningLight, color: theme.warning, icon: '⏳' },
    approved: { bg: theme.successLight, color: theme.success, icon: '✅' },
    rejected: { bg: theme.dangerLight, color: theme.danger, icon: '❌' },
  };

  const leaveTypeIcons = { sick: '🤒', casual: '🏖️', annual: '✈️', unpaid: '💤', other: '📋' };

  const getLeaveTypeText = (type) => {
    if (type === 'sick') return t('sickLeave');
    if (type === 'casual') return t('casualLeave');
    if (type === 'annual') return t('annualLeave');
    if (type === 'unpaid') return t('unpaidLeave');
    return t('otherLeave');
  };

  const getStatusText = (status) => {
    if (status === 'pending') return t('pending');
    if (status === 'approved') return t('approved');
    if (status === 'rejected') return t('rejected');
    return status;
  };

  return (
    <div style={{ ...s.container, background: theme.gradientBg, minHeight: '100vh' }}>
      <div style={s.header}>
        <h1 style={{ ...s.title, color: theme.text }}>📅 {t('leave')}</h1>
        <div style={s.headerBtns}>
          <button onClick={() => navigate('/dashboard')} style={{ ...s.backBtn, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}>
            ← {t('back')}
          </button>
          <button onClick={() => setShowForm(!showForm)} style={{ ...s.addBtn, background: showForm ? theme.dangerLight : theme.gradient1, color: showForm ? theme.danger : 'white' }}>
            {showForm ? '✕ ' + t('cancel') : '+ ' + t('applyLeave')}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ ...s.formCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          <h3 style={{ color: theme.text, fontWeight: '700', marginBottom: '16px' }}>✨ {t('applyLeave')}</h3>
          <form onSubmit={handleSubmit} style={s.form}>
            <select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }}>
              <option value="sick">🤒 {t('sickLeave')}</option>
              <option value="casual">🏖️ {t('casualLeave')}</option>
              <option value="annual">✈️ {t('annualLeave')}</option>
              <option value="unpaid">💤 {t('unpaidLeave')}</option>
              <option value="other">📋 {t('otherLeave')}</option>
            </select>
            <div style={s.dateRow}>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} required />
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} required />
            </div>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder={t('leaveReason')} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, height: '80px', resize: 'none' }} required />
            <button type="submit" style={{ ...s.submitBtn, background: theme.gradient1 }}>📤 {t('submitLeave')}</button>
          </form>
        </div>
      )}

      <div style={s.list}>
        {leaves.map((leave, index) => (
          <div key={leave._id} style={{ ...s.card, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, animationDelay: `${index * 0.05}s` }}>
            <div style={s.cardTop}>
              <div style={s.cardTopLeft}>
                <span style={{ fontSize: '24px' }}>{leaveTypeIcons[leave.leaveType] || '📋'}</span>
                <div>
                  <h4 style={{ color: theme.text, fontWeight: '700', fontSize: '15px' }}>{leave.user?.name || t('employee')}</h4>
                  <p style={{ color: theme.primary, fontSize: '12px', fontWeight: '600' }}>{getLeaveTypeText(leave.leaveType)}</p>
                </div>
              </div>
              <span style={{
                ...s.statusChip,
                background: statusStyles[leave.status]?.bg,
                color: statusStyles[leave.status]?.color,
              }}>
                {statusStyles[leave.status]?.icon} {getStatusText(leave.status)}
              </span>
            </div>

            <div style={{ ...s.infoRow, borderColor: theme.border }}>
              <span style={{ color: theme.textMuted, fontSize: '12px' }}>📆 {leave.startDate} → {leave.endDate}</span>
              <span style={{ ...s.daysBadge, background: theme.primaryLight, color: theme.primary }}>{leave.totalDays} {t('days')}</span>
            </div>

            <p style={{ color: theme.textSecondary, fontSize: '13px', marginTop: '8px', lineHeight: '1.5' }}>💬 {leave.reason}</p>

            {leave.status === 'pending' && (user?.role === 'owner' || user?.role === 'hr') && (
              <div style={s.actionRow}>
                <button onClick={() => handleApprove(leave._id)} style={{ ...s.approveBtn, background: theme.successLight, color: theme.success }}>
                  ✅ {t('approved')}
                </button>
                <button onClick={() => handleReject(leave._id)} style={{ ...s.rejectBtn, background: theme.dangerLight, color: theme.danger }}>
                  ❌ {t('rejected')}
                </button>
              </div>
            )}
          </div>
        ))}
        {leaves.length === 0 && <div style={{ ...s.empty, color: theme.textMuted }}><span style={{ fontSize: '36px' }}>📭</span><p>{t('noRecords')}</p></div>}
      </div>
    </div>
  );
};

const s = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  title: { fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' },
  headerBtns: { display: 'flex', gap: '8px' },
  backBtn: { padding: '10px 18px', borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', border: 'none' },
  addBtn: { padding: '10px 18px', borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', border: 'none' },
  formCard: { padding: '24px', borderRadius: '20px', marginBottom: '20px', animation: 'slideUp 0.3s ease-out' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { width: '100%', padding: '14px 18px', borderRadius: '14px', fontSize: '14px', boxSizing: 'border-box', fontWeight: '500' },
  dateRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  submitBtn: { width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: { padding: '18px', borderRadius: '18px', animation: 'fadeIn 0.4s ease-out' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  cardTopLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  statusChip: { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid', borderBottom: '1px solid' },
  daysBadge: { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' },
  actionRow: { display: 'flex', gap: '8px', marginTop: '12px' },
  approveBtn: { flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px' },
  rejectBtn: { flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px' },
  empty: { textAlign: 'center', padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
};

export default Leaves;