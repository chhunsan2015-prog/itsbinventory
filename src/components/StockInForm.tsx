import React, { useState } from 'react';
import { 
  PlusCircle, 
  Info, 
  Check, 
  Package, 
  Layers, 
  Laptop, 
  Printer, 
  FileText, 
  Wrench, 
  Hammer, 
  ArrowUpRight, 
  Clock, 
  User 
} from 'lucide-react';
import { Location, InventoryItem, Language, Transaction } from '../types';

interface StockInFormProps {
  language: Language;
  items: InventoryItem[];
  onStockIn: (itemId: string, quantity: number, remark: string, recordedBy: string) => void;
  transactions?: Transaction[];
}

export default function StockInForm({ language, items, onStockIn, transactions = [] }: StockInFormProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(10);
  const [remark, setRemark] = useState<string>('');
  const [recordedBy, setRecordedBy] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccess(false);

    if (!selectedItemId) {
      setErrorMsg(language === 'kh' ? 'សូមជ្រើសរើសសម្ភារៈ!' : 'Please select a material!');
      return;
    }

    if (quantity <= 0) {
      setErrorMsg(language === 'kh' ? 'ចំនួនត្រូវតែធំជាង ០!' : 'Quantity must be greater than 0!');
      return;
    }

    if (!recordedBy.trim()) {
      setErrorMsg(language === 'kh' ? 'សូមបញ្ជាក់ឈ្មោះអ្នកបញ្ចូល!' : 'Please specify the recorder name!');
      return;
    }

    onStockIn(selectedItemId, quantity, remark, recordedBy);
    setSuccess(true);
    
    // Reset form fields
    setSelectedItemId('');
    setQuantity(10);
    setRemark('');
    // Keep recordedBy for convenience in subsequent inputs

    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

  const selectedItem = items.find((i) => i.id === selectedItemId);

  // Filter only STOCK_IN transactions for the list
  const stockInTransactions = transactions.filter((tx) => tx.type === 'STOCK_IN');

  const getItemIcon = (code: string, nameKh: string) => {
    const codeLower = code.toLowerCase();
    const nameLower = nameKh.toLowerCase();
    
    if (codeLower.includes('laptop') || nameLower.includes('ឡេបថប') || nameLower.includes('កុំព្យូទ័រ')) {
      return <Laptop className="w-4 h-4 text-indigo-600 flex-shrink-0" />;
    }
    if (codeLower.includes('print') || nameLower.includes('ម៉ាស៊ីនបោះពុម្ព') || nameLower.includes('ព្រីន')) {
      return <Printer className="w-4 h-4 text-sky-600 flex-shrink-0" />;
    }
    if (codeLower.includes('paper') || nameLower.includes('ក្រដាស') || nameLower.includes('រាម')) {
      return <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />;
    }
    if (codeLower.includes('tool') || nameLower.includes('ធុងសម្ភារ') || nameLower.includes('ប្រអប់') || codeLower.includes('box')) {
      return <Wrench className="w-4 h-4 text-emerald-600 flex-shrink-0" />;
    }
    if (codeLower.includes('bosch') || codeLower.includes('screw') || codeLower.includes('drill') || nameLower.includes('ម៉ូទ័រ') || nameLower.includes('ទួណឺវីស') || nameLower.includes('ស្វាន')) {
      return <Hammer className="w-4 h-4 text-[#2D4A3E] flex-shrink-0" />;
    }
    return <Package className="w-4 h-4 text-stone-500 flex-shrink-0" />;
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      const day = String(d.getDate()).padStart(2, '0');
      const monthsKh = ['មករា', 'កក្កដា', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const month = language === 'kh' ? monthsKh[d.getMonth()] : monthsEn[d.getMonth()];
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      
      return `${day} ${month} ${year}, ${hours}:${minutes}`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stock In Form Card */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xs border border-border-theme p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-3 rounded-xl text-primary">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-text-theme">
              {language === 'kh' ? 'បញ្ចូលស្តុកថ្មី (Stock In)' : 'Stock In (Incoming Materials)'}
            </h2>
            <p className="text-muted-theme text-sm mt-0.5">
              {language === 'kh' 
                ? 'ទិញចូល ឬបន្ថែមសម្ភារៈថ្មីៗទៅក្នុង «ស្តុកកណ្តាល (HQ)» តែប៉ុណ្ណោះ' 
                : 'Add new inventory supplies directly to General Headquarters (HQ) stock.'}
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
                {language === 'kh' ? 'ជោគជ័យ!' : 'Success!'}
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {language === 'kh' 
                  ? 'សម្ភារៈត្រូវបានបន្ថែមទៅក្នុងស្តុកកណ្តាល (HQ) និងកត់ត្រាទុកក្នុងប្រវត្តិដោយជោគជ័យ។' 
                  : 'Stock has been added to HQ and recorded in audit transaction logs successfully.'}
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
          {/* Destination Location Info (Immutable) */}
          <div>
            <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-2">
              {language === 'kh' ? 'ទីតាំងទទួលស្តុក' : 'Destination Storage'}
            </label>
            <div className="p-3.5 bg-[#FAF8F5] border border-border-theme rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="font-semibold text-text-theme text-sm">
                  {language === 'kh' ? 'អគ្គនាយកដ្ឋានពន្ធដារ (ទីស្នាក់ការកណ្តាល)' : 'GDT General Headquarters (HQ)'}
                </span>
              </div>
              <span className="bg-primary/10 text-primary text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase shadow-xs">
                Fixed: HQ Only
              </span>
            </div>
          </div>

          {/* Item Selection */}
          <div>
            <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
              {language === 'kh' ? 'ជ្រើសរើសសម្ភារៈ' : 'Select Material / Supply Item'}
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent transition-all text-text-theme font-bold cursor-pointer"
            >
              <option value="">{language === 'kh' ? '--- សូមជ្រើសរើសសម្ភារៈក្នុងបញ្ជី ---' : '--- Choose a Material ---'}</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} - {language === 'kh' ? item.nameKh : item.nameEn} ({item.unit})
                </option>
              ))}
            </select>
          </div>

          {selectedItem && (
            <div className="p-4 bg-[#FAF8F5]/80 rounded-xl border border-dashed border-border-theme grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted-theme font-bold">{language === 'kh' ? 'ប្រភេទសម្ភារៈ' : 'Category'}</p>
                <p className="text-text-theme mt-1 font-bold">{selectedItem.category}</p>
              </div>
              <div>
                <p className="text-muted-theme font-bold">{language === 'kh' ? 'កម្រិតស្តុកទាបបំផុត' : 'Minimum Alert Threshold'}</p>
                <p className="text-text-theme mt-1 font-mono font-bold">{selectedItem.minStock} {selectedItem.unit}</p>
              </div>
            </div>
          )}

          {/* Quantity and Recorded By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
                {language === 'kh' ? 'បរិមាណបញ្ចូល' : 'Incoming Quantity'}
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:bg-white focus:border-accent transition-all text-text-theme font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
                {language === 'kh' ? 'ឈ្មោះមន្ត្រីបញ្ចូល' : 'Recorded By (Officer)'}
              </label>
              <input
                type="text"
                placeholder={language === 'kh' ? 'ឧ. គឹម ស៊ាង' : 'e.g. Kim Seang'}
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:bg-white focus:border-accent transition-all text-text-theme font-bold"
              />
            </div>
          </div>

          {/* Remark / Description */}
          <div>
            <label className="block text-xs font-bold text-muted-theme uppercase tracking-wider mb-2">
              {language === 'kh' ? 'កំណត់ចំណាំផ្សេងៗ' : 'Remark / Details'}
            </label>
            <textarea
              rows={3}
              placeholder={language === 'kh' ? 'ពន្យល់ពីប្រភព ឬគម្រោងទិញសម្ភារៈនេះ...' : 'Provide details, invoice number, or procurement batch info...'}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent/30 focus:bg-white focus:border-accent transition-all text-text-theme"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-primary hover:bg-[#1E332B] text-white font-semibold rounded-xl transition-all duration-200 shadow-sm"
          >
            {language === 'kh' ? 'យល់ព្រមបញ្ចូលក្នុងស្តុកកណ្តាល' : 'Confirm Stock In'}
          </button>
        </form>
      </div>

      {/* List of Newly Received Materials Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-border-theme p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-theme">
                {language === 'kh' ? 'បញ្ជីសម្ភារដែលបានបញ្ចូលថ្មី' : 'Newly Added Materials Register'}
              </h3>
              <p className="text-xs text-muted-theme mt-0.5">
                {language === 'kh' 
                  ? 'កំណត់ត្រានៃការនាំចូល និងទិញបន្ថែមសម្ភារៈមកកាន់ស្តុកថ្នាក់កណ្តាល (HQ)' 
                  : 'Historical audit record of materials loaded into the GDT central HQ inventory.'}
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold bg-[#FAF8F5] text-primary px-3 py-1.5 rounded-full border border-border-theme/75 self-start sm:self-center">
            {language === 'kh' 
              ? `សរុប៖ ${stockInTransactions.length} កំណត់ត្រា` 
              : `Total: ${stockInTransactions.length} records`}
          </span>
        </div>

        {stockInTransactions.length === 0 ? (
          <div className="text-center py-12 bg-[#FAF8F5]/50 rounded-2xl border border-dashed border-border-theme">
            <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-muted-theme text-xs font-bold">
              {language === 'kh' ? 'មិនទាន់មានទិន្នន័យបញ្ចូលស្តុកថ្មីនៅឡើយទេ' : 'No incoming materials recorded yet'}
            </p>
            <p className="text-stone-400 text-[11px] mt-1">
              {language === 'kh' ? 'បំពេញទម្រង់ខាងលើ ដើម្បីចាប់ផ្តើមបញ្ចូលស្តុកថ្មី។' : 'Please submit the form above to add your first stock-in record.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-border-theme/60 rounded-2xl shadow-2xs">
            <table className="w-full border-collapse text-left text-xs min-w-[850px]">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-border-theme/60 text-muted-theme font-bold">
                  <th className="p-3.5 pl-4 font-bold text-center w-12">{language === 'kh' ? 'ល.រ' : 'No.'}</th>
                  <th className="p-3.5 font-bold min-w-[200px]">{language === 'kh' ? 'កូដ / សម្ភារៈ' : 'Code / Material Name'}</th>
                  <th className="p-3.5 font-bold min-w-[120px]">{language === 'kh' ? 'ប្រភេទ' : 'Category'}</th>
                  <th className="p-3.5 font-bold text-right w-24">{language === 'kh' ? 'បរិមាណ' : 'Quantity'}</th>
                  <th className="p-3.5 font-bold text-center w-16">{language === 'kh' ? 'ឯកតា' : 'Unit'}</th>
                  <th className="p-3.5 pl-5 font-bold min-w-[160px]">{language === 'kh' ? 'កាលបរិច្ឆេទបញ្ចូល' : 'Recorded Date'}</th>
                  <th className="p-3.5 pl-5 font-bold min-w-[120px]">{language === 'kh' ? 'មន្ត្រីបញ្ចូល' : 'Recorded By'}</th>
                  <th className="p-3.5 pl-5 font-bold min-w-[160px]">{language === 'kh' ? 'កំណត់ចំណាំ' : 'Remarks'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-theme/50">
                {stockInTransactions.map((tx, index) => {
                  const item = items.find((i) => i.id === tx.itemId);
                  if (!item) return null;

                  return (
                    <tr key={tx.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      {/* Index number */}
                      <td className="p-3.5 pl-4 text-center font-mono font-bold text-muted-theme border-r border-border-theme/40">
                        {index + 1}
                      </td>

                      {/* Item details */}
                      <td className="p-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="flex-shrink-0 w-9 h-9 bg-[#FAF8F5] rounded-lg flex items-center justify-center border border-[#EAE6DF] shadow-3xs">
                            {getItemIcon(item.code, item.nameKh)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-text-theme block leading-tight text-xs truncate max-w-[200px]" title={language === 'kh' ? item.nameKh : item.nameEn}>
                              {language === 'kh' ? item.nameKh : item.nameEn}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono mt-0.5 block truncate max-w-[200px]" title={item.code}>
                              {item.code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          item.category === 'សម្ភារ Tools Support' 
                            ? 'bg-[#EBF5EE] text-[#2D4A3E] border border-[#2D4A3E]/10' 
                            : 'bg-amber-50 text-amber-800 border border-amber-200/30'
                        }`}>
                          {language === 'kh' 
                            ? (item.category === 'សម្ភារ Tools Support' ? 'សម្ភារ Tools' : 'សម្ភារ Supp')
                            : (item.category === 'សម្ភារ Tools Support' ? 'Tools' : 'Suppliers')
                          }
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="p-3.5 text-right font-mono text-sm font-extrabold text-primary">
                        +{tx.quantity.toLocaleString()}
                      </td>

                      {/* Unit */}
                      <td className="p-3.5 text-center text-muted-theme font-bold text-xs">
                        {item.unit}
                      </td>

                      {/* Recorded Date */}
                      <td className="p-3.5 pl-5 text-muted-theme">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span className="text-[10.5px] font-medium">{formatDate(tx.createdAt)}</span>
                        </div>
                      </td>

                      {/* Recorded By */}
                      <td className="p-3.5 pl-5 font-bold text-text-theme">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-[10px] text-stone-500 font-bold border border-stone-200 uppercase">
                            {tx.recordedBy.trim().charAt(0) || 'U'}
                          </div>
                          <span>{tx.recordedBy}</span>
                        </div>
                      </td>

                      {/* Remarks */}
                      <td className="p-3.5 pl-5 text-stone-500 italic max-w-[220px] truncate" title={tx.remark}>
                        {tx.remark || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
