// src/components/UIComponents.tsx
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, ViewStyle, TextStyle,
} from 'react-native';
import { Colors, Spacing, Radius } from '../utils/theme';

// ─── BUTTON ───────────────────────────────────────────────────────────────────

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Button = ({
  title, onPress, variant = 'primary', size = 'md',
  loading, disabled, icon, style,
}: ButtonProps) => {
  const bg = {
    primary: Colors.accent,
    outline: 'transparent',
    danger: Colors.red,
    ghost: 'transparent',
  }[variant];

  const textColor = {
    primary: '#000',
    outline: Colors.text,
    danger: '#fff',
    ghost: Colors.text2,
  }[variant];

  const borderColor = variant === 'outline' ? Colors.border : 'transparent';
  const pad = { sm: 8, md: 14, lg: 18 }[size];
  const fontSize = { sm: 13, md: 15, lg: 16 }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor, paddingVertical: pad },
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon}
          <Text style={[styles.btnText, { color: textColor, fontSize }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── CARD ─────────────────────────────────────────────────────────────────────

export const Card = ({
  children, style,
}: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.card, style]}>{children}</View>
);

// ─── BADGE ────────────────────────────────────────────────────────────────────

export const Badge = ({
  label, color = Colors.accent, textColor = '#000',
}: { label: string; color?: string; textColor?: string }) => (
  <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

// ─── RATING STARS ─────────────────────────────────────────────────────────────

export const RatingStars = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Text key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? Colors.accent : Colors.text3 }}>
        ★
      </Text>
    ))}
  </View>
);

// ─── CREDITS PILL ─────────────────────────────────────────────────────────────

export const CreditsPill = ({ credits }: { credits: number }) => (
  <View style={styles.creditsPill}>
    <Text style={styles.creditsIcon}>💠</Text>
    <Text style={styles.creditsText}>{credits}</Text>
  </View>
);

// ─── SECTION HEADER ───────────────────────────────────────────────────────────

export const SectionHeader = ({
  title, action, onAction,
}: { title: string; action?: string; onAction?: () => void }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── ALERT BANNER ─────────────────────────────────────────────────────────────

export const AlertBanner = ({
  message, type = 'warning',
}: { message: string; type?: 'warning' | 'danger' | 'info' | 'success' }) => {
  const color = {
    warning: Colors.accent,
    danger: Colors.red,
    info: Colors.blue,
    success: Colors.green,
  }[type];

  return (
    <View style={[styles.alertBanner, { borderLeftColor: color, backgroundColor: color + '15' }]}>
      <Text style={[styles.alertText, { color }]}>{message}</Text>
    </View>
  );
};

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

export const EmptyState = ({
  icon, title, subtitle,
}: { icon: string; title: string; subtitle?: string }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySub}>{subtitle}</Text>}
  </View>
);

// ─── SEPARATOR ────────────────────────────────────────────────────────────────

export const Separator = ({ style }: { style?: ViewStyle }) => (
  <View style={[styles.sep, style]} />
);

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  btn: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  btnText: {
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  creditsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.card2,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  creditsIcon: { fontSize: 14 },
  creditsText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text3,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionAction: {
    fontSize: 13,
    color: Colors.accent,
  },
  alertBanner: {
    borderLeftWidth: 3,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.text3,
    textAlign: 'center',
    lineHeight: 20,
  },
  sep: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
});