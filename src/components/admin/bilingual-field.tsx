import { cloneElement, type ReactElement } from "react";
import { cn } from "@/lib/utils";

type Control = ReactElement<{ "aria-label"?: string; lang?: string; placeholder?: string; className?: string }>;

// A field with the English input on top and the Turkish one below it.
// English uses name="x", Turkish name="xTr". Turkish can stay empty, then /tr shows the English.
// You pass the inputs in yourself, so it works with Input, Textarea or anything else.
export function BilingualField({
  label,
  hint,
  en,
  tr,
  className,
}: {
  label: string;
  hint?: React.ReactNode;
  en: Control;
  tr: Control;
  className?: string;
}) {
  return (
    <fieldset className={cn("grid content-start gap-1.5 text-sm", className)}>
      <legend className="mb-1.5 font-medium">{label}</legend>
      <LangRow code="EN">{cloneElement(en, { "aria-label": `${label} (English)`, lang: "en" })}</LangRow>
      <LangRow code="TR">
        {cloneElement(tr, {
          "aria-label": `${label} (Türkçe)`,
          lang: "tr",
          placeholder: tr.props.placeholder ?? "Türkçe (isteğe bağlı) — boş bırakılırsa İngilizce gösterilir",
        })}
      </LangRow>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </fieldset>
  );
}

function LangRow({ code, children }: { code: "EN" | "TR"; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span
        aria-hidden
        className={cn(
          "mt-2 w-7 shrink-0 rounded px-1 py-0.5 text-center font-mono text-[10px] font-semibold",
          code === "EN" ? "bg-secondary text-secondary-foreground" : "bg-primary/15 text-primary",
        )}
      >
        {code}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
