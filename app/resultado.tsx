import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Resultado() {
  const { status, score } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Resultado</Text>

      <Text style={styles.texto}>
        Status: {status ? status : 'Carregando...'}
      </Text>

      <Text style={styles.texto}>
        Score: {score ? score : 'Carregando...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    color: '#fff',
    fontSize: 28,
    marginBottom: 20,
  },
  texto: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
});