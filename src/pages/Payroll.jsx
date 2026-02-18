import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import API from '../services/api';
import toast from 'react-hot-toast';

const Payroll = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), basicSalary: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [payRes, empRes] = await Promise.all([
        API.get('/payroll'),
        API.get('/employees')
      ]);
      setPayrolls(payRes.data.data);
      setEmployees(empRes.data.data);
    } catch (error) {
      console.log('Error:', error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/payroll/generate', {
        userId: form.userId,
        month: Number(form.month),
        year: Number(form.year),
        basicSalary: Number(form.basicSalary)
      });
      toast.success(t('success'));
      setShowForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    }
  };

  const handleConfirm = async (id) => {
    try {
      await API.put(`/payroll/${id}/confirm`);
      toast.success(t('success'));
      fetchData();
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const handlePay = async (id) => {
    try {
      await API.put(`/payroll/${id}/pay`);
      toast.success(t('success'));
      fetchData();
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const statusColor = { draft: '#f39c12', confirmed: '#3498db', paid: '#27ae60' };

  const getStatusText = (status) => {
    if (status === 'draft') return t('draft');
    if (status === 'confirmed') return t('confirmed');
    if (status === 'paid') return t('paid');
    return status;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{t('payroll')}</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>{t('back')}</button>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? t('cancel') : '+ ' + t('calculateSalary')}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3>{t('calculateSalary')}</h3>
          <form onSubmit={handleSubmit}>
            <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} style={styles.input} required>
              <option value="">{t('selectEmployee')}</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.role === 'owner' ? t('owner') : emp.role === 'hr' ? t('hr') : t('employee')})</option>
              ))}
            </select>
            <input type="number" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} placeholder={t('month')} style={styles.input} min="1" max="12" required />
            <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder={t('year')} style={styles.input} required />
            <input type="number" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} placeholder={t('basicSalary')} style={styles.input} required />
            <button type="submit" style={styles.submitBtn}>{t('calculateSalary')}</button>
          </form>
        </div>
      )}

      <div style={styles.list}>
        {payrolls.map((pay) => (
          <div key={pay._id} style={styles.card}>
            <div>
              <h4>{pay.user?.name || 'Unknown'}</h4>
              <p style={{ color: '#666', fontSize: '14px' }}>{pay.month}/{pay.year}</p>
              <p style={{ fontSize: '13px' }}>{t('basicSalary')}: {pay.basicSalary?.toLocaleString()} | {t('netSalary')}: <strong>{pay.netSalary?.toLocaleString()}</strong></p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: statusColor[pay.status], fontWeight: 'bold', marginBottom: '5px' }}>{getStatusText(pay.status)}</p>
              {pay.status === 'draft' && <button onClick={() => handleConfirm(pay._id)} style={styles.confirmBtn}>{t('confirm')}</button>}
              {pay.status === 'confirmed' && <button onClick={() => handlePay(pay._id)} style={styles.payBtn}>{t('paid')}</button>}
            </div>
          </div>
        ))}
        {payrolls.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>{t('noRecords')}</p>}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { color: '#1a73e8' },
  backBtn: { padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginRight: '10px' },
  addBtn: { padding: '8px 16px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  formCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' },
  input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', marginTop: '10px', fontSize: '14px', boxSizing: 'border-box' },
  submitBtn: { width: '100%', padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', marginTop: '10px', cursor: 'pointer', fontSize: '16px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: { backgroundColor: 'white', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  confirmBtn: { padding: '5px 10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  payBtn: { padding: '5px 10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }
};

export default Payroll;