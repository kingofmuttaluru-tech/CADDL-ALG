
import React from 'react';
import { DiagnosticReport, Patient } from '../types';

interface ReportPDFProps {
  patient: Patient;
  report: DiagnosticReport;
}

export const ReportPDF: React.FC<ReportPDFProps> = ({ patient, report }) => {
  return (
    <div id="report-a4-content" className="bg-white p-12 w-[210mm] min-h-[297mm] mx-auto shadow-2xl print:shadow-none text-slate-800 flex flex-col print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-teal-600 pb-6 mb-8 page-break-avoid">
        <div>
          <h1 className="text-xl font-bold text-teal-800 uppercase leading-tight">
            CONSTITUENCY ANIMAL DISEASE DIAGNOSTIC LABORATORY
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium italic">Advanced Veterinary Diagnostic & Clinical Services</p>
          <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">ALLAGADDA, Nandyal District, Andhra Pradesh</p>
          <p className="text-xs text-slate-400 mt-1">Phone: +91 944XXXXXXX • Email: lab.allagadda@caddl.in</p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-slate-600 border-b pb-1 mb-2">Diagnostic Report</h2>
          <p className="text-sm">Report ID: <span className="font-mono font-bold text-teal-700">{report.id}</span></p>
          <p className="text-sm">Date: {new Date(report.date).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Patient Information */}
      <div className="grid grid-cols-2 gap-8 mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200 page-break-avoid">
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
            <span className="font-semibold text-slate-700">{patient.owner}</span>
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
              <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} print:bg-transparent print:border-b`}>
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
          <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap italic bg-teal-50/30 p-4 rounded-lg border border-teal-100 min-h-[80px] print:bg-white print:border-slate-300">
            {report.summary || "This diagnostic report is generated based on automated clinical parameters. Professional veterinary consultation is required for final diagnosis and treatment planning."}
          </div>
        </div>
      </div>

      {/* Footer / Signature */}
      <div className="mt-12 page-break-avoid">
        <div className="flex justify-between items-end mb-16 px-4">
          {/* Lab Technician Signature */}
          <div className="text-center w-64">
            <div className="border-b border-slate-400 h-16 mb-2"></div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">LAB TECHNICIAN SIGN</p>
          </div>
          
          {/* Assistant Director Signature */}
          <div className="text-center w-64">
            <div className="border-b border-slate-400 h-16 mb-2"></div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">ASSISSTANT DIRECTOR SIGN</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 italic">
          <p>Generated by CADDL Diagnostic Suite - CONSTITUENCY ANIMAL DISEASE DIAGNOSTIC LABORATORY, ALLAGADDA</p>
          <p>Printed on: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};
