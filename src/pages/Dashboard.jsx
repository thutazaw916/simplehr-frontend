import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import BottomNav from '../components/BottomNav';

const Dashboard = () => {
  const { user } = useAuth();
  const { lang, t, switchLanguage } = useLanguage();
  const { isDark, toggleTheme, theme } = useTheme();
  const navigate = useNavigate();
  const [todayStatus, setTodayStatus] = useState(null);
  const [myAttendances, setMyAttendances] = useState([]);
  const [stats, setStats] = useState({ employees: 0, leaves: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [todayRes, myRes] = await Promise.all([
        API.get('/attendance/today'),
        API.get('/attendance/my')
      ]);
      setTodayStatus(todayRes.data.data);
      setMyAttendances(myRes.data.data.slice(0, 5));

      if (user?.role === 'owner' || user?.role === 'hr') {
        const [empRes, leaveRes] = await Promise.all([
          API.get('/employees'),
          API.get('/leaves?status=pending')
        ]);
        setStats({ employees: empRes.data.count, leaves: leaveRes.data.count });
      }
    } catch (error) {
      console.log('Error:', error.message);
    }
  };

  const handleCheckIn = async () => {
    try {
      const res = await API.post('/attendance/checkin', { note: '' });
      toast.success(res.data.message);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || t('checkInFailed'));
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await API.put('/attendance/checkout', { note: '' });
      toast.success(res.data.message);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || t('checkOutFailed'));
    }
  };

  const isAdmin = user?.role === 'owner' || user?.role === 'hr';
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const getRoleName = (role) => {
    if (role === 'owner') return t('owner');
    if (role === 'hr') return t('hr');
    return t('employee');
  };

  return (
    <div style={{ ...s.container, background: theme.gradientBg }}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <p style={{ ...s.greeting, color: theme.textSecondary }}>{t('welcome')}</p>
          <h2 style={{ ...s.userName, color: theme.text }}>{user?.name}</h2>
          <span style={{ ...s.roleBadge, background: theme.primaryLight, color: theme.primary, border: `1px solid ${theme.primaryGlow}` }}>{getRoleName(user?.role)}</span>
        </div>
        <div style={s.headerRight}>
          <button onClick={toggleTheme} style={{ ...s.iconBtn, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            {isDark ? '☀️' : '🌙'}
          </button>
          <button onClick={() => switchLanguage(lang === 'mm' ? 'en' : 'mm')} style={{ ...s.iconBtn, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text, fontSize: '12px', fontWeight: '700' }}>
            {lang === 'mm' ? 'EN' : 'MM'}
          </button>
          <div style={{ ...s.avatar, background: theme.gradient1 }}>{user?.name?.charAt(0)}</div>
        </div>
      </div>

      {/* Live Clock */}
      <div style={{ ...s.clockCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        <p style={{ ...s.clockTime, color: theme.text }}>{timeStr}</p>
        <p style={{ ...s.clockDate, color: theme.textSecondary }}>{dateStr}</p>
      </div>

      {/* Attendance Card */}
      <div style={{ ...s.attendanceCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        <div style={s.cardHeader}>
          <h3 style={{ ...s.sectionTitle, color: theme.text }}><span style={s.sectionDot}></span>{t('todayAttendance')}</h3>
        </div>

        {todayStatus && !todayStatus.checkedIn && (
          <button onClick={handleCheckIn} style={s.checkInBtn}>
            <div style={s.checkBtnIcon}>🕐</div>
            <div><p style={s.checkBtnLabel}>{t('checkIn')}</p><p style={s.checkBtnSub}>Tap to start your day</p></div>
            <span style={s.checkBtnArrow}>→</span>
          </button>
        )}

        {todayStatus && todayStatus.checkedIn && !todayStatus.checkedOut && (
          <div>
            <div style={s.timeInfoRow}>
              <div style={{ ...s.timeInfoBox, background: theme.successLight }}>
                <p style={{ ...s.timeInfoLabel, color: theme.success }}>✓ {t('checkIn')}</p>
                <p style={{ ...s.timeInfoValue, color: theme.text }}>{new Date(todayStatus.attendance?.checkIn?.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div style={{ ...s.statusBadge, background: todayStatus.attendance?.status === 'present' ? theme.successLight : theme.warningLight }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: todayStatus.attendance?.status === 'present' ? theme.success : theme.warning, animation: 'heartbeat 2s ease-in-out infinite' }}></div>
                <span style={{ color: todayStatus.attendance?.status === 'present' ? theme.success : theme.warning, fontWeight: '700', fontSize: '13px' }}>
                  {todayStatus.attendance?.status === 'present' ? t('onTime') : t('late')}
                </span>
              </div>
            </div>
            <button onClick={handleCheckOut} style={s.checkOutBtn}>
              <div style={s.checkBtnIcon}>🏠</div>
              <div><p style={s.checkBtnLabel}>{t('checkOut')}</p><p style={s.checkBtnSub}>End your work day</p></div>
              <span style={s.checkBtnArrow}>→</span>
            </button>
          </div>
        )}

        {todayStatus && todayStatus.checkedOut && (
          <div>
            <div style={s.completedGrid}>
              <div style={{ ...s.completedItem, background: theme.successLight }}>
                <p style={{ color: theme.textSecondary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{t('checkIn')}</p>
                <p style={{ color: theme.text, fontSize: '18px', fontWeight: '800' }}>{new Date(todayStatus.attendance?.checkIn?.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div style={{ ...s.completedItem, background: theme.warningLight }}>
                <p style={{ color: theme.textSecondary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{t('checkOut')}</p>
                <p style={{ color: theme.text, fontSize: '18px', fontWeight: '800' }}>{new Date(todayStatus.attendance?.checkOut?.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div style={{ ...s.completedItem, background: theme.primaryLight }}>
                <p style={{ color: theme.textSecondary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{t('totalHours')}</p>
                <p style={{ color: theme.text, fontSize: '18px', fontWeight: '800' }}>{todayStatus.attendance?.workHours}h</p>
              </div>
            </div>
            <div style={{ ...s.doneBar, background: theme.successLight, borderColor: theme.success }}>
              <span>✅</span><span style={{ color: theme.success, fontWeight: '700' }}>{t('workDone')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {isAdmin && (
        <div style={s.statsRow}>
          <div style={{ ...s.statCard, background: `linear-gradient(135deg, rgba(129,140,248,0.1) 0%, rgba(167,139,250,0.05) 100%)`, border: `1px solid ${theme.primaryGlow}` }} onClick={() => navigate('/employees')}>
            <div style={{ ...s.statIcon, background: theme.primaryLight }}>👥</div>
            <h3 style={{ color: theme.primary, fontSize: '32px', fontWeight: '900', margin: '8px 0 2px' }}>{stats.employees}</h3>
            <p style={{ color: theme.textSecondary, fontSize: '12px', fontWeight: '600' }}>{t('totalEmployees')}</p>
          </div>
          <div style={{ ...s.statCard, background: `linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.05) 100%)`, border: `1px solid rgba(251,191,36,0.2)` }} onClick={() => navigate('/leaves')}>
            <div style={{ ...s.statIcon, background: theme.warningLight }}>📋</div>
            <h3 style={{ color: theme.warning, fontSize: '32px', fontWeight: '900', margin: '8px 0 2px' }}>{stats.leaves}</h3>
            <p style={{ color: theme.textSecondary, fontSize: '12px', fontWeight: '600' }}>{t('leaveRequests')}</p>
          </div>
        </div>
      )}

      {/* Records */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h3 style={{ ...s.sectionTitle, color: theme.text }}><span style={s.sectionDot}></span>{t('records')}</h3>
          <span style={{ ...s.seeAll, color: theme.primary }} onClick={() => navigate('/attendance')}>{t('viewAll')} →</span>
        </div>
        {myAttendances.map((att, index) => (
          <div key={att._id} style={{ ...s.recordCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, animationDelay: `${index * 0.05}s` }}>
            <div style={s.recordLeft}>
              <div style={{ ...s.recordDot, background: att.status === 'present' ? theme.success : theme.warning }}></div>
              <div>
                <p style={{ ...s.recordDate, color: theme.text }}>{att.date}</p>
                <p style={{ color: att.status === 'present' ? theme.success : theme.warning, fontSize: '12px', fontWeight: '600' }}>
                  {att.status === 'present' ? t('onTime') : t('late')}
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '15px', fontWeight: '800', color: theme.text }}>{att.workHours}h</p>
              <p style={{ fontSize: '11px', color: theme.textMuted }}>
                {att.checkIn?.time ? new Date(att.checkIn.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                {' → '}
                {att.checkOut?.time ? new Date(att.checkOut.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
              </p>
            </div>
          </div>
        ))}
        {myAttendances.length === 0 && (
          <div style={{ ...s.emptyState, color: theme.textMuted }}><span style={{ fontSize: '40px' }}>📭</span><p>{t('noRecords')}</p></div>
        )}
      </div>

      {/* Admin Menu - UPDATED WITH ANALYTICS */}
      {isAdmin && (
        <div style={s.section}>
          <h3 style={{ ...s.sectionTitle, color: theme.text, marginBottom: '14px' }}><span style={s.sectionDot}></span>{t('management')}</h3>
          <div style={s.menuGrid}>
            {[
              { path: '/analytics', icon: '📊', label: 'Analytics', gradient: 'linear-gradient(135deg, rgba(244,114,182,0.12) 0%, rgba(129,140,248,0.12) 100%)' },
              { path: '/departments', icon: '🏢', label: t('departments'), gradient: 'linear-gradient(135deg, rgba(129,140,248,0.12) 0%, rgba(129,140,248,0.04) 100%)' },
              { path: '/attendance', icon: '📋', label: t('attendanceRecords'), gradient: 'linear-gradient(135deg, rgba(52,211,153,0.12) 0%, rgba(52,211,153,0.04) 100%)' },
              { path: '/subscription', icon: '⭐', label: t('specialDays'), gradient: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(251,191,36,0.04) 100%)' },
            ].map((item) => (
              <div key={item.path} style={{ ...s.menuCard, background: item.gradient, border: `1px solid ${theme.cardBorder}` }} onClick={() => navigate(item.path)}>
                <span style={{ fontSize: '32px' }}>{item.icon}</span>
                <p style={{ color: theme.text, fontSize: '12px', fontWeight: '600', marginTop: '8px' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ height: '100px' }}></div>
      <BottomNav />
    </div>
  );
};

const s = {
  container: { maxWidth: '500px', margin: '0 auto', padding: '20px', paddingTop: '16px', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  headerLeft: {},
  headerRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  greeting: { fontSize: '13px', marginBottom: '2px', fontWeight: '500' },
  userName: { fontSize: '24px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' },
  roleBadge: { padding: '4px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.3px' },
  iconBtn: { width: '40px', height: '40px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', border: 'none' },
  avatar: { width: '44px', height: '44px', borderRadius: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', boxShadow: '0 4px 15px rgba(129, 140, 248, 0.3)' },
  clockCard: { padding: '20px', borderRadius: '20px', textAlign: 'center', marginBottom: '16px', animation: 'fadeIn 0.4s ease-out' },
  clockTime: { fontSize: '36px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '4px' },
  clockDate: { fontSize: '13px', fontWeight: '500' },
  attendanceCard: { padding: '20px', borderRadius: '20px', marginBottom: '16px', animation: 'fadeIn 0.5s ease-out' },
  cardHeader: { marginBottom: '16px' },
  sectionTitle: { fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' },
  sectionDot: { width: '8px', height: '8px', borderRadius: '50%', background: 'linear-gradient(135deg, #818cf8, #a78bfa)', display: 'inline-block' },
  checkInBtn: { width: '100%', padding: '18px 20px', background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', border: 'none', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 20px rgba(52, 211, 153, 0.3)', color: 'white' },
  checkOutBtn: { width: '100%', padding: '18px 20px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', border: 'none', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px', boxShadow: '0 4px 20px rgba(251, 191, 36, 0.3)', color: '#1a1a2e' },
  checkBtnIcon: { fontSize: '28px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', borderRadius: '14px' },
  checkBtnLabel: { fontSize: '16px', fontWeight: '800', textAlign: 'left' },
  checkBtnSub: { fontSize: '12px', opacity: 0.8, textAlign: 'left', marginTop: '2px' },
  checkBtnArrow: { marginLeft: 'auto', fontSize: '20px', fontWeight: '700' },
  timeInfoRow: { display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' },
  timeInfoBox: { flex: 1, padding: '14px', borderRadius: '14px', textAlign: 'center' },
  timeInfoLabel: { fontSize: '11px', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' },
  timeInfoValue: { fontSize: '20px', fontWeight: '800' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '14px' },
  completedGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' },
  completedItem: { padding: '14px 10px', borderRadius: '14px', textAlign: 'center' },
  doneBar: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '14px', borderLeft: '3px solid' },
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', animation: 'fadeIn 0.6s ease-out' },
  statCard: { padding: '20px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer' },
  statIcon: { width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', margin: '0 auto' },
  section: { marginBottom: '20px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  seeAll: { fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  recordCard: { padding: '14px 16px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', animation: 'fadeIn 0.4s ease-out' },
  recordLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  recordDot: { width: '10px', height: '10px', borderRadius: '50%' },
  recordDate: { fontWeight: '700', fontSize: '14px', marginBottom: '2px' },
  emptyState: { textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontSize: '14px' },
  menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  menuCard: { padding: '18px 10px', borderRadius: '18px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' },
};

export default Dashboard;