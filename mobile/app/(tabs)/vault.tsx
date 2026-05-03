import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Vault() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>INTEL VAULT</Text>
            <Text style={styles.sub}>Secure archives encrypted.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    text: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
    sub: { color: '#64748b', marginTop: 8 }
});
