import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';

import { router } from 'expo-router';

import { supabase } from '../supabase';

export default function Cadastro() {

  const [nome, setNome] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [senha, setSenha] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  async function cadastrar() {

    if (!nome || !email || !senha) {

      Alert.alert(
        'Atenção',
        'Preencha todos os campos.'
      );

      return;
    }

    if (senha.length < 6) {

      Alert.alert(
        'Senha fraca',
        'A senha deve possuir pelo menos 6 caracteres.'
      );

      return;
    }

    try {

      setLoading(true);

      const {
        data,
        error,
      } = await supabase.auth.signUp({

        email,

        password: senha,

        options: {
          data: {
            nome,
          },
        },
      });

      if (error) {

        Alert.alert(
          'Erro no cadastro',
          error.message
        );

        return;
      }

      Alert.alert(
        'Conta criada',
        'Seu cadastro foi realizado com sucesso.'
      );

      router.replace('/login');

    } catch (err) {

      Alert.alert(
        'Erro',
        'Falha inesperada ao criar conta.'
      );

    } finally {

      setLoading(false);
    }
  }

  return (

    <KeyboardAvoidingView

      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }

      style={styles.container}
    >

      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >

        {/* LOGO */}
        <Text style={styles.logo}>
          🛡️ AntiGolpe BR
        </Text>

        <Text style={styles.subtitle}>
          Crie sua conta segura
        </Text>

        {/* NOME */}
        <TextInput
          placeholder="Seu nome"
          placeholderTextColor="#777"
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />

        {/* EMAIL */}
        <TextInput
          placeholder="Seu email"
          placeholderTextColor="#777"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* SENHA */}
        <TextInput
          placeholder="Sua senha"
          placeholderTextColor="#777"
          style={styles.input}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {/* BOTÃO */}
        <TouchableOpacity
          style={styles.button}
          onPress={cadastrar}
          disabled={loading}
        >

          <Text style={styles.buttonText}>

            {loading
              ? 'Criando conta...'
              : 'CRIAR CONTA'}

          </Text>

        </TouchableOpacity>

        {/* LOGIN */}
        <TouchableOpacity
          onPress={() =>
            router.replace('/login')
          }
        >

          <Text style={styles.link}>
            Já possui conta? Entrar
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#0f1117',
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  logo: {
    fontSize: 34,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    color: '#999',
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 15,
  },

  input: {
    backgroundColor: '#1c1f26',
    borderRadius: 14,
    padding: 16,
    color: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2a2d36',
    fontSize: 15,
  },

  button: {
    backgroundColor: '#00FF88',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },

  link: {
    color: '#00BFFF',
    textAlign: 'center',
    marginTop: 25,
    fontSize: 15,
  },
});