import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import api from '../../src/api';
import { ShieldCheck, Target, Zap, CheckCircle } from 'lucide-react-native';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    unstarted: 0
  });
  const [refreshing, setRefresh] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/goals');
      const calculated = {
        total: data.length,
        completed: data.filter((g: any) => g.status === 'Completed').length,
        inProgress: data.filter((g: any) => g.status === 'InProgress').length,
        unstarted: data.filter((g: any) => g.status === 'NotStarted').length,
      };
      setStats(calculated);
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = async () => {
    setRefresh(true);
    await fetchStats();
    setRefresh(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.hero}>
        <Text style={styles.welcome}>Welcome, Operative</Text>
        <Text style={styles.status}>STATUS: MISSION ACTIVE</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Target size={24} color="#2563eb" />
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Goals</Text>
        </View>

        <View style={styles.statCard}>
          <Zap size={24} color="#0ea5e9" />
          <Text style={styles.statValue}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>

        <View style={styles.statCard}>
          <CheckCircle size={24} color="#16a34a" />
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <View style={styles.intelCard}>
        <ShieldCheck size={28} color="#2563eb" />
        <View style={styles.intelContent}>
          <Text style={styles.intelTitle}>Secure Environment</Text>
          <Text style={styles.intelText}>Precision tracking active. All mission data encrypted and archived.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  hero: {
    backgroundColor: '#1E293B',
    padding: 30,
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcome: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
  },
  status: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: -30,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  intelCard: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  intelContent: {
    flex: 1,
  },
  intelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  intelText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
});
