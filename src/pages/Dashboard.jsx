import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [todayStatus, setTodayStatus] = useState(null);
  const [stats, setStats] = useState({ employees: 0, departments: 0, leaves: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const todayRes = await API.get('/attendance/today');
      setTodayStatus(todayRes.data.data);

      if (user?.role === 'owner' || user?.role === 'hr') {
        const [empRes, deptRes, leaveRes] = await Promise.all([
          API.get('/employees'),
          API.get('/departments'),
          API.get('/leaves?status=pending')
        ]);
        setStats({
          employees: empRes.data.count,
          departments: deptRes.data.count,
          leaves: leaveRes.data.count
        });
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
      toast.error(error.response?.data?.message || 'Check in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await API.put('/attendance/checkout', { note: '' });
      toast.success(res.data.message);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check out failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  const isAdmin = user?.role === 'owner' || user?.role === 'hr';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>SimpleHR</h1>
          <p style={styles.welcome}>Welcome, {user?.name}!</p>
          <span style={styles.roleBadge}>{user?.role?.toUpperCase()}</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.attendanceCard}>
        <h2>Todays Attendance</h2>
        {todayStatus && !todayStatus.checkedIn && (
          <button onClick={handleCheckIn} style={styles.checkInBtn}>Check In</button>
        )}
        {todayStatus && todayStatus.checkedIn && !todayStatus.checkedOut && (
          <div>
            <p style={{ color: '#27ae60', marginBottom: '10px' }}>Checked In</p>
            <button onClick={handleCheckOut} style={styles.checkOutBtn}>Check Out</button>
          </div>
        )}
        {todayStatus && todayStatus.checkedOut && (
          <p style={styles.doneText}>Done for today! ({todayStatus.attendance?.workHours}h)</p>
        )}
      </div>

      {isAdmin && (
        <div style={styles.statsRow}>
          <div style={styles.statCard} onClick={() => navigate('/employees')}>
            <h3 style={{ color: '#1a73e8', fontSize: '24px' }}>{stats.employees}</h3>
            <p>Employees</p>
          </div>
          <div style={styles.statCard} onClick={() => navigate('/departments')}>
            <h3 style={{ color: '#27ae60', fontSize: '24px' }}>{stats.departments}</h3>
            <p>Departments</p>
          </div>
          <div style={styles.statCard} onClick={() => navigate('/leaves')}>
            <h3 style={{ color: '#e67e22', fontSize: '24px' }}>{stats.leaves}</h3>
            <p>Pending Leaves</p>
          </div>
        </div>
      )}

      <div style={styles.menuGrid}>
        {isAdmin && <div style={styles.menuItem} onClick={() => navigate('/employees')}>Employees</div>}
        {isAdmin && <div style={styles.menuItem} onClick={() => navigate('/departments')}>Departments</div>}
        <div style={styles.menuItem} onClick={() => navigate('/attendance')}>Attendance</div>
        <div style={styles.menuItem} onClick={() => navigate('/leaves')}>Leaves</div>
        {isAdmin && <div style={styles.menuItem} onClick={() => navigate('/payroll')}>Payroll</div>}
        <div style={styles.menuItem} onClick={() => navigate('/profile')}>Profile</div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { color: '#1a73e8', marginBottom: '5px' },
  welcome: { color: '#666', marginBottom: '5px' },
  roleBadge: { backgroundColor: '#1a73e8', color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '12px' },
  logoutBtn: { padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  attendanceCard: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px', textAlign: 'center' },
  checkInBtn: { padding: '15px 40px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', cursor: 'pointer', marginTop: '10px' },
  checkOutBtn: { padding: '15px 40px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', cursor: 'pointer', marginTop: '10px' },
  doneText: { color: '#27ae60', fontSize: '18px', fontWeight: 'bold', marginTop: '10px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' },
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center', cursor: 'pointer' },
  menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' },
  menuItem: { backgroundColor: '#1a73e8', color: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }
};

export default Dashboard;