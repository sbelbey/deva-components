// src/ui/primitives/cx.ts
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

// src/ui/primitives/Alert.tsx
import { jsx } from "react/jsx-runtime";
var tones = {
  error: "bg-deva-danger-bg text-deva-danger",
  warn: "bg-deva-warn-bg text-deva-warn",
  ok: "bg-deva-ok-bg text-deva-ok"
};
function Alert({ tone = "error", children, className }) {
  return /* @__PURE__ */ jsx("p", { role: tone === "error" ? "alert" : "status", className: cx("rounded-deva px-4 py-3 text-sm", tones[tone], className), children });
}

// src/ui/primitives/Button.tsx
import { forwardRef } from "react";

// src/ui/primitives/Spinner.tsx
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function Spinner({ label = "Cargando", className }) {
  return /* @__PURE__ */ jsxs("svg", { role: "img", "aria-label": label, viewBox: "0 0 24 24", fill: "none", className: cx("size-5 animate-spin", className), children: [
    /* @__PURE__ */ jsx2("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeOpacity: "0.25", strokeWidth: "3" }),
    /* @__PURE__ */ jsx2("path", { d: "M21 12a9 9 0 00-9-9", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round" })
  ] });
}

// src/ui/primitives/Button.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
var variants = {
  solid: "bg-deva-action font-bold text-deva-on-action hover:brightness-110",
  quiet: "font-semibold text-deva-ink-soft hover:bg-deva-surface-2 hover:text-deva-ink"
};
var Button = forwardRef(function Button2({
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
  return /* @__PURE__ */ jsx3(
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
      children: loading ? /* @__PURE__ */ jsx3(Spinner, { label: loadingLabel }) : children
    }
  );
});

// src/ui/primitives/ColorModeSwitch.tsx
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
function Sun() {
  return /* @__PURE__ */ jsxs2("svg", { viewBox: "0 0 24 24", className: "size-3.5", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ jsx4("circle", { cx: "12", cy: "12", r: "4" }),
    /* @__PURE__ */ jsx4("path", { d: "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" })
  ] });
}
function Moon() {
  return /* @__PURE__ */ jsx4("svg", { viewBox: "0 0 24 24", className: "size-3.5", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: /* @__PURE__ */ jsx4("path", { d: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" }) });
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
  return /* @__PURE__ */ jsxs2(
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
        /* @__PURE__ */ jsx4(
          "span",
          {
            className: cx(
              "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-deva-line transition-colors duration-200",
              dark ? "bg-deva-chip-bg" : "bg-deva-surface-2"
            ),
            children: /* @__PURE__ */ jsx4(
              "span",
              {
                className: cx(
                  "absolute left-0.5 flex size-6 items-center justify-center rounded-full shadow-deva-sm transition-transform duration-200 ease-out motion-reduce:transition-none",
                  dark ? "translate-x-5 bg-deva-action text-deva-on-action" : "translate-x-0 bg-deva-surface text-deva-warn"
                ),
                children: dark ? /* @__PURE__ */ jsx4(Moon, {}) : /* @__PURE__ */ jsx4(Sun, {})
              }
            )
          }
        ),
        /* @__PURE__ */ jsx4("span", { className: cx(hideLabel && "sr-only"), children: label })
      ]
    }
  );
}

// src/ui/primitives/icons.tsx
import { jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
function Icon({ children, ...props }) {
  return /* @__PURE__ */ jsx5(
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
  return /* @__PURE__ */ jsxs3(Icon, { ...props, children: [
    /* @__PURE__ */ jsx5("path", { d: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" }),
    /* @__PURE__ */ jsx5("circle", { cx: "12", cy: "12", r: "3" }),
    off && /* @__PURE__ */ jsx5("path", { d: "M3 3l18 18" })
  ] });
}
function UserIcon(props) {
  return /* @__PURE__ */ jsxs3(Icon, { ...props, children: [
    /* @__PURE__ */ jsx5("circle", { cx: "12", cy: "8", r: "4" }),
    /* @__PURE__ */ jsx5("path", { d: "M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" })
  ] });
}
function LockIcon(props) {
  return /* @__PURE__ */ jsxs3(Icon, { ...props, children: [
    /* @__PURE__ */ jsx5("rect", { x: "4", y: "11", width: "16", height: "10", rx: "2" }),
    /* @__PURE__ */ jsx5("path", { d: "M8 11V7a4 4 0 018 0v4" })
  ] });
}
function SearchIcon(props) {
  return /* @__PURE__ */ jsxs3(Icon, { ...props, children: [
    /* @__PURE__ */ jsx5("circle", { cx: "11", cy: "11", r: "7" }),
    /* @__PURE__ */ jsx5("path", { d: "M20 20l-3.5-3.5" })
  ] });
}
function CloseIcon(props) {
  return /* @__PURE__ */ jsx5(Icon, { ...props, children: /* @__PURE__ */ jsx5("path", { d: "M6 6l12 12M18 6L6 18" }) });
}
function ChevronRightIcon(props) {
  return /* @__PURE__ */ jsx5(Icon, { ...props, children: /* @__PURE__ */ jsx5("path", { d: "M9 6l6 6-6 6" }) });
}
function ChevronDownIcon(props) {
  return /* @__PURE__ */ jsx5(Icon, { ...props, children: /* @__PURE__ */ jsx5("path", { d: "M6 9l6 6 6-6" }) });
}
function FilterIcon(props) {
  return /* @__PURE__ */ jsxs3(Icon, { ...props, children: [
    /* @__PURE__ */ jsx5("path", { d: "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" }),
    /* @__PURE__ */ jsx5("circle", { cx: "16", cy: "6", r: "2" }),
    /* @__PURE__ */ jsx5("circle", { cx: "10", cy: "12", r: "2" }),
    /* @__PURE__ */ jsx5("circle", { cx: "18", cy: "18", r: "2" })
  ] });
}
function UploadIcon(props) {
  return /* @__PURE__ */ jsxs3(Icon, { ...props, children: [
    /* @__PURE__ */ jsx5("path", { d: "M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" }),
    /* @__PURE__ */ jsx5("path", { d: "M14 3v5h5M12 17v-6M9.5 13.5L12 11l2.5 2.5" })
  ] });
}
function WarnIcon(props) {
  return /* @__PURE__ */ jsxs3(Icon, { ...props, children: [
    /* @__PURE__ */ jsx5("path", { d: "M12 3l10 18H2z" }),
    /* @__PURE__ */ jsx5("path", { d: "M12 10v5M12 18h0" })
  ] });
}

// src/ui/primitives/FileDropzone.tsx
import { useRef, useState } from "react";
import { Fragment, jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
function FileDropzone({
  label,
  accept,
  extension,
  onFile,
  onReject,
  rejectMessage = "Ese tipo de archivo no se puede leer.",
  busy = false,
  title = "Arrastr\xE1 el archivo ac\xE1",
  hint = /* @__PURE__ */ jsxs4(Fragment, { children: [
    "o ",
    /* @__PURE__ */ jsx6("b", { className: "font-semibold text-deva-ink", children: "elegilo desde tu computadora" })
  ] }),
  busyTitle = "Leyendo el archivo\u2026",
  className
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
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
  return /* @__PURE__ */ jsxs4(Fragment, { children: [
    /* @__PURE__ */ jsx6(
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
    /* @__PURE__ */ jsxs4(
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
          busy ? /* @__PURE__ */ jsx6(Spinner, { label: busyTitle, className: "size-9 text-deva-action" }) : /* @__PURE__ */ jsx6("span", { className: "flex size-14 items-center justify-center rounded-full bg-deva-surface-2 text-deva-action", children: /* @__PURE__ */ jsx6(UploadIcon, { className: "size-7" }) }),
          /* @__PURE__ */ jsx6("span", { className: "text-base font-semibold text-deva-ink", children: busy ? busyTitle : title }),
          !busy && /* @__PURE__ */ jsx6("span", { className: "text-sm text-deva-ink-soft", children: hint })
        ]
      }
    )
  ] });
}

// src/ui/primitives/SearchField.tsx
import { forwardRef as forwardRef2 } from "react";
import { jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
var SearchField = forwardRef2(function SearchField2({ value, onChange, label, clearLabel = "Borrar b\xFAsqueda", wrapperClassName, className, ...props }, ref) {
  return /* @__PURE__ */ jsxs5("div", { className: cx("relative w-full max-w-[440px]", wrapperClassName), children: [
    /* @__PURE__ */ jsx7(SearchIcon, { className: "pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-deva-ink-soft" }),
    /* @__PURE__ */ jsx7(
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
    value && /* @__PURE__ */ jsx7(
      "button",
      {
        type: "button",
        "aria-label": clearLabel,
        onClick: () => onChange(""),
        className: "absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-deva-ink-soft hover:bg-deva-surface-2 hover:text-deva-ink",
        children: /* @__PURE__ */ jsx7(CloseIcon, { className: "size-4" })
      }
    )
  ] });
});

// src/ui/primitives/SegmentedControl.tsx
import { jsx as jsx8 } from "react/jsx-runtime";
function SegmentedControl({
  label,
  value,
  options,
  onChange,
  className
}) {
  return /* @__PURE__ */ jsx8(
    "div",
    {
      role: "group",
      "aria-label": label,
      className: cx("inline-flex flex-wrap gap-1 rounded-[10px] bg-deva-surface-2 p-1", className),
      children: options.map((option) => {
        const selected = option.value === value;
        return /* @__PURE__ */ jsx8(
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
import { jsx as jsx9, jsxs as jsxs6 } from "react/jsx-runtime";
var dots = {
  ok: "bg-deva-ok",
  warn: "bg-deva-warn",
  danger: "bg-deva-danger",
  muted: "bg-deva-ink-soft/50"
};
function StatusDot({ tone = "muted", children, className }) {
  return /* @__PURE__ */ jsxs6("span", { className: cx("inline-flex items-center gap-2 text-sm font-medium text-deva-ink", className), children: [
    /* @__PURE__ */ jsx9("span", { "aria-hidden": true, className: cx("size-2 shrink-0 rounded-full", dots[tone]) }),
    children
  ] });
}

// src/ui/primitives/PasswordInput.tsx
import { forwardRef as forwardRef3, useState as useState2 } from "react";
import { jsx as jsx10, jsxs as jsxs7 } from "react/jsx-runtime";
var PasswordInput = forwardRef3(function PasswordInput2({ className, wrapperClassName, showLabel = "Mostrar contrase\xF1a", hideLabel = "Ocultar contrase\xF1a", disabled, ...props }, ref) {
  const [visible, setVisible] = useState2(false);
  return /* @__PURE__ */ jsxs7("div", { className: cx("relative", wrapperClassName), children: [
    /* @__PURE__ */ jsx10(
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
    /* @__PURE__ */ jsx10(
      "button",
      {
        type: "button",
        disabled,
        tabIndex: -1,
        onClick: () => setVisible((value) => !value),
        "aria-label": visible ? hideLabel : showLabel,
        "aria-pressed": visible,
        className: "absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-deva text-deva-ink-soft hover:text-deva-ink disabled:opacity-50",
        children: /* @__PURE__ */ jsx10(EyeIcon, { off: visible, className: "size-4" })
      }
    )
  ] });
});

// src/ui/primitives/TextField.tsx
import { forwardRef as forwardRef4, useId } from "react";
import { jsx as jsx11, jsxs as jsxs8 } from "react/jsx-runtime";
var helperColors = { default: "text-deva-ink-soft", warn: "text-deva-warn", error: "text-deva-danger" };
var TextField = forwardRef4(function TextField2({ label, startIcon, endAdornment, helper, helperTone = "default", wrapperClassName, className, id, ...props }, ref) {
  const autoId = useId();
  const inputId = id != null ? id : autoId;
  const helperId = `${inputId}-helper`;
  const invalid = helperTone === "error";
  return /* @__PURE__ */ jsxs8("div", { className: wrapperClassName, children: [
    /* @__PURE__ */ jsxs8("div", { className: "relative", children: [
      startIcon && /* @__PURE__ */ jsx11("span", { className: "pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-deva-ink-soft", children: startIcon }),
      /* @__PURE__ */ jsx11(
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
      /* @__PURE__ */ jsx11(
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
      endAdornment && /* @__PURE__ */ jsx11("span", { className: "absolute top-1/2 right-2 -translate-y-1/2", children: endAdornment })
    ] }),
    helper && /* @__PURE__ */ jsx11("p", { id: helperId, className: cx("mt-1 ml-3.5 text-xs", helperColors[helperTone]), children: helper })
  ] });
});

// src/ui/primitives/Tip.tsx
import { useId as useId2, useState as useState3 } from "react";
import { Fragment as Fragment2, jsx as jsx12, jsxs as jsxs9 } from "react/jsx-runtime";
function Tip({ content, children, className }) {
  const id = useId2();
  const [pinned, setPinned] = useState3(false);
  if (!content) return /* @__PURE__ */ jsx12(Fragment2, { children });
  return /* @__PURE__ */ jsxs9("span", { className: cx("group relative inline-flex", className), onMouseLeave: () => setPinned(false), children: [
    /* @__PURE__ */ jsx12(
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
    /* @__PURE__ */ jsx12(
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
import { jsx as jsx13, jsxs as jsxs10 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs10("div", { className: "flex min-h-screen bg-deva-bg font-deva", children: [
    /* @__PURE__ */ jsxs10(
      "aside",
      {
        className: "relative hidden min-w-0 flex-1 items-center justify-center overflow-hidden md:flex",
        style: { backgroundImage: BRAND_GRADIENT },
        children: [
          /* @__PURE__ */ jsx13("div", { "aria-hidden": true, className: "absolute inset-0 hidden bg-[rgba(10,20,40,0.35)] [[data-theme=dark]_&]:block" }),
          /* @__PURE__ */ jsxs10("div", { className: "relative flex flex-col items-center gap-5 px-10 text-center", children: [
            brand,
            tagline && /* @__PURE__ */ jsx13("p", { className: "max-w-xs text-sm font-medium text-white/90", children: tagline })
          ] }),
          panelFooter && /* @__PURE__ */ jsx13("span", { className: "absolute inset-x-0 bottom-8 text-center text-xs font-medium text-white/85", children: panelFooter })
        ]
      }
    ),
    /* @__PURE__ */ jsxs10("main", { className: "relative flex w-full shrink-0 items-center justify-center overflow-y-auto px-6 py-16 sm:px-10 md:w-[45%]", children: [
      topRight && /* @__PURE__ */ jsx13("div", { className: "absolute top-5 right-6", children: topRight }),
      /* @__PURE__ */ jsxs10("div", { className: cx("w-full", wide ? "max-w-[640px]" : "max-w-[400px]"), children: [
        mobileBrand && /* @__PURE__ */ jsx13("div", { className: "mb-8 text-deva-ink-soft md:hidden", children: mobileBrand }),
        /* @__PURE__ */ jsx13("h1", { className: "text-[2rem] font-bold tracking-[-0.02em] text-deva-ink", children: title }),
        subtitle && /* @__PURE__ */ jsx13("p", { className: "mt-1 text-sm text-deva-ink-soft", children: subtitle }),
        /* @__PURE__ */ jsx13("div", { className: "mt-8", children })
      ] })
    ] })
  ] });
}

// src/ui/components/BrandLockup.tsx
import { jsx as jsx14, jsxs as jsxs11 } from "react/jsx-runtime";
function BrandLockup({
  product,
  tone,
  logos,
  stacked = false,
  className,
  logoClassName = "h-7",
  textClassName = "text-lg"
}) {
  return /* @__PURE__ */ jsxs11(
    "span",
    {
      className: cx("inline-flex shrink-0", stacked ? "flex-col items-end gap-3" : "items-center gap-3", className),
      children: [
        /* @__PURE__ */ jsx14("img", { src: tone === "white" ? logos.white : logos.blue, alt: "DEVA", className: logoClassName }),
        product && !stacked && /* @__PURE__ */ jsx14("span", { "aria-hidden": true, className: "h-6 w-px bg-current opacity-55" }),
        product && /* @__PURE__ */ jsx14("span", { className: cx("leading-none font-semibold tracking-[-0.01em]", textClassName), children: product })
      ]
    }
  );
}

// src/ui/components/DataTable.tsx
import { Fragment as Fragment3, jsx as jsx15, jsxs as jsxs12 } from "react/jsx-runtime";
function Cell({ primary, secondary }) {
  return /* @__PURE__ */ jsxs12(Fragment3, { children: [
    /* @__PURE__ */ jsx15("div", { className: "text-sm font-semibold text-deva-ink", children: primary }),
    secondary && /* @__PURE__ */ jsx15("div", { className: "text-xs text-deva-ink-soft", children: secondary })
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
  return /* @__PURE__ */ jsxs12("div", { className: "relative overflow-hidden rounded-xl border border-deva-line bg-deva-surface", children: [
    /* @__PURE__ */ jsx15("div", { className: "absolute inset-x-0 top-0 h-0.5 overflow-hidden", children: loading && /* @__PURE__ */ jsx15("div", { className: "h-full w-1/3 animate-pulse bg-deva-action" }) }),
    /* @__PURE__ */ jsx15("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs12("table", { "aria-label": label, className: "w-full min-w-[760px] border-collapse text-left", children: [
      /* @__PURE__ */ jsx15("thead", { children: /* @__PURE__ */ jsxs12("tr", { className: "border-b border-deva-line", children: [
        columns.map((column) => /* @__PURE__ */ jsx15(
          "th",
          {
            scope: "col",
            className: cx("px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-deva-ink-soft", column.className),
            children: column.header
          },
          column.key
        )),
        onRowClick && /* @__PURE__ */ jsx15("th", { "aria-hidden": true, className: "w-12" })
      ] }) }),
      /* @__PURE__ */ jsxs12("tbody", { children: [
        rows.map((row) => /* @__PURE__ */ jsxs12(
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
              columns.map((column) => /* @__PURE__ */ jsx15("td", { className: cx("px-4 py-3 align-top", column.className), children: column.cell(row) }, column.key)),
              onRowClick && /* @__PURE__ */ jsx15("td", { className: "pr-3 text-deva-ink-soft/60", children: /* @__PURE__ */ jsx15(ChevronRightIcon, { className: "size-4" }) })
            ]
          },
          rowKey(row)
        )),
        rows.length === 0 && !loading && /* @__PURE__ */ jsx15("tr", { children: /* @__PURE__ */ jsx15("td", { colSpan: span, className: "px-4 py-12 text-center", children: empty != null ? empty : /* @__PURE__ */ jsx15("p", { className: "text-base font-semibold text-deva-ink", children: "No hay resultados" }) }) })
      ] })
    ] }) }),
    footer && /* @__PURE__ */ jsx15("div", { className: "border-t border-deva-line px-4 py-2.5 text-sm text-deva-ink-soft", children: footer })
  ] });
}

// src/ui/components/FilterToolbar.tsx
import { useId as useId3, useState as useState4 } from "react";
import { jsx as jsx16, jsxs as jsxs13 } from "react/jsx-runtime";
function FilterToolbar({
  search,
  primaryFilter,
  moreFilters,
  activeMoreFilters = 0,
  onClearMoreFilters,
  filtersLabel = "Filtros",
  clearLabel = "Limpiar filtros"
}) {
  const [open, setOpen] = useState4(false);
  const panelId = useId3();
  return /* @__PURE__ */ jsxs13("div", { className: "mb-4", children: [
    /* @__PURE__ */ jsxs13("div", { className: "flex flex-wrap items-center gap-3", children: [
      search,
      primaryFilter,
      moreFilters && /* @__PURE__ */ jsxs13(
        "button",
        {
          type: "button",
          "aria-expanded": open,
          "aria-controls": panelId,
          "aria-label": activeMoreFilters > 0 ? `${filtersLabel} (${activeMoreFilters} en uso)` : filtersLabel,
          onClick: () => setOpen((current) => !current),
          className: "ml-auto inline-flex h-10 items-center gap-2 rounded-deva px-3 text-sm font-medium text-deva-ink-soft hover:bg-deva-surface-2 hover:text-deva-ink",
          children: [
            /* @__PURE__ */ jsxs13("span", { className: "relative", children: [
              /* @__PURE__ */ jsx16(FilterIcon, { className: "size-5" }),
              activeMoreFilters > 0 && /* @__PURE__ */ jsx16(
                "span",
                {
                  "aria-hidden": true,
                  className: "absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-deva-action text-[10px] font-bold text-deva-on-action",
                  children: activeMoreFilters
                }
              )
            ] }),
            filtersLabel,
            /* @__PURE__ */ jsx16(ChevronDownIcon, { className: cx("size-4 transition-transform duration-150", open && "rotate-180") })
          ]
        }
      )
    ] }),
    moreFilters && open && /* @__PURE__ */ jsxs13(
      "div",
      {
        id: panelId,
        className: "mt-3 flex flex-wrap items-center gap-3 rounded-[10px] border border-deva-line bg-deva-surface p-4",
        children: [
          moreFilters,
          activeMoreFilters > 0 && onClearMoreFilters && /* @__PURE__ */ jsx16(
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
import { jsx as jsx17, jsxs as jsxs14 } from "react/jsx-runtime";
function ListPage({ title, subtitle, actions, children }) {
  return /* @__PURE__ */ jsxs14("div", { className: "min-h-full bg-deva-bg px-4 py-4 font-deva text-deva-ink md:px-8 md:py-8", children: [
    /* @__PURE__ */ jsxs14("header", { className: "mb-6 flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxs14("div", { children: [
        /* @__PURE__ */ jsx17("h1", { className: "text-[1.75rem] leading-tight font-bold tracking-[-0.02em]", children: title }),
        subtitle && /* @__PURE__ */ jsx17("p", { className: "mt-1 text-sm text-deva-ink-soft", children: subtitle })
      ] }),
      actions
    ] }),
    children
  ] });
}

// src/ui/components/LoginForm.tsx
import { useState as useState6 } from "react";

// src/ui/components/PasswordField.tsx
import { forwardRef as forwardRef5, useState as useState5 } from "react";
import { jsx as jsx18 } from "react/jsx-runtime";
var PasswordField = forwardRef5(function PasswordField2({
  showLabel = "Mostrar contrase\xF1a",
  hideLabel = "Ocultar contrase\xF1a",
  capsLockMessage = "Bloq May\xFAs est\xE1 activado",
  helper,
  helperTone,
  startIcon = /* @__PURE__ */ jsx18(LockIcon, {}),
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}, ref) {
  const [visible, setVisible] = useState5(false);
  const [capsLock, setCapsLock] = useState5(false);
  const detect = (event) => setCapsLock(event.getModifierState("CapsLock"));
  const showCaps = capsLock && !(helper && helperTone === "error");
  return /* @__PURE__ */ jsx18(
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
      endAdornment: /* @__PURE__ */ jsx18(
        "button",
        {
          type: "button",
          tabIndex: -1,
          disabled: props.disabled,
          onClick: () => setVisible((value) => !value),
          "aria-label": visible ? hideLabel : showLabel,
          "aria-pressed": visible,
          className: "flex size-9 items-center justify-center rounded-full text-deva-ink-soft hover:bg-deva-surface-2 disabled:opacity-50",
          children: /* @__PURE__ */ jsx18(EyeIcon, { off: visible })
        }
      ),
      ...props
    }
  );
});

// src/ui/components/LoginForm.tsx
import { jsx as jsx19, jsxs as jsxs15 } from "react/jsx-runtime";
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
  const [username, setUsername] = useState6("");
  const [password, setPassword] = useState6("");
  const [submitting, setSubmitting] = useState6(false);
  const [localError, setLocalError] = useState6(null);
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
  return /* @__PURE__ */ jsxs15("form", { onSubmit: handleSubmit, noValidate: true, className: "flex flex-col gap-5", children: [
    /* @__PURE__ */ jsx19(
      TextField,
      {
        label: usernameLabel,
        startIcon: /* @__PURE__ */ jsx19(UserIcon, {}),
        value: username,
        onChange: (event) => setUsername(event.target.value),
        autoComplete: "username",
        autoCapitalize: "none",
        spellCheck: false,
        autoFocus: true
      }
    ),
    /* @__PURE__ */ jsxs15("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx19(
        PasswordField,
        {
          label: passwordLabel,
          value: password,
          onChange: (event) => setPassword(event.target.value),
          autoComplete: "current-password"
        }
      ),
      forgotPassword && /* @__PURE__ */ jsx19("div", { className: "text-right text-xs", children: forgotPassword }),
      passwordHint && /* @__PURE__ */ jsx19("p", { className: "ml-3.5 text-xs text-deva-ink-soft", children: passwordHint })
    ] }),
    shownError && /* @__PURE__ */ jsx19(Alert, { children: shownError }),
    /* @__PURE__ */ jsx19(Button, { type: "submit", fullWidth: true, loading: loading != null ? loading : submitting, loadingLabel, children: submitLabel }),
    footer
  ] });
}
export {
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
};
