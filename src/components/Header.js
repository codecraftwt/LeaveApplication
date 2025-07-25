import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { p } from '../utils/Responsive';

export default function Header({ title, onBack, showLogo = true }) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={p(22)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        {showLogo ? (
          <Image
            source={require('../assets/walstar11.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : (
          <View style={{ width: p(32) }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#3360f9',
    // borderBottomLeftRadius: p(30),
    // borderBottomRightRadius: p(30),
    paddingTop: p(15),
    paddingBottom: p(5),

  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? p(40) : p(18),
    paddingBottom: p(10),
    paddingHorizontal: p(16),
  },
  backBtn: {
    width: p(32),
    height: p(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: p(18),
    // textAlign: 'center',
  },
  logo: {
    width: p(80),
    height: p(36),
    marginLeft: p(8),

  },
}); 