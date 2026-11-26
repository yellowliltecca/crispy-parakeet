import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { GarmentItem, formatCurrency } from '../data/runwayLooks';

interface SizePickerContentProps {
  item: GarmentItem;
  pickerId: string;
  selectedSize: string | null;
  onSelectSize: (size: string) => void;
  onConfirmAdd: (item: GarmentItem, size: string) => void;
  onClose: () => void;
  isSheet?: boolean;
  reducedMotion: boolean;
}

export const SizePickerContent: React.FC<SizePickerContentProps> = ({
  item,
  pickerId,
  selectedSize,
  onSelectSize,
  onConfirmAdd,
  onClose,
  isSheet = false,
  reducedMotion,
}) => {
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleConfirm = () => {
    if (!selectedSize) {
      setStatusMessage('Выберите размер');
      return;
    }

    setStatusMessage('');
    setJustAdded(true);

    if (!reducedMotion && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(12);
      } catch {
        // Ignore haptic errors on unsupported browsers
      }
    }

    onConfirmAdd(item, selectedSize);

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, reducedMotion ? 120 : 520);
  };

  return (
    <div id={pickerId} className="w-full">
      {isSheet && (
        <div className="rw__sheet-head">
          <div className="min-w-0">
            <h4 className="rw__sheet-title truncate">{item.name}</h4>
            <p className="rw__sheet-price tabular-nums">{formatCurrency(item.price)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Закрыть выбор размера для «${item.name}»`}
            className="rw__sheet-close focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141312]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[11px] font-medium text-[#6B6760] truncate">
          Размер · {item.color}
        </span>
        <span className="text-[11px] text-[#6B6760] truncate">
          {item.material.split(' · ')[0]}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label={`Размеры для «${item.name}»`}
        className="flex flex-wrap gap-2 mb-3"
      >
        {item.sizes.map((sz) => {
          const isSelected = selectedSize === sz.label;
          return (
            <button
              key={sz.label}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={sz.soldOut}
              onClick={() => {
                onSelectSize(sz.label);
                if (statusMessage) setStatusMessage('');
              }}
              className={`min-w-[44px] h-10 px-3 text-[12px] font-medium rounded-[2px] border transition-colors whitespace-nowrap shrink-0 tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141312] ${
                sz.soldOut
                  ? 'border-[#E4E1DA] bg-[#F7F6F3] text-[#B3AEA6] line-through cursor-not-allowed'
                  : isSelected
                    ? 'border-[#141312] bg-[#141312] text-[#FFFFFF] cursor-pointer'
                    : 'border-[#D5D1C8] bg-[#FFFFFF] text-[#141312] hover:border-[#141312] cursor-pointer'
              }`}
            >
              {sz.label}
            </button>
          );
        })}
      </div>

      <div
        role="status"
        aria-live="polite"
        className="min-h-[18px] mb-2 text-[12px]"
      >
        {statusMessage && (
          <p className="rw__msg text-[#7A2429] font-medium">{statusMessage}</p>
        )}
        {justAdded && (
          <p className="rw__msg text-[#141312] font-medium">
            Добавлено: {item.name} ({selectedSize})
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleConfirm}
        className={`rw__cta rw__confirm-btn relative w-full min-h-[44px] px-4 py-2.5 rounded-[3px] text-[13px] font-medium flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141312] ${
          justAdded
            ? 'bg-[#213B2A] text-[#FFFFFF]'
            : 'bg-[#141312] text-[#FFFFFF] hover:bg-[#2B2926]'
        }`}
      >
        {justAdded && !reducedMotion && <span className="rw__cta-shimmer" aria-hidden="true" />}
        {justAdded && !reducedMotion && <span className="rw__burst" aria-hidden="true" />}
        {justAdded ? (
          <>
            <svg
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8.5L6.5 12L13 4.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="rw__check-path"
              />
            </svg>
            <span>Добавлено в корзину</span>
          </>
        ) : (
          <span>
            В корзину · <span className="tabular-nums">{formatCurrency(item.price)}</span>
          </span>
        )}
        <span className="sr-only"> — {item.name}</span>
      </button>
    </div>
  );
};
