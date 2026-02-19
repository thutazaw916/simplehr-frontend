import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import API from '../services/api';
import toast from 'react-hot-toast';
import generatePayslipPDF from '../utils/generatePayslipPDF';

const Payroll = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [tab, setTab] = useState('list');
  const [payrolls, setPayrolls] = useState([]);
  const [myPayrolls, setMyPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPayDialog, setShowPayDialog] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({
    userId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    basicSalary: '', allowances: { transport: '', meal: '', housing: '', phone: '', position: '', other: '' },
    manualDeductions: { loan: '', other: '' }
  });
  const [payForm, setPayForm] = useState({ paymentMethod: 'kbzpay', transactionId: '', accountNumber: '', accountName: '', note: '' });

  const isAdmin = user?.role === 'owner' || user?.role === 'hr';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const promises = [API.get('/payroll/my')];
      if (isAdmin) {
        promises.push(API.get('/payroll'));
        promises.push(API.get('/employees'));
      }
      const results = await Promise.all(promises);
      setMyPayrolls(results[0].data.data);
      if (isAdmin) {
        setPayrolls(results[1].data.data);
        setEmployees(results[2].data.data);
      }
    } catch (error) { console.log('Error:', error.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        userId: form.userId,
        month: Number(form.month),
        year: Number(form.year),
        basicSalary: Number(form.basicSalary),
        allowances: {
          transport: Number(form.allowances.transport) || 0,
          meal: Number(form.allowances.meal) || 0,
          housing: Number(form.allowances.housing) || 0,
          phone: Number(form.allowances.phone) || 0,
          position: Number(form.allowances.position) || 0,
          other: Number(form.allowances.other) || 0,
        },
        manualDeductions: {
          loan: Number(form.manualDeductions.loan) || 0,
          other: Number(form.manualDeductions.other) || 0,
        }
      };
      await API.post('/payroll/generate', payload);
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
    try {
      await API.put(`/payroll/${id}/pay`, payForm);
      toast.success(t('success'));
      setShowPayDialog(null);
      fetchData();
    } catch (error) { toast.error(t('error')); }
  };

  const handleDownloadPDF = async (payrollId) => {
    try {
      const res = await API.get(`/payroll/${payrollId}`);
      const payroll = res.data.data;
      generatePayslipPDF(payroll, user?.company?.name || 'SimpleHR');
      toast.success('PDF Downloaded!');
    } catch (error) { toast.error('Failed to generate PDF'); }
  };

  const statusStyles = {
    draft: { bg: theme.warningLight, color: theme.warning, icon: '📝' },
    confirmed: { bg: theme.infoLight, color: theme.info, icon: '✔️' },
    processing: { bg: theme.primaryLight, color: theme.primary, icon: '⏳' },
    paid: { bg: theme.successLight, color: theme.success, icon: '💵' },
    failed: { bg: theme.dangerLight, color: theme.danger, icon: '❌' },
  };

  const paymentMethods = [
    { value: 'kbzpay', label: '🏦 KBZPay', color: '#0072CE' },
    { value: 'wavepay', label: '🌊 WavePay', color: '#FFB800' },
    { value: 'cbpay', label: '🏛️ CB Pay', color: '#003366' },
    { value: 'ayapay', label: '💳 AYA Pay', color: '#00A651' },
    { value: 'cash', label: '💵 Cash', color: theme.success },
    { value: 'bank_transfer', label: '🏧 Bank Transfer', color: theme.info },
  ];

  const getStatusText = (status) => {
    const map = { draft: t('draft'), confirmed: t('confirmed'), processing: t('processing'), paid: t('paid'), failed: t('failed') };
    return map[status] || status;
  };

  const fm = (n) => Number(n || 0).toLocaleString();

  const currentList = tab === 'my' ? myPayrolls : payrolls;

  return (
    <div style={{ ...s.container, background: theme.gradientBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={s.header}>
        <h1 style={{ ...s.title, color: theme.text }}>💰 {t('payroll')}</h1>
        <div style={s.headerBtns}>
          <button onClick={() => navigate('/dashboard')} style={{ ...s.backBtn, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}>← {t('back')}</button>
          {isAdmin && (
            <button onClick={() => setShowForm(!showForm)} style={{ ...s.addBtn, background: showForm ? theme.dangerLight : theme.gradient1, color: showForm ? theme.danger : 'white' }}>
              {showForm ? '✕ ' + t('cancel') : '🧮 ' + t('calculateSalary')}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {[
          { key: 'my', label: '📋 My Payslips', show: true },
          { key: 'list', label: '📊 All Payrolls', show: isAdmin },
        ].filter(t => t.show).map((item) => (
          <button key={item.key} onClick={() => setTab(item.key)} style={{
            ...s.tab,
            ...(tab === item.key ? { background: theme.gradient1, color: 'white', boxShadow: '0 4px 15px rgba(129,140,248,0.3)' } : { background: theme.cardBg, color: theme.textSecondary, border: `1px solid ${theme.cardBorder}` })
          }}>{item.label}</button>
        ))}
      </div>

      {/* Generate Form */}
      {showForm && isAdmin && (
        <div style={{ ...s.formCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          <h3 style={{ color: theme.text, fontWeight: '700', marginBottom: '16px' }}>🧮 {t('calculateSalary')}</h3>
          <p style={{ color: theme.textMuted, fontSize: '12px', marginBottom: '16px' }}>Myanmar SSB & Income Tax will be auto-calculated</p>
          
          <form onSubmit={handleSubmit} style={s.form}>
            <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} required>
              <option value="">{t('selectEmployee')}</option>
              {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.name} ({emp.role})</option>)}
            </select>
            
            <div style={s.gridRow}>
              <input type="number" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} placeholder={t('month')} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} min="1" max="12" required />
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder={t('year')} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} required />
            </div>
            
            <input type="number" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} placeholder={t('basicSalary') + ' (Ks)'} style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} required />
            
            {/* Allowances */}
            <div style={{ ...s.subSection, borderColor: theme.border }}>
              <p style={{ color: theme.primary, fontWeight: '700', fontSize: '13px', marginBottom: '10px' }}>💸 {t('totalAllowances')}</p>
              <div style={s.gridRow}>
                <input type="number" value={form.allowances.transport} onChange={(e) => setForm({ ...form, allowances: { ...form.allowances, transport: e.target.value } })} placeholder={t('transportAllowance')} style={{ ...s.inputSm, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} />
                <input type="number" value={form.allowances.meal} onChange={(e) => setForm({ ...form, allowances: { ...form.allowances, meal: e.target.value } })} placeholder={t('mealAllowance')} style={{ ...s.inputSm, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} />
              </div>
              <div style={s.gridRow}>
                <input type="number" value={form.allowances.housing} onChange={(e) => setForm({ ...form, allowances: { ...form.allowances, housing: e.target.value } })} placeholder={t('housingAllowance')} style={{ ...s.inputSm, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} />
                <input type="number" value={form.allowances.phone} onChange={(e) => setForm({ ...form, allowances: { ...form.allowances, phone: e.target.value } })} placeholder={t('phoneAllowance')} style={{ ...s.inputSm, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} />
              </div>
            </div>
            
            {/* Manual Deductions */}
            <div style={{ ...s.subSection, borderColor: theme.border }}>
              <p style={{ color: theme.danger, fontWeight: '700', fontSize: '13px', marginBottom: '10px' }}>📉 Manual Deductions</p>
              <div style={s.gridRow}>
                <input type="number" value={form.manualDeductions.loan} onChange={(e) => setForm({ ...form, manualDeductions: { ...form.manualDeductions, loan: e.target.value } })} placeholder={t('loanDeduction')} style={{ ...s.inputSm, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} />
                <input type="number" value={form.manualDeductions.other} onChange={(e) => setForm({ ...form, manualDeductions: { ...form.manualDeductions, other: e.target.value } })} placeholder="Other" style={{ ...s.inputSm, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} />
              </div>
            </div>
            
            <button type="submit" style={{ ...s.submitBtn, background: theme.gradient1 }}>🧮 {t('calculateSalary')}</button>
          </form>
        </div>
      )}

      {/* Payroll Cards */}
      <div style={s.list}>
        {currentList.map((pay, index) => (
          <div key={pay._id} style={{ ...s.card, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, animationDelay: `${index * 0.05}s` }}>
            {/* Card Header */}
            <div style={s.cardHeader}>
              <div style={s.cardHeaderLeft}>
                <div style={{ ...s.payAvatar, background: theme.gradient1 }}>💼</div>
                <div>
                  <h4 style={{ color: theme.text, fontWeight: '700', fontSize: '15px' }}>{pay.user?.name || user?.name}</h4>
                  <p style={{ color: theme.textMuted, fontSize: '12px' }}>{pay.month}/{pay.year}</p>
                </div>
              </div>
              <span style={{ ...s.statusChip, background: statusStyles[pay.status]?.bg, color: statusStyles[pay.status]?.color }}>
                {statusStyles[pay.status]?.icon} {getStatusText(pay.status)}
              </span>
            </div>

            {/* Summary */}
            <div style={{ ...s.summaryGrid, borderColor: theme.border }}>
              <div style={s.summaryItem}>
                <p style={{ color: theme.textMuted, fontSize: '10px', fontWeight: '600', textTransform: 'uppercase' }}>{t('basicSalary')}</p>
                <p style={{ color: theme.text, fontSize: '14px', fontWeight: '800' }}>{fm(pay.basicSalary)}</p>
              </div>
              <div style={s.summaryItem}>
                <p style={{ color: theme.textMuted, fontSize: '10px', fontWeight: '600', textTransform: 'uppercase' }}>+{t('totalAllowances')}</p>
                <p style={{ color: theme.success, fontSize: '14px', fontWeight: '800' }}>{fm(pay.totalAllowances)}</p>
              </div>
              <div style={s.summaryItem}>
                <p style={{ color: theme.textMuted, fontSize: '10px', fontWeight: '600', textTransform: 'uppercase' }}>-{t('totalDeductions')}</p>
                <p style={{ color: theme.danger, fontSize: '14px', fontWeight: '800' }}>{fm(pay.totalDeductions)}</p>
              </div>
            </div>

            {/* Net Salary */}
            <div style={{ ...s.netBar, background: theme.primaryLight }}>
              <span style={{ color: theme.primary, fontWeight: '700', fontSize: '13px' }}>{t('netSalary')}</span>
              <span style={{ color: theme.primary, fontWeight: '900', fontSize: '20px' }}>{fm(pay.netSalary)} Ks</span>
            </div>

            {/* SSB & Tax Info */}
            {(pay.ssb?.employeeContribution > 0 || pay.incomeTax?.taxAmount > 0) && (
              <div style={s.infoChips}>
                {pay.ssb?.employeeContribution > 0 && (
                  <span style={{ ...s.infoChip, background: theme.infoLight, color: theme.info }}>
                    🛡️ SSB: {fm(pay.ssb.employeeContribution)}
                  </span>
                )}
                {pay.incomeTax?.taxAmount > 0 && (
                  <span style={{ ...s.infoChip, background: theme.warningLight, color: theme.warning }}>
                    📊 Tax: {fm(pay.incomeTax.taxAmount)}
                  </span>
                )}
                {pay.overtime?.totalAmount > 0 && (
                  <span style={{ ...s.infoChip, background: theme.successLight, color: theme.success }}>
                    ⏰ OT: {fm(pay.overtime.totalAmount)}
                  </span>
                )}
              </div>
            )}

            {/* Payment Method Badge */}
            {pay.status === 'paid' && pay.paymentMethod && (
              <div style={{ ...s.paidBadge, background: theme.successLight }}>
                <span style={{ color: theme.success, fontSize: '12px', fontWeight: '700' }}>
                  💳 Paid via {pay.paymentMethod?.toUpperCase()}
                  {pay.paymentDetails?.transactionId && ` • ${pay.paymentDetails.transactionId}`}
                </span>
              </div>
            )}

            {/* Actions */}
            <div style={s.actionRow}>
              {/* PDF Download - Everyone can download their own */}
              <button onClick={() => handleDownloadPDF(pay._id)} style={{ ...s.pdfBtn, background: theme.dangerLight, color: theme.danger }}>
                📄 PDF
              </button>
              
              <button onClick={() => setShowDetail(showDetail === pay._id ? null : pay._id)} style={{ ...s.detailBtn, background: theme.cardBgHover, color: theme.text, border: `1px solid ${theme.cardBorder}` }}>
                {showDetail === pay._id ? '▲ Hide' : '▼ Detail'}
              </button>
              
              {isAdmin && pay.status === 'draft' && (
                <button onClick={() => handleConfirm(pay._id)} style={{ ...s.confirmBtn, background: theme.infoLight, color: theme.info }}>
                  ✔️ {t('confirm')}
                </button>
              )}
              
              {isAdmin && pay.status === 'confirmed' && (
                <button onClick={() => setShowPayDialog(pay._id)} style={{ ...s.payBtnSmall, background: theme.successLight, color: theme.success }}>
                  💵 {t('paid')}
                </button>
              )}
            </div>

            {/* Detail Expand */}
            {showDetail === pay._id && (
              <div style={{ ...s.detailBox, borderColor: theme.border }}>
                <div style={s.detailGrid}>
                  <div style={s.detailSection}>
                    <p style={{ color: theme.success, fontWeight: '700', fontSize: '12px', marginBottom: '8px' }}>📈 Earnings</p>
                    <div style={s.detailRow}><span style={{ color: theme.textMuted }}>Basic</span><span style={{ color: theme.text }}>{fm(pay.basicSalary)}</span></div>
                    {pay.allowances?.transport > 0 && <div style={s.detailRow}><span style={{ color: theme.textMuted }}>Transport</span><span style={{ color: theme.text }}>{fm(pay.allowances.transport)}</span></div>}
                    {pay.allowances?.meal > 0 && <div style={s.detailRow}><span style={{ color: theme.textMuted }}>Meal</span><span style={{ color: theme.text }}>{fm(pay.allowances.meal)}</span></div>}
                    {pay.allowances?.housing > 0 && <div style={s.detailRow}><span style={{ color: theme.textMuted }}>Housing</span><span style={{ color: theme.text }}>{fm(pay.allowances.housing)}</span></div>}
                    {pay.overtime?.totalAmount > 0 && <div style={s.detailRow}><span style={{ color: theme.textMuted }}>Overtime</span><span style={{ color: theme.text }}>{fm(pay.overtime.totalAmount)}</span></div>}
                    <div style={{ ...s.detailRow, fontWeight: '800' }}><span style={{ color: theme.success }}>Gross</span><span style={{ color: theme.success }}>{fm(pay.grossSalary)}</span></div>
                  </div>
                  
                  <div style={s.detailSection}>
                    <p style={{ color: theme.danger, fontWeight: '700', fontSize: '12px', marginBottom: '8px' }}>📉 Deductions</p>
                    {pay.deductions?.ssb > 0 && <div style={s.detailRow}><span style={{ color: theme.textMuted }}>SSB (2%)</span><span style={{ color: theme.text }}>{fm(pay.deductions.ssb)}</span></div>}
                    {pay.deductions?.tax > 0 && <div style={s.detailRow}><span style={{ color: theme.textMuted }}>Tax</span><span style={{ color: theme.text }}>{fm(pay.deductions.tax)}</span></div>}
                    {pay.deductions?.latePenalty > 0 && <div style={s.detailRow}><span style={{ color: theme.textMuted }}>Late</span><span style={{ color: theme.text }}>{fm(pay.deductions.latePenalty)}</span></div>}
                    {pay.deductions?.absentPenalty > 0 && <div style={s.detailRow}><span style={{ color: theme.textMuted }}>Absent</span><span style={{ color: theme.text }}>{fm(pay.deductions.absentPenalty)}</span></div>}
                    {pay.deductions?.advanceSalary > 0 && <div style={s.detailRow}><span style={{ color: theme.textMuted }}>Advance</span><span style={{ color: theme.text }}>{fm(pay.deductions.advanceSalary)}</span></div>}
                    <div style={{ ...s.detailRow, fontWeight: '800' }}><span style={{ color: theme.danger }}>Total</span><span style={{ color: theme.danger }}>{fm(pay.totalDeductions)}</span></div>
                  </div>
                </div>
                
                <div style={{ ...s.attendSummary, background: theme.bgTertiary, borderRadius: '12px', padding: '12px', marginTop: '10px' }}>
                  <p style={{ color: theme.text, fontWeight: '700', fontSize: '12px', marginBottom: '6px' }}>📅 Attendance</p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ color: theme.textSecondary, fontSize: '11px' }}>📆 Working: {pay.workingDays}</span>
                    <span style={{ color: theme.success, fontSize: '11px' }}>✓ Present: {pay.presentDays}</span>
                    <span style={{ color: theme.warning, fontSize: '11px' }}>⏰ Late: {pay.lateDays}</span>
                    <span style={{ color: theme.danger, fontSize: '11px' }}>✗ Absent: {pay.absentDays}</span>
                    <span style={{ color: theme.info, fontSize: '11px' }}>🏖️ Leave: {pay.leaveDays}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {currentList.length === 0 && <div style={{ ...s.empty, color: theme.textMuted }}><span style={{ fontSize: '36px' }}>📭</span><p>{t('noRecords')}</p></div>}
      </div>

      {/* Payment Dialog */}
      {showPayDialog && (
        <div style={{ ...s.overlay, background: theme.overlay }} onClick={() => setShowPayDialog(null)}>
          <div style={{ ...s.dialog, background: theme.bgSecondary, border: `1px solid ${theme.cardBorder}` }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: theme.text, fontWeight: '800', marginBottom: '20px' }}>💳 {t('payVia')}</h3>
            
            <div style={s.payMethodGrid}>
              {paymentMethods.map((method) => (
                <button key={method.value} onClick={() => setPayForm({ ...payForm, paymentMethod: method.value })}
                  style={{
                    ...s.payMethodBtn,
                    background: payForm.paymentMethod === method.value ? `${method.color}20` : theme.cardBg,
                    border: `2px solid ${payForm.paymentMethod === method.value ? method.color : theme.cardBorder}`,
                    color: payForm.paymentMethod === method.value ? method.color : theme.text,
                  }}>
                  {method.label}
                </button>
              ))}
            </div>
            
            <input type="text" value={payForm.transactionId} onChange={(e) => setPayForm({ ...payForm, transactionId: e.target.value })}
              placeholder="Transaction ID" style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, marginTop: '12px' }} />
            <input type="text" value={payForm.accountNumber} onChange={(e) => setPayForm({ ...payForm, accountNumber: e.target.value })}
              placeholder="Account Number (optional)" style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} />
            <input type="text" value={payForm.note} onChange={(e) => setPayForm({ ...payForm, note: e.target.value })}
              placeholder="Note (optional)" style={{ ...s.input, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} />
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => setShowPayDialog(null)} style={{ ...s.cancelDialogBtn, background: theme.cardBg, color: theme.textSecondary, border: `1px solid ${theme.cardBorder}` }}>
                {t('cancel')}
              </button>
              <button onClick={() => handlePay(showPayDialog)} style={{ ...s.confirmPayBtn, background: theme.gradient1 }}>
                ✅ Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
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
  
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tab: { padding: '12px 20px', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', flex: 1, textAlign: 'center' },
  
  formCard: { padding: '24px', borderRadius: '20px', marginBottom: '20px', animation: 'slideUp 0.3s ease-out' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { width: '100%', padding: '14px 18px', borderRadius: '14px', fontSize: '14px', boxSizing: 'border-box', fontWeight: '500' },
  inputSm: { width: '100%', padding: '12px 14px', borderRadius: '12px', fontSize: '13px', boxSizing: 'border-box', fontWeight: '500' },
  gridRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  subSection: { padding: '14px', borderRadius: '14px', border: '1px solid', display: 'flex', flexDirection: 'column', gap: '8px' },
  submitBtn: { width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },
  
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { padding: '20px', borderRadius: '20px', animation: 'fadeIn 0.4s ease-out' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  cardHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  payAvatar: { width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  statusChip: { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '12px 0', borderTop: '1px solid', borderBottom: '1px solid', marginBottom: '12px' },
  summaryItem: { textAlign: 'center' },
  
  netBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '14px', marginBottom: '10px' },
  
  infoChips: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' },
  infoChip: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  
  paidBadge: { padding: '8px 14px', borderRadius: '10px', marginBottom: '10px', textAlign: 'center' },
  
  actionRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  pdfBtn: { padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '12px' },
  detailBtn: { padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
  confirmBtn: { padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '12px' },
  payBtnSmall: { padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '12px' },
  
  detailBox: { marginTop: '14px', paddingTop: '14px', borderTop: '1px solid' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  detailSection: {},
  detailRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' },
  
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' },
  dialog: { width: '100%', maxWidth: '420px', padding: '28px', borderRadius: '24px', animation: 'slideUp 0.3s ease-out' },
  
  payMethodGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' },
  payMethodBtn: { padding: '14px 8px', borderRadius: '14px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', textAlign: 'center' },
  
  cancelDialogBtn: { flex: 1, padding: '14px', borderRadius: '14px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  confirmPayBtn: { flex: 2, padding: '14px', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' },
  
  empty: { textAlign: 'center', padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
};

export default Payroll;