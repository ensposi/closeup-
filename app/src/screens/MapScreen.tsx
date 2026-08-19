import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { supabase } from '../lib/supabase';

type Moment = { id: string; title: string; latitude: number; longitude: number };

const PARIS: Region = { latitude: 48.8566, longitude: 2.3522, latitudeDelta: 0.12, longitudeDelta: 0.12 };

export default function MapScreen() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data } = await supabase.from('moments').select('id,title,latitude,longitude').eq('status', 'open');
      if (alive) { setMoments((data as Moment[]) ?? []); setLoading(false); }
    };
    load();
    const channel = supabase.channel('map-moments').on('postgres_changes', { event: '*', schema: 'public', table: 'moments' }, load).subscribe();
    return () => { alive = false; supabase.removeChannel(channel); };
  }, []);

  return (
    <View style={styles.container}>
      <MapView style={StyleSheet.absoluteFillObject} initialRegion={PARIS} showsUserLocation showsMyLocationButton>
        {moments.map((moment) => (
          <Marker key={moment.id} coordinate={{ latitude: moment.latitude, longitude: moment.longitude }} title={moment.title} description="Moment CloseUp" />
        ))}
      </MapView>
      {loading ? <ActivityIndicator style={styles.loading} /> : null}
      {!loading && moments.length === 0 ? <View style={styles.empty}><Text>Aucun Moment ouvert sur la carte.</Text></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { position: 'absolute', top: 20, alignSelf: 'center' },
  empty: { position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 11 },
});
