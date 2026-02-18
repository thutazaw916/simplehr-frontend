import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import API from '../services/api';
import toast from 'react-hot-toast';

const Subscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [sub, setSub] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [form, setForm] = useState({ transactionId: '', method: 'kbzpay', note: '' });

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await API.get('/subscription');
      setSub(res.data.data);
    } catch (error) {
      console.log('Error:', error.message);
    }
  };

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const amount = selectedPlan === 'basic' ? 30000 : 80000;
      await API.post('/subscription/payment', {
        amount,
        plan: selectedPlan,
        method: form.method,
        transactionId: form.transactionId,
        note: form.note
      });
      toast.success(t('paymentSuccess'));
      setShowPayment(false);
      fetchSubscription();
    } catch (error) {
      toast.error(error.response?.data?.message || t('paymentFailed'));
    }
  };

  const getPlanName = (plan) => {
    if (plan === 'free') return t('freePlan');
    if (plan === 'basic') return t('basicPlan');
    if (plan === 'pro') return t('proPlan');
    return plan;
  };

  const planColors = { free: '#95a5a6', basic: '#3498db', pro: '#f39c12' };

  if (!sub) return <div style={{ textAlign: 'center', marginTop: '50px' }}>{t('loading')}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{t('subscription')}</h1>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>{t('back')}</button>
      </div>

      <div style={styles.currentPlan}>
        <span style={{ ...styles.planBadge, backgroundColor: planColors[sub.plan] }}>{getPlanName(sub.plan)}</span>
        <h2 style={{ margin: '10px 0' }}>{t('currentPlan')}</h2>
        <div style={styles.infoRow}><span>{t('maxEmployees')}:</span><span>{sub.maxEmployees}</span></div>
        <div style={styles.infoRow}><span>{t('price')}:</span><span>{sub.price.toLocaleString()} {t('ksPerMonth')}</span></div>
        <div style={styles.infoRow}><span>{t('daysLeft')}:</span><span style={{ color: sub.daysLeft < 7 ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>{sub.daysLeft} {t('days')}</span></div>
        <div style={styles.infoRow}><span>{t('endDate')}:</span><span>{new Date(sub.endDate).toLocaleDateString()}</span></div>
        <div style={styles.infoRow}><span>{t('status')}:</span><span style={{ color: sub.isActive ? '#27ae60' : '#e74c3c' }}>{sub.isActive ? t('active') : t('expired')}</span></div>
      </div>

      <h2 style={{ marginBottom: '15px' }}>{t('upgradePlan')}</h2>

      <div style={styles.plansRow}>
        <div style={styles.planCard}>
          <h3 style={{ color: '#95a5a6' }}>{t('freePlan')}</h3>
          <p style={styles.price}>0 Ks</p>
          <p style={styles.planInfo}>{t('freeEmployees')}</p>
          <p style={styles.planInfo}>{t('freeTrial')}</p>
          <p style={styles.planInfo}>{t('basicFeatures')}</p>
          {sub.plan === 'free' && <p style={styles.currentLabel}>{t('currentPlan')}</p>}
        </div>

        <div style={{ ...styles.planCard, borderColor: '#3498db' }}>
          <h3 style={{ color: '#3498db' }}>{t('basicPlan')}</h3>
          <p style={styles.price}>30,000 Ks</p>
          <p style={styles.planInfo}>{t('basicEmployees')}</p>
          <p style={styles.planInfo}>{t('allFeatures')}</p>
          <p style={styles.planInfo}>{t('monthlyBilling')}</p>
          {sub.plan === 'basic' ? (
            <p style={styles.currentLabel}>{t('currentPlan')}</p>
          ) : (
            <button onClick={() => handleUpgrade('basic')} style={{ ...styles.upgradeBtn, backgroundColor: '#3498db' }}>{t('upgrade')}</button>
          )}
        </div>

        <div style={{ ...styles.planCard, borderColor: '#f39c12' }}>
          <h3 style={{ color: '#f39c12' }}>{t('proPlan')}</h3>
          <p style={styles.price}>80,000 Ks</p>
          <p style={styles.planInfo}>{t('proEmployees')}</p>
          <p style={styles.planInfo}>{t('allFeatures')}</p>
          <p style={styles.planInfo}>{t('prioritySupport')}</p>
          {sub.plan === 'pro' ? (
            <p style={styles.currentLabel}>{t('currentPlan')}</p>
          ) : (
            <button onClick={() => handleUpgrade('pro')} style={{ ...styles.upgradeBtn, backgroundColor: '#f39c12' }}>{t('upgrade')}</button>
          )}
        </div>
      </div>

      {showPayment && (
        <div style={styles.paymentCard}>
          <h3>{t('paymentFor')} {getPlanName(selectedPlan)}</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>{t('amount')}: {selectedPlan === 'basic' ? '30,000' : '80,000'} Ks</p>

          <div style={styles.paymentInfo}>
            <p><strong>{t('paymentMethods')}:</strong></p>
            <p>KBZPay: 09971489502</p>
            <p>WavePay: 09971489502</p>
            <p>CB Bank: 1234567890</p>
          </div>

          <form onSubmit={handlePayment}>
            <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} style={styles.input}>
              <option value="kbzpay">KBZPay</option>
              <option value="wavepay">WavePay</option>
              <option value="bank">{t('bankTransfer')}</option>
              <option value="other">{t('otherMethod')}</option>
            </select>
            <input type="text" value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} placeholder={t('transactionId')} style={styles.input} required />
            <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={t('notePlaceholder')} style={styles.input} />
            <button type="submit" style={styles.payBtn}>{t('confirmPayment')}</button>
            <button type="button" onClick={() => setShowPayment(false)} style={styles.cancelBtn}>{t('cancel')}</button>
          </form>
        </div>
      )}

      {sub.payments && sub.payments.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '10px' }}>{t('paymentHistory')}</h3>
          {sub.payments.map((pay, index) => (
            <div key={index} style={styles.historyCard}>
              <div>
                <p><strong>{pay.amount?.toLocaleString()} Ks</strong></p>
                <p style={{ color: '#666', fontSize: '13px' }}>{pay.method} | {pay.transactionId}</p>
              </div>
              <p style={{ color: '#999', fontSize: '13px' }}>{new Date(pay.paidAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { color: '#1a73e8' },
  backBtn: { padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  currentPlan: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '25px' },
  planBadge: { color: 'white', padding: '5px 15px', borderRadius: '15px', fontSize: '14px', fontWeight: 'bold' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' },
  plansRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' },
  planCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center', border: '2px solid #eee' },
  price: { fontSize: '22px', fontWeight: 'bold', margin: '10px 0', color: '#333' },
  planInfo: { color: '#666', fontSize: '14px', marginBottom: '5px' },
  currentLabel: { color: '#27ae60', fontWeight: 'bold', marginTop: '10px' },
  upgradeBtn: { color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', marginTop: '10px', fontSize: '14px' },
  paymentCard: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginTop: '20px' },
  paymentInfo: { backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '15px' },
  input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', marginTop: '10px', fontSize: '14px', boxSizing: 'border-box' },
  payBtn: { width: '100%', padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', marginTop: '10px', cursor: 'pointer', fontSize: '16px' },
  cancelBtn: { width: '100%', padding: '12px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '8px', marginTop: '10px', cursor: 'pointer', fontSize: '16px' },
  historyCard: { backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 5px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }
};

export default Subscription;