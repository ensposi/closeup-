import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export function useLocationTracking(enabled = true) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permission, setPermission] = useState<Location.PermissionStatus>('undetermined');
  useEffect(() => {
    if (!enabled) return;
    let subscription: Location.LocationSubscription | undefined;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermission(status);
      if (status !== 'granted') return;
      subscription = await Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, distanceInterval: 100 }, setLocation);
    })();
    return () => subscription?.remove();
  }, [enabled]);
  return { location, permission };
}
