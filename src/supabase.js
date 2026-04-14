// ─────────────────────────────────────────────────────────────────────────────
// ARCHIVO: src/supabase.js
//
// ¡IMPORTANTE! Antes de usar el CRM, reemplazá los dos valores de abajo
// con los datos de TU proyecto en Supabase.
//
// Encontrás estos datos en:
//   supabase.com → tu proyecto → Settings → API
//
// ─────────────────────────────────────────────────────────────────────────────
 
import { createClient } from '@supabase/supabase-js'
 
const SUPABASE_URL = 'https://dylrkkiqtsytbvmnsepe.supabase.co'
// Ejemplo: 'https://abcdefghijk.supabase.co'
 
const SUPABASE_ANON_KEY = 'sb_publishable_lB-2k3hGN1icIspaCjk6pw_J_1L-2dp'
// Ejemplo: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' (es muy larga)
 
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)