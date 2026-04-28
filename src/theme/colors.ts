export const lightColors = {
  background: '#FFFFFF',
  surface: '#F5F5F7',
  card: '#FFFFFF',
  text: '#0B1220',
  textMuted: '#64748B',
  border: '#E5E7EB',
  primary: '#2563EB',
  primaryText: '#FFFFFF',
  danger: '#DC2626',
  success: '#16A34A',
  overlay: 'rgba(0,0,0,0.05)',
};

export const darkColors: typeof lightColors = {
  background: '#0B1220',
  surface: '#111827',
  card: '#1F2937',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#374151',
  primary: '#60A5FA',
  primaryText: '#0B1220',
  danger: '#F87171',
  success: '#4ADE80',
  overlay: 'rgba(255,255,255,0.05)',
};

export type ThemeColors = typeof lightColors;
