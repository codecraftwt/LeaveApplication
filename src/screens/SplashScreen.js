import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const SplashScreen = ({ navigation }) => {
    useEffect(() => {
        setTimeout(() => {
            navigation.replace('Login');
        }, 2000);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>MyApp</Text>
            <ActivityIndicator size="large" color="#007bff" />
        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    text: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 }
});
