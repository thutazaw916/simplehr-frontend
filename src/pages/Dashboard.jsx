import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import BottomNav from '../components/BottomNav';
import Icons from '../components/Icons';

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
    } catch (error) { console.log('Error:', error.message); }
  };

  const handleCheckIn = async () => {
    if (!navigator.geolocation) {
      try { const res = await API.post('/attendance/checkin', { note: '' }); toast.success(res.data.message); fetchData(); }
      catch (error) { toast.error(error.response?.data?.message || t('checkInFailed')); }
      return;
    }
    toast.loading('Getting location...', { id: 'gps' });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        toast.dismiss('gps');
        try { const res = await API.post('/attendance/checkin', { latitude: pos.coords.latitude, longitude: pos.coords.longitude, note: '' }); toast.success(res.data.message); fetchData(); }
        catch (error) { toast.error(error.response?.data?.message || t('checkInFailed')); }
      },
      async () => {
        toast.dismiss('gps');
        try { const res = await API.post('/attendance/checkin', { note: '' }); toast.success(res.data.message); fetchData(); }
        catch (error) { toast.error(error.response?.data?.message || 'Enable GPS'); }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCheckOut = async () => {
    if (!navigator.geolocation) {
      try { const res = await API.put('/attendance/checkout', { note: '' }); toast.success(res.data.message); fetchData(); }
      catch (error) { toast.error(error.response?.data?.message || t('checkOutFailed')); }
      return;
    }
    toast.loading('Getting location...', { id: 'gps' });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        toast.dismiss('gps');
        try { const res = await API.put('/attendance/checkout', { latitude: pos.coords.latitude, longitude: pos.coords.longitude, note: '' }); toast.success(res.data.message); fetchData(); }
        catch (error) { toast.error(error.response?.data?.message || t('checkOutFailed')); }
      },
      async () => {
        toast.dismiss('gps');
        try { const res = await API.put('/attendance/checkout', { note: '' }); toast.success(res.data.message); fetchData(); }
        catch (error) { toast.error(error.response?.data?.message || t('checkOutFailed')); }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const isAdmin = user?.role === 'owner' || user?.role === 'hr';
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ ...s.container, background: theme.gradientBg }}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <p style={{ color: theme.textSecondary, fontSize: '13px', fontWeight: '500' }}>{t('welcome')}</p>
          <h2 style={{ color: theme.text, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>{user?.name}</h2>
          <span style={{ padding: '4px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: theme.primaryLight, color: theme.primary, border: `1px solid ${theme.primaryGlow}` }}>
            {user?.role === 'owner' ? t('owner') : user?.role === 'hr' ? t('hr') : t('employee')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={toggleTheme} style={{ ...s.iconBtn, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>{isDark ? '☀️' : '🌙'}</button>
          <button onClick={() => switchLanguage(lang === 'mm' ? 'en' : 'mm')} style={{ ...s.iconBtn, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text, fontSize: '12px', fontWeight: '700' }}>{lang === 'mm' ? 'EN' : 'MM'}</button>
          <div style={{ width: '44px', height: '44px', borderRadius: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', background: theme.gradient1, boxShadow: '0 4px 15px rgba(129,140,248,0.3)' }}>{user?.name?.charAt(0)}</div>
        </div>
      </div>

      {/* Clock */}
      <div style={{ padding: '20px', borderRadius: '20px', textAlign: 'center', marginBottom: '16px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        <p style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1px', color: theme.text }}>{timeStr}</p>
        <p style={{ fontSize: '13px', fontWeight: '500', color: theme.textSecondary }}>{dateStr}</p>
      </div>

      {/* Attendance */}
      <div style={{ padding: '20px', borderRadius: '20px', marginBottom: '16px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: theme.text, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'linear-gradient(135deg, #818cf8, #a78bfa)', display: 'inline-block' }}></span>
          {t('todayAttendance')}
        </h3>

        {todayStatus && !todayStatus.checkedIn && (
          <button onClick={handleCheckIn} style={{ width: '100%', padding: '18px 20px', background: 'linear-gradient(135deg, #34d399, #10b981)', border: 'none', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 20px rgba(52,211,153,0.3)', color: 'white' }}>
            <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', borderRadius: '14px' }}>{Icons.attendance(28, 'white')}</div>
            <div><p style={{ fontSize: '16px', fontWeight: '800', textAlign: 'left' }}>{t('checkIn')}</p><p style={{ fontSize: '12px', opacity: 0.8, textAlign: 'left' }}>Tap to start your day</p></div>
            <span style={{ marginLeft: 'auto', fontSize: '20px', fontWeight: '700' }}>→</span>
          </button>
        )}

        {todayStatus && todayStatus.checkedIn && !todayStatus.checkedOut && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
              <div style={{ flex: 1, padding: '14px', borderRadius: '14px', textAlign: 'center', background: theme.successLight }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: theme.success, textTransform: 'uppercase', marginBottom: '4px' }}>✓ {t('checkIn')}</p>
                <p style={{ fontSize: '20px', fontWeight: '800', color: theme.text }}>{new Date(todayStatus.attendance?.checkIn?.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '14px', background: todayStatus.attendance?.status === 'present' ? theme.successLight : theme.warningLight }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: todayStatus.attendance?.status === 'present' ? theme.success : theme.warning }}></div>
                <span style={{ color: todayStatus.attendance?.status === 'present' ? theme.success : theme.warning, fontWeight: '700', fontSize: '13px' }}>{todayStatus.attendance?.status === 'present' ? t('onTime') : t('late')}</span>
              </div>
            </div>
            {todayStatus.attendance?.checkIn?.locationVerified && (
              <div style={{ padding: '8px 14px', borderRadius: '10px', marginBottom: '12px', textAlign: 'center', background: theme.successLight }}>
                <span style={{ color: theme.success, fontSize: '11px', fontWeight: '600' }}>📍 Location verified ({todayStatus.attendance?.checkIn?.distanceFromOffice}m)</span>
              </div>
            )}
            <button onClick={handleCheckOut} style={{ width: '100%', padding: '18px 20px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', border: 'none', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 20px rgba(251,191,36,0.3)', color: '#1a1a2e' }}>
              <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', borderRadius: '14px' }}>{Icons.attendance(28, '#1a1a2e')}</div>
              <div><p style={{ fontSize: '16px', fontWeight: '800', textAlign: 'left' }}>{t('checkOut')}</p><p style={{ fontSize: '12px', opacity: 0.8, textAlign: 'left' }}>End your work day</p></div>
              <span style={{ marginLeft: 'auto', fontSize: '20px', fontWeight: '700' }}>→</span>
            </button>
          </div>
        )}

        {todayStatus && todayStatus.checkedOut && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              <div style={{ padding: '14px 10px', borderRadius: '14px', textAlign: 'center', background: theme.successLight }}>
                <p style={{ color: theme.textSecondary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>{t('checkIn')}</p>
                <p style={{ color: theme.text, fontSize: '18px', fontWeight: '800' }}>{new Date(todayStatus.attendance?.checkIn?.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div style={{ padding: '14px 10px', borderRadius: '14px', textAlign: 'center', background: theme.warningLight }}>
                <p style={{ color: theme.textSecondary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>{t('checkOut')}</p>
                <p style={{ color: theme.text, fontSize: '18px', fontWeight: '800' }}>{new Date(todayStatus.attendance?.checkOut?.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div style={{ padding: '14px 10px', borderRadius: '14px', textAlign: 'center', background: theme.primaryLight }}>
                <p style={{ color: theme.textSecondary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>{t('totalHours')}</p>
                <p style={{ color: theme.text, fontSize: '18px', fontWeight: '800' }}>{todayStatus.attendance?.workHours}h</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '14px', background: theme.successLight, borderLeft: `3px solid ${theme.success}` }}>
              <span>✅</span><span style={{ color: theme.success, fontWeight: '700' }}>{t('workDone')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div style={{ padding: '20px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer', background: `linear-gradient(135deg, rgba(77,166,255,0.1), transparent)`, border: `1px solid ${theme.primaryGlow}` }} onClick={() => navigate('/employees')}>
            <div style={{ margin: '0 auto', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(77,166,255,0.1)' }}>{Icons.employees(28, '#4da6ff')}</div>
            <h3 style={{ color: '#4da6ff', fontSize: '32px', fontWeight: '900', margin: '8px 0 2px' }}>{stats.employees}</h3>
            <p style={{ color: theme.textSecondary, fontSize: '12px', fontWeight: '600' }}>{t('totalEmployees')}</p>
          </div>
          <div style={{ padding: '20px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer', background: `linear-gradient(135deg, rgba(255,75,106,0.1), transparent)`, border: `1px solid rgba(255,75,106,0.2)` }} onClick={() => navigate('/leaves')}>
            <div style={{ margin: '0 auto', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,75,106,0.1)' }}>{Icons.leave(28, '#ff4d6a')}</div>
            <h3 style={{ color: '#ff4d6a', fontSize: '32px', fontWeight: '900', margin: '8px 0 2px' }}>{stats.leaves}</h3>
            <p style={{ color: theme.textSecondary, fontSize: '12px', fontWeight: '600' }}>{t('leaveRequests')}</p>
          </div>
        </div>
      )}

      {/* Records */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'linear-gradient(135deg, #818cf8, #a78bfa)', display: 'inline-block' }}></span>
            {t('records')}
          </h3>
          <span style={{ fontSize: '13px', cursor: 'pointer', fontWeight: '600', color: theme.primary }} onClick={() => navigate('/attendance')}>{t('viewAll')} →</span>
        </div>
        {myAttendances.map((att) => (
          <div key={att._id} style={{ padding: '14px 16px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: att.status === 'present' ? theme.success : theme.warning }}></div>
              <div>
                <p style={{ fontWeight: '700', fontSize: '14px', color: theme.text }}>{att.date}</p>
                <p style={{ color: att.status === 'present' ? theme.success : theme.warning, fontSize: '12px', fontWeight: '600' }}>{att.status === 'present' ? t('onTime') : t('late')}</p>
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
        {myAttendances.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: theme.textMuted }}><p>{t('noRecords')}</p></div>}
      </div>

      {/* Management Menu */}
      {isAdmin && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: theme.text, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'linear-gradient(135deg, #818cf8, #a78bfa)', display: 'inline-block' }}></span>
            {t('management')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { path: '/analytics', label: 'Analytics', icon: 'analytics', color: '#4da6ff' },
              { path: '/departments', label: t('departments'), icon: 'departments', color: '#4dc8ff' },
              { path: '/attendance', label: t('attendanceRecords'), icon: 'attendanceRecords', color: '#ffb84d' },
            ].map((item) => (
              <div key={item.path} onClick={() => navigate(item.path)}
                style={{ padding: '18px 10px', borderRadius: '18px', textAlign: 'center', cursor: 'pointer', background: `${item.color}10`, border: `1px solid ${item.color}20` }}>
                <div style={{ filter: `drop-shadow(0 0 8px ${item.color}40)`, marginBottom: '8px' }}>
                  {Icons[item.icon](32, item.color)}
                </div>
                <p style={{ color: theme.text, fontSize: '12px', fontWeight: '600' }}>{item.label}</p>
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
  iconBtn: { width: '40px', height: '40px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', border: 'none' },
};

export default Dashboard;