import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import API from '../services/api';
import toast from 'react-hot-toast';

const DEFAULT_POSITIONS = [
  'Managing Director', 'General Manager', 'Deputy General Manager',
  'HR Manager', 'Finance Manager', 'Sales Manager', 'Marketing Manager',
  'Operations Manager', 'IT Manager', 'Warehouse Manager', 'Production Manager',
  'QC Manager', 'Project Manager', 'Senior Accountant', 'Senior Developer',
  'Senior Sales Executive', 'Supervisor', 'Team Lead', 'Accountant',
  'HR Executive', 'Sales Executive', 'Marketing Executive', 'Admin Executive',
  'Customer Service', 'Cashier', 'Store Keeper', 'Receptionist', 'Secretary',
  'Technician', 'Designer', 'Developer', 'Content Creator',
  'Social Media Manager', 'Business Development', 'Purchasing Officer',
  'Logistics Officer', 'Mechanic', 'Electrician', 'Data Entry',
  'Office Staff', 'Delivery Staff', 'Driver', 'Security Guard',
  'Cleaner', 'Cook', 'Intern', 'Trainee', 'Part-time Staff',
  'Contract Staff', 'Consultant'
];

const Employees = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState(DEFAULT_POSITIONS);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '123456', role: 'employee', position: '', department: '', joinDate: new Date().toISOString().split('T')[0], salary: '' });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        API.get('/employees'),
        API.get('/departments')
      ]);
      setEmployees(empRes.data.data);
      setDepartments(deptRes.data.data || []);

      // Try to get positions from API, fallback to default
      try {
        const posRes = await API.get('/payment-config/positions');
        if (posRes.data.data && posRes.data.data.length > 0) {
          setPositions(posRes.data.data.map(p => p.name || p));
        }
      } catch (e) {
        console.log('Using default positions');
        setPositions(DEFAULT_POSITIONS);
      }
    } catch (error) { console.log('Error:', error.message); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, salary: Number(form.salary) || 0 };
      if (editId) await API.put(`/employees/${editId}`, payload);
      else await API.post('/employees', payload);
      toast.success(t('success'));
      resetForm();
      fetchAll();
    } catch (error) { toast.error(error.response?.data?.message || t('error')); }
  };

  const resetForm = () => {
    setForm({ name: '', phone: '', password: '123456', role: 'employee', position: '', department: '', joinDate: new Date().toISOString().split('T')[0], salary: '' });
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (emp) => {
    setForm({
      name: emp.name, phone: emp.phone, password: '', role: emp.role,
      position: emp.position || '', department: emp.department?._id || '',
      joinDate: emp.joinDate ? new Date(emp.joinDate).toISOString().split('T')[0] : '',
      salary: emp.salary || ''
    });
    setEditId(emp._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this employee?')) {
      try { await API.delete(`/employees/${id}`); toast.success(t('success')); fetchAll(); }
      catch (error) { toast.error(t('error')); }
    }
  };

  const filtered = employees.filter(emp =>
    emp.name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.phone?.includes(search) ||
    emp.position?.toLowerCase().includes(search.toLowerCase())
  );

  const inp = { width: '100%', padding: '12px 14px', borderRadius: '12px', fontSize: '13px', boxSizing: 'border-box', fontWeight: '500', background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', minHeight: '100vh', background: theme.bg }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <p style={{ color: theme.textMuted, fontSize: '12px', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}>Team</p>
          <h1 style={{ color: theme.text, fontSize: '24px', fontWeight: '800' }}>{t('employees')}</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.textSecondary }}>←</button>
          <button onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
            style={{ padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', background: showForm ? 'transparent' : theme.primary, border: showForm ? `1px solid ${theme.danger}` : 'none', color: showForm ? theme.danger : 'white' }}>
            {showForm ? t('cancel') : '+ Add'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '14px', marginBottom: '10px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, position..."
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '14px', outline: 'none', fontWeight: '500', color: theme.text }} />
      </div>

      <p style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '12px' }}>{filtered.length} employees</p>

      {/* Form */}
      {showForm && (
        <div style={{ padding: '20px', borderRadius: '16px', marginBottom: '16px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          <p style={{ color: theme.text, fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>{editId ? 'Edit' : 'New'} Employee</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" style={inp} required />
              <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" style={inp} required />
            </div>
            {!editId && <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password (default: 123456)" style={inp} />}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <select name="role" value={form.role} onChange={handleChange} style={inp}>
                <option value="employee">{t('employee')}</option>
                <option value="hr">{t('hr')}</option>
              </select>
              <select name="position" value={form.position} onChange={handleChange} style={inp}>
                <option value="">-- Select Position --</option>
                {positions.map((pos, idx) => (
                  <option key={idx} value={typeof pos === 'string' ? pos : pos.name}>
                    {typeof pos === 'string' ? pos : pos.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <select name="department" value={form.department} onChange={handleChange} style={inp}>
                <option value="">-- Select Dept --</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
              <input type="date" name="joinDate" value={form.joinDate} onChange={handleChange} style={inp} />
            </div>
            <input type="number" name="salary" value={form.salary} onChange={handleChange} placeholder="Monthly Salary (Ks)" style={inp} />
            <button type="submit" style={{ width: '100%', padding: '13px', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', background: theme.primary }}>
              {editId ? 'Update' : 'Add Employee'}
            </button>
          </form>
        </div>
      )}

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(emp => (
          <div key={emp._id} style={{ borderRadius: '16px', overflow: 'hidden', background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '17px', background: theme.primaryLight, color: theme.primary, flexShrink: 0 }}>
                {emp.name?.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <p style={{ color: theme.text, fontWeight: '700', fontSize: '14px' }}>{emp.name}</p>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', background: emp.role === 'owner' ? theme.dangerLight : emp.role === 'hr' ? theme.infoLight : theme.successLight, color: emp.role === 'owner' ? theme.danger : emp.role === 'hr' ? theme.info : theme.success }}>
                    {emp.role}
                  </span>
                </div>
                <p style={{ color: theme.textMuted, fontSize: '12px' }}>{emp.phone}</p>
                {emp.position && <p style={{ color: theme.primary, fontSize: '11px', fontWeight: '600', marginTop: '2px' }}>{emp.position}</p>}
                {emp.department?.name && <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', marginTop: '4px', background: theme.primaryLight, color: theme.primary }}>{emp.department.name}</span>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: emp.isActive ? theme.success : theme.danger, fontSize: '10px', fontWeight: '700' }}>{emp.isActive ? '● Active' : '○ Inactive'}</p>
                {emp.joinDate && <p style={{ color: theme.textMuted, fontSize: '10px', marginTop: '4px' }}>Since {new Date(emp.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '8px 16px', borderTop: `1px solid ${theme.border}` }}>
              <button onClick={() => handleEdit(emp)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: theme.primary }}>Edit</button>
              <div style={{ width: '1px', height: '16px', background: theme.border }}></div>
              <button onClick={() => handleDelete(emp._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: theme.danger }}>Remove</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: theme.textMuted, fontSize: '14px' }}>No employees found</p>}
      </div>
    </div>
  );
};

export default Employees;