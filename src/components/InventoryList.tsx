import React, { useState } from 'react';
import { Search, Filter, AlertCircle, CheckCircle, MapPin, Layers, FileText, LayoutGrid, Pencil } from 'lucide-react';
import { Location, InventoryItem, Stock, Language } from '../types';

interface InventoryListProps {
  language: Language;
  locations: Location[];
  items: InventoryItem[];
  stocks: Stock[];
  currentUserLocationId: string;
  onUpdateItemImage?: (itemId: string, newImageUrl: string) => void;
}

export default function InventoryList({
  language,
  locations,
  items,
  stocks,
  currentUserLocationId,
  onUpdateItemImage,
}: InventoryListProps) {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Determine user permissions
  // HQ can see ALL locations, while a branch user can only see their own location or HQ.
  const isHQUser = currentUserLocationId === 'loc-hq';

  // Filter accessible locations based on role
  const accessibleLocations = locations.filter((loc) => {
    if (isHQUser) return true; // HQ sees everything
    return loc.id === currentUserLocationId || loc.id === 'loc-hq'; // Branch sees own branch & HQ
  });

  // Unique categories of items
  const categories = Array.from(new Set(items.map((item) => item.category)));

  // Combine inventory item with stock quantity for filtering & rendering
  const inventoryData = items.flatMap((item) => {
    // Determine which locations' stock to display
    let targetLocations = accessibleLocations;
    if (selectedLocationId !== 'all') {
      targetLocations = accessibleLocations.filter((l) => l.id === selectedLocationId);
    }

    return targetLocations.map((loc) => {
      const stockItem = stocks.find((s) => s.locationId === loc.id && s.itemId === item.id);
      const quantity = stockItem ? stockItem.quantity : 0;
      const isLow = quantity < item.minStock;

      return {
        ...item,
        location: loc,
        quantity,
        isLow,
      };
    });
  });

  // Apply filters: search query, category, low stock
  const filteredData = inventoryData.filter((row) => {
    const matchesSearch =
      row.nameKh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || row.category === selectedCategory;
    const matchesLowStock = !filterLowStock || row.isLow;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search and Filters panel */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-border-theme">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-theme" />
            <input
              type="text"
              placeholder={language === 'kh' ? 'ស្វែងរកសម្ភារៈ...' : 'Search items...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:bg-white focus:border-accent transition-all text-text-theme"
            />
          </div>

          {/* Location filter */}
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-theme" />
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:bg-white focus:border-accent transition-all text-text-theme appearance-none font-bold cursor-pointer"
            >
              <option value="all">
                {language === 'kh' ? 'គ្រប់ទីតាំងទាំងអស់' : 'All Accessible Locations'}
              </option>
              {accessibleLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {language === 'kh' 
                    ? (loc.nameKh.includes(loc.code) ? loc.nameKh : `${loc.nameKh} (${loc.code})`) 
                    : (loc.nameEn.includes(loc.code) ? loc.nameEn : `${loc.nameEn} (${loc.code})`)}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="relative">
            <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-theme" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:bg-white focus:border-accent transition-all text-text-theme appearance-none font-bold cursor-pointer"
            >
              <option value="all">{language === 'kh' ? 'គ្រប់ប្រភេទសម្ភារៈ' : 'All Categories'}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Low stock alert filter toggle */}
          <div className="flex items-center">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterLowStock}
                onChange={(e) => setFilterLowStock(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-accent/20 transition-all"
              />
              <span className="text-sm font-semibold text-text-theme/80 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                {language === 'kh' ? 'បង្ហាញតែស្តុកជិតអស់' : 'Low Stock Only'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Grid or Table Layout */}
      <div className="bg-white rounded-2xl shadow-xs border border-border-theme overflow-hidden">
        <div className="px-6 py-4 border-b border-border-theme bg-[#FAF8F5] flex justify-between items-center">
          <h3 className="font-semibold text-text-theme flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-muted-theme" />
            {language === 'kh' ? 'បញ្ជីសារពើភ័ណ្ឌស្តុកបច្ចុប្បន្ន' : 'Current Stock Inventory List'}
          </h3>
          <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
            {filteredData.length} {language === 'kh' ? 'ទិន្នន័យ' : 'Records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-theme text-xs font-bold text-muted-theme uppercase tracking-wider bg-[#FAF8F5]/80">
                <th className="px-6 py-4">{language === 'kh' ? 'កូដទំនិញ' : 'Item Code'}</th>
                <th className="px-6 py-4">{language === 'kh' ? 'ឈ្មោះសម្ភារៈ' : 'Material Name'}</th>
                <th className="px-6 py-4">{language === 'kh' ? 'ប្រភេទ' : 'Category'}</th>
                <th className="px-6 py-4">{language === 'kh' ? 'ទីតាំងស្តុក' : 'Location'}</th>
                <th className="px-6 py-4 text-center">{language === 'kh' ? 'ចំនួនក្នុងស្តុក' : 'Stock Quantity'}</th>
                <th className="px-6 py-4">{language === 'kh' ? 'ឯកតា' : 'Unit'}</th>
                <th className="px-6 py-4 text-center">{language === 'kh' ? 'ស្ថានភាព' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme text-sm text-text-theme/80">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-theme">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-border-theme" />
                    {language === 'kh' ? 'មិនរកឃើញទិន្នន័យស្តុកទេ' : 'No inventory data found matching the filters.'}
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => (
                  <tr key={`${row.location.id}-${row.id}`} className="hover:bg-bg-theme/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-primary">
                      {row.code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0 group">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-2xs">
                            <img
                              src={row.imageUrl || `https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=150&q=80`}
                              alt={language === 'kh' ? row.nameKh : row.nameEn}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = `https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=150&q=80`;
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <p className="font-semibold text-text-theme">{language === 'kh' ? row.nameKh : row.nameEn}</p>
                          <p className="text-xs text-muted-theme font-sans mt-0.5">
                            {language === 'kh' ? row.nameEn : row.nameKh}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-theme text-xs">{row.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          row.location.type === 'HQ' ? 'bg-primary' : 'bg-accent'
                        }`} />
                        <div>
                          <p className="font-semibold text-text-theme text-xs leading-none">
                            {language === 'kh' ? row.location.nameKh : row.location.nameEn}
                          </p>
                          <span className="text-[10px] text-muted-theme font-mono">
                            {row.location.code} • {row.location.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-text-theme">
                      {row.quantity}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-theme">{row.unit}</td>
                    <td className="px-6 py-4 text-center">
                      {row.isLow ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FDF4F2] text-rose-800 border border-rose-100">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {language === 'kh' ? 'ជិតអស់ពីស្តុក' : 'Low Stock'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {language === 'kh' ? 'គ្រប់គ្រាន់' : 'In Stock'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
