import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import BottomNav from '../components/BottomNav';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [todayStatus, setTodayStatus] = useState(null);
  const [myAttendances, setMyAttendances] = useState([]);
  const [stats, setStats] = useState({ employees: 0, leaves: 0 });

  useEffect(() => {
    fetchData();
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
  const now = new Date();
  const dateStr = now.toLocaleDateString('my-MM', { year: 'numeric', month: 'long', day: 'numeric' });

  const getRoleName = (role) => {
    if (role === 'owner') return t('owner');
    if (role === 'hr') return t('hr');
    return t('employee');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <p style={styles.greeting}>{t('welcome')}</p>
          <h2 style={styles.userName}>{user?.name}</h2>
          <span style={styles.roleBadge}>{getRoleName(user?.role)}</span>
        </div>
        <div style={styles.avatarCircle}>{user?.name?.charAt(0)}</div>
      </div>

      <div style={styles.dateCard}>
        <p style={styles.dateText}>{dateStr}</p>
      </div>

      <div style={styles.attendanceCard}>
        <h3 style={styles.sectionTitle}>{t('todayAttendance')}</h3>

        {todayStatus && !todayStatus.checkedIn && (
          <div style={styles.checkBtnArea}>
            <button onClick={handleCheckIn} style={styles.checkInBtn}>
              <span style={{ fontSize: '24px' }}>🕐</span>
              <span>{t('checkIn')}</span>
            </button>
          </div>
        )}

        {todayStatus && todayStatus.checkedIn && !todayStatus.checkedOut && (
          <div>
            <div style={styles.timeInfo}>
              <div style={styles.timeBox}>
                <p style={styles.timeLabel}>{t('checkIn')}</p>
                <p style={styles.timeValue}>{new Date(todayStatus.attendance?.checkIn?.time).toLocaleTimeString('my-MM', {hour:'2-digit', minute:'2-digit'})}</p>
              </div>
              <div style={styles.statusDot}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: todayStatus.attendance?.status === 'present' ? '#27ae60' : '#e67e22' }}></div>
                <p style={{ fontSize: '12px', color: todayStatus.attendance?.status === 'present' ? '#27ae60' : '#e67e22' }}>
                  {todayStatus.attendance?.status === 'present' ? t('onTime') : t('late')}
                </p>
              </div>
            </div>
            <button onClick={handleCheckOut} style={styles.checkOutBtn}>
              <span style={{ fontSize: '24px' }}>🏠</span>
              <span>{t('checkOut')}</span>
            </button>
          </div>
        )}

        {todayStatus && todayStatus.checkedOut && (
          <div style={styles.doneArea}>
            <div style={styles.timeInfo}>
              <div style={styles.timeBox}>
                <p style={styles.timeLabel}>{t('checkIn')}</p>
                <p style={styles.timeValue}>{new Date(todayStatus.attendance?.checkIn?.time).toLocaleTimeString('my-MM', {hour:'2-digit', minute:'2-digit'})}</p>
              </div>
              <div style={styles.timeBox}>
                <p style={styles.timeLabel}>{t('checkOut')}</p>
                <p style={styles.timeValue}>{new Date(todayStatus.attendance?.checkOut?.time).toLocaleTimeString('my-MM', {hour:'2-digit', minute:'2-digit'})}</p>
              </div>
              <div style={styles.timeBox}>
                <p style={styles.timeLabel}>{t('totalHours')}</p>
                <p style={styles.timeValue}>{todayStatus.attendance?.workHours} {t('hours')}</p>
              </div>
            </div>
            <p style={styles.doneText}>✅ {t('workDone')}</p>
          </div>
        )}
      </div>

      {isAdmin && (
        <div style={styles.statsRow}>
          <div style={styles.statCard} onClick={() => navigate('/employees')}>
            <h3 style={{ color: '#1a73e8', fontSize: '28px' }}>{stats.employees}</h3>
            <p style={{ color: '#666', fontSize: '13px' }}>{t('totalEmployees')}</p>
          </div>
          <div style={styles.statCard} onClick={() => navigate('/leaves')}>
            <h3 style={{ color: '#e67e22', fontSize: '28px' }}>{stats.leaves}</h3>
            <p style={{ color: '#666', fontSize: '13px' }}>{t('leaveRequests')}</p>
          </div>
        </div>
      )}

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>{t('records')}</h3>
          <span style={styles.seeAll} onClick={() => navigate('/attendance')}>{t('viewAll')}</span>
        </div>
        {myAttendances.map((att) => (
          <div key={att._id} style={styles.recordCard}>
            <div>
              <p style={styles.recordDate}>{att.date}</p>
              <p style={{ color: att.status === 'present' ? '#27ae60' : '#e67e22', fontSize: '13px' }}>
                {att.status === 'present' ? t('onTime') : t('late')}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', color: '#333' }}>{att.workHours} {t('hours')}</p>
              <p style={{ fontSize: '12px', color: '#999' }}>
                {att.checkIn?.time ? new Date(att.checkIn.time).toLocaleTimeString('my-MM', {hour:'2-digit', minute:'2-digit'}) : '-'}
                {' - '}
                {att.checkOut?.time ? new Date(att.checkOut.time).toLocaleTimeString('my-MM', {hour:'2-digit', minute:'2-digit'}) : '-'}
              </p>
            </div>
          </div>
        ))}
        {myAttendances.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>{t('noRecords')}</p>}
      </div>

      {isAdmin && (
        <div style={styles.adminMenu}>
          <h3 style={styles.sectionTitle}>{t('management')}</h3>
          <div style={styles.menuGrid}>
            <div style={styles.menuCard} onClick={() => navigate('/departments')}>
              <span style={{ fontSize: '28px' }}>🏢</span>
              <p>{t('departments')}</p>
            </div>
            <div style={styles.menuCard} onClick={() => navigate('/attendance')}>
              <span style={{ fontSize: '28px' }}>📊</span>
              <p>{t('attendanceRecords')}</p>
            </div>
            <div style={styles.menuCard} onClick={() => navigate('/subscription')}>
              <span style={{ fontSize: '28px' }}>⭐</span>
              <p>{t('specialDays')}</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: '80px' }}></div>
      <BottomNav />
    </div>
  );
};

const styles = {
  container: { maxWidth: '500px', margin: '0 auto', padding: '20px', paddingTop: '10px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  greeting: { color: '#999', fontSize: '14px', marginBottom: '2px' },
  userName: { color: '#333', fontSize: '22px', marginBottom: '5px' },
  roleBadge: { backgroundColor: '#e8f0fe', color: '#1a73e8', padding: '3px 12px', borderRadius: '12px', fontSize: '12px' },
  avatarCircle: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#1a73e8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' },
  dateCard: { backgroundColor: '#e8f0fe', padding: '10px 15px', borderRadius: '10px', marginBottom: '20px' },
  dateText: { color: '#1a73e8', fontSize: '14px', textAlign: 'center' },
  attendanceCard: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '20px' },
  sectionTitle: { color: '#333', fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' },
  checkBtnArea: { textAlign: 'center' },
  checkInBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '16px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  checkOutBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '16px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', marginTop: '12px' },
  timeInfo: { display: 'flex', justifyContent: 'space-around', marginBottom: '10px' },
  timeBox: { textAlign: 'center' },
  timeLabel: { color: '#999', fontSize: '12px', marginBottom: '4px' },
  timeValue: { color: '#333', fontSize: '16px', fontWeight: 'bold' },
  statusDot: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  doneArea: {},
  doneText: { textAlign: 'center', color: '#27ae60', fontWeight: 'bold', marginTop: '10px', fontSize: '15px' },
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' },
  statCard: { backgroundColor: 'white', padding: '18px', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', textAlign: 'center', cursor: 'pointer' },
  section: { marginBottom: '20px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  seeAll: { color: '#1a73e8', fontSize: '13px', cursor: 'pointer' },
  recordCard: { backgroundColor: 'white', padding: '14px 16px', borderRadius: '12px', boxShadow: '0 1px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  recordDate: { color: '#333', fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' },
  adminMenu: { marginBottom: '20px' },
  menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
  menuCard: { backgroundColor: 'white', padding: '18px 10px', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', textAlign: 'center', cursor: 'pointer', fontSize: '13px', color: '#333' }
};

export default Dashboard;