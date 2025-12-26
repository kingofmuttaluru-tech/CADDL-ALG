
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Patient, 
  DiagnosticReport, 
  Species, 
  TestParameter 
} from './types';
import { getDiagnosticInterpretation } from './services/geminiService';
import { ReportPDF } from './components/ReportPDF';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const DATA_KEYS = {
  PATIENTS: 'vetdiag_patients',
  REPORTS: 'vetdiag_reports'
};

const syncChannel = new BroadcastChannel('caddl_data_sync');

const TEST_TEMPLATES: Record<string, TestParameter[]> = {
  'CBP – Complete Blood Picture': [
    { name: 'Hemoglobin (Male)', value: '', unit: 'g/dL', refRange: '13.0 – 17.0', status: 'Pending' },
    { name: 'Hemoglobin (Female)', value: '', unit: 'g/dL', refRange: '12.0 – 15.0', status: 'Pending' },
    { name: 'RBC Count (Male)', value: '', unit: 'million/µL', refRange: '4.5 – 5.9', status: 'Pending' },
    { name: 'RBC Count (Female)', value: '', unit: 'million/µL', refRange: '4.1 – 5.1', status: 'Pending' },
    { name: 'Hematocrit (PCV)', value: '', unit: '%', refRange: '36 – 50', status: 'Pending' },
    { name: 'MCV', value: '', unit: 'fL', refRange: '80 – 100', status: 'Pending' },
    { name: 'MCH', value: '', unit: 'pg', refRange: '27 – 33', status: 'Pending' },
    { name: 'MCHC', value: '', unit: 'g/dL', refRange: '32 – 36', status: 'Pending' },
    { name: 'RDW-CV', value: '', unit: '%', refRange: '11.5 – 14.5', status: 'Pending' },
    { name: 'Total WBC Count', value: '', unit: '/µL', refRange: '4,000 – 11,000', status: 'Pending' },
    { name: 'Neutrophils', value: '', unit: '%', refRange: '40 – 75', status: 'Pending' },
    { name: 'Lymphocytes', value: '', unit: '%', refRange: '20 – 40', status: 'Pending' },
    { name: 'Monocytes', value: '', unit: '%', refRange: '2 – 10', status: 'Pending' },
    { name: 'Eosinophils', value: '', unit: '%', refRange: '1 – 6', status: 'Pending' },
    { name: 'Basophils', value: '', unit: '%', refRange: '0 – 1', status: 'Pending' },
    { name: 'Absolute Neutrophil Count', value: '', unit: '/µL', refRange: '2,000 – 7,000', status: 'Pending' },
    { name: 'Absolute Lymphocyte Count', value: '', unit: '/µL', refRange: '1,000 – 3,000', status: 'Pending' },
    { name: 'Absolute Monocyte Count', value: '', unit: '/µL', refRange: '200 – 1,000', status: 'Pending' },
    { name: 'Absolute Eosinophil Count', value: '', unit: '/µL', refRange: '20 – 500', status: 'Pending' },
    { name: 'Platelet Count', value: '', unit: '/µL', refRange: '1.5 – 4.5 lakh', status: 'Pending' },
    { name: 'MPV', value: '', unit: 'fL', refRange: '7.5 – 11.5', status: 'Pending' },
    { name: 'PDW', value: '', unit: '%', refRange: '9 – 17', status: 'Pending' },
    { name: 'PCT', value: '', unit: '%', refRange: '0.2 – 0.4', status: 'Pending' },
  ],
  'Blood Sugar Tests': [
    { name: 'Fasting Blood Sugar', value: '', unit: 'mg/dL', refRange: '70 – 99', status: 'Pending' },
    { name: 'Post Prandial (PP)', value: '', unit: 'mg/dL', refRange: '< 140', status: 'Pending' },
    { name: 'Random Blood Sugar', value: '', unit: 'mg/dL', refRange: '< 200', status: 'Pending' },
    { name: 'HbA1c', value: '', unit: '%', refRange: '< 5.7', status: 'Pending' },
  ],
  'Urine Examination': [
    { name: 'Color', value: '', unit: 'visual', refRange: 'Pale Yellow', status: 'Pending' },
    { name: 'pH', value: '', unit: 'pH', refRange: '4.5 – 8.0', status: 'Pending' },
    { name: 'Protein', value: '', unit: 'qual', refRange: 'Absent', status: 'Pending' },
    { name: 'Sugar', value: '', unit: 'qual', refRange: 'Absent', status: 'Pending' },
    { name: 'RBCs', value: '', unit: '/HPF', refRange: '0 – 2', status: 'Pending' },
    { name: 'WBCs', value: '', unit: '/HPF', refRange: '0 – 5', status: 'Pending' },
  ],
  'Liver Function Test (LFT)': [
    { name: 'Total Bilirubin', value: '', unit: 'mg/dL', refRange: '0.2 – 1.2', status: 'Pending' },
    { name: 'Direct Bilirubin', value: '', unit: 'mg/dL', refRange: '0.0 – 0.3', status: 'Pending' },
    { name: 'SGOT (AST)', value: '', unit: 'U/L', refRange: '5 – 40', status: 'Pending' },
    { name: 'SGPT (ALT)', value: '', unit: 'U/L', refRange: '7 – 56', status: 'Pending' },
    { name: 'Alkaline Phosphatase', value: '', unit: 'U/L', refRange: '44 – 147', status: 'Pending' },
  ],
  'Kidney Function Test (KFT)': [
    { name: 'Urea', value: '', unit: 'mg/dL', refRange: '15 – 40', status: 'Pending' },
    { name: 'Creatinine', value: '', unit: 'mg/dL', refRange: '0.6 – 1.3', status: 'Pending' },
    { name: 'Uric Acid', value: '', unit: 'mg/dL', refRange: '2.4 – 7.0', status: 'Pending' },
  ],
  'Thyroid Profile': [
    { name: 'TSH', value: '', unit: 'µIU/mL', refRange: '0.4 – 4.0', status: 'Pending' },
    { name: 'T3', value: '', unit: 'ng/dL', refRange: '80 – 200', status: 'Pending' },
    { name: 'T4', value: '', unit: 'µg/dL', refRange: '5 – 12', status: 'Pending' },
  ],
  'Lipid Profile': [
    { name: 'Total Cholesterol', value: '', unit: 'mg/dL', refRange: '< 200', status: 'Pending' },
    { name: 'LDL Cholesterol', value: '', unit: 'mg/dL', refRange: '< 100', status: 'Pending' },
    { name: 'HDL Cholesterol', value: '', unit: 'mg/dL', refRange: '> 40', status: 'Pending' },
    { name: 'Triglycerides', value: '', unit: 'mg/dL', refRange: '< 150', status: 'Pending' },
  ]
};

const INITIAL_PATIENTS: Patient[] = [
  { id: 'P001', name: 'Buddy', species: Species.DOG, breed: 'Golden Retriever', age: 5, owner: 'John Smith' },
  { id: 'P002', name: 'Misty', species: Species.CAT, breed: 'Siamese', age: 3, owner: 'Emily Davis' },
];

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [reports, setReports] = useState<DiagnosticReport[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'reports' | 'new-test'>('dashboard');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [dbStatus, setDbStatus] = useState<'connected' | 'syncing' | 'idle'>('connected');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [showPdfGuide, setShowPdfGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [dateStartFilter, setDateStartFilter] = useState('');
  const [dateEndFilter, setDateEndFilter] = useState('');

  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatientData, setNewPatientData] = useState<Omit<Patient, 'id'>>({
    name: '', species: Species.DOG, breed: '', age: 0, owner: ''
  });

  const [newTestPatientId, setNewTestPatientId] = useState('');
  const [selectedPanels, setSelectedPanels] = useState<{name: string, parameters: TestParameter[]}[]>([]);

  const loadData = () => {
    const savedPatients = localStorage.getItem(DATA_KEYS.PATIENTS);
    if (savedPatients) setPatients(JSON.parse(savedPatients));
    const savedReports = localStorage.getItem(DATA_KEYS.REPORTS);
    if (savedReports) setReports(JSON.parse(savedReports));
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    loadData();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === DATA_KEYS.PATIENTS || e.key === DATA_KEYS.REPORTS) {
        loadData();
        setDbStatus('syncing');
        setTimeout(() => setDbStatus('connected'), 1000);
      }
    };
    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data === 'sync_required') {
        loadData();
        setDbStatus('syncing');
        setTimeout(() => setDbStatus('connected'), 1000);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    syncChannel.addEventListener('message', handleSyncMessage);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      syncChannel.removeEventListener('message', handleSyncMessage);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(DATA_KEYS.PATIENTS, JSON.stringify(patients));
    syncChannel.postMessage('sync_required');
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(DATA_KEYS.REPORTS, JSON.stringify(reports));
    syncChannel.postMessage('sync_required');
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const patient = patients.find(p => p.id === report.patientId);
      const ownerName = patient?.owner.toLowerCase() || '';
      const testType = report.testType.toLowerCase();
      const query = reportSearchQuery.toLowerCase();
      const matchesSearch = ownerName.includes(query) || testType.includes(query);
      const reportDate = new Date(report.date).getTime();
      const startDate = dateStartFilter ? new Date(dateStartFilter).getTime() : -Infinity;
      const endDate = dateEndFilter ? new Date(dateEndFilter).getTime() : Infinity;
      const matchesDate = reportDate >= startDate && reportDate <= endDate;
      return matchesSearch && matchesDate;
    });
  }, [reports, patients, reportSearchQuery, dateStartFilter, dateEndFilter]);

  const addTestPanel = (templateName: string) => {
    if (TEST_TEMPLATES[templateName]) {
      setSelectedPanels([...selectedPanels, { 
        name: templateName, 
        parameters: JSON.parse(JSON.stringify(TEST_TEMPLATES[templateName])) 
      }]);
    }
  };

  const removeTestPanel = (index: number) => {
    const updated = [...selectedPanels];
    updated.splice(index, 1);
    setSelectedPanels(updated);
  };

  const updateParameterValue = (panelIdx: number, paramIdx: number, value: string) => {
    const updated = [...selectedPanels];
    updated[panelIdx].parameters[paramIdx].value = value;
    setSelectedPanels(updated);
    setDbStatus('syncing');
    setTimeout(() => setDbStatus('connected'), 500);
  };

  const calculateStatus = (val: string, range: string): 'Normal' | 'High' | 'Low' | 'Abnormal' | 'Pending' => {
    if (!val) return 'Pending';
    const cleanVal = val.toLowerCase().trim();
    const cleanRange = range.toLowerCase().trim();
    if (['absent', 'negative', 'none seen', 'pale yellow', 'formed', 'brown'].includes(cleanRange)) {
      return cleanVal === cleanRange ? 'Normal' : 'Abnormal';
    }
    const numericVal = parseFloat(val.replace(/,/g, ''));
    if (isNaN(numericVal)) return 'Abnormal';
    if (cleanRange.includes('–') || cleanRange.includes('-')) {
      const parts = cleanRange.split(/[–-]/);
      const min = parseFloat(parts[0].trim().replace(/,/g, ''));
      const max = parseFloat(parts[1].trim().replace(/,/g, ''));
      if (numericVal < min) return 'Low';
      if (numericVal > max) return 'High';
      return 'Normal';
    }
    if (cleanRange.startsWith('<')) {
      const limit = parseFloat(cleanRange.substring(1).trim().replace(/,/g, ''));
      return numericVal < limit ? 'Normal' : 'High';
    }
    return 'Normal';
  };

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: Patient = {
      ...newPatientData,
      id: `P${(patients.length + 1).toString().padStart(3, '0')}`
    };
    setPatients([...patients, newPatient]);
    setIsAddingPatient(false);
    setNewPatientData({ name: '', species: Species.DOG, breed: '', age: 0, owner: '' });
    showToast('Patient Saved Locally');
  };

  const handleAddTest = () => {
    if (!newTestPatientId) return alert('Select a patient.');
    if (selectedPanels.length === 0) return alert('Add at least one test.');
    const nextReportIndex = reports.length > 0 
      ? Math.max(...reports.map(r => parseInt(r.id.split('-')[1]))) + 1 
      : 1001;
    const allParameters: TestParameter[] = [];
    selectedPanels.forEach(panel => {
      panel.parameters.forEach(p => {
        allParameters.push({
          ...p,
          name: `${panel.name.split('–')[0].trim()}: ${p.name}`,
          status: calculateStatus(p.value.toString(), p.refRange)
        });
      });
    });
    const newReport: DiagnosticReport = {
      id: `REP-${nextReportIndex}`,
      patientId: newTestPatientId,
      date: new Date().toISOString().split('T')[0],
      testType: selectedPanels.map(p => p.name.split('–')[0].trim()).join(' + '),
      parameters: allParameters,
      summary: '',
      clinician: 'Dr. Lab Specialist'
    };
    setReports([newReport, ...reports]);
    setActiveTab('reports');
    setSelectedReportId(newReport.id);
    setNewTestPatientId('');
    setSelectedPanels([]);
    showToast('Record Created and Synced');
  };

  const triggerA4Print = () => {
    if (!selectedReportId) return;
    const report = reports.find(r => r.id === selectedReportId);
    const originalTitle = document.title;
    
    // Set the document title so "Save as PDF" uses a professional filename automatically
    if (report) {
      document.title = `CADDL_Report_${report.id}`;
    }

    setShowPdfGuide(true);
    
    // Give time for UI feedback and title change to register
    setTimeout(() => {
      window.print();
      setShowPdfGuide(false);
      // Restore original title after a delay
      setTimeout(() => { document.title = originalTitle; }, 1000);
    }, 2000);
  };

  const downloadRawReportData = (report: DiagnosticReport) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CADDL_${report.id}_RAW_DATA.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('RAW DATA EXPORTED');
  };

  const exportTechnicalBackup = () => {
    const data = { patients, reports, exportDate: new Date().toISOString(), source: "CADDL-Live-DB" };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CADDL_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('SYSTEM BACKUP DOWNLOADED');
  };

  const importLabData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.patients && imported.reports) {
          if (confirm('Import data? Local database will be overwritten.')) {
            setPatients(imported.patients);
            setReports(imported.reports);
            setDbStatus('syncing');
            setTimeout(() => { setDbStatus('connected'); showToast('Database Restored'); }, 1000);
          }
        }
      } catch (err) { alert('Invalid file format.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);
  const selectedPatient = patients.find(p => p.id === selectedReport?.patientId);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 relative">
      
      {/* PROFESSIONAL PDF GUIDE MODAL */}
      {showPdfGuide && (
        <div className="fixed inset-0 z-[200] bg-teal-900/90 backdrop-blur-xl flex items-center justify-center p-6 no-print">
          <div className="bg-white p-12 rounded-[3.5rem] shadow-4xl max-w-xl w-full text-center space-y-10 pdf-guide border-8 border-teal-500/30">
            <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto text-5xl border-4 border-teal-200">
              <i className="fas fa-file-pdf animate-pulse"></i>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">PDF HANDSHAKE</h2>
              <p className="text-slate-500 font-bold text-lg">Preparing A4 High-Fidelity Render...</p>
            </div>
            <div className="grid grid-cols-1 gap-5 text-left">
              <div className="bg-slate-50 p-6 rounded-3xl flex items-center gap-6 border-2 border-slate-100 shadow-sm">
                <span className="w-12 h-12 bg-teal-600 text-white rounded-full flex-shrink-0 flex items-center justify-center font-black text-xl">1</span>
                <div>
                  <p className="font-black text-slate-800 text-lg">Select Destination</p>
                  <p className="text-slate-500 font-bold">Choose <span className="text-teal-600">"Save as PDF"</span> or <span className="text-teal-600">"Canon Printer"</span></p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl flex items-center gap-6 border-2 border-slate-100 shadow-sm">
                <span className="w-12 h-12 bg-teal-600 text-white rounded-full flex-shrink-0 flex items-center justify-center font-black text-xl">2</span>
                <div>
                  <p className="font-black text-slate-800 text-lg">Essential Setting</p>
                  <p className="text-slate-500 font-bold italic">Check <span className="text-teal-600">"Background Graphics"</span> box</p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl flex items-center gap-6 border-2 border-slate-100 shadow-sm">
                <span className="w-12 h-12 bg-teal-600 text-white rounded-full flex-shrink-0 flex items-center justify-center font-black text-xl">3</span>
                <div>
                  <p className="font-black text-slate-800 text-lg">ISO Standard</p>
                  <p className="text-slate-500 font-bold">Ensure Paper Size is <span className="text-teal-600">"A4"</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-teal-900 text-white px-8 py-5 rounded-full shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300 font-black border-2 border-teal-500">
          <i className="fas fa-check-circle text-teal-400 text-xl"></i>
          {toast.message}
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={importLabData} accept=".json" className="hidden" />

      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-teal-950 text-white flex-shrink-0 no-print flex flex-col border-r border-teal-900 shadow-2xl">
        <div className="p-10">
          <h1 className="text-3xl font-black flex items-center gap-3 italic">
            <i className="fas fa-vial-circle-check text-teal-400 not-italic"></i> CADDL 
          </h1>
          <p className="text-[10px] text-teal-300 font-black leading-tight mt-1 tracking-[0.3em] uppercase">Diagnostic Engine</p>
        </div>

        <nav className="flex-grow space-y-2">
          {['dashboard', 'patients', 'reports', 'new-test'].map((tab) => (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab as any); setIsAddingPatient(false); }}
              className={`w-full text-left px-10 py-6 flex items-center gap-5 transition-all capitalize ${activeTab === tab ? 'bg-teal-900 text-teal-400 font-black border-r-8 border-r-teal-400 shadow-inner' : 'hover:bg-teal-900/40 text-slate-400 font-bold'}`}
            >
              <i className={`fas fa-${tab === 'dashboard' ? 'chart-line' : tab === 'patients' ? 'users' : tab === 'reports' ? 'folder-open' : 'vial-virus'} text-xl ${activeTab === tab ? 'text-teal-400' : 'text-teal-900'}`}></i>
              {tab.replace('-', ' ')}
            </button>
          ))}
        </nav>
        
        <div className="p-8 bg-black/40 border-t border-teal-900/50 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest">DRIVE SYNC</span>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${dbStatus === 'connected' ? 'bg-green-400 shadow-[0_0_15px_rgba(74,222,128,1)] animate-pulse' : 'bg-slate-500'}`}></span>
              <span className="text-[10px] font-black uppercase tracking-tight">{dbStatus === 'connected' ? 'LOCAL DISK SAFE' : dbStatus}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={exportTechnicalBackup} className="text-center text-[10px] font-black py-4 bg-teal-800 hover:bg-teal-700 rounded-2xl transition-all border border-teal-700/50 flex flex-col items-center gap-2">
              <i className="fas fa-save"></i> BACKUP
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="text-center text-[10px] font-black py-4 bg-teal-800 hover:bg-teal-700 rounded-2xl transition-all border border-teal-700/50 flex flex-col items-center gap-2">
              <i className="fas fa-file-import"></i> RESTORE
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto no-print">
        <header className="bg-white/95 border-b px-10 py-6 flex justify-between items-center sticky top-0 z-50 backdrop-blur-2xl shadow-sm">
          <h2 className="text-3xl font-black text-slate-800 capitalize flex items-center gap-5 tracking-tighter">
            <span className="w-2 h-10 bg-teal-600 rounded-full"></span>
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-10">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Node Terminal</p>
              <p className="text-base font-black text-slate-800">CADDL-ALLAGADDA-01</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold border-2 border-teal-100 shadow-md">
              <i className="fas fa-network-wired text-2xl"></i>
            </div>
          </div>
        </header>

        <div className="p-10 md:p-14 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
             <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 flex items-center gap-8 group hover:border-teal-400 hover:shadow-2xl transition-all duration-500">
                  <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[30px] flex items-center justify-center text-4xl shadow-inner"><i className="fas fa-file-prescription"></i></div>
                  <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Lab Records</p><p className="text-5xl font-black text-slate-800 tracking-tighter">{reports.length}</p></div>
                </div>
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 flex items-center gap-8 group hover:border-teal-400 hover:shadow-2xl transition-all duration-500">
                  <div className="w-24 h-24 bg-orange-50 text-orange-600 rounded-[30px] flex items-center justify-center text-4xl shadow-inner"><i className="fas fa-dog"></i></div>
                  <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Registry</p><p className="text-5xl font-black text-slate-800 tracking-tighter">{patients.length}</p></div>
                </div>
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 flex items-center gap-8 group hover:border-teal-400 hover:shadow-2xl transition-all duration-500">
                  <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-[30px] flex items-center justify-center text-4xl shadow-inner"><i className="fas fa-print"></i></div>
                  <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Printer Interface</p><p className="text-2xl font-black text-green-600 flex items-center gap-3 italic tracking-tight uppercase">Canon Ready</p></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 bg-white p-12 rounded-[50px] shadow-sm border border-slate-200">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4 mb-10"><i className="fas fa-chart-line text-teal-600"></i> Diagnosis Statistics</h3>
                  <div className="h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[{n:'Mon',t:reports.length},{n:'Tue',t:reports.length*0.8},{n:'Wed',t:reports.length*1.2},{n:'Thu',t:reports.length*0.7},{n:'Fri',t:reports.length*1.1}]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:14, fontWeight:900}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:14, fontWeight:900}} />
                        <Tooltip contentStyle={{borderRadius:'30px', border:'none', boxShadow:'0 30px 40px -10px rgba(0,0,0,0.15)', fontWeight:900}} />
                        <Line type="monotone" dataKey="t" stroke="#0d9488" strokeWidth={6} dot={{fill:'#0d9488', r:8, strokeWidth:5, stroke:'#fff'}} activeDot={{r:12}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-teal-900 p-12 rounded-[50px] shadow-2xl text-white flex flex-col justify-between overflow-hidden relative border-[6px] border-teal-800">
                   <div className="absolute -top-20 -right-20 opacity-10">
                     <i className="fas fa-file-pdf text-[300px]"></i>
                   </div>
                   <div className="relative z-10">
                    <h3 className="text-3xl font-black mb-8 flex items-center gap-4"><i className="fas fa-download"></i> PDF Downloader</h3>
                    <p className="text-teal-200 text-lg leading-relaxed mb-10 font-bold italic">
                      "To save reports as PDF files on your computer, use the hub and click 'DOWNLOAD PDF'. The system automatically names the file with the Report ID."
                    </p>
                    <div className="space-y-6">
                      <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                        <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] mb-2">Default Format</p>
                        <p className="text-xl font-black tracking-tight">PDF Document (.pdf)</p>
                      </div>
                      <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                        <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] mb-2">Hardware Connection</p>
                        <p className="text-base font-black text-green-400 flex items-center gap-3 uppercase"><i className="fas fa-check-circle"></i> Canon Station Active</p>
                      </div>
                    </div>
                   </div>
                   <button onClick={() => setActiveTab('reports')} className="w-full mt-12 py-6 bg-teal-500 hover:bg-teal-400 text-white rounded-[30px] font-black transition-all flex items-center justify-center gap-4 shadow-3xl shadow-teal-500/30 transform active:scale-95 text-xl">
                     <i className="fas fa-arrow-right"></i> GO TO HUB
                   </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="bg-white rounded-[50px] shadow-sm border border-slate-200 overflow-hidden">
              {!isAddingPatient ? (
                <>
                <div className="p-12 border-b flex flex-col sm:flex-row justify-between items-center bg-slate-50/80 gap-8 backdrop-blur-md">
                  <div>
                    <h3 className="text-4xl font-black text-slate-800 tracking-tighter">Diagnostic Registry</h3>
                    <p className="text-base text-slate-500 mt-2 font-bold italic">Local animal diagnostic records station.</p>
                  </div>
                  <button onClick={() => setIsAddingPatient(true)} className="w-full sm:w-auto px-12 py-6 bg-teal-600 hover:bg-teal-700 text-white rounded-[32px] font-black shadow-3xl shadow-teal-600/30 transition-all flex items-center justify-center gap-4 transform hover:-translate-y-2">
                    <i className="fas fa-plus"></i> REGISTER ANIMAL
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]"><tr className="border-b"><th className="px-12 py-8">Registry ID</th><th className="px-12 py-8">Owner Name</th><th className="px-12 py-8">Animal Name</th><th className="px-12 py-8">Species</th><th className="px-12 py-8">Details</th></tr></thead>
                    <tbody className="divide-y text-sm">
                      {patients.map(p => (
                        <tr key={p.id} className="hover:bg-teal-50/50 transition-all group cursor-default">
                          <td className="px-12 py-8 font-black text-teal-600 font-mono text-lg">{p.id}</td>
                          <td className="px-12 py-8 font-black text-slate-800 uppercase text-xl">{p.owner}</td>
                          <td className="px-12 py-8 font-black text-slate-500 text-lg">{p.name}</td>
                          <td className="px-12 py-8">
                            <span className="px-6 py-2 bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200">{p.species}</span>
                          </td>
                          <td className="px-12 py-8 text-slate-500 font-black text-base italic">{p.breed} • {p.age} YRS</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              ) : (
                <form onSubmit={handleAddPatient} className="p-16 max-w-4xl mx-auto space-y-12">
                  <div className="flex items-center gap-8 border-b pb-10">
                    <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-[30px] flex items-center justify-center text-4xl shadow-md border-2 border-teal-200"><i className="fas fa-paw"></i></div>
                    <div>
                      <h3 className="text-5xl font-black text-slate-800 tracking-tighter">New Registration</h3>
                      <p className="text-lg font-black text-slate-400 mt-2 uppercase tracking-[0.2em]">Writing to local hardware station</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="col-span-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Owner Full Name</label>
                      <input required placeholder="Full name of owner..." className="w-full p-6 border-4 border-slate-50 rounded-[35px] bg-slate-50 focus:border-teal-500 outline-none transition-all font-black text-2xl shadow-inner" value={newPatientData.owner} onChange={e => setNewPatientData({...newPatientData, owner: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Animal Alias</label>
                      <input required placeholder="Name of animal..." className="w-full p-6 border-4 border-slate-50 rounded-[35px] bg-slate-50 focus:border-teal-500 outline-none transition-all font-bold text-xl" value={newPatientData.name} onChange={e => setNewPatientData({...newPatientData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Species Selection</label>
                      <select className="w-full p-6 border-4 border-slate-50 rounded-[35px] bg-slate-50 focus:border-teal-500 outline-none transition-all font-black text-xl appearance-none" value={newPatientData.species} onChange={e => setNewPatientData({...newPatientData, species: e.target.value as Species})}>
                        {Object.values(Species).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-8 pt-10">
                    <button type="submit" className="flex-1 p-8 bg-teal-600 text-white rounded-[40px] font-black shadow-3xl hover:bg-teal-700 transition-all transform hover:-translate-y-2 text-2xl tracking-tighter">COMMIT TO DRIVE</button>
                    <button type="button" onClick={() => setIsAddingPatient(false)} className="px-12 p-8 bg-slate-100 text-slate-400 rounded-[40px] font-black hover:bg-slate-200 transition-all text-xl">CANCEL</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Record Hub</h3>
                  <div className="px-5 py-2 bg-teal-100 text-teal-700 rounded-3xl text-[11px] font-black uppercase tracking-widest">{filteredReports.length} REPORTS</div>
                </div>
                
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 space-y-5">
                  <div className="relative">
                    <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="text" 
                      placeholder="Find owner or test..." 
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 border-4 border-slate-50 rounded-3xl text-base font-black focus:border-teal-500 outline-none transition-all"
                      value={reportSearchQuery}
                      onChange={e => setReportSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[850px] space-y-6 pr-3 custom-scrollbar">
                  {filteredReports.map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => setSelectedReportId(r.id)} 
                      className={`p-10 rounded-[45px] cursor-pointer border-4 transition-all duration-500 relative overflow-hidden group ${selectedReportId === r.id ? 'border-teal-500 bg-teal-50/60 shadow-2xl' : 'bg-white border-transparent shadow-sm hover:border-slate-300'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{r.id}</p>
                          <h4 className="font-black text-slate-800 uppercase text-2xl tracking-tighter leading-none">{patients.find(p => p.id === r.patientId)?.owner}</h4>
                        </div>
                        {selectedReportId === r.id && <i className="fas fa-check-circle text-teal-600 text-2xl animate-in zoom-in"></i>}
                      </div>
                      <p className="text-xs text-slate-500 font-black bg-white/80 inline-block px-4 py-2 rounded-2xl border border-slate-100 uppercase tracking-tight">{r.testType}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2">
                {selectedReport ? (
                  <div className="bg-white rounded-[60px] shadow-3xl h-[1200px] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <div className="p-10 bg-slate-50/80 border-b-2 border-slate-100 flex flex-wrap gap-6 justify-between items-center backdrop-blur-3xl">
                      <div className="flex gap-5">
                        
                        {/* PRIMARY ACTION: PDF DOWNLOAD */}
                        <button onClick={triggerA4Print} className="px-12 py-6 bg-teal-600 hover:bg-teal-700 text-white rounded-[28px] text-lg font-black shadow-3xl shadow-teal-600/40 active:scale-95 transition-all flex flex-col items-center leading-none gap-1">
                          <div className="flex items-center gap-3">
                            <i className="fas fa-file-pdf"></i> DOWNLOAD / PRINT PDF
                          </div>
                          <span className="text-[9px] font-bold opacity-80 mt-1 uppercase tracking-widest">(A4 PRECISION MODE)</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            const patient = patients.find(p => p.id === selectedReport.patientId);
                            if (patient) {
                              setIsAiLoading(true);
                              setAiInterpretation('');
                              getDiagnosticInterpretation(patient, selectedReport).then(res => {
                                setAiInterpretation(res);
                                setIsAiLoading(false);
                                showToast('Laboratory AI Diagnosis Ready');
                              });
                            }
                          }} 
                          disabled={isAiLoading} 
                          className="px-10 py-6 bg-purple-600 hover:bg-purple-700 text-white rounded-[28px] text-lg font-black flex items-center gap-4 shadow-3xl shadow-purple-600/40 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isAiLoading ? <i className="fas fa-atom fa-spin"></i> : <i className="fas fa-star-of-life"></i>} 
                          AI ANALYZE
                        </button>

                        <button onClick={() => downloadRawReportData(selectedReport)} className="px-6 py-6 bg-slate-200 hover:bg-slate-300 text-slate-500 rounded-[28px] text-[10px] font-black active:scale-95 transition-all flex flex-col items-center gap-1 justify-center opacity-60 hover:opacity-100">
                          <i className="fas fa-code"></i> RAW DATA
                        </button>
                      </div>
                      <div className="bg-slate-200/50 px-6 py-3 rounded-2xl border border-slate-300/40">
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">{selectedReport.id}</p>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-16 bg-slate-400/20 custom-scrollbar">
                      {/* PREVIEW */}
                      <div className="scale-[1] origin-top shadow-[0_60px_100px_-30px_rgba(0,0,0,0.3)] mx-auto w-fit mb-24 rounded-2xl overflow-hidden border-[10px] border-white"><ReportPDF patient={selectedPatient!} report={selectedReport} /></div>
                      
                      {aiInterpretation && (
                        <div className="bg-white p-16 rounded-[60px] border-[10px] border-purple-50 max-w-[210mm] mx-auto shadow-3xl relative overflow-hidden group mb-20 animate-in slide-in-from-bottom-10">
                          <div className="absolute -top-16 -right-16 p-16 opacity-10 group-hover:opacity-20 transition-all duration-700 transform group-hover:rotate-12">
                            <i className="fas fa-brain text-[180px] text-purple-600"></i>
                          </div>
                          <div className="flex items-center gap-6 mb-12">
                            <span className="w-14 h-14 bg-purple-600 rounded-[24px] flex items-center justify-center text-white text-3xl shadow-xl shadow-purple-600/30"><i className="fas fa-bolt-lightning"></i></span>
                            <h4 className="text-purple-900 text-4xl font-black tracking-tighter uppercase italic">Gemini Specialist Analysis</h4>
                          </div>
                          <div className="text-xl text-slate-700 leading-relaxed whitespace-pre-wrap font-bold italic border-l-[15px] border-purple-600 pl-12 py-4 shadow-inner bg-purple-50/30 rounded-r-[40px]">{aiInterpretation}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-[1200px] border-8 border-dashed border-slate-100 rounded-[70px] flex flex-col items-center justify-center text-slate-200">
                    <div className="w-48 h-48 bg-slate-50 rounded-[60px] flex items-center justify-center mb-10 shadow-inner">
                      <i className="fas fa-file-pdf text-7xl opacity-30 text-teal-600"></i>
                    </div>
                    <p className="text-4xl font-black uppercase tracking-[0.4em] text-slate-300 text-center px-10">Select Lab Record<br/>To Generate PDF</p>
                    <p className="text-sm font-black mt-10 uppercase tracking-widest bg-slate-100 px-8 py-3 rounded-2xl text-slate-400 border border-slate-200 shadow-sm uppercase italic">Station Standby</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'new-test' && (
            <div className="max-w-6xl mx-auto bg-white p-16 rounded-[70px] shadow-3xl border border-slate-200 animate-in zoom-in-95 duration-700">
              <div className="flex items-center gap-8 mb-16 pb-12 border-b-4 border-slate-50">
                <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-[35px] flex items-center justify-center text-5xl border-4 border-teal-200 shadow-lg"><i className="fas fa-vial-circle-check"></i></div>
                <div>
                  <h3 className="text-5xl font-black text-slate-800 tracking-tighter">Lab Protocol Builder</h3>
                  <p className="text-xl text-slate-400 font-black uppercase tracking-[0.3em] mt-2 italic tracking-tighter uppercase">Local Memory Persistence Active</p>
                </div>
              </div>
              
              <div className="mb-16 p-12 bg-slate-50 rounded-[50px] border-4 border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-12 items-end shadow-2xl">
                <div className="space-y-5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] ml-4">Select Animal</label>
                  <select className="w-full p-7 bg-white border-4 border-slate-100 rounded-[35px] font-black text-slate-800 text-2xl focus:border-teal-500 outline-none transition-all shadow-xl appearance-none" value={newTestPatientId} onChange={e => setNewTestPatientId(e.target.value)}>
                    <option value="">-- CHOOSE FROM REGISTRY --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.owner.toUpperCase()} ({p.species}) - {p.id}</option>)}
                  </select>
                </div>
                <div className="space-y-5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] ml-4">Clinical Protocols</label>
                  <div className="flex gap-5">
                    <select id="panel-selector" className="flex-1 p-7 bg-white border-4 border-slate-100 rounded-[35px] font-black text-slate-800 text-xl focus:border-teal-500 outline-none transition-all shadow-xl appearance-none">
                      {Object.keys(TEST_TEMPLATES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <button 
                      onClick={() => {
                        const sel = document.getElementById('panel-selector') as HTMLSelectElement;
                        addTestPanel(sel.value);
                      }}
                      className="px-12 bg-teal-600 hover:bg-teal-700 text-white rounded-[35px] font-black shadow-3xl shadow-teal-600/40 transition-all flex items-center gap-4 transform active:scale-90 text-xl"
                    >
                      <i className="fas fa-plus"></i> ADD
                    </button>
                  </div>
                </div>
              </div>

              {selectedPanels.length === 0 ? (
                <div className="py-48 text-center bg-slate-50 rounded-[80px] border-8 border-dashed border-slate-100 text-slate-200">
                  <i className="fas fa-microscope text-9xl mb-12 opacity-30 text-teal-600"></i>
                  <p className="font-black text-5xl tracking-tighter text-slate-300">Analyzer Canvas Ready</p>
                  <p className="text-sm font-black mt-6 uppercase tracking-[0.5em] text-slate-400">Select clinical protocol to begin entry</p>
                </div>
              ) : (
                <div className="space-y-12 mb-20">
                  {selectedPanels.map((panel, pIdx) => (
                    <div key={pIdx} className="border-4 border-slate-50 rounded-[60px] overflow-hidden bg-white shadow-3xl hover:shadow-4xl transition-all duration-500 transform hover:-translate-y-2">
                      <div className="bg-slate-50 p-10 flex justify-between items-center border-b-4 border-slate-100">
                        <div className="flex items-center gap-6">
                          <span className="w-16 h-16 bg-teal-600 text-white rounded-[24px] flex items-center justify-center font-black text-2xl shadow-2xl shadow-teal-600/30">{pIdx + 1}</span>
                          <h4 className="font-black text-slate-800 text-3xl uppercase tracking-tighter italic">{panel.name}</h4>
                        </div>
                        <button onClick={() => removeTestPanel(pIdx)} className="w-16 h-16 bg-white text-slate-400 hover:text-red-500 transition-all rounded-[24px] border-2 border-slate-100 shadow-md flex items-center justify-center">
                          <i className="fas fa-times text-2xl"></i>
                        </button>
                      </div>
                      <div className="p-14 space-y-8">
                        {panel.parameters.map((p, pParamIdx) => (
                          <div key={pParamIdx} className="grid grid-cols-12 gap-10 items-center px-8 py-6 bg-slate-50/50 hover:bg-teal-50/40 rounded-[40px] transition-all group border-2 border-transparent hover:border-teal-100">
                            <div className="col-span-5 text-lg font-black text-slate-700 group-hover:text-teal-700 tracking-tight leading-none">{p.name}</div>
                            <div className="col-span-4">
                              <input 
                                className="w-full p-5 bg-white border-4 border-slate-100 rounded-[28px] focus:border-teal-500 outline-none text-center text-xl font-black shadow-xl transition-all focus:ring-8 focus:ring-teal-500/10"
                                placeholder="RESULT"
                                value={p.value}
                                onChange={e => updateParameterValue(pIdx, pParamIdx, e.target.value)}
                              />
                            </div>
                            <div className="col-span-3 text-[11px] text-slate-500 font-black text-center bg-white py-4 rounded-3xl border-2 border-slate-50 shadow-inner italic uppercase leading-none">
                              {p.unit} • Range: {p.refRange}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={handleAddTest} 
                disabled={selectedPanels.length === 0}
                className={`w-full py-10 rounded-[50px] font-black text-3xl shadow-4xl transition-all active:scale-[0.98] transform hover:-translate-y-2 flex items-center justify-center gap-6 uppercase tracking-tighter ${
                  selectedPanels.length === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/40'
                }`}
              >
                <i className="fas fa-check-double text-4xl"></i> GENERATE LAB RECORD
              </button>
            </div>
          )}
        </div>
      </main>

      {/* HIDDEN PRINT TARGET (RENDERED OFF-SCREEN OR ON-PRINT) */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] overflow-visible">
        {selectedReport && selectedPatient && <ReportPDF patient={selectedPatient} report={selectedReport} />}
      </div>
    </div>
  );
};

export default App;
