import React, { useState } from 'react';
import { Sliders, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Location, InventoryItem, Stock, Language } from '../types';

interface StockAdjustmentFormProps {
  language: Language;
  locations: Location[];
  items: InventoryItem[];
  stocks: Stock[];
  currentUserLocationId: string;
  onAdjust: (locationId: string, itemId: string, newQuantity: number, remark: string, recordedBy: string) => void;
}

export default function StockAdjustmentForm({
  language,
  locations,
  items,
  stocks,
  currentUserLocationId,
  onAdjust,
}: StockAdjustmentFormProps) {
  const [selectedLocationId, setSelectedLocationId] = useState<string>(currentUserLocationId);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [actualQuantity, setActualQuantity] = useState<number>(0);
  const [remark, setRemark] = useState<string>('');
  const [recordedBy, setRecordedBy] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // HQ can adjust any stock, Branch can only adjust their own location
  const isHQUser = currentUserLocationId === 'loc-hq';
  const accessibleLocations = locations.filter((loc) => {
    if (isHQUser) return true;
    return loc.id === currentUserLocationId;
  });

  // Calculate current stock at selected location for selected item
  const currentStockItem = stocks.find((s) => s.locationId === selectedLocationId && s.itemId === selectedItemId);
  const systemQty = currentStockItem ? currentStockItem.quantity : 0;

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

    if (actualQuantity < 0) {
      setErrorMsg(language === 'kh' ? 'ចំនួនពិតប្រាកដមិនអាចទាបជាងសូន្យទេ!' : 'Physical count cannot be less than 0!');
      return;
    }

    if (!recordedBy.trim()) {
      setErrorMsg(language === 'kh' ? 'សូមបញ្ជាក់ឈ្មោះមន្ត្រីធ្វើសារពើភ័ណ្ឌ!' : 'Please specify the audit officer name!');
      return;
    }

    onAdjust(selectedLocationId, selectedItemId, actualQuantity, remark, recordedBy);
    setSuccess(true);

    // Reset fields
    setSelectedItemId('');
    setActualQuantity(0);
    setRemark('');

    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

  const selectedItem = items.find((i) => i.id === selectedItemId);
  const difference = actualQuantity - systemQty;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xs border border-border-theme p-6 md:p-8 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-accent/10 p-3 rounded-xl text-accent">
          <Sliders className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text-theme font-sans">
            {language === 'kh' ? 'កែតម្រូវស្តុកជាក់ស្តែង (Stock Adjustment)' : 'Stock Adjustment (Audit)'}
          </h2>
          <p className="text-muted-theme text-sm mt-0.5">
            {language === 'kh' 
              ? 'កែតម្រូវចំនួនក្នុងប្រព័ន្ធឱ្យត្រូវនឹង «ចំនួនរាប់ឃើញជាក់ស្តែង» ពេលធ្វើសារពើភ័ណ្ឌ' 
              : 'Reconcile digital inventory discrepancies with actual physical warehouse counts.'}
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
              {language === 'kh' ? 'កែតម្រូវជោគជ័យ!' : 'Adjustment Saved!'}
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              {language === 'kh' 
                ? 'ទិន្នន័យស្តុកត្រូវបានកែសម្រួលឡើងវិញតាមចំនួនជាក់ស្តែងដោយជោគជ័យ។' 
                : 'Digital balances have been overwritten to match actual physical audit counts.'}
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
        {/* Location Select */}
        <div>
          <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
            {language === 'kh' ? 'ទីតាំងរាប់ស្តុក' : 'Audit Location'}
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

        {/* Item Select */}
        <div>
          <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
            {language === 'kh' ? 'ជ្រើសរើសសម្ភារៈរាប់' : 'Select Item under Audit'}
          </label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent transition-all text-text-theme font-bold cursor-pointer"
          >
            <option value="">{language === 'kh' ? '--- សូមជ្រើសរើសសម្ភារៈ ---' : '--- Choose a Material ---'}</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code} - {language === 'kh' ? item.nameKh : item.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* System vs Actual Comparison Card */}
        {selectedItemId && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs animate-fadeIn">
            <div className="text-center p-2 bg-white rounded-lg border border-stone-100 shadow-xs">
              <span className="text-muted-theme font-semibold block mb-1">
                {language === 'kh' ? 'ក្នុងប្រព័ន្ធ (System)' : 'Digital Record'}
              </span>
              <span className="font-mono text-base font-bold text-text-theme">
                {systemQty}
              </span>
              <span className="text-[10px] block text-muted-theme mt-0.5">{selectedItem?.unit}</span>
            </div>

            <div className="text-center p-2 bg-white rounded-lg border border-stone-100 shadow-xs">
              <span className="text-muted-theme font-semibold block mb-1">
                {language === 'kh' ? 'ចំនួនជាក់ស្តែង (Actual)' : 'Physical Count'}
              </span>
              <span className="font-mono text-base font-bold text-accent">
                {actualQuantity}
              </span>
              <span className="text-[10px] block text-muted-theme mt-0.5">{selectedItem?.unit}</span>
            </div>

            <div className="text-center p-2 bg-white rounded-lg border border-stone-100 shadow-xs flex flex-col justify-center">
              <span className="text-muted-theme font-semibold block mb-1">
                {language === 'kh' ? 'លទ្ធផលខុសគ្នា (Diff)' : 'Discrepancy'}
              </span>
              <span className={`font-mono text-base font-bold leading-none ${
                difference === 0 
                  ? 'text-muted-theme' 
                  : difference > 0 
                  ? 'text-primary' 
                  : 'text-rose-600'
              }`}>
                {difference > 0 ? `+${difference}` : difference}
              </span>
              <span className="text-[9px] text-muted-theme mt-1 font-semibold">
                {difference === 0 
                  ? (language === 'kh' ? 'គ្មានលំអៀង' : 'Balanced') 
                  : difference > 0 
                  ? (language === 'kh' ? 'កើនឡើង' : 'Surplus') 
                  : (language === 'kh' ? 'ខ្វះខាត' : 'Deficit')}
              </span>
            </div>
          </div>
        )}

        {/* Quantity Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
              {language === 'kh' ? 'ចំនួនរាប់ជាក់ស្តែង (Physical Count)' : 'Actual Physical Count'}
            </label>
            <input
              type="number"
              min={0}
              value={actualQuantity}
              onChange={(e) => setActualQuantity(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:bg-white focus:border-accent transition-all text-text-theme font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
              {language === 'kh' ? 'ឈ្មោះមន្ត្រីធ្វើសារពើភ័ណ្ឌ' : 'Auditor / Officer Name'}
            </label>
            <input
              type="text"
              placeholder={language === 'kh' ? 'ឧ. សុខ ម៉េង' : 'e.g. Sok Meng'}
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:bg-white focus:border-accent transition-all text-text-theme font-bold"
            />
          </div>
        </div>

        {/* Remark / Reason */}
        <div>
          <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
            {language === 'kh' ? 'ហេតុផលនៃការលំអៀង និងលិខិតបញ្ជាក់' : 'Adjustment Justification / Reason'}
          </label>
          <textarea
            rows={2}
            placeholder={language === 'kh' ? 'ឧ. បាត់បង់ដោយសារការខូចខាត ឬការច្រឡំរាប់កាលពីខែមុន...' : 'Provide context on why the count differed from the system records...'}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:bg-white focus:border-accent transition-all text-text-theme"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-4 bg-accent hover:bg-[#A88863] text-stone-900 font-bold rounded-xl transition-all duration-200 shadow-xs"
        >
          {language === 'kh' ? 'យល់ព្រមកែតម្រូវទិន្នន័យប្រព័ន្ធ' : 'Reconcile and Commit Adjustment'}
        </button>
      </form>
    </div>
  );
}
