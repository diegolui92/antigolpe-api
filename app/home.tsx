import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AntiGolpe 🚫</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/verificar')}>
        <Text style={styles.text}>🔍 Verificar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', padding: 20 },
  title: { color: '#fff', fontSize: 26, textAlign: 'center', marginBottom: 30 },
  button: { backgroundColor: '#2563eb', padding: 15, borderRadius: 10 },
  text: { color: '#fff', textAlign: 'center' },
});