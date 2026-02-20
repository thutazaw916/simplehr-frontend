import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import Icons from './Icons';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { theme } = useTheme();

  const tabs = [
    { path: '/attendance', label: t('attendance'), icon: 'attendance', activeColor: '#4da6ff' },
    { path: '/leaves', label: t('leave'), icon: 'leave', activeColor: '#ff4d6a' },
    { path: '/employees', label: t('employees'), icon: 'employees', activeColor: '#4da6ff' },
    { path: '/payroll', label: t('salary'), icon: 'salary', activeColor: '#ffd700' },
    { path: '/profile', label: t('profile'), icon: 'profile', activeColor: '#4da6ff' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '500px',
      background: theme.bottomNavBg || 'rgba(10, 10, 15, 0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${theme.cardBorder}`,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '6px 0 10px',
      zIndex: 1000,
    }}>
      {tabs.map((tab) => {
        const active = isActive(tab.path);
        const color = active ? tab.activeColor : (theme.textMuted || '#555');

        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '12px',
              position: 'relative',
              transition: 'all 0.2s',
            }}
          >
            {/* Glow effect */}
            {active && (
              <div style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: `${tab.activeColor}15`,
                filter: `blur(10px)`,
                zIndex: -1,
              }} />
            )}

            {/* Icon */}
            <div style={{
              filter: active ? `drop-shadow(0 0 6px ${tab.activeColor}60)` : 'none',
              transition: 'all 0.2s',
              transform: active ? 'scale(1.1)' : 'scale(1)',
            }}>
              {Icons[tab.icon](active ? 26 : 22, color)}
            </div>

            {/* Label */}
            <span style={{
              fontSize: '10px',
              fontWeight: active ? '700' : '500',
              color: color,
              letterSpacing: '0.3px',
              transition: 'all 0.2s',
            }}>
              {tab.label}
            </span>

            {/* Active dot */}
            {active && (
              <div style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: tab.activeColor,
                boxShadow: `0 0 6px ${tab.activeColor}`,
                marginTop: '1px',
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;