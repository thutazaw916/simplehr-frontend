import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import API from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { lang, t, switchLanguage } = useLanguage();
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
        <h1 style={styles.title}>{t('profile')}</h1>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          {t('back')}
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.avatar}>{profile.name?.charAt(0).toUpperCase()}</div>
        <h2 style={{ textAlign: 'center', marginBottom: '5px' }}>{profile.name}</h2>
        <p style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '20px' }}>
          {profile.role === 'owner' ? t('owner') : profile.role === 'hr' ? t('hr') : t('employee')}
        </p>

        <div style={styles.infoRow}>
          <span style={styles.label}>{t('phone')}:</span>
          <span>{profile.phone}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>{t('company')}:</span>
          <span>{profile.company?.name || '-'}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>{t('status')}:</span>
          <span style={{ color: profile.isActive ? '#27ae60' : '#e74c3c' }}>
            {profile.isActive ? t('active') : t('inactive')}
          </span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>{t('joined')}:</span>
          <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Language Switch */}
      <div style={styles.card}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>🌐 {t('language')}</h3>
        <div style={styles.langRow}>
          <button
            onClick={() => switchLanguage('mm')}
            style={{
              ...styles.langBtn,
              backgroundColor: lang === 'mm' ? '#1a73e8' : '#f0f0f0',
              color: lang === 'mm' ? 'white' : '#333',
            }}
          >
            🇲🇲 မြန်မာ
          </button>
          <button
            onClick={() => switchLanguage('en')}
            style={{
              ...styles.langBtn,
              backgroundColor: lang === 'en' ? '#1a73e8' : '#f0f0f0',
              color: lang === 'en' ? 'white' : '#333',
            }}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      <button onClick={handleLogout} style={styles.logoutBtn}>
        {t('logout')}
      </button>
    </div>
  );
};

const styles = {
  container: { maxWidth: '500px', margin: '0 auto', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { color: '#1a73e8', fontSize: '22px' },
  backBtn: { padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  card: { backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '16px' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#1a73e8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', margin: '0 auto 15px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  label: { fontWeight: 'bold', color: '#666' },
  langRow: { display: 'flex', gap: '10px' },
  langBtn: { flex: 1, padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' },
  logoutBtn: { width: '100%', padding: '14px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }
};

export default Profile;