import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', phone: '', password: '', companyName: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Register failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>S</div>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Start managing your team</p>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your Name" style={styles.input} required />
          <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" style={styles.input} required />
          <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password (min 6)" style={styles.input} required />
          <input type="text" name="companyName" value={form.companyName} onChange={handleChange} placeholder="Company Name" style={styles.input} required />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p style={styles.link}>
          Have an account? <Link to="/login" style={{ fontWeight: 'bold' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a73e8', padding: '20px' },
  card: { backgroundColor: 'white', padding: '35px 30px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', width: '100%', maxWidth: '380px' },
  logo: { width: '60px', height: '60px', borderRadius: '15px', backgroundColor: '#1a73e8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', margin: '0 auto 15px' },
  title: { textAlign: 'center', color: '#333', marginBottom: '5px', fontSize: '24px' },
  subtitle: { textAlign: 'center', color: '#999', marginBottom: '25px', fontSize: '14px' },
  input: { width: '100%', padding: '14px 16px', border: '2px solid #eee', borderRadius: '12px', fontSize: '16px', boxSizing: 'border-box', backgroundColor: '#f8f9fa', marginBottom: '12px' },
  button: { width: '100%', padding: '14px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' },
  link: { textAlign: 'center', marginTop: '20px', color: '#999', fontSize: '14px' }
};

export default Register;