import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Target, Calendar, Database, LogOut } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { TouchableOpacity, Platform } from 'react-native';

export default function TabLayout() {
  const { logout } = useAuth();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#2563eb',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingBottom: Platform.OS === 'ios' ? 25 : 8,
        paddingTop: 8,
        height: Platform.OS === 'ios' ? 85 : 65,
      },
      headerStyle: {
        backgroundColor: '#1e293b',
      },
      headerTintColor: 'white',
      headerTitleStyle: {
        fontWeight: '900',
        fontSize: 18,
        letterSpacing: 1,
      },
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
          <LogOut size={22} color="#f87171" />
        </TouchableOpacity>
      ),
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'DASHBOARD',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'MISSION GOALS',
          tabBarLabel: 'Goals',
          tabBarIcon: ({ color }) => <Target size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'DAILY INTEL',
          tabBarLabel: 'Logs',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: 'INTEL VAULT',
          tabBarLabel: 'Vault',
          tabBarIcon: ({ color }) => <Database size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
