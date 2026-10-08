"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  COMPOUND_SUBITEM_CODE_REGEX: () => COMPOUND_SUBITEM_CODE_REGEX,
  biochemistLabel: () => biochemistLabel,
  biochemistSearchText: () => biochemistSearchText,
  biochemistToOption: () => biochemistToOption,
  buildHaystack: () => buildHaystack,
  diagnosisLabel: () => diagnosisLabel,
  diagnosisSearchText: () => diagnosisSearchText,
  diagnosisToOption: () => diagnosisToOption,
  doctorLabel: () => doctorLabel,
  doctorLabelLastNameFirst: () => doctorLabelLastNameFirst,
  doctorRemoteQuery: () => doctorRemoteQuery,
  doctorSearchText: () => doctorSearchText,
  doctorToOption: () => doctorToOption,
  entityId: () => entityId,
  findDiagnosisByCode: () => findDiagnosisByCode,
  findProfileByShortcut: () => findProfileByShortcut,
  findStudyByExactCode: () => findStudyByExactCode,
  findWorksheetByCode: () => findWorksheetByCode,
  insuranceLabel: () => insuranceLabel,
  insuranceSearchText: () => insuranceSearchText,
  insuranceToOption: () => insuranceToOption,
  isCompoundSubItem: () => isCompoundSubItem,
  isCompoundSubItemCode: () => isCompoundSubItemCode,
  isDniScan: () => isDniScan,
  isInsuranceSuspended: () => isInsuranceSuspended,
  isRemoteSource: () => isRemoteSource,
  longestTerm: () => longestTerm,
  matchBiochemist: () => matchBiochemist,
  matchDiagnosis: () => matchDiagnosis,
  matchDoctor: () => matchDoctor,
  matchInsurance: () => matchInsurance,
  matchPatient: () => matchPatient,
  matchProfile: () => matchProfile,
  matchStudy: () => matchStudy,
  matchText: () => matchText,
  matchWorksheet: () => matchWorksheet,
  matchesAllTerms: () => matchesAllTerms,
  normalizeDiagnosisCode: () => normalizeDiagnosisCode,
  normalizeText: () => normalizeText,
  parseDniData: () => parseDniData,
  parseDniDate: () => parseDniDate,
  parseDniScan: () => parseDniScan,
  patientDni: () => patientDni,
  patientFullName: () => patientFullName,
  patientId: () => patientId,
  patientLabel: () => patientLabel,
  patientSearchText: () => patientSearchText,
  patientToOption: () => patientToOption,
  profileLabel: () => profileLabel,
  profileToOption: () => profileToOption,
  resolveStudyInput: () => resolveStudyInput,
  splitTerms: () => splitTerms,
  studyLabel: () => studyLabel,
  studySearchText: () => studySearchText,
  studyToOption: () => studyToOption,
  useBiochemistSearch: () => useBiochemistSearch,
  useDiagnosisSearch: () => useDiagnosisSearch,
  useDoctorSearch: () => useDoctorSearch,
  useInsuranceSearch: () => useInsuranceSearch,
  useLocalSearch: () => useLocalSearch,
  usePatientSearch: () => usePatientSearch,
  useRemoteSearch: () => useRemoteSearch,
  useSearch: () => useSearch,
  useStudySearch: () => useStudySearch,
  useWorksheetSearch: () => useWorksheetSearch,
  worksheetLabel: () => worksheetLabel,
  worksheetSearchText: () => worksheetSearchText,
  worksheetToOption: () => worksheetToOption
});
module.exports = __toCommonJS(src_exports);

// src/core/normalize.ts
function normalizeText(value) {
  if (value === null || value === void 0) return "";
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\./g, "").toLowerCase().replace(/\s+/g, " ").trim();
}
function splitTerms(query) {
  const normalized = normalizeText(query);
  return normalized ? normalized.split(" ") : [];
}
function buildHaystack(...parts) {
  return normalizeText(
    parts.filter((part) => part !== null && part !== void 0 && part !== "").map((part) => String(part)).join(" ")
  );
}
function matchesAllTerms(haystack, terms) {
  for (const term of terms) {
    if (!haystack.includes(term)) return false;
  }
  return true;
}
function matchText(query, ...parts) {
  return matchesAllTerms(buildHaystack(...parts), splitTerms(query));
}
function longestTerm(query) {
  const terms = String(query != null ? query : "").trim().split(/\s+/).filter(Boolean);
  let best = "";
  for (const term of terms) {
    if (term.length > best.length) best = term;
  }
  return best;
}

// src/core/types.ts
function isRemoteSource(source) {
  return typeof source.search === "function";
}
function entityId(item) {
  var _a;
  if (item === null || item === void 0) return "";
  if (typeof item !== "object") return String(item);
  const record = item;
  const id = (_a = record.id) != null ? _a : record._id;
  return id === null || id === void 0 ? "" : String(id);
}

// src/core/useSearch.ts
var import_react = require("react");
function buildEntry(item, toOption, searchText) {
  const option = toOption(item);
  const extra = searchText ? searchText(item) : [];
  return {
    option,
    haystack: buildHaystack(option.label, option.secondary, ...extra)
  };
}
var EMPTY = [];
function useSearch(config) {
  var _a, _b, _c, _d, _e, _f, _g;
  const remote = isRemoteSource(config.source);
  const items = remote ? void 0 : config.source.items;
  const searchFn = remote ? config.source.search : void 0;
  const toOptionRef = (0, import_react.useRef)(config.toOption);
  const searchTextRef = (0, import_react.useRef)(config.searchText);
  const filterRef = (0, import_react.useRef)(config.filter);
  const searchFnRef = (0, import_react.useRef)(searchFn);
  const remoteQueryRef = (0, import_react.useRef)(config.remoteQuery);
  const suspendRef = (0, import_react.useRef)(config.suspend);
  toOptionRef.current = config.toOption;
  searchTextRef.current = config.searchText;
  filterRef.current = config.filter;
  searchFnRef.current = searchFn;
  remoteQueryRef.current = config.remoteQuery;
  suspendRef.current = config.suspend;
  const [ownInput, setOwnInput] = (0, import_react.useState)((_a = config.initialInputValue) != null ? _a : "");
  const controlled = config.inputValue !== void 0;
  const inputValue = controlled ? config.inputValue : ownInput;
  const onChangeRef = (0, import_react.useRef)(config.onInputValueChange);
  onChangeRef.current = config.onInputValueChange;
  const setInputValue = (0, import_react.useCallback)(
    (value) => {
      var _a2;
      const next = value != null ? value : "";
      if (!controlled) setOwnInput(next);
      (_a2 = onChangeRef.current) == null ? void 0 : _a2.call(onChangeRef, next);
    },
    [controlled]
  );
  const reset = (0, import_react.useCallback)(() => setInputValue(""), [setInputValue]);
  const query = inputValue.trim();
  const terms = (0, import_react.useMemo)(() => splitTerms(query), [query]);
  const suspended = Boolean((_b = config.suspend) == null ? void 0 : _b.call(config, inputValue));
  const minChars = (_c = config.minChars) != null ? _c : remote ? 1 : 0;
  const qualifies = !suspended && query.length > 0 && query.length >= minChars;
  const excludeKey = ((_d = config.excludeIds) != null ? _d : EMPTY).join("\0");
  const excluded = (0, import_react.useMemo)(
    () => new Set(excludeKey ? excludeKey.split("\0") : []),
    [excludeKey]
  );
  const deps = (_e = config.deps) != null ? _e : EMPTY;
  const localEntries = (0, import_react.useMemo)(() => {
    if (remote || !items) return [];
    const filter = filterRef.current;
    const result = [];
    for (const item of items) {
      if (filter && !filter(item)) continue;
      result.push(buildEntry(item, toOptionRef.current, searchTextRef.current));
    }
    return result;
  }, [remote, items, ...deps]);
  const localById = (0, import_react.useMemo)(() => {
    const map = /* @__PURE__ */ new Map();
    for (const entry of localEntries) {
      if (!map.has(entry.option.id)) map.set(entry.option.id, entry.option);
    }
    return map;
  }, [localEntries]);
  const showAllWhenEmpty = (_f = config.showAllWhenEmpty) != null ? _f : true;
  const limit = config.limit;
  const localOptions = (0, import_react.useMemo)(() => {
    if (remote) return [];
    if (suspended) return [];
    if (!query) {
      if (!showAllWhenEmpty) return [];
    } else if (query.length < minChars) {
      return [];
    }
    const result = [];
    for (const entry of localEntries) {
      if (excluded.has(entry.option.id)) continue;
      if (!matchesAllTerms(entry.haystack, terms)) continue;
      result.push(entry.option);
      if (limit !== void 0 && result.length >= limit) break;
    }
    return result;
  }, [remote, suspended, query, showAllWhenEmpty, minChars, localEntries, excluded, terms, limit]);
  const [remoteEntries, setRemoteEntries] = (0, import_react.useState)([]);
  const [remoteLoading, setRemoteLoading] = (0, import_react.useState)(false);
  const [remoteError, setRemoteError] = (0, import_react.useState)(null);
  const [answeredQuery, setAnsweredQuery] = (0, import_react.useState)(null);
  const requestIdRef = (0, import_react.useRef)(0);
  const controllerRef = (0, import_react.useRef)(null);
  const seenRef = (0, import_react.useRef)(/* @__PURE__ */ new Map());
  const debounceMs = (_g = config.debounceMs) != null ? _g : 300;
  (0, import_react.useEffect)(() => {
    var _a2;
    if (!remote) return void 0;
    const requestId = ++requestIdRef.current;
    (_a2 = controllerRef.current) == null ? void 0 : _a2.abort();
    controllerRef.current = null;
    if (!qualifies) {
      setRemoteEntries([]);
      setRemoteLoading(false);
      setRemoteError(null);
      setAnsweredQuery(null);
      return void 0;
    }
    setRemoteLoading(true);
    const timer = setTimeout(() => {
      const fn = searchFnRef.current;
      if (!fn) return;
      const controller = new AbortController();
      controllerRef.current = controller;
      const sent = remoteQueryRef.current ? remoteQueryRef.current(query) : query;
      let promise;
      try {
        promise = Promise.resolve(fn(sent, controller.signal));
      } catch (error2) {
        promise = Promise.reject(error2);
      }
      promise.then(
        (found) => {
          if (requestIdRef.current !== requestId) return;
          const filter = filterRef.current;
          const entries = [];
          for (const item of Array.isArray(found) ? found : []) {
            if (filter && !filter(item)) continue;
            const entry = buildEntry(item, toOptionRef.current, searchTextRef.current);
            seenRef.current.set(entry.option.id, entry.option);
            entries.push(entry);
          }
          setRemoteEntries(entries);
          setRemoteError(null);
          setAnsweredQuery(query);
          setRemoteLoading(false);
        },
        (error2) => {
          if (requestIdRef.current !== requestId) return;
          setRemoteEntries([]);
          setRemoteError(error2 != null ? error2 : new Error("Error de b\xFAsqueda"));
          setAnsweredQuery(query);
          setRemoteLoading(false);
        }
      );
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [remote, qualifies, query, debounceMs, ...deps]);
  (0, import_react.useEffect)(
    () => () => {
      var _a2;
      requestIdRef.current += 1;
      (_a2 = controllerRef.current) == null ? void 0 : _a2.abort();
    },
    []
  );
  const refine = Boolean(config.refineRemote);
  const remoteOptions = (0, import_react.useMemo)(() => {
    if (!remote) return [];
    const result = [];
    for (const entry of remoteEntries) {
      if (excluded.has(entry.option.id)) continue;
      if (refine && !matchesAllTerms(entry.haystack, terms)) continue;
      result.push(entry.option);
    }
    return result;
  }, [remote, remoteEntries, excluded, refine, terms]);
  const knownItems = config.knownItems;
  const knownById = (0, import_react.useMemo)(() => {
    const map = /* @__PURE__ */ new Map();
    if (!knownItems) return map;
    for (const item of knownItems) {
      const option = toOptionRef.current(item);
      if (!map.has(option.id)) map.set(option.id, option);
    }
    return map;
  }, [knownItems, ...deps]);
  const getOptionById = (0, import_react.useCallback)(
    (id) => {
      var _a2, _b2;
      if (id === null || id === void 0 || id === "") return void 0;
      const key = String(id);
      return (_b2 = (_a2 = localById.get(key)) != null ? _a2 : seenRef.current.get(key)) != null ? _b2 : knownById.get(key);
    },
    [localById, knownById]
  );
  const options = remote ? remoteOptions : localOptions;
  const loading = remote ? remoteLoading : false;
  const error = remote ? remoteError : null;
  const answered = remote ? answeredQuery === query : true;
  const empty = qualifies && answered && !loading && !error && options.length === 0;
  return { inputValue, setInputValue, reset, options, loading, error, empty, getOptionById };
}

// src/core/useLocalSearch.ts
function useLocalSearch(config) {
  const { items, ...rest } = config;
  return useSearch({ ...rest, source: { items } });
}

// src/core/useRemoteSearch.ts
function useRemoteSearch(config) {
  const { search, ...rest } = config;
  return useSearch({ ...rest, source: { search } });
}

// src/core/entity.ts
function andFilters(...filters) {
  const active = filters.filter(Boolean);
  if (active.length === 0) return void 0;
  if (active.length === 1) return active[0];
  return (item) => active.every((filter) => filter(item));
}
function isBlank(value) {
  return value === null || value === void 0 || String(value).trim() === "";
}

// src/study/study.ts
var COMPOUND_SUBITEM_CODE_REGEX = /^151\d{3,}/;
function isCompoundSubItemCode(code) {
  if (code === null || code === void 0 || code === "") return false;
  return COMPOUND_SUBITEM_CODE_REGEX.test(String(code));
}
function isCompoundSubItem(study) {
  return Boolean(study) && isCompoundSubItemCode(study == null ? void 0 : study.code);
}
function studyLabel(study) {
  const name = isBlank(study.name) ? "" : String(study.name);
  if (!isBlank(study.code)) return name ? `${study.code} - ${name}` : String(study.code);
  return name || entityId(study);
}
function studySearchText(study) {
  return [study.code, study.name, study.abbreviation];
}
function matchStudy(study, query) {
  return matchesAllTerms(buildHaystack(...studySearchText(study)), splitTerms(query));
}
function studyToOption(study) {
  return { id: entityId(study), label: studyLabel(study), raw: study, kind: "study" };
}
function findStudyByExactCode(studies, rawValue) {
  var _a;
  const normalizedValue = String(rawValue || "").trim();
  if (!normalizedValue || !studies) return void 0;
  const match = (_a = normalizedValue.match(/^(\d+)$/)) != null ? _a : normalizedValue.match(/^(\d+)\s*-\s*/);
  if (!match) return void 0;
  const code = Number(match[1]);
  return studies.find((study) => !isBlank(study.code) && Number(study.code) === code);
}
function profileLabel(profile) {
  var _a, _b;
  return `${(_a = profile.shortcutCode) != null ? _a : ""} - ${(_b = profile.name) != null ? _b : ""}`;
}
function matchProfile(profile, query) {
  return matchesAllTerms(buildHaystack(profile.shortcutCode, profile.name), splitTerms(query));
}
function profileToOption(profile) {
  return { id: entityId(profile), label: profileLabel(profile), raw: profile, kind: "profile" };
}
function findProfileByShortcut(profiles, rawValue) {
  if (!profiles || rawValue === null || rawValue === void 0 || rawValue === "") return void 0;
  return profiles.find(
    (profile) => !isBlank(profile.shortcutCode) && String(profile.shortcutCode) === rawValue || profileLabel(profile) === rawValue
  );
}
function resolveStudyInput(rawValue, studies, profiles) {
  if (!rawValue) return null;
  const profile = findProfileByShortcut(profiles, rawValue);
  if (profile) return { kind: "profile", profile };
  const study = findStudyByExactCode(studies, rawValue);
  return study ? { kind: "study", study } : null;
}

// src/study/useStudySearch.ts
var import_react2 = require("react");
function useStudySearch(config) {
  var _a, _b;
  const {
    includeSubItems = false,
    profiles,
    profileToOption: mapProfile,
    toOption,
    filter,
    deps = [],
    inputValue: controlledInput,
    onInputValueChange,
    initialInputValue,
    ...rest
  } = config;
  const [ownInput, setOwnInput] = (0, import_react2.useState)(initialInputValue != null ? initialInputValue : "");
  const controlled = controlledInput !== void 0;
  const inputValue = controlled ? controlledInput : ownInput;
  const handleInput = (0, import_react2.useCallback)(
    (value) => {
      if (!controlled) setOwnInput(value);
      onInputValueChange == null ? void 0 : onInputValueChange(value);
    },
    [controlled, onInputValueChange]
  );
  const ownFilter = includeSubItems ? void 0 : (study) => !isCompoundSubItem(study);
  const combinedFilter = andFilters(ownFilter, filter);
  const studies = useSearch({
    ...rest,
    toOption: toOption != null ? toOption : studyToOption,
    searchText: (_a = rest.searchText) != null ? _a : studySearchText,
    filter: combinedFilter,
    deps: [includeSubItems, ...deps],
    inputValue,
    onInputValueChange: handleInput
  });
  const profileSearch = useSearch({
    source: { items: profiles != null ? profiles : void 0 },
    toOption: mapProfile != null ? mapProfile : profileToOption,
    searchText: (profile) => [profile.shortcutCode, profile.name],
    excludeIds: rest.excludeIds,
    minChars: isRemoteSource(rest.source) ? (_b = rest.minChars) != null ? _b : 1 : rest.minChars,
    showAllWhenEmpty: isRemoteSource(rest.source) ? false : rest.showAllWhenEmpty,
    suspend: rest.suspend,
    inputValue,
    onInputValueChange: handleInput
  });
  const studyOptions = studies.options;
  const options = (0, import_react2.useMemo)(
    () => [...profileSearch.options, ...studyOptions],
    [profileSearch.options, studyOptions]
  );
  const items = isRemoteSource(rest.source) ? void 0 : rest.source.items;
  const visibleStudies = (0, import_react2.useMemo)(() => {
    if (!items) return studyOptions.map((option) => option.raw);
    return combinedFilter ? items.filter(combinedFilter) : items;
  }, [items, includeSubItems, studyOptions, ...deps]);
  const findByExactCode = (0, import_react2.useCallback)(
    (rawValue) => findStudyByExactCode(visibleStudies, rawValue),
    [visibleStudies]
  );
  const resolveExact = (0, import_react2.useCallback)(
    (rawValue) => resolveStudyInput(rawValue, visibleStudies, profiles),
    [visibleStudies, profiles]
  );
  const getOptionById = (0, import_react2.useCallback)(
    (id) => {
      var _a2;
      return (_a2 = studies.getOptionById(id)) != null ? _a2 : profileSearch.getOptionById(id);
    },
    [studies.getOptionById, profileSearch.getOptionById]
  );
  return {
    inputValue,
    setInputValue: studies.setInputValue,
    reset: studies.reset,
    options,
    loading: studies.loading,
    error: studies.error,
    empty: studies.empty && profileSearch.options.length === 0,
    getOptionById,
    findByExactCode,
    resolveExact
  };
}

// src/doctor/doctor.ts
function fullName(parts, separator) {
  return parts.filter((part) => !isBlank(part)).join(separator);
}
function doctorLabel(doctor) {
  if (!isBlank(doctor.doctor)) return String(doctor.doctor);
  const name = fullName([doctor.name, doctor.lastName], " ");
  if (!isBlank(doctor.professionalRegistration)) {
    return name ? `${doctor.professionalRegistration} - ${name}` : String(doctor.professionalRegistration);
  }
  return name || entityId(doctor);
}
function doctorLabelLastNameFirst(doctor) {
  const name = fullName([doctor.lastName, doctor.name], ", ") || "Sin nombre";
  return isBlank(doctor.professionalRegistration) ? name : `${name} \xB7 MP ${doctor.professionalRegistration}`;
}
function doctorSearchText(doctor) {
  return [doctor.lastName, doctor.name, doctor.professionalRegistration, doctor.doctor];
}
function matchDoctor(doctor, query) {
  return matchesAllTerms(buildHaystack(...doctorSearchText(doctor)), splitTerms(query));
}
function doctorToOption(doctor) {
  return { id: entityId(doctor), label: doctorLabel(doctor), raw: doctor };
}
var doctorRemoteQuery = longestTerm;

// src/doctor/useDoctorSearch.ts
function useDoctorSearch(options) {
  const { toOption, ...rest } = options;
  return useSearch({
    remoteQuery: doctorRemoteQuery,
    refineRemote: true,
    searchText: doctorSearchText,
    ...rest,
    toOption: toOption != null ? toOption : doctorToOption
  });
}

// src/diagnosis/diagnosis.ts
function diagnosisLabel(diagnosis) {
  const label = [diagnosis.code, diagnosis.name].filter((part) => !isBlank(part)).join(" - ");
  return label || entityId(diagnosis);
}
function normalizeDiagnosisCode(code) {
  return String(code || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}
function diagnosisSearchText(diagnosis) {
  return [diagnosis.code, diagnosis.name];
}
function matchDiagnosis(diagnosis, query) {
  return matchesAllTerms(buildHaystack(...diagnosisSearchText(diagnosis)), splitTerms(query));
}
function findDiagnosisByCode(diagnoses, code) {
  const key = normalizeDiagnosisCode(code);
  if (!key || !diagnoses) return void 0;
  return diagnoses.find((diagnosis) => normalizeDiagnosisCode(diagnosis.code) === key);
}
function diagnosisToOption(diagnosis) {
  return { id: entityId(diagnosis), label: diagnosisLabel(diagnosis), raw: diagnosis };
}

// src/diagnosis/useDiagnosisSearch.ts
var import_react3 = require("react");
function useDiagnosisSearch(options) {
  const { toOption, ...rest } = options;
  const result = useSearch({
    searchText: diagnosisSearchText,
    ...rest,
    toOption: toOption != null ? toOption : diagnosisToOption
  });
  const items = isRemoteSource(rest.source) ? void 0 : rest.source.items;
  const pool = (0, import_react3.useMemo)(
    () => items != null ? items : result.options.map((option) => option.raw),
    [items, result.options]
  );
  const findByCode = (0, import_react3.useCallback)((code) => findDiagnosisByCode(pool, code), [pool]);
  return { ...result, findByCode };
}

// src/insurance/insurance.ts
function insuranceLabel(insurance) {
  if (!isBlank(insurance.insurance)) return String(insurance.insurance);
  const short = !isBlank(insurance.abbreviation) ? insurance.abbreviation : insurance.name;
  if (!isBlank(insurance.code)) return isBlank(short) ? String(insurance.code) : `${insurance.code} - ${short}`;
  return isBlank(short) ? entityId(insurance) : String(short);
}
function insuranceSearchText(insurance) {
  return [insurance.code, insurance.abbreviation, insurance.name, insurance.insurance];
}
function matchInsurance(insurance, query) {
  return matchesAllTerms(buildHaystack(...insuranceSearchText(insurance)), splitTerms(query));
}
function isInsuranceSuspended(insurance, suspendedCodes) {
  if (!insurance || !suspendedCodes || suspendedCodes.length === 0) return false;
  if (isBlank(insurance.code)) return false;
  const code = Number(insurance.code);
  return Number.isFinite(code) && suspendedCodes.includes(code);
}
function insuranceToOption(insurance) {
  return { id: entityId(insurance), label: insuranceLabel(insurance), raw: insurance };
}

// src/insurance/useInsuranceSearch.ts
var import_react4 = require("react");
function useInsuranceSearch(options) {
  const { toOption, suspendedCodes, isSuspended, suspendedText = "Suspendida", deps = [], ...rest } = options;
  const suspendedKey = (suspendedCodes != null ? suspendedCodes : []).join(",");
  const result = useSearch({
    searchText: insuranceSearchText,
    ...rest,
    deps: [suspendedKey, ...deps],
    toOption: toOption != null ? toOption : insuranceToOption
  });
  const check = (0, import_react4.useCallback)(
    (item) => isSuspended ? isSuspended(item) : isInsuranceSuspended(item, suspendedCodes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSuspended, suspendedKey]
  );
  const mark = (0, import_react4.useCallback)(
    (option) => {
      var _a;
      const suspended = check(option.raw);
      return {
        ...option,
        suspended,
        secondary: suspended ? (_a = option.secondary) != null ? _a : suspendedText : option.secondary
      };
    },
    [check, suspendedText]
  );
  const cache = (0, import_react4.useMemo)(() => /* @__PURE__ */ new WeakMap(), [mark]);
  const markCached = (0, import_react4.useCallback)(
    (option) => {
      let marked2 = cache.get(option);
      if (!marked2) {
        marked2 = mark(option);
        cache.set(option, marked2);
      }
      return marked2;
    },
    [cache, mark]
  );
  const marked = (0, import_react4.useMemo)(() => result.options.map(markCached), [result.options, markCached]);
  const { getOptionById: baseGet } = result;
  const getOptionById = (0, import_react4.useCallback)(
    (id) => {
      const option = baseGet(id);
      return option ? markCached(option) : void 0;
    },
    [baseGet, markCached]
  );
  return { ...result, options: marked, getOptionById };
}

// src/patient/patient.ts
function patientDni(patient) {
  var _a;
  if (patient === null || patient === void 0) return "";
  if (typeof patient !== "object") return String(patient);
  const dni = (_a = patient.DNI) != null ? _a : patient.dni;
  return isBlank(dni) ? "" : String(dni);
}
function patientId(patient) {
  if (patient === null || patient === void 0) return "";
  if (typeof patient !== "object") return String(patient);
  return entityId(patient) || (isBlank(patient.patientId) ? "" : String(patient.patientId)) || patientDni(patient);
}
function patientFullName(patient) {
  if (patient === null || typeof patient !== "object") return "";
  return [patient.lastName, patient.name].filter((part) => !isBlank(part)).join(", ");
}
function patientLabel(patient) {
  return patientDni(patient) || patientFullName(patient) || patientId(patient);
}
function patientSearchText(patient) {
  if (patient === null || typeof patient !== "object") return [patient];
  return [patientDni(patient), patient.lastName, patient.name];
}
function matchPatient(patient, query) {
  return matchesAllTerms(buildHaystack(...patientSearchText(patient)), splitTerms(query));
}
function patientToOption(patient) {
  const secondary = patientFullName(patient);
  return {
    id: patientId(patient),
    label: patientLabel(patient),
    ...secondary ? { secondary } : {},
    raw: patient
  };
}

// src/patient/dniScan.ts
var toUpperCase = (str) => {
  if (!str) return "";
  return str.toUpperCase();
};
function daysInMonth(year, month) {
  const leap = year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
  return [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}
function parseDniDate(dateStr) {
  if (typeof dateStr !== "string") return null;
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{1,4})\s*$/.exec(dateStr);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  const date = /* @__PURE__ */ new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
function isDniScan(value) {
  return typeof value === "string" && value.startsWith("!");
}
function parseDniData(rawData) {
  if (!rawData) return null;
  let cleanData = rawData.trim();
  if (cleanData.startsWith("!")) {
    cleanData = cleanData.substring(1);
  }
  const parts = cleanData.split("@").map((p) => p.trim()).filter((p) => p !== "");
  const genderMap = { M: "MALE", F: "FEMALE" };
  if (/^\d{11}/.test(parts[0])) {
    if (parts.length < 5) return null;
    return {
      dni: parseInt(parts[4], 10),
      lastName: toUpperCase(parts[1]),
      name: toUpperCase(parts[2]),
      gender: genderMap[parts[3]] || "OTHER",
      dateOfBirth: parseDniDate(parts[6]),
      rawString: rawData
    };
  }
  if (/^\d{7,8}/.test(parts[0])) {
    return {
      dni: parseInt(parts[0], 10),
      lastName: toUpperCase(parts[3]),
      name: toUpperCase(parts[4]),
      dateOfBirth: parseDniDate(parts[6]),
      gender: genderMap[parts[7]] || "OTHER",
      rawString: rawData
    };
  }
  return null;
}
function parseDniScan(rawData) {
  if (!rawData) return null;
  const patient = parseDniData(rawData);
  if (patient) return { dni: patient.dni, patient };
  const cleanRaw = rawData.replace(/^!/, "").trim();
  const numericOnly = cleanRaw.replace(/\D/g, "");
  if (numericOnly.length >= 7 && numericOnly.length <= 8) {
    return { dni: parseInt(numericOnly, 10), patient: null };
  }
  return null;
}

// src/patient/usePatientSearch.ts
var import_react5 = require("react");
function usePatientSearch(options) {
  const { toOption, suspend, ...rest } = options;
  const result = useSearch({
    searchText: patientSearchText,
    ...rest,
    suspend: (input) => isDniScan(input) || Boolean(suspend == null ? void 0 : suspend(input)),
    toOption: toOption != null ? toOption : patientToOption
  });
  const isScan = isDniScan(result.inputValue);
  const scan = (0, import_react5.useMemo)(
    () => isScan ? parseDniScan(result.inputValue) : null,
    [isScan, result.inputValue]
  );
  return { ...result, isScan, scan };
}

// src/biochemist/biochemist.ts
function biochemistLabel(biochemist) {
  const name = [biochemist.name, biochemist.lastName].filter((part) => !isBlank(part)).join(" ");
  if (!isBlank(biochemist.professionalRegistration)) {
    return name ? `${biochemist.professionalRegistration} - ${name}` : String(biochemist.professionalRegistration);
  }
  return name || entityId(biochemist);
}
function biochemistSearchText(biochemist) {
  return [biochemist.professionalRegistration, biochemist.name, biochemist.lastName, biochemist.DNI];
}
function matchBiochemist(biochemist, query) {
  return matchesAllTerms(buildHaystack(...biochemistSearchText(biochemist)), splitTerms(query));
}
function biochemistToOption(biochemist) {
  return { id: entityId(biochemist), label: biochemistLabel(biochemist), raw: biochemist };
}

// src/biochemist/useBiochemistSearch.ts
function useBiochemistSearch(options) {
  const { toOption, ...rest } = options;
  return useSearch({
    searchText: biochemistSearchText,
    ...rest,
    toOption: toOption != null ? toOption : biochemistToOption
  });
}

// src/worksheet/worksheet.ts
function worksheetLabel(worksheet) {
  const name = isBlank(worksheet.name) ? "" : String(worksheet.name);
  if (!isBlank(worksheet.code)) return name ? `${worksheet.code} - ${name}` : String(worksheet.code);
  return name || entityId(worksheet);
}
function worksheetSearchText(worksheet) {
  return [worksheet.code, worksheet.name];
}
function matchWorksheet(worksheet, query) {
  return matchesAllTerms(buildHaystack(...worksheetSearchText(worksheet)), splitTerms(query));
}
function findWorksheetByCode(worksheets, code) {
  if (!worksheets || isBlank(code)) return void 0;
  const wanted = Number(code);
  if (!Number.isFinite(wanted)) return void 0;
  return worksheets.find((worksheet) => !isBlank(worksheet.code) && Number(worksheet.code) === wanted);
}
function worksheetToOption(worksheet) {
  return { id: entityId(worksheet), label: worksheetLabel(worksheet), raw: worksheet };
}

// src/worksheet/useWorksheetSearch.ts
var import_react6 = require("react");
function useWorksheetSearch(options) {
  const { toOption, ...rest } = options;
  const result = useSearch({
    searchText: worksheetSearchText,
    ...rest,
    toOption: toOption != null ? toOption : worksheetToOption
  });
  const items = isRemoteSource(rest.source) ? void 0 : rest.source.items;
  const pool = (0, import_react6.useMemo)(
    () => items != null ? items : result.options.map((option) => option.raw),
    [items, result.options]
  );
  const findByCode = (0, import_react6.useCallback)(
    (code) => findWorksheetByCode(pool, code),
    [pool]
  );
  return { ...result, findByCode };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  COMPOUND_SUBITEM_CODE_REGEX,
  biochemistLabel,
  biochemistSearchText,
  biochemistToOption,
  buildHaystack,
  diagnosisLabel,
  diagnosisSearchText,
  diagnosisToOption,
  doctorLabel,
  doctorLabelLastNameFirst,
  doctorRemoteQuery,
  doctorSearchText,
  doctorToOption,
  entityId,
  findDiagnosisByCode,
  findProfileByShortcut,
  findStudyByExactCode,
  findWorksheetByCode,
  insuranceLabel,
  insuranceSearchText,
  insuranceToOption,
  isCompoundSubItem,
  isCompoundSubItemCode,
  isDniScan,
  isInsuranceSuspended,
  isRemoteSource,
  longestTerm,
  matchBiochemist,
  matchDiagnosis,
  matchDoctor,
  matchInsurance,
  matchPatient,
  matchProfile,
  matchStudy,
  matchText,
  matchWorksheet,
  matchesAllTerms,
  normalizeDiagnosisCode,
  normalizeText,
  parseDniData,
  parseDniDate,
  parseDniScan,
  patientDni,
  patientFullName,
  patientId,
  patientLabel,
  patientSearchText,
  patientToOption,
  profileLabel,
  profileToOption,
  resolveStudyInput,
  splitTerms,
  studyLabel,
  studySearchText,
  studyToOption,
  useBiochemistSearch,
  useDiagnosisSearch,
  useDoctorSearch,
  useInsuranceSearch,
  useLocalSearch,
  usePatientSearch,
  useRemoteSearch,
  useSearch,
  useStudySearch,
  useWorksheetSearch,
  worksheetLabel,
  worksheetSearchText,
  worksheetToOption
});
