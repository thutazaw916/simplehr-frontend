import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import API from '../services/api';
import toast from 'react-hot-toast';

const Employees = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '123456', role: 'employee' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/employees');
      setEmployees(res.data.data);
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await API.put(`/employees/${editId}`, form);
        toast.success(t('success'));
      } else {
        await API.post('/employees', form);
        toast.success(t('success'));
      }
      setForm({ name: '', phone: '', password: '123456', role: 'employee' });
      setShowForm(false);
      setEditId(null);
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    }
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
      } catch (error) {
        toast.error(t('error'));
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{t('employees')}</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>{t('back')}</button>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', phone: '', password: '123456', role: 'employee' }); }} style={styles.addBtn}>
            {showForm ? t('cancel') : '+ ' + t('addEmployee')}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3>{editId ? t('edit') : t('addEmployee')}</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder={t('namePlaceholder')} style={styles.input} required />
            <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder={t('phonePlaceholder')} style={styles.input} required />
            {!editId && <input type="password" name="password" value={form.password} onChange={handleChange} placeholder={t('passwordPlaceholder')} style={styles.input} />}
            <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
              <option value="employee">{t('employee')}</option>
              <option value="hr">{t('hr')}</option>
            </select>
            <button type="submit" style={styles.submitBtn}>{editId ? t('save') : t('add')}</button>
          </form>
        </div>
      )}

      <div style={styles.list}>
        {employees.map((emp) => (
          <div key={emp._id} style={styles.card}>
            <div>
              <h3 style={styles.empName}>{emp.name}</h3>
              <p style={styles.empInfo}>{emp.phone} | {emp.role === 'owner' ? t('owner') : emp.role === 'hr' ? t('hr') : t('employee')}</p>
              <p style={{ color: emp.isActive ? '#27ae60' : '#e74c3c' }}>
                {emp.isActive ? t('active') : t('inactive')}
              </p>
            </div>
            <div>
              <button onClick={() => handleEdit(emp)} style={styles.editBtn}>{t('edit')}</button>
              <button onClick={() => handleDelete(emp._id)} style={styles.deleteBtn}>{t('delete')}</button>
            </div>
          </div>
        ))}
        {employees.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>{t('noRecords')}</p>}
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
  empName: { color: '#333', marginBottom: '5px' },
  empInfo: { color: '#666', fontSize: '14px' },
  editBtn: { padding: '6px 12px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '5px' },
  deleteBtn: { padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
};

export default Employees;