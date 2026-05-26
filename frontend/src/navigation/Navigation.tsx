import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'react-native';
import { Colors } from '../theme/colors';
import { HomeScreen } from '../screens/HomeScreen';
import { PredictScreen } from '../screens/PredictScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { PredictResponse } from '../types';

const Tab = createBottomTabNavigator();

export const Navigation: React.FC = () => {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const [lastResult, setLastResult] = useState<PredictResponse | null>(null);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
        }}
      />

      <Tab.Screen
        name="Predict"
        children={() => (
          <PredictScreen
            onPredictionSuccess={result => setLastResult(result)}
          />
        )}
        options={{
          tabBarLabel: 'Predict',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🌸</Text>,
        }}
      />

      <Tab.Screen
        name="Result"
        children={() => (
          <ResultScreen
            result={lastResult}
            onReset={() => setLastResult(null)}
          />
        )}
        options={{
          tabBarLabel: 'Result',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📈</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Helper component for icon rendering
const Text = ({ children, style }: any) => {
  const React = require('react');
  return React.createElement(require('react-native').Text, { style }, children);
};
