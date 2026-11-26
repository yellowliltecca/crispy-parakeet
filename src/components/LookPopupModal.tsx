import React, { useEffect, useRef, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { GarmentItem, RunwayLook, formatCurrency, pluralizeRu } from '../data/runwayLooks';
import { SizePickerContent } from './SizePickerContent';

interface LookPopupModalProps {
  look: RunwayLook | null;
  originRect: DOMRect | null;
  footOffset: number;
  reducedMotion: boolean;
  onClose: () => void;
  onAddItem: (item: GarmentItem, size: string) => void;
}

export const LookPopupModal: React.FC<LookPopupModalProps> = ({
  look,
  originRect,
  footOffset,
  reducedMotion,
  onClose,
  onAddItem,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [flipTransform, setFlipTransform] = useState<string>('');
  const [isEntered, setIsEntered] = useState(false);
  const modelFrameRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!look) return;
    setSelectedItemId(look.items[0]?.id ?? null);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    closeBtnRef.current?.focus();

    // FLIP entrance from clicked runway hero (skipped in reduced motion)
    if (!reducedMotion && originRect && modelFrameRef.current) {
      const targetRect = modelFrameRef.current.getBoundingClientRect();
      if (targetRect.width > 0 && targetRect.height > 0) {
        const dx = originRect.left + originRect.width / 2 - (targetRect.left + targetRect.width / 2);
        const dy = originRect.top + originRect.height / 2 - (targetRect.top + targetRect.height / 2);
        const scale = Math.max(0.55, Math.min(1.1, originRect.width / targetRect.width));
        setFlipTransform(`translate(${dx}px, ${dy}px) scale(${scale})`);
        const raf = window.requestAnimationFrame(() => {
          setFlipTransform('translate(0px, 0px) scale(1)');
          setIsEntered(true);
        });
        return () => {
          window.cancelAnimationFrame(raf);
          window.removeEventListener('keydown', handleKey);
        };
      }
    }

    setFlipTransform('');
    setIsEntered(true);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [look, originRect, reducedMotion, onClose]);

  if (!look) return null;

  const activeItem = look.items.find((i) => i.id === selectedItemId) ?? look.items[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Просмотр образа ${look.number}: ${look.title}`}
      className={`rw__popup-backdrop ${isEntered ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[1040px] max-h-[90vh] bg-[#F7F6F3] border border-[#E4E1DA] rounded-[4px] overflow-hidden grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] shadow-2xl">
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Закрыть просмотр образа"
          className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-[#FFFFFF]/95 border border-[#E4E1DA] text-[#141312] inline-flex items-center justify-center cursor-pointer hover:bg-[#141312] hover:text-[#FFFFFF] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141312]"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Left: Full-bleed Model with Interactive Pins */}
        <div
          ref={modelFrameRef}
          className="rw__popup-model relative bg-[#F4F2EE] flex items-end justify-center min-h-[360px] max-h-[54vh] md:max-h-[90vh] overflow-hidden"
          style={
            flipTransform && !reducedMotion
              ? { transform: flipTransform }
              : undefined
          }
        >
          <div
            className="relative h-full w-auto aspect-[3/4] max-w-full"
            style={{ '--rw-foot': footOffset } as React.CSSProperties}
          >
            <img
              src={look.image}
              alt={look.alt}
              referrerPolicy="no-referrer"
              className="rw__art w-full h-full object-cover object-bottom"
            />
            {look.items.map((item) => {
              const isSelected = activeItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItemId(item.id)}
                  aria-label={`Выбрать «${item.name}»`}
                  aria-pressed={isSelected}
                  style={{ left: `${item.pinX}%`, top: `${item.pinY}%` }}
                  className={`rw__pin ${isSelected ? 'is-active' : ''} ${
                    item.pinX > 56 ? 'rw__pin--left-tag' : ''
                  }`}
                >
                  <span className="rw__pin-dot" />
                  {isSelected && (
                    <span className="rw__pin-tag">
                      {item.name} · {formatCurrency(item.price)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Garment Selector & Details */}
        <div className="flex flex-col overflow-y-auto p-6 md:p-8 bg-[#FFFFFF]">
          <div className="pr-10 pb-5 border-b border-[#E4E1DA]">
            <p className="text-[12px] text-[#6B6760] tabular-nums">
              Образ {String(look.number).padStart(2, '0')} · {look.items.length}{' '}
              {pluralizeRu(look.items.length, 'вещь', 'вещи', 'вещей')}
            </p>
            <h3 className="font-editorial text-3xl font-medium text-[#141312] mt-1">
              {look.title}
            </h3>
            <p className="text-[13px] text-[#6B6760] mt-1.5 leading-relaxed">
              {look.silhouetteNote}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 py-4 border-b border-[#E4E1DA]">
            {look.items.map((item, idx) => {
              const isSelected = activeItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItemId(item.id)}
                  className={`px-3 py-1.5 text-[12px] font-medium rounded-[2px] border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'border-[#141312] bg-[#141312] text-[#FFFFFF]'
                      : 'border-[#E4E1DA] bg-[#F7F6F3] text-[#141312] hover:border-[#141312]'
                  }`}
                >
                  {idx + 1}. {item.category}
                </button>
              );
            })}
          </div>

          {activeItem && (
            <div className="pt-5 flex-1 flex flex-col justify-between gap-5">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] text-[#6B6760]">
                      {activeItem.category} · {activeItem.color}
                    </p>
                    <h4 className="text-[16px] font-semibold text-[#141312] mt-1">
                      {activeItem.name}
                    </h4>
                  </div>
                  <span className="text-[15px] font-medium text-[#141312] tabular-nums shrink-0">
                    {formatCurrency(activeItem.price)}
                  </span>
                </div>
                <p className="text-[13px] text-[#6B6760] mt-2 leading-relaxed">
                  {activeItem.note}
                </p>
                <p className="text-[12px] text-[#6B6760] mt-2">
                  Состав: {activeItem.material}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E4E1DA]">
                <SizePickerContent
                  item={activeItem}
                  pickerId={`rw-popup-picker-${activeItem.id}`}
                  selectedSize={selectedSizes[activeItem.id] ?? null}
                  onSelectSize={(size) =>
                    setSelectedSizes((prev) => ({ ...prev, [activeItem.id]: size }))
                  }
                  onConfirmAdd={onAddItem}
                  onClose={() => {}}
                  reducedMotion={reducedMotion}
                />
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-[#E4E1DA] flex items-center justify-between text-[12px] text-[#6B6760]">
            <span>Нажмите на любую метку на силуэте для просмотра деталей</span>
            <span className="inline-flex items-center gap-1 text-[#141312] shrink-0 ml-3">
              <Plus className="w-3 h-3" aria-hidden="true" /> Доставка из ателье
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
