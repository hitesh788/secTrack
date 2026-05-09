import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import api from '../../src/api';
import { Target } from 'lucide-react-native';

export default function Goals() {
    const [goals, setGoals] = useState<any[]>([]);
    const [refreshing, setRefresh] = useState(false);

    const fetchGoals = async () => {
        try {
            const { data } = await api.get('/goals');
            setGoals(data);
        } catch (error) {
            console.error('Goals fetch error:', error);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={[styles.badge, (styles as any)[`badge${item.status}`]]}>
                    <Text style={styles.badgeText}>{item.status}</Text>
                </View>
            </View>
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={goals}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => {
                    setRefresh(true);
                    await fetchGoals();
                    setRefresh(false);
                }} />}
                ListEmptyComponent={<Text style={styles.empty}>No active missions assigned.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        flex: 1,
    },
    desc: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 18,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    badgeNotStarted: { backgroundColor: '#f1f5f9' },
    badgeInProgress: { backgroundColor: '#dbeafe' },
    badgeCompleted: { backgroundColor: '#dcfce7' },
    empty: {
        textAlign: 'center',
        color: '#94a3b8',
        marginTop: 40,
        fontWeight: '600',
    }
});
