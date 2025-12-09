'use client';

import { useMemo, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { getFilterTagStyles, getFilterTagHoverStyles, getDepartmentColors } from '@/lib/filter-colors';
import { cn } from '@/lib/utils';

interface FilterTagProps {
  label: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
}

export function FilterTag({ label, value, isSelected, onClick }: FilterTagProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  const baseStyles = useMemo(() => getFilterTagStyles(value, isSelected, isDark), [value, isSelected, isDark]);
  const hoverStyles = useMemo(() => getFilterTagHoverStyles(value, isSelected, isDark), [value, isSelected, isDark]);
  const colors = useMemo(() => getDepartmentColors(value, isDark), [value, isDark]);

  if (!mounted) {
    // Return a placeholder to avoid hydration mismatch
    return (
      <button
        type="button"
        className="px-3 py-1.5 text-xs font-medium rounded-full border bg-white dark:bg-[#1A1F27] text-gray-700 dark:text-white border-gray-300 dark:border-[rgba(255,255,255,0.06)]"
        disabled
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        isSelected ? 'focus:ring-offset-white dark:focus:ring-offset-gray-800' : ''
      )}
      style={baseStyles}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, hoverStyles);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, baseStyles);
      }}
    >
      {label}
    </button>
  );
}

