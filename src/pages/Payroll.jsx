import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import API from '../services/api';
import toast from 'react-hot-toast';

const Payroll = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), basicSalary: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [payRes, empRes] = await Promise.all([API.get('/payroll'), API.get('/employees')]);
      setPayrolls(payRes.data.data);
      setEmployees(empRes.data.data);
    } catch (error) { console.log('Error:', error.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/payroll/generate', { userId: form.userId, month: Number(form.month), year: Number(form.year), basicSalary: Number(form.basicSalary) });
      toast.success(t('success'));
      setShowForm(false);
      fetchData();
    } catch (error) { toast.error(error.response?.data?.message || t('error')); }
  };

  const handleConfirm = async (id) => {
    try { await API.put(`/payroll/${id}/confirm`); toast.success(t('success')); fetchData(); }
    catch (error) { toast.error(t('error')); }
  };

  const handlePay = async (id) => {
    try { await API.put(`/payroll/${id}/pay`); toast.success(t('success')); fetchData(); }
    catch (error) { toast.error(t('error')); }
  };

  const statusStyles = {
    draft: { bg: theme.warningLight, color: theme.warning, icon: '📝' },
    confirmed: { bg: theme.infoLight, color: theme.info, icon: '✔️' },
    paid: { bg: theme.successLight, color: theme.success, icon: '💵' },
  };

  const getStatusText = (status) => {
    if (status === 'draft') return t('draft');
    if (status === 'confirmed') return t('confirmed');
    if (status === 'paid') return t('paid');
    return status;
  };

  return (
    <div style={{ ...s.container, background: theme.gradientBg, minHeight: '100vh' }}>
      <div style={s.header}>
        <h1 style={{ ...s.title, color: theme.text }}>💰 {t('payroll')}</h1>
        <div style={s.headerBtns}>
          <button onClick={() => navigate('/dashboard')} style={{ ...s.backBtn, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}>
            ← {t('back')}
          </button>
          <button onClick={() => setShowForm(!showForm)} style={{ ...s.addBtn, background: showForm ? theme.dangerLight : theme.gradient1, color: showForm ? theme.danger : 'white' }}>
            {showForm ? '✕ ' + t('cancel') : '+ ' + t('calculateSalary')}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ ...s.formCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          <h3 style={{ color: theme.text, fontWeight: '700', marginBottom: '16px' }}>🧮 {t('calculateSalary')}</h3>
          <form onSubmit={handleSubmit} style={s.form}>
            <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} required>
              <option value="">{t('selectEmployee')}</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.role})</option>
              ))}
            </select>
            <div style={s.gridRow}>
              <input type="number" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} placeholder={t('month')} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} min="1" max="12" required />
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder={t('year')} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} required />
            </div>
            <input type="number" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} placeholder={t('basicSalary') + ' (Ks)'} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} required />
            <button type="submit" style={{ ...s.submitBtn, background: theme.gradient1 }}>🧮 {t('calculateSalary')}</button>
          </form>
        </div>
      )}

      <div style={s.list}>
        {payrolls.map((pay, index) => (
          <div key={pay._id} style={{ ...s.card, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, animationDelay: `${index * 0.05}s` }}>
            <div style={s.cardHeader}>
              <div style={s.cardHeaderLeft}>
                <div style={{ ...s.payAvatar, background: theme.gradient1 }}>💼</div>
                <div>
                  <h4 style={{ color: theme.text, fontWeight: '700', fontSize: '15px' }}>{pay.user?.name || 'Unknown'}</h4>
                  <p style={{ color: theme.textMuted, fontSize: '12px' }}>{pay.month}/{pay.year}</p>
                </div>
              </div>
              <span style={{
                ...s.statusChip,
                background: statusStyles[pay.status]?.bg,
                color: statusStyles[pay.status]?.color,
              }}>
                {statusStyles[pay.status]?.icon} {getStatusText(pay.status)}
              </span>
            </div>

            <div style={{ ...s.salaryRow, borderColor: theme.border }}>
              <div style={s.salaryItem}>
                <p style={{ color: theme.textMuted, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>{t('basicSalary')}</p>
                <p style={{ color: theme.text, fontSize: '16px', fontWeight: '800' }}>{pay.basicSalary?.toLocaleString()}</p>
              </div>
              <div style={{ ...s.salaryDivider, background: theme.border }}></div>
              <div style={s.salaryItem}>
                <p style={{ color: theme.textMuted, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>{t('netSalary')}</p>
                <p style={{ color: theme.success, fontSize: '18px', fontWeight: '900' }}>{pay.netSalary?.toLocaleString()} Ks</p>
              </div>
            </div>

            {pay.status === 'draft' && (
              <button onClick={() => handleConfirm(pay._id)} style={{ ...s.actionBtn, background: theme.infoLight, color: theme.info }}>
                ✔️ {t('confirm')}
              </button>
            )}
            {pay.status === 'confirmed' && (
              <button onClick={() => handlePay(pay._id)} style={{ ...s.actionBtn, background: theme.successLight, color: theme.success }}>
                💵 {t('paid')}
              </button>
            )}
          </div>
        ))}
        {payrolls.length === 0 && <div style={{ ...s.empty, color: theme.textMuted }}><span style={{ fontSize: '36px' }}>📭</span><p>{t('noRecords')}</p></div>}
      </div>
    </div>
  );
};

const s = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  title: { fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' },
  headerBtns: { display: 'flex', gap: '8px' },
  backBtn: { padding: '10px 18px', borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', border: 'none' },
  addBtn: { padding: '10px 18px', borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', border: 'none' },
  formCard: { padding: '24px', borderRadius: '20px', marginBottom: '20px', animation: 'slideUp 0.3s ease-out' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { width: '100%', padding: '14px 18px', borderRadius: '14px', fontSize: '14px', boxSizing: 'border-box', fontWeight: '500' },
  gridRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  submitBtn: { width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: { padding: '18px', borderRadius: '18px', animation: 'fadeIn 0.4s ease-out' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  cardHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  payAvatar: { width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  statusChip: { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  salaryRow: { display: 'flex', alignItems: 'center', padding: '14px 0', borderTop: '1px solid', borderBottom: '1px solid', marginBottom: '12px' },
  salaryItem: { flex: 1, textAlign: 'center' },
  salaryDivider: { width: '1px', height: '36px' },
  actionBtn: { width: '100%', padding: '12px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px', textAlign: 'center' },
  empty: { textAlign: 'center', padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
};

export default Payroll;