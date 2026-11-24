'use client';

import { useEffect, useId, useRef, useState } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  /** Small text on the right, e.g. a product count. */
  hint?: string | number;
}

/**
 * Styled replacement for a native <select>: a pill button that opens a rounded list.
 * Keyboard: Enter/Space/↓ open, ↑/↓ move, Enter picks, Esc closes. Closes on outside click.
 */
export function Dropdown({
  label,
  value,
  options,
  onChange,
  prefix,
  className = '',
}: {
  /** Accessible name of the control. */
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  /** Shown before the current option, e.g. "Sort:". */
  prefix?: string;
  className?: string;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(0);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [open]);

  const pick = (v: string) => {
    setOpen(false);
    if (v !== value) onChange(v);
  };
  const openList = () => {
    setFocus(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return setOpen(false);
    if (!open && ['Enter', ' ', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      return openList();
    }
    if (!open) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setFocus((f) => (f + (e.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(options[focus].value);
    }
  };

  return (
    <div ref={root} className={`relative ${className}`} onKeyDown={onKey}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => (open ? setOpen(false) : openList())}
        className={`flex w-full items-center justify-between gap-3 rounded-full border-[1.5px] bg-white py-2.5 pr-4 pl-5 text-left text-sm font-semibold text-ink transition-colors ${
          open ? 'border-ink' : 'border-ink/30 hover:border-ink'
        }`}
      >
        <span className="truncate">
          {prefix && <span className="text-ink/50">{prefix} </span>}
          {current?.label}
          {current?.hint !== undefined && <span className="ml-1.5 text-xs text-brand">{current.hint}</span>}
        </span>
        <svg aria-hidden viewBox="0 0 24 24" className={`h-3.5 w-3.5 flex-none fill-none stroke-ink stroke-[2.5] transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          id={id}
          role="listbox"
          aria-label={label}
          className="absolute top-[calc(100%+8px)] right-0 z-30 max-h-80 min-w-full overflow-auto rounded-2xl border-[1.5px] border-ink/15 bg-white p-1.5 shadow-[0_20px_50px_rgba(0,0,0,.14)] [scrollbar-width:thin] animate-[menu-in_.18s_ease-out]"
        >
          {options.map((o, i) => {
            const selected = o.value === value;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setFocus(i)}
                onClick={() => pick(o.value)}
                className={`flex cursor-pointer items-center justify-between gap-6 rounded-xl px-3.5 py-2.5 text-sm whitespace-nowrap ${
                  i === focus ? 'bg-soft' : ''
                } ${selected ? 'font-bold text-ink' : 'font-medium text-ink/75'}`}
              >
                <span className="flex items-center gap-2.5">
                  <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${selected ? 'bg-brand' : 'bg-transparent'}`} />
                  {o.label}
                </span>
                {o.hint !== undefined && <span className={`text-xs ${selected ? 'text-brand' : 'text-ink/40'}`}>{o.hint}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
