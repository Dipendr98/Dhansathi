import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option'
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-w-[200px] flex items-center justify-between px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
      >
        <span className="truncate pr-4">{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="material-symbols-outlined text-outline text-xl shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
          <ul className="py-1">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm transition-colors hover:bg-surface-container",
                    value === option.value ? "bg-primary/10 text-primary font-bold" : "text-on-surface"
                  )}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
