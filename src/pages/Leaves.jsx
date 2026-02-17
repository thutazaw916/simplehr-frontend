import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';

const Leaves = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leaveType: 'sick', startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await API.get('/leaves');
      setLeaves(res.data.data);
    } catch (error) {
      toast.error('Failed to load leaves');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/leaves', form);
      toast.success('Leave request submitted');
      setForm({ leaveType: 'sick', startDate: '', endDate: '', reason: '' });
      setShowForm(false);
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.put(`/leaves/${id}/approve`);
      toast.success('Leave approved');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await API.put(`/leaves/${id}/reject`, { reason: 'Rejected' });
      toast.success('Leave rejected');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  const statusColor = { pending: '#f39c12', approved: '#27ae60', rejected: '#e74c3c' };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Leaves</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>Back</button>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? 'Cancel' : '+ Request Leave'}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3>Request Leave</h3>
          <form onSubmit={handleSubmit}>
            <select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })} style={styles.input}>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="annual">Annual Leave</option>
              <option value="unpaid">Unpaid Leave</option>
              <option value="other">Other</option>
            </select>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} style={styles.input} required />
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} style={styles.input} required />
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason" style={{ ...styles.input, height: '80px' }} required />
            <button type="submit" style={styles.submitBtn}>Submit</button>
          </form>
        </div>
      )}

      <div style={styles.list}>
        {leaves.map((leave) => (
          <div key={leave._id} style={styles.card}>
            <div>
              <h4>{leave.user?.name || 'You'}</h4>
              <p style={{ color: '#666', fontSize: '14px' }}>{leave.leaveType} | {leave.startDate} to {leave.endDate} ({leave.totalDays} days)</p>
              <p style={{ fontSize: '13px', color: '#999' }}>{leave.reason}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: statusColor[leave.status], fontWeight: 'bold', marginBottom: '5px' }}>{leave.status.toUpperCase()}</p>
              {leave.status === 'pending' && (user?.role === 'owner' || user?.role === 'hr') && (
                <div>
                  <button onClick={() => handleApprove(leave._id)} style={styles.approveBtn}>Approve</button>
                  <button onClick={() => handleReject(leave._id)} style={styles.rejectBtn}>Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {leaves.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>No leave requests</p>}
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
  approveBtn: { padding: '5px 10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '5px', fontSize: '12px' },
  rejectBtn: { padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }
};

export default Leaves;