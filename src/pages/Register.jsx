import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', phone: '', password: '', companyName: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { lang, t, switchLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success(t('success'));
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    }
    setLoading(false);
  };

  const fields = [
    { name: 'name', icon: '👤', placeholder: t('namePlaceholder'), type: 'text' },
    { name: 'phone', icon: '📱', placeholder: t('phonePlaceholder'), type: 'text' },
    { name: 'password', icon: '🔒', placeholder: t('passwordPlaceholder'), type: 'password' },
    { name: 'companyName', icon: '🏢', placeholder: t('companyNamePlaceholder'), type: 'text' },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.bgOrb1}></div>
      <div style={styles.bgOrb2}></div>

      <div style={styles.container}>
        <div style={styles.langRow}>
          <button
            onClick={() => switchLanguage('mm')}
            style={{ ...styles.langBtn, ...(lang === 'mm' ? styles.langBtnActive : {}) }}
          >🇲🇲 မြန်မာ</button>
          <button
            onClick={() => switchLanguage('en')}
            style={{ ...styles.langBtn, ...(lang === 'en' ? styles.langBtnActive : {}) }}
          >🇬🇧 EN</button>
        </div>

        <div style={styles.logoContainer}>
          <div style={styles.logo}><span style={styles.logoText}>S</span></div>
          <div style={styles.logoGlow}></div>
        </div>

        <h1 style={styles.title}>{t('register')}</h1>
        <p style={styles.subtitle}>Create your workspace</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {fields.map((field) => (
            <div key={field.name} style={styles.inputGroup}>
              <label style={styles.label}>{field.icon} {field.placeholder}</label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                style={styles.input}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            style={{ ...styles.submitBtn, ...(loading ? { opacity: 0.7 } : {}) }}
            disabled={loading}
          >
            {loading ? t('loading') : `${t('register')} ✨`}
          </button>
        </form>

        <p style={styles.linkText}>
          {t('hasAccount')}{' '}
          <Link to="/login" style={styles.link}>{t('login')}</Link>
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
    top: '-15%',
    right: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(167, 139, 250, 0.12) 0%, transparent 70%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'absolute',
    bottom: '-15%',
    left: '-10%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(52, 211, 153, 0.08) 0%, transparent 70%)',
    filter: 'blur(60px)',
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
    padding: '36px 32px',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeIn 0.6s ease-out',
  },
  langRow: { display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '28px' },
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
    width: '64px',
    height: '64px',
    margin: '0 auto 16px',
  },
  logo: {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 8px 32px rgba(129, 140, 248, 0.3)',
  },
  logoText: { fontSize: '28px', fontWeight: '800', color: 'white' },
  logoGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    background: 'rgba(129, 140, 248, 0.2)',
    filter: 'blur(25px)',
    zIndex: 0,
  },
  title: {
    textAlign: 'center',
    color: '#e4e4e7',
    marginBottom: '6px',
    fontSize: '26px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#52525b',
    marginBottom: '32px',
    fontSize: '13px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#a1a1aa' },
  input: {
    width: '100%',
    padding: '14px 18px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    fontSize: '15px',
    boxSizing: 'border-box',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: '#e4e4e7',
    fontWeight: '500',
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
    marginTop: '4px',
    boxShadow: '0 4px 20px rgba(129, 140, 248, 0.3)',
  },
  linkText: { textAlign: 'center', marginTop: '24px', color: '#52525b', fontSize: '14px' },
  link: { color: '#818cf8', fontWeight: '700' },
};

export default Register;