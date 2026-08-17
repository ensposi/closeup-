import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { supabase } from './src/lib/supabase';
import { useAppStore } from './src/store/useAppStore';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  const setUserId = useAppStore((s) => s.setUserId);
  const refreshMode = useAppStore((s) => s.refreshMode);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    refreshMode();
  }, [refreshMode]);

  if (!ready) return null;

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
