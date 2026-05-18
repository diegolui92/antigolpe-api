import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ojuiufrckgwndhqnqxmo.supabase.co';

const SUPABASE_ANON_KEY = 'sb_publishable_HVXwR8u75l59TET7SPJc0Q_xoAzdpuB';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);