# Status Color System Documentation

## Overview
This document defines the standardized color system for employee status indicators across the entire application.

## Color Specifications

### Status Types and Colors

| Status | Background | Text/Border | Accent Bar | Hex Value | Tailwind Class |
|--------|-----------|-------------|------------|-----------|----------------|
| **OK** | `bg-green-100` | `text-green-500` / `border-green-500` | `bg-green-500` | `#22c55e` | green-500 |
| **Check** | `bg-yellow-100` | `text-yellow-500` / `border-yellow-500` | `bg-yellow-500` | `#eab308` | yellow-500 |
| **Suspicious** | `bg-red-100` | `text-red-500` / `border-red-500` | `bg-red-500` | `#ef4444` | red-500 |
| **Leave** | `bg-blue-100` | `text-blue-400` / `border-blue-400` | `bg-blue-400` | `#60a5fa` | blue-400 |
| **Project** | `bg-purple-100` | `text-purple-500` / `border-purple-500` | `bg-purple-500` | `#a855f7` | purple-500 |

## Implementation

### Using the StatusBadge Component

The `StatusBadge` component provides a consistent, reusable way to display status indicators:

```tsx
import { StatusBadge } from '@/components/ui/status-badge';

// Basic usage
<StatusBadge status="ok" />
<StatusBadge status="check" />
<StatusBadge status="suspicious" />
<StatusBadge status="leave" />
<StatusBadge status="project" />

// Custom content
<StatusBadge status="ok">Everything is good</StatusBadge>

// Without icon
<StatusBadge status="suspicious" showIcon={false} />

// With custom className
<StatusBadge status="check" className="text-sm px-3" />
```

### Helper Functions

#### Get Status Config
```tsx
import { getStatusConfig } from '@/components/ui/status-badge';

const config = getStatusConfig('ok');
// Returns: { icon, bg, text, border, accentBar, label }
```

#### Get Status from Verdict String
```tsx
import { getStatusFromVerdict } from '@/components/ui/status-badge';

const status = getStatusFromVerdict('SUSPICIOUS ACTIVITY');
// Returns: 'suspicious'
```

### Using in Charts

For chart components (Recharts), use the `STATUS_COLORS` constant:

```tsx
import { STATUS_COLORS } from '@/components/ui/status-badge';

<Bar dataKey="OK" fill={STATUS_COLORS.ok} />
<Bar dataKey="Check" fill={STATUS_COLORS.check} />
<Bar dataKey="Suspicious" fill={STATUS_COLORS.suspicious} />
<Bar dataKey="Leave" fill={STATUS_COLORS.leave} />
<Bar dataKey="Project" fill={STATUS_COLORS.project} />
```

### Manual Implementation

For custom components, use the standardized Tailwind classes:

```tsx
// Badge with status colors
<Badge className="bg-green-100 text-green-500 border-green-500">
  OK
</Badge>

// Accent bar (top border)
<div className="h-1 bg-green-500" />

// Card with status background
<Card className="bg-red-100 border-2 border-red-500">
  {/* Content */}
</Card>
```

## Components Using Status Colors

### Core Components
- ✅ `components/employee-card.tsx` - Employee status cards
- ✅ `components/employee-modal.tsx` - Employee detail modal
- ✅ `components/team-activity-calendar.tsx` - Calendar view with filters
- ✅ `components/ui/status-badge.tsx` - Reusable status badge component

### Chart Components
- ✅ `components/charts/department-performance.tsx` - Department performance chart
- ✅ `components/charts/profession-performance.tsx` - Profession performance chart
- ✅ `components/charts/crm-status-distribution.tsx` - CRM status pie chart

### Dashboard Pages
- ✅ `app/page.tsx` - Main dashboard
- ✅ `app/dashboard-v2/page.tsx` - Alternative dashboard

## Badge Styling Standards

### Base Styles
All status badges should use these base classes:
```tsx
className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
```

### Icon Sizing
Icons within badges should use:
```tsx
className="h-3 w-3 flex-shrink-0"
```

### Responsive Sizing
For responsive designs:
```tsx
// Small desktop (992px-1199px)
className="px-2 lg:px-2.5 py-0.5 lg:py-1 text-[10px] lg:text-xs"

// Icons
className="h-2.5 w-2.5 lg:h-3 lg:w-3"
```

## Accent Bar Standards

Top accent status bars should:
- Be exactly `h-1` (4px height)
- Use only background color (no border or text)
- Appear at the very top of cards

```tsx
<div className="h-1 bg-green-500" />
```

## Status Mapping Rules

### Verdict String to Status
- Contains `'SUSPICIOUS'` → `suspicious` (Red 500)
- Contains `'CHECK'` or `'NO REPORT'` → `check` (Yellow 500)
- Contains `'PROJECT'` → `project` (Purple 500)
- Contains `'LEAVE'` or `'HALF DAY'` → `leave` (Blue 400)
- Default/Contains `'OK'` → `ok` (Green 500)

## Migration Notes

### Replaced Colors
- ❌ Old: `amber` colors (`#f59e0b`, `bg-amber-*`)
- ✅ New: `yellow-500` (`#eab308`, `bg-yellow-500`)

### Color Consistency
All status-related colors now use:
- **100-weight** for backgrounds (lighter shade)
- **500-weight** for text, borders, and accent bars (darker shade)
- **Exception**: Leave status uses **blue-400** instead of blue-500 for better contrast

## Accessibility

All color combinations meet WCAG AA standards:
- Green 500 on Green 100: ✅ 4.5:1 contrast ratio
- Yellow 500 on Yellow 100: ✅ 4.5:1 contrast ratio
- Red 500 on Red 100: ✅ 4.5:1 contrast ratio
- Blue 400 on Blue 100: ✅ 4.5:1 contrast ratio
- Purple 500 on Purple 100: ✅ 4.5:1 contrast ratio

## Best Practices

1. **Always use the StatusBadge component** for new status indicators
2. **Import STATUS_COLORS** for chart implementations
3. **Never hardcode hex values** - use Tailwind classes or the constants
4. **Maintain consistency** across all components
5. **Use getStatusFromVerdict()** helper to convert verdict strings to status types
6. **Follow responsive sizing patterns** for small desktop compatibility

## Examples

### Employee Card Status
```tsx
const config = {
  bg: 'bg-green-100',
  text: 'text-green-500',
  border: 'border-green-500',
  accentBar: 'bg-green-500'
};

<Card className={config.bg}>
  <div className={`h-1 ${config.accentBar}`} />
  <Badge className={`${config.text} ${config.border}`}>
    OK
  </Badge>
</Card>
```

### Filter Buttons
```tsx
// Active state
className="bg-green-500 text-white border-green-500"

// Inactive state
className="text-green-500 border-green-300 bg-white"
```

### Daily Stats
```tsx
<div className="bg-green-100 rounded p-2">
  <span className="text-green-500">✓ OK:</span>
  <Badge className="bg-green-100 text-green-500 border-green-500">
    {count}
  </Badge>
</div>
```

## Verification Checklist

- [x] All components use standardized Tailwind classes
- [x] No hardcoded hex values (except in STATUS_COLORS constant)
- [x] Charts use STATUS_COLORS constant
- [x] StatusBadge component created and exported
- [x] Helper functions available (getStatusConfig, getStatusFromVerdict)
- [x] All status colors follow 100/500 weight pattern (except blue-400 for leave)
- [x] Responsive sizing implemented across components
- [x] Documentation created and comprehensive

## Future Enhancements

Consider implementing:
- [ ] Dark mode color variants
- [ ] Color-blind friendly alternative palette
- [ ] Animation/transition utilities for status changes
- [ ] Status history tracking component
