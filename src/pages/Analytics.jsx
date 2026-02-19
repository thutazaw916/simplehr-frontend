import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import API from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, Legend, Area, AreaChart
} from 'recharts';

const Analytics = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [tab, setTab] = useState('kpi');
  const [kpiData, setKpiData] = useState(null);
  const [leaveData, setLeaveData] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchAll(); }, [selectedMonth, selectedYear]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [kpiRes, leaveRes, salaryRes] = await Promise.all([
        API.get(`/analytics/kpi?month=${selectedMonth}&year=${selectedYear}`),
        API.get('/analytics/leaves'),
        API.get(`/analytics/salary?year=${selectedYear}`),
      ]);
      setKpiData(kpiRes.data.data);
      setLeaveData(leaveRes.data.data);
      setSalaryData(salaryRes.data.data);
    } catch (error) {
      console.log('Analytics Error:', error.message);
    }
    setLoading(false);
  };

  const fm = (n) => Number(n || 0).toLocaleString();

  const COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa'];

  const gradeColors = {
    'A+': '#34d399', 'A': '#34d399', 'B+': '#60a5fa', 'B': '#60a5fa',
    'C': '#fbbf24', 'D': '#f87171', 'F': '#ef4444'
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: theme.textMuted }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', animation: 'pulse 1.5s ease-in-out infinite' }}>📊</div>
        <p style={{ marginTop: '10px' }}>{t('loading')}</p>
      </div>
    </div>
  );

  return (
    <div style={{ ...s.container, background: theme.gradientBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={s.header}>
        <h1 style={{ ...s.title, color: theme.text }}>📊 Analytics</h1>
        <button onClick={() => navigate('/dashboard')} style={{ ...s.backBtn, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}>
          ← {t('back')}
        </button>
      </div>

      {/* Month/Year Selector */}
      <div style={{ ...s.selectorRow, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
          style={{ ...s.select, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString('en-US', { month: 'long' })}</option>
          ))}
        </select>
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
          style={{ ...s.select, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }}>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {[
          { key: 'kpi', label: '🎯 KPI', icon: '🎯' },
          { key: 'leave', label: '🏖️ Leave', icon: '🏖️' },
          { key: 'salary', label: '💰 Salary', icon: '💰' },
        ].map((item) => (
          <button key={item.key} onClick={() => setTab(item.key)} style={{
            ...s.tab,
            ...(tab === item.key ? { background: theme.gradient1, color: 'white', boxShadow: '0 4px 15px rgba(129,140,248,0.3)' } : { background: theme.cardBg, color: theme.textSecondary, border: `1px solid ${theme.cardBorder}` })
          }}>{item.label}</button>
        ))}
      </div>

      {/* ========== KPI TAB ========== */}
      {tab === 'kpi' && kpiData && (
        <div>
          {/* KPI Summary Cards */}
          <div style={s.summaryGrid}>
            <div style={{ ...s.summaryCard, background: theme.primaryLight, border: `1px solid ${theme.primaryGlow}` }}>
              <p style={{ color: theme.textMuted, fontSize: '11px', fontWeight: '600' }}>AVG KPI</p>
              <h2 style={{ color: theme.primary, fontWeight: '900', fontSize: '28px' }}>{kpiData.summary?.avgKPI}</h2>
              <p style={{ color: theme.textSecondary, fontSize: '11px' }}>/ 100</p>
            </div>
            <div style={{ ...s.summaryCard, background: theme.successLight }}>
              <p style={{ color: theme.textMuted, fontSize: '11px', fontWeight: '600' }}>Present</p>
              <h2 style={{ color: theme.success, fontWeight: '900', fontSize: '28px' }}>{kpiData.summary?.totalPresent}</h2>
              <p style={{ color: theme.textSecondary, fontSize: '11px' }}>days</p>
            </div>
            <div style={{ ...s.summaryCard, background: theme.warningLight }}>
              <p style={{ color: theme.textMuted, fontSize: '11px', fontWeight: '600' }}>Late</p>
              <h2 style={{ color: theme.warning, fontWeight: '900', fontSize: '28px' }}>{kpiData.summary?.totalLate}</h2>
              <p style={{ color: theme.textSecondary, fontSize: '11px' }}>days</p>
            </div>
            <div style={{ ...s.summaryCard, background: theme.dangerLight }}>
              <p style={{ color: theme.textMuted, fontSize: '11px', fontWeight: '600' }}>Absent</p>
              <h2 style={{ color: theme.danger, fontWeight: '900', fontSize: '28px' }}>{kpiData.summary?.totalAbsent}</h2>
              <p style={{ color: theme.textSecondary, fontSize: '11px' }}>days</p>
            </div>
          </div>

          {/* KPI Bar Chart */}
          <div style={{ ...s.chartCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            <h3 style={{ color: theme.text, fontWeight: '800', fontSize: '15px', marginBottom: '16px' }}>🎯 Employee KPI Scores</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={kpiData.employees?.slice(0, 10)} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="name" tick={{ fill: theme.textMuted, fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fill: theme.textMuted, fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: theme.bgSecondary, border: `1px solid ${theme.cardBorder}`, borderRadius: '12px', color: theme.text }}
                  formatter={(value) => [`${value} pts`, 'KPI Score']}
                />
                <Bar dataKey="kpi.score" radius={[6, 6, 0, 0]}>
                  {kpiData.employees?.slice(0, 10).map((entry, index) => (
                    <Cell key={index} fill={gradeColors[entry.kpi.grade] || '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* KPI Breakdown Pie */}
          {kpiData.employees?.length > 0 && (
            <div style={{ ...s.chartCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
              <h3 style={{ color: theme.text, fontWeight: '800', fontSize: '15px', marginBottom: '16px' }}>📊 Grade Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={(() => {
                      const grades = {};
                      kpiData.employees.forEach(e => {
                        grades[e.kpi.grade] = (grades[e.kpi.grade] || 0) + 1;
                      });
                      return Object.entries(grades).map(([grade, count]) => ({ name: grade, value: count }));
                    })()}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {Object.keys(gradeColors).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: theme.bgSecondary, border: `1px solid ${theme.cardBorder}`, borderRadius: '12px', color: theme.text }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Employee KPI List */}
          <div style={{ ...s.listCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            <h3 style={{ color: theme.text, fontWeight: '800', fontSize: '15px', marginBottom: '14px' }}>🏆 Employee Rankings</h3>
            {kpiData.employees?.map((emp, index) => (
              <div key={emp._id} style={{ ...s.empRow, borderColor: theme.border }}>
                <div style={s.empLeft}>
                  <span style={{
                    ...s.rankBadge,
                    background: index === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
                      index === 1 ? 'linear-gradient(135deg, #d1d5db, #9ca3af)' :
                        index === 2 ? 'linear-gradient(135deg, #b45309, #92400e)' : theme.cardBgHover,
                    color: index < 3 ? 'white' : theme.textSecondary,
                  }}>{index + 1}</span>
                  <div>
                    <p style={{ color: theme.text, fontWeight: '700', fontSize: '14px' }}>{emp.name}</p>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ color: theme.success, fontSize: '10px', fontWeight: '600' }}>✓{emp.attendance.presentDays}</span>
                      <span style={{ color: theme.warning, fontSize: '10px', fontWeight: '600' }}>⏰{emp.attendance.lateDays}</span>
                      <span style={{ color: theme.danger, fontSize: '10px', fontWeight: '600' }}>✗{emp.attendance.absentDays}</span>
                      <span style={{ color: theme.info, fontSize: '10px', fontWeight: '600' }}>🏖️{emp.attendance.leaveDays}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    ...s.gradeBadge,
                    background: gradeColors[emp.kpi.grade] + '20',
                    color: gradeColors[emp.kpi.grade],
                    border: `1px solid ${gradeColors[emp.kpi.grade]}40`,
                  }}>{emp.kpi.grade}</span>
                  <p style={{ color: theme.text, fontWeight: '900', fontSize: '18px', marginTop: '2px' }}>{emp.kpi.score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== LEAVE TAB ========== */}
      {tab === 'leave' && leaveData && (
        <div>
          {/* Leave Summary */}
          <div style={s.summaryGrid}>
            <div style={{ ...s.summaryCard, background: theme.infoLight }}>
              <p style={{ color: theme.textMuted, fontSize: '11px', fontWeight: '600' }}>🏖️ Casual</p>
              <h2 style={{ color: theme.info, fontWeight: '900', fontSize: '24px' }}>{leaveData.summary?.totalCasualUsed}</h2>
              <p style={{ color: theme.textSecondary, fontSize: '10px' }}>days used</p>
            </div>
            <div style={{ ...s.summaryCard, background: theme.dangerLight }}>
              <p style={{ color: theme.textMuted, fontSize: '11px', fontWeight: '600' }}>🤒 Sick</p>
              <h2 style={{ color: theme.danger, fontWeight: '900', fontSize: '24px' }}>{leaveData.summary?.totalSickUsed}</h2>
              <p style={{ color: theme.textSecondary, fontSize: '10px' }}>days used</p>
            </div>
            <div style={{ ...s.summaryCard, background: theme.primaryLight }}>
              <p style={{ color: theme.textMuted, fontSize: '11px', fontWeight: '600' }}>✈️ Earned</p>
              <h2 style={{ color: theme.primary, fontWeight: '900', fontSize: '24px' }}>{leaveData.summary?.totalEarnedUsed}</h2>
              <p style={{ color: theme.textSecondary, fontSize: '10px' }}>days used</p>
            </div>
            <div style={{ ...s.summaryCard, background: theme.warningLight }}>
              <p style={{ color: theme.textMuted, fontSize: '11px', fontWeight: '600' }}>💤 Unpaid</p>
              <h2 style={{ color: theme.warning, fontWeight: '900', fontSize: '24px' }}>{leaveData.summary?.totalUnpaidUsed}</h2>
              <p style={{ color: theme.textSecondary, fontSize: '10px' }}>days used</p>
            </div>
          </div>

          {/* Leave Bar Chart */}
          <div style={{ ...s.chartCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            <h3 style={{ color: theme.text, fontWeight: '800', fontSize: '15px', marginBottom: '16px' }}>🏖️ Leave Usage by Employee</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={leaveData.employees?.filter(e => e.totalUsed > 0)} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="name" tick={{ fill: theme.textMuted, fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fill: theme.textMuted, fontSize: 10 }} />
                <Tooltip contentStyle={{ background: theme.bgSecondary, border: `1px solid ${theme.cardBorder}`, borderRadius: '12px', color: theme.text }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="leaves.casual.used" name="Casual" fill="#60a5fa" radius={[4, 4, 0, 0]} stackId="stack" />
                <Bar dataKey="leaves.sick.used" name="Sick" fill="#f87171" radius={[0, 0, 0, 0]} stackId="stack" />
                <Bar dataKey="leaves.earned.used" name="Earned" fill="#818cf8" radius={[4, 4, 0, 0]} stackId="stack" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Employee Leave Detail List */}
          <div style={{ ...s.listCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            <h3 style={{ color: theme.text, fontWeight: '800', fontSize: '15px', marginBottom: '14px' }}>👥 Employee Leave Balance ({leaveData.year})</h3>
            {leaveData.employees?.map((emp) => (
              <div key={emp._id} style={{ ...s.leaveRow, borderColor: theme.border }}>
                <div style={s.leaveRowTop}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ ...s.miniAvatar, background: theme.gradient1 }}>{emp.name?.charAt(0)}</div>
                    <div>
                      <p style={{ color: theme.text, fontWeight: '700', fontSize: '14px' }}>{emp.name}</p>
                      <p style={{ color: theme.textMuted, fontSize: '11px' }}>{emp.role}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: theme.primary, fontWeight: '900', fontSize: '18px' }}>{emp.totalRemaining}</p>
                    <p style={{ color: theme.textMuted, fontSize: '10px' }}>remaining</p>
                  </div>
                </div>
                <div style={s.leaveChips}>
                  <span style={{ ...s.leaveChip, background: theme.infoLight, color: theme.info }}>
                    🏖️ {emp.leaves.casual.used}/{emp.leaves.casual.total}
                  </span>
                  <span style={{ ...s.leaveChip, background: theme.primaryLight, color: theme.primary }}>
                    ✈️ {emp.leaves.earned.used}/{emp.leaves.earned.total}
                  </span>
                  <span style={{ ...s.leaveChip, background: theme.dangerLight, color: theme.danger }}>
                    🤒 {emp.leaves.sick.used}/{emp.leaves.sick.total}
                  </span>
                  {emp.leaves.unpaid?.used > 0 && (
                    <span style={{ ...s.leaveChip, background: theme.warningLight, color: theme.warning }}>
                      💤 {emp.leaves.unpaid.used}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== SALARY TAB ========== */}
      {tab === 'salary' && salaryData && (
        <div>
          {/* Year Total Summary */}
          <div style={{ ...s.yearCard, background: theme.gradient1 }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>
              💰 {selectedYear} Total Salary Expense
            </p>
            <h2 style={{ color: 'white', fontWeight: '900', fontSize: '28px', margin: '6px 0' }}>
              {fm(salaryData.yearTotal?.totalNet)} Ks
            </h2>
            <div style={s.yearStats}>
              <div style={s.yearStat}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>Gross</p>
                <p style={{ color: 'white', fontWeight: '800', fontSize: '13px' }}>{fm(salaryData.yearTotal?.totalGross)}</p>
              </div>
              <div style={s.yearStat}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>SSB</p>
                <p style={{ color: '#fbbf24', fontWeight: '800', fontSize: '13px' }}>{fm(salaryData.yearTotal?.totalSSB)}</p>
              </div>
              <div style={s.yearStat}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>Tax</p>
                <p style={{ color: '#f87171', fontWeight: '800', fontSize: '13px' }}>{fm(salaryData.yearTotal?.totalTax)}</p>
              </div>
              <div style={s.yearStat}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>OT</p>
                <p style={{ color: '#34d399', fontWeight: '800', fontSize: '13px' }}>{fm(salaryData.yearTotal?.totalOT)}</p>
              </div>
            </div>
          </div>

          {/* Monthly Salary Chart */}
          <div style={{ ...s.chartCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            <h3 style={{ color: theme.text, fontWeight: '800', fontSize: '15px', marginBottom: '16px' }}>📈 Monthly Salary Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={salaryData.monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="monthName" tick={{ fill: theme.textMuted, fontSize: 10 }} />
                <YAxis tick={{ fill: theme.textMuted, fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: theme.bgSecondary, border: `1px solid ${theme.cardBorder}`, borderRadius: '12px', color: theme.text }}
                  formatter={(value) => [fm(value) + ' Ks']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="totalGross" name="Gross" stroke="#34d399" fillOpacity={1} fill="url(#colorGross)" />
                <Area type="monotone" dataKey="totalNet" name="Net" stroke="#818cf8" fillOpacity={1} fill="url(#colorNet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Current Month Employee Salaries */}
          <div style={{ ...s.listCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            <h3 style={{ color: theme.text, fontWeight: '800', fontSize: '15px', marginBottom: '14px' }}>
              💼 This Month's Salaries ({salaryData.currentMonth}/{selectedYear})
            </h3>
            {salaryData.employeeSalaries?.length > 0 ? salaryData.employeeSalaries.map((emp) => (
              <div key={emp._id} style={{ ...s.salaryRow, borderColor: theme.border }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ ...s.miniAvatar, background: theme.gradient1 }}>💼</div>
                  <div>
                    <p style={{ color: theme.text, fontWeight: '700', fontSize: '14px' }}>{emp.name}</p>
                    <p style={{ color: theme.textMuted, fontSize: '11px' }}>
                      Basic: {fm(emp.basicSalary)} | Allow: +{fm(emp.totalAllowances)} | Ded: -{fm(emp.totalDeductions)}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: theme.success, fontWeight: '900', fontSize: '16px' }}>{fm(emp.netSalary)}</p>
                  <span style={{
                    ...s.statusMini,
                    background: emp.status === 'paid' ? theme.successLight : emp.status === 'confirmed' ? theme.infoLight : theme.warningLight,
                    color: emp.status === 'paid' ? theme.success : emp.status === 'confirmed' ? theme.info : theme.warning,
                  }}>
                    {emp.status === 'paid' ? '✅' : emp.status === 'confirmed' ? '✔️' : '📝'} {emp.status}
                  </span>
                </div>
              </div>
            )) : (
              <p style={{ color: theme.textMuted, textAlign: 'center', padding: '20px', fontSize: '13px' }}>No payroll data for this month</p>
            )}

            {/* Monthly Total */}
            {salaryData.employeeSalaries?.length > 0 && (
              <div style={{ ...s.monthTotal, background: theme.primaryLight }}>
                <span style={{ color: theme.primary, fontWeight: '700', fontSize: '14px' }}>💰 Monthly Total</span>
                <span style={{ color: theme.primary, fontWeight: '900', fontSize: '20px' }}>
                  {fm(salaryData.employeeSalaries.reduce((sum, e) => sum + e.netSalary, 0))} Ks
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  title: { fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' },
  backBtn: { padding: '10px 18px', borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', border: 'none' },

  selectorRow: { display: 'flex', gap: '10px', padding: '12px 16px', borderRadius: '16px', marginBottom: '14px' },
  select: { flex: 1, padding: '10px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },

  tabs: { display: 'flex', gap: '8px', marginBottom: '16px' },
  tab: { padding: '12px 16px', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', flex: 1, textAlign: 'center' },

  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' },
  summaryCard: { padding: '14px 8px', borderRadius: '16px', textAlign: 'center' },

  chartCard: { padding: '20px', borderRadius: '20px', marginBottom: '14px', animation: 'fadeIn 0.5s ease-out' },
  listCard: { padding: '20px', borderRadius: '20px', marginBottom: '14px', animation: 'fadeIn 0.5s ease-out' },

  empRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid' },
  empLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  rankBadge: { width: '28px', height: '28px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px' },
  gradeBadge: { padding: '3px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' },

  leaveRow: { padding: '14px 0', borderBottom: '1px solid' },
  leaveRowTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  leaveChips: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  leaveChip: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  miniAvatar: { width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '14px' },

  yearCard: { padding: '24px', borderRadius: '22px', marginBottom: '14px', textAlign: 'center', boxShadow: '0 8px 40px rgba(129,140,248,0.2)' },
  yearStats: { display: 'flex', justifyContent: 'space-around', marginTop: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '12px' },
  yearStat: { textAlign: 'center' },

  salaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid' },
  statusMini: { padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '700' },
  monthTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '14px', marginTop: '12px' },
};

export default Analytics;