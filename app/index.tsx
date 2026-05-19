import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    verificar();
  }, []);

  const verificar = async () => {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      router.replace('/home');
    } else {
      router.replace('/login');
    }
  };

  return null;
}