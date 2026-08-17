import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FeedScreen from '../screens/FeedScreen';
import MapScreen from '../screens/MapScreen';
import CreateMomentScreen from '../screens/CreateMomentScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatThreadScreen from '../screens/ChatThreadScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SignUpScreen from '../screens/SignUpScreen';
import { useAppStore } from '../store/useAppStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Create" component={CreateMomentScreen} />
      <Tab.Screen name="Chat" component={ChatListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const session = useAppStore((s) => s.session);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="SignUp" component={SignUpScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
