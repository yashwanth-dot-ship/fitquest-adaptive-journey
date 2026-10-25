// FitQuest UI kit — brand-specific primitives built on design tokens.
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:opacity-90",
        lime: "bg-lime text-on-brand hover:bg-lime/85",
        coral: "bg-coral text-on-brand hover:bg-coral/85",
        outline: "border-2 border-foreground/15 bg-transparent text-foreground hover:border-foreground/40",
        ghost: "text-foreground hover:bg-muted",
        danger: "bg-destructive text-destructive-foreground hover:opacity-90",
      },
      size: { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg", icon: "size-10" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...p }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...p} />
));
Button.displayName = "Button";

const tones = {
  card: "bg-card text-card-foreground ring-1 ring-border",
  lime: "bg-lime text-on-brand",
  coral: "bg-coral text-on-brand",
  sky: "bg-sky text-on-brand",
  sun: "bg-sun text-on-brand",
  ink: "bg-ink text-paper",
  muted: "bg-muted text-foreground",
} as const;
export type Tone = keyof typeof tones;

export function Panel({ tone = "card", className, ...p }: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return <div className={cn("rounded-3xl p-6", tones[tone], className)} {...p} />;
}

export function Eyebrow({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-xs font-bold uppercase tracking-wider opacity-70", className)} {...p} />;
}

export function Tag({ tone = "lime", className, ...p }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide", tones[tone], className)} {...p} />;
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string | undefined; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 rise">
      <div>
        {eyebrow && <Eyebrow className="text-coral opacity-100">{eyebrow}</Eyebrow>}
        <h1 className="poster mt-1 text-4xl leading-none sm:text-5xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

/** Selectable option pill — single or multi select. */
export function Choice({ selected, children, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all",
        selected ? "border-foreground bg-lime text-on-brand" : "border-border bg-card hover:border-foreground/40",
        className,
      )}
      {...p}
    >
      {selected && <Check className="size-4 shrink-0" aria-hidden />}
      {children}
    </button>
  );
}

export function ChoiceGroup<T extends string | number>({
  label, options, value, onChange, multi, cols = "flex flex-wrap gap-2", error,
}: {
  label: string; options: { value: T; label: string; hint?: string }[]; value: T | T[];
  onChange: (v: T | T[]) => void; multi?: boolean; cols?: string; error?: string | undefined;
}) {
  const arr = Array.isArray(value) ? value : [value];
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-bold">{label}</legend>
      <div className={cols}>
        {options.map((o) => (
          <Choice
            key={String(o.value)}
            selected={arr.includes(o.value)}
            onClick={() => {
              if (!multi) return onChange(o.value);
              onChange(arr.includes(o.value) ? arr.filter((x) => x !== o.value) : [...arr, o.value]);
            }}
          >
            <span>
              {o.label}
              {o.hint && <span className="block text-xs font-normal opacity-70">{o.hint}</span>}
            </span>
          </Choice>
        ))}
      </div>
      {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
    </fieldset>
  );
}

export function Field({ label, error, id, children, hint }: { label: string; error?: string | undefined; id: string; children: ReactNode; hint?: string | undefined }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-bold">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p id={`${id}-error`} className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

const inputCls = "w-full rounded-2xl border-2 border-input bg-card px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground aria-[invalid=true]:border-destructive";
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} className={cn(inputCls, className)} {...p} />
));
Input.displayName = "Input";
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn(inputCls, "min-h-24", className)} {...p} />
));
Textarea.displayName = "Textarea";

export function StatCard({ tone, label, value, unit, note }: { tone: Tone; label: string; value: ReactNode; unit?: string; note?: string | undefined }) {
  return (
    <Panel tone={tone}>
      <Eyebrow>{label}</Eyebrow>
      <div className="poster mt-2 text-5xl leading-none sm:text-6xl">
        {value}{unit && <span className="text-2xl"> {unit}</span>}
      </div>
      {note && <p className="mt-3 text-sm font-medium opacity-80">{note}</p>}
    </Panel>
  );
}

export function Logo({ inverted }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn("poster grid size-8 place-items-center rounded-full text-sm", inverted ? "bg-lime text-on-brand" : "bg-foreground text-background")}>FQ</span>
      <span className="poster text-lg tracking-wide">FitQuest</span>
    </span>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs opacity-70", className)}>
      App-generated recommendation based on your inputs. General wellness guidance only — not medical advice. Stop if anything hurts.
    </p>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <Panel className="flex flex-col items-start gap-3 border-2 border-dashed border-border bg-transparent ring-0">
      <h3 className="poster text-2xl">{title}</h3>
      <p className="max-w-md text-muted-foreground">{body}</p>
      {action}
    </Panel>
  );
}
