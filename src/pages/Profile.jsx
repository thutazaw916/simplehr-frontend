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
  const [gpsLoading, setGpsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
            if (config.officeLocation.latitude) setOfficeLat(String(config.officeLocation.latitude));
            if (config.officeLocation.longitude) setOfficeLng(String(config.officeLocation.longitude));
            if (config.officeLocation.radiusMeters) setOfficeRadius(String(config.officeLocation.radiusMeters));
            if (config.officeLocation.address) setOfficeAddress(config.officeLocation.address);
          }
        } catch (e) { console.log('Config not found, will create on save'); }
      }
    } catch (error) { console.log('Error:', error.message); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('GPS not supported on this device');
      return;
    }
    setGpsLoading(true);
    toast.loading('Getting your GPS location...', { id: 'loc' });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss('loc');
        setGpsLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setOfficeLat(String(lat));
        setOfficeLng(String(lng));
        toast.success(`Location captured!\n${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      },
      (err) => {
        toast.dismiss('loc');
        setGpsLoading(false);
        toast.error('Failed to get location. Please enable GPS in your phone settings.');
        console.log('GPS Error:', err.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSaveOffice = async () => {
    if (!officeLat || !officeLng) {
      toast.error('Please get your location first! Tap "Use My Current Location" button.');
      return;
    }

    const lat = parseFloat(officeLat);
    const lng = parseFloat(officeLng);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Invalid coordinates. Please get location again.');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Invalid GPS coordinates.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        officeLocation: {
          latitude: lat,
          longitude: lng,
          radiusMeters: parseInt(officeRadius) || 200,
          address: officeAddress || ''
        }
      };

      console.log('Saving office location:', payload);

      const res = await API.put('/payment-config', payload);
      console.log('Save response:', res.data);

      toast.success(`Office location saved!\nEmployees must be within ${officeRadius}m to check in.`);
      setShowOffice(false);
    } catch (error) {
      console.log('Save error:', error.response?.data || error.message);
      toast.error('Failed to save: ' + (error.response?.data?.message || error.message));
    }
    setSaving(false);
  };

  const handleClearOffice = async () => {
    if (!window.confirm('Remove office location? Employees will be able to check in from anywhere.')) return;
    try {
      await API.put('/payment-config', {
        officeLocation: {
          latitude: null,
          longitude: null,
          radiusMeters: 200,
          address: ''
        }
      });
      setOfficeLat('');
      setOfficeLng('');
      setOfficeAddress('');
      setOfficeRadius('200');
      toast.success('Office location removed. Check-in from anywhere is now allowed.');
    } catch (error) {
      toast.error('Failed to remove');
    }
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

  const hasOfficeLocation = officeLat && officeLng;

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

      {/* Office Location - Owner Only */}
      {user?.role === 'owner' && (
        <div style={{ padding: '20px', borderRadius: '20px', marginBottom: '12px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showOffice ? '16px' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>📍</span>
              <div>
                <p style={{ color: theme.text, fontWeight: '700', fontSize: '15px' }}>Office Location</p>
                <p style={{ color: hasOfficeLocation ? theme.success : theme.warning, fontSize: '12px', fontWeight: '600' }}>
                  {hasOfficeLocation ? `✅ Set — ${officeRadius}m radius` : '⚠️ Not set — check in from anywhere'}
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

              {/* Step 1: Get Location */}
              <div style={{ padding: '14px', borderRadius: '14px', background: theme.bgTertiary, border: `1px solid ${theme.border}` }}>
                <p style={{ color: theme.text, fontWeight: '700', fontSize: '13px', marginBottom: '10px' }}>Step 1: Get Office Location</p>
                <p style={{ color: theme.textMuted, fontSize: '11px', marginBottom: '10px' }}>Go to your office and tap this button:</p>
                <button onClick={handleGetCurrentLocation} disabled={gpsLoading}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', background: 'linear-gradient(135deg, #34d399, #10b981)', color: 'white', border: 'none', opacity: gpsLoading ? 0.6 : 1 }}>
                  {gpsLoading ? '⏳ Getting GPS...' : '📍 Use My Current Location'}
                </button>
              </div>

              {/* Show captured coordinates */}
              {hasOfficeLocation && (
                <div style={{ padding: '14px', borderRadius: '14px', background: theme.successLight, textAlign: 'center' }}>
                  <p style={{ color: theme.success, fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>✅ Location Captured!</p>
                  <p style={{ color: theme.success, fontSize: '12px' }}>
                    Lat: {Number(officeLat).toFixed(6)} | Lng: {Number(officeLng).toFixed(6)}
                  </p>
                </div>
              )}

              {/* Manual input */}
              <p style={{ color: theme.textMuted, fontSize: '11px', textAlign: 'center' }}>or enter coordinates manually:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input type="number" step="any" value={officeLat} onChange={(e) => setOfficeLat(e.target.value)} placeholder="Latitude (eg: 16.8661)" style={inp} />
                <input type="number" step="any" value={officeLng} onChange={(e) => setOfficeLng(e.target.value)} placeholder="Longitude (eg: 96.1951)" style={inp} />
              </div>

              {/* Step 2: Set Radius */}
              <div style={{ padding: '14px', borderRadius: '14px', background: theme.bgTertiary, border: `1px solid ${theme.border}` }}>
                <p style={{ color: theme.text, fontWeight: '700', fontSize: '13px', marginBottom: '10px' }}>Step 2: Set Check-in Radius</p>
                <select value={officeRadius} onChange={(e) => setOfficeRadius(e.target.value)} style={inp}>
                  <option value="50">50m — Small office</option>
                  <option value="100">100m — Single building</option>
                  <option value="200">200m — Recommended</option>
                  <option value="300">300m — Large compound</option>
                  <option value="500">500m — Factory area</option>
                  <option value="1000">1km — Industrial zone</option>
                </select>
              </div>

              {/* Optional address */}
              <input type="text" value={officeAddress} onChange={(e) => setOfficeAddress(e.target.value)} placeholder="Office address (optional)" style={inp} />

              {/* Save Button */}
              <button onClick={handleSaveOffice} disabled={saving || !hasOfficeLocation}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', background: hasOfficeLocation ? theme.primary : theme.cardBgHover, color: hasOfficeLocation ? 'white' : theme.textMuted, border: 'none', opacity: saving ? 0.6 : 1 }}>
                {saving ? '⏳ Saving...' : '💾 Save Office Location'}
              </button>

              {/* Clear button */}
              {hasOfficeLocation && (
                <button onClick={handleClearOffice}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'transparent', color: theme.danger, border: `1px solid ${theme.danger}` }}>
                  🗑️ Remove Office Location (allow check-in from anywhere)
                </button>
              )}

              {/* Warning */}
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: theme.warningLight, borderLeft: `3px solid ${theme.warning}` }}>
                <p style={{ color: theme.warning, fontSize: '11px', fontWeight: '600' }}>
                  ⚠️ After saving, employees can ONLY check in within {officeRadius}m of office.
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