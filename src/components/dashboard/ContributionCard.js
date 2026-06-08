import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { p } from '../../utils/Responsive';
import Feather from 'react-native-vector-icons/Feather';
import { Svg, Circle, Text as SVGText } from 'react-native-svg';
import { useSelector } from 'react-redux';

// ── Animated Circular Progress ──────────────────────────────────────────────
const CircularProgress = ({ size, strokeWidth, progressPercent, textSize }) => {
  const radius = (size - strokeWidth) / 2;
  const circum = radius * 2 * Math.PI;
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    animatedProgress.addListener(({ value }) => setDisplayPercent(Math.round(value)));
    Animated.timing(animatedProgress, {
      toValue: progressPercent,
      duration: 1600,
      useNativeDriver: false,
    }).start();
    return () => animatedProgress.removeAllListeners();
  }, [progressPercent]);

  const strokeDashoffset = circum - (circum * displayPercent) / 100;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          stroke="rgba(255,255,255,0.08)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <Circle
          stroke="#3B82F6"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={`${circum} ${circum}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
          strokeWidth={strokeWidth}
        />
        {/* Label */}
        <SVGText
          fontSize={textSize || 18}
          x={size / 2}
          y={size / 2 + (textSize ? textSize / 3 : 6)}
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="Poppins-Bold"
        >
          {displayPercent}%
        </SVGText>
      </Svg>
    </View>
  );
};

// ── Blinking Live Dot ───────────────────────────────────────────────────────
const LiveDot = () => {
  const blink = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.2, duration: 900, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.dot, { opacity: blink }]} />
  );
};

// ── Main Card ───────────────────────────────────────────────────────────────
export default function ContributionCard() {
  const dashboard = useSelector(state => state.auth.dashboard);
  const billable_hrs = dashboard?.billable_hrs || 0;
  const target = 1800;
  const percentage = Math.min((billable_hrs / target) * 100, 100);
  const currentYear = new Date().getFullYear();

  // Animated number counter
  const countAnim = useRef(new Animated.Value(0)).current;
  const [displayHrs, setDisplayHrs] = useState(0);

  // Slide-up entrance
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    // Counter animation
    countAnim.addListener(({ value }) => setDisplayHrs(Math.floor(value)));
    Animated.timing(countAnim, {
      toValue: billable_hrs,
      duration: 1400,
      useNativeDriver: false,
    }).start();
    return () => countAnim.removeAllListeners();
  }, [billable_hrs]);

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Top-left label row */}
      <View style={styles.labelRow}>
        <LiveDot />
        <Text style={styles.labelText}>Contribution {currentYear}</Text>
        <View style={styles.badge}>
          <Feather name="trending-up" size={p(11)} color="#3B82F6" />
          <Text style={styles.badgeText}>Live</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Content row */}
      <View style={styles.contentRow}>
        <View style={styles.leftCol}>
          <Text style={styles.hrs}>{displayHrs.toFixed(2)}</Text>
          <Text style={styles.hrsLabel}>Billable Hours</Text>

          {/* Mini progress bar */}
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${percentage}%` }]} />
          </View>
          <Text style={styles.barCaption}>{Math.round(percentage)}% of {target}h target</Text>
        </View>

        <CircularProgress
          size={p(78)}
          strokeWidth={p(8)}
          progressPercent={percentage}
          textSize={p(16)}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: p(20),
    paddingVertical: p(14),
    paddingHorizontal: p(20),
    marginBottom: p(10),
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(6),
    gap: p(6),
  },
  dot: {
    width: p(7),
    height: p(7),
    borderRadius: p(4),
    backgroundColor: '#22C55E',
  },
  labelText: {
    fontSize: p(13),
    color: '#94A3B8',
    fontFamily: 'Poppins-Medium',
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderRadius: p(20),
    paddingHorizontal: p(10),
    paddingVertical: p(3),
    gap: p(4),
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  badgeText: {
    fontSize: p(11),
    color: '#3B82F6',
    fontFamily: 'Poppins-SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: p(10),
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    flex: 1,
    paddingRight: p(16),
  },
  hrs: {
    fontSize: p(30),
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    letterSpacing: -1,
    lineHeight: p(36),
  },
  hrsLabel: {
    fontSize: p(12),
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    marginTop: p(2),
    marginBottom: p(6),
  },
  barTrack: {
    width: '100%',
    height: p(5),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: p(3),
    overflow: 'hidden',
    marginBottom: p(6),
  },
  barFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: p(3),
  },
  barCaption: {
    fontSize: p(11),
    color: '#475569',
    fontFamily: 'Poppins-Regular',
  },
});