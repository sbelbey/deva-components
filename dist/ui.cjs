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

// src/ui/index.ts
var ui_exports = {};
__export(ui_exports, {
  Alert: () => Alert,
  AuthLayout: () => AuthLayout,
  BrandLockup: () => BrandLockup,
  Button: () => Button,
  Cell: () => Cell,
  ChevronDownIcon: () => ChevronDownIcon,
  ChevronRightIcon: () => ChevronRightIcon,
  CloseIcon: () => CloseIcon,
  ColorModeSwitch: () => ColorModeSwitch,
  DataTable: () => DataTable,
  EyeIcon: () => EyeIcon,
  FileDropzone: () => FileDropzone,
  FilterIcon: () => FilterIcon,
  FilterToolbar: () => FilterToolbar,
  ListPage: () => ListPage,
  LockIcon: () => LockIcon,
  LoginForm: () => LoginForm,
  PasswordField: () => PasswordField,
  PasswordInput: () => PasswordInput,
  SearchField: () => SearchField,
  SearchIcon: () => SearchIcon,
  SegmentedControl: () => SegmentedControl,
  Spinner: () => Spinner,
  StatusDot: () => StatusDot,
  TextField: () => TextField,
  Tip: () => Tip,
  UploadIcon: () => UploadIcon,
  UserIcon: () => UserIcon,
  WarnIcon: () => WarnIcon
});
module.exports = __toCommonJS(ui_exports);

// src/ui/primitives/cx.ts
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

// src/ui/primitives/Alert.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var tones = {
  error: "bg-deva-danger-bg text-deva-danger",
  warn: "bg-deva-warn-bg text-deva-warn",
  ok: "bg-deva-ok-bg text-deva-ok"
};
function Alert({ tone = "error", children, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: tone === "error" ? "alert" : "status", className: cx("rounded-deva px-4 py-3 text-sm", tones[tone], className), children });
}

// src/ui/primitives/Button.tsx
var import_react = require("react");

// src/ui/primitives/Spinner.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function Spinner({ label = "Cargando", className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { role: "img", "aria-label": label, viewBox: "0 0 24 24", fill: "none", className: cx("size-5 animate-spin", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeOpacity: "0.25", strokeWidth: "3" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M21 12a9 9 0 00-9-9", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round" })
  ] });
}

// src/ui/primitives/Button.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var variants = {
  solid: "bg-deva-action font-bold text-deva-on-action hover:brightness-110",
  quiet: "font-semibold text-deva-ink-soft hover:bg-deva-surface-2 hover:text-deva-ink"
};
var Button = (0, import_react.forwardRef)(function Button2({
  variant = "solid",
  loading = false,
  loadingLabel = "Cargando",
  fullWidth = false,
  disabled,
  className,
  type = "button",
  children,
  ...props
}, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "button",
    {
      ref,
      type,
      disabled: disabled || loading,
      "aria-busy": loading || void 0,
      className: cx(
        "inline-flex h-12 items-center justify-center rounded-deva px-5 text-base transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-deva-brand disabled:opacity-60",
        variants[variant],
        fullWidth && "w-full",
        className
      ),
      ...props,
      children: loading ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Spinner, { label: loadingLabel }) : children
    }
  );
});

// src/ui/primitives/ColorModeSwitch.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function Sun() {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("svg", { viewBox: "0 0 24 24", className: "size-3.5", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", { cx: "12", cy: "12", r: "4" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" })
  ] });
}
function Moon() {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("svg", { viewBox: "0 0 24 24", className: "size-3.5", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" }) });
}
function ColorModeSwitch({
  mode,
  onChange,
  label = "Modo oscuro",
  hideLabel = false,
  disabled = false,
  className
}) {
  const dark = mode === "dark";
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "button",
    {
      type: "button",
      role: "switch",
      "aria-checked": dark,
      disabled,
      title: hideLabel ? dark ? "Modo claro" : "Modo oscuro" : void 0,
      onClick: () => onChange(dark ? "light" : "dark"),
      className: cx(
        "inline-flex items-center gap-2 rounded-full text-sm font-medium text-deva-ink-soft transition-colors hover:text-deva-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deva-action disabled:opacity-50",
        className
      ),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "span",
          {
            className: cx(
              "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-deva-line transition-colors duration-200",
              dark ? "bg-deva-chip-bg" : "bg-deva-surface-2"
            ),
            children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              "span",
              {
                className: cx(
                  "absolute left-0.5 flex size-6 items-center justify-center rounded-full shadow-deva-sm transition-transform duration-200 ease-out motion-reduce:transition-none",
                  dark ? "translate-x-5 bg-deva-action text-deva-on-action" : "translate-x-0 bg-deva-surface text-deva-warn"
                ),
                children: dark ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Moon, {}) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Sun, {})
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: cx(hideLabel && "sr-only"), children: label })
      ]
    }
  );
}

// src/ui/primitives/icons.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
function Icon({ children, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    "svg",
    {
      viewBox: "0 0 24 24",
      className: "size-5",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
      ...props,
      children
    }
  );
}
function EyeIcon({ off, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(Icon, { ...props, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("circle", { cx: "12", cy: "12", r: "3" }),
    off && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M3 3l18 18" })
  ] });
}
function UserIcon(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(Icon, { ...props, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("circle", { cx: "12", cy: "8", r: "4" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" })
  ] });
}
function LockIcon(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(Icon, { ...props, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("rect", { x: "4", y: "11", width: "16", height: "10", rx: "2" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M8 11V7a4 4 0 018 0v4" })
  ] });
}
function SearchIcon(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(Icon, { ...props, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("circle", { cx: "11", cy: "11", r: "7" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M20 20l-3.5-3.5" })
  ] });
}
function CloseIcon(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { ...props, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M6 6l12 12M18 6L6 18" }) });
}
function ChevronRightIcon(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { ...props, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M9 6l6 6-6 6" }) });
}
function ChevronDownIcon(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { ...props, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M6 9l6 6 6-6" }) });
}
function FilterIcon(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(Icon, { ...props, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("circle", { cx: "16", cy: "6", r: "2" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("circle", { cx: "10", cy: "12", r: "2" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("circle", { cx: "18", cy: "18", r: "2" })
  ] });
}
function UploadIcon(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(Icon, { ...props, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M14 3v5h5M12 17v-6M9.5 13.5L12 11l2.5 2.5" })
  ] });
}
function WarnIcon(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(Icon, { ...props, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M12 3l10 18H2z" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M12 10v5M12 18h0" })
  ] });
}

// src/ui/primitives/FileDropzone.tsx
var import_react2 = require("react");
var import_jsx_runtime6 = require("react/jsx-runtime");
function FileDropzone({
  label,
  accept,
  extension,
  onFile,
  onReject,
  rejectMessage = "Ese tipo de archivo no se puede leer.",
  busy = false,
  title = "Arrastr\xE1 el archivo ac\xE1",
  hint = /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
    "o ",
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("b", { className: "font-semibold text-deva-ink", children: "elegilo desde tu computadora" })
  ] }),
  busyTitle = "Leyendo el archivo\u2026",
  className
}) {
  const inputRef = (0, import_react2.useRef)(null);
  const [dragging, setDragging] = (0, import_react2.useState)(false);
  const accepts = (file) => file.type === accept || (extension ? file.name.toLowerCase().endsWith(extension.toLowerCase()) : false);
  const take = (file) => {
    if (!file) return;
    if (!accepts(file)) {
      onReject == null ? void 0 : onReject(rejectMessage);
      return;
    }
    onFile(file);
  };
  const handleDrop = (event) => {
    var _a;
    event.preventDefault();
    setDragging(false);
    if (!busy) take((_a = event.dataTransfer.files) == null ? void 0 : _a[0]);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "input",
      {
        ref: inputRef,
        type: "file",
        hidden: true,
        "aria-label": label,
        accept,
        disabled: busy,
        onChange: (event) => {
          var _a;
          take((_a = event.target.files) == null ? void 0 : _a[0]);
          event.target.value = "";
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
      "button",
      {
        type: "button",
        disabled: busy,
        onClick: () => {
          var _a;
          return (_a = inputRef.current) == null ? void 0 : _a.click();
        },
        onDragOver: (event) => {
          event.preventDefault();
          if (!busy) setDragging(true);
        },
        onDragLeave: () => setDragging(false),
        onDrop: handleDrop,
        className: cx(
          "flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deva-action disabled:cursor-progress",
          dragging ? "border-deva-action bg-deva-surface-2" : "border-deva-line hover:border-deva-action hover:bg-deva-surface-2",
          className
        ),
        children: [
          busy ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Spinner, { label: busyTitle, className: "size-9 text-deva-action" }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "flex size-14 items-center justify-center rounded-full bg-deva-surface-2 text-deva-action", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(UploadIcon, { className: "size-7" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "text-base font-semibold text-deva-ink", children: busy ? busyTitle : title }),
          !busy && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "text-sm text-deva-ink-soft", children: hint })
        ]
      }
    )
  ] });
}

// src/ui/primitives/SearchField.tsx
var import_react3 = require("react");
var import_jsx_runtime7 = require("react/jsx-runtime");
var SearchField = (0, import_react3.forwardRef)(function SearchField2({ value, onChange, label, clearLabel = "Borrar b\xFAsqueda", wrapperClassName, className, ...props }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: cx("relative w-full max-w-[440px]", wrapperClassName), children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(SearchIcon, { className: "pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-deva-ink-soft" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "input",
      {
        ref,
        type: "text",
        role: "searchbox",
        "aria-label": label,
        value,
        onChange: (event) => onChange(event.target.value),
        className: cx(
          "h-11 w-full rounded-[10px] border border-deva-line bg-deva-surface pr-10 pl-10 text-sm text-deva-ink transition-[border-color,box-shadow] duration-150 placeholder:text-deva-ink-soft hover:border-deva-ink-soft/60 focus:border-deva-action focus:shadow-[inset_0_0_0_1px_var(--deva-action)] focus:outline-none",
          className
        ),
        ...props
      }
    ),
    value && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "button",
      {
        type: "button",
        "aria-label": clearLabel,
        onClick: () => onChange(""),
        className: "absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-deva-ink-soft hover:bg-deva-surface-2 hover:text-deva-ink",
        children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CloseIcon, { className: "size-4" })
      }
    )
  ] });
});

// src/ui/primitives/SegmentedControl.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
function SegmentedControl({
  label,
  value,
  options,
  onChange,
  className
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    "div",
    {
      role: "group",
      "aria-label": label,
      className: cx("inline-flex flex-wrap gap-1 rounded-[10px] bg-deva-surface-2 p-1", className),
      children: options.map((option) => {
        const selected = option.value === value;
        return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "button",
          {
            type: "button",
            "aria-pressed": selected,
            onClick: () => onChange(option.value),
            className: cx(
              "rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-deva-action",
              selected ? "bg-deva-surface font-semibold text-deva-ink shadow-deva-sm" : "font-medium text-deva-ink-soft hover:text-deva-ink"
            ),
            children: option.label
          },
          option.value
        );
      })
    }
  );
}

// src/ui/primitives/StatusDot.tsx
var import_jsx_runtime9 = require("react/jsx-runtime");
var dots = {
  ok: "bg-deva-ok",
  warn: "bg-deva-warn",
  danger: "bg-deva-danger",
  muted: "bg-deva-ink-soft/50"
};
function StatusDot({ tone = "muted", children, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: cx("inline-flex items-center gap-2 text-sm font-medium text-deva-ink", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { "aria-hidden": true, className: cx("size-2 shrink-0 rounded-full", dots[tone]) }),
    children
  ] });
}

// src/ui/primitives/PasswordInput.tsx
var import_react4 = require("react");
var import_jsx_runtime10 = require("react/jsx-runtime");
var PasswordInput = (0, import_react4.forwardRef)(function PasswordInput2({ className, wrapperClassName, showLabel = "Mostrar contrase\xF1a", hideLabel = "Ocultar contrase\xF1a", disabled, ...props }, ref) {
  const [visible, setVisible] = (0, import_react4.useState)(false);
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: cx("relative", wrapperClassName), children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      "input",
      {
        ref,
        type: visible ? "text" : "password",
        disabled,
        className: cx(
          "w-full rounded-deva border border-deva-line bg-deva-surface py-2 pr-10 pl-3 text-sm text-deva-ink outline-none placeholder:text-deva-ink-soft focus:border-deva-action disabled:opacity-50",
          className
        ),
        ...props
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      "button",
      {
        type: "button",
        disabled,
        tabIndex: -1,
        onClick: () => setVisible((value) => !value),
        "aria-label": visible ? hideLabel : showLabel,
        "aria-pressed": visible,
        className: "absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-deva text-deva-ink-soft hover:text-deva-ink disabled:opacity-50",
        children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(EyeIcon, { off: visible, className: "size-4" })
      }
    )
  ] });
});

// src/ui/primitives/TextField.tsx
var import_react5 = require("react");
var import_jsx_runtime11 = require("react/jsx-runtime");
var helperColors = { default: "text-deva-ink-soft", warn: "text-deva-warn", error: "text-deva-danger" };
var TextField = (0, import_react5.forwardRef)(function TextField2({ label, startIcon, endAdornment, helper, helperTone = "default", wrapperClassName, className, id, ...props }, ref) {
  const autoId = (0, import_react5.useId)();
  const inputId = id != null ? id : autoId;
  const helperId = `${inputId}-helper`;
  const invalid = helperTone === "error";
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: wrapperClassName, children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "relative", children: [
      startIcon && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-deva-ink-soft", children: startIcon }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        "input",
        {
          ref,
          id: inputId,
          placeholder: " ",
          "aria-invalid": invalid || void 0,
          "aria-describedby": helper ? helperId : void 0,
          className: cx(
            "peer h-14 w-full rounded-deva border bg-deva-surface text-base text-deva-ink transition-[border-color,box-shadow] duration-150 focus:outline-none disabled:opacity-60",
            startIcon ? "pl-11" : "pl-3.5",
            endAdornment ? "pr-12" : "pr-3.5",
            invalid ? "border-deva-danger focus:shadow-[inset_0_0_0_1px_var(--deva-danger)]" : "border-deva-ink-soft/50 hover:border-deva-ink-soft focus:border-deva-action focus:shadow-[inset_0_0_0_1px_var(--deva-action)]",
            className
          ),
          ...props
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        "label",
        {
          htmlFor: inputId,
          className: cx(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 bg-deva-surface px-1 text-base text-deva-ink-soft transition-all duration-150",
            startIcon ? "left-11" : "left-3.5",
            "peer-focus:top-0 peer-focus:left-3 peer-focus:text-xs peer-focus:text-deva-action",
            "peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-xs"
          ),
          children: label
        }
      ),
      endAdornment && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "absolute top-1/2 right-2 -translate-y-1/2", children: endAdornment })
    ] }),
    helper && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { id: helperId, className: cx("mt-1 ml-3.5 text-xs", helperColors[helperTone]), children: helper })
  ] });
});

// src/ui/primitives/Tip.tsx
var import_react6 = require("react");
var import_jsx_runtime12 = require("react/jsx-runtime");
function Tip({ content, children, className }) {
  const id = (0, import_react6.useId)();
  const [pinned, setPinned] = (0, import_react6.useState)(false);
  if (!content) return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_jsx_runtime12.Fragment, { children });
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: cx("group relative inline-flex", className), onMouseLeave: () => setPinned(false), children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      "button",
      {
        type: "button",
        "aria-describedby": id,
        "aria-expanded": pinned,
        onClick: () => setPinned((value) => !value),
        onBlur: () => setPinned(false),
        onKeyDown: (event) => event.key === "Escape" && setPinned(false),
        className: "cursor-help rounded-sm text-left underline decoration-deva-ink-soft decoration-dotted underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deva-action",
        children
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      "span",
      {
        id,
        role: "tooltip",
        className: cx(
          "pointer-events-none absolute bottom-full left-0 z-20 mb-1.5 w-max max-w-64 rounded-deva border border-deva-line bg-deva-surface px-3 py-2 text-xs leading-relaxed font-normal whitespace-pre-line text-deva-ink shadow-deva-sm group-focus-within:block group-hover:block",
          pinned ? "block" : "hidden"
        ),
        children: content
      }
    )
  ] });
}

// src/ui/components/AuthLayout.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
var BRAND_GRADIENT = [
  "radial-gradient(circle at 100% 0%, rgba(37,177,207,0.95) 0%, rgba(37,177,207,0) 45%)",
  "radial-gradient(circle at 0% 0%, rgba(91,174,238,0.9) 0%, rgba(91,174,238,0) 50%)",
  "linear-gradient(60deg, #71fefe 0%, #56c8ee 35%, #4492de 68%, #3c80d7 100%)"
].join(", ");
function AuthLayout({
  brand,
  mobileBrand,
  tagline,
  panelFooter,
  topRight,
  title,
  subtitle,
  wide = false,
  children
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "flex min-h-screen bg-deva-bg font-deva", children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
      "aside",
      {
        className: "relative hidden min-w-0 flex-1 items-center justify-center overflow-hidden md:flex",
        style: { backgroundImage: BRAND_GRADIENT },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { "aria-hidden": true, className: "absolute inset-0 hidden bg-[rgba(10,20,40,0.35)] [[data-theme=dark]_&]:block" }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "relative flex flex-col items-center gap-5 px-10 text-center", children: [
            brand,
            tagline && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("p", { className: "max-w-xs text-sm font-medium text-white/90", children: tagline })
          ] }),
          panelFooter && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "absolute inset-x-0 bottom-8 text-center text-xs font-medium text-white/85", children: panelFooter })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("main", { className: "relative flex w-full shrink-0 items-center justify-center overflow-y-auto px-6 py-16 sm:px-10 md:w-[45%]", children: [
      topRight && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "absolute top-5 right-6", children: topRight }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: cx("w-full", wide ? "max-w-[640px]" : "max-w-[400px]"), children: [
        mobileBrand && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "mb-8 text-deva-ink-soft md:hidden", children: mobileBrand }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("h1", { className: "text-[2rem] font-bold tracking-[-0.02em] text-deva-ink", children: title }),
        subtitle && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("p", { className: "mt-1 text-sm text-deva-ink-soft", children: subtitle }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "mt-8", children })
      ] })
    ] })
  ] });
}

// src/ui/components/BrandLockup.tsx
var import_jsx_runtime14 = require("react/jsx-runtime");
function BrandLockup({
  product,
  tone,
  logos,
  stacked = false,
  className,
  logoClassName = "h-7",
  textClassName = "text-lg"
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
    "span",
    {
      className: cx("inline-flex shrink-0", stacked ? "flex-col items-end gap-3" : "items-center gap-3", className),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("img", { src: tone === "white" ? logos.white : logos.blue, alt: "DEVA", className: logoClassName }),
        product && !stacked && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { "aria-hidden": true, className: "h-6 w-px bg-current opacity-55" }),
        product && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: cx("leading-none font-semibold tracking-[-0.01em]", textClassName), children: product })
      ]
    }
  );
}

// src/ui/components/DataTable.tsx
var import_jsx_runtime15 = require("react/jsx-runtime");
function Cell({ primary, secondary }) {
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(import_jsx_runtime15.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "text-sm font-semibold text-deva-ink", children: primary }),
    secondary && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "text-xs text-deva-ink-soft", children: secondary })
  ] });
}
function DataTable({
  columns,
  rows,
  rowKey,
  onRowClick,
  empty,
  loading = false,
  footer,
  label
}) {
  const span = columns.length + (onRowClick ? 1 : 0);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "relative overflow-hidden rounded-xl border border-deva-line bg-deva-surface", children: [
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "absolute inset-x-0 top-0 h-0.5 overflow-hidden", children: loading && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "h-full w-1/3 animate-pulse bg-deva-action" }) }),
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "overflow-x-auto", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("table", { "aria-label": label, className: "w-full min-w-[760px] border-collapse text-left", children: [
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("tr", { className: "border-b border-deva-line", children: [
        columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
          "th",
          {
            scope: "col",
            className: cx("px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-deva-ink-soft", column.className),
            children: column.header
          },
          column.key
        )),
        onRowClick && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("th", { "aria-hidden": true, className: "w-12" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("tbody", { children: [
        rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
          "tr",
          {
            tabIndex: onRowClick ? 0 : void 0,
            onClick: onRowClick ? () => onRowClick(row) : void 0,
            onKeyDown: onRowClick ? (event) => {
              if (event.key === "Enter") onRowClick(row);
            } : void 0,
            className: cx(
              "border-b border-deva-line last:border-b-0",
              onRowClick && "cursor-pointer hover:bg-deva-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-deva-action"
            ),
            children: [
              columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("td", { className: cx("px-4 py-3 align-top", column.className), children: column.cell(row) }, column.key)),
              onRowClick && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("td", { className: "pr-3 text-deva-ink-soft/60", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(ChevronRightIcon, { className: "size-4" }) })
            ]
          },
          rowKey(row)
        )),
        rows.length === 0 && !loading && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("td", { colSpan: span, className: "px-4 py-12 text-center", children: empty != null ? empty : /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "text-base font-semibold text-deva-ink", children: "No hay resultados" }) }) })
      ] })
    ] }) }),
    footer && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "border-t border-deva-line px-4 py-2.5 text-sm text-deva-ink-soft", children: footer })
  ] });
}

// src/ui/components/FilterToolbar.tsx
var import_react7 = require("react");
var import_jsx_runtime16 = require("react/jsx-runtime");
function FilterToolbar({
  search,
  primaryFilter,
  moreFilters,
  activeMoreFilters = 0,
  onClearMoreFilters,
  filtersLabel = "Filtros",
  clearLabel = "Limpiar filtros"
}) {
  const [open, setOpen] = (0, import_react7.useState)(false);
  const panelId = (0, import_react7.useId)();
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "mb-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex flex-wrap items-center gap-3", children: [
      search,
      primaryFilter,
      moreFilters && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
        "button",
        {
          type: "button",
          "aria-expanded": open,
          "aria-controls": panelId,
          "aria-label": activeMoreFilters > 0 ? `${filtersLabel} (${activeMoreFilters} en uso)` : filtersLabel,
          onClick: () => setOpen((current) => !current),
          className: "ml-auto inline-flex h-10 items-center gap-2 rounded-deva px-3 text-sm font-medium text-deva-ink-soft hover:bg-deva-surface-2 hover:text-deva-ink",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "relative", children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(FilterIcon, { className: "size-5" }),
              activeMoreFilters > 0 && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                "span",
                {
                  "aria-hidden": true,
                  className: "absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-deva-action text-[10px] font-bold text-deva-on-action",
                  children: activeMoreFilters
                }
              )
            ] }),
            filtersLabel,
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(ChevronDownIcon, { className: cx("size-4 transition-transform duration-150", open && "rotate-180") })
          ]
        }
      )
    ] }),
    moreFilters && open && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
      "div",
      {
        id: panelId,
        className: "mt-3 flex flex-wrap items-center gap-3 rounded-[10px] border border-deva-line bg-deva-surface p-4",
        children: [
          moreFilters,
          activeMoreFilters > 0 && onClearMoreFilters && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
            "button",
            {
              type: "button",
              onClick: onClearMoreFilters,
              className: "h-9 rounded-deva px-3 text-sm font-medium text-deva-ink-soft hover:bg-deva-surface-2 hover:text-deva-ink",
              children: clearLabel
            }
          )
        ]
      }
    )
  ] });
}

// src/ui/components/ListPage.tsx
var import_jsx_runtime17 = require("react/jsx-runtime");
function ListPage({ title, subtitle, actions, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "min-h-full bg-deva-bg px-4 py-4 font-deva text-deva-ink md:px-8 md:py-8", children: [
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("header", { className: "mb-6 flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h1", { className: "text-[1.75rem] leading-tight font-bold tracking-[-0.02em]", children: title }),
        subtitle && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("p", { className: "mt-1 text-sm text-deva-ink-soft", children: subtitle })
      ] }),
      actions
    ] }),
    children
  ] });
}

// src/ui/components/LoginForm.tsx
var import_react9 = require("react");

// src/ui/components/PasswordField.tsx
var import_react8 = require("react");
var import_jsx_runtime18 = require("react/jsx-runtime");
var PasswordField = (0, import_react8.forwardRef)(function PasswordField2({
  showLabel = "Mostrar contrase\xF1a",
  hideLabel = "Ocultar contrase\xF1a",
  capsLockMessage = "Bloq May\xFAs est\xE1 activado",
  helper,
  helperTone,
  startIcon = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(LockIcon, {}),
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}, ref) {
  const [visible, setVisible] = (0, import_react8.useState)(false);
  const [capsLock, setCapsLock] = (0, import_react8.useState)(false);
  const detect = (event) => setCapsLock(event.getModifierState("CapsLock"));
  const showCaps = capsLock && !(helper && helperTone === "error");
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
    TextField,
    {
      ref,
      type: visible ? "text" : "password",
      startIcon,
      helper: showCaps ? capsLockMessage : helper,
      helperTone: showCaps ? "warn" : helperTone,
      onKeyDown: (event) => {
        detect(event);
        onKeyDown == null ? void 0 : onKeyDown(event);
      },
      onKeyUp: (event) => {
        detect(event);
        onKeyUp == null ? void 0 : onKeyUp(event);
      },
      onBlur: (event) => {
        setCapsLock(false);
        onBlur == null ? void 0 : onBlur(event);
      },
      endAdornment: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
        "button",
        {
          type: "button",
          tabIndex: -1,
          disabled: props.disabled,
          onClick: () => setVisible((value) => !value),
          "aria-label": visible ? hideLabel : showLabel,
          "aria-pressed": visible,
          className: "flex size-9 items-center justify-center rounded-full text-deva-ink-soft hover:bg-deva-surface-2 disabled:opacity-50",
          children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(EyeIcon, { off: visible })
        }
      ),
      ...props
    }
  );
});

// src/ui/components/LoginForm.tsx
var import_jsx_runtime19 = require("react/jsx-runtime");
function LoginForm({
  onSubmit,
  error,
  loading,
  usernameLabel = "Usuario",
  passwordLabel = "Contrase\xF1a",
  submitLabel = "Iniciar sesi\xF3n",
  loadingLabel = "Ingresando",
  requiredMessage = "Complet\xE1 usuario y contrase\xF1a.",
  forgotPassword,
  passwordHint,
  footer
}) {
  const [username, setUsername] = (0, import_react9.useState)("");
  const [password, setPassword] = (0, import_react9.useState)("");
  const [submitting, setSubmitting] = (0, import_react9.useState)(false);
  const [localError, setLocalError] = (0, import_react9.useState)(null);
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setLocalError(requiredMessage);
      return;
    }
    setLocalError(null);
    setSubmitting(true);
    try {
      await onSubmit({ username: username.trim(), password });
    } finally {
      setSubmitting(false);
    }
  };
  const shownError = localError != null ? localError : error;
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("form", { onSubmit: handleSubmit, noValidate: true, className: "flex flex-col gap-5", children: [
    /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
      TextField,
      {
        label: usernameLabel,
        startIcon: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(UserIcon, {}),
        value: username,
        onChange: (event) => setUsername(event.target.value),
        autoComplete: "username",
        autoCapitalize: "none",
        spellCheck: false,
        autoFocus: true
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        PasswordField,
        {
          label: passwordLabel,
          value: password,
          onChange: (event) => setPassword(event.target.value),
          autoComplete: "current-password"
        }
      ),
      forgotPassword && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "text-right text-xs", children: forgotPassword }),
      passwordHint && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("p", { className: "ml-3.5 text-xs text-deva-ink-soft", children: passwordHint })
    ] }),
    shownError && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Alert, { children: shownError }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Button, { type: "submit", fullWidth: true, loading: loading != null ? loading : submitting, loadingLabel, children: submitLabel }),
    footer
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Alert,
  AuthLayout,
  BrandLockup,
  Button,
  Cell,
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
  ColorModeSwitch,
  DataTable,
  EyeIcon,
  FileDropzone,
  FilterIcon,
  FilterToolbar,
  ListPage,
  LockIcon,
  LoginForm,
  PasswordField,
  PasswordInput,
  SearchField,
  SearchIcon,
  SegmentedControl,
  Spinner,
  StatusDot,
  TextField,
  Tip,
  UploadIcon,
  UserIcon,
  WarnIcon
});
