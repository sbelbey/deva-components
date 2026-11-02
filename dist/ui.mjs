// src/ui/cx.ts
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

// src/ui/BrandLockup.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function BrandLockup({
  product,
  tone,
  logos,
  stacked = false,
  className,
  logoClassName = "h-7",
  textClassName = "text-lg"
}) {
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: cx("inline-flex shrink-0", stacked ? "flex-col items-end gap-3" : "items-center gap-3", className),
      children: [
        /* @__PURE__ */ jsx("img", { src: tone === "white" ? logos.white : logos.blue, alt: "DEVA", className: logoClassName }),
        !stacked && /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "h-6 w-px bg-current opacity-55" }),
        /* @__PURE__ */ jsx("span", { className: cx("leading-none font-semibold tracking-[-0.01em]", textClassName), children: product })
      ]
    }
  );
}

// src/ui/ColorModeSwitch.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function Sun() {
  return /* @__PURE__ */ jsxs2("svg", { viewBox: "0 0 24 24", className: "size-3.5", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ jsx2("circle", { cx: "12", cy: "12", r: "4" }),
    /* @__PURE__ */ jsx2("path", { d: "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" })
  ] });
}
function Moon() {
  return /* @__PURE__ */ jsx2("svg", { viewBox: "0 0 24 24", className: "size-3.5", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: /* @__PURE__ */ jsx2("path", { d: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" }) });
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
        /* @__PURE__ */ jsx2(
          "span",
          {
            className: cx(
              "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-deva-line transition-colors duration-200",
              dark ? "bg-deva-chip-bg" : "bg-deva-surface-2"
            ),
            children: /* @__PURE__ */ jsx2(
              "span",
              {
                className: cx(
                  "absolute left-0.5 flex size-6 items-center justify-center rounded-full shadow-deva-sm transition-transform duration-200 ease-out motion-reduce:transition-none",
                  dark ? "translate-x-5 bg-deva-action text-deva-on-action" : "translate-x-0 bg-deva-surface text-deva-warn"
                ),
                children: dark ? /* @__PURE__ */ jsx2(Moon, {}) : /* @__PURE__ */ jsx2(Sun, {})
              }
            )
          }
        ),
        /* @__PURE__ */ jsx2("span", { className: cx(hideLabel && "sr-only"), children: label })
      ]
    }
  );
}

// src/ui/Tip.tsx
import { useId, useState } from "react";
import { Fragment, jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function Tip({ content, children, className }) {
  const id = useId();
  const [pinned, setPinned] = useState(false);
  if (!content) return /* @__PURE__ */ jsx3(Fragment, { children });
  return /* @__PURE__ */ jsxs3("span", { className: cx("group relative inline-flex", className), onMouseLeave: () => setPinned(false), children: [
    /* @__PURE__ */ jsx3(
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
    /* @__PURE__ */ jsx3(
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

// src/ui/PasswordInput.tsx
import { forwardRef, useState as useState2 } from "react";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function EyeIcon({ off }) {
  return /* @__PURE__ */ jsxs4("svg", { viewBox: "0 0 24 24", className: "size-4", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
    /* @__PURE__ */ jsx4("path", { d: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" }),
    /* @__PURE__ */ jsx4("circle", { cx: "12", cy: "12", r: "3" }),
    off && /* @__PURE__ */ jsx4("path", { d: "M3 3l18 18" })
  ] });
}
var PasswordInput = forwardRef(function PasswordInput2({ className, wrapperClassName, showLabel = "Mostrar contrase\xF1a", hideLabel = "Ocultar contrase\xF1a", disabled, ...props }, ref) {
  const [visible, setVisible] = useState2(false);
  return /* @__PURE__ */ jsxs4("div", { className: cx("relative", wrapperClassName), children: [
    /* @__PURE__ */ jsx4(
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
    /* @__PURE__ */ jsx4(
      "button",
      {
        type: "button",
        disabled,
        tabIndex: -1,
        onClick: () => setVisible((value) => !value),
        "aria-label": visible ? hideLabel : showLabel,
        "aria-pressed": visible,
        className: "absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-deva text-deva-ink-soft hover:text-deva-ink disabled:opacity-50",
        children: /* @__PURE__ */ jsx4(EyeIcon, { off: visible })
      }
    )
  ] });
});
export {
  BrandLockup,
  ColorModeSwitch,
  PasswordInput,
  Tip
};
