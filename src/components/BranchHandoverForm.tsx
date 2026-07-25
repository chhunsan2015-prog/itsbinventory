import React, { useState } from 'react';
import { Send, Scan, AlertTriangle, Check, BookOpen, UserCheck, HelpCircle } from 'lucide-react';
import { Location, InventoryItem, Stock, Language } from '../types';

interface BranchHandoverFormProps {
  language: Language;
  locations: Location[];
  items: InventoryItem[];
  stocks: Stock[];
  onHandover: (toLocationId: string, itemId: string, quantity: number, remark: string, recordedBy: string) => void;
}

export default function BranchHandoverForm({
  language,
  locations,
  items,
  stocks,
  onHandover,
}: BranchHandoverFormProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(5);
  const [remark, setRemark] = useState<string>('');
  const [recordedBy, setRecordedBy] = useState<string>('');
  const [scannerActive, setScannerActive] = useState<boolean>(false);
  const [scannerSuccess, setScannerSuccess] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // HQ Location
  const hqLocation = locations.find((l) => l.type === 'HQ') || { id: 'loc-hq' };

  // Branches list (Provincial and Khan, excluding HQ)
  const branches = locations.filter((loc) => loc.type !== 'HQ');
  const provincialBranches = branches.filter((b) => b.type === 'PROVINCIAL');
  const khanBranches = branches.filter((b) => b.type === 'KHAN');
  const centralBranches = branches.filter((b) => b.type === 'CENTRAL');

  // Find HQ stock for the selected item to validate enough availability
  const hqStockItem = stocks.find((s) => s.locationId === hqLocation.id && s.itemId === selectedItemId);
  const availableHqQty = hqStockItem ? hqStockItem.quantity : 0;

  // Handles simulated barcode scan
  const handleSimulatedScan = (item: InventoryItem) => {
    setScannerActive(true);
    setScannerSuccess(false);
    
    // Simulate scanner beep and load
    setTimeout(() => {
      setSelectedItemId(item.id);
      setScannerActive(false);
      setScannerSuccess(true);
      setTimeout(() => setScannerSuccess(false), 2000);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccess(false);

    if (!selectedBranchId) {
      setErrorMsg(language === 'kh' ? 'សូមជ្រើសរើសសាខាទទួល!' : 'Please select a receiving branch!');
      return;
    }

    if (!selectedItemId) {
      setErrorMsg(language === 'kh' ? 'សូមជ្រើសរើស ឬស្កេនសម្ភារៈ!' : 'Please select or scan an item!');
      return;
    }

    if (quantity <= 0) {
      setErrorMsg(language === 'kh' ? 'ចំនួនផ្ទេរត្រូវតែធំជាង ០!' : 'Transfer quantity must be greater than 0!');
      return;
    }

    if (quantity > availableHqQty) {
      setErrorMsg(
        language === 'kh'
          ? `ស្តុកកណ្តាលពុំមានទំនិញគ្រប់គ្រាន់ទេ! ស្តុកបច្ចុប្បន្ន៖ ${availableHqQty} គ្រឿង`
          : `Insufficient stock at HQ! Current available stock: ${availableHqQty} units`
      );
      return;
    }

    if (!recordedBy.trim()) {
      setErrorMsg(language === 'kh' ? 'សូមបញ្ជាក់ឈ្មោះមន្ត្រីផ្ទេរ!' : 'Please specify the transfer officer name!');
      return;
    }

    onHandover(selectedBranchId, selectedItemId, quantity, remark, recordedBy);
    setSuccess(true);

    // Reset form fields
    setSelectedItemId('');
    setQuantity(5);
    setRemark('');
    // Keep recordedBy and selectedBranchId for fast repetitive input

    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

  const selectedItem = items.find((i) => i.id === selectedItemId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
      
      {/* Simulation/Barcode Panel */}
      <div className="lg:col-span-1 bg-[#18221E] text-white rounded-2xl p-6 border border-[#24352F] shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Scan className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-sm tracking-wider uppercase text-[#EAD8C3]">
              {language === 'kh' ? 'ប្រព័ន្ធស្កេនបាកូដ (សិប្បនិម្មិត)' : 'Simulated Barcode Scanner'}
            </h3>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed mb-6">
            {language === 'kh'
              ? 'ចុចលើផលិតផលខាងក្រោមដើម្បីសាកល្បងមុខងារ «ស្កេនបាកូដសម្ភារៈ» ដែលបញ្ជូនទិន្នន័យចូលក្នុងទម្រង់បែបបទភ្លាមៗ។'
              : 'Click on any product badge below to simulate scanning its barcode physical tag directly into the transfer form.'}
          </p>

          <div className="space-y-3">
            {items.map((item) => {
              const hqItemStock = stocks.find((s) => s.locationId === hqLocation.id && s.itemId === item.id);
              const qty = hqItemStock ? hqItemStock.quantity : 0;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSimulatedScan(item)}
                  disabled={qty === 0}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between text-xs group ${
                    qty === 0
                      ? 'bg-black/30 border-stone-800 text-stone-600 cursor-not-allowed'
                      : selectedItemId === item.id
                      ? 'bg-accent/20 border-accent text-[#EAD8C3]'
                      : 'bg-[#121A17] border-[#24352F] hover:border-[#24352F]/80 text-stone-300'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-mono text-[10px] font-bold text-accent block group-hover:text-stone-100">
                      ||||| {item.code}
                    </span>
                    <span className="truncate block font-semibold text-white mt-0.5">
                      {language === 'kh' ? item.nameKh : item.nameEn}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded flex-shrink-0 ${
                    qty === 0 ? 'bg-[#121A17] text-stone-600' : 'bg-primary/30 text-accent'
                  }`}>
                    {qty} {item.unit}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-[#24352F]/60 text-[11px] text-stone-400 flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" />
          <span>
            {language === 'kh' ? 'កាត់ស្តុក HQ និងបន្ថែមទៅសាខាដោយស្វ័យប្រវត្តិ។' : 'HQ stock decreases while branch stock increases synchronously.'}
          </span>
        </div>
      </div>

      {/* Main Handover Form */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-border-theme">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-3 rounded-xl text-primary">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-text-theme font-sans">
              {language === 'kh' ? 'ប្រគល់សម្ភារៈឱ្យសាខា (Branch Handover)' : 'Branch Handover (Transfer to Branch)'}
            </h2>
            <p className="text-muted-theme text-sm mt-0.5">
              {language === 'kh'
                ? 'កាត់ស្តុកពី «ទីស្នាក់ការកណ្តាល (HQ)» ហើយបូកបញ្ចូលស្តុក «សាខាពន្ធដារខេត្ត/ខណ្ឌ» ដោយស្វ័យប្រវត្តិ'
                : 'Transfer physical materials from Headquarters directly into selected district/provincial branches.'}
            </p>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-start gap-3 animate-slideIn">
            <div className="bg-emerald-500 text-white rounded-full p-1 mt-0.5">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-sm">{language === 'kh' ? 'ការផ្ទេរជោគជ័យ!' : 'Transfer Successful!'}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {language === 'kh'
                  ? 'ស្តុកកណ្តាលត្រូវបានកាត់កង និងបូកបន្ថែមទៅសាខាគោលដៅប្រកបដោយជោគជ័យក្នុង Transaction តែមួយ។'
                  : 'HQ inventory deducted, and target branch stock incremented inside one secure atomic transaction.'}
              </p>
            </div>
          </div>
        )}

        {scannerActive && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center gap-3 animate-pulse">
            <Scan className="w-5 h-5 text-primary animate-spin" />
            <span className="text-sm font-bold">
              {language === 'kh' ? 'កំពង់អានបាកូដសម្ភារៈ...' : 'Reading simulated barcode...'}
            </span>
          </div>
        )}

        {scannerSuccess && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>
              {language === 'kh' ? 'ស្កេនសម្ភារៈបានជោគជ័យ និងជ្រើសរើសរួចរាល់!' : 'Barcode successfully parsed and item loaded!'}
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-[#FDF4F2] border border-rose-100 text-rose-800 rounded-xl flex items-start gap-2.5 text-sm font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. From Location (HQ) & To Location (Branch selection) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-2">
                {language === 'kh' ? 'ចេញពីស្តុកកណ្តាល' : 'From Location (Source)'}
              </label>
              <div className="p-3 bg-[#FAF8F5] border border-border-theme rounded-xl flex items-center gap-2 text-sm text-text-theme font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span>{language === 'kh' ? 'ទីស្នាក់ការកណ្តាល (GDT HQ)' : 'General Headquarters (GDT HQ)'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
                {language === 'kh' ? 'ប្រគល់ជូនសាខាពន្ធដារគោលដៅ' : 'To Branch (Destination)'}
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent transition-all text-text-theme font-bold cursor-pointer"
              >
                <option value="">{language === 'kh' ? '--- សូមជ្រើសរើសសាខាពន្ធដារ ---' : '--- Choose Tax Branch ---'}</option>
                
                <optgroup label={language === 'kh' ? 'ស្តុកថ្នាក់កណ្តាល (Central stock)' : 'Central Stock'}>
                  {centralBranches.map((central) => (
                    <option key={central.id} value={central.id}>
                      {language === 'kh' 
                        ? (central.nameKh.includes(central.code) ? central.nameKh : `${central.nameKh} (${central.code})`) 
                        : (central.nameEn.includes(central.code) ? central.nameEn : `${central.nameEn} (${central.code})`)}
                    </option>
                  ))}
                </optgroup>

                <optgroup label={language === 'kh' ? 'សាខាពន្ធដារខេត្ត (Provincial branches)' : 'Provincial Tax Branches'}>
                  {provincialBranches.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {language === 'kh' 
                        ? (prov.nameKh.includes(prov.code) ? prov.nameKh : `${prov.nameKh} (${prov.code})`) 
                        : (prov.nameEn.includes(prov.code) ? prov.nameEn : `${prov.nameEn} (${prov.code})`)}
                    </option>
                  ))}
                </optgroup>

                <optgroup label={language === 'kh' ? 'សាខាពន្ធដារខណ្ឌ (Khan branches)' : 'Khan District Branches'}>
                  {khanBranches.map((khan) => (
                    <option key={khan.id} value={khan.id}>
                      {language === 'kh' 
                        ? (khan.nameKh.includes(khan.code) ? khan.nameKh : `${khan.nameKh} (${khan.code})`) 
                        : (khan.nameEn.includes(khan.code) ? khan.nameEn : `${khan.nameEn} (${khan.code})`)}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* 2. Select / Scan Item */}
          <div>
            <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
              {language === 'kh' ? 'សម្ភារៈដែលត្រូវផ្ទេរ' : 'Material / Supply to Transfer'}
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent transition-all text-text-theme font-bold cursor-pointer"
            >
              <option value="">{language === 'kh' ? '--- ជ្រើសរើសផលិតផល ឬប្រើបន្ទះស្កេនខាងឆ្វេង ---' : '--- Select Product or use Left Scanner Panel ---'}</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} - {language === 'kh' ? item.nameKh : item.nameEn} ({item.unit})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Availability and Status */}
          {selectedItemId && (
            <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
              availableHqQty === 0
                ? 'bg-[#FDF4F2] border-rose-100 text-rose-800'
                : availableHqQty < (selectedItem?.minStock || 10)
                ? 'bg-[#FDF9F2] border-amber-100 text-amber-800'
                : 'bg-primary/10 border-primary/20 text-primary'
            }`}>
              <div className="flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 mt-0.5" />
                <div>
                  <p className="font-bold">
                    {language === 'kh' ? 'កម្រិតស្តុកនៅទីស្នាក់ការកណ្តាល (HQ Stock)' : 'Headquarters Stock Availability'}
                  </p>
                  <p className="text-[10px] mt-0.5 text-muted-theme leading-normal">
                    {language === 'kh'
                      ? `សម្ភារៈ៖ ${selectedItem ? (language === 'kh' ? selectedItem.nameKh : selectedItem.nameEn) : ''}`
                      : `Item: ${selectedItem ? selectedItem.nameEn : ''}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg font-bold block leading-none">
                  {availableHqQty}
                </span>
                <span className="text-[9px] font-semibold opacity-85">
                  {selectedItem?.unit}
                </span>
              </div>
            </div>
          )}

          {/* 4. Quantity & Recorded By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
                {language === 'kh' ? 'ចំនួនផ្ទេរ' : 'Transfer Quantity'}
              </label>
              <input
                type="number"
                min={1}
                max={availableHqQty}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:bg-white focus:border-accent transition-all text-text-theme font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
                {language === 'kh' ? 'ឈ្មោះមន្ត្រីផ្ទេរ (Recorded By)' : 'Transfer Officer Name'}
              </label>
              <input
                type="text"
                placeholder={language === 'kh' ? 'ឧ. សេង វឌ្ឍនា' : 'e.g. Seng Vattana'}
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:bg-white focus:border-accent transition-all text-text-theme font-bold"
              />
            </div>
          </div>

          {/* 5. Remark */}
          <div>
            <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
              {language === 'kh' ? 'មូលហេតុ ឬលេខលិខិតបញ្ជាផ្ទេរ' : 'Transfer Remark / Directive Number'}
            </label>
            <textarea
              rows={2}
              placeholder={language === 'kh' ? 'ឧ. លិខិតលេខ ១២៣ អពដ ឬតម្រូវការបន្ទាន់...' : 'Provide background, dispatch voucher number, or purpose...'}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:bg-white focus:border-accent transition-all text-text-theme"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-primary hover:bg-[#1E332B] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
          >
            <UserCheck className="w-5 h-5" />
            {language === 'kh' ? 'បញ្ជូនសម្ភារៈទៅសាខាគោលដៅ' : 'Authorize Branch Handover'}
          </button>
        </form>
      </div>
    </div>
  );
}
