import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext.jsx';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === 'owner' || user?.role === 'hr';

  const tabs = [
    { path: '/dashboard', label: t('attendance'), icon: '🕐' },
    { path: '/leaves', label: t('leave'), icon: '📅' },
    { path: '/employees', label: t('employees'), icon: '👥', admin: true },
    { path: '/payroll', label: t('salary'), icon: '💰', admin: true },
    { path: '/profile', label: t('profile'), icon: '👤' }
  ];

  const filteredTabs = tabs.filter(tab => !tab.admin || isAdmin);

  return (
    <div style={styles.container}>
      {filteredTabs.map((tab) => (
        <div
          key={tab.path}
          onClick={() => navigate(tab.path)}
          style={{
            ...styles.tab,
            color: location.pathname === tab.path ? '#1a73e8' : '#999'
          }}
        >
          <span style={styles.icon}>{tab.icon}</span>
          <span style={{
            ...styles.label,
            fontWeight: location.pathname === tab.path ? 'bold' : 'normal'
          }}>{tab.label}</span>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '8px 0',
    paddingBottom: 'env(safe-area-inset-bottom, 8px)',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '4px 8px'
  },
  icon: { fontSize: '22px', marginBottom: '2px' },
  label: { fontSize: '11px' }
};

export default BottomNav;