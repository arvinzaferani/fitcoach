import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

const persianCalendarFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  dateStyle: "medium",
  timeStyle: "short",
});

const persianDateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const persianMonthFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
});

const persianDigitsMap: Record<string, string> = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

function toLatinDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (char) => persianDigitsMap[char] ?? char);
}

function parsePersianDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  const year = Number(toLatinDigits(parts.find((part) => part.type === "year")?.value ?? "0"));
  const month = Number(toLatinDigits(parts.find((part) => part.type === "month")?.value ?? "0"));
  const day = Number(toLatinDigits(parts.find((part) => part.type === "day")?.value ?? "0"));
  return { year, month, day };
}

function localPad2(value: number) {
  return value.toString().padStart(2, "0");
}

function toLocalIsoString(date: Date) {
  const year = date.getFullYear();
  const month = localPad2(date.getMonth() + 1);
  const day = localPad2(date.getDate());
  const hour = localPad2(date.getHours());
  const minute = localPad2(date.getMinutes());
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function normalizeDate(date?: string) {
  const parsed = date ? new Date(date) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function addDays(date: Date, delta: number) {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + delta);
  return next;
}

function setLocalTime(date: Date, hour: number, minute: number) {
  const next = new Date(date.getTime());
  next.setHours(hour, minute, 0, 0);
  return next;
}

function startOfPersianMonth(date: Date) {
  const target = parsePersianDateParts(date);
  let cursor = setLocalTime(date, 12, 0);
  while (true) {
    const previous = addDays(cursor, -1);
    const previousParts = parsePersianDateParts(previous);
    if (previousParts.year === target.year && previousParts.month === target.month) {
      cursor = previous;
      continue;
    }
    return cursor;
  }
}

function getPersianMonthLength(date: Date) {
  const start = startOfPersianMonth(date);
  const startParts = parsePersianDateParts(start);
  let length = 1;
  let cursor = start;
  while (length < 42) {
    const next = addDays(cursor, 1);
    const nextParts = parsePersianDateParts(next);
    if (nextParts.year !== startParts.year || nextParts.month !== startParts.month) {
      break;
    }
    cursor = next;
    length += 1;
  }
  return { start, length };
}

function formatPersianLabel(date: Date, showTime: boolean) {
  return showTime ? persianCalendarFormatter.format(date) : persianDateFormatter.format(date);
}

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tokil-gold/45 active:scale-[.98]',
  {
    variants: {
      variant: {
        default: 'bg-tokil-green text-white shadow-sm hover:bg-tokil-ink/90',
        secondary: 'bg-tokil-sand text-tokil-ink hover:bg-tokil-sand/80',
        outline: 'border border-tokil-border/80 bg-white text-tokil-ink hover:bg-slate-50',
        ghost: 'text-tokil-ink hover:bg-white/70',
        danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700'
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 rounded-xl px-3 text-xs',
        lg: 'h-12 px-7 text-base'
      }
    },
    defaultVariants: { variant: 'default', size: 'default' }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild: _asChild, ...props }, ref) => {
  return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-[1.75rem] border border-tokil-border/70 bg-white p-5 shadow-sm md:p-6', className)} {...props} />;
}

export function Surface({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-[2rem] border border-tokil-border/60 bg-tokil-sand/35 p-4', className)} {...props} />;
}

const controlClass = 'h-11 w-full rounded-2xl border border-tokil-border/80 bg-white/88 px-4 text-sm text-tokil-ink outline-none transition placeholder:text-slate-400 hover:border-tokil-gold/50 focus:border-tokil-gold focus:bg-white focus:ring-4 focus:ring-tokil-gold/15';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(controlClass, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('min-h-28 w-full rounded-2xl border border-tokil-border/80 bg-white/88 px-4 py-3 text-sm text-tokil-ink outline-none transition placeholder:text-slate-400 hover:border-tokil-gold/50 focus:border-tokil-gold focus:bg-white focus:ring-4 focus:ring-tokil-gold/15', props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(controlClass, props.className)} />;
}

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={cn('mb-2 block text-sm font-extrabold text-tokil-ink', props.className)} />;
}

export function Badge({ tone = 'neutral', className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: 'pending' | 'assigned' | 'closed' | 'neutral' }) {
  const tones = {
    pending: 'bg-amber-100 text-amber-900 border-amber-200 ring-amber-500/10',
    assigned: 'bg-emerald-100 text-emerald-900 border-emerald-200 ring-emerald-500/10',
    closed: 'bg-blue-100 text-blue-900 border-blue-200 ring-blue-500/10',
    error: 'bg-red-100 text-red-900 border-red-200 ring-red-500/10',
    neutral: 'bg-white/80 text-slate-700 border-tokil-border/80 ring-tokil-gold/10'
  };
  return <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ring-4', tones[tone], className)} {...props} />;
}

export function PageShell({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <main className={cn('relative mx-auto min-h-screen w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8', className)}>{children}</main>;
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLElement> & { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return <section className={cn('mb-6 overflow-hidden rounded-b-[2.25rem] border border-tokil-border/70 p-6 shadow-sm md:p-8', className)} style={{ backgroundColor: 'var(--tokil-green)', ...style }} {...props}><div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><div className="relative">{eyebrow && <Badge>{eyebrow}</Badge>}<h1 style={{ color: 'var(--tokil-gold)', ...style }} className="mt-4 max-w-3xl text-2xl font-black tracking-tight text-tokil-ink md:text-4xl md:leading-tight">{title}</h1>{description && <p style={{ color: 'var(--tokil-gold)', ...style }} className="mt-4 max-w-2xl text-base leading-8 text-slate-600">{description}</p>}</div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div></section>;
}

export function SectionTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><h2 className="text-xl font-black text-tokil-ink md:text-2xl">{title}</h2>{description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}</div>{action}</div>;
}

export function StatCard({ label, value, tone = 'neutral' }: { label: string; value: React.ReactNode; tone?: 'pending' | 'assigned' | 'closed' | 'neutral' }) {
  const accents = { pending: 'from-amber-200/70', assigned: 'from-emerald-200/70', closed: 'from-blue-200/70', neutral: 'from-tokil-gold/25' };
  return <div className={cn('relative overflow-hidden rounded-3xl border border-white/70 bg-white/72 p-4 shadow-sm', accents[tone])}><div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-l to-transparent', accents[tone])} /><p className="text-xs font-bold text-slate-500">{label}</p><div className="mt-2 text-2xl font-black text-tokil-ink">{value}</div></div>;
}

export function Alert({ tone = 'error', children }: React.PropsWithChildren<{ tone?: 'error' | 'success' | 'info' }>) {
  const tones = { error: 'border-red-200 bg-red-50 text-red-800', success: 'border-emerald-200 bg-emerald-50 text-emerald-800', info: 'border-tokil-border bg-white/70 text-slate-700' };
  return <div className={cn('rounded-2xl border p-3 text-sm font-bold', tones[tone])}>{children}</div>;
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return <div className="rounded-3xl border border-dashed border-tokil-border bg-white/55 p-8 text-center"><div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-tokil-sand" /><p className="font-black text-tokil-ink">{title}</p>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div>;
}

export function InfoGrid({ entries }: { entries: Array<[string, React.ReactNode]> }) {
  return <div className="grid gap-3 md:grid-cols-2">{entries.map(([label, value]) => <div className="rounded-2xl border border-white/70 bg-white/68 p-4 shadow-sm" key={label}><b className="text-sm text-tokil-ink">{label}</b><p className="mt-2 break-words text-sm leading-7 text-slate-600">{value || '-'}</p></div>)}</div>;
}

export function Stepper({ steps, current, onStep }: { steps: string[]; current: number; onStep?: (step: number) => void }) {
  return <div className="mb-7 grid gap-2 md:grid-cols-3">{steps.map((title, index) => { const active = index + 1 === current; const done = index + 1 < current; return <button key={title} type="button" onClick={() => done && onStep?.(index + 1)} className={cn('group rounded-2xl border p-4 text-right text-sm font-black transition-all', active ? 'border-tokil-gold bg-tokil-sand text-tokil-ink shadow-sm' : done ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900 hover:-translate-y-0.5' : 'border-white/70 bg-white/60 text-slate-500')}><span className={cn('ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs', active ? 'bg-tokil-ink text-white' : 'bg-white')}>{done ? '✓' : index + 1}</span>{title}</button>; })}</div>;
}

export type DateTimePickerProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> & {
  value?: string;
  onChange: (value: string) => void;
};

export type PersianDateTimePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  showTime?: boolean;
  label?: string;
};

function isSameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function isSamePersianMonth(left: Date, right: Date) {
  const leftParts = parsePersianDateParts(left);
  const rightParts = parsePersianDateParts(right);
  return leftParts.year === rightParts.year && leftParts.month === rightParts.month;
}

function useOutsideClose(ref: React.RefObject<HTMLElement>, onClose: () => void) {
  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!ref.current?.contains(target)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, ref]);
}

function PersianCalendarButton({
  date,
  active,
  onClick,
}: {
  date: Date;
  active: boolean;
  onClick: () => void;
}) {
  const { day } = parsePersianDateParts(date);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 rounded-2xl text-sm font-bold transition",
        active
          ? "bg-primary text-white shadow-sm"
          : "bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
      )}
    >
      {day}
    </button>
  );
}

export function PersianDateTimePicker({ value, onChange, className, showTime = false, label }: PersianDateTimePickerProps) {
  const selectedDate = React.useMemo(() => normalizeDate(value), [value]);
  const [draftDate, setDraftDate] = React.useState(selectedDate);
  const [draftHour, setDraftHour] = React.useState(selectedDate.getHours());
  const [draftMinute, setDraftMinute] = React.useState(selectedDate.getMinutes());
  const [isOpen, setIsOpen] = React.useState(false);
  const [viewDate, setViewDate] = React.useState(() => startOfPersianMonth(selectedDate));
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setDraftDate(selectedDate);
    setDraftHour(selectedDate.getHours());
    setDraftMinute(selectedDate.getMinutes());
    setViewDate(startOfPersianMonth(selectedDate));
  }, [selectedDate]);

  useOutsideClose(containerRef, () => setIsOpen(false));

  const { start, length } = React.useMemo(() => getPersianMonthLength(viewDate), [viewDate]);
  const selectedLabel = formatPersianLabel(draftDate, showTime);
  const placeholder = label ?? "انتخاب تاریخ";
  const displayValue = value ? selectedLabel : placeholder;
  const weekdayOffset = (start.getDay() + 1) % 7;

  function commit(nextDate: Date) {
    const finalDate = showTime ? setLocalTime(nextDate, draftHour, draftMinute) : setLocalTime(nextDate, 12, 0);
    setDraftDate(finalDate);
    onChange(toLocalIsoString(finalDate));
    if (!showTime) {
      setIsOpen(false);
    }
  }

  function updateTime(nextHour: number, nextMinute: number) {
    setDraftHour(nextHour);
    setDraftMinute(nextMinute);
    onChange(toLocalIsoString(setLocalTime(draftDate, nextHour, nextMinute)));
  }

  const grid = Array.from({ length: 42 }, (_, index) => {
    const offsetDate = addDays(start, index - weekdayOffset);
    return isSamePersianMonth(offsetDate, start) ? offsetDate : null;
  });

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((state) => !state)}
        className="flex h-12 w-full sm:w-auto items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-right text-sm font-medium text-slate-900 shadow-sm transition hover:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
      >
        <span className={cn("truncate", value ? "text-slate-900 dark:text-slate-100" : "text-slate-400")}>{displayValue}</span>
        <span className="mr-3 text-slate-400">▾</span>
      </button>

      {isOpen ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_50px_rgba(15,23,42,0.16)] dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewDate(startOfPersianMonth(addDays(start, -1)))}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              ماه قبل
            </button>
            <div className="text-sm font-black text-slate-900 dark:text-slate-100">{persianMonthFormatter.format(viewDate)}</div>
            <button
              type="button"
              onClick={() => setViewDate(startOfPersianMonth(addDays(start, length)))}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              ماه بعد
            </button>
          </div>

          <div className="px-4 pb-4 pt-3">
            <div className="mb-3 grid grid-cols-7 text-center text-[11px] font-bold text-slate-500">
              {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((weekDay) => (
                <span key={weekDay}>{weekDay}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {grid.map((dayDate, index) => {
                if (!dayDate) {
                  return <span key={`gap-${index}`} className="h-10 rounded-2xl" />;
                }

                const active = isSameDay(dayDate, draftDate);
                return (
                  <PersianCalendarButton
                    key={dayDate.toISOString()}
                    date={dayDate}
                    active={active}
                    onClick={() => commit(dayDate)}
                  />
                );
              })}
            </div>

            {showTime ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <Label className="mb-2">ساعت</Label>
                <Input
                  type="time"
                  value={`${localPad2(draftHour)}:${localPad2(draftMinute)}`}
                  onChange={(event) => {
                    const [hour = "0", minute = "0"] = event.target.value.split(":");
                    updateTime(Number(hour), Number(minute));
                  }}
                  className="bg-white dark:bg-slate-950"
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export type PersianDateRangePickerProps = {
  from?: string;
  to?: string;
  onChange: (next: { from?: string; to?: string }) => void;
  className?: string;
  showTime?: boolean;
};

export function PersianDateRangePicker({ from, to, onChange, className, showTime = false }: PersianDateRangePickerProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      <div>
        <Label>از تاریخ</Label>
        <PersianDateTimePicker value={from} onChange={(value) => onChange({ from: value, to })} showTime={showTime} />
      </div>
      <div>
        <Label>تا تاریخ</Label>
        <PersianDateTimePicker value={to} onChange={(value) => onChange({ from, to: value })} showTime={showTime} />
      </div>
    </div>
  );
}

export function DateTimePicker(props: PersianDateTimePickerProps) {
  return <PersianDateTimePicker {...props} showTime />;
}
