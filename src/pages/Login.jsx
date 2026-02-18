import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Language Switch */}
        <div style={styles.langRow}>
          <button onClick={() => switchLanguage('mm')} style={{ ...styles.langBtn, backgroundColor: lang === 'mm' ? '#1a73e8' : '#f0f0f0', color: lang === 'mm' ? 'white' : '#333' }}>🇲🇲 မြန်မာ</button>
          <button onClick={() => switchLanguage('en')} style={{ ...styles.langBtn, backgroundColor: lang === 'en' ? '#1a73e8' : '#f0f0f0', color: lang === 'en' ? 'white' : '#333' }}>🇬🇧 EN</button>
        </div>

        <div style={styles.logo}>S</div>
        <h1 style={styles.title}>SimpleHR</h1>
        <p style={styles.subtitle}>HR Management System</p>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('phonePlaceholder')} style={styles.input} required />
          </div>
          <div style={styles.inputGroup}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('passwordPlaceholder')} style={styles.input} required />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? t('loading') : t('login')}
          </button>
        </form>
        <p style={styles.link}>
          {t('noAccount')} <Link to="/register" style={{ fontWeight: 'bold' }}>{t('register')}</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a73e8', padding: '20px' },
  card: { backgroundColor: 'white', padding: '40px 30px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', width: '100%', maxWidth: '380px' },
  langRow: { display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' },
  langBtn: { padding: '6px 14px', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' },
  logo: { width: '60px', height: '60px', borderRadius: '15px', backgroundColor: '#1a73e8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', margin: '0 auto 15px' },
  title: { textAlign: 'center', color: '#333', marginBottom: '5px', fontSize: '24px' },
  subtitle: { textAlign: 'center', color: '#999', marginBottom: '30px', fontSize: '14px' },
  inputGroup: { marginBottom: '15px' },
  input: { width: '100%', padding: '14px 16px', border: '2px solid #eee', borderRadius: '12px', fontSize: '16px', boxSizing: 'border-box', backgroundColor: '#f8f9fa' },
  button: { width: '100%', padding: '14px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  link: { textAlign: 'center', marginTop: '20px', color: '#999', fontSize: '14px' }
};

export default Login;