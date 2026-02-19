import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isAdmin = user?.role === 'owner' || user?.role === 'hr';

  const tabs = [
    { path: '/dashboard', label: t('attendance'), icon: '🏠', activeIcon: '🏠' },
    { path: '/leaves', label: t('leave'), icon: '📅', activeIcon: '📅' },
    { path: '/employees', label: t('employees'), icon: '👥', activeIcon: '👥', admin: true },
    { path: '/payroll', label: t('salary'), icon: '💰', activeIcon: '💰', admin: true },
    { path: '/profile', label: t('profile'), icon: '👤', activeIcon: '👤' }
  ];

  const filteredTabs = tabs.filter(tab => !tab.admin || isAdmin);

  return (
    <div style={{
      ...styles.container,
      background: theme.cardBg,
      backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
      borderTop: `1px solid ${theme.cardBorder}`,
    }}>
      {filteredTabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <div
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={styles.tab}
          >
            {isActive && <div style={{ ...styles.activeIndicator, background: theme.gradient1 }}></div>}
            <span style={{
              ...styles.icon,
              transform: isActive ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              {isActive ? tab.activeIcon : tab.icon}
            </span>
            <span style={{
              ...styles.label,
              color: isActive ? theme.primary : theme.textMuted,
              fontWeight: isActive ? '700' : '500',
            }}>
              {tab.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '8px 0 0',
    paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
    zIndex: 1000,
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '6px 12px',
    position: 'relative',
    minWidth: '56px',
  },
  activeIndicator: {
    position: 'absolute',
    top: '-8px',
    width: '24px',
    height: '3px',
    borderRadius: '2px',
  },
  icon: { fontSize: '22px', marginBottom: '3px' },
  label: { fontSize: '10px', letterSpacing: '0.2px' },
};

export default BottomNav;