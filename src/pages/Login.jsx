import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import API from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();

  const [tab, setTab] = useState('admin');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // OTP states
  const [otpStep, setOtpStep] = useState('phone');
  const [otp, setOtp] = useState('');
  const [devOTP, setDevOTP] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cooldown timer
  const startCooldown = (seconds) => {
    setCooldown(seconds);
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { phone, password });
      authLogin(res.data.data, res.data.data.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  // Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!phone) { toast.error('Enter phone number'); return; }
    setLoading(true);
    try {
      const res = await API.post('/auth/otp/request', { phone });
      toast.success(res.data.message);
      setOtpStep('verify');
      startCooldown(60);

      // Dev mode - show OTP
      if (res.data.devOTP) {
        setDevOTP(res.data.devOTP);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { toast.error('Enter 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await API.post('/auth/otp/verify', { phone, otp });
      authLogin(res.data.data, res.data.data.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      const res = await API.post('/auth/otp/request', { phone });
      toast.success('OTP resent!');
      startCooldown(60);
      if (res.data.devOTP) setDevOTP(res.data.devOTP);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend');
    }
    setLoading(false);
  };

  const inp = {
    width: '100%', padding: '16px 18px', borderRadius: '14px', fontSize: '15px',
    boxSizing: 'border-box', fontWeight: '500', background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`, color: theme.text, outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.gradientBg, padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src="/icon-192.png" alt="SimpleHR" style={{ width: '80px', height: '80px', borderRadius: '20px', marginBottom: '12px' }} />
          <h1 style={{ color: theme.text, fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>Simple HR</h1>
          <p style={{ color: theme.textMuted, fontSize: '13px', marginTop: '4px' }}>HR Management for Myanmar SMEs</p>
        </div>

        {/* Tab Switch */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', padding: '4px', borderRadius: '16px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          <button onClick={() => { setTab('admin'); setOtpStep('phone'); setOtp(''); }}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', background: tab === 'admin' ? theme.primary : 'transparent', color: tab === 'admin' ? 'white' : theme.textMuted }}>
            🔐 Admin / HR
          </button>
          <button onClick={() => { setTab('employee'); setOtpStep('phone'); setPassword(''); }}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', background: tab === 'employee' ? theme.primary : 'transparent', color: tab === 'employee' ? 'white' : theme.textMuted }}>
            📱 Employee OTP
          </button>
        </div>

        {/* Admin Login Form */}
        {tab === 'admin' && (
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '24px', borderRadius: '20px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ color: theme.text, fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>Admin Login</p>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxxx" style={inp} required />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={inp} required />
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '16px', background: theme.primary, color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '16px', fontWeight: '800', opacity: loading ? 0.6 : 1 }}>
                {loading ? '⏳' : '🔐'} {t('login')}
              </button>
            </div>
          </form>
        )}

        {/* Employee OTP Login */}
        {tab === 'employee' && otpStep === 'phone' && (
          <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '24px', borderRadius: '20px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ color: theme.text, fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>Employee Login</p>
              <p style={{ color: theme.textMuted, fontSize: '12px' }}>Enter your registered phone number</p>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxxx" style={inp} required />
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #34d399, #10b981)', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '16px', fontWeight: '800', opacity: loading ? 0.6 : 1 }}>
                {loading ? '⏳ Sending...' : '📱 Send OTP'}
              </button>
            </div>
          </form>
        )}

        {/* OTP Verify */}
        {tab === 'employee' && otpStep === 'verify' && (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '24px', borderRadius: '20px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ color: theme.text, fontWeight: '700', fontSize: '16px' }}>Enter OTP</p>
              <p style={{ color: theme.textMuted, fontSize: '12px' }}>6-digit code sent to {phone}</p>

              {/* Dev OTP Display */}
              {devOTP && (
                <div style={{ padding: '12px', borderRadius: '12px', background: theme.warningLight, textAlign: 'center' }}>
                  <p style={{ color: theme.warning, fontSize: '11px', fontWeight: '600' }}>🧪 Dev Mode OTP:</p>
                  <p style={{ color: theme.warning, fontSize: '24px', fontWeight: '900', letterSpacing: '8px' }}>{devOTP}</p>
                </div>
              )}

              <input type="text" value={otp} onChange={(e) => { if (e.target.value.length <= 6) setOtp(e.target.value.replace(/\D/g, '')); }}
                placeholder="000000" maxLength={6}
                style={{ ...inp, textAlign: 'center', fontSize: '28px', fontWeight: '900', letterSpacing: '12px' }} required />

              <button type="submit" disabled={loading || otp.length !== 6}
                style={{ width: '100%', padding: '16px', background: otp.length === 6 ? theme.primary : theme.cardBgHover, color: otp.length === 6 ? 'white' : theme.textMuted, border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '16px', fontWeight: '800', opacity: loading ? 0.6 : 1 }}>
                {loading ? '⏳ Verifying...' : '✅ Verify & Login'}
              </button>

              {/* Resend */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" onClick={() => { setOtpStep('phone'); setOtp(''); setDevOTP(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, fontSize: '13px', fontWeight: '600' }}>
                  ← Change number
                </button>
                <button type="button" onClick={handleResendOTP} disabled={cooldown > 0}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: cooldown > 0 ? theme.textMuted : theme.primary, fontSize: '13px', fontWeight: '600' }}>
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Register Link */}
        <p style={{ textAlign: 'center', marginTop: '20px', color: theme.textMuted, fontSize: '13px' }}>
          {t('noAccount')}{' '}
          <span onClick={() => navigate('/register')} style={{ color: theme.primary, cursor: 'pointer', fontWeight: '700' }}>{t('register')}</span>
        </p>
      </div>
    </div>
  );
};

export default Login;