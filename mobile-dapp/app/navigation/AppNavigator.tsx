import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoadingScreen from '../screens/LoadingScreen';
import SetupScreen from '../screens/SetupScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen'; 
import CVScreen from '../screens/CVScreen';           
import AddProofScreen from '../screens/AddProofScreen';
import AddCredentialScreen from '../screens/AddCredentialScreen';
import TimelineScreen from '../screens/TimelineScreen';
import ScoreScreen from '../screens/ScoreScreen';
import HiringScreen from '../screens/HiringScreen';
import CreateHiringScreen from '../screens/CreateHiringScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import MemoScreen from '../screens/MemoScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ScanScreen from '../screens/ScanScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// We nest the functional screens inside stacks so they can be reached from tabs
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="Add Proof" component={AddProofScreen} />
    <Stack.Screen name="Add Credential" component={AddCredentialScreen} />
    <Stack.Screen name="Timeline" component={TimelineScreen} />
    <Stack.Screen name="CV Score" component={ScoreScreen} />
    <Stack.Screen name="Hiring" component={HiringScreen} />
    <Stack.Screen name="Create Hiring" component={CreateHiringScreen} />
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="CV" component={CVScreen} />
    <Stack.Screen name="Memo" component={MemoScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
);

const CVStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CVScreen" component={CVScreen} />
    </Stack.Navigator>
);

const PortfolioStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PortfolioScreen" component={PortfolioScreen} />
      <Stack.Screen name="Add Proof" component={AddProofScreen} />
    </Stack.Navigator>
);

const ScanStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ScanScreen" component={ScanScreen} />
    </Stack.Navigator>
);

const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Proof of Work') iconName = focused ? 'layers' : 'layers-outline';
          else if (route.name === 'Scan') iconName = focused ? 'scan-circle' : 'scan-circle-outline';
          else if (route.name === 'My CV') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person-circle' : 'person-circle-outline';

          const scanSize = route.name === 'Scan' ? size + 12 : size + 4;
          return <Ionicons name={iconName} size={scanSize} color={color} />;
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: 8,
        },
        tabBarStyle: {
          backgroundColor: '#171717',
          borderTopColor: '#333333',
          height: 85,
          paddingTop: 10,
          borderTopWidth: 1,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Proof of Work" 
        component={PortfolioStack} 
        options={{ title: 'Proof of Work' }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanStack}
        options={{
          title: 'Scan',
          tabBarActiveTintColor: '#f97316',
        }}
      />
      <Tab.Screen 
        name="My CV" 
        component={CVStack} 
        options={{ title: 'My CV' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Setup" component={SetupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;


