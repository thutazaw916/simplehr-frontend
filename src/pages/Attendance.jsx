import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const Attendance = () => {
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [myAttendances, setMyAttendances] = useState([]);
  const [tab, setTab] = useState('today');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        API.get('/attendance'),
        API.get('/attendance/my')
      ]);
      setAttendances(allRes.data.data);
      setMyAttendances(myRes.data.data);
    } catch (error) {
      console.log('Error:', error.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Attendance</h1>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>Back</button>
      </div>

      <div style={styles.tabs}>
        <button onClick={() => setTab('today')} style={tab === 'today' ? styles.activeTab : styles.tab}>Today All</button>
        <button onClick={() => setTab('my')} style={tab === 'my' ? styles.activeTab : styles.tab}>My Records</button>
      </div>

      {tab === 'today' && (
        <div style={styles.list}>
          <h3 style={{ marginBottom: '10px' }}>Today - {new Date().toISOString().split('T')[0]}</h3>
          {attendances.map((att) => (
            <div key={att._id} style={styles.card}>
              <div>
                <h4>{att.user?.name || 'Unknown'}</h4>
                <p style={{ color: '#666', fontSize: '14px' }}>{att.user?.phone}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: att.status === 'present' ? '#27ae60' : '#e67e22', fontWeight: 'bold' }}>{att.status}</p>
                <p style={{ fontSize: '12px', color: '#999' }}>
                  In: {att.checkIn?.time ? new Date(att.checkIn.time).toLocaleTimeString() : '-'}
                </p>
                <p style={{ fontSize: '12px', color: '#999' }}>
                  Out: {att.checkOut?.time ? new Date(att.checkOut.time).toLocaleTimeString() : '-'}
                </p>
              </div>
            </div>
          ))}
          {attendances.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>No attendance records</p>}
        </div>
      )}

      {tab === 'my' && (
        <div style={styles.list}>
          <h3 style={{ marginBottom: '10px' }}>My Attendance</h3>
          {myAttendances.map((att) => (
            <div key={att._id} style={styles.card}>
              <div>
                <h4>{att.date}</h4>
                <p style={{ color: att.status === 'present' ? '#27ae60' : '#e67e22' }}>{att.status}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px' }}>In: {att.checkIn?.time ? new Date(att.checkIn.time).toLocaleTimeString() : '-'}</p>
                <p style={{ fontSize: '14px' }}>Out: {att.checkOut?.time ? new Date(att.checkOut.time).toLocaleTimeString() : '-'}</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{att.workHours}h</p>
              </div>
            </div>
          ))}
          {myAttendances.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>No records</p>}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { color: '#1a73e8' },
  backBtn: { padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tab: { padding: '10px 20px', backgroundColor: '#ddd', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  activeTab: { padding: '10px 20px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: { backgroundColor: 'white', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
};

export default Attendance;