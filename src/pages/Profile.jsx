import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import API from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { lang, t, switchLanguage } = useLanguage();
  const { isDark, toggleTheme, theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [showOffice, setShowOffice] = useState(false);
  const [officeLat, setOfficeLat] = useState('');
  const [officeLng, setOfficeLng] = useState('');
  const [officeRadius, setOfficeRadius] = useState('200');
  const [officeAddress, setOfficeAddress] = useState('');

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/auth/profile');
      setProfile(res.data.data);

      if (user?.role === 'owner') {
        try {
          const configRes = await API.get('/payment-config');
          const config = configRes.data.data;
          if (config?.officeLocation) {
            setOfficeLat(config.officeLocation.latitude || '');
            setOfficeLng(config.officeLocation.longitude || '');
            setOfficeRadius(config.officeLocation.radiusMeters || '200');
            setOfficeAddress(config.officeLocation.address || '');
          }
        } catch (e) { console.log('Config fetch error'); }
      }
    } catch (error) { console.log('Error:', error.message); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('GPS not supported');
      return;
    }
    toast.loading('Getting GPS...', { id: 'loc' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss('loc');
        setOfficeLat(pos.coords.latitude.toString());
        setOfficeLng(pos.coords.longitude.toString());
        toast.success('Location captured!');
      },
      () => {
        toast.dismiss('loc');
        toast.error('Failed to get location');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveOffice = async () => {
    try {
      await API.put('/payment-config', {
        officeLocation: {
          latitude: parseFloat(officeLat),
          longitude: parseFloat(officeLng),
          radiusMeters: parseInt(officeRadius),
          address: officeAddress
        }
      });
      toast.success('Office location saved! Employees must be within ' + officeRadius + 'm to check in.');
    } catch (error) { toast.error('Failed to save'); }
  };

  if (!profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: theme.textMuted }}>
      <p>{t('loading')}</p>
    </div>
  );

  const inp = {
    width: '100%', padding: '12px 14px', borderRadius: '12px', fontSize: '13px',
    boxSizing: 'border-box', fontWeight: '500',
    background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text,
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', minHeight: '100vh', background: theme.bg }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: theme.text, fontSize: '22px', fontWeight: '800' }}>{t('profile')}</h1>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 18px', borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}>← {t('back')}</button>
      </div>

      {/* Profile Card */}
      <div style={{ padding: '28px', borderRadius: '24px', marginBottom: '16px', textAlign: 'center', background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        <div style={{ width: '88px', height: '88px', borderRadius: '28px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '900', margin: '0 auto', background: theme.gradient1, boxShadow: '0 8px 32px rgba(129, 140, 248, 0.3)' }}>
          {profile.name?.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ color: theme.text, fontWeight: '800', fontSize: '22px', marginTop: '16px' }}>{profile.name}</h2>
        <span style={{ display: 'inline-block', padding: '6px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginTop: '10px', background: theme.primaryLight, color: theme.primary, border: `1px solid ${theme.primaryGlow}` }}>
          {profile.role === 'owner' ? t('owner') : profile.role === 'hr' ? t('hr') : t('employee')}
        </span>

        <div style={{ marginTop: '24px' }}>
          {[
            { icon: '📱', label: t('phone'), value: profile.phone },
            { icon: '🏢', label: t('company'), value: profile.company?.name || '-' },
            { icon: '💼', label: 'Position', value: profile.position || '-' },
            { icon: '📊', label: t('status'), value: profile.isActive ? t('active') : t('inactive'), color: profile.isActive ? theme.success : theme.danger },
            { icon: '📅', label: t('joined'), value: new Date(profile.joinDate || profile.createdAt).toLocaleDateString() },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ color: theme.textSecondary, fontSize: '14px' }}>{item.icon} {item.label}</span>
              <span style={{ color: item.color || theme.text, fontWeight: '700', fontSize: '14px' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div style={{ padding: '20px', borderRadius: '20px', marginBottom: '12px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🎨</span>
            <div>
              <p style={{ color: theme.text, fontWeight: '700', fontSize: '15px' }}>{t('themeMode')}</p>
              <p style={{ color: theme.textMuted, fontSize: '12px' }}>{isDark ? t('darkMode') : t('lightMode')}</p>
            </div>
          </div>
          <button onClick={toggleTheme} style={{ width: '58px', height: '32px', borderRadius: '16px', border: 'none', cursor: 'pointer', position: 'relative', background: isDark ? theme.primary : theme.cardBgHover }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', position: 'absolute', top: '2px', left: '2px', transition: 'all 0.3s', transform: isDark ? 'translateX(26px)' : 'translateX(0)', background: isDark ? '#0a0a0f' : 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              {isDark ? '🌙' : '☀️'}
            </div>
          </button>
        </div>
      </div>

      {/* Language */}
      <div style={{ padding: '20px', borderRadius: '20px', marginBottom: '12px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        <p style={{ color: theme.text, fontWeight: '700', fontSize: '15px', marginBottom: '14px' }}>🌐 {t('language')}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[{ code: 'mm', flag: '🇲🇲', label: 'မြန်မာ' }, { code: 'en', flag: '🇬🇧', label: 'English' }].map((l) => (
            <button key={l.code} onClick={() => switchLanguage(l.code)}
              style={{ flex: 1, padding: '14px', borderRadius: '14px', fontSize: '15px', cursor: 'pointer', fontWeight: '700', textAlign: 'center', background: lang === l.code ? theme.primaryLight : theme.inputBg, color: lang === l.code ? theme.primary : theme.text, border: `1px solid ${lang === l.code ? theme.primaryGlow : theme.inputBorder}` }}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Office Location Setting - Owner Only */}
      {user?.role === 'owner' && (
        <div style={{ padding: '20px', borderRadius: '20px', marginBottom: '12px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showOffice ? '16px' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>📍</span>
              <div>
                <p style={{ color: theme.text, fontWeight: '700', fontSize: '15px' }}>Office Location</p>
                <p style={{ color: theme.textMuted, fontSize: '12px' }}>
                  {officeLat && officeLng ? `Set (${Number(officeLat).toFixed(4)}, ${Number(officeLng).toFixed(4)}) - ${officeRadius}m` : 'Not set - employees can check in from anywhere'}
                </p>
              </div>
            </div>
            <button onClick={() => setShowOffice(!showOffice)}
              style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: theme.primaryLight, color: theme.primary, border: 'none' }}>
              {showOffice ? 'Close' : 'Setup'}
            </button>
          </div>

          {showOffice && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={handleGetCurrentLocation}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', background: 'linear-gradient(135deg, #34d399, #10b981)', color: 'white', border: 'none' }}>
                📍 Use My Current Location as Office
              </button>

              <p style={{ color: theme.textMuted, fontSize: '11px', textAlign: 'center' }}>or enter manually</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input type="text" value={officeLat} onChange={(e) => setOfficeLat(e.target.value)} placeholder="Latitude" style={inp} />
                <input type="text" value={officeLng} onChange={(e) => setOfficeLng(e.target.value)} placeholder="Longitude" style={inp} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <select value={officeRadius} onChange={(e) => setOfficeRadius(e.target.value)} style={inp}>
                  <option value="50">50m radius</option>
                  <option value="100">100m radius</option>
                  <option value="200">200m radius</option>
                  <option value="300">300m radius</option>
                  <option value="500">500m radius</option>
                  <option value="1000">1km radius</option>
                </select>
                <input type="text" value={officeAddress} onChange={(e) => setOfficeAddress(e.target.value)} placeholder="Office address" style={inp} />
              </div>

              {officeLat && officeLng && (
                <div style={{ padding: '12px', borderRadius: '12px', background: theme.successLight, textAlign: 'center' }}>
                  <p style={{ color: theme.success, fontSize: '12px', fontWeight: '600' }}>
                    📍 {Number(officeLat).toFixed(6)}, {Number(officeLng).toFixed(6)} — {officeRadius}m radius
                  </p>
                </div>
              )}

              <button onClick={handleSaveOffice}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', background: theme.primary, color: 'white', border: 'none' }}>
                💾 Save Office Location
              </button>

              <div style={{ padding: '10px 14px', borderRadius: '10px', background: theme.warningLight, borderLeft: `3px solid ${theme.warning}` }}>
                <p style={{ color: theme.warning, fontSize: '11px', fontWeight: '600' }}>
                  ⚠️ After saving, employees can ONLY check in when they are within {officeRadius}m of this location.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logout */}
      <button onClick={handleLogout}
        style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #f87171, #ef4444)', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '16px', fontWeight: '700', marginTop: '8px', boxShadow: '0 4px 20px rgba(248, 113, 113, 0.3)' }}>
        🚪 {t('logout')}
      </button>
    </div>
  );
};

export default Profile;