#!/usr/bin/env node
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || 'https://udhvygsrsgjwgumgioui.supabase.co'
const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(url, key)

async function count(table) {
  const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true })
  if (error) throw new Error(`${table} 计数失败: ${error.message}`)
  return count ?? 0
}

async function main() {
  const herbs = await count('herbs')
  const formulas = await count('formulas')
  const meridians = await count('meridians')
  const acupoints = await count('acupoints')
  console.log(JSON.stringify({ herbs, formulas, meridians, acupoints }, null, 2))
}

main().catch(err => { console.error(err); process.exit(1) })