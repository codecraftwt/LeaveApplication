import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export const InputField = ({
  label,
  placeholder,
  placeholderTextColor = '#999', // Default placeholder color
  value,
  onChangeText,
  style,
  rightIcon,
  onRightIconPress,
  ...props
}) => (
  <View style={styles.inputContainer}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View>
      <TextInput
        style={[styles.input, style, rightIcon ? { paddingRight: 40 } : {}]} // Add space for icon
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
      {rightIcon && (
        <Icon
          name={rightIcon}
          size={20}
          color="#888"
          style={styles.rightIcon}
          onPress={onRightIconPress}
        />
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  rightIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -10,
    zIndex: 1,
    padding: 4,
  },
});
