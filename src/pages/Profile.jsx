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

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try { const res = await API.get('/auth/profile'); setProfile(res.data.data); }
    catch (error) { console.log('Error:', error.message); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: theme.textMuted }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px', animation: 'pulse 1.5s ease-in-out infinite' }}>⏳</div>
        <p>{t('loading')}</p>
      </div>
    </div>
  );

  return (
    <div style={{ ...s.container, background: theme.gradientBg, minHeight: '100vh' }}>
      <div style={s.header}>
        <h1 style={{ ...s.title, color: theme.text }}>👤 {t('profile')}</h1>
        <button onClick={() => navigate('/dashboard')} style={{ ...s.backBtn, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}>
          ← {t('back')}
        </button>
      </div>

      {/* Profile Card */}
      <div style={{ ...s.profileCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        <div style={{ ...s.avatarLarge, background: theme.gradient1 }}>
          {profile.name?.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ textAlign: 'center', color: theme.text, fontWeight: '800', fontSize: '22px', marginTop: '16px' }}>{profile.name}</h2>
        <span style={{ ...s.roleChip, background: theme.primaryLight, color: theme.primary, border: `1px solid ${theme.primaryGlow}` }}>
          {profile.role === 'owner' ? t('owner') : profile.role === 'hr' ? t('hr') : t('employee')}
        </span>

        <div style={s.infoList}>
          {[
            { icon: '📱', label: t('phone'), value: profile.phone },
            { icon: '🏢', label: t('company'), value: profile.company?.name || '-' },
            { icon: '📊', label: t('status'), value: profile.isActive ? t('active') : t('inactive'), color: profile.isActive ? theme.success : theme.danger },
            { icon: '📅', label: t('joined'), value: new Date(profile.createdAt).toLocaleDateString() },
          ].map((item, i) => (
            <div key={i} style={{ ...s.infoItem, borderColor: theme.border }}>
              <span style={{ color: theme.textSecondary, fontSize: '14px' }}>{item.icon} {item.label}</span>
              <span style={{ color: item.color || theme.text, fontWeight: '700', fontSize: '14px' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Theme Card */}
      <div style={{ ...s.settingCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        <div style={s.settingRow}>
          <div style={s.settingLeft}>
            <span style={{ fontSize: '24px' }}>🎨</span>
            <div>
              <p style={{ color: theme.text, fontWeight: '700', fontSize: '15px' }}>{t('themeMode')}</p>
              <p style={{ color: theme.textMuted, fontSize: '12px' }}>{isDark ? t('darkMode') : t('lightMode')}</p>
            </div>
          </div>
          <button onClick={toggleTheme} style={{ ...s.toggleBtn, background: isDark ? theme.primary : theme.cardBgHover }}>
            <div style={{
              ...s.toggleCircle,
              transform: isDark ? 'translateX(26px)' : 'translateX(0)',
              background: isDark ? '#0a0a0f' : 'white',
            }}>
              {isDark ? '🌙' : '☀️'}
            </div>
          </button>
        </div>
      </div>

      {/* Language Card */}
      <div style={{ ...s.settingCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        <p style={{ color: theme.text, fontWeight: '700', fontSize: '15px', marginBottom: '14px' }}>
          🌐 {t('language')}
        </p>
        <div style={s.langRow}>
          {[
            { code: 'mm', flag: '🇲🇲', label: 'မြန်မာ' },
            { code: 'en', flag: '🇬🇧', label: 'English' },
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => switchLanguage(l.code)}
              style={{
                ...s.langBtn,
                background: lang === l.code ? theme.primaryLight : theme.inputBg,
                color: lang === l.code ? theme.primary : theme.text,
                border: `1px solid ${lang === l.code ? theme.primaryGlow : theme.inputBorder}`,
              }}
            >
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} style={s.logoutBtn}>
        🚪 {t('logout')}
      </button>
    </div>
  );
};

const s = {
  container: { maxWidth: '500px', margin: '0 auto', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' },
  backBtn: { padding: '10px 18px', borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', border: 'none' },

  profileCard: { padding: '28px', borderRadius: '24px', marginBottom: '16px', textAlign: 'center', animation: 'fadeIn 0.5s ease-out' },
  avatarLarge: { width: '88px', height: '88px', borderRadius: '28px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '900', margin: '0 auto', boxShadow: '0 8px 32px rgba(129, 140, 248, 0.3)' },
  roleChip: { display: 'inline-block', padding: '6px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginTop: '10px', letterSpacing: '0.5px' },
  infoList: { marginTop: '24px' },
  infoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid' },

  settingCard: { padding: '20px', borderRadius: '20px', marginBottom: '12px', animation: 'fadeIn 0.6s ease-out' },
  settingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  settingLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  toggleBtn: {
    width: '58px',
    height: '32px',
    borderRadius: '16px',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  toggleCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    position: 'absolute',
    top: '2px',
    left: '2px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },

  langRow: { display: 'flex', gap: '10px' },
  langBtn: {
    flex: 1,
    padding: '14px',
    borderRadius: '14px',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: '700',
    transition: 'all 0.2s',
    textAlign: 'center',
  },

  logoutBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    marginTop: '8px',
    boxShadow: '0 4px 20px rgba(248, 113, 113, 0.3)',
  },
};

export default Profile;