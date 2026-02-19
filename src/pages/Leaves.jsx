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
  const [myLeaves, setMyLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState('my');
  const [form, setForm] = useState({ leaveType: 'sick', startDate: '', endDate: '', reason: '' });

  const isAdmin = user?.role === 'owner' || user?.role === 'hr';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const promises = [
        API.get('/leaves/my'),
        API.get('/leaves/balance'),
      ];
      if (isAdmin) {
        promises.push(API.get('/leaves'));
      }
      const results = await Promise.all(promises);
      setMyLeaves(results[0].data.data);
      setLeaveBalance(results[1].data.data);
      if (isAdmin) {
        setLeaves(results[2].data.data);
      }
    } catch (error) {
      console.log('Error:', error.message);
      // fallback - if /leaves/balance doesn't exist yet
      try {
        const myRes = await API.get('/leaves/my');
        setMyLeaves(myRes.data.data);
        calculateLocalBalance(myRes.data.data);
        if (isAdmin) {
          const allRes = await API.get('/leaves');
          setLeaves(allRes.data.data);
        }
      } catch (err) {
        console.log('Fallback error:', err.message);
      }
    }
  };

  // Calculate leave balance locally if API doesn't exist
  const calculateLocalBalance = (myLeavesData) => {
    const currentYear = new Date().getFullYear();
    const yearLeaves = myLeavesData.filter(l => {
      const leaveYear = new Date(l.startDate).getFullYear();
      return leaveYear === currentYear && l.status === 'approved';
    });

    let casualUsed = 0, sickUsed = 0, annualUsed = 0, unpaidUsed = 0;
    yearLeaves.forEach(l => {
      if (l.leaveType === 'casual') casualUsed += l.totalDays;
      else if (l.leaveType === 'sick') sickUsed += l.totalDays;
      else if (l.leaveType === 'annual') annualUsed += l.totalDays;
      else if (l.leaveType === 'unpaid') unpaidUsed += l.totalDays;
    });

    setLeaveBalance({
      casual: { total: 6, used: casualUsed, remaining: Math.max(0, 6 - casualUsed) },
      earned: { total: 10, used: annualUsed, remaining: Math.max(0, 10 - annualUsed) },
      sick: { total: 30, used: sickUsed, remaining: Math.max(0, 30 - sickUsed) },
      maternity: { total: 98, used: 0, remaining: 98 },
      paternity: { total: 15, used: 0, remaining: 15 },
      unpaid: { total: 0, used: unpaidUsed, remaining: 0 },
      totalUsed: casualUsed + sickUsed + annualUsed + unpaidUsed,
      totalRemaining: Math.max(0, 6 - casualUsed) + Math.max(0, 10 - annualUsed) + Math.max(0, 30 - sickUsed),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/leaves', form);
      toast.success(t('success'));
      setForm({ leaveType: 'sick', startDate: '', endDate: '', reason: '' });
      setShowForm(false);
      fetchData();
    } catch (error) { toast.error(error.response?.data?.message || t('error')); }
  };

  const handleApprove = async (id) => {
    try { await API.put(`/leaves/${id}/approve`); toast.success(t('approved')); fetchData(); }
    catch (error) { toast.error(t('error')); }
  };

  const handleReject = async (id) => {
    try { await API.put(`/leaves/${id}/reject`, { reason: 'Rejected' }); toast.success(t('rejected')); fetchData(); }
    catch (error) { toast.error(t('error')); }
  };

  const statusStyles = {
    pending: { bg: theme.warningLight, color: theme.warning, icon: '⏳' },
    approved: { bg: theme.successLight, color: theme.success, icon: '✅' },
    rejected: { bg: theme.dangerLight, color: theme.danger, icon: '❌' },
  };

  const leaveTypeConfig = {
    sick: { icon: '🤒', color: theme.danger },
    casual: { icon: '🏖️', color: theme.info },
    annual: { icon: '✈️', color: theme.primary },
    unpaid: { icon: '💤', color: theme.textMuted },
    other: { icon: '📋', color: theme.warning },
  };

  const getLeaveTypeText = (type) => {
    const map = { sick: t('sickLeave'), casual: t('casualLeave'), annual: t('annualLeave'), unpaid: t('unpaidLeave'), other: t('otherLeave') };
    return map[type] || t('otherLeave');
  };

  const getStatusText = (status) => {
    const map = { pending: t('pending'), approved: t('approved'), rejected: t('rejected') };
    return map[status] || status;
  };

  const currentList = tab === 'my' ? myLeaves : leaves;

  return (
    <div style={{ ...s.container, background: theme.gradientBg, minHeight: '100vh' }}>
      {/* Header */}
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

      {/* ========== LEAVE BALANCE CARD ========== */}
      {leaveBalance && (
        <div style={{ ...s.balanceCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          <div style={s.balanceHeader}>
            <h3 style={{ color: theme.text, fontWeight: '800', fontSize: '16px' }}>
              🏖️ {t('leaveBalance')} - {new Date().getFullYear()}
            </h3>
            <div style={{ ...s.totalBadge, background: theme.primaryLight }}>
              <span style={{ color: theme.primary, fontWeight: '800', fontSize: '14px' }}>
                {leaveBalance.totalRemaining || 0}
              </span>
              <span style={{ color: theme.textMuted, fontSize: '10px', fontWeight: '600' }}>
                {t('remainingLeave')}
              </span>
            </div>
          </div>

          {/* Balance Grid */}
          <div style={s.balanceGrid}>
            {/* Casual Leave */}
            <div style={{ ...s.balanceItem, background: theme.infoLight, border: `1px solid rgba(96, 165, 250, 0.15)` }}>
              <div style={s.balanceItemTop}>
                <span style={{ fontSize: '20px' }}>🏖️</span>
                <span style={{ color: theme.info, fontWeight: '800', fontSize: '22px' }}>
                  {leaveBalance.casual?.remaining ?? 6}
                </span>
              </div>
              <p style={{ color: theme.text, fontWeight: '700', fontSize: '12px', marginBottom: '4px' }}>
                {t('casualLeave')}
              </p>
              <div style={s.balanceBar}>
                <div style={{
                  ...s.balanceBarFill,
                  width: `${((leaveBalance.casual?.used || 0) / (leaveBalance.casual?.total || 6)) * 100}%`,
                  background: theme.info,
                }}></div>
              </div>
              <p style={{ color: theme.textMuted, fontSize: '10px', marginTop: '4px' }}>
                {leaveBalance.casual?.used || 0}/{leaveBalance.casual?.total || 6} {t('usedLeave')}
              </p>
            </div>

            {/* Earned/Annual Leave */}
            <div style={{ ...s.balanceItem, background: theme.primaryLight, border: `1px solid rgba(129, 140, 248, 0.15)` }}>
              <div style={s.balanceItemTop}>
                <span style={{ fontSize: '20px' }}>✈️</span>
                <span style={{ color: theme.primary, fontWeight: '800', fontSize: '22px' }}>
                  {leaveBalance.earned?.remaining ?? 10}
                </span>
              </div>
              <p style={{ color: theme.text, fontWeight: '700', fontSize: '12px', marginBottom: '4px' }}>
                {t('earnedLeave')}
              </p>
              <div style={s.balanceBar}>
                <div style={{
                  ...s.balanceBarFill,
                  width: `${((leaveBalance.earned?.used || 0) / (leaveBalance.earned?.total || 10)) * 100}%`,
                  background: theme.primary,
                }}></div>
              </div>
              <p style={{ color: theme.textMuted, fontSize: '10px', marginTop: '4px' }}>
                {leaveBalance.earned?.used || 0}/{leaveBalance.earned?.total || 10} {t('usedLeave')}
              </p>
            </div>

            {/* Sick Leave */}
            <div style={{ ...s.balanceItem, background: theme.dangerLight, border: `1px solid rgba(248, 113, 113, 0.15)` }}>
              <div style={s.balanceItemTop}>
                <span style={{ fontSize: '20px' }}>🤒</span>
                <span style={{ color: theme.danger, fontWeight: '800', fontSize: '22px' }}>
                  {leaveBalance.sick?.remaining ?? 30}
                </span>
              </div>
              <p style={{ color: theme.text, fontWeight: '700', fontSize: '12px', marginBottom: '4px' }}>
                {t('sickLeave')}
              </p>
              <div style={s.balanceBar}>
                <div style={{
                  ...s.balanceBarFill,
                  width: `${((leaveBalance.sick?.used || 0) / (leaveBalance.sick?.total || 30)) * 100}%`,
                  background: theme.danger,
                }}></div>
              </div>
              <p style={{ color: theme.textMuted, fontSize: '10px', marginTop: '4px' }}>
                {leaveBalance.sick?.used || 0}/{leaveBalance.sick?.total || 30} {t('usedLeave')}
              </p>
            </div>

            {/* Maternity Leave */}
            <div style={{ ...s.balanceItem, background: theme.warningLight, border: `1px solid rgba(251, 191, 36, 0.15)` }}>
              <div style={s.balanceItemTop}>
                <span style={{ fontSize: '20px' }}>🤱</span>
                <span style={{ color: theme.warning, fontWeight: '800', fontSize: '22px' }}>
                  {leaveBalance.maternity?.remaining ?? 98}
                </span>
              </div>
              <p style={{ color: theme.text, fontWeight: '700', fontSize: '12px', marginBottom: '4px' }}>
                {t('maternityLeave')}
              </p>
              <div style={s.balanceBar}>
                <div style={{
                  ...s.balanceBarFill,
                  width: `${((leaveBalance.maternity?.used || 0) / (leaveBalance.maternity?.total || 98)) * 100}%`,
                  background: theme.warning,
                }}></div>
              </div>
              <p style={{ color: theme.textMuted, fontSize: '10px', marginTop: '4px' }}>
                {leaveBalance.maternity?.used || 0}/{leaveBalance.maternity?.total || 98} {t('usedLeave')}
              </p>
            </div>

            {/* Paternity Leave */}
            <div style={{ ...s.balanceItem, background: theme.successLight, border: `1px solid rgba(52, 211, 153, 0.15)` }}>
              <div style={s.balanceItemTop}>
                <span style={{ fontSize: '20px' }}>👨‍👧</span>
                <span style={{ color: theme.success, fontWeight: '800', fontSize: '22px' }}>
                  {leaveBalance.paternity?.remaining ?? 15}
                </span>
              </div>
              <p style={{ color: theme.text, fontWeight: '700', fontSize: '12px', marginBottom: '4px' }}>
                {t('paternityLeave')}
              </p>
              <div style={s.balanceBar}>
                <div style={{
                  ...s.balanceBarFill,
                  width: `${((leaveBalance.paternity?.used || 0) / (leaveBalance.paternity?.total || 15)) * 100}%`,
                  background: theme.success,
                }}></div>
              </div>
              <p style={{ color: theme.textMuted, fontSize: '10px', marginTop: '4px' }}>
                {leaveBalance.paternity?.used || 0}/{leaveBalance.paternity?.total || 15} {t('usedLeave')}
              </p>
            </div>

            {/* Total Summary */}
            <div style={{
              ...s.balanceItem,
              background: `linear-gradient(135deg, rgba(129,140,248,0.1) 0%, rgba(167,139,250,0.1) 100%)`,
              border: `1px solid rgba(129, 140, 248, 0.2)`,
            }}>
              <div style={s.balanceItemTop}>
                <span style={{ fontSize: '20px' }}>📊</span>
                <span style={{ color: theme.primary, fontWeight: '900', fontSize: '22px' }}>
                  {leaveBalance.totalUsed || 0}
                </span>
              </div>
              <p style={{ color: theme.text, fontWeight: '700', fontSize: '12px', marginBottom: '4px' }}>
                {t('totalLeave')} {t('usedLeave')}
              </p>
              <p style={{ color: theme.textMuted, fontSize: '10px' }}>
                {t('remainingLeave')}: {leaveBalance.totalRemaining || 0} {t('days')}
              </p>
            </div>
          </div>

          {/* Myanmar Labor Law Note */}
          <div style={{ ...s.lawNote, background: theme.warningLight, borderColor: theme.warning }}>
            <span style={{ fontSize: '14px' }}>⚖️</span>
            <p style={{ color: theme.warning, fontSize: '11px', fontWeight: '600' }}>
              Myanmar Labor Law: Casual 6 days, Earned 10 days, Sick 30 days, Maternity 14 weeks, Paternity 15 days
            </p>
          </div>
        </div>
      )}

      {/* ========== APPLY LEAVE FORM ========== */}
      {showForm && (
        <div style={{ ...s.formCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          <h3 style={{ color: theme.text, fontWeight: '700', marginBottom: '16px' }}>✨ {t('applyLeave')}</h3>
          
          {/* Quick balance reminder */}
          {leaveBalance && (
            <div style={{ ...s.quickBalance, background: theme.bgTertiary }}>
              <span style={{ color: theme.info, fontSize: '11px', fontWeight: '700' }}>🏖️ {leaveBalance.casual?.remaining || 0}</span>
              <span style={{ color: theme.primary, fontSize: '11px', fontWeight: '700' }}>✈️ {leaveBalance.earned?.remaining || 0}</span>
              <span style={{ color: theme.danger, fontSize: '11px', fontWeight: '700' }}>🤒 {leaveBalance.sick?.remaining || 0}</span>
              <span style={{ color: theme.textMuted, fontSize: '11px', fontWeight: '600' }}>{t('remainingLeave')}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={s.form}>
            <select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }}>
              <option value="sick">🤒 {t('sickLeave')} ({leaveBalance?.sick?.remaining ?? 30} {t('remainingLeave')})</option>
              <option value="casual">🏖️ {t('casualLeave')} ({leaveBalance?.casual?.remaining ?? 6} {t('remainingLeave')})</option>
              <option value="annual">✈️ {t('annualLeave')} ({leaveBalance?.earned?.remaining ?? 10} {t('remainingLeave')})</option>
              <option value="unpaid">💤 {t('unpaidLeave')}</option>
              <option value="other">📋 {t('otherLeave')}</option>
            </select>
            <div style={s.dateRow}>
              <div style={s.dateGroup}>
                <label style={{ color: theme.textSecondary, fontSize: '11px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>{t('leaveFrom')}</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} required />
              </div>
              <div style={s.dateGroup}>
                <label style={{ color: theme.textSecondary, fontSize: '11px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>{t('leaveTo')}</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} required />
              </div>
            </div>
            
            {/* Show days count */}
            {form.startDate && form.endDate && (
              <div style={{ ...s.daysPreview, background: theme.primaryLight }}>
                <span style={{ color: theme.primary, fontWeight: '800', fontSize: '14px' }}>
                  📅 {Math.max(1, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)) + 1)} {t('days')}
                </span>
              </div>
            )}
            
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder={t('leaveReason')} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, height: '80px', resize: 'none' }} required />
            <button type="submit" style={{ ...s.submitBtn, background: theme.gradient1 }}>📤 {t('submitLeave')}</button>
          </form>
        </div>
      )}

      {/* ========== TABS ========== */}
      <div style={s.tabs}>
        {[
          { key: 'my', label: '📋 ' + t('leaveHistory'), show: true },
          { key: 'all', label: '📊 ' + t('leaveRequests'), show: isAdmin },
        ].filter(item => item.show).map((item) => (
          <button key={item.key} onClick={() => setTab(item.key)} style={{
            ...s.tab,
            ...(tab === item.key ? { background: theme.gradient1, color: 'white', boxShadow: '0 4px 15px rgba(129,140,248,0.3)' } : { background: theme.cardBg, color: theme.textSecondary, border: `1px solid ${theme.cardBorder}` })
          }}>{item.label}</button>
        ))}
      </div>

      {/* ========== LEAVE LIST ========== */}
      <div style={s.list}>
        {currentList.map((leave, index) => (
          <div key={leave._id} style={{ ...s.card, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, animationDelay: `${index * 0.05}s` }}>
            <div style={s.cardTop}>
              <div style={s.cardTopLeft}>
                <span style={{ fontSize: '24px' }}>{leaveTypeConfig[leave.leaveType]?.icon || '📋'}</span>
                <div>
                  <h4 style={{ color: theme.text, fontWeight: '700', fontSize: '15px' }}>
                    {tab === 'all' ? (leave.user?.name || t('employee')) : getLeaveTypeText(leave.leaveType)}
                  </h4>
                  {tab === 'all' && (
                    <p style={{ color: leaveTypeConfig[leave.leaveType]?.color || theme.primary, fontSize: '12px', fontWeight: '600' }}>
                      {getLeaveTypeText(leave.leaveType)}
                    </p>
                  )}
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

            {leave.status === 'pending' && isAdmin && tab === 'all' && (
              <div style={s.actionRow}>
                <button onClick={() => handleApprove(leave._id)} style={{ ...s.approveBtn, background: theme.successLight, color: theme.success }}>
                  ✅ {t('approved')}
                </button>
                <button onClick={() => handleReject(leave._id)} style={{ ...s.rejectBtn, background: theme.dangerLight, color: theme.danger }}>
                  ❌ {t('rejected')}
                </button>
              </div>
            )}

            {/* Show rejection reason */}
            {leave.status === 'rejected' && leave.rejectReason && (
              <div style={{ ...s.rejectNote, background: theme.dangerLight, borderColor: theme.danger }}>
                <span style={{ color: theme.danger, fontSize: '12px', fontWeight: '600' }}>
                  ❌ {leave.rejectReason}
                </span>
              </div>
            )}
          </div>
        ))}
        {currentList.length === 0 && (
          <div style={{ ...s.empty, color: theme.textMuted }}>
            <span style={{ fontSize: '36px' }}>📭</span>
            <p>{t('noRecords')}</p>
          </div>
        )}
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

  // Balance Card
  balanceCard: { padding: '20px', borderRadius: '20px', marginBottom: '16px', animation: 'fadeIn 0.5s ease-out' },
  balanceHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  totalBadge: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 16px', borderRadius: '14px' },
  balanceGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  balanceItem: { padding: '14px 10px', borderRadius: '14px', textAlign: 'center' },
  balanceItemTop: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' },
  balanceBar: { width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  balanceBarFill: { height: '100%', borderRadius: '2px', transition: 'width 0.5s ease-out' },
  lawNote: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '10px 14px', borderRadius: '10px', borderLeft: '3px solid' },

  // Form
  formCard: { padding: '24px', borderRadius: '20px', marginBottom: '16px', animation: 'slideUp 0.3s ease-out' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { width: '100%', padding: '14px 18px', borderRadius: '14px', fontSize: '14px', boxSizing: 'border-box', fontWeight: '500' },
  dateRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  dateGroup: {},
  daysPreview: { padding: '10px', borderRadius: '12px', textAlign: 'center' },
  quickBalance: { display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', flexWrap: 'wrap' },
  submitBtn: { width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },

  // Tabs
  tabs: { display: 'flex', gap: '10px', marginBottom: '16px' },
  tab: { padding: '12px 20px', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', flex: 1, textAlign: 'center' },

  // List
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
  rejectNote: { marginTop: '10px', padding: '8px 12px', borderRadius: '10px', borderLeft: '3px solid' },
  empty: { textAlign: 'center', padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
};

export default Leaves;