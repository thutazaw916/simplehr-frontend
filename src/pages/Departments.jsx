import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import API from '../services/api';
import toast from 'react-hot-toast';

const Departments = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments');
      setDepartments(res.data.data);
    } catch (error) { toast.error(t('error')); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await API.put(`/departments/${editId}`, form); }
      else { await API.post('/departments', form); }
      toast.success(t('success'));
      setForm({ name: '', description: '' });
      setShowForm(false);
      setEditId(null);
      fetchDepartments();
    } catch (error) { toast.error(error.response?.data?.message || t('error')); }
  };

  const handleEdit = (dept) => {
    setForm({ name: dept.name, description: dept.description });
    setEditId(dept._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('confirm') + '?')) {
      try {
        await API.delete(`/departments/${id}`);
        toast.success(t('success'));
        fetchDepartments();
      } catch (error) { toast.error(t('error')); }
    }
  };

  const deptIcons = ['🏢', '🏗️', '🏭', '🏬', '🏛️', '🏪', '🏫', '🏥'];

  return (
    <div style={{ ...s.container, background: theme.gradientBg, minHeight: '100vh' }}>
      <div style={s.header}>
        <h1 style={{ ...s.title, color: theme.text }}>🏢 {t('departments')}</h1>
        <div style={s.headerBtns}>
          <button onClick={() => navigate('/dashboard')} style={{ ...s.backBtn, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}>
            ← {t('back')}
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', description: '' }); }}
            style={{ ...s.addBtn, background: showForm ? theme.dangerLight : theme.gradient1, color: showForm ? theme.danger : 'white' }}>
            {showForm ? '✕ ' + t('cancel') : '+ ' + t('addDepartment')}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ ...s.formCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          <h3 style={{ color: theme.text, fontWeight: '700', marginBottom: '16px' }}>
            {editId ? '✏️ ' + t('edit') : '✨ ' + t('addDepartment')}
          </h3>
          <form onSubmit={handleSubmit} style={s.form}>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('departmentName')} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} required />
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('description')} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} />
            <button type="submit" style={{ ...s.submitBtn, background: theme.gradient1 }}>
              {editId ? '💾 ' + t('save') : '✓ ' + t('add')}
            </button>
          </form>
        </div>
      )}

      <div style={s.grid}>
        {departments.map((dept, index) => (
          <div key={dept._id} style={{ ...s.card, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, animation: 'fadeIn 0.4s ease-out', animationDelay: `${index * 0.05}s` }}>
            <div style={s.cardTop}>
              <span style={{ fontSize: '32px' }}>{deptIcons[index % deptIcons.length]}</span>
              <h3 style={{ color: theme.text, fontWeight: '700', fontSize: '16px', marginTop: '10px' }}>{dept.name}</h3>
              <p style={{ color: theme.textMuted, fontSize: '13px', marginTop: '4px' }}>{dept.description || t('noDescription')}</p>
            </div>
            <div style={s.cardBottom}>
              <button onClick={() => handleEdit(dept)} style={{ ...s.actionBtn, background: theme.warningLight, color: theme.warning }}>✏️ {t('edit')}</button>
              <button onClick={() => handleDelete(dept._id)} style={{ ...s.actionBtn, background: theme.dangerLight, color: theme.danger }}>🗑️ {t('delete')}</button>
            </div>
          </div>
        ))}
      </div>
      {departments.length === 0 && <div style={{ ...s.empty, color: theme.textMuted }}><span style={{ fontSize: '36px' }}>📭</span><p>{t('noRecords')}</p></div>}
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
  submitBtn: { width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' },
  card: { padding: '20px', borderRadius: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  cardTop: { marginBottom: '16px' },
  cardBottom: { display: 'flex', gap: '6px' },
  actionBtn: { flex: 1, padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700', textAlign: 'center' },
  empty: { textAlign: 'center', padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
};

export default Departments;