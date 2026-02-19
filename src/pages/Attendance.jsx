import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import API from '../services/api';

const Attendance = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [attendances, setAttendances] = useState([]);
  const [myAttendances, setMyAttendances] = useState([]);
  const [tab, setTab] = useState('today');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        API.get('/attendance'),
        API.get('/attendance/my')
      ]);
      setAttendances(allRes.data.data);
      setMyAttendances(myRes.data.data);
    } catch (error) {
      console.log('Error:', error.message);
    }
  };

  return (
    <div style={{ ...s.container, background: theme.gradientBg, minHeight: '100vh' }}>
      <div style={s.header}>
        <div>
          <h1 style={{ ...s.title, color: theme.text }}>📊 {t('attendance')}</h1>
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ ...s.backBtn, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}>
          ← {t('back')}
        </button>
      </div>

      <div style={s.tabs}>
        {['today', 'my'].map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              ...s.tab,
              ...(tab === key ? {
                background: theme.gradient1,
                color: 'white',
                boxShadow: '0 4px 15px rgba(129, 140, 248, 0.3)',
              } : {
                background: theme.cardBg,
                color: theme.textSecondary,
                border: `1px solid ${theme.cardBorder}`,
              })
            }}
          >
            {key === 'today' ? `📋 ${t('todayAttendance')}` : `📁 ${t('records')}`}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <div style={s.list}>
          <div style={{ ...s.listHeader, color: theme.textSecondary }}>
            {t('todayAttendance')} — {new Date().toISOString().split('T')[0]}
          </div>
          {attendances.map((att, index) => (
            <div key={att._id} style={{ ...s.card, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, animationDelay: `${index * 0.05}s` }}>
              <div style={s.cardLeft}>
                <div style={{ ...s.cardAvatar, background: theme.gradient1 }}>
                  {att.user?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h4 style={{ color: theme.text, fontWeight: '700', fontSize: '15px' }}>{att.user?.name || 'Unknown'}</h4>
                  <p style={{ color: theme.textMuted, fontSize: '12px' }}>{att.user?.phone}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  ...s.statusChip,
                  background: att.status === 'present' ? theme.successLight : theme.warningLight,
                  color: att.status === 'present' ? theme.success : theme.warning,
                }}>
                  {att.status === 'present' ? '● ' + t('onTime') : '● ' + t('late')}
                </span>
                <p style={{ fontSize: '11px', color: theme.textMuted, marginTop: '6px' }}>
                  {att.checkIn?.time ? new Date(att.checkIn.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  {' → '}
                  {att.checkOut?.time ? new Date(att.checkOut.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '...'}
                </p>
              </div>
            </div>
          ))}
          {attendances.length === 0 && <div style={{ ...s.empty, color: theme.textMuted }}><span style={{ fontSize: '36px' }}>📭</span><p>{t('noRecords')}</p></div>}
        </div>
      )}

      {tab === 'my' && (
        <div style={s.list}>
          <div style={{ ...s.listHeader, color: theme.textSecondary }}>{t('records')}</div>
          {myAttendances.map((att, index) => (
            <div key={att._id} style={{ ...s.card, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, animationDelay: `${index * 0.05}s` }}>
              <div style={s.cardLeft}>
                <div style={{ ...s.dateBadge, background: theme.primaryLight, color: theme.primary }}>
                  {att.date?.split('-')[2]}
                </div>
                <div>
                  <p style={{ color: theme.text, fontWeight: '700', fontSize: '14px' }}>{att.date}</p>
                  <p style={{ color: att.status === 'present' ? theme.success : theme.warning, fontSize: '12px', fontWeight: '600' }}>
                    {att.status === 'present' ? t('onTime') : t('late')}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '18px', fontWeight: '900', color: theme.text }}>{att.workHours}h</p>
                <p style={{ fontSize: '11px', color: theme.textMuted }}>
                  {att.checkIn?.time ? new Date(att.checkIn.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  {' → '}
                  {att.checkOut?.time ? new Date(att.checkOut.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                </p>
              </div>
            </div>
          ))}
          {myAttendances.length === 0 && <div style={{ ...s.empty, color: theme.textMuted }}><span style={{ fontSize: '36px' }}>📭</span><p>{t('noRecords')}</p></div>}
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
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tab: { padding: '12px 20px', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', flex: 1, textAlign: 'center', transition: 'all 0.2s' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  listHeader: { fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', paddingLeft: '4px' },
  card: { padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeIn 0.4s ease-out' },
  cardLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  cardAvatar: { width: '42px', height: '42px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '16px' },
  dateBadge: { width: '42px', height: '42px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px' },
  statusChip: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  empty: { textAlign: 'center', padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
};

export default Attendance;