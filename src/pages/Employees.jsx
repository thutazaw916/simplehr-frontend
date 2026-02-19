import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import API from '../services/api';
import toast from 'react-hot-toast';

const Employees = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '123456', role: 'employee' });
  const [editId, setEditId] = useState(null);

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/employees');
      setEmployees(res.data.data);
    } catch (error) { toast.error(t('error')); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await API.put(`/employees/${editId}`, form);
      } else {
        await API.post('/employees', form);
      }
      toast.success(t('success'));
      setForm({ name: '', phone: '', password: '123456', role: 'employee' });
      setShowForm(false);
      setEditId(null);
      fetchEmployees();
    } catch (error) { toast.error(error.response?.data?.message || t('error')); }
  };

  const handleEdit = (emp) => {
    setForm({ name: emp.name, phone: emp.phone, password: '', role: emp.role });
    setEditId(emp._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('confirm') + '?')) {
      try {
        await API.delete(`/employees/${id}`);
        toast.success(t('success'));
        fetchEmployees();
      } catch (error) { toast.error(t('error')); }
    }
  };

  const roleColors = {
    owner: { bg: theme.primaryLight, text: theme.primary },
    hr: { bg: theme.infoLight, text: theme.info },
    employee: { bg: theme.successLight, text: theme.success },
  };

  return (
    <div style={{ ...s.container, background: theme.gradientBg, minHeight: '100vh' }}>
      <div style={s.header}>
        <h1 style={{ ...s.title, color: theme.text }}>👥 {t('employees')}</h1>
        <div style={s.headerBtns}>
          <button onClick={() => navigate('/dashboard')} style={{ ...s.backBtn, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}>
            ← {t('back')}
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', phone: '', password: '123456', role: 'employee' }); }}
            style={{ ...s.addBtn, background: showForm ? theme.dangerLight : theme.gradient1, color: showForm ? theme.danger : 'white' }}>
            {showForm ? '✕ ' + t('cancel') : '+ ' + t('addEmployee')}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ ...s.formCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          <h3 style={{ color: theme.text, fontWeight: '700', marginBottom: '16px' }}>
            {editId ? '✏️ ' + t('edit') : '✨ ' + t('addEmployee')}
          </h3>
          <form onSubmit={handleSubmit} style={s.form}>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder={t('namePlaceholder')} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} required />
            <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder={t('phonePlaceholder')} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} required />
            {!editId && <input type="password" name="password" value={form.password} onChange={handleChange} placeholder={t('passwordPlaceholder')} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} />}
            <select name="role" value={form.role} onChange={handleChange} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }}>
              <option value="employee">{t('employee')}</option>
              <option value="hr">{t('hr')}</option>
            </select>
            <button type="submit" style={{ ...s.submitBtn, background: theme.gradient1 }}>
              {editId ? '💾 ' + t('save') : '✓ ' + t('add')}
            </button>
          </form>
        </div>
      )}

      <div style={s.list}>
        {employees.map((emp, index) => (
          <div key={emp._id} style={{ ...s.card, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, animationDelay: `${index * 0.05}s` }}>
            <div style={s.cardLeft}>
              <div style={{ ...s.empAvatar, background: theme.gradient1 }}>
                {emp.name?.charAt(0)}
              </div>
              <div>
                <h4 style={{ color: theme.text, fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{emp.name}</h4>
                <p style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '6px' }}>{emp.phone}</p>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ ...s.chip, background: roleColors[emp.role]?.bg || theme.primaryLight, color: roleColors[emp.role]?.text || theme.primary }}>
                    {emp.role === 'owner' ? t('owner') : emp.role === 'hr' ? t('hr') : t('employee')}
                  </span>
                  <span style={{ ...s.chip, background: emp.isActive ? theme.successLight : theme.dangerLight, color: emp.isActive ? theme.success : theme.danger }}>
                    {emp.isActive ? '● ' + t('active') : '○ ' + t('inactive')}
                  </span>
                </div>
              </div>
            </div>
            <div style={s.cardActions}>
              <button onClick={() => handleEdit(emp)} style={{ ...s.actionBtn, background: theme.warningLight, color: theme.warning }}>✏️</button>
              <button onClick={() => handleDelete(emp._id)} style={{ ...s.actionBtn, background: theme.dangerLight, color: theme.danger }}>🗑️</button>
            </div>
          </div>
        ))}
        {employees.length === 0 && <div style={{ ...s.empty, color: theme.textMuted }}><span style={{ fontSize: '36px' }}>📭</span><p>{t('noRecords')}</p></div>}
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
  addBtn: { padding: '10px 18px', borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', border: 'none', boxShadow: '0 4px 15px rgba(129, 140, 248, 0.2)' },
  formCard: { padding: '24px', borderRadius: '20px', marginBottom: '20px', animation: 'slideUp 0.3s ease-out' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { width: '100%', padding: '14px 18px', borderRadius: '14px', fontSize: '14px', boxSizing: 'border-box', fontWeight: '500' },
  submitBtn: { width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 15px rgba(129, 140, 248, 0.3)' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  card: { padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeIn 0.4s ease-out' },
  cardLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  empAvatar: { width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '18px', boxShadow: '0 4px 12px rgba(129, 140, 248, 0.2)' },
  chip: { padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.3px' },
  cardActions: { display: 'flex', gap: '6px' },
  actionBtn: { width: '38px', height: '38px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
};

export default Employees;