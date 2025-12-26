
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

// Local Storage Keys
const STORAGE_KEY_PATIENT = 'vetdiag_new_patient_form';
const STORAGE_KEY_TEST_V2 = 'vetdiag_multi_test_form';

// Comprehensive Test Templates
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
  'Hormone & Vitamin Profile': [
    { name: 'Vitamin D (25-OH)', value: '', unit: 'ng/mL', refRange: '20 – 50', status: 'Pending' },
    { name: 'Vitamin B12', value: '', unit: 'pg/mL', refRange: '200 – 900', status: 'Pending' },
    { name: 'Prolactin', value: '', unit: 'ng/mL', refRange: '4 – 25', status: 'Pending' },
  ],
  'Lipid Profile': [
    { name: 'Total Cholesterol', value: '', unit: 'mg/dL', refRange: '< 200', status: 'Pending' },
    { name: 'LDL Cholesterol', value: '', unit: 'mg/dL', refRange: '< 100', status: 'Pending' },
    { name: 'HDL Cholesterol', value: '', unit: 'mg/dL', refRange: '> 40', status: 'Pending' },
    { name: 'Triglycerides', value: '', unit: 'mg/dL', refRange: '< 150', status: 'Pending' },
  ],
  'Skin Scraping / Cytology': [
    { name: 'Mites (Demodex/Sarcoptes)', value: '', unit: 'obs', refRange: 'Negative', status: 'Pending' },
    { name: 'Fungal Hyphae', value: '', unit: 'obs', refRange: 'None Seen', status: 'Pending' },
    { name: 'Ectoparasites', value: '', unit: 'obs', refRange: 'Negative', status: 'Pending' },
  ],
  'Milk Analysis': [
    { name: 'Somatic Cell Count', value: '', unit: 'cells/mL', refRange: '< 200000', status: 'Pending' },
    { name: 'Fat Content', value: '', unit: '%', refRange: '3.5 – 4.5', status: 'Pending' },
    { name: 'Protein Content', value: '', unit: '%', refRange: '3.0 – 3.5', status: 'Pending' },
  ],
  'Fecal Analysis': [
    { name: 'Ova/Cysts', value: '', unit: 'obs', refRange: 'None Seen', status: 'Pending' },
    { name: 'Occult Blood', value: '', unit: 'qual', refRange: 'Negative', status: 'Pending' },
    { name: 'Consistency', value: '', unit: 'type', refRange: 'Formed', status: 'Pending' },
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
  
  // Search and Filter States
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [dateStartFilter, setDateStartFilter] = useState('');
  const [dateEndFilter, setDateEndFilter] = useState('');

  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatientData, setNewPatientData] = useState<Omit<Patient, 'id'>>({
    name: '', species: Species.DOG, breed: '', age: 0, owner: ''
  });

  const [newTestPatientId, setNewTestPatientId] = useState('');
  
  // State for multiple test panels in one report
  const [selectedPanels, setSelectedPanels] = useState<{name: string, parameters: TestParameter[]}[]>([]);

  useEffect(() => {
    const savedPatients = localStorage.getItem('vetdiag_patients');
    if (savedPatients) setPatients(JSON.parse(savedPatients));
    const savedReports = localStorage.getItem('vetdiag_reports');
    if (savedReports) setReports(JSON.parse(savedReports));

    const savedPatientForm = localStorage.getItem(STORAGE_KEY_PATIENT);
    if (savedPatientForm) {
      try { setNewPatientData(JSON.parse(savedPatientForm)); } catch (e) {}
    }
    const savedTestForm = localStorage.getItem(STORAGE_KEY_TEST_V2);
    if (savedTestForm) {
      try {
        const testData = JSON.parse(savedTestForm);
        if (testData.patientId) setNewTestPatientId(testData.patientId);
        if (testData.panels) setSelectedPanels(testData.panels);
      } catch (e) {}
    }
  }, []);

  useEffect(() => { localStorage.setItem('vetdiag_patients', JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem('vetdiag_reports', JSON.stringify(reports)); }, [reports]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_PATIENT, JSON.stringify(newPatientData)); }, [newPatientData]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TEST_V2, JSON.stringify({
      patientId: newTestPatientId, panels: selectedPanels
    }));
  }, [newTestPatientId, selectedPanels]);

  // Derived: Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const patient = patients.find(p => p.id === report.patientId);
      const patientName = patient?.name.toLowerCase() || '';
      const testType = report.testType.toLowerCase();
      const query = reportSearchQuery.toLowerCase();

      const matchesSearch = patientName.includes(query) || testType.includes(query);

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

  const clearAllPanels = () => {
    setSelectedPanels([]);
  };

  const updateParameterValue = (panelIdx: number, paramIdx: number, value: string) => {
    const updated = [...selectedPanels];
    updated[panelIdx].parameters[paramIdx].value = value;
    setSelectedPanels(updated);
  };

  const calculateStatus = (val: string, range: string): 'Normal' | 'High' | 'Low' | 'Abnormal' | 'Pending' => {
    if (!val) return 'Pending';
    const cleanVal = val.toLowerCase().trim();
    const cleanRange = range.toLowerCase().trim();

    if (['absent', 'negative', 'none seen', 'pale yellow', 'formed', 'brown'].includes(cleanRange)) {
      return cleanVal === cleanRange ? 'Normal' : 'Abnormal';
    }

    let processedRange = cleanRange.replace('lakh', '').trim();
    const numericVal = parseFloat(val.replace(/,/g, ''));
    if (isNaN(numericVal)) return 'Abnormal';

    if (processedRange.includes('–') || processedRange.includes('-')) {
      const parts = processedRange.split(/[–-]/);
      const min = parseFloat(parts[0].trim().replace(/,/g, ''));
      const max = parseFloat(parts[1].trim().replace(/,/g, ''));
      if (numericVal < min) return 'Low';
      if (numericVal > max) return 'High';
      return 'Normal';
    }

    if (processedRange.startsWith('<')) {
      const limit = parseFloat(processedRange.substring(1).trim().replace(/,/g, ''));
      return numericVal < limit ? 'Normal' : 'High';
    }

    if (processedRange.startsWith('>')) {
      const limit = parseFloat(processedRange.substring(1).trim().replace(/,/g, ''));
      return numericVal > limit ? 'Normal' : 'Low';
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
  };

  const handleAddTest = () => {
    if (!newTestPatientId) return alert('Please select a patient.');
    if (selectedPanels.length === 0) return alert('Please add at least one test panel.');
    
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
    localStorage.removeItem(STORAGE_KEY_TEST_V2);
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);
  const selectedPatient = patients.find(p => p.id === selectedReport?.patientId);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-teal-900 text-white flex-shrink-0 no-print">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <i className="fas fa-microscope text-teal-400"></i> CADDL Lab
          </h1>
          <p className="text-[10px] text-teal-300 font-medium leading-tight mt-1">CONSTITUENCY ANIMAL DISEASE DIAGNOSTIC LABORATORY</p>
        </div>
        <nav className="mt-6">
          {['dashboard', 'patients', 'reports', 'new-test'].map((tab) => (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab as any); setIsAddingPatient(false); }}
              className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-colors capitalize ${activeTab === tab ? 'bg-teal-700 border-l-4 border-teal-400' : 'hover:bg-teal-800'}`}
            >
              <i className={`fas fa-${tab === 'dashboard' ? 'chart-line' : tab === 'patients' ? 'users' : tab === 'reports' ? 'file-medical' : 'plus-circle'} w-5`}></i>
              {tab.replace('-', ' ')}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-print">
        <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-700 capitalize">{activeTab.replace('-', ' ')}</h2>
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white"><i className="fas fa-user-md"></i></div>
        </header>

        <div className="p-4 md:p-8">
          {activeTab === 'dashboard' && (
             <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl"><i className="fas fa-calendar-check"></i></div>
                  <div><p className="text-sm text-slate-500">Reports Generated</p><p className="text-2xl font-bold text-slate-800">{reports.length}</p></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xl"><i className="fas fa-dog"></i></div>
                  <div><p className="text-sm text-slate-500">Total Patients</p><p className="text-2xl font-bold text-slate-800">{patients.length}</p></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-xl"><i className="fas fa-clock"></i></div>
                  <div><p className="text-sm text-slate-500">System Uptime</p><p className="text-2xl font-bold text-slate-800">99.9%</p></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-700 mb-4">Diagnostics Analytics</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{n:'Mon',t:reports.length},{n:'Tue',t:reports.length*0.8},{n:'Wed',t:reports.length*1.1}]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="n" axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="t" stroke="#0d9488" strokeWidth={3} dot={{fill:'#0d9488'}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              {!isAddingPatient ? (
                <>
                <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-700">Patient Registry</h3>
                  <button onClick={() => setIsAddingPatient(true)} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold"><i className="fas fa-plus mr-2"></i>New Patient</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase"><tr className="border-b"><th className="px-6 py-4">ID</th><th className="px-6 py-4">Name</th><th className="px-6 py-4">Species</th><th className="px-6 py-4">Breed</th><th className="px-6 py-4">Owner</th></tr></thead>
                    <tbody className="divide-y text-sm">
                      {patients.map(p => (
                        <tr key={p.id} className="hover:bg-teal-50/30">
                          <td className="px-6 py-4 font-mono text-slate-500">{p.id}</td>
                          <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                          <td className="px-6 py-4">{p.species}</td>
                          <td className="px-6 py-4">{p.breed}</td>
                          <td className="px-6 py-4 text-slate-600">{p.owner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              ) : (
                <form onSubmit={handleAddPatient} className="p-8 max-w-2xl mx-auto space-y-6">
                  <h3 className="text-2xl font-bold text-slate-800">Register New Patient</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                      <input required className="w-full p-3 border rounded-lg bg-slate-50" value={newPatientData.name} onChange={e => setNewPatientData({...newPatientData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Species</label>
                      <select className="w-full p-3 border rounded-lg bg-slate-50" value={newPatientData.species} onChange={e => setNewPatientData({...newPatientData, species: e.target.value as Species})}>
                        {Object.values(Species).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Age (Yrs)</label>
                      <input type="number" className="w-full p-3 border rounded-lg bg-slate-50" value={newPatientData.age} onChange={e => setNewPatientData({...newPatientData, age: Number(e.target.value)})} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Owner Name</label>
                      <input required className="w-full p-3 border rounded-lg bg-slate-50" value={newPatientData.owner} onChange={e => setNewPatientData({...newPatientData, owner: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="flex-1 p-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg">Register</button>
                    <button type="button" onClick={() => setIsAddingPatient(false)} className="p-4 bg-slate-200 rounded-xl font-bold">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center justify-between">
                  Diagnostic Archive
                  <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600 font-medium">
                    {filteredReports.length} results
                  </span>
                </h3>
                
                <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="text" 
                      placeholder="Search patient or test..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      value={reportSearchQuery}
                      onChange={e => setReportSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">From</label>
                      <input 
                        type="date" 
                        className="w-full p-1.5 bg-slate-50 border rounded text-xs outline-none focus:ring-1 focus:ring-teal-500" 
                        value={dateStartFilter}
                        onChange={e => setDateStartFilter(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">To</label>
                      <input 
                        type="date" 
                        className="w-full p-1.5 bg-slate-50 border rounded text-xs outline-none focus:ring-1 focus:ring-teal-500"
                        value={dateEndFilter}
                        onChange={e => setDateEndFilter(e.target.value)}
                      />
                    </div>
                  </div>
                  {(reportSearchQuery || dateStartFilter || dateEndFilter) && (
                    <button 
                      onClick={() => { setReportSearchQuery(''); setDateStartFilter(''); setDateEndFilter(''); }}
                      className="text-[10px] font-bold text-teal-600 hover:text-teal-700 uppercase flex items-center gap-1"
                    >
                      <i className="fas fa-times-circle"></i> Clear Filters
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto max-h-[600px] pr-2 space-y-3 custom-scrollbar">
                  {filteredReports.length > 0 ? (
                    filteredReports.map(r => (
                      <div key={r.id} onClick={() => setSelectedReportId(r.id)} className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${selectedReportId === r.id ? 'border-teal-500 bg-white shadow-lg' : 'bg-white border-transparent shadow-sm hover:border-slate-200'}`}>
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{patients.find(p => p.id === r.patientId)?.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{r.id}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{r.testType}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-slate-400"><i className="fas fa-calendar mr-1"></i>{r.date}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            r.parameters.some(p => p.status !== 'Normal') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                          }`}>
                            {r.parameters.some(p => p.status !== 'Normal') ? 'Abnormal' : 'All Normal'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-400">
                      <i className="fas fa-search text-3xl mb-2 opacity-20"></i>
                      <p className="text-sm">No reports matching criteria</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:col-span-2">
                {selectedReport ? (
                  <div className="bg-white rounded-2xl shadow-xl h-[850px] flex flex-col overflow-hidden border">
                    <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                      <div className="flex gap-2">
                        <button onClick={() => window.print()} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold"><i className="fas fa-download mr-2"></i>Download PDF</button>
                        <button onClick={() => {
                          const patient = patients.find(p => p.id === selectedReport.patientId);
                          if (patient) {
                            setIsAiLoading(true);
                            setAiInterpretation('');
                            getDiagnosticInterpretation(patient, selectedReport).then(res => {
                              setAiInterpretation(res);
                              setIsAiLoading(false);
                            });
                          }
                        }} disabled={isAiLoading} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                          {isAiLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-robot"></i>} Gemini Interpret
                        </button>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{selectedReport.id}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
                      <div className="scale-[0.85] origin-top shadow-2xl mx-auto w-fit border"><ReportPDF patient={selectedPatient!} report={selectedReport} /></div>
                      {aiInterpretation && (
                        <div className="mt-8 bg-purple-50 p-6 rounded-2xl border border-purple-200 max-w-[210mm] mx-auto shadow-sm">
                          <h4 className="text-purple-800 font-bold mb-3 flex items-center gap-2"><i className="fas fa-sparkles"></i> AI Specialist Insights</h4>
                          <div className="text-sm text-purple-900 leading-relaxed whitespace-pre-wrap">{aiInterpretation}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : <div className="h-full border-4 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300"><i className="fas fa-file-medical text-6xl mb-4"></i><p className="font-bold">Select a report to view details</p></div>}
              </div>
            </div>
          )}

          {activeTab === 'new-test' && (
            <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-xl border">
              <h3 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-4">
                <i className="fas fa-microscope text-teal-600"></i> Comprehensive Lab Builder
              </h3>
              
              <div className="mb-8 p-6 bg-slate-50 rounded-2xl border grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Selection</label>
                  <select className="w-full p-4 bg-white border rounded-xl mt-2 font-medium" value={newTestPatientId} onChange={e => setNewTestPatientId(e.target.value)}>
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species}) - ID: {p.id}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Choose Test Category (Predefined)</label>
                  <div className="flex gap-2">
                    <select id="panel-selector" className="flex-1 p-4 bg-white border rounded-xl font-medium outline-none focus:ring-2 focus:ring-teal-500">
                      {Object.keys(TEST_TEMPLATES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <button 
                      onClick={() => {
                        const sel = document.getElementById('panel-selector') as HTMLSelectElement;
                        addTestPanel(sel.value);
                      }}
                      className="px-6 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-md"
                    >
                      <i className="fas fa-plus mr-2"></i>Add Panel
                    </button>
                  </div>
                </div>
              </div>

              {selectedPanels.length === 0 ? (
                <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                  <i className="fas fa-vial text-5xl mb-4 opacity-20"></i>
                  <p className="font-bold text-lg">No tests added yet.</p>
                  <p className="text-sm">Select a test from the predefined list above to begin.</p>
                </div>
              ) : (
                <div className="space-y-8 mb-10">
                  <div className="flex justify-between items-center px-2">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Added Panels ({selectedPanels.length})</h4>
                    <button onClick={clearAllPanels} className="text-xs font-bold text-red-500 hover:text-red-700 uppercase flex items-center gap-1">
                      <i className="fas fa-trash-alt"></i> Clear All
                    </button>
                  </div>
                  {selectedPanels.map((panel, pIdx) => (
                    <div key={pIdx} className="border rounded-2xl overflow-hidden bg-white shadow-sm border-slate-200">
                      <div className="bg-slate-100 p-4 flex justify-between items-center border-b">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xs">{pIdx + 1}</span>
                          <h4 className="font-bold text-slate-700">{panel.name}</h4>
                        </div>
                        <button onClick={() => removeTestPanel(pIdx)} className="text-slate-400 hover:text-red-500 transition-colors p-2">
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-12 gap-4 text-[10px] font-bold text-slate-400 uppercase px-4">
                          <div className="col-span-5">Parameter Name</div>
                          <div className="col-span-3">Result Value</div>
                          <div className="col-span-2">Unit</div>
                          <div className="col-span-2">Reference Range</div>
                        </div>
                        {panel.parameters.map((p, pParamIdx) => (
                          <div key={pParamIdx} className="grid grid-cols-12 gap-4 items-center px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors group">
                            <div className="col-span-5 text-sm font-medium text-slate-700 group-hover:text-teal-700 transition-colors">{p.name}</div>
                            <div className="col-span-3">
                              <input 
                                className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-teal-500 outline-none text-sm font-bold shadow-sm"
                                placeholder="Enter..."
                                value={p.value}
                                onChange={e => updateParameterValue(pIdx, pParamIdx, e.target.value)}
                              />
                            </div>
                            <div className="col-span-2 text-xs text-slate-400 font-mono font-bold">{p.unit}</div>
                            <div className="col-span-2 text-[10px] text-slate-500 italic text-center truncate font-bold bg-white p-1 rounded border">{p.refRange}</div>
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
                className={`w-full py-5 rounded-2xl font-bold text-xl shadow-xl transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3 ${
                  selectedPanels.length === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                <i className="fas fa-file-export"></i> Generate Comprehensive Report
              </button>
            </div>
          )}
        </div>
      </main>

      <div className="hidden print:block fixed inset-0 bg-white z-[9999] overflow-visible">
        {selectedReport && selectedPatient && <ReportPDF patient={selectedPatient} report={selectedReport} />}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default App;