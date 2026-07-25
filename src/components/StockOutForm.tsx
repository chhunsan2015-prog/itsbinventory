import React, { useState } from 'react';
import { MinusCircle, Check, AlertCircle, Info, ClipboardCopy } from 'lucide-react';
import { Location, InventoryItem, Stock, Language } from '../types';

interface StockOutFormProps {
  language: Language;
  locations: Location[];
  items: InventoryItem[];
  stocks: Stock[];
  currentUserLocationId: string;
  onStockOut: (locationId: string, itemId: string, quantity: number, remark: string, recordedBy: string) => void;
}

export default function StockOutForm({
  language,
  locations,
  items,
  stocks,
  currentUserLocationId,
  onStockOut,
}: StockOutFormProps) {
  const [selectedLocationId, setSelectedLocationId] = useState<string>(currentUserLocationId);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [remark, setRemark] = useState<string>('');
  const [recordedBy, setRecordedBy] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // HQ can consume anywhere, Branch can only consume at their own location
  const isHQUser = currentUserLocationId === 'loc-hq';
  const accessibleLocations = locations.filter((loc) => {
    if (isHQUser) return true;
    return loc.id === currentUserLocationId;
  });

  // Calculate current stock at selected location for selected item
  const currentStockItem = stocks.find((s) => s.locationId === selectedLocationId && s.itemId === selectedItemId);
  const availableQty = currentStockItem ? currentStockItem.quantity : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccess(false);

    if (!selectedLocationId) {
      setErrorMsg(language === 'kh' ? 'សូមជ្រើសរើសទីតាំង!' : 'Please select a location!');
      return;
    }

    if (!selectedItemId) {
      setErrorMsg(language === 'kh' ? 'សូមជ្រើសរើសសម្ភារៈ!' : 'Please select an item!');
      return;
    }

    if (quantity <= 0) {
      setErrorMsg(language === 'kh' ? 'ចំនួនដកប្រើត្រូវតែធំជាង ០!' : 'Consumption quantity must be greater than 0!');
      return;
    }

    if (quantity > availableQty) {
      setErrorMsg(
        language === 'kh'
          ? `ចំនួនស្តុកបច្ចុប្បន្នមិនគ្រប់គ្រាន់ទេ! ក្នុងស្តុកមានតែ ${availableQty} គ្រឿងប៉ុណ្ណោះ`
          : `Insufficient stock! Selected location has only ${availableQty} units available.`
      );
      return;
    }

    if (!recordedBy.trim()) {
      setErrorMsg(language === 'kh' ? 'សូមបញ្ជាក់ឈ្មោះមន្ត្រីកាត់ស្តុក!' : 'Please specify the recorder name!');
      return;
    }

    onStockOut(selectedLocationId, selectedItemId, quantity, remark, recordedBy);
    setSuccess(true);
    
    // Reset fields
    setSelectedItemId('');
    setQuantity(1);
    setRemark('');

    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

  const selectedItem = items.find((i) => i.id === selectedItemId);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xs border border-border-theme p-6 md:p-8 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#FDF4F2] p-3 rounded-xl text-rose-700">
          <MinusCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text-theme font-sans">
            {language === 'kh' ? 'ដកប្រើប្រាស់សម្ភារៈ (Stock Out)' : 'Stock Out (Consumption)'}
          </h2>
          <p className="text-muted-theme text-sm mt-0.5">
            {language === 'kh' 
              ? 'កាត់កងសម្ភារៈដែលបានយកទៅប្រើប្រាស់ជាក់ស្តែងនៅទីតាំងនីមួយៗ' 
              : 'Record depletion or consumption of materials used in tax operations.'}
          </p>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-start gap-3 animate-slideIn">
          <div className="bg-emerald-500 text-white rounded-full p-1 mt-0.5">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {language === 'kh' ? 'កាត់ស្តុកទទួលបានជោគជ័យ!' : 'Stock Out Recorded!'}
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              {language === 'kh' 
                ? 'ទិន្នន័យត្រូវបានកាត់កងពីទីតាំងដែលបានជ្រើសរើស និងរក្សាទុកក្នុងប្រវត្តិរួចរាល់។' 
                : 'Stock has been deducted from the selected location and saved in logs.'}
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start gap-2 text-sm font-medium">
          <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Location Selection */}
        <div>
          <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
            {language === 'kh' ? 'ជ្រើសរើសទីតាំងកាត់ស្តុក' : 'Location Deleting Stock'}
          </label>
          {isHQUser ? (
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent transition-all text-text-theme font-bold cursor-pointer"
            >
              {accessibleLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {language === 'kh' 
                    ? (loc.nameKh.includes(loc.code) ? loc.nameKh : `${loc.nameKh} (${loc.code})`) 
                    : (loc.nameEn.includes(loc.code) ? loc.nameEn : `${loc.nameEn} (${loc.code})`)}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3.5 bg-[#FAF8F5] border border-border-theme rounded-xl flex items-center justify-between">
              <span className="font-bold text-text-theme text-sm">
                {language === 'kh' 
                  ? locations.find((l) => l.id === currentUserLocationId)?.nameKh 
                  : locations.find((l) => l.id === currentUserLocationId)?.nameEn}
              </span>
              <span className="bg-accent/10 text-accent text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs">
                {language === 'kh' ? 'សាខាផ្ទាល់ខ្លួន' : 'Your Branch'}
              </span>
            </div>
          )}
        </div>

        {/* Item Selection */}
        <div>
          <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
            {language === 'kh' ? 'ជ្រើសរើសសម្ភារៈដកប្រើប្រាស់' : 'Select Material / Supply'}
          </label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent transition-all text-text-theme font-bold cursor-pointer"
          >
            <option value="">{language === 'kh' ? '--- សូមជ្រើសរើសសម្ភារៈក្នុងស្តុក ---' : '--- Choose a Material ---'}</option>
            {items.map((item) => {
              // Show quick stock status in selection list
              const st = stocks.find((s) => s.locationId === selectedLocationId && s.itemId === item.id);
              const qty = st ? st.quantity : 0;
              return (
                <option key={item.id} value={item.id} disabled={qty === 0}>
                  {item.code} - {language === 'kh' ? item.nameKh : item.nameEn} ({qty} {item.unit} {language === 'kh' ? 'ក្នុងស្តុក' : 'available'})
                </option>
              );
            })}
          </select>
        </div>

        {selectedItemId && (
          <div className="p-4 rounded-xl border flex items-center justify-between text-xs bg-[#FAF8F5] border-border-theme text-text-theme">
            <div className="flex items-start gap-2.5">
              <ClipboardCopy className="w-4 h-4 mt-0.5 text-muted-theme" />
              <div>
                <p className="font-bold text-text-theme">
                  {language === 'kh' ? 'ស្តុកបច្ចុប្បន្ននៅទីតាំងនេះ' : 'Current Stock Balance Here'}
                </p>
                <p className="text-[10px] mt-0.5 text-muted-theme">
                  {language === 'kh' ? 'ត្រូវធានាថាមានគ្រប់គ្រាន់មុនកាត់ចេញ' : 'Must have sufficient balance to process.'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-lg font-bold block text-text-theme">
                {availableQty}
              </span>
              <span className="text-[10px] text-muted-theme font-bold">
                {selectedItem?.unit}
              </span>
            </div>
          </div>
        )}

        {/* Quantity and Recorder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
              {language === 'kh' ? 'ចំនួនដកប្រើប្រាស់' : 'Consumption Quantity'}
            </label>
            <input
              type="number"
              min={1}
              max={availableQty}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:bg-white focus:border-accent transition-all text-text-theme font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
              {language === 'kh' ? 'ឈ្មោះមន្ត្រីដកប្រើប្រាស់' : 'Recorded By (Officer)'}
            </label>
            <input
              type="text"
              placeholder={language === 'kh' ? 'ឧ. ចាន់ ធីតា' : 'e.g. Chan Thida'}
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:bg-white focus:border-accent transition-all text-text-theme font-bold"
            />
          </div>
        </div>

        {/* Remark */}
        <div>
          <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
            {language === 'kh' ? 'គោលបំណងនៃការប្រើប្រាស់' : 'Usage Purpose / Remarks'}
          </label>
          <textarea
            rows={2}
            placeholder={language === 'kh' ? 'ឧ. ចែកជូនមន្ត្រីផ្នែកព័ត៌មានវិទ្យាប្រើប្រាស់ប្រចាំថ្ងៃ...' : 'e.g. Distributed to tax collection desks...'}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:bg-white focus:border-accent transition-all text-text-theme"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-4 bg-rose-800 hover:bg-rose-900 text-white font-semibold rounded-xl transition-all duration-200 shadow-xs"
        >
          {language === 'kh' ? 'យល់ព្រមកាត់ចេញពីស្តុក' : 'Confirm Stock Out'}
        </button>
      </form>
    </div>
  );
}
