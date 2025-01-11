import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons'; // For icons in the bottom tab

import HomeScreen from './screens/HomeScreen';
import AddMealScreen from './screens/AddMealScreen';
import EditMealScreen from './screens/EditMealScreen';
import ViewMealScreen from './screens/ViewMealScreen.js';
import HistoryScreen from './screens/HistoryScreen.js';
import AddCategoryMealScreen from './screens/AddCategoryMealScreen.js';
import SettingsScreen from './screens/settings.js';
import InputScreen from './screens/inputscreen.js';
import Overview from './screens/Overviewscreen.js';
import Profile from './screens/profilescreen.js';
import Developermode from './screens/Developermode.js';
import ApiMealScreen from './screens/ApiMealScreen.js';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Create Bottom Tab Navigator for Home, Overview, and Settings
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Overview') {
            iconName = 'insert-chart';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }
          else if (route.name === 'Meals') {
            iconName = 'fastfood';
          }
          else if (route.name === 'Profile'){
            iconName = 'account-circle'
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6750a5',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#f8f9fa',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60, // Increase height for a more spacious feel
        },
        headerShown: false, // Hide header for tab screens
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Overview" component={Overview} />
      <Tab.Screen name="Meals" component={ViewMealScreen} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      
    </Tab.Navigator>
  );
};

// Main App Navigator
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="BottomTabs" screenOptions={{ headerShown: false }}>
        {/* Bottom Tab Navigator */}
        <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />

        {/* Ordinary Stack Screens */}
        <Stack.Screen name="AddMeal" component={AddMealScreen} />
        <Stack.Screen name="EditMeal" component={EditMealScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Input" component={InputScreen} />
        <Stack.Screen name="AddCategoryMealScreen" component={AddCategoryMealScreen} />
        <Stack.Screen name="Developermode" component={Developermode} />
        <Stack.Screen name="ApiMeal" component={ApiMealScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
