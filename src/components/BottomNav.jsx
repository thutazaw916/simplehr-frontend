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
    { path: '/attendance', label: t('attendance'), icon: 'attendance', color: '#4da6ff' },
    { path: '/leaves', label: t('leave'), icon: 'leave', color: '#ff4d6a' },
    { path: '/employees', label: t('employees'), icon: 'employees', color: '#4da6ff' },
    { path: '/payroll', label: t('salary'), icon: 'salary', color: '#ffd700' },
    { path: '/profile', label: t('profile'), icon: 'profile', color: '#4da6ff' },
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
      zIndex: 1000,
    }}>
      {/* Top Active Indicator Line */}
      <div style={{ position: 'relative', height: '3px', width: '100%' }}>
        {tabs.map((tab, index) => isActive(tab.path) && (
          <div key={tab.path} style={{
            position: 'absolute',
            top: 0,
            left: `${(index / tabs.length) * 100 + (100 / tabs.length / 2) - 5}%`,
            width: '10%',
            height: '3px',
            borderRadius: '0 0 4px 4px',
            background: tab.color,
            boxShadow: `0 0 12px ${tab.color}, 0 0 24px ${tab.color}50`,
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 0 12px',
      }}>
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const color = active ? tab.color : (theme.textMuted || '#555');

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: active ? `${tab.color}12` : 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 14px',
                borderRadius: '14px',
                position: 'relative',
                transition: 'all 0.3s ease',
                transform: active ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              {/* Glow */}
              {active && (
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${tab.color}20 0%, transparent 70%)`,
                  zIndex: -1,
                }} />
              )}

              {/* Icon */}
              <div style={{
                filter: active ? `drop-shadow(0 0 8px ${tab.color}80)` : 'none',
                transition: 'all 0.3s ease',
                transform: active ? 'scale(1.15)' : 'scale(1)',
              }}>
                {Icons[tab.icon](active ? 26 : 22, color)}
              </div>

              {/* Label */}
              <span style={{
                fontSize: active ? '10px' : '9px',
                fontWeight: active ? '800' : '500',
                color: color,
                letterSpacing: active ? '0.5px' : '0.3px',
                transition: 'all 0.3s ease',
              }}>
                {tab.label}
              </span>

              {/* Active Dot */}
              {active && (
                <div style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: tab.color,
                  boxShadow: `0 0 8px ${tab.color}`,
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;