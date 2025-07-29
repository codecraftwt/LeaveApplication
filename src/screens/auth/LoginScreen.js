import React, { useState } from 'react';
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
  SafeAreaView,
} from 'react-native';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { p } from '../../utils/Responsive';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/slices/authSlice';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const { loading, error: reduxError, user , isLoggedIn } = useSelector(state => state.auth);

  const handleLogin = async () => {
    // Clear previous errors
    setError('');
    
    // Input validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    
    // Password length validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const resultAction = await dispatch(login({ email: email.trim(), password }));
      if (login.fulfilled.match(resultAction)) {
        navigation.replace('Drawer');
      } else {
        // The error message is now handled in the auth slice with user-friendly messages
        setError(resultAction.payload || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#3360f9" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? p(0) : p(20)}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/walstar1111.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.card}>
            <Text style={styles.subtitle}>Login to your account</Text>
            <View style={styles.formGroup}>
              <InputField
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.formGroup}>
              <InputField
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? 'eye-slash' : 'eye'}
                onRightIconPress={() => setShowPassword(v => !v)}
              />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {reduxError && !error ? <Text style={styles.error}>{reduxError}</Text> : null}
            <TouchableOpacity
              style={styles.forgotContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
              <PrimaryButton title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
            </View>
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Don't have an account?{' '}
                <Text style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
                  Register here
                </Text>
              </Text>
            </View>
         
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#3360f9',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: p(32),
    paddingHorizontal: p(16),
  },
  logoContainer: {
    marginBottom: p(12),
    alignItems: 'center',
  },
  logo: {
    width: p(250),
    height: p(150),
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: p(24),
    padding: p(28),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 10,
    alignItems: 'stretch',
  },
  subtitle: {
    fontSize: p(16),
    color: '#888',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: p(20),
  },
  formGroup: {
    marginBottom: p(5),
  },
  input: {
    fontFamily: 'Poppins-Regular',
    color: '#222',
    backgroundColor: '#f8f9fa',
    borderRadius: p(10),
    paddingHorizontal: p(16),
    paddingVertical: p(14),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  error: {
    color: '#f67e16',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(13),
    marginBottom: p(10),
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: p(6),
  },
  forgotContainer: {
    // marginTop: p(10),
    alignItems: 'flex-end',
  },
  forgotText: {
    color: '#3360f9',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(14),
  },
  registerContainer: {
    marginTop: p(16),
    alignItems: 'center',
  },
  registerText: {
    color: '#888',
    fontSize: p(13),
    fontFamily: 'Poppins-Regular',
  },
  registerLink: {
    color: '#3360f9',
    fontFamily: 'Poppins-SemiBold',
    textDecorationLine: 'underline',
  },
});
