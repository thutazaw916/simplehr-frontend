import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import API from '../services/api';
import toast from 'react-hot-toast';

const Subscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [sub, setSub] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [form, setForm] = useState({ transactionId: '', method: 'kbzpay', note: '' });

  useEffect(() => { fetchSubscription(); }, []);

  const fetchSubscription = async () => {
    try { const res = await API.get('/subscription'); setSub(res.data.data); }
    catch (error) { console.log('Error:', error.message); }
  };

  const handleUpgrade = (plan) => { setSelectedPlan(plan); setShowPayment(true); };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const amount = selectedPlan === 'basic' ? 30000 : 80000;
      await API.post('/subscription/payment', { amount, plan: selectedPlan, method: form.method, transactionId: form.transactionId, note: form.note });
      toast.success(t('paymentSuccess'));
      setShowPayment(false);
      fetchSubscription();
    } catch (error) { toast.error(error.response?.data?.message || t('paymentFailed')); }
  };

  const getPlanName = (plan) => {
    if (plan === 'free') return t('freePlan');
    if (plan === 'basic') return t('basicPlan');
    if (plan === 'pro') return t('proPlan');
    return plan;
  };

  if (!sub) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: theme.textMuted }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', animation: 'pulse 1.5s ease-in-out infinite' }}>⏳</div>
        <p>{t('loading')}</p>
      </div>
    </div>
  );

  const plans = [
    { key: 'free', icon: '🆓', color: theme.textSecondary, price: '0', features: [t('freeEmployees'), t('freeTrial'), t('basicFeatures')] },
    { key: 'basic', icon: '⚡', color: theme.info, price: '30,000', features: [t('basicEmployees'), t('allFeatures'), t('monthlyBilling')] },
    { key: 'pro', icon: '👑', color: theme.warning, price: '80,000', features: [t('proEmployees'), t('allFeatures'), t('prioritySupport')] },
  ];

  return (
    <div style={{ ...s.container, background: theme.gradientBg, minHeight: '100vh' }}>
      <div style={s.header}>
        <h1 style={{ ...s.title, color: theme.text }}>⭐ {t('subscription')}</h1>
        <button onClick={() => navigate('/dashboard')} style={{ ...s.backBtn, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}>
          ← {t('back')}
        </button>
      </div>

      {/* Current Plan */}
      <div style={{ ...s.currentCard, background: theme.gradient1, animation: 'fadeIn 0.4s ease-out' }}>
        <div style={s.currentTop}>
          <span style={{ fontSize: '32px' }}>{sub.plan === 'free' ? '🆓' : sub.plan === 'basic' ? '⚡' : '👑'}</span>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('currentPlan')}</p>
            <h2 style={{ color: 'white', fontWeight: '900', fontSize: '24px' }}>{getPlanName(sub.plan)}</h2>
          </div>
        </div>
        <div style={s.currentStats}>
          <div style={s.currentStat}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>{t('maxEmployees')}</p>
            <p style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>{sub.maxEmployees}</p>
          </div>
          <div style={s.currentStat}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>{t('daysLeft')}</p>
            <p style={{ color: sub.daysLeft < 7 ? '#fbbf24' : 'white', fontWeight: '800', fontSize: '18px' }}>{sub.daysLeft}</p>
          </div>
          <div style={s.currentStat}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>{t('status')}</p>
            <p style={{ color: sub.isActive ? '#34d399' : '#f87171', fontWeight: '800', fontSize: '14px' }}>
              {sub.isActive ? '● ' + t('active') : '○ ' + t('expired')}
            </p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <h2 style={{ color: theme.text, fontWeight: '800', fontSize: '18px', marginBottom: '14px', marginTop: '24px' }}>
        🚀 {t('upgradePlan')}
      </h2>

      <div style={s.plansCol}>
        {plans.map((plan) => (
          <div key={plan.key} style={{
            ...s.planCard,
            background: theme.cardBg,
            border: sub.plan === plan.key ? `2px solid ${plan.color}` : `1px solid ${theme.cardBorder}`,
          }}>
            <div style={s.planTop}>
              <span style={{ fontSize: '28px' }}>{plan.icon}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: plan.color, fontWeight: '800', fontSize: '17px' }}>{getPlanName(plan.key)}</h3>
                <p style={{ color: theme.text, fontWeight: '900', fontSize: '22px' }}>{plan.price} <span style={{ fontSize: '13px', fontWeight: '500', color: theme.textMuted }}>Ks/mo</span></p>
              </div>
              {sub.plan === plan.key ? (
                <span style={{ ...s.currentBadge, background: theme.successLight, color: theme.success }}>✓ Current</span>
              ) : plan.key !== 'free' ? (
                <button onClick={() => handleUpgrade(plan.key)} style={{ ...s.upgradeBtn, background: `linear-gradient(135deg, ${plan.color}, ${plan.color})`, boxShadow: `0 4px 15px ${plan.color}40` }}>
                  {t('upgrade')}
                </button>
              ) : null}
            </div>
            <div style={s.featureList}>
              {plan.features.map((f, i) => (
                <span key={i} style={{ ...s.featureChip, background: theme.bgTertiary, color: theme.textSecondary }}>✓ {f}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div style={{ ...s.paymentOverlay, background: theme.overlay }} onClick={() => setShowPayment(false)}>
          <div style={{ ...s.paymentCard, background: theme.bgSecondary, border: `1px solid ${theme.cardBorder}` }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: theme.text, fontWeight: '800', marginBottom: '6px' }}>
              💳 {t('paymentFor')} {getPlanName(selectedPlan)}
            </h3>
            <p style={{ color: theme.primary, fontWeight: '800', fontSize: '24px', marginBottom: '16px' }}>
              {selectedPlan === 'basic' ? '30,000' : '80,000'} Ks
            </p>

            <div style={{ ...s.payInfo, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
              <p style={{ color: theme.text, fontWeight: '700', marginBottom: '8px' }}>📲 {t('paymentMethods')}</p>
              <p style={{ color: theme.textSecondary, fontSize: '13px' }}>KBZPay: 09971489502</p>
              <p style={{ color: theme.textSecondary, fontSize: '13px' }}>WavePay: 09971489502</p>
              <p style={{ color: theme.textSecondary, fontSize: '13px' }}>CB Bank: 1234567890</p>
            </div>

            <form onSubmit={handlePayment} style={s.form}>
              <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }}>
                <option value="kbzpay">KBZPay</option>
                <option value="wavepay">WavePay</option>
                <option value="bank">{t('bankTransfer')}</option>
                <option value="other">{t('otherMethod')}</option>
              </select>
              <input type="text" value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} placeholder={t('transactionId')} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} required />
              <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={t('notePlaceholder')} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} />
              <button type="submit" style={{ ...s.payBtn, background: theme.gradient1 }}>✅ {t('confirmPayment')}</button>
              <button type="button" onClick={() => setShowPayment(false)} style={{ ...s.cancelPayBtn, background: theme.cardBg, color: theme.textSecondary, border: `1px solid ${theme.cardBorder}` }}>
                {t('cancel')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment History */}
      {sub.payments && sub.payments.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ color: theme.text, fontWeight: '800', fontSize: '16px', marginBottom: '12px' }}>📜 {t('paymentHistory')}</h3>
          {sub.payments.map((pay, index) => (
            <div key={index} style={{ ...s.historyCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...s.historyIcon, background: theme.successLight }}>💵</div>
                <div>
                  <p style={{ color: theme.text, fontWeight: '800' }}>{pay.amount?.toLocaleString()} Ks</p>
                  <p style={{ color: theme.textMuted, fontSize: '12px' }}>{pay.method} • {pay.transactionId}</p>
                </div>
              </div>
              <p style={{ color: theme.textMuted, fontSize: '12px' }}>{new Date(pay.paidAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const s = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' },
  backBtn: { padding: '10px 18px', borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', border: 'none' },

  currentCard: { padding: '24px', borderRadius: '24px', marginBottom: '8px', boxShadow: '0 8px 40px rgba(129, 140, 248, 0.25)' },
  currentTop: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' },
  currentStats: { display: 'flex', justifyContent: 'space-around', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '14px' },
  currentStat: { textAlign: 'center' },

  plansCol: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  planCard: { padding: '20px', borderRadius: '20px', transition: 'all 0.2s' },
  planTop: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' },
  currentBadge: { padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  upgradeBtn: { padding: '10px 20px', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  featureList: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  featureChip: { padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' },

  paymentOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' },
  paymentCard: { width: '100%', maxWidth: '420px', padding: '28px', borderRadius: '24px', maxHeight: '90vh', overflow: 'auto', animation: 'slideUp 0.3s ease-out' },
  payInfo: { padding: '16px', borderRadius: '14px', marginBottom: '16px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { width: '100%', padding: '14px 18px', borderRadius: '14px', fontSize: '14px', boxSizing: 'border-box', fontWeight: '500' },
  payBtn: { width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 15px rgba(129, 140, 248, 0.3)' },
  cancelPayBtn: { width: '100%', padding: '14px', borderRadius: '14px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },

  historyCard: { padding: '14px 16px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  historyIcon: { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
};

export default Subscription;