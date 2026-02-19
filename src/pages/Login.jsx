import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const { lang, t, switchLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(phone, password);
      toast.success(t('success'));
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    }
    setLoading(false);
  };

  return (
    <div style={styles.wrapper}>
      {/* Background Effects */}
      <div style={styles.bgOrb1}></div>
      <div style={styles.bgOrb2}></div>
      <div style={styles.bgOrb3}></div>

      <div style={styles.container}>
        {/* Language Switch */}
        <div style={styles.langRow}>
          <button
            onClick={() => switchLanguage('mm')}
            style={{
              ...styles.langBtn,
              ...(lang === 'mm' ? styles.langBtnActive : {})
            }}
          >
            🇲🇲 မြန်မာ
          </button>
          <button
            onClick={() => switchLanguage('en')}
            style={{
              ...styles.langBtn,
              ...(lang === 'en' ? styles.langBtnActive : {})
            }}
          >
            🇬🇧 EN
          </button>
        </div>

        {/* Logo */}
        <div style={styles.logoContainer}>
          <div style={styles.logo}>
            <span style={styles.logoText}>S</span>
          </div>
          <div style={styles.logoGlow}></div>
        </div>

        <h1 style={styles.title}>SimpleHR</h1>
        <p style={styles.subtitle}>HR Management System</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>📱 {t('phone')}</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('phonePlaceholder')}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>🔒 {t('passwordPlaceholder')}</label>
            <div style={styles.passRow}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...styles.input, paddingRight: '50px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              ...(loading ? styles.submitBtnLoading : {})
            }}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.loadingContent}>
                <span style={styles.spinner}></span>
                {t('loading')}
              </span>
            ) : (
              <span>{t('login')} →</span>
            )}
          </button>
        </form>

        <p style={styles.linkText}>
          {t('noAccount')}{' '}
          <Link to="/register" style={styles.link}>
            {t('register')} ✨
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0f',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgOrb1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(129, 140, 248, 0.15) 0%, transparent 70%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(167, 139, 250, 0.1) 0%, transparent 70%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  bgOrb3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(52, 211, 153, 0.05) 0%, transparent 70%)',
    filter: 'blur(40px)',
    pointerEvents: 'none',
  },
  container: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '28px',
    padding: '40px 32px',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeIn 0.6s ease-out',
  },
  langRow: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    marginBottom: '32px',
  },
  langBtn: {
    padding: '8px 18px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.03)',
    color: '#71717a',
    transition: 'all 0.2s',
  },
  langBtnActive: {
    background: 'rgba(129, 140, 248, 0.15)',
    borderColor: 'rgba(129, 140, 248, 0.3)',
    color: '#818cf8',
  },
  logoContainer: {
    position: 'relative',
    width: '72px',
    height: '72px',
    margin: '0 auto 20px',
  },
  logo: {
    width: '72px',
    height: '72px',
    borderRadius: '22px',
    background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 8px 32px rgba(129, 140, 248, 0.3)',
  },
  logoText: {
    fontSize: '32px',
    fontWeight: '800',
    color: 'white',
  },
  logoGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'rgba(129, 140, 248, 0.2)',
    filter: 'blur(25px)',
    zIndex: 0,
    animation: 'glow 3s ease-in-out infinite',
  },
  title: {
    textAlign: 'center',
    color: '#e4e4e7',
    marginBottom: '6px',
    fontSize: '28px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#52525b',
    marginBottom: '36px',
    fontSize: '14px',
    fontWeight: '400',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#a1a1aa',
    letterSpacing: '0.3px',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    fontSize: '15px',
    boxSizing: 'border-box',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: '#e4e4e7',
    transition: 'all 0.2s',
    fontWeight: '500',
  },
  passRow: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
  },
  submitBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '700',
    marginTop: '8px',
    boxShadow: '0 4px 20px rgba(129, 140, 248, 0.3)',
    letterSpacing: '0.3px',
  },
  submitBtnLoading: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    display: 'inline-block',
  },
  linkText: {
    textAlign: 'center',
    marginTop: '28px',
    color: '#52525b',
    fontSize: '14px',
  },
  link: {
    color: '#818cf8',
    fontWeight: '700',
    textDecoration: 'none',
  },
};

export default Login;