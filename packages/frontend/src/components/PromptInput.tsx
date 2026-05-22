'use client';

import { useRef, useEffect } from 'react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function PromptInput({
  value,
  onChange,
  placeholder = 'Describe your Web3 project...',
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  }, [value]);

  return (
    <div className="relative group">
      <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
        Describe Your Project
      </label>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="input-dark resize-none min-h-[100px] max-h-[200px] text-[15px] leading-relaxed pr-12"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              // Trigger build via parent — we'll use a custom event
              document.querySelector<HTMLButtonElement>('button.btn-primary')?.click();
            }
          }}
        />
        <div className="absolute bottom-3 right-3 text-[10px] text-gray-600 select-none">
          ⌘+Enter
        </div>
      </div>
      <p className="mt-1.5 text-[11px] text-gray-600">
        Be specific — mention token name, supply, features, and target chain.
      </p>
    </div>
  );
}
