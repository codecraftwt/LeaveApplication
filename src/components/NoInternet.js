import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { p } from '../utils/Responsive';
import Feather from 'react-native-vector-icons/Feather';

/**
 * NoInternet
 *
 * Drop this anywhere above your NavigationContainer.
 * It renders a full-screen overlay when the device goes offline
 * and automatically dismisses when connectivity is restored.
 */
export default function NoInternet({ children }) {
  const [isConnected, setIsConnected] = useState(true);
  const [wasOffline, setWasOffline]   = useState(false);
  const [showBanner, setShowBanner]   = useState(false); // reconnected banner

  const slideY    = useRef(new Animated.Value(-120)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const bannerY   = useRef(new Animated.Value(-60)).current;

  /* ── Watch connectivity ── */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = !!(state.isConnected && state.isInternetReachable !== false);
      setIsConnected(prev => {
        if (prev && !connected) {
          // Just went offline
          setWasOffline(true);
        }
        if (!prev && connected && wasOffline) {
          // Just came back online — show brief success banner
          setShowBanner(true);
          setTimeout(() => setShowBanner(false), 3000);
        }
        return connected;
      });
    });
    return () => unsubscribe();
  }, [wasOffline]);

  /* ── Animate overlay in/out ── */
  useEffect(() => {
    if (!isConnected) {
      Animated.parallel([
        Animated.spring(fadeAnim,  { toValue: 1, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    }
  }, [isConnected]);

  /* ── Animate reconnected banner ── */
  useEffect(() => {
    if (showBanner) {
      Animated.sequence([
        Animated.spring(bannerY, { toValue: 0, useNativeDriver: true }),
        Animated.delay(2400),
        Animated.timing(bannerY, { toValue: -60, duration: 300, useNativeDriver: true }),
      ]).start(() => setShowBanner(false));
    }
  }, [showBanner]);

  return (
    <View style={{ flex: 1 }}>
      {children}

      {/* ── Full-screen No-Internet Overlay ── */}
      {!isConnected && (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
            {/* Animated wifi icon */}
            <View style={styles.iconCircle}>
              <Feather name="wifi-off" size={p(40)} color="#3660f9" />
            </View>

            <Text style={styles.title}>No Internet Connection</Text>
            <Text style={styles.message}>
              Looks like your device isn't connected to the internet. Please check your Wi-Fi or mobile data and try again.
            </Text>

            {/* Retry button */}
            <TouchableOpacity
              style={styles.retryBtn}
              activeOpacity={0.85}
              onPress={async () => {
                const state = await NetInfo.fetch();
                const ok = !!(state.isConnected && state.isInternetReachable !== false);
                setIsConnected(ok);
              }}
            >
              <Feather name="refresh-cw" size={p(16)} color="#fff" style={{ marginRight: p(8) }} />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>

            <Text style={styles.hint}>Your data will sync automatically once you're back online.</Text>
          </Animated.View>
        </Animated.View>
      )}

      {/* ── Reconnected Banner ── */}
      {showBanner && (
        <Animated.View
          style={[styles.banner, { transform: [{ translateY: bannerY }] }]}
        >
          <Feather name="check-circle" size={p(18)} color="#fff" style={{ marginRight: p(8) }} />
          <Text style={styles.bannerText}>Back online! Connection restored.</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: p(24),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: p(28),
    paddingVertical: p(40),
    paddingHorizontal: p(28),
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
  },
  iconCircle: {
    width: p(90),
    height: p(90),
    borderRadius: p(45),
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(24),
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  title: {
    fontSize: p(20),
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    marginBottom: p(12),
    textAlign: 'center',
  },
  message: {
    fontSize: p(14),
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: p(22),
    marginBottom: p(28),
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3660f9',
    borderRadius: p(14),
    paddingVertical: p(14),
    paddingHorizontal: p(32),
    marginBottom: p(16),
    shadowColor: '#3660f9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  retryText: {
    fontSize: p(15),
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  hint: {
    fontSize: p(12),
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },

  /* Reconnected banner */
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9998,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(14),
    paddingHorizontal: p(20),
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bannerText: {
    fontSize: p(14),
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
});
