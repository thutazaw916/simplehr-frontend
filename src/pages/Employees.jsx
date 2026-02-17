import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const Employees = () => {
  const navigate = useNavigate();
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
      toast.error('Failed to load employees');
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
        toast.success('Employee updated');
      } else {
        await API.post('/employees', form);
        toast.success('Employee added');
      }
      setForm({ name: '', phone: '', password: '123456', role: 'employee' });
      setShowForm(false);
      setEditId(null);
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const handleEdit = (emp) => {
    setForm({ name: emp.name, phone: emp.phone, password: '', role: emp.role });
    setEditId(emp._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this employee?')) {
      try {
        await API.delete(`/employees/${id}`);
        toast.success('Employee deleted');
        fetchEmployees();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Employees</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>Back</button>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', phone: '', password: '123456', role: 'employee' }); }} style={styles.addBtn}>
            {showForm ? 'Cancel' : '+ Add Employee'}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3>{editId ? 'Edit Employee' : 'Add Employee'}</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Name" style={styles.input} required />
            <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" style={styles.input} required />
            {!editId && <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" style={styles.input} />}
            <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
            </select>
            <button type="submit" style={styles.submitBtn}>{editId ? 'Update' : 'Add'}</button>
          </form>
        </div>
      )}

      <div style={styles.list}>
        {employees.map((emp) => (
          <div key={emp._id} style={styles.card}>
            <div>
              <h3 style={styles.empName}>{emp.name}</h3>
              <p style={styles.empInfo}>{emp.phone} | {emp.role}</p>
              <p style={{ color: emp.isActive ? '#27ae60' : '#e74c3c' }}>
                {emp.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <button onClick={() => handleEdit(emp)} style={styles.editBtn}>Edit</button>
              <button onClick={() => handleDelete(emp._id)} style={styles.deleteBtn}>Delete</button>
            </div>
          </div>
        ))}
        {employees.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>No employees found</p>}
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