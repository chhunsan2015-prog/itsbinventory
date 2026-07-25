import React, { useState } from 'react';
import { PlusCircle, Check, Info, FileText, Layers, Tag, HelpCircle, Eye } from 'lucide-react';
import { Language, InventoryItem } from '../types';

interface AddMaterialFormProps {
  language: Language;
  existingItems: InventoryItem[];
  onAddMaterial: (newItem: InventoryItem, initialHqStock: number) => void;
}

export default function AddMaterialForm({ language, existingItems, onAddMaterial }: AddMaterialFormProps) {
  const [nameKh, setNameKh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('សម្ភារ Tools Support');
  const [unit, setUnit] = useState('គ្រឿង');
  const [minStock, setMinStock] = useState<number>(5);
  const [initialHqStock, setInitialHqStock] = useState<number>(0);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Extract unique categories from existing items to pre-fill or suggest
  const existingCategories = Array.from(new Set(existingItems.map(item => item.category)));

  // Suggest a code based on category and current item length
  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    const prefix = cat === 'សម្ភារ Tools Support' ? 'TLS-' : 'SUP-';
    const count = existingItems.filter(item => item.category === cat).length + 1;
    setCode(`${prefix}NEW-${count}`);
  };

  const handleAutoGenerateCode = () => {
    const prefix = category === 'សម្ភារ Tools Support' ? 'TLS-' : 'SUP-';
    const cleanName = nameEn.toUpperCase().replace(/[^A-Z0-9]/g, '-').substring(0, 8);
    const suffix = cleanName ? cleanName : Math.floor(Math.random() * 1000).toString();
    setCode(`${prefix}${suffix}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccess(false);

    if (!nameKh.trim()) {
      setErrorMsg(language === 'kh' ? 'សូមបញ្ចូលឈ្មោះសម្ភារៈជាភាសាខ្មែរ!' : 'Please enter the material name in Khmer!');
      return;
    }

    if (!nameEn.trim()) {
      setErrorMsg(language === 'kh' ? 'សូមបញ្ចូលឈ្មោះសម្ភារៈជាភាសាអង់គ្លេស!' : 'Please enter the material name in English!');
      return;
    }

    if (!code.trim()) {
      setErrorMsg(language === 'kh' ? 'សូមបញ្ចូលកូដសម្ភារៈ!' : 'Please enter the material code!');
      return;
    }

    // Check duplicate code
    const isDuplicateCode = existingItems.some(item => item.code.toUpperCase() === code.trim().toUpperCase());
    if (isDuplicateCode) {
      setErrorMsg(language === 'kh' ? 'កូដសម្ភារៈនេះមានក្នុងប្រព័ន្ធរួចហើយ!' : 'This material code already exists in the system!');
      return;
    }

    const newItemId = `item-custom-${Date.now()}`;
    const newItem: InventoryItem = {
      id: newItemId,
      code: code.trim().toUpperCase(),
      nameKh: nameKh.trim(),
      nameEn: nameEn.trim(),
      category,
      unit: unit.trim(),
      minStock: Math.max(0, minStock)
    };

    onAddMaterial(newItem, Math.max(0, initialHqStock));
    setSuccess(true);

    // Reset Form Fields
    setNameKh('');
    setNameEn('');
    setCode('');
    setMinStock(5);
    setInitialHqStock(0);

    setTimeout(() => {
      setSuccess(false);
    }, 5000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xs border border-border-theme p-6 md:p-8 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-xl text-primary">
          <PlusCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text-theme">
            {language === 'kh' ? 'ចុះឈ្មោះសម្ភារៈថ្មី (Register Material)' : 'Register New Material'}
          </h2>
          <p className="text-muted-theme text-sm mt-0.5">
            {language === 'kh' 
              ? 'បន្ថែមមុខទំនិញ ឬឈ្មោះសម្ភារៈថ្មីស្រឡាងចូលក្នុងប្រព័ន្ធគ្រប់គ្រងស្តុក' 
              : 'Introduce a brand-new material or spare part specification into the register.'}
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
              {language === 'kh' ? 'បានរក្សាទុកដោយជោគជ័យ!' : 'Successfully Registered!'}
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              {language === 'kh' 
                ? 'ឈ្មោះសម្ភារៈថ្មីត្រូវបានបញ្ចូលទៅក្នុងបញ្ជីប្រព័ន្ធ និងអាចប្រើប្រាស់ក្នុងប្រតិបត្តិការស្តុកផ្សេងៗបានភ្លាមៗ។' 
                : 'The new material has been saved to the database. You can now use it in all stock operations.'}
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start gap-2 text-sm font-medium">
          <Info className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Category Choice */}
        <div>
          <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
            {language === 'kh' ? 'ប្រភេទសម្ភារៈ' : 'Material Category'}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {existingCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`py-3 px-4 rounded-xl border text-xs font-bold text-center transition-all ${
                  category === cat
                    ? 'bg-primary/10 text-primary border-primary shadow-xs'
                    : 'bg-[#FAF8F5] text-muted-theme border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Khmer Name and English Name Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
              {language === 'kh' ? 'ឈ្មោះសម្ភារៈ (ភាសាខ្មែរ)' : 'Material Name (Khmer)'}
            </label>
            <input
              type="text"
              placeholder={language === 'kh' ? 'ឧ. ខ្សែកាបអុបទិក' : 'Khmer label'}
              value={nameKh}
              onChange={(e) => setNameKh(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF8F5] focus:bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent transition-all text-text-theme font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
              {language === 'kh' ? 'ឈ្មោះសម្ភារៈ (ភាសាអង់គ្លេស)' : 'Material Name (English)'}
            </label>
            <input
              type="text"
              placeholder={language === 'kh' ? 'ឧ. Fiber Optic Cable' : 'e.g. Fiber Optic Cable'}
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF8F5] focus:bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent transition-all text-text-theme font-bold"
            />
          </div>
        </div>

        {/* Code & Unit Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider">
                {language === 'kh' ? 'កូដសម្ភារៈ' : 'Material Code'}
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateCode}
                className="text-[10px] text-primary hover:underline font-bold"
              >
                {language === 'kh' ? 'បង្កើតកូដស្វ័យប្រវត្ត' : 'Auto Generate'}
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. TLS-CABLE-FIBER"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF8F5] focus:bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent transition-all text-text-theme font-mono font-bold uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
              {language === 'kh' ? 'ឯកតាគិតជា' : 'Unit of Measure'}
            </label>
            <input
              type="text"
              placeholder={language === 'kh' ? 'គ្រឿង, ដុំ, កេស, រាម...' : 'e.g. units, rolls, boxes, reams...'}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF8F5] focus:bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent transition-all text-text-theme font-bold"
            />
          </div>
        </div>

        {/* Min Stock Alert Limit & Optional Initial HQ Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
              {language === 'kh' ? 'កម្រិតស្តុកទាបបំផុតសម្រាប់ការព្រមាន' : 'Low Stock Alert Threshold'}
            </label>
            <input
              type="number"
              min={0}
              value={minStock}
              onChange={(e) => setMinStock(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-3 bg-[#FAF8F5] focus:bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent transition-all text-text-theme font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
              {language === 'kh' ? 'បរិមាណស្តុកដើមគ្រានៅ HQ (ជម្រើស)' : 'Initial Stock at HQ (Optional)'}
            </label>
            <input
              type="number"
              min={0}
              value={initialHqStock}
              onChange={(e) => setInitialHqStock(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-3 bg-[#FAF8F5] focus:bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent transition-all text-text-theme font-mono font-bold"
            />
          </div>
        </div>

        {/* Live Preview Info */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs flex gap-3 text-muted-theme">
          <Eye className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-primary mb-1">
              {language === 'kh' ? 'ការបង្ហាញព័ត៌មានជាក់ស្តែងមុនពេលចុះឈ្មោះ' : 'Live Item Metadata Preview'}
            </p>
            <p className="leading-relaxed">
              {language === 'kh' 
                ? `កូដសម្ភារៈ៖ ${code || '---'} • ឈ្មោះ៖ ${nameKh || '---'} (${nameEn || '---'}) • ឯកតា៖ ${unit || '---'} • កម្រិតស្តុក៖ ${minStock} ${unit || ''}`
                : `Item Code: ${code || '---'} • Label: ${nameKh || '---'} (${nameEn || '---'}) • Unit: ${unit || '---'} • Alert Level: ${minStock} ${unit || ''}`
              }
            </p>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-3.5 px-4 bg-primary hover:bg-[#1E332B] text-white font-bold rounded-xl transition-all duration-200 shadow-sm"
        >
          {language === 'kh' ? 'យល់ព្រមចុះឈ្មោះសម្ភារៈថ្មី' : 'Confirm Registration'}
        </button>
      </form>
    </div>
  );
}
