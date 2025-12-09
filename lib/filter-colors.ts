/**
 * Color mapping system for Departments and Professions
 * Supports both Light and Dark themes
 */

export type DepartmentCategory = 'all' | 'designers' | 'developers' | 'managers' | 'marketers' | 'videographers';

export interface ColorPalette {
  default: string;
  hover: string;
  active: string;
}

export interface DepartmentColors {
  light: ColorPalette;
  dark: ColorPalette;
}

// Profession to Department mapping
const PROFESSION_TO_DEPARTMENT: Record<string, DepartmentCategory> = {
  // Designers
  'ui ux designer': 'designers',
  'graphic designer': 'designers',
  'illustrator': 'designers',
  'motion designer': 'designers',
  '3d designer': 'designers',
  'interior designer': 'designers',
  'visualizer': 'designers',
  'web designer': 'designers',
  'wordpress designer': 'designers',
  
  // Developers
  'front end developer': 'developers',
  'back end developer': 'developers',
  'full stack developer': 'developers',
  'mobile developer': 'developers',
  'qa': 'developers',
  'system administrator': 'developers',
  'prompt engineer': 'developers',
  
  // Managers
  'team lead / manager': 'managers',
  'recruiter': 'managers',
  'hr manager': 'managers',
  'project manager': 'managers',
  'content manager': 'managers',
  'financial manager': 'managers',
  'sales manager': 'managers',
  'event manager': 'managers',
  'account manager': 'managers',
  'influencer manager': 'managers',
  'pr manager': 'managers',
  'product manager': 'managers',
  'seo manager': 'managers',
  
  // Marketers
  'media buyer': 'marketers',
  'social media manager': 'marketers',
  'copywriter': 'marketers',
  'marketing roles': 'marketers',
  
  // Videographers
  'video editor': 'videographers',
};

// Color palettes for each department category
const DEPARTMENT_COLORS: Record<DepartmentCategory, DepartmentColors> = {
  all: {
    light: {
      default: '#4B5563', // Gray-600
      hover: '#6B7280',    // Gray-500
      active: '#374151',   // Gray-700
    },
    dark: {
      default: '#9CA3AF',  // Secondary (gray) default
      hover: '#D1D5DB',    // Secondary hover
      active: '#6B7280',   // Secondary active
    },
  },
  designers: {
    light: {
      default: '#6D28D9',  // Purple-700
      hover: '#7C3AED',    // Purple-600
      active: '#5B21B6',   // Purple-800
    },
    dark: {
      default: '#C084FC',  // Tertiary (purple) default
      hover: '#D8B4FE',    // Tertiary hover
      active: '#A855F7',   // Tertiary active
    },
  },
  developers: {
    light: {
      default: '#147857',  // Emerald-700
      hover: '#1FA97A',   // Emerald-600
      active: '#0F5C44',    // Emerald-800
    },
    dark: {
      default: '#22C55E',  // Success (green) default
      hover: '#4ADE80',    // Success hover
      active: '#16A34A',   // Success active
    },
  },
  managers: {
    light: {
      default: '#DC2626',  // Red-600
      hover: '#EF4444',    // Red-500
      active: '#B91C1C',    // Red-700
    },
    dark: {
      default: '#EF4444',  // Delete (red) default
      hover: '#F87171',    // Delete hover
      active: '#DC2626',   // Delete active
    },
  },
  marketers: {
    light: {
      default: '#EC4899',  // Pink-500
      hover: '#F472B6',    // Pink-400
      active: '#DB2777',    // Pink-600
    },
    dark: {
      default: '#FB923C',  // Warning (orange) default
      hover: '#FDBA74',    // Warning hover
      active: '#F97316',   // Warning active
    },
  },
  videographers: {
    light: {
      default: '#F97316',  // Orange-500
      hover: '#FB923C',    // Orange-400
      active: '#EA580C',   // Orange-600
    },
    dark: {
      default: '#38BDF8',  // Info (cyan) default
      hover: '#7DD3FC',    // Info hover
      active: '#0EA5E9',   // Info active
    },
  },
};

/**
 * Get the department category for a given profession
 */
export function getDepartmentForProfession(profession: string | null | undefined): DepartmentCategory {
  if (!profession) return 'all';
  
  const normalized = profession.toLowerCase().trim();
  return PROFESSION_TO_DEPARTMENT[normalized] || 'all';
}

/**
 * Get color palette for a department or profession
 */
export function getDepartmentColors(
  departmentOrProfession: string | null | undefined,
  isDark: boolean = false
): ColorPalette {
  // If it's a profession, map it to a department category
  const category = getDepartmentForProfession(departmentOrProfession);
  
  // If it's already a department name, try to match it
  if (category === 'all' && departmentOrProfession) {
    const normalized = departmentOrProfession.toLowerCase().trim();
    // Check if it matches any category name
    if (normalized.includes('design')) return isDark ? DEPARTMENT_COLORS.designers.dark : DEPARTMENT_COLORS.designers.light;
    if (normalized.includes('develop')) return isDark ? DEPARTMENT_COLORS.developers.dark : DEPARTMENT_COLORS.developers.light;
    if (normalized.includes('manager')) return isDark ? DEPARTMENT_COLORS.managers.dark : DEPARTMENT_COLORS.managers.light;
    if (normalized.includes('market')) return isDark ? DEPARTMENT_COLORS.marketers.dark : DEPARTMENT_COLORS.marketers.light;
    if (normalized.includes('video')) return isDark ? DEPARTMENT_COLORS.videographers.dark : DEPARTMENT_COLORS.videographers.light;
  }
  
  const colors = DEPARTMENT_COLORS[category];
  return isDark ? colors.dark : colors.light;
}

/**
 * Get CSS classes for a filter tag based on department/profession and selection state
 */
export function getFilterTagClasses(
  departmentOrProfession: string | null | undefined,
  isSelected: boolean,
  isDark: boolean = false
): string {
  const colors = getDepartmentColors(departmentOrProfession, isDark);
  
  if (isSelected) {
    return `bg-[${colors.active}] text-white border-[${colors.active}] hover:bg-[${colors.hover}] hover:border-[${colors.hover}]`;
  }
  
  return `bg-white dark:bg-gray-800 text-[${colors.default}] border-[${colors.default}] hover:bg-[${colors.hover}] hover:text-white hover:border-[${colors.hover}] dark:text-[${colors.dark.default}] dark:border-[${colors.dark.default}] dark:hover:bg-[${colors.dark.hover}] dark:hover:text-white dark:hover:border-[${colors.dark.hover}]`;
}

/**
 * Get inline styles for a filter tag (more reliable than Tailwind arbitrary values)
 */
export function getFilterTagStyles(
  departmentOrProfession: string | null | undefined,
  isSelected: boolean,
  isDark: boolean = false
): React.CSSProperties {
  const colors = getDepartmentColors(departmentOrProfession, isDark);
  
  if (isSelected) {
    return {
      backgroundColor: colors.active,
      color: '#FFFFFF',
      borderColor: colors.active,
    };
  }
  
  // Dark theme: use token color with 20% opacity background, white text, token border
  if (isDark) {
    // Convert hex to rgba with 20% opacity
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    return {
      backgroundColor: hexToRgba(colors.default, 0.2),
      color: '#FFFFFF',
      borderColor: colors.default,
      borderWidth: '1px',
    };
  }
  
  return {
    backgroundColor: '#FFFFFF',
    color: colors.default,
    borderColor: colors.default,
  };
}

/**
 * Get hover styles for a filter tag
 */
export function getFilterTagHoverStyles(
  departmentOrProfession: string | null | undefined,
  isSelected: boolean,
  isDark: boolean = false
): React.CSSProperties {
  const colors = getDepartmentColors(departmentOrProfession, isDark);
  
  if (isSelected) {
    return {
      backgroundColor: colors.hover,
      borderColor: colors.hover,
    };
  }
  
  // Dark theme: on hover, use token hover color with higher opacity
  if (isDark) {
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    return {
      backgroundColor: hexToRgba(colors.hover, 0.3),
      borderColor: colors.hover,
      color: '#FFFFFF',
    };
  }
  
  return {
    backgroundColor: colors.hover,
    color: '#FFFFFF',
    borderColor: colors.hover,
  };
}

/**
 * Get CSS custom properties for a filter tag (for use with CSS variables)
 */
export function getFilterTagCSSVars(
  departmentOrProfession: string | null | undefined,
  isDark: boolean = false
): Record<string, string> {
  const colors = getDepartmentColors(departmentOrProfession, isDark);
  
  return {
    '--filter-default': colors.default,
    '--filter-hover': colors.hover,
    '--filter-active': colors.active,
  };
}

