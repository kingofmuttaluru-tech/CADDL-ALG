
import React from 'react';
import { DiagnosticReport, Patient } from '../types';

interface ReportPDFProps {
  patient: Patient;
  report: DiagnosticReport;
}

export const ReportPDF: React.FC<ReportPDFProps> = ({ patient, report }) => {
  return (
    <div id="report-a4-content" className="relative bg-white p-12 w-[210mm] min-h-[297mm] mx-auto shadow-2xl print:shadow-none text-slate-800 flex flex-col print:p-0">
      
      {/* Watermark Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.04] overflow-hidden">
        <svg 
          viewBox="0 0 24 24" 
          className="w-[500px] h-[500px] text-teal-600" 
          fill="currentColor"
        >
          <path d="M12,2C11.45,2 11,2.45 11,3C11,3.41 11.25,3.76 11.61,3.91L11,4.52L10.39,3.91C10.75,3.76 11,3.41 11,3C11,2.45 10.55,2 10,2C9.45,2 9,2.45 9,3C9,3.41 9.25,3.76 9.61,3.91L9,4.52L8.39,3.91C8.75,3.76 9,3.41 9,3C9,2.45 8.55,2 8,2C7.45,2 7,2.45 7,3C7,3.55 7.45,4 8,4C8.17,4 8.33,3.96 8.47,3.88L9.08,4.5C8.42,5.1 7.62,5.56 6.74,5.81C7.54,6.22 8.27,6.77 8.89,7.44C7.75,8.16 7,9.5 7,11C7,12.5 7.75,13.84 8.89,14.56C8.27,15.23 7.54,15.78 6.74,16.19C7.62,16.44 8.42,16.9 9.08,17.5L8.47,18.12C8.33,18.04 8.17,18 8,18C7.45,18 7,18.45 7,19C7,19.55 7.45,20 8,20C8.55,20 9,19.55 9,19C9,18.59 8.75,18.24 8.39,18.09L9,17.48L9.61,18.09C9.25,18.24 9,18.59 9,19C9,19.55 9.45,20 10,20C10.55,20 11,19.55 11,19C11,18.59 10.75,18.24 10.39,18.09L11,17.48L11.61,18.09C11.25,18.24 11.5,18.59 11.5,19C11.5,19.55 11.95,20 12.5,20C13.05,20 13.5,19.55 13.5,19C13.5,18.45 13.05,18 12.5,18C12.33,18 12.17,18.04 12.03,18.12L11.42,17.5C12.08,16.9 12.88,16.44 13.76,16.19C12.96,15.78 12.23,15.23 11.61,14.56C12.75,13.84 13.5,12.5 13.5,11C13.5,9.5 12.75,8.16 11.61,7.44C12.23,6.77 12.96,6.22 13.76,5.81C12.88,5.56 12.08,5.1 11.42,4.5L12.03,3.88C12.17,3.96 12.33,4 12.5,4C13.05,4 13.5,3.55 13.5,3C13.5,2.45 13.05,2 12.5,2C12,2 11.55,2.45 11.55,3C11.55,3.41 11.8,3.76 12.16,3.91L11.55,4.52L10.94,3.91C11.3,3.76 11.55,3.41 11.55,3C11.55,2.45 11.1,2 10.55,2H12M10.5,8C9.67,8 9,8.67 9,9.5C9,10.33 9.67,11 10.5,11C11.33,11 12,10.33 12,9.5C12,8.67 11.33,8 10.5,8M10.5,12C9.67,12 9,12.67 9,13.5C9,14.33 9.67,15 10.5,15C11.33,15 12,14.33 12,13.5C12,12.67 11.33,12 10.5,12Z" />
        </svg>
      </div>

      {/* Content Container (Ensure Z-index) */}
      <div className="relative z-10 flex flex-col flex-grow">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-teal-600 pb-6 mb-8 page-break-avoid">
          <div>
            <h1 className="text-xl font-bold text-teal-800 uppercase leading-tight">
              CONSTITUENCY ANIMAL DISEASE DIAGNOSTIC LABORATORY
            </h1>
            <p className="text-sm text-slate-600 mt-1 font-bold uppercase tracking-wider">ADRESS; ALLAGADDA</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase">Nandyal District, Andhra Pradesh</p>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <h2 className="text-xl font-bold uppercase tracking-wider text-slate-600 border-b pb-1 mb-2">Diagnostic Report</h2>
            <p className="text-sm">Report ID: <span className="font-mono font-bold text-teal-700">{report.id}</span></p>
            <p className="text-sm">Date: {new Date(report.date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Patient Information */}
        <div className="grid grid-cols-2 gap-8 mb-8 bg-slate-50/80 backdrop-blur-sm p-6 rounded-lg border border-slate-200 page-break-avoid">
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Animal Details</h3>
            <div className="grid grid-cols-2 gap-y-1 text-sm">
              <span className="text-slate-500">Species:</span>
              <span className="text-slate-700 font-semibold">{patient.species}</span>
              <span className="text-slate-500">Breed:</span>
              <span className="text-slate-700">{patient.breed}</span>
              <span className="text-slate-500">Age:</span>
              <span className="text-slate-700">{patient.age} YRS</span>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Owner & Provider</h3>
            <div className="grid grid-cols-2 gap-y-1 text-sm">
              <span className="text-slate-500">Owner:</span>
              <span className="font-semibold text-slate-700 uppercase">{patient.owner}</span>
              <span className="text-slate-500">Clinician:</span>
              <span className="text-slate-700">{report.clinician}</span>
              <span className="text-slate-500">Test Type:</span>
              <span className="text-slate-700 font-bold text-teal-700">{report.testType}</span>
            </div>
          </div>
        </div>

        {/* Test Results Table */}
        <div className="flex-grow">
          <table className="w-full text-left border-collapse mb-8 print:border">
            <thead className="print:table-header-group">
              <tr className="bg-teal-600 text-white text-sm print:bg-teal-600 print:text-white">
                <th className="p-3 rounded-tl-lg print:border-b">Parameter</th>
                <th className="p-3 print:border-b">Result Value</th>
                <th className="p-3 print:border-b">Unit</th>
                <th className="p-3 print:border-b">Normal Range</th>
                <th className="p-3 rounded-tr-lg print:border-b">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {report.parameters.map((param, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/50'} print:bg-transparent print:border-b backdrop-blur-[1px]`}>
                  <td className="p-3 font-medium border-b border-slate-100">{param.name}</td>
                  <td className={`p-3 border-b border-slate-100 font-bold ${param.status !== 'Normal' ? 'text-red-600' : 'text-slate-800'}`}>
                    {param.value}
                  </td>
                  <td className="p-3 border-b border-slate-100 text-slate-500">{param.unit}</td>
                  <td className="p-3 border-b border-slate-100 text-slate-500">{param.refRange}</td>
                  <td className="p-3 border-b border-slate-100">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      param.status === 'Normal' ? 'bg-green-100 text-green-700' : 
                      param.status === 'High' ? 'bg-red-100 text-red-700' : 
                      param.status === 'Low' ? 'bg-blue-100 text-blue-700' : 
                      'bg-orange-100 text-orange-700'
                    } print:border`}>
                      {param.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Clinical Interpretation */}
          <div className="mb-8 page-break-avoid">
            <h3 className="text-lg font-bold text-teal-800 mb-3 border-b pb-1">Clinical Interpretation & Summary</h3>
            <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap italic bg-teal-50/30 p-4 rounded-lg border border-teal-100 min-h-[80px] print:bg-white print:border-slate-300 backdrop-blur-sm">
              {report.summary || "This diagnostic report is generated based on automated clinical parameters. Professional veterinary consultation is required for final diagnosis and treatment planning."}
            </div>
          </div>
        </div>

        {/* Footer / Signature */}
        <div className="mt-12 page-break-avoid border-t-2 border-slate-100 pt-8">
          <div className="flex justify-between items-start px-4">
            {/* Lab Technician Signature Block */}
            <div className="w-72 space-y-2">
              <div className="border-b border-dotted border-slate-400 h-16 w-full"></div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-widest pt-2">LAB TECHNICIAN</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">(Signature & Stamp)</p>
            </div>
            
            {/* Assistant Director Signature Block */}
            <div className="w-72 space-y-2">
              <div className="border-b border-dotted border-slate-400 h-16 w-full"></div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-widest pt-2">ASSISTANT DIRECTOR</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">(Signature & Stamp)</p>
            </div>
          </div>

          <div className="mt-12 pt-4 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 italic">
            <p>Generated by CADDL Diagnostic Suite - {report.testType} Analysis</p>
            <p>Printed on: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
