import { StyleSheet, Text, View, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { p } from '../../utils/Responsive';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    // TODO: Implement registration logic
    // navigation.replace('Drawer');
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? p(0) : p(20)}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
             {/* <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/walstar1111.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View> */}
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <InputField
              label="Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              autoCapitalize="words"
            />
            <InputField
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
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
            <InputField
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              rightIcon={showConfirmPassword ? 'eye-slash' : 'eye'}
              onRightIconPress={() => setShowConfirmPassword(v => !v)}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.buttonContainer}>
              <PrimaryButton title="Sign Up" onPress={handleSignUp} />
            </View>
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
                  Login here
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#3360f9',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: p(32),
    paddingHorizontal: p(16),
  },
// //   logoContainer: {
// //     width: '100%',
// //     alignItems: 'center',
// //     marginBottom: p(20),
// //   },
//   logo: {
//     width: p(200),
//     // marginBottom: p(80),
//   },
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
  title: {
    fontSize: p(18),
    color: '#3360f9',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginBottom: p(20),
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
    marginBottom: p(8),
  },
  error: {
    color: '#f44336',
    fontFamily: 'Poppins-SemiBold',
    fontSize: p(13),
    marginBottom: p(10),
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: p(10),
  },
  loginContainer: {
    marginTop: p(16),
    alignItems: 'center',
  },
  loginText: {
    color: '#888',
    fontSize: p(13),
    fontFamily: 'Poppins-Regular',
  },
  loginLink: {
    color: '#3360f9',
    fontFamily: 'Poppins-SemiBold',
    textDecorationLine: 'underline',
  },
});