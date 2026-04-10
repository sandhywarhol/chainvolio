import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoadingScreen from '../screens/LoadingScreen';
import SetupScreen from '../screens/SetupScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen'; // Management Hub
import CVScreen from '../screens/CVScreen';           // Public CV View
import AddProofScreen from '../screens/AddProofScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Profile"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person-circle' : 'person-circle-outline';
          else if (route.name === 'CV') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Add Proof') iconName = focused ? 'add-circle' : 'add-circle-outline';
          
          return <Ionicons name={iconName as any} size={route.name === 'Add Proof' ? size + 10 : size + 2} color={color} />;
        },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#444',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: 8,
        },
        tabBarStyle: {
          backgroundColor: '#050505',
          borderTopColor: '#111',
          height: 85,
          paddingTop: 10,
          borderTopWidth: 1,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Identity' }}
      />
      <Tab.Screen 
        name="Add Proof" 
        component={AddProofScreen} 
        options={{ 
          title: 'Add Proof',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={size + 2} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="CV" 
        component={CVScreen} 
        options={{ title: 'Portfolio' }}
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
