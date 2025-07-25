import { ActivityIndicator, View, StyleSheet } from "react-native";
import React from "react";

const CustomLoadingIndicator = ({ size = "large", color = "#3660f9" }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CustomLoadingIndicator;
