export const Colors = {
  light: {
    primary: '#4f46e5',
    accent: '#fb6f57',
    secondary: '#fbbf24',
    background: '#f9fafb',
    surface: '#ffffff',
    foreground: '#1e1b4b',
    muted: '#6b7280',
    success: '#22c55e',
    warning: '#f97316',
    error: '#ef4444',
    border: '#e5e7eb',
    card: '#ffffff',
    text: {
      primary: '#1e1b4b',
      secondary: '#4b5563',
      muted: '#6b7280',
      inverse: '#ffffff'
    }
  },
  dark: {
    primary: '#6366f1',
    accent: '#fb6f57',
    secondary: '#fbbf24',
    background: '#0f0f23',
    surface: '#1e1b4b',
    foreground: '#f9fafb',
    muted: '#9ca3af',
    success: '#22c55e',
    warning: '#f97316',
    error: '#ef4444',
    border: '#374151',
    card: '#1e1b4b',
    text: {
      primary: '#f9fafb',
      secondary: '#e5e7eb',
      muted: '#9ca3af',
      inverse: '#1e1b4b'
    }
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999
};

export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75
  }
};