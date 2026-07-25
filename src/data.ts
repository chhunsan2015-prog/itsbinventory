import { Location, InventoryItem, Stock, Transaction } from './types';

export const LOCATIONS: Location[] = [
  // HQ
  { id: 'loc-hq', nameKh: 'អគ្គនាយកដ្ឋានពន្ធដារ (ទីស្នាក់ការកណ្តាល)', nameEn: 'General Department of Taxation (GDT HQ)', type: 'HQ', code: 'GDT-HQ' },
  
  // Central Stock
  { id: 'loc-central-itshq', nameKh: 'ស្តុកថ្នាក់កណ្តាល (ITS-HQ)', nameEn: 'Central Stock (ITS-HQ)', type: 'CENTRAL', code: 'ITS-HQ' },
  
  // Khan Branches (9)
  { id: 'loc-khan-7mk', nameKh: 'សាខាពន្ធដារខណ្ឌ៧មករា', nameEn: '7 Makara Khan Tax Branch', type: 'KHAN', code: '7MK' },
  { id: 'loc-khan-ckm', nameKh: 'សាខាពន្ធដារខណ្ឌចំការមន', nameEn: 'Chamkarmon Khan Tax Branch', type: 'KHAN', code: 'CKM' },
  { id: 'loc-khan-dko', nameKh: 'សាខាពន្ធដារខណ្ឌដង្កោ', nameEn: 'Dangkor Khan Tax Branch', type: 'KHAN', code: 'DKO' },
  { id: 'loc-khan-dpe', nameKh: 'សាខាពន្ធដារខណ្ឌដូនពេញ', nameEn: 'Daun Penh Khan Tax Branch', type: 'KHAN', code: 'DPE' },
  { id: 'loc-khan-tko', nameKh: 'សាខាពន្ធដារខណ្ឌទួលគោក', nameEn: 'Toul Kork Khan Tax Branch', type: 'KHAN', code: 'TKO' },
  { id: 'loc-khan-psc', nameKh: 'សាខាពន្ធដារខណ្ឌពោធិ៍សែនជ័យ', nameEn: 'Por senchey Khan Tax Branch', type: 'KHAN', code: 'PSC' },
  { id: 'loc-khan-rsk', nameKh: 'សាខាពន្ធដារខណ្ឌឫស្សីកែវ', nameEn: 'Russey Keo Khan Tax Branch', type: 'KHAN', code: 'RSK' },
  { id: 'loc-khan-ssk', nameKh: 'សាខាពន្ធដារខណ្ឌសែនសុខ', nameEn: 'Sen Sok Khan Tax Branch', type: 'KHAN', code: 'SSK' },
  { id: 'loc-khan-mch', nameKh: 'សាខាពន្ធដារខណ្ឌមានជ័យ', nameEn: 'Meachey Khan Tax Branch', type: 'KHAN', code: 'MCH' },

  // Provincial Branches (24)
  { id: 'loc-prov-kpo', nameKh: 'សាខាពន្ធដារខេត្តកំពត', nameEn: 'Kampot Province Tax Branch', type: 'PROVINCIAL', code: 'KPO' },
  { id: 'loc-prov-tke', nameKh: 'សាខាពន្ធដារខេត្តតាកែវ', nameEn: 'Takeo Province Tax Branch', type: 'PROVINCIAL', code: 'TKE' },
  { id: 'loc-prov-shv', nameKh: 'សាខាពន្ធដារខេត្តព្រះសីហនុ', nameEn: 'Preah Sihanouk Province Tax Branch', type: 'PROVINCIAL', code: 'SHV' },
  { id: 'loc-prov-kko', nameKh: 'សាខាពន្ធដារខេត្តកោះកុង', nameEn: 'Koh kong Province Tax Branch', type: 'PROVINCIAL', code: 'KKO' },
  { id: 'loc-prov-kps', nameKh: 'សាខាពន្ធដារខេត្តកំពង់ស្ពឺ', nameEn: 'Kampong Speu Province Tax Branch', type: 'PROVINCIAL', code: 'KPS' },
  { id: 'loc-prov-kch', nameKh: 'សាខាពន្ធដារខេត្តកំពង់ឆ្នាំង', nameEn: 'Kampong Chhnang Province Tax Branch', type: 'PROVINCIAL', code: 'KCH' },
  { id: 'loc-prov-btb', nameKh: 'សាខាពន្ធដារខេត្តបាត់ដំពង', nameEn: 'Battambang Province Tax Branch', type: 'PROVINCIAL', code: 'BTB' },
  { id: 'loc-prov-bmc', nameKh: 'សាខាពន្ធដារខេត្តបន្ទាយមានជ័យ', nameEn: 'Banteay Meanchey Province Tax Branch', type: 'PROVINCIAL', code: 'BMC' },
  { id: 'loc-prov-omc', nameKh: 'សាខាពន្ធដារខេត្តឧត្តរមានជ័យ', nameEn: 'Oddar Meanchey Province Tax Branch', type: 'PROVINCIAL', code: 'OMC' },
  { id: 'loc-prov-sre', nameKh: 'សាខាពន្ធដារខេត្តសៀមរាប', nameEn: 'Siem Reap Province Tax Branch', type: 'PROVINCIAL', code: 'SRE' },
  { id: 'loc-prov-kdl', nameKh: 'សាខាពន្ធដារខេត្តកណ្តាល', nameEn: 'Kandal Province Tax Branch', type: 'PROVINCIAL', code: 'KDL' },
  { id: 'loc-prov-pve', nameKh: 'សាខាពន្ធដារខេត្តព្រៃវែង', nameEn: 'Prey Veng Province Tax Branch', type: 'PROVINCIAL', code: 'PVE' },
  { id: 'loc-prov-sri', nameKh: 'សាខាពន្ធដារខេត្តស្វាយរៀង', nameEn: 'Svay Rieng Province Tax Branch', type: 'PROVINCIAL', code: 'SRI' },
  { id: 'loc-prov-kpc', nameKh: 'សាខាពន្ធដារខេត្តកំពង់ចាម', nameEn: 'Kampong Cham Province Tax Branch', type: 'PROVINCIAL', code: 'KPC' },
  { id: 'loc-prov-mdk', nameKh: 'សាខាពន្ធដារខេត្តមណ្ឌលគិរី', nameEn: 'Mondulkiri Province Tax Branch', type: 'PROVINCIAL', code: 'MDK' },
  { id: 'loc-prov-rtk', nameKh: 'សាខាពន្ធដារខេត្តរតនគិរី', nameEn: 'Ratanakiri Province Tax Branch', type: 'PROVINCIAL', code: 'RTK' },
  { id: 'loc-prov-str', nameKh: 'សាខាពន្ធដារខេត្តស្ទឹងត្រែង', nameEn: 'Stung Treng Province Tax Branch', type: 'PROVINCIAL', code: 'STR' },
  { id: 'loc-prov-pvh', nameKh: 'សាខាពន្ធដារខេត្តព្រះវិហារ', nameEn: 'Preah Vihear Province Tax Branch', type: 'PROVINCIAL', code: 'PVH' },
  { id: 'loc-prov-kpt', nameKh: 'សាខាពន្ធដារខេត្តកំពង់ធំ', nameEn: 'Kampong Thom Province Tax Branch', type: 'PROVINCIAL', code: 'KPT' },
  { id: 'loc-prov-tkh', nameKh: 'សាខាពន្ធដារខេត្តត្បូងឃ្មុំ', nameEn: 'Tboung Khmum Province Tax Branch', type: 'PROVINCIAL', code: 'TKH' },
  { id: 'loc-prov-psa', nameKh: 'សាខាពន្ធដារខេត្តពោធិ៍សាត់', nameEn: 'Pursat Province Tax Branch', type: 'PROVINCIAL', code: 'PSA' },
  { id: 'loc-prov-kep', nameKh: 'សាខាពន្ធដារខេត្តកែប', nameEn: 'KEP Province Tax Branch', type: 'PROVINCIAL', code: 'KEP' },
  { id: 'loc-prov-kti', nameKh: 'សាខាពន្ធដារខេត្តក្រចេះ', nameEn: 'Kratie Province Tax Branch', type: 'PROVINCIAL', code: 'KTI' },
  { id: 'loc-prov-pli', nameKh: 'សាខាពន្ធដារខេត្តប៉ៃលិន', nameEn: 'Pailin Province Tax Branch', type: 'PROVINCIAL', code: 'PLI' }
];

export const INVENTORY_ITEMS: InventoryItem[] = [
  // សម្ភារ Tools Support (18 items)
  { 
    id: 'item-tools-1', 
    code: 'TLS-BOSCH-GSB', 
    nameKh: 'ម៉ូទ័រចាប់វិសប្រើថ្មសាក BOSCH Cordless Percy Screwed (GSB 120-LI)', 
    nameEn: 'BOSCH Cordless Screwdriver (GSB 120-LI)', 
    category: 'សម្ភារ Tools Support', 
    unit: 'គ្រឿង', 
    minStock: 2, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><path d='M32 65 L46 65 L42 84 L26 84 Z' fill='%231e293b'/><rect x='23' y='80' width='22' height='10' rx='2' fill='%230284c7'/><path d='M26 35 Q40 25 70 30 L85 45 L50 55 L32 55 Z' fill='%230369a1'/><rect x='68' y='36' width='22' height='8' rx='2' fill='%230f172a'/><circle cx='48' cy='45' fill='%23dc2626' r='4'/></svg>" 
  },
  { 
    id: 'item-tools-2', 
    code: 'TLS-BOSCH-GBH', 
    nameKh: 'ស្វានបុកម៉ាក BOSCH Rotary Hammer (GBH 2-26 DRE)', 
    nameEn: 'BOSCH Rotary Hammer (GBH 2-26 DRE)', 
    category: 'សម្ភារ Tools Support', 
    unit: 'គ្រឿង', 
    minStock: 2, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><rect x='20' y='35' width='55' height='35' rx='4' fill='%23dc2626'/><rect x='25' y='25' width='45' height='12' rx='3' fill='%231e293b'/><path d='M40 25 Q50 12 60 25' stroke='%230f172a' stroke-width='4' fill='none'/><rect x='72' y='42' width='18' height='12' rx='2' fill='%23475569'/></svg>" 
  },
  { 
    id: 'item-tools-3', 
    code: 'TLS-TOOLBOX', 
    nameKh: 'កេះដាក់សម្ភារៈ', 
    nameEn: 'Tool Box', 
    category: 'សម្ភារ Tools Support', 
    unit: 'កេះ', 
    minStock: 5, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><rect x='18' y='40' width='64' height='38' rx='3' fill='%230284c7'/><rect x='15' y='32' width='70' height='12' rx='2' fill='%231e293b'/><path d='M38 32 Q50 20 62 32' stroke='%230284c7' stroke-width='4' fill='none'/><rect x='44' y='42' width='12' height='10' rx='1' fill='%23cbd5e1'/></svg>" 
  },
  { 
    id: 'item-tools-4', 
    code: 'TLS-BLOWER-400W', 
    nameKh: 'ម៉ាស៊ីនផ្លុំធូលី Air Blower 400W', 
    nameEn: 'Air Blower 400W', 
    category: 'សម្ភារ Tools Support', 
    unit: 'គ្រឿង', 
    minStock: 3, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><circle cx='42' cy='52' r='22' fill='%23eab308'/><path d='M55 42 L88 46 L88 58 L55 58 Z' fill='%231e293b'/><path d='M30 32 Q42 18 54 32' stroke='%231e293b' stroke-width='5' fill='none'/><circle cx='42' cy='52' r='10' fill='%23ca8a04'/></svg>" 
  },
  { 
    id: 'item-tools-5', 
    code: 'TLS-THERMOMETER', 
    nameKh: 'ឧបករណ៍វាស់សីតុណ្ហភាពក្នុងបន្ទប់ (Thermometer)', 
    nameEn: 'Room Thermometer', 
    category: 'សម្ភារ Tools Support', 
    unit: 'គ្រឿង', 
    minStock: 3, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><rect x='40' y='18' width='20' height='64' rx='10' fill='%23e2e8f0' stroke='%2394a3b8' stroke-width='2'/><circle cx='50' cy='70' r='8' fill='%23ef4444'/><rect x='48' y='28' width='4' height='42' fill='%23ef4444'/><line x1='62' y1='30' x2='68' y2='30' stroke='%2364748b' stroke-width='2'/><line x1='62' y1='40' x2='68' y2='40' stroke='%2364748b' stroke-width='2'/><line x1='62' y1='50' x2='68' y2='50' stroke='%2364748b' stroke-width='2'/></svg>" 
  },
  { 
    id: 'item-tools-6', 
    code: 'TLS-CABLE-CUTTER', 
    nameKh: 'កន្ត្រៃកាត់ខ្សែ Network', 
    nameEn: 'Network Cable Cutter', 
    category: 'សម្ភារ Tools Support', 
    unit: 'ដើម', 
    minStock: 5, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><path d='M25 75 L45 48 M75 75 L55 48' stroke='%230284c7' stroke-width='10' stroke-linecap='round'/><path d='M42 50 L50 25 M58 50 L50 25' stroke='%2364748b' stroke-width='8' stroke-linecap='round'/><circle cx='50' cy='48' r='4' fill='%231e293b'/></svg>" 
  },
  { 
    id: 'item-tools-7', 
    code: 'TLS-HAMMER-STEEL', 
    nameKh: 'ញញួរ ដែក', 
    nameEn: 'Steel Hammer', 
    category: 'សម្ភារ Tools Support', 
    unit: 'ដើម', 
    minStock: 4, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><path d='M30 78 L65 35' stroke='%2364748b' stroke-width='8' stroke-linecap='round'/><path d='M50 28 Q60 18 78 22 Q75 35 60 40 L50 28 Z' fill='%23334155'/><rect x='55' y='32' width='22' height='10' rx='1' fill='%2394a3b8' transform='rotate(-40 66 37)'/></svg>" 
  },
  { 
    id: 'item-tools-8', 
    code: 'TLS-HAMMER-RUBBER', 
    nameKh: 'ញញួរ ជ័រ', 
    nameEn: 'Rubber Hammer', 
    category: 'សម្ភារ Tools Support', 
    unit: 'ដើម', 
    minStock: 4, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><path d='M32 76 L62 38' stroke='%23d97706' stroke-width='8' stroke-linecap='round'/><rect x='48' y='22' width='32' height='20' rx='4' fill='%231e293b' transform='rotate(-38 64 32)'/></svg>" 
  },
  { 
    id: 'item-tools-9', 
    code: 'TLS-HEX-KEY-SET', 
    nameKh: 'សោតាន់ HEY Key SET', 
    nameEn: 'Hex Key Set', 
    category: 'សម្ភារ Tools Support', 
    unit: 'ឈុត', 
    minStock: 3, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><rect x='38' y='35' width='24' height='45' rx='3' fill='%23dc2626'/><path d='M25 22 L45 22 L45 75 M30 28 L50 28 L50 75 M35 34 L55 34 L55 75' stroke='%231e293b' stroke-width='3.5' fill='none' stroke-linecap='round'/></svg>" 
  },
  { 
    id: 'item-tools-10', 
    code: 'TLS-PLIERS-SET', 
    nameKh: 'ដង្កាប់ (មុខក្រពើ . សំប៉ែត . កាត់)', 
    nameEn: 'Pliers (Combination, Flat, Cutting)', 
    category: 'សម្ភារ Tools Support', 
    unit: 'ឈុត', 
    minStock: 4, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><path d='M28 80 L44 48 M72 80 L56 48' stroke='%23eab308' stroke-width='9' stroke-linecap='round'/><path d='M44 48 L48 20 M56 48 L52 20' stroke='%23334155' stroke-width='7' stroke-linecap='round'/><circle cx='50' cy='48' r='4' fill='%230f172a'/></svg>" 
  },
  { 
    id: 'item-tools-11', 
    code: 'TLS-WRENCH-SET', 
    nameKh: 'សោរមាត់ចិញ្ជៀន ឈុត', 
    nameEn: 'Combination Wrench Set', 
    category: 'សម្ភារ Tools Support', 
    unit: 'ឈុត', 
    minStock: 3, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><g stroke='%2364748b' stroke-width='5' stroke-linecap='round'><line x1='30' y1='80' x2='70' y2='20'/><line x1='22' y1='75' x2='62' y2='25'/><line x1='38' y1='85' x2='78' y2='15'/></g><circle cx='70' cy='20' r='6' stroke='%23334155' stroke-width='3' fill='none'/><circle cx='62' cy='25' r='5' stroke='%23334155' stroke-width='3' fill='none'/><circle cx='78' cy='15' r='6.5' stroke='%23334155' stroke-width='3' fill='none'/></svg>" 
  },
  { 
    id: 'item-tools-12', 
    code: 'TLS-CRIMPING-TOOL', 
    nameKh: 'ដង្កាប់កឹបខ្សែ (Network)', 
    nameEn: 'Network RJ45 Crimping Tool', 
    category: 'សម្ភារ Tools Support', 
    unit: 'ដើម', 
    minStock: 5, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><path d='M30 75 L45 45 M70 75 L55 45' stroke='%23dc2626' stroke-width='9' stroke-linecap='round'/><rect x='42' y='22' width='16' height='24' rx='3' fill='%231e293b'/></svg>" 
  },
  { 
    id: 'item-tools-13', 
    code: 'TLS-SCISSORS-SM', 
    nameKh: 'កន្ត្រៃកាត់ទូទៅ (តូច)', 
    nameEn: 'General Scissors (Small)', 
    category: 'សម្ភារ Tools Support', 
    unit: 'ដើម', 
    minStock: 5, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><circle cx='32' cy='75' r='8' stroke='%230284c7' stroke-width='4' fill='none'/><circle cx='68' cy='75' r='8' stroke='%230284c7' stroke-width='4' fill='none'/><path d='M36 68 L60 25 M64 68 L40 25' stroke='%2364748b' stroke-width='5' stroke-linecap='round'/></svg>" 
  },
  { 
    id: 'item-tools-14', 
    code: 'TLS-TEST-PEN', 
    nameKh: 'ប៊ិចភ្លើង', 
    nameEn: 'Voltage Tester Pen', 
    category: 'សម្ភារ Tools Support', 
    unit: 'ដើម', 
    minStock: 10, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><path d='M30 70 L65 35' stroke='%23f59e0b' stroke-width='8' stroke-linecap='round'/><path d='M65 35 L75 25' stroke='%2394a3b8' stroke-width='4' stroke-linecap='round'/><circle cx='42' cy='58' r='3' fill='%23ef4444'/></svg>" 
  },
  { 
    id: 'item-tools-15', 
    code: 'TLS-HOSE-BLUE-20', 
    nameKh: 'ទុយោ ខៀវ លេខ20 (រត់ខ្សែ Network)', 
    nameEn: 'Blue Conduit Hose No.20 (Network)', 
    category: 'សម្ភារ Tools Support', 
    unit: 'ដុំ', 
    minStock: 5, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><circle cx='50' cy='50' r='30' stroke='%230284c7' stroke-width='12' fill='none'/><circle cx='50' cy='50' r='18' fill='%23f1f5f9'/></svg>" 
  },
  { 
    id: 'item-tools-16', 
    code: 'TLS-LADDER-A-23', 
    nameKh: 'ជណ្តើរអក្ស A កាំធំ កំពស់ 2.3m', 
    nameEn: 'A-Frame Large-Step Ladder 2.3m', 
    category: 'សម្ភារ Tools Support', 
    unit: 'គ្រឿង', 
    minStock: 2, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><path d='M28 80 L50 20 L72 80' stroke='%2364748b' stroke-width='5' fill='none'/><line x1='34' y1='65' x2='66' y2='65' stroke='%2364748b' stroke-width='4'/><line x1='39' y1='50' x2='61' y2='50' stroke='%2364748b' stroke-width='4'/><line x1='44' y1='35' x2='56' y2='35' stroke='%2364748b' stroke-width='4'/></svg>" 
  },
  { 
    id: 'item-tools-17', 
    code: 'TLS-PULL-WIRE', 
    nameKh: 'ខ្សែនាំ', 
    nameEn: 'Pull Wire / Fish Tape', 
    category: 'សម្ភារ Tools Support', 
    unit: 'ដុំ', 
    minStock: 4, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><circle cx='50' cy='50' r='28' stroke='%23dc2626' stroke-width='10' fill='none'/><path d='M50 22 Q75 50 65 75' stroke='%23f59e0b' stroke-width='4' fill='none'/></svg>" 
  },
  { 
    id: 'item-tools-18', 
    code: 'TLS-GLASSES-CLEAR', 
    nameKh: 'វ៉ែនតា ថ្លា', 
    nameEn: 'Clear Safety Glasses', 
    category: 'សម្ភារ Tools Support', 
    unit: 'គូ', 
    minStock: 10, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><rect x='20' y='38' width='26' height='20' rx='5' stroke='%230284c7' stroke-width='3' fill='%23e0f2fe'/><rect x='54' y='38' width='26' height='20' rx='5' stroke='%230284c7' stroke-width='3' fill='%23e0f2fe'/><line x1='46' y1='45' x2='54' y2='45' stroke='%230284c7' stroke-width='3'/></svg>" 
  },

  // សម្ភារ Suppliers (14 items)
  { 
    id: 'item-supp-1', 
    code: 'SUP-CAT6-UTP', 
    nameKh: 'ខ្សែ Network Link Basic Cat6 UTP', 
    nameEn: 'Link Basic Cat6 UTP Network Cable', 
    category: 'សម្ភារ Suppliers', 
    unit: 'ដុំ', 
    minStock: 10, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><circle cx='50' cy='50' r='28' stroke='%230284c7' stroke-width='14' fill='none'/><rect x='42' y='42' width='16' height='16' rx='3' fill='%230369a1'/></svg>" 
  },
  { 
    id: 'item-supp-2', 
    code: 'SUP-RJ45-PLUGS', 
    nameKh: 'គ្រាប់កឹប Network', 
    nameEn: 'RJ45 Network Connector Plugs', 
    category: 'សម្ភារ Suppliers', 
    unit: 'ប្រអប់', 
    minStock: 5, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><rect x='30' y='32' width='40' height='36' rx='4' stroke='%2364748b' stroke-width='3' fill='%23e2e8f0'/><rect x='40' y='60' width='20' height='12' fill='%23eab308'/></svg>" 
  },
  { 
    id: 'item-supp-3', 
    code: 'SUP-TAPE-DOUBLE', 
    nameKh: 'ស្គតរុំមុខពីរ', 
    nameEn: 'Double-Sided Tape', 
    category: 'សម្ភារ Suppliers', 
    unit: 'ដុំ', 
    minStock: 15, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><circle cx='50' cy='50' r='28' stroke='%23f87171' stroke-width='10' fill='none'/><circle cx='50' cy='50' r='18' fill='%23ffffff'/></svg>" 
  },
  { 
    id: 'item-supp-4', 
    code: 'SUP-TAPE-BLACK', 
    nameKh: 'ស្គតស្អិតខ្មៅ', 
    nameEn: 'Black Electrical Tape', 
    category: 'សម្ភារ Suppliers', 
    unit: 'ដុំ', 
    minStock: 20, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><circle cx='50' cy='50' r='28' stroke='%231e293b' stroke-width='12' fill='none'/><circle cx='50' cy='50' r='16' fill='%23f1f5f9'/></svg>" 
  },
  { 
    id: 'item-supp-5', 
    code: 'SUP-WALL-PLUG', 
    nameKh: 'តាកេ', 
    nameEn: 'Wall Plugs / Anchors', 
    category: 'សម្ភារ Suppliers', 
    unit: 'ប្រអប់', 
    minStock: 10, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><rect x='44' y='20' width='12' height='60' rx='2' fill='%2338bdf8'/><line x1='38' y1='30' x2='62' y2='30' stroke='%230284c7' stroke-width='3'/></svg>" 
  },
  { 
    id: 'item-supp-6', 
    code: 'SUP-GLOVES-COTTON', 
    nameKh: 'ស្រោមដៃក្រណាត់', 
    nameEn: 'Cotton Work Gloves', 
    category: 'សម្ភារ Suppliers', 
    unit: 'គូ', 
    minStock: 30, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><path d='M30 75 Q25 45 35 25 Q45 25 45 45 Q50 20 58 20 Q65 20 62 48 Q70 25 75 32 Q78 50 65 78 Z' fill='%23e2e8f0' stroke='%2394a3b8' stroke-width='2'/></svg>" 
  },
  { 
    id: 'item-supp-7', 
    code: 'SUP-FACE-MASK', 
    nameKh: 'ម៉ាសពេទ្យ', 
    nameEn: 'Medical Face Masks', 
    category: 'សម្ភារ Suppliers', 
    unit: 'ប្រអប់', 
    minStock: 15, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><rect x='22' y='35' width='56' height='30' rx='4' fill='%2338bdf8'/><path d='M10 40 Q22 50 10 60 M90 40 Q78 50 90 60' stroke='%230284c7' stroke-width='2' fill='none'/></svg>" 
  },
  { 
    id: 'item-supp-8', 
    code: 'SUP-CABLE-TIES-300', 
    nameKh: 'ខ្សែរិត 300mm', 
    nameEn: 'Cable Ties 300mm', 
    category: 'សម្ភារ Suppliers', 
    unit: 'កញ្ចប់', 
    minStock: 15, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><line x1='20' y1='80' x2='80' y2='20' stroke='%230f172a' stroke-width='4'/><rect x='70' y='18' width='12' height='10' rx='2' fill='%230f172a'/></svg>" 
  },
  { 
    id: 'item-supp-9', 
    code: 'SUP-LABEL-TAPE', 
    nameKh: 'ស្គត់ក្រដាស Label', 
    nameEn: 'Paper Label Tape', 
    category: 'សម្ភារ Suppliers', 
    unit: 'ដុំ', 
    minStock: 10, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><circle cx='50' cy='50' r='28' stroke='%23fef08a' stroke-width='12' fill='none'/><circle cx='50' cy='50' r='16' fill='%23f1f5f9'/></svg>" 
  },
  { 
    id: 'item-supp-10', 
    code: 'SUP-TRUNKING-NO2', 
    nameKh: 'ប្រអប់ខ្សែ លេខ២', 
    nameEn: 'Wiring Trunking Box No.2', 
    category: 'សម្ភារ Suppliers', 
    unit: 'ដើម', 
    minStock: 50, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><rect x='20' y='42' width='60' height='16' rx='2' fill='%23ffffff' stroke='%23cbd5e1' stroke-width='3'/></svg>" 
  },
  { 
    id: 'item-supp-11', 
    code: 'SUP-TRUNKING-NO4', 
    nameKh: 'ប្រអប់ខ្សែ លេខ៤', 
    nameEn: 'Wiring Trunking Box No.4', 
    category: 'សម្ភារ Suppliers', 
    unit: 'ដើម', 
    minStock: 50, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><rect x='20' y='38' width='60' height='24' rx='2' fill='%23ffffff' stroke='%23cbd5e1' stroke-width='3'/></svg>" 
  },
  { 
    id: 'item-supp-12', 
    code: 'SUP-TRUNKING-NO6', 
    nameKh: 'ប្រអប់ខ្សែ លេខ៦', 
    nameEn: 'Wiring Trunking Box No.6', 
    category: 'សម្ភារ Suppliers', 
    unit: 'ដើម', 
    minStock: 50, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><rect x='20' y='32' width='60' height='36' rx='2' fill='%23ffffff' stroke='%23cbd5e1' stroke-width='3'/></svg>" 
  },
  { 
    id: 'item-supp-13', 
    code: 'SUP-TRUNKING-TURTLE4', 
    nameKh: 'ប្រអប់ខ្សែខ្នងអណ្តើក លេខ៤', 
    nameEn: 'Turtle-Back Floor Trunking No.4', 
    category: 'សម្ភារ Suppliers', 
    unit: 'ដើម', 
    minStock: 30, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><path d='M20 60 Q50 30 80 60 L80 65 L20 65 Z' fill='%23e2e8f0' stroke='%2394a3b8' stroke-width='2'/></svg>" 
  },
  { 
    id: 'item-supp-14', 
    code: 'SUP-SCREW-INOX', 
    nameKh: 'វិសអ៉ីណុកក្បាលស្នើ', 
    nameEn: 'Flat Head Stainless Steel Screws', 
    category: 'សម្ភារ Suppliers', 
    unit: 'ប្រអប់', 
    minStock: 15, 
    imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23f1f5f9'/><rect x='45' y='32' width='10' height='48' fill='%2394a3b8'/><polygon points='38,20 62,20 54,32 46,32' fill='%2364748b'/></svg>" 
  }
];

export const INITIAL_STOCK: Stock[] = [
  // HQ Stock
  { locationId: 'loc-hq', itemId: 'item-tools-1', quantity: 18 },
  { locationId: 'loc-hq', itemId: 'item-tools-2', quantity: 12 },
  { locationId: 'loc-hq', itemId: 'item-tools-3', quantity: 35 },
  { locationId: 'loc-hq', itemId: 'item-tools-4', quantity: 15 },
  { locationId: 'loc-hq', itemId: 'item-tools-5', quantity: 20 },
  { locationId: 'loc-hq', itemId: 'item-tools-6', quantity: 25 },
  { locationId: 'loc-hq', itemId: 'item-tools-7', quantity: 30 },
  { locationId: 'loc-hq', itemId: 'item-tools-8', quantity: 20 },
  { locationId: 'loc-hq', itemId: 'item-tools-9', quantity: 15 },
  { locationId: 'loc-hq', itemId: 'item-tools-10', quantity: 24 },
  { locationId: 'loc-hq', itemId: 'item-tools-11', quantity: 12 },
  { locationId: 'loc-hq', itemId: 'item-tools-12', quantity: 22 },
  { locationId: 'loc-hq', itemId: 'item-tools-13', quantity: 40 },
  { locationId: 'loc-hq', itemId: 'item-tools-14', quantity: 65 },
  { locationId: 'loc-hq', itemId: 'item-tools-15', quantity: 15 },
  { locationId: 'loc-hq', itemId: 'item-tools-16', quantity: 8 },
  { locationId: 'loc-hq', itemId: 'item-tools-17', quantity: 14 },
  { locationId: 'loc-hq', itemId: 'item-tools-18', quantity: 45 },

  { locationId: 'loc-hq', itemId: 'item-supp-1', quantity: 85 },
  { locationId: 'loc-hq', itemId: 'item-supp-2', quantity: 40 },
  { locationId: 'loc-hq', itemId: 'item-supp-3', quantity: 120 },
  { locationId: 'loc-hq', itemId: 'item-supp-4', quantity: 180 },
  { locationId: 'loc-hq', itemId: 'item-supp-5', quantity: 75 },
  { locationId: 'loc-hq', itemId: 'item-supp-6', quantity: 150 },
  { locationId: 'loc-hq', itemId: 'item-supp-7', quantity: 110 },
  { locationId: 'loc-hq', itemId: 'item-supp-8', quantity: 95 },
  { locationId: 'loc-hq', itemId: 'item-supp-9', quantity: 60 },
  { locationId: 'loc-hq', itemId: 'item-supp-10', quantity: 300 },
  { locationId: 'loc-hq', itemId: 'item-supp-11', quantity: 250 },
  { locationId: 'loc-hq', itemId: 'item-supp-12', quantity: 200 },
  { locationId: 'loc-hq', itemId: 'item-supp-13', quantity: 150 },
  { locationId: 'loc-hq', itemId: 'item-supp-14', quantity: 90 },

  // Provincial Kandal Stock (Some optimal, some low)
  { locationId: 'loc-prov-kdl', itemId: 'item-tools-1', quantity: 4 },
  { locationId: 'loc-prov-kdl', itemId: 'item-tools-3', quantity: 8 },
  { locationId: 'loc-prov-kdl', itemId: 'item-tools-6', quantity: 3 }, // Low stock (min: 5)
  { locationId: 'loc-prov-kdl', itemId: 'item-tools-12', quantity: 2 }, // Low stock (min: 5)
  { locationId: 'loc-prov-kdl', itemId: 'item-supp-1', quantity: 12 },
  { locationId: 'loc-prov-kdl', itemId: 'item-supp-2', quantity: 3 }, // Low stock (min: 5)
  { locationId: 'loc-prov-kdl', itemId: 'item-supp-4', quantity: 45 },
  { locationId: 'loc-prov-kdl', itemId: 'item-supp-10', quantity: 80 },

  // Provincial Siem Reap Stock (Several low stock for demo alerts)
  { locationId: 'loc-prov-sre', itemId: 'item-tools-1', quantity: 1 }, // Low stock (min: 2)
  { locationId: 'loc-prov-sre', itemId: 'item-tools-2', quantity: 1 }, // Low stock (min: 2)
  { locationId: 'loc-prov-sre', itemId: 'item-tools-3', quantity: 2 }, // Low stock (min: 5)
  { locationId: 'loc-prov-sre', itemId: 'item-supp-1', quantity: 5 }, // Low stock (min: 10)
  { locationId: 'loc-prov-sre', itemId: 'item-supp-2', quantity: 2 }, // Low stock (min: 5)
  { locationId: 'loc-prov-sre', itemId: 'item-supp-6', quantity: 12 }, // Low stock (min: 30)

  // Chamkar Mon Khan Stock
  { locationId: 'loc-khan-ckm', itemId: 'item-tools-1', quantity: 3 },
  { locationId: 'loc-khan-ckm', itemId: 'item-tools-6', quantity: 6 },
  { locationId: 'loc-khan-ckm', itemId: 'item-tools-14', quantity: 15 },
  { locationId: 'loc-khan-ckm', itemId: 'item-supp-1', quantity: 15 },
  { locationId: 'loc-khan-ckm', itemId: 'item-supp-2', quantity: 8 },
  { locationId: 'loc-khan-ckm', itemId: 'item-supp-8', quantity: 25 },

  // Central Stock (ITS-HQ) Stock
  { locationId: 'loc-central-itshq', itemId: 'item-tools-1', quantity: 6 },
  { locationId: 'loc-central-itshq', itemId: 'item-tools-3', quantity: 12 },
  { locationId: 'loc-central-itshq', itemId: 'item-tools-6', quantity: 1 }, // Low stock (min: 5)
  { locationId: 'loc-central-itshq', itemId: 'item-supp-1', quantity: 40 },
  { locationId: 'loc-central-itshq', itemId: 'item-supp-2', quantity: 3 }, // Low stock (min: 5)
  { locationId: 'loc-central-itshq', itemId: 'item-supp-10', quantity: 95 }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'STOCK_IN',
    fromLocationId: null,
    toLocationId: 'loc-hq',
    itemId: 'item-tools-1',
    quantity: 20,
    remark: 'ទិញចូលឧបករណ៍ស្តុកកណ្តាលសម្រាប់គាំទ្រការងារបច្ចេកទេស (Technical Tools Procurement)',
    createdAt: '2026-06-15T09:00:00Z',
    recordedBy: 'គឹម ស៊ាង (Kim Seang)'
  },
  {
    id: 'tx-2',
    type: 'STOCK_IN',
    fromLocationId: null,
    toLocationId: 'loc-hq',
    itemId: 'item-supp-1',
    quantity: 100,
    remark: 'ទិញចូលខ្សែ Network Link Basic Cat6 UTP សម្រាប់តម្លើងបណ្តាញ (Cat6 Cables order)',
    createdAt: '2026-06-16T10:30:00Z',
    recordedBy: 'គឹម ស៊ាង (Kim Seang)'
  },
  {
    id: 'tx-3',
    type: 'HANDOVER',
    fromLocationId: 'loc-hq',
    toLocationId: 'loc-prov-kdl',
    itemId: 'item-tools-1',
    quantity: 4,
    remark: 'ប្រគល់ម៉ូទ័រចាប់វិសជូនសាខាពន្ធដារខេត្តកណ្តាល (Transferred Screwdrivers to Kandal branch)',
    createdAt: '2026-06-18T14:15:00Z',
    recordedBy: 'សេង វឌ្ឍនា (Seng Vattana)'
  },
  {
    id: 'tx-4',
    type: 'HANDOVER',
    fromLocationId: 'loc-hq',
    toLocationId: 'loc-prov-sre',
    itemId: 'item-supp-1',
    quantity: 10,
    remark: 'ផ្ទេរខ្សែ Network Link Basic Cat6 ទៅសាខាខេត្តសៀមរាប (Transferred Cat6 to Siem Reap)',
    createdAt: '2026-06-20T11:00:00Z',
    recordedBy: 'សេង វឌ្ឍនា (Seng Vattana)'
  },
  {
    id: 'tx-5',
    type: 'STOCK_OUT',
    fromLocationId: 'loc-prov-kdl',
    toLocationId: null,
    itemId: 'item-supp-1',
    quantity: 2,
    remark: 'ប្រើប្រាស់ខ្សែ Network សម្រាប់តភ្ជាប់ក្នុងកិច្ចប្រជុំ (Used Cat6 Cable for assembly)',
    createdAt: '2026-06-22T15:00:00Z',
    recordedBy: 'ចាន់ ធីតា (Chan Thida)'
  },
  {
    id: 'tx-6',
    type: 'ADJUSTMENT',
    fromLocationId: 'loc-hq',
    toLocationId: null,
    itemId: 'item-tools-18',
    quantity: 45,
    remark: 'កែតម្រូវចំនួនជាក់ស្តែងបន្ទាប់ពីធ្វើសារពើភ័ណ្ឌ (Audit adjustment for clear goggles count)',
    createdAt: '2026-06-25T08:30:00Z',
    recordedBy: 'សុខ ម៉េង (Sok Meng)'
  }
];
