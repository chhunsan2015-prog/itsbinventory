import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Package,
  Layers,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Share2,
  CheckCircle,
  Wrench,
  Hammer,
  Laptop,
  Printer,
  FileText,
  Sliders,
  HelpCircle,
  Pencil,
  Camera,
  Upload,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { Location, InventoryItem, Stock, Transaction, Language } from '../types';

interface DashboardViewProps {
  language: Language;
  locations: Location[];
  items: InventoryItem[];
  stocks: Stock[];
  transactions: Transaction[];
  currentUserLocationId: string;
  onUpdateItemImage?: (itemId: string, newImageUrl: string) => void;
}

export default function DashboardView({
  language,
  locations,
  items,
  stocks,
  transactions,
  currentUserLocationId,
  onUpdateItemImage,
}: DashboardViewProps) {
  const isHQUser = currentUserLocationId === 'loc-hq';

  // State hooks for local stock board & image editing
  const [boardSearch, setBoardSearch] = React.useState('');
  const [boardCategory, setBoardCategory] = React.useState<'all' | 'tools' | 'suppliers'>('all');
  const [editingImageItem, setEditingImageItem] = React.useState<InventoryItem | null>(null);
  const [customImageUrl, setCustomImageUrl] = React.useState<string>('');

  // 1. Calculate General Stats
  const totalSKUs = items.length;
  const totalLocations = isHQUser ? locations.length : 2; // HQ sees all (34), Branch sees 2 (HQ and itself)
  
  // Get accessible location IDs
  const accessibleLocIds = isHQUser 
    ? locations.map(l => l.id) 
    : ['loc-hq', currentUserLocationId];

  // Filter stocks by accessible locations
  const filteredStocks = stocks.filter(s => accessibleLocIds.includes(s.locationId));

  const totalStockQuantity = filteredStocks.reduce((sum, s) => sum + s.quantity, 0);

  // Check low stock count
  const lowStockItems = items.flatMap((item) => {
    return locations
      .filter((loc) => accessibleLocIds.includes(loc.id))
      .map((loc) => {
        const stockItem = stocks.find((s) => s.locationId === loc.id && s.itemId === item.id);
        const qty = stockItem ? stockItem.quantity : 0;
        return {
          item,
          location: loc,
          quantity: qty,
          isLow: qty < item.minStock,
        };
      })
      .filter((x) => x.isLow);
  });

  const lowStockCount = lowStockItems.length;

  // 2. Prepare Chart Data: Stock Allocation by Top Locations (HQ vs branches)
  const allocationData = locations
    .filter((loc) => accessibleLocIds.includes(loc.id))
    .map((loc) => {
      const locationStocks = stocks.filter((s) => s.locationId === loc.id);
      const totalQty = locationStocks.reduce((sum, s) => sum + s.quantity, 0);
      return {
        name: language === 'kh' ? loc.nameKh : loc.nameEn,
        shortName: loc.code,
        quantity: totalQty,
      };
    })
    .filter((loc) => loc.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 7); // Show top 7 locations for readability

  // 3. Prepare Chart Data: Inventory Category Breakdown (Pie Chart)
  const categoryCount: { [key: string]: number } = {};
  filteredStocks.forEach((st) => {
    const item = items.find((i) => i.id === st.itemId);
    if (item) {
      const category = item.category.split(' (')[0]; // Clean up category text
      categoryCount[category] = (categoryCount[category] || 0) + st.quantity;
    }
  });

  const pieColors = ['#2D4A3E', '#8A9A5B', '#D2A679', '#8B5A2B', '#A8C3B8', '#A0522D'];
  const categoryData = Object.keys(categoryCount).map((cat, idx) => ({
    name: cat,
    value: categoryCount[cat],
    color: pieColors[idx % pieColors.length],
  }));

  // 4. Prepare Chart Data: Transaction Activity over time (Area Chart)
  // Group last 6 transactions or group transactions by type
  const typeCounts = {
    STOCK_IN: 0,
    HANDOVER: 0,
    STOCK_OUT: 0,
    ADJUSTMENT: 0,
  };
  
  // Filter transactions based on what the user has access to see
  const visibleTransactions = transactions.filter(tx => {
    if (isHQUser) return true;
    return tx.fromLocationId === currentUserLocationId || tx.toLocationId === currentUserLocationId;
  });

  visibleTransactions.forEach((tx) => {
    if (tx.type in typeCounts) {
      typeCounts[tx.type as keyof typeof typeCounts] += tx.quantity;
    }
  });

  const transactionChartData = [
    { type: language === 'kh' ? 'ទិញចូល (Stock In)' : 'Stock In', quantity: typeCounts.STOCK_IN, fill: '#2D4A3E' },
    { type: language === 'kh' ? 'ប្រគល់ឱ្យសាខា (Handover)' : 'Handover', quantity: typeCounts.HANDOVER, fill: '#8A9A5B' },
    { type: language === 'kh' ? 'ដកប្រើប្រាស់ (Stock Out)' : 'Stock Out', quantity: typeCounts.STOCK_OUT, fill: '#C0392B' },
    { type: language === 'kh' ? 'កែតម្រូវ (Adjustment)' : 'Adjustment', quantity: typeCounts.ADJUSTMENT, fill: '#D2A679' },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 4 Cards Stats row - Ultra Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Card 1: Total stock volume */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
              {language === 'kh' ? 'ចំនួនសម្ភារក្នុងស្តុក' : 'Total Materials'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 font-mono leading-none">
                {totalStockQuantity.toLocaleString()}
              </span>
            </div>
            <span className="text-[10.5px] text-cyan-700 font-bold flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {language === 'kh' ? 'ទិន្នន័យផ្ទាល់' : 'Live count'}
            </span>
          </div>
          <div className="bg-cyan-50 p-2 rounded-lg text-cyan-700 flex-shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: SKU Count */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
              {language === 'kh' ? 'ប្រភេទសម្ភារសរុប (SKUs)' : 'Unique SKUs'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 font-mono leading-none">
                {totalSKUs}
              </span>
            </div>
            <span className="text-[10.5px] text-slate-600 font-bold block mt-1 truncate">
              {language === 'kh' ? 'កាតាឡុកសកម្ម' : 'Active catalogs'}
            </span>
          </div>
          <div className="bg-teal-50 p-2 rounded-lg text-teal-700 flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Locations */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-all">
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
              {language === 'kh' ? 'ទីតាំងរៀបចំស្តុក' : 'Storage Locations'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 font-mono leading-none">
                {totalLocations}
              </span>
            </div>
            <span className="text-[10.5px] text-slate-600 font-bold block mt-1 truncate">
              {isHQUser 
                ? (language === 'kh' ? `១ HQ & ${locations.length - 1} សាខា` : `1 HQ & ${locations.length - 1} Branches`)
                : (language === 'kh' ? 'HQ & សាខាផ្ទាល់ខ្លួន' : 'HQ & Branch')}
            </span>
          </div>
          <div className="bg-sky-50 p-2 rounded-lg text-sky-700 flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Low stock alert count */}
        <div className={`p-3 rounded-xl border shadow-2xs flex items-center justify-between transition-all ${
          lowStockCount > 0 
            ? 'bg-amber-50/40 border-amber-200/80' 
            : 'bg-white border-slate-200/90'
        }`}>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
              {language === 'kh' ? 'ទំនិញជិតអស់ពីស្តុក' : 'Low Stock Alerts'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-2xl font-extrabold font-mono leading-none ${lowStockCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                {lowStockCount}
              </span>
            </div>
            <span className={`text-[10.5px] font-bold flex items-center gap-0.5 mt-1 ${
              lowStockCount > 0 ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              {lowStockCount > 0 
                ? (language === 'kh' ? 'ប្រញាប់ទិញបន្ថែម' : 'Restock soon')
                : (language === 'kh' ? 'ស្តុកមានសុវត្ថិភាព' : 'Optimal')}
            </span>
          </div>
          <div className={`p-2 rounded-lg flex-shrink-0 ${lowStockCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* GDT Universal Stock Status Board */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <Package className="w-4.5 h-4.5 text-cyan-600" />
              <span className="font-bold">{language === 'kh' ? 'ក្តារបង្ហាញស្ថានភាពស្តុកសម្ភារៈគ្រប់ទីតាំង (GDT Universal Stock)' : 'Universal Material Stock Board'}</span>
            </h3>
            <p className="text-xs font-bold text-slate-600 mt-0.5">
              {language === 'kh' 
                ? 'បញ្ជីស្ថានភាពស្តុកលម្អិត៖ ប្រភេទ ចំនួននៅ HQ និងសាខាពន្ធដារទាំងអស់' 
                : 'Detailed stock levels across GDT Headquarters and all branches'}
            </p>
          </div>
          
          {/* Action controls */}
          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder={language === 'kh' ? 'ស្វែងរកសម្ភារៈ...' : 'Search materials...'}
                value={boardSearch}
                onChange={(e) => setBoardSearch(e.target.value)}
                className="pl-2.5 pr-6 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-slate-800 w-36 sm:w-48 font-medium"
              />
              {boardSearch && (
                <button 
                  onClick={() => setBoardSearch('')} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Category Segmented Tabs */}
            <div className="bg-slate-100 p-0.5 rounded-lg flex gap-0.5 text-xs">
              <button
                onClick={() => setBoardCategory('all')}
                className={`px-2.5 py-1 font-bold rounded transition-all ${
                  boardCategory === 'all' 
                    ? 'bg-white text-cyan-800 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'kh' ? 'ទាំងអស់' : 'All'}
              </button>
              <button
                onClick={() => setBoardCategory('tools')}
                className={`px-2.5 py-1 font-bold rounded transition-all ${
                  boardCategory === 'tools' 
                    ? 'bg-white text-cyan-800 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'kh' ? 'សម្ភារ Tools' : 'Tools'}
              </button>
              <button
                onClick={() => setBoardCategory('suppliers')}
                className={`px-2.5 py-1 font-bold rounded transition-all ${
                  boardCategory === 'suppliers' 
                    ? 'bg-white text-cyan-800 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'kh' ? 'សម្ភារ Suppliers' : 'Suppliers'}
              </button>
            </div>
          </div>
        </div>

        {/* Matrix Table with Ultra Dense Layout */}
        {(() => {
          const filteredBoardItems = items.filter(item => {
            const matchesSearch = 
              item.nameKh.toLowerCase().includes(boardSearch.toLowerCase()) ||
              item.nameEn.toLowerCase().includes(boardSearch.toLowerCase()) ||
              item.code.toLowerCase().includes(boardSearch.toLowerCase());
              
            const matchesCategory = 
              boardCategory === 'all' ||
              (boardCategory === 'tools' && item.category === 'សម្ភារ Tools Support') ||
              (boardCategory === 'suppliers' && item.category === 'សម្ភារ Suppliers');
              
            return matchesSearch && matchesCategory;
          });

          if (filteredBoardItems.length === 0) {
            return (
              <div className="border border-slate-200/80 rounded-lg p-6 text-center text-slate-400 text-xs font-semibold">
                {language === 'kh' ? 'មិនរកឃើញសម្ភារៈដែលស្វែងរកឡើយ' : 'No materials match search criteria'}
              </div>
            );
          }

          return (
            <div className="overflow-x-auto border border-slate-200/90 rounded-lg shadow-2xs bg-white">
              <table className="w-full border-collapse text-left text-xs min-w-[920px]">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-2.5 px-3 text-center w-10">{language === 'kh' ? 'ល.រ' : 'No.'}</th>
                    <th className="py-2.5 px-3 min-w-[200px]">{language === 'kh' ? 'កូដ / សម្ភារៈ' : 'Code / Material Name'}</th>
                    <th className="py-2.5 px-3 min-w-[110px]">{language === 'kh' ? 'ប្រភេទ' : 'Category'}</th>
                    <th className="py-2.5 px-3 text-center w-14">{language === 'kh' ? 'ឯកតា' : 'Unit'}</th>
                    <th className="py-2.5 px-3 text-right w-28">{language === 'kh' ? 'ស្តុក HQ' : 'HQ Stock'}</th>
                    <th className="py-2.5 px-3 text-right w-24">{language === 'kh' ? 'ស្តុកសាខា' : 'Branches'}</th>
                    <th className="py-2.5 px-3 pl-4 min-w-[180px]">{language === 'kh' ? 'សាខាដែលមានស្តុក' : 'Branch Availability'}</th>
                    <th className="py-2.5 px-3 w-28">{language === 'kh' ? 'ស្ថានភាព' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBoardItems.map((item, index) => {
                    const hqStockQty = stocks.find(s => s.locationId === 'loc-hq' && s.itemId === item.id)?.quantity || 0;
                    const isHQLow = hqStockQty < item.minStock;
                    
                    const branchStocks = stocks.filter(s => s.locationId !== 'loc-hq' && s.itemId === item.id);
                    const totalBranchQty = branchStocks.reduce((sum, s) => sum + s.quantity, 0);
                    const totalCombinedQty = hqStockQty + totalBranchQty;
                    
                    const locationsWithStock = branchStocks
                      .map(bs => {
                        const loc = locations.find(l => l.id === bs.locationId);
                        return {
                          code: loc?.code || bs.locationId,
                          nameKh: loc?.nameKh || bs.locationId,
                          quantity: bs.quantity
                        };
                      })
                      .filter(l => l.quantity > 0);

                    let remarkKh = 'ស្តុកគ្រប់គ្រាន់';
                    let remarkEn = 'Optimal';
                    let remarkColorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';

                    if (totalCombinedQty === 0) {
                      remarkKh = 'គ្មានស្តុកសោះ';
                      remarkEn = 'Out of Stock';
                      remarkColorClass = 'bg-rose-50 text-rose-700 border-rose-200';
                    } else if (totalCombinedQty < item.minStock) {
                      remarkKh = 'ខ្វះខាតខ្លាំង';
                      remarkEn = 'Critically Low';
                      remarkColorClass = 'bg-rose-100 text-rose-800 border-rose-300/80';
                    } else if (hqStockQty > item.minStock * 3 && branchStocks.some(bs => bs.quantity < item.minStock)) {
                      remarkKh = 'គួរផ្ទេរចែក';
                      remarkEn = 'Transfer';
                      remarkColorClass = 'bg-sky-50 text-sky-700 border-sky-200';
                    } else if (isHQLow) {
                      remarkKh = 'ខ្វះខាតនៅ HQ';
                      remarkEn = 'Low at HQ';
                      remarkColorClass = 'bg-amber-50 text-amber-700 border-amber-200';
                    }

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-400 border-r border-slate-100">
                          {index + 1}
                        </td>

                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2.5">
                            {/* Circular photographic thumbnail with bottom-corner edit pencil badge (+ overlay) */}
                            <div className="relative flex-shrink-0 group">
                              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-white flex items-center justify-center shadow-2xs">
                                <img
                                  src={item.imageUrl || `https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=150&q=80`}
                                  alt={language === 'kh' ? item.nameKh : item.nameEn}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = `https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=150&q=80`;
                                  }}
                                />
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingImageItem(item);
                                  setCustomImageUrl(item.imageUrl || '');
                                }}
                                title={language === 'kh' ? 'ប្តូរ/បន្ថែមរូបថត' : 'Add/Change image'}
                                className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-white hover:bg-slate-100 text-slate-700 rounded-full flex items-center justify-center border border-slate-300 shadow-2xs transition-all cursor-pointer z-10"
                              >
                                <Pencil className="w-2.5 h-2.5 text-slate-700" />
                                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-slate-800 text-[7px] text-white font-bold leading-none border border-white">+</span>
                              </button>
                            </div>

                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 block leading-tight text-xs truncate" title={language === 'kh' ? item.nameKh : item.nameEn}>
                                {language === 'kh' ? item.nameKh : item.nameEn}
                              </span>
                              <span className="text-[10.5px] text-slate-400 block truncate font-mono" title={language === 'kh' ? item.nameEn : item.nameKh}>
                                {item.code} • {language === 'kh' ? item.nameEn : item.nameKh}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            item.category === 'សម្ភារ Tools Support' 
                              ? 'bg-cyan-50 text-cyan-800 border border-cyan-200/60' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                          }`}>
                            {language === 'kh' 
                              ? (item.category === 'សម្ភារ Tools Support' ? 'Tools' : 'Suppliers')
                              : (item.category === 'សម្ភារ Tools Support' ? 'Tools' : 'Suppliers')
                            }
                          </span>
                        </td>

                        <td className="py-2 px-3 text-center text-slate-500 font-bold text-xs">
                          {item.unit}
                        </td>

                        <td className="py-2 px-3 text-right font-mono">
                          <div className="flex flex-col items-end">
                            <span className={`font-bold text-sm ${isHQLow ? 'text-rose-600' : 'text-slate-900'}`}>
                              {hqStockQty.toLocaleString()}
                            </span>
                            <span className={`text-[9.5px] font-semibold px-1 py-0.1 rounded mt-0.5 ${
                              isHQLow 
                                ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {isHQLow 
                                ? (language === 'kh' ? `ទាប (${item.minStock})` : `Low (${item.minStock})`)
                                : (language === 'kh' ? 'គ្រប់គ្រាន់' : 'Optimal')
                              }
                            </span>
                          </div>
                        </td>

                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-800 text-sm">
                          {totalBranchQty.toLocaleString()}
                        </td>

                        <td className="py-2 px-3 pl-4">
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {locationsWithStock.length === 0 ? (
                              <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.2 font-bold">
                                {language === 'kh' ? 'គ្មាន' : 'None'}
                              </span>
                            ) : (
                              locationsWithStock.map((loc, idx) => (
                                <span 
                                  key={idx} 
                                  title={language === 'kh' ? loc.nameKh : loc.code}
                                  className="bg-slate-50 hover:bg-slate-100 text-[10.5px] font-bold text-slate-800 px-1.5 py-0.2 rounded border border-slate-200/90 flex items-center gap-1 shadow-2xs"
                                >
                                  <span className="text-slate-700 font-mono text-[10px] font-bold">{loc.code}</span>
                                  <span className="bg-cyan-100 text-cyan-950 px-1 rounded font-mono text-[10px] font-bold">{loc.quantity}</span>
                                </span>
                              ))
                            )}
                          </div>
                        </td>

                        <td className="py-2 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border ${remarkColorClass}`}>
                            {language === 'kh' ? remarkKh : remarkEn}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      {/* Graph Row 2: Recent Transactions Activity & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Transaction Types metrics (Graph) */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-border-theme/70 shadow-xs">
          <div>
            <h3 className="font-bold text-text-theme text-base">
              {language === 'kh' ? 'សកម្មភាពប្រតិបត្តិការរួម' : 'Transaction Volume'}
            </h3>
            <p className="text-xs text-muted-theme mt-0.5">
              {language === 'kh' ? 'ចំនួនសរុបដែលបានកត់ត្រាតាមប្រភេទការងារ' : 'Total volume executed inside standard procedures'}
            </p>
          </div>
 
          <div className="h-64 w-full mt-6 text-xs font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transactionChartData} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EAE6DF" />
                <XAxis type="number" tickLine={false} axisLine={false} stroke="#757575" />
                <YAxis dataKey="type" type="category" tickLine={false} axisLine={false} stroke="#757575" width={90} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #EAE6DF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: '#212529' }}
                  labelStyle={{ fontWeight: 'bold', color: '#2D4A3E' }}
                />
                <Bar dataKey="quantity" fill="#8A9A5B" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {transactionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
 
        {/* Recent Audit Trails (List) */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-border-theme/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-text-theme text-base">
                  {language === 'kh' ? 'ប្រវត្តិប្រតិបត្តិការ' : 'Transaction History'}
                </h3>
                <p className="text-xs text-muted-theme mt-0.5">
                  {language === 'kh' ? 'កំណត់ត្រាផ្ទេរ ចេញ ចូលចុងក្រោយ' : 'Real-time updates audit trail'}
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {visibleTransactions.length === 0 ? (
                <p className="text-muted-theme text-xs py-10 text-center">No transactions registered yet</p>
              ) : (
                visibleTransactions.slice().reverse().slice(0, 5).map((tx) => {
                  const item = items.find((i) => i.id === tx.itemId);
                  const destLoc = locations.find((l) => l.id === tx.toLocationId);
                  const sourceLoc = locations.find((l) => l.id === tx.fromLocationId);

                  return (
                    <div key={tx.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-border-theme/60 flex items-center justify-between text-xs hover:border-border-theme transition-colors">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className={`p-1.5 rounded-lg flex-shrink-0 font-bold ${
                          tx.type === 'STOCK_IN' 
                            ? 'bg-primary/10 text-primary' 
                            : tx.type === 'HANDOVER' 
                            ? 'bg-accent/15 text-primary' 
                            : tx.type === 'STOCK_OUT' 
                            ? 'bg-rose-50 text-rose-700' 
                            : 'bg-amber-50/70 text-[#8B5A2B]'
                        }`}>
                          {tx.type === 'STOCK_IN' && <ArrowUpRight className="w-3.5 h-3.5" />}
                          {tx.type === 'HANDOVER' && <Share2 className="w-3.5 h-3.5" />}
                          {tx.type === 'STOCK_OUT' && <ArrowDownLeft className="w-3.5 h-3.5" />}
                          {tx.type === 'ADJUSTMENT' && <Clock className="w-3.5 h-3.5" />}
                        </span>
                        
                        <div className="min-w-0">
                          <p className="font-bold text-text-theme truncate text-[11px]">
                            {tx.type === 'STOCK_IN' && (language === 'kh' ? 'បញ្ចូលស្តុកកណ្តាល' : 'Stock In')}
                            {tx.type === 'HANDOVER' && (language === 'kh' ? `ផ្ទេរទៅ៖ ${destLoc?.code}` : `Sent to: ${destLoc?.code}`)}
                            {tx.type === 'STOCK_OUT' && (language === 'kh' ? `ដកប្រើនៅ៖ ${sourceLoc?.code}` : `Out at: ${sourceLoc?.code}`)}
                            {tx.type === 'ADJUSTMENT' && (language === 'kh' ? `កែតម្រូវនៅ៖ ${sourceLoc?.code}` : `Adjusted: ${sourceLoc?.code}`)}
                          </p>
                          <p className="text-[10px] text-muted-theme mt-0.5 truncate max-w-[140px]">
                            {item ? (language === 'kh' ? item.nameKh : item.nameEn) : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 ml-2">
                        <span className="font-mono font-bold text-text-theme block text-xs">
                          {tx.quantity}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Low Stock Monitoring */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-border-theme/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-text-theme text-base">
                  {language === 'kh' ? 'តាមដានស្តុកទាប' : 'Low Stock Monitor'}
                </h3>
                <p className="text-xs text-muted-theme mt-0.5">
                  {language === 'kh' ? 'សម្ភារៈដែលទាបជាងកម្រិតកំណត់' : 'Items under threshold levels'}
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {lowStockCount === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <p className="text-emerald-700 font-bold text-xs">
                    {language === 'kh' ? 'ស្តុកទាំងអស់មានសុវត្ថិភាព' : 'Optimal Balances'}
                  </p>
                  <p className="text-muted-theme text-[10.5px] max-w-[180px] mx-auto leading-normal">
                    {language === 'kh' ? 'គ្មានទំនិញណាមួយស្ថិតក្រោមស្ថានភាពព្រមានឡើយ។' : 'All materials are safely above alert lines.'}
                  </p>
                </div>
              ) : (
                lowStockItems.map(({ item, location, quantity }) => (
                  <div 
                    key={`${location.id}-${item.id}`} 
                    className="p-3 bg-[#FAF8F5] rounded-xl border border-rose-100 flex items-center justify-between text-xs hover:border-rose-200 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-text-theme truncate max-w-[150px]">
                        {language === 'kh' ? item.nameKh : item.nameEn}
                      </p>
                      <p className="text-[10px] text-muted-theme mt-0.5 truncate max-w-[150px]">
                        {language === 'kh' ? location.nameKh : location.nameEn}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="font-mono font-bold text-rose-600 text-xs block">
                        {quantity} <span className="text-[9px] text-muted-theme font-sans font-normal">{item.unit}</span>
                      </span>
                      <span className="text-[9px] text-rose-500 block font-semibold">
                        {language === 'kh' ? `កំណត់ ${item.minStock}` : `Min ${item.minStock}`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>



      {/* Change / Add Material Image Modal */}
      {editingImageItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {language === 'kh' ? 'ប្តូរ/បន្ថែមរូបថតសម្ភារៈ' : 'Change / Add Material Image'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {editingImageItem.code}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingImageItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Item Title */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-white flex-shrink-0 relative shadow-2xs">
                <img
                  src={customImageUrl || editingImageItem.imageUrl || `https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=150&q=80`}
                  alt={editingImageItem.nameKh}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 text-xs truncate">{editingImageItem.nameKh}</h4>
                <p className="text-[11px] text-slate-500 truncate">{editingImageItem.nameEn}</p>
              </div>
            </div>

            {/* Custom Image URL Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                {language === 'kh' ? 'តំណភ្ជាប់រូបភាព (Image URL):' : 'Image URL:'}
              </label>
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 font-mono"
              />
            </div>

            {/* Upload File Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                {language === 'kh' ? 'ឬជ្រើសរើសរូបថតពីម៉ាស៊ីន (Upload File):' : 'Or Upload File:'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (typeof reader.result === 'string') {
                        setCustomImageUrl(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingImageItem(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                {language === 'kh' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingImageItem && onUpdateItemImage) {
                    onUpdateItemImage(editingImageItem.id, customImageUrl);
                  }
                  setEditingImageItem(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-2xs transition-colors"
              >
                {language === 'kh' ? 'រក្សាទុក' : 'Save Image'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
