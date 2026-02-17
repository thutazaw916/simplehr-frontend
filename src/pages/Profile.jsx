import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/auth/profile');
      setProfile(res.data.data);
    } catch (error) {
      console.log('Error:', error.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!profile) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Profile</h1>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>Back</button>
      </div>

      <div style={styles.card}>
        <div style={styles.avatar}>{profile.name?.charAt(0).toUpperCase()}</div>
        <h2 style={{ textAlign: 'center', marginBottom: '5px' }}>{profile.name}</h2>
        <p style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '20px' }}>{profile.role?.toUpperCase()}</p>

        <div style={styles.infoRow}><span style={styles.label}>Phone:</span><span>{profile.phone}</span></div>
        <div style={styles.infoRow}><span style={styles.label}>Company:</span><span>{profile.company?.name || '-'}</span></div>
        <div style={styles.infoRow}><span style={styles.label}>Status:</span><span style={{ color: profile.isActive ? '#27ae60' : '#e74c3c' }}>{profile.isActive ? 'Active' : 'Inactive'}</span></div>
        <div style={styles.infoRow}><span style={styles.label}>Joined:</span><span>{new Date(profile.createdAt).toLocaleDateString()}</span></div>

        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '500px', margin: '0 auto', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { color: '#1a73e8' },
  backBtn: { padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  card: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#1a73e8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', margin: '0 auto 15px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' },
  label: { fontWeight: 'bold', color: '#666' },
  logoutBtn: { width: '100%', padding: '12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', marginTop: '20px', cursor: 'pointer', fontSize: '16px' }
};

export default Profile;