const Icons = {
  employees: (size = 28, color = '#4da6ff') => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3.5" stroke={color} strokeWidth="1.8" fill={`${color}20`} />
      <circle cx="16" cy="9" r="2.5" stroke={color} strokeWidth="1.5" fill={`${color}15`} />
      <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill={`${color}10`} />
      <path d="M16 14c2.5 0 5 1.5 5 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  leave: (size = 28, color = '#ff4d6a') => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="17" rx="3" stroke={color} strokeWidth="1.8" fill={`${color}15`} />
      <path d="M8 2v4M16 2v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M3 9h18" stroke={color} strokeWidth="1.5" />
      <path d="M9 14l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  departments: (size = 28, color = '#4dc8ff') => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="15" rx="2" stroke={color} strokeWidth="1.8" fill={`${color}15`} />
      <path d="M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2" stroke={color} strokeWidth="1.8" />
      <rect x="7" y="10" width="4" height="3" rx="0.5" stroke={color} strokeWidth="1.2" fill={`${color}20`} />
      <rect x="13" y="10" width="4" height="3" rx="0.5" stroke={color} strokeWidth="1.2" fill={`${color}20`} />
      <rect x="7" y="15" width="4" height="3" rx="0.5" stroke={color} strokeWidth="1.2" fill={`${color}20`} />
      <rect x="13" y="15" width="4" height="3" rx="0.5" stroke={color} strokeWidth="1.2" fill={`${color}20`} />
    </svg>
  ),

  attendanceRecords: (size = 28, color = '#ffb84d') => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="1.8" fill={`${color}15`} />
      <path d="M8 8h8M8 12h6M8 16h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="15" y="1" width="4" height="4" rx="1" stroke={color} strokeWidth="1.5" fill={`${color}30`} />
      <path d="M16 3h2" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),

  attendance: (size = 28, color = '#4da6ff') => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 10l4-6h10l4 6v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z" stroke={color} strokeWidth="1.8" fill={`${color}12`} />
      <path d="M9 20v-6h6v6" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="11" r="2" stroke={color} strokeWidth="1.5" />
      <path d="M12 9v-1" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10.5 10.5l-.7-.7" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),

  analytics: (size = 28, color = '#4da6ff') => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="14" width="4" height="7" rx="1" stroke={color} strokeWidth="1.5" fill={`${color}20`} />
      <rect x="10" y="9" width="4" height="12" rx="1" stroke={color} strokeWidth="1.5" fill={`${color}30`} />
      <rect x="17" y="4" width="4" height="17" rx="1" stroke={color} strokeWidth="1.5" fill={`${color}20`} />
      <path d="M4 12l5-4 4 2 6-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="4" r="1.5" fill={color} />
    </svg>
  ),

  salary: (size = 28, color = '#ffd700') => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="14" r="8" stroke={color} strokeWidth="1.8" fill={`${color}15`} />
      <path d="M12 10v8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.5 12.5h5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5h-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14.5 15.5h-5c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 6c1-2 3-3 4-3s3 1 4 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  profile: (size = 28, color = '#4da6ff') => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="3" stroke={color} strokeWidth="1.8" fill={`${color}12`} />
      <circle cx="9" cy="10" r="2.5" stroke={color} strokeWidth="1.5" fill={`${color}20`} />
      <path d="M5 18c0-2 2-3.5 4-3.5s4 1.5 4 3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 9h4M15 12h3M15 15h2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export default Icons;