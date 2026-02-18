import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import API from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { lang, t, switchLanguage } = useLanguage();
  const { isDark, toggleTheme, theme } = useTheme();
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

  if (!profile) return <div style={{ textAlign: 'center', marginTop: '50px', color: theme.text }}>{t('loading')}</div>;

  return (
    <div style={{ ...styles.container, color: theme.text }}>
      <div style={styles.header}>
        <h1 style={{ ...styles.title, color: theme.primary }}>{t('profile')}</h1>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>{t('back')}</button>
      </div>

      <div style={{ ...styles.card, backgroundColor: theme.cardBg, boxShadow: theme.shadow }}>
        <div style={styles.avatar}>{profile.name?.charAt(0).toUpperCase()}</div>
        <h2 style={{ textAlign: 'center', marginBottom: '5px', color: theme.text }}>{profile.name}</h2>
        <p style={{ textAlign: 'center', color: theme.primary, marginBottom: '20px' }}>
          {profile.role === 'owner' ? t('owner') : profile.role === 'hr' ? t('hr') : t('employee')}
        </p>

        <div style={{ ...styles.infoRow, borderColor: theme.border }}>
          <span style={{ color: theme.textSecondary }}>{t('phone')}:</span>
          <span style={{ color: theme.text }}>{profile.phone}</span>
        </div>
        <div style={{ ...styles.infoRow, borderColor: theme.border }}>
          <span style={{ color: theme.textSecondary }}>{t('company')}:</span>
          <span style={{ color: theme.text }}>{profile.company?.name || '-'}</span>
        </div>
        <div style={{ ...styles.infoRow, borderColor: theme.border }}>
          <span style={{ color: theme.textSecondary }}>{t('status')}:</span>
          <span style={{ color: profile.isActive ? '#27ae60' : '#e74c3c' }}>
            {profile.isActive ? t('active') : t('inactive')}
          </span>
        </div>
        <div style={{ ...styles.infoRow, borderColor: theme.border }}>
          <span style={{ color: theme.textSecondary }}>{t('joined')}:</span>
          <span style={{ color: theme.text }}>{new Date(profile.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Theme Switch */}
      <div style={{ ...styles.card, backgroundColor: theme.cardBg, boxShadow: theme.shadow }}>
        <h3 style={{ marginBottom: '15px', color: theme.text }}>🎨 {t('themeMode')}</h3>
        <div style={styles.toggleRow}>
          <span style={{ color: theme.text }}>{isDark ? t('darkMode') : t('lightMode')}</span>
          <button onClick={toggleTheme} style={{ ...styles.toggleBtn, backgroundColor: isDark ? '#1a73e8' : '#ddd' }}>
            <div style={{ ...styles.toggleCircle, transform: isDark ? 'translateX(24px)' : 'translateX(0)' }}>
              {isDark ? '🌙' : '☀️'}
            </div>
          </button>
        </div>
      </div>

      {/* Language Switch */}
      <div style={{ ...styles.card, backgroundColor: theme.cardBg, boxShadow: theme.shadow }}>
        <h3 style={{ marginBottom: '15px', color: theme.text }}>🌐 {t('language')}</h3>
        <div style={styles.langRow}>
          <button
            onClick={() => switchLanguage('mm')}
            style={{
              ...styles.langBtn,
              backgroundColor: lang === 'mm' ? '#1a73e8' : theme.inputBg,
              color: lang === 'mm' ? 'white' : theme.text,
              border: `1px solid ${lang === 'mm' ? '#1a73e8' : theme.border}`,
            }}
          >
            🇲🇲 မြန်မာ
          </button>
          <button
            onClick={() => switchLanguage('en')}
            style={{
              ...styles.langBtn,
              backgroundColor: lang === 'en' ? '#1a73e8' : theme.inputBg,
              color: lang === 'en' ? 'white' : theme.text,
              border: `1px solid ${lang === 'en' ? '#1a73e8' : theme.border}`,
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
  title: { fontSize: '22px' },
  backBtn: { padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  card: { padding: '25px', borderRadius: '16px', marginBottom: '16px' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#1a73e8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', margin: '0 auto 15px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid' },
  toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  toggleBtn: { width: '56px', height: '32px', borderRadius: '16px', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s' },
  toggleCircle: { width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', position: 'absolute', top: '2px', left: '2px', transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
  langRow: { display: 'flex', gap: '10px' },
  langBtn: { flex: 1, padding: '14px', borderRadius: '12px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' },
  logoutBtn: { width: '100%', padding: '14px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }
};

export default Profile;