import React, { useState, useEffect } from 'react';
import {
  Database,
  Building,
  CheckCircle,
  TrendingUp,
  Package,
  Layers,
  MapPin,
  Clock,
  LayoutDashboard,
  Menu,
  X,
  FileText,
  Lock,
  Globe,
  Settings,
  PlusCircle,
  MinusCircle,
  Sliders,
  Send,
} from 'lucide-react';

import { Location, InventoryItem, Stock, Transaction, Language } from './types';
import { LOCATIONS, INVENTORY_ITEMS, INITIAL_STOCK, INITIAL_TRANSACTIONS } from './data';

import DashboardView from './components/DashboardView';
import InventoryList from './components/InventoryList';
import StockInForm from './components/StockInForm';
import BranchHandoverForm from './components/BranchHandoverForm';
import StockOutForm from './components/StockOutForm';
import StockAdjustmentForm from './components/StockAdjustmentForm';
import SQLGenerator from './components/SQLGenerator';
import AddMaterialForm from './components/AddMaterialForm';

export default function App() {
  const [language, setLanguage] = useState<Language>('kh');
  const [currentUserLocationId, setCurrentUserLocationId] = useState<string>('loc-hq');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Load state from LocalStorage or use Mock Data
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('gdt_inventory_items_v2');
    return saved ? JSON.parse(saved) : INVENTORY_ITEMS;
  });

  const [stocks, setStocks] = useState<Stock[]>(() => {
    const saved = localStorage.getItem('gdt_stocks_v1');
    return saved ? JSON.parse(saved) : INITIAL_STOCK;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('gdt_transactions_v1');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('gdt_inventory_items_v2', JSON.stringify(inventoryItems));
  }, [inventoryItems]);

  useEffect(() => {
    localStorage.setItem('gdt_stocks_v1', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem('gdt_transactions_v1', JSON.stringify(transactions));
  }, [transactions]);

  // 0. Register New Material logic
  const handleAddMaterial = (newItem: InventoryItem, initialHqStock: number) => {
    setInventoryItems((prev) => [...prev, newItem]);
    if (initialHqStock > 0) {
      setStocks((prev) => {
        const copy = [...prev];
        const matchIdx = copy.findIndex((s) => s.locationId === 'loc-hq' && s.itemId === newItem.id);
        if (matchIdx > -1) {
          copy[matchIdx] = { ...copy[matchIdx], quantity: copy[matchIdx].quantity + initialHqStock };
        } else {
          copy.push({ locationId: 'loc-hq', itemId: newItem.id, quantity: initialHqStock });
        }
        return copy;
      });

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'STOCK_IN',
        fromLocationId: null,
        toLocationId: 'loc-hq',
        itemId: newItem.id,
        quantity: initialHqStock,
        remark: language === 'kh' 
          ? `សមតុល្យដើមគ្រានៃការចុះឈ្មោះសម្ភារៈថ្មី៖ ${newItem.nameKh}`
          : `Initial balance from material registration: ${newItem.nameEn}`,
        createdAt: new Date().toISOString(),
        recordedBy: language === 'kh' ? 'ប្រព័ន្ធស្វ័យប្រវត្ត' : 'System Auto',
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  // 1. Stock In logic (Add to HQ)
  const handleStockIn = (itemId: string, quantity: number, remark: string, recordedBy: string) => {
    setStocks((prev) => {
      const copy = [...prev];
      const matchIdx = copy.findIndex((s) => s.locationId === 'loc-hq' && s.itemId === itemId);
      if (matchIdx > -1) {
        copy[matchIdx] = { ...copy[matchIdx], quantity: copy[matchIdx].quantity + quantity };
      } else {
        copy.push({ locationId: 'loc-hq', itemId, quantity });
      }
      return copy;
    });

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'STOCK_IN',
      fromLocationId: null,
      toLocationId: 'loc-hq',
      itemId,
      quantity,
      remark,
      createdAt: new Date().toISOString(),
      recordedBy,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // 2. Branch Handover logic (Transfer from HQ to branch)
  const handleHandover = (toLocationId: string, itemId: string, quantity: number, remark: string, recordedBy: string) => {
    setStocks((prev) => {
      let copy = [...prev];
      // Deduct from HQ
      const hqIdx = copy.findIndex((s) => s.locationId === 'loc-hq' && s.itemId === itemId);
      if (hqIdx > -1) {
        copy[hqIdx] = { ...copy[hqIdx], quantity: copy[hqIdx].quantity - quantity };
      }

      // Add to Branch
      const branchIdx = copy.findIndex((s) => s.locationId === toLocationId && s.itemId === itemId);
      if (branchIdx > -1) {
        copy[branchIdx] = { ...copy[branchIdx], quantity: copy[branchIdx].quantity + quantity };
      } else {
        copy.push({ locationId: toLocationId, itemId, quantity });
      }
      return copy;
    });

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'HANDOVER',
      fromLocationId: 'loc-hq',
      toLocationId,
      itemId,
      quantity,
      remark,
      createdAt: new Date().toISOString(),
      recordedBy,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // 3. Stock Out logic (Deduct from target location)
  const handleStockOut = (locationId: string, itemId: string, quantity: number, remark: string, recordedBy: string) => {
    setStocks((prev) => {
      const copy = [...prev];
      const matchIdx = copy.findIndex((s) => s.locationId === locationId && s.itemId === itemId);
      if (matchIdx > -1) {
        copy[matchIdx] = { ...copy[matchIdx], quantity: Math.max(0, copy[matchIdx].quantity - quantity) };
      }
      return copy;
    });

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'STOCK_OUT',
      fromLocationId: locationId,
      toLocationId: null,
      itemId,
      quantity,
      remark,
      createdAt: new Date().toISOString(),
      recordedBy,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // 4. Stock Adjustment logic (Overwrites target quantity)
  const handleAdjust = (locationId: string, itemId: string, newQuantity: number, remark: string, recordedBy: string) => {
    setStocks((prev) => {
      const copy = [...prev];
      const matchIdx = copy.findIndex((s) => s.locationId === locationId && s.itemId === itemId);
      if (matchIdx > -1) {
        copy[matchIdx] = { ...copy[matchIdx], quantity: newQuantity };
      } else {
        copy.push({ locationId, itemId, quantity: newQuantity });
      }
      return copy;
    });

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'ADJUSTMENT',
      fromLocationId: locationId,
      toLocationId: null,
      itemId,
      quantity: newQuantity,
      remark,
      createdAt: new Date().toISOString(),
      recordedBy,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleUpdateItemImage = (itemId: string, newImageUrl: string) => {
    setInventoryItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, imageUrl: newImageUrl } : item))
    );
  };

  // Switcher configurations
  const activeUserLocation = LOCATIONS.find((l) => l.id === currentUserLocationId) || LOCATIONS[0];

  return (
    <div className="min-h-screen bg-bg-theme flex flex-col font-sans text-text-theme">
      
      {/* Upper Navigation bar with Cambodian General Department of Taxation branding */}
      <header className="bg-primary border-b border-accent/40 text-white shadow-sm sticky top-0 z-40">
        <div className="max-w-full xl:max-w-[1650px] mx-auto px-3 sm:px-4 md:px-8 xl:px-10 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          
          {/* Logo & Khmer Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0 text-slate-300"
              title="Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <img 
              src="/Logo_Stock_2.png" 
              alt="GDT Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0" 
              referrerPolicy="no-referrer" 
            />
            <div className="min-w-0 flex flex-col justify-center">
              {language === 'kh' ? (
                <h1 className="text-xs sm:text-base font-bold text-accent tracking-wide leading-tight">
                  <span className="block whitespace-nowrap">ប្រព័ន្ធគ្រប់គ្រង</span>
                  <span className="block whitespace-nowrap">ស្ដុកសម្ភារៈបច្ចេកទេស</span>
                </h1>
              ) : (
                <h1 className="text-xs sm:text-base font-bold text-accent tracking-wide leading-tight">
                  Technical Inventory Management System
                </h1>
              )}
              <p className="text-[9px] sm:text-xs text-slate-200 mt-0.5 uppercase font-semibold tracking-wider font-mono truncate">
                TECHNICAL INVENTORY SYSTEM
              </p>
            </div>
          </div>

          {/* Role and Language Swapper */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'kh' ? 'en' : 'kh')}
              className="bg-[#1E332B] hover:bg-[#28453a] text-slate-100 border border-emerald-800/60 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-1.5 transition-all shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-accent" />
              <span className="whitespace-nowrap">{language === 'kh' ? 'English' : 'ភាសាខ្មែរ'}</span>
            </button>

            {/* Quick reset data */}
            <button
              onClick={() => {
                if (window.confirm(language === 'kh' ? 'តើអ្នកពិតជាចង់កំណត់ទិន្នន័យឡើងវិញមែនទេ?' : 'Reset simulation state to original mock data?')) {
                  localStorage.removeItem('gdt_stocks_v1');
                  localStorage.removeItem('gdt_transactions_v1');
                  localStorage.removeItem('gdt_inventory_items_v2');
                  setStocks(INITIAL_STOCK);
                  setTransactions(INITIAL_TRANSACTIONS);
                  setInventoryItems(INVENTORY_ITEMS);
                }
              }}
              title={language === 'kh' ? 'កំណត់ឡើងវិញ' : 'Reset Data'}
              className="p-1.5 sm:p-2 bg-[#1E332B] hover:bg-rose-950/40 text-slate-100 hover:text-rose-400 border border-emerald-800/60 hover:border-rose-900 rounded-lg sm:rounded-xl transition-colors"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="max-w-full xl:max-w-[1720px] mx-auto w-full px-3 md:px-5 lg:px-6 py-4 flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4">
        
        {/* Navigation Sidebar (Desktop) */}
        <aside className={`lg:col-span-1 bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs space-y-3 lg:block ${
          sidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-64 h-full bg-white p-4 shadow-xl' : 'hidden'
        }`}>
          <div className="flex lg:hidden items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-sm text-slate-800">{language === 'kh' ? 'មីនុយជម្រើស' : 'Menu options'}</span>
            <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-slate-100 rounded">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Role Simulator Card directly in Sidebar */}
          <div className="bg-slate-50/80 border border-slate-200/80 p-2.5 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                <span>{language === 'kh' ? 'Admin-GDT / តួនាទី' : 'Admin-GDT Role'}</span>
              </div>
              <span className="bg-cyan-100/80 text-cyan-800 px-1.5 py-0.2 text-[10px] rounded font-bold uppercase tracking-wider">
                {activeUserLocation.type}
              </span>
            </div>
            <select
              value={currentUserLocationId}
              onChange={(e) => {
                setCurrentUserLocationId(e.target.value);
                setActiveTab('dashboard');
              }}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-md px-2 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="loc-hq">{language === 'kh' ? 'អគ្គនាយកដ្ឋាន (GDT-HQ)' : 'GDT HQ (Central)'}</option>
              <option value="loc-central-itshq">{language === 'kh' ? 'ស្តុកថ្នាក់កណ្តាល (ITS-HQ)' : 'Central Stock (ITS-HQ)'}</option>
              <option value="loc-prov-sre">{language === 'kh' ? 'សាខាខេត្តសៀមរាប (SRE)' : 'Siem Reap Branch (SRE)'}</option>
              <option value="loc-prov-kdl">{language === 'kh' ? 'សាខាខេត្តកណ្តាល (KDL)' : 'Kandal Branch (KDL)'}</option>
              <option value="loc-khan-ckm">{language === 'kh' ? 'សាខាខណ្ឌចំការមន (CKM)' : 'Chamkarmon Branch (CKM)'}</option>
            </select>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-0.5 text-xs font-bold">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-1 pb-1">
              {language === 'kh' ? 'ព័ត៌មានទូទៅ' : 'Overview'}
            </p>
            
            <button
              onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-50 text-cyan-800 font-bold border-l-2 border-cyan-600 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-cyan-600' : 'text-slate-500'}`} />
              <span className="font-bold">{language === 'kh' ? 'ផ្ទាំងគ្រប់គ្រង (Dashboard)' : 'Dashboard'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('inventory'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-cyan-50 text-cyan-800 font-bold border-l-2 border-cyan-600 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Package className={`w-4 h-4 ${activeTab === 'inventory' ? 'text-cyan-600' : 'text-slate-500'}`} />
              <span className="font-bold">{language === 'kh' ? 'ស្តុកបច្ចុប្បន្ន (Inventory)' : 'Inventory'}</span>
            </button>

            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-2.5 pb-1">
              {language === 'kh' ? 'ប្រតិបត្តិការស្តុកកណ្តាល' : 'HQ Operations'}
            </p>

            <button
              onClick={() => { setActiveTab('stock-in'); setSidebarOpen(false); }}
              disabled={currentUserLocationId !== 'loc-hq'}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentUserLocationId !== 'loc-hq'
                  ? 'text-slate-300 cursor-not-allowed opacity-50'
                  : activeTab === 'stock-in'
                  ? 'bg-cyan-50 text-cyan-800 font-bold border-l-2 border-cyan-600 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <PlusCircle className={`w-4 h-4 ${activeTab === 'stock-in' ? 'text-cyan-600' : 'text-slate-500'}`} />
                <span className="font-bold">{language === 'kh' ? 'បញ្ចូលស្តុកថ្មី (Stock In)' : 'Stock In'}</span>
              </span>
              {currentUserLocationId !== 'loc-hq' && <Lock className="w-3.5 h-3.5 text-slate-300" />}
            </button>

            <button
              onClick={() => { setActiveTab('handover'); setSidebarOpen(false); }}
              disabled={currentUserLocationId !== 'loc-hq'}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentUserLocationId !== 'loc-hq'
                  ? 'text-slate-300 cursor-not-allowed opacity-50'
                  : activeTab === 'handover'
                  ? 'bg-cyan-50 text-cyan-800 font-bold border-l-2 border-cyan-600 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Send className={`w-4 h-4 ${activeTab === 'handover' ? 'text-cyan-600' : 'text-slate-500'}`} />
                <span className="font-bold">{language === 'kh' ? 'ប្រគល់ឱ្យសាខា (Handover)' : 'Handover'}</span>
              </span>
              {currentUserLocationId !== 'loc-hq' && <Lock className="w-3.5 h-3.5 text-slate-300" />}
            </button>

            <button
              onClick={() => { setActiveTab('add-material'); setSidebarOpen(false); }}
              disabled={currentUserLocationId !== 'loc-hq'}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentUserLocationId !== 'loc-hq'
                  ? 'text-slate-300 cursor-not-allowed opacity-50'
                  : activeTab === 'add-material'
                  ? 'bg-cyan-50 text-cyan-800 font-bold border-l-2 border-cyan-600 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <PlusCircle className={`w-4 h-4 ${activeTab === 'add-material' ? 'text-cyan-600' : 'text-slate-500'}`} />
                <span className="font-bold">{language === 'kh' ? 'បន្ថែមសម្ភារៈថ្មី (New SKU)' : 'Add Material'}</span>
              </span>
              {currentUserLocationId !== 'loc-hq' && <Lock className="w-3.5 h-3.5 text-slate-300" />}
            </button>

            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-2.5 pb-1">
              {language === 'kh' ? 'ប្រតិបត្តិការសាខា' : 'Branch Tasks'}
            </p>

            <button
              onClick={() => { setActiveTab('stock-out'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'stock-out'
                  ? 'bg-cyan-50 text-cyan-800 font-bold border-l-2 border-cyan-600 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <MinusCircle className={`w-4 h-4 ${activeTab === 'stock-out' ? 'text-cyan-600' : 'text-slate-500'}`} />
              <span className="font-bold">{language === 'kh' ? 'ដកប្រើប្រាស់ (Stock Out)' : 'Stock Out'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('adjust'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'adjust'
                  ? 'bg-cyan-50 text-cyan-800 font-bold border-l-2 border-cyan-600 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Sliders className={`w-4 h-4 ${activeTab === 'adjust' ? 'text-cyan-600' : 'text-slate-500'}`} />
              <span className="font-bold">{language === 'kh' ? 'កែតម្រូវស្តុក (Adjustment)' : 'Adjustment'}</span>
            </button>

            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-2.5 pb-1">
              {language === 'kh' ? 'ទិន្នន័យប្រព័ន្ធ' : 'Database'}
            </p>

            <button
              onClick={() => { setActiveTab('supabase-sql'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'supabase-sql'
                  ? 'bg-cyan-50 text-cyan-800 font-bold border-l-2 border-cyan-600 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Database className={`w-4 h-4 ${activeTab === 'supabase-sql' ? 'text-cyan-600' : 'text-slate-500'}`} />
              <span className="font-bold">{language === 'kh' ? 'កូដ SQL (Supabase)' : 'SQL Code'}</span>
            </button>
          </nav>
          
          <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5">
            <h4 className="font-bold text-slate-900 text-xs mb-0.5 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-600" />
              <span>{language === 'kh' ? 'ប្រព័ន្ធស្តុកមានសុវត្ថិភាព' : 'Secured System'}</span>
            </h4>
            <p className="text-[11px] font-bold text-slate-600 leading-tight">
              {language === 'kh' 
                ? 'ការពារដោយ Atomic DB Transactions' 
                : 'Secured via Atomic DB RPC functions'}
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-4 space-y-4">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <DashboardView
              language={language}
              locations={LOCATIONS}
              items={inventoryItems}
              stocks={stocks}
              transactions={transactions}
              currentUserLocationId={currentUserLocationId}
              onUpdateItemImage={handleUpdateItemImage}
            />
          )}

          {/* Current Stock Inventory List Tab */}
          {activeTab === 'inventory' && (
            <InventoryList
              language={language}
              locations={LOCATIONS}
              items={inventoryItems}
              stocks={stocks}
              currentUserLocationId={currentUserLocationId}
              onUpdateItemImage={handleUpdateItemImage}
            />
          )}

          {/* Stock In Form Tab */}
          {activeTab === 'stock-in' && currentUserLocationId === 'loc-hq' && (
            <StockInForm
              language={language}
              items={inventoryItems}
              onStockIn={handleStockIn}
              transactions={transactions}
            />
          )}

          {/* Branch Handover Form Tab */}
          {activeTab === 'handover' && currentUserLocationId === 'loc-hq' && (
            <BranchHandoverForm
              language={language}
              locations={LOCATIONS}
              items={inventoryItems}
              stocks={stocks}
              onHandover={handleHandover}
            />
          )}

          {/* Stock Out Form Tab */}
          {activeTab === 'stock-out' && (
            <StockOutForm
              language={language}
              locations={LOCATIONS}
              items={inventoryItems}
              stocks={stocks}
              currentUserLocationId={currentUserLocationId}
              onStockOut={handleStockOut}
            />
          )}

          {/* Stock Adjustment Form Tab */}
          {activeTab === 'adjust' && (
            <StockAdjustmentForm
              language={language}
              locations={LOCATIONS}
              items={inventoryItems}
              stocks={stocks}
              currentUserLocationId={currentUserLocationId}
              onAdjust={handleAdjust}
            />
          )}

          {/* Add Material Tab */}
          {activeTab === 'add-material' && currentUserLocationId === 'loc-hq' && (
            <AddMaterialForm
              language={language}
              existingItems={inventoryItems}
              onAddMaterial={handleAddMaterial}
            />
          )}

          {/* SQL Generator Tab */}
          {activeTab === 'supabase-sql' && (
            <SQLGenerator language={language} />
          )}
        </main>
      </div>

      {/* Footer copyright */}
      <footer className="bg-white border-t border-border-theme py-6 mt-12 text-center text-xs text-muted-theme font-sans">
        <p>© 2026 អគ្គនាយកដ្ឋានពន្ធដារ (General Department of Taxation). All rights reserved.</p>
        <p className="mt-1 text-[10px] text-muted-theme/80">Tax Material Stock & Handover Transaction Hub • Secured via Atomic DB RPC functions</p>
      </footer>
    </div>
  );
}
