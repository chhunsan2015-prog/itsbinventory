import React, { useState, useEffect } from 'react';
import { Check, Copy, Database, Server, RefreshCw, Key, ExternalLink, ShieldCheck, Layers, ArrowRight, Zap, Play } from 'lucide-react';
import { Language } from '../types';
import { getSupabaseCredentials, saveSupabaseCredentials, getSupabaseClient, fetchAllRowsExceeding1000 } from '../lib/supabase';

interface SQLGeneratorProps {
  language: Language;
}

export default function SQLGenerator({ language }: SQLGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [credentials, setCredentials] = useState(getSupabaseCredentials());
  const [inputUrl, setInputUrl] = useState(credentials.url);
  const [inputKey, setInputKey] = useState(credentials.key);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Test connection & fetch test state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; rowCount?: number } | null>(null);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    setCredentials(creds);
    setInputUrl(creds.url);
    setInputKey(creds.key);
  }, []);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(inputUrl, inputKey);
    const updated = getSupabaseCredentials();
    setCredentials(updated);
    setSaveSuccess(true);
    setTestResult(null);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearCredentials = () => {
    saveSupabaseCredentials('', '');
    setInputUrl('');
    setInputKey('');
    setCredentials(getSupabaseCredentials());
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const client = getSupabaseClient();

    if (!client) {
      setTestResult({
        success: false,
        message: language === 'kh' 
          ? 'សូមបញ្ចូល Supabase URL និង Anon Key ជាមុនសិន!' 
          : 'Please configure Supabase URL and Anon Key first.'
      });
      setTesting(false);
      return;
    }

    try {
      // Test fetch with >1000 rows pagination logic
      const result = await fetchAllRowsExceeding1000('locations', 'id, name_kh, code');
      if (result.error) {
        setTestResult({
          success: false,
          message: language === 'kh' 
            ? `ការតភ្ជាប់បានបរាជ័យ៖ ${result.error}` 
            : `Connection failed: ${result.error}`
        });
      } else {
        setTestResult({
          success: true,
          message: language === 'kh' 
            ? `ភ្ជាប់បានជោគជ័យ! បានទាញយក ${result.totalCount} ជួរដោយស្វ័យប្រវត្តិ (គាំទ្រ >1,000 ជួរ)` 
            : `Connected successfully! Retrieved ${result.totalCount} rows automatically (Supports >1,000 rows limit bypass).`,
          rowCount: result.totalCount
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Connection test error'
      });
    } finally {
      setTesting(false);
    }
  };

  const sqlCode = `-- =========================================================================
--   TAX INVENTORY SYSTEM DATABASE SCHEMA & TRANSACTION LOGIC (SUPABASE)
-- =========================================================================

-- 1. Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_kh VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('HQ', 'PROVINCIAL', 'KHAN', 'CENTRAL')),
    code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Items Table
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name_kh VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    min_stock INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Inventory Table (Stores actual stock per location per item)
CREATE TABLE IF NOT EXISTS inventory (
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (location_id, item_id)
);

-- 4. Transactions Table (History/Audit Logs)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('STOCK_IN', 'HANDOVER', 'STOCK_OUT', 'ADJUSTMENT')),
    from_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    to_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    remark TEXT,
    recorded_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =========================================================================
--   POSTGRESQL FUNCTION (RPC) FOR ATOMIC BRANCH HANDOVER
--   Guarantees all-or-nothing stock update within a single transaction block.
-- =========================================================================

CREATE OR REPLACE FUNCTION handle_branch_handover(
    p_from_location_id UUID,
    p_to_location_id UUID,
    p_item_id UUID,
    p_quantity INTEGER,
    p_remark TEXT,
    p_recorded_by VARCHAR
) RETURNS VOID AS $$
DECLARE
    v_hq_stock INTEGER;
BEGIN
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'បរិមាណផ្ទេរត្រូវតែធំជាងសូន្យ (Quantity must be greater than zero)';
    END IF;

    SELECT quantity INTO v_hq_stock
    FROM inventory
    WHERE location_id = p_from_location_id AND item_id = p_item_id
    FOR UPDATE;

    IF v_hq_stock IS NULL OR v_hq_stock < p_quantity THEN
        RAISE EXCEPTION 'ចំនួនសម្ភារៈនៅក្នុងស្តុកកណ្តាលមិនគ្រប់គ្រាន់សម្រាប់ផ្ទេរទេ (Insufficient stock at HQ)';
    END IF;

    UPDATE inventory
    SET quantity = quantity - p_quantity,
        updated_at = NOW()
    WHERE location_id = p_from_location_id AND item_id = p_item_id;

    INSERT INTO inventory (location_id, item_id, quantity, updated_at)
    VALUES (p_to_location_id, p_item_id, p_quantity, NOW())
    ON CONFLICT (location_id, item_id)
    DO UPDATE SET 
        quantity = inventory.quantity + EXCLUDED.quantity,
        updated_at = NOW();

    INSERT INTO transactions (
        type, from_location_id, to_location_id, item_id, quantity, remark, recorded_by, created_at
    ) VALUES (
        'HANDOVER', p_from_location_id, p_to_location_id, p_item_id, p_quantity, p_remark, p_recorded_by, NOW()
    );
END;
$$ LANGUAGE plpgsql;
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-6 h-6 text-cyan-600" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 font-sans">
                {language === 'kh' ? 'រៀបចំការភ្ជាប់ Supabase & Vercel' : 'Supabase & Vercel Integration Setup'}
              </h2>
            </div>
            <p className="text-slate-600 text-xs md:text-sm mt-1 font-bold">
              {language === 'kh' 
                ? 'កំណត់ត្រារៀបចំ Supabase URL/Key, លក្ខខណ្ឌទាញទិន្នន័យលើសពី ១,០០០ ជួរ និងការដាក់លើ Vercel' 
                : 'Configure Supabase credentials, handle >1,000 row query pagination (Free Tier limit bypass), and set environment variables in Vercel.'}
            </p>
          </div>
          <button
            onClick={copyToClipboard}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              copied 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 
                : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{language === 'kh' ? 'ចម្លងកូដបានជោគជ័យ!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{language === 'kh' ? 'ចម្លងកូដ SQL Schema' : 'Copy SQL Schema'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: 1. Credentials Configuration Form, 2. Vercel Env Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Supabase Configuration Form */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
              <Key className="w-4.5 h-4.5 text-cyan-600" />
              <span>{language === 'kh' ? '១. ភ្ជាប់ Supabase Credentials' : '1. Supabase Credentials'}</span>
            </h3>
            {credentials.isConfigured ? (
              <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'kh' ? 'បានភ្ជាប់' : 'Configured'}</span>
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
                {language === 'kh' ? 'មិនទាន់ភ្ជាប់' : 'Not Configured'}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveCredentials} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {language === 'kh' ? 'Supabase Project URL' : 'Supabase Project URL'}
              </label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://xyzproject.supabase.co"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {language === 'kh' ? 'Supabase Anon Key (Public Key)' : 'Supabase Anon Key'}
              </label>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'kh' ? 'រក្សាទុក' : 'Save Config'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-cyan-600" />
                <span>{testing ? (language === 'kh' ? 'កំពុងសាកល្បង...' : 'Testing...') : (language === 'kh' ? 'តេស្តការភ្ជាប់' : 'Test Connection')}</span>
              </button>

              {credentials.isCustom && (
                <button
                  type="button"
                  onClick={handleClearCredentials}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 font-bold rounded-lg transition-colors ml-auto"
                >
                  {language === 'kh' ? 'លុបចេញ' : 'Clear'}
                </button>
              )}
            </div>

            {saveSuccess && (
              <p className="text-emerald-700 font-bold text-xs bg-emerald-50 p-2 rounded border border-emerald-200">
                {language === 'kh' ? 'បានរក្សាទុក Credential ជោគជ័យ!' : 'Credentials saved successfully!'}
              </p>
            )}

            {testResult && (
              <div className={`p-3 rounded-lg border text-xs font-bold ${
                testResult.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                {testResult.message}
              </div>
            )}
          </form>
        </div>

        {/* Card 2: Vercel Deployment & Environment Variable Guide */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
              <ExternalLink className="w-4.5 h-4.5 text-cyan-600" />
              <span>{language === 'kh' ? '២. ការដាក់ VITE Environment Variables លើ Vercel' : '2. Vercel Environment Setup'}</span>
            </h3>
            <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
              Vercel Deployment
            </span>
          </div>

          <p className="text-xs font-bold text-slate-700 leading-relaxed">
            {language === 'kh' 
              ? 'ដើម្បី deploy ទៅ Vercel ដោយជោគជ័យ សូមបញ្ចូល Environment Variables ទាំងពីរនេះក្នុង Vercel Project Settings > Environment Variables:' 
              : 'Add these environment variables inside your Vercel Project Settings > Environment Variables:'}
          </p>

          <div className="space-y-2 font-mono text-xs">
            <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400">Key: </span>
                <span className="font-bold text-white">VITE_SUPABASE_URL</span>
              </div>
              <span className="text-slate-500 text-[10px]">Project URL</span>
            </div>

            <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400">Key: </span>
                <span className="font-bold text-white">VITE_SUPABASE_ANON_KEY</span>
              </div>
              <span className="text-slate-500 text-[10px]">Anon Key</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'kh' ? 'ចំណាំសំខាន់ (Note for Vite)' : 'Important Vite Prefix'}</span>
            </p>
            <p className="font-bold leading-normal text-[11.5px] text-amber-800">
              {language === 'kh'
                ? 'ត្រូវតែប្រើបុព្វបទ VITE_ ពីមុខ variable (ឧ. VITE_SUPABASE_URL) ដើម្បីឱ្យ client-side អាចអានបានពេល build លើ Vercel'
                : 'Always prefix variables with VITE_ so client-side React code can read them during Vercel build.'}
            </p>
          </div>
        </div>

      </div>

      {/* Card 3: >1,000 Rows Handling Explanation (Free Tier Bypass) */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-cyan-600" />
            <span>{language === 'kh' ? '៣. លក្ខខណ្ឌទាញទិន្នន័យលើសពី ១,០០០ ជួរ (Supabase Free Tier Limit)' : '3. Fetching >1,000 Rows (Chunking Algorithm)'}</span>
          </h3>
          <span className="bg-cyan-50 text-cyan-900 border border-cyan-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
            Auto-Pagination
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">
              {language === 'kh' ? 'បញ្ហាប្រឈម' : 'Challenge'}
            </span>
            <p className="text-slate-800 font-bold leading-normal">
              {language === 'kh' 
                ? 'Supabase REST API (PostgREST) កំណត់ទាញយកទិន្នន័យអតិបរមា ១,០០០ ជួរក្នុង 1 Query' 
                : 'Supabase Free Tier defaults to a maximum of 1,000 rows returned per single REST query.'}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">
              {language === 'kh' ? 'ដំណោះស្រាយ' : 'Solution'}
            </span>
            <p className="text-slate-800 font-bold leading-normal">
              {language === 'kh' 
                ? 'ប្រើប្រាស់ Loop Pagination ដោយ `range(from, to)` ដងละ ១,០០០ ជួរ រហូតដល់អស់' 
                : 'Automated range chunking `.range(0, 999)`, `.range(1000, 1999)` loops through all total records.'}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">
              {language === 'kh' ? 'អត្ថប្រយោជន៍' : 'Benefit'}
            </span>
            <p className="text-slate-800 font-bold leading-normal">
              {language === 'kh' 
                ? 'អាចទាញយកទិន្នន័យបានគ្មានដែនកំណត់ (៥,០០០+, ១០,០០0+ ជួរ) ដោយពុំបាច់បង់ប្រាក់ Upgrade' 
                : 'Fetches unlimited rows (5,000+, 10,000+ rows) seamlessly without upgrading to paid plans.'}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 text-slate-200 font-mono text-xs space-y-2 overflow-x-auto">
          <div className="text-slate-400 text-[11px] font-sans font-bold flex items-center justify-between border-b border-slate-800 pb-2">
            <span>/src/lib/supabase.ts (fetchAllRowsExceeding1000)</span>
            <span className="text-emerald-400">Range Pagination Logic</span>
          </div>
          <pre className="text-emerald-400 whitespace-pre">
{`export async function fetchAllRowsExceeding1000<T>(tableName: string, chunkSize = 1000) {
  let allData: T[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const from = page * chunkSize;
    const to = from + chunkSize - 1; // Range chunk 0..999, 1000..1999

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, to);

    if (error || !data || data.length < chunkSize) {
      hasMore = false;
    }
    if (data) allData = [...allData, ...data];
    page++;
  }
  return allData; // Returns all combined rows seamlessly
}`}
          </pre>
        </div>
      </div>

      {/* SQL Schema Display */}
      <div className="relative rounded-2xl overflow-hidden bg-[#18221E] border border-[#24352F] text-stone-200 shadow-xs">
        <div className="bg-[#121A17] border-b border-[#24352F] px-5 py-3 flex items-center justify-between text-xs text-stone-400 font-bold">
          <span className="font-mono text-emerald-400">PostgreSQL / Supabase Schema & RPC Function</span>
          <span>PostgreSQL 15+</span>
        </div>
        <div className="overflow-auto max-h-[450px] p-5 font-mono text-xs leading-relaxed text-emerald-300">
          <pre className="whitespace-pre">{sqlCode}</pre>
        </div>
      </div>
    </div>
  );
}
