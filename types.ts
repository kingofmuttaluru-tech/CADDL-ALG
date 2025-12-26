
export enum Species {
  DOG = 'Dog',
  CAT = 'Cat',
  BIRD = 'Bird',
  RABBIT = 'Rabbit',
  OTHER = 'Other'
}

export interface Patient {
  id: string;
  name: string;
  species: Species;
  breed: string;
  age: number;
  owner: string;
}

export interface TestParameter {
  name: string;
  value: number | string;
  unit: string;
  refRange: string;
  status: 'Normal' | 'High' | 'Low' | 'Abnormal' | 'Pending';
}

export interface DiagnosticReport {
  id: string;
  patientId: string;
  date: string;
  testType: string;
  parameters: TestParameter[];
  summary: string;
  clinician: string;
}

export interface VetContext {
  patients: Patient[];
  reports: DiagnosticReport[];
}
