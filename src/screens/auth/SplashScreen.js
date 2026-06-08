import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  Animated,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useSelector } from 'react-redux';
import { p } from '../../utils/Responsive';
import Feather from 'react-native-vector-icons/Feather';
import { APP_CONFIG } from '../../utils/AppConfig';

/**
 * Compares two semver strings (e.g. "1.0.0" vs "1.2.3")
 */
function isNewerVersion(local, remote) {
  const parse = v => String(v).split('.').map(n => parseInt(n, 10) || 0);
  const [lMaj, lMin, lPat] = parse(local);
  const [rMaj, rMin, rPat] = parse(remote);
  if (rMaj !== lMaj) return rMaj > lMaj;
  if (rMin !== lMin) return rMin > lMin;
  return rPat > lPat;
}

export default function Splash({ navigation }) {
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

  // Core Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Update Modal State
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [opening, setOpening] = useState(false);

  // Modal Animations
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Start Initial Splash Animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
    ]).start();

    // 2. Fetch Version Check
    checkAppVersion();
  }, []);

  const navigateForward = () => {
    navigation.replace(isLoggedIn ? 'Drawer' : 'Login');
  };

  const checkAppVersion = async () => {
    try {
      const res = await fetch(APP_CONFIG.VERSION_CHECK_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        // If API fails, just navigate normally after a short delay
        setTimeout(navigateForward, 2000);
        return;
      }

      const data = await res.json();
      const { latest_version, force_update = false, update_notes = '' } = data;

      if (latest_version && isNewerVersion(APP_CONFIG.APP_VERSION, latest_version)) {
        // Halt navigation and show update modal
        setUpdateInfo({ latest_version, update_notes });
        setForceUpdate(force_update);
        setShowUpdate(true);

        Animated.parallel([
          Animated.spring(modalScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
          Animated.timing(modalFade, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]).start();
      } else {
        // App is up to date, proceed
        setTimeout(navigateForward, 2000);
      }
    } catch (_) {
      // Network error, proceed
      setTimeout(navigateForward, 2000);
    }
  };

  const handleUpdateClick = async () => {
    setOpening(true);
    try {
      await Linking.openURL(APP_CONFIG.STORE_URL);
    } catch {
      // Ignore
    } finally {
      setOpening(false);
    }
  };

  const handleLaterClick = () => {
    Animated.parallel([
      Animated.timing(modalScale, { toValue: 0.8, duration: 200, useNativeDriver: true }),
      Animated.timing(modalFade, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setShowUpdate(false);
      navigateForward();
    });
  };

  return (
    <View style={styles.container}>
      {/* Background Elements */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      {/* Main Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Image
          source={require('../../assets/walstar1111.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Loading Indicator (hide if update modal is showing) */}
      {!showUpdate && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.progressBar,
                { transform: [{ scaleX: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }] },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>Checking for updates...</Text>
        </View>
      )}

      {/* ── UPDATE MODAL ── */}
      <Modal
        visible={showUpdate}
        transparent
        animationType="none"
        onRequestClose={forceUpdate ? undefined : handleLaterClick}
      >
        <Animated.View style={[modalStyles.overlay, { opacity: modalFade }]}>
          <Animated.View style={[modalStyles.card, { transform: [{ scale: modalScale }] }]}>
            {/* Icon */}
            <View style={modalStyles.iconRing}>
              <View style={modalStyles.iconInner}>
                <Feather name="download-cloud" size={p(36)} color="#3660f9" />
              </View>
            </View>

            <View style={modalStyles.badge}>
              <Text style={modalStyles.badgeText}>v{updateInfo?.latest_version}</Text>
            </View>

            <Text style={modalStyles.title}>New Update Available!</Text>
            <Text style={modalStyles.subtitle}>
              A newer version of the app is ready. Update now to get the latest features and improvements.
            </Text>

            {!!updateInfo?.update_notes && (
              <View style={modalStyles.notesBox}>
                <View style={modalStyles.notesHeader}>
                  <Feather name="list" size={p(13)} color="#3660f9" />
                  <Text style={modalStyles.notesTitle}>What's New</Text>
                </View>
                <Text style={modalStyles.notesText}>{updateInfo.update_notes}</Text>
              </View>
            )}

            <View style={modalStyles.versionRow}>
              <View style={modalStyles.versionChip}>
                <Text style={modalStyles.versionLabel}>Current</Text>
                <Text style={modalStyles.versionValue}>v{APP_CONFIG.APP_VERSION}</Text>
              </View>
              <Feather name="arrow-right" size={p(16)} color="#94A3B8" />
              <View style={[modalStyles.versionChip, modalStyles.versionChipNew]}>
                <Text style={[modalStyles.versionLabel, { color: '#1E40AF' }]}>Latest</Text>
                <Text style={[modalStyles.versionValue, { color: '#1E40AF' }]}>v{updateInfo?.latest_version}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={modalStyles.updateBtn}
              onPress={handleUpdateClick}
              activeOpacity={0.87}
              disabled={opening}
            >
              {opening ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="download" size={p(16)} color="#fff" style={{ marginRight: p(8) }} />
                  <Text style={modalStyles.updateBtnText}>Update Now</Text>
                </>
              )}
            </TouchableOpacity>

            {!forceUpdate && (
              <TouchableOpacity style={modalStyles.laterBtn} onPress={handleLaterClick}>
                <Text style={modalStyles.laterText}>Remind Me Later</Text>
              </TouchableOpacity>
            )}

            {forceUpdate && (
              <Text style={modalStyles.forceNote}>
                ⚠️ This update is required to continue using the app.
              </Text>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3360f9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: p(400),
    height: p(400),
    borderRadius: p(200),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -150,
    left: -50,
  },
  circle2: {
    position: 'absolute',
    width: p(500),
    height: p(500),
    borderRadius: p(250),
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: -250,
    right: -100,
  },
  circle3: {
    position: 'absolute',
    width: p(300),
    height: p(300),
    borderRadius: p(150),
    backgroundColor: 'rgba(254, 140, 6, 0.05)',
    top: '30%',
    right: -100,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: p(300),
  },
  loadingContainer: {
    position: 'absolute',
    bottom: p(50),
    alignItems: 'center',
    width: '100%',
  },
  loadingBar: {
    width: '60%',
    height: p(6),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: p(3),
    overflow: 'hidden',
    marginBottom: p(12),
  },
  progressBar: {
    height: '100%',
    width: '100%',
    backgroundColor: '#fe8c06',
    borderRadius: p(3),
  },
  loadingText: {
    fontSize: p(14),
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Poppins-Regular',
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(24),
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: p(28),
    padding: p(28),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 20,
  },
  iconRing: {
    width: p(90),
    height: p(90),
    borderRadius: p(45),
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(12),
    borderWidth: 3,
    borderColor: '#BFDBFE',
  },
  iconInner: {
    width: p(72),
    height: p(72),
    borderRadius: p(36),
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#3660f9',
    borderRadius: p(20),
    paddingHorizontal: p(14),
    paddingVertical: p(4),
    marginBottom: p(16),
  },
  badgeText: {
    fontSize: p(12),
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: p(22),
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    marginBottom: p(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: p(13),
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: p(20),
    marginBottom: p(20),
  },
  notesBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: p(12),
    padding: p(14),
    marginBottom: p(18),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(6),
    marginBottom: p(6),
  },
  notesTitle: {
    fontSize: p(12),
    fontFamily: 'Poppins-SemiBold',
    color: '#3660f9',
  },
  notesText: {
    fontSize: p(12),
    fontFamily: 'Poppins-Regular',
    color: '#475569',
    lineHeight: p(18),
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(12),
    marginBottom: p(24),
  },
  versionChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: p(10),
    paddingHorizontal: p(16),
    paddingVertical: p(8),
    alignItems: 'center',
  },
  versionChipNew: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  versionLabel: {
    fontSize: p(10),
    fontFamily: 'Poppins-Medium',
    color: '#94A3B8',
    marginBottom: p(2),
  },
  versionValue: {
    fontSize: p(14),
    fontFamily: 'Poppins-Bold',
    color: '#475569',
  },
  updateBtn: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#3660f9',
    borderRadius: p(14),
    paddingVertical: p(15),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: p(12),
    shadowColor: '#3660f9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  updateBtnText: {
    fontSize: p(16),
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  laterBtn: {
    paddingVertical: p(10),
    paddingHorizontal: p(24),
  },
  laterText: {
    fontSize: p(14),
    fontFamily: 'Poppins-SemiBold',
    color: '#94A3B8',
  },
  forceNote: {
    fontSize: p(12),
    fontFamily: 'Poppins-Medium',
    color: '#EF4444',
    textAlign: 'center',
    marginTop: p(4),
  },
});
