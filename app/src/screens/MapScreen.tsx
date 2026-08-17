import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { supabase } from '../lib/supabase';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');

export default function MapScreen() {
  const [moments, setMoments] = useState<any[]>([]);
  useEffect(() => { supabase.from('moments').select('*').eq('status', 'open').then(({ data }) => setMoments(data ?? [])); }, []);
  return (
    <View style={{ flex: 1 }}>
      <Mapbox.MapView style={{ flex: 1 }}>
        <Mapbox.Camera zoomLevel={11} centerCoordinate={[2.35, 48.86]} />
        {moments.map((m) => <Mapbox.PointAnnotation key={m.id} id={m.id} coordinate={[m.longitude, m.latitude]}><View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#111' }} /></Mapbox.PointAnnotation>)}
      </Mapbox.MapView>
      {!moments.length && <Text style={{ position: 'absolute', bottom: 30, alignSelf: 'center' }}>Aucun Moment sur la carte.</Text>}
    </View>
  );
}
