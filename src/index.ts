// core
export {
  normalizeText,
  splitTerms,
  buildHaystack,
  matchesAllTerms,
  matchText,
  longestTerm,
} from './core/normalize';
export { entityId, isRemoteSource } from './core/types';
export type {
  SearchOption,
  SearchResult,
  SearchSource,
  LocalSource,
  RemoteSource,
  RemoteSearchFn,
} from './core/types';
export { useSearch } from './core/useSearch';
export type { SearchConfig } from './core/useSearch';
export { useLocalSearch } from './core/useLocalSearch';
export { useRemoteSearch } from './core/useRemoteSearch';
export type { EntitySearchOptions } from './core/entity';

// estudio
export {
  COMPOUND_SUBITEM_CODE_REGEX,
  isCompoundSubItemCode,
  isCompoundSubItem,
  studyLabel,
  studySearchText,
  matchStudy,
  studyToOption,
  findStudyByExactCode,
  profileLabel,
  matchProfile,
  profileToOption,
  findProfileByShortcut,
  resolveStudyInput,
} from './study/study';
export type { StudyLike, StudyProfileLike, ExactStudyMatch } from './study/study';
export { useStudySearch } from './study/useStudySearch';
export type { StudySearchOptions, StudySearchResult } from './study/useStudySearch';

// médico
export {
  doctorLabel,
  doctorLabelLastNameFirst,
  doctorSearchText,
  matchDoctor,
  doctorToOption,
  doctorRemoteQuery,
} from './doctor/doctor';
export type { DoctorLike } from './doctor/doctor';
export { useDoctorSearch } from './doctor/useDoctorSearch';
export type { DoctorSearchOptions } from './doctor/useDoctorSearch';

// diagnóstico
export {
  diagnosisLabel,
  normalizeDiagnosisCode,
  diagnosisSearchText,
  matchDiagnosis,
  findDiagnosisByCode,
  diagnosisToOption,
} from './diagnosis/diagnosis';
export type { DiagnosisLike } from './diagnosis/diagnosis';
export { useDiagnosisSearch } from './diagnosis/useDiagnosisSearch';
export type { DiagnosisSearchOptions, DiagnosisSearchResult } from './diagnosis/useDiagnosisSearch';

// obra social
export {
  insuranceLabel,
  insuranceSearchText,
  matchInsurance,
  isInsuranceSuspended,
  insuranceToOption,
} from './insurance/insurance';
export type { InsuranceLike, InsuranceOption } from './insurance/insurance';
export { useInsuranceSearch } from './insurance/useInsuranceSearch';
export type { InsuranceSearchOptions, InsuranceSearchResult } from './insurance/useInsuranceSearch';

// paciente
export {
  patientDni,
  patientId,
  patientFullName,
  patientLabel,
  patientSearchText,
  matchPatient,
  patientToOption,
} from './patient/patient';
export type { PatientLike } from './patient/patient';
export { isDniScan, parseDniData, parseDniScan, parseDniDate } from './patient/dniScan';
export type { PatientFromDni, DniScanResult } from './patient/dniScan';
export { usePatientSearch } from './patient/usePatientSearch';
export type { PatientSearchOptions, PatientSearchResult } from './patient/usePatientSearch';

// bioquímico
export {
  biochemistLabel,
  biochemistSearchText,
  matchBiochemist,
  biochemistToOption,
} from './biochemist/biochemist';
export type { BiochemistLike } from './biochemist/biochemist';
export { useBiochemistSearch } from './biochemist/useBiochemistSearch';
export type { BiochemistSearchOptions } from './biochemist/useBiochemistSearch';

// planilla
export {
  worksheetLabel,
  worksheetSearchText,
  matchWorksheet,
  findWorksheetByCode,
  worksheetToOption,
} from './worksheet/worksheet';
export type { WorksheetLike } from './worksheet/worksheet';
export { useWorksheetSearch } from './worksheet/useWorksheetSearch';
export type { WorksheetSearchOptions, WorksheetSearchResult } from './worksheet/useWorksheetSearch';
