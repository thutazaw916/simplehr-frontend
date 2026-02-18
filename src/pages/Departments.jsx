import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import API from '../services/api';
import toast from 'react-hot-toast';

const Departments = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments');
      setDepartments(res.data.data);
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await API.put(`/departments/${editId}`, form);
        toast.success(t('success'));
      } else {
        await API.post('/departments', form);
        toast.success(t('success'));
      }
      setForm({ name: '', description: '' });
      setShowForm(false);
      setEditId(null);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    }
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
      } catch (error) {
        toast.error(t('error'));
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{t('departments')}</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>{t('back')}</button>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', description: '' }); }} style={styles.addBtn}>
            {showForm ? t('cancel') : '+ ' + t('addDepartment')}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3>{editId ? t('edit') : t('addDepartment')}</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('departmentName')} style={styles.input} required />
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('description')} style={styles.input} />
            <button type="submit" style={styles.submitBtn}>{editId ? t('save') : t('add')}</button>
          </form>
        </div>
      )}

      <div style={styles.list}>
        {departments.map((dept) => (
          <div key={dept._id} style={styles.card}>
            <div>
              <h3 style={{ color: '#333', marginBottom: '5px' }}>{dept.name}</h3>
              <p style={{ color: '#666', fontSize: '14px' }}>{dept.description || t('noDescription')}</p>
            </div>
            <div>
              <button onClick={() => handleEdit(dept)} style={styles.editBtn}>{t('edit')}</button>
              <button onClick={() => handleDelete(dept._id)} style={styles.deleteBtn}>{t('delete')}</button>
            </div>
          </div>
        ))}
        {departments.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>{t('noRecords')}</p>}
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
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  editBtn: { padding: '6px 12px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '5px' },
  deleteBtn: { padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
};

export default Departments;