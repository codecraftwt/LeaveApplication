import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';

const { height } = Dimensions.get('window');

const BLUE = '#3360f9';
const ORANGE = '#F36F21';
const DARK = '#0f172a';
const MUTED = '#94a3b8';
const WHITE = '#ffffff';

// ─── Input Field Component ─────────────────────────────────────────────────
const Field = ({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  rightIcon,
  onRightIconPress,
  keyboardType,
  autoCapitalize,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={f.wrapper}>
      <Text style={f.label}>{label}</Text>
      <View style={[f.row, focused && f.rowFocused]}>
        <Icon name={icon} size={15} color={focused ? BLUE : '#b0bec5'} style={f.icon} />
        <TextInput
          style={f.input}
          placeholder={placeholder}
          placeholderTextColor="#b0bec5"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'none'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={f.rightBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name={rightIcon} size={16} color={MUTED} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const f = StyleSheet.create({
  wrapper: {
    marginBottom: p(16),
  },
  label: {
    fontSize: p(13),
    fontFamily: 'Poppins-SemiBold',
    color: DARK,
    marginBottom: p(7),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faff',
    borderRadius: p(12),
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: p(14),
    height: p(50),
  },
  rowFocused: {
    borderColor: BLUE,
    backgroundColor: '#f0f4ff',
  },
  icon: {
    marginRight: p(10),
    width: p(18),
    textAlign: 'center',
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: p(14),
    color: DARK,
    padding: 0,
    margin: 0,
  },
  rightBtn: {
    paddingLeft: p(10),
  },
});

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const panelSlide = useRef(new Animated.Value(60)).current;
  const panelFade = useRef(new Animated.Value(0)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoFade, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.spring(logoY, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
      Animated.timing(panelFade, { toValue: 1, duration: 600, delay: 180, useNativeDriver: true }),
      Animated.spring(panelSlide, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSignUp = () => {
    setError('');
    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim()) return setError('Please enter your email address.');
    if (!password.trim()) return setError('Please enter your password.');
    if (!confirmPassword.trim()) return setError('Please confirm your password.');

    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email.trim())) return setError('Please enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    // TODO: Implement actual registration logic
    // navigation.replace('Drawer');
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />

      {/* Background filler for bottom so it's white when keyboard closes */}
      <View style={s.bottomWhiteBg} />

      {/* ── Hero Header ── */}
      <View style={s.hero}>
        <View style={s.circle1} />
        <View style={s.circle2} />
        <View style={s.circle3} />
        <Animated.View style={{ opacity: logoFade, transform: [{ translateY: logoY }] }}>
          <Image
            source={require('../../assets/walstar1111.png')}
            style={s.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* ── Form Panel ── */}
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[s.panel, { opacity: panelFade, transform: [{ translateY: panelSlide }] }]}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scrollContent}>

            {/* Title */}
            <View style={s.titleRow}>
              <View style={s.titleDot} />
              <View>
                <Text style={s.title}>Create Account</Text>
                <Text style={s.titleSub}>Join us! Please fill in your details.</Text>
              </View>
            </View>

            {/* Inputs */}
            <Field
              label="Full Name"
              icon="user-o"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              autoCapitalize="words"
            />
            <Field
              label="Email Address"
              icon="envelope-o"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Password"
              icon="lock"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye-slash' : 'eye'}
              onRightIconPress={() => setShowPassword(v => !v)}
            />
            <Field
              label="Confirm Password"
              icon="check-circle-o"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry={!showConfirmPassword}
              rightIcon={showConfirmPassword ? 'eye-slash' : 'eye'}
              onRightIconPress={() => setShowConfirmPassword(v => !v)}
            />

            {/* Error */}
            {error ? (
              <View style={s.errorBox}>
                <Icon name="exclamation-circle" size={13} color={ORANGE} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : <View style={{ height: p(16) }} />}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[s.btn, loading && { opacity: 0.65 }]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.85}>
              <Text style={s.btnText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
              {!loading && (
                <View style={s.btnArrow}>
                  <Icon name="arrow-right" size={12} color={ORANGE} />
                </View>
              )}
            </TouchableOpacity>

            {/* Login */}
            <View style={s.footer}>
              <Text style={s.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                <Text style={s.footerLink}>Login here</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BLUE },
  flex: { flex: 1 },
  bottomWhiteBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: WHITE,
  },

  // Hero
  hero: {
    height: height * 0.42,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute', borderRadius: p(140),
    width: p(280), height: p(280),
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -p(100), right: -p(80),
  },
  circle2: {
    position: 'absolute', borderRadius: p(90),
    width: p(180), height: p(180),
    backgroundColor: 'rgba(243,111,33,0.14)',
    bottom: -p(70), left: -p(50),
  },
  circle3: {
    position: 'absolute', borderRadius: p(50),
    width: p(100), height: p(100),
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: p(20), left: p(20),
  },
  logo: { 
    width: p(260), 
    height: p(120),
    marginTop: p(60),
  },

  // Panel
  panel: {
    flex: 1,
    backgroundColor: WHITE,
    borderTopLeftRadius: p(32),
    borderTopRightRadius: p(32),
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: p(26),
    paddingTop: p(30),
    paddingBottom: p(40),
  },

  // Title
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: p(12),
    marginBottom: p(26),
  },
  titleDot: {
    width: p(4),
    height: p(46),
    backgroundColor: ORANGE,
    borderRadius: p(4),
    marginTop: p(2),
  },
  title: {
    fontSize: p(24),
    fontFamily: 'Poppins-Bold',
    color: DARK,
    lineHeight: p(30),
  },
  titleSub: {
    fontSize: p(12),
    fontFamily: 'Poppins-Regular',
    color: MUTED,
    lineHeight: p(18),
  },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(8),
    backgroundColor: '#fff4ed',
    borderRadius: p(10),
    borderLeftWidth: 3,
    borderLeftColor: ORANGE,
    paddingHorizontal: p(12),
    paddingVertical: p(9),
    marginBottom: p(14),
  },
  errorText: { flex: 1, fontSize: p(12), fontFamily: 'Poppins-Regular', color: '#92400e' },

  // Button
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE,
    borderRadius: p(14),
    height: p(52),
    gap: p(12),
    marginBottom: p(28),
    elevation: 8,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  btnText: {
    fontSize: p(15),
    fontFamily: 'Poppins-Bold',
    color: WHITE,
    letterSpacing: 0.5,
  },
  btnArrow: {
    width: p(26),
    height: p(26),
    borderRadius: p(13),
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: p(13), fontFamily: 'Poppins-Regular', color: MUTED },
  footerLink: { fontSize: p(13), fontFamily: 'Poppins-Bold', color: BLUE },
});