import React, { useEffect, useRef, useState } from 'react';
import { X, Minus, Plus, Trash2, Check } from 'lucide-react';
import { GarmentItem, formatCurrency, pluralizeRu } from '../data/runwayLooks';

export interface BagLineItem {
  key: string;
  item: GarmentItem;
  lookNumber: number;
  lookTitle: string;
  lookImage: string;
  size: string;
  quantity: number;
}

interface BagDrawerProps {
  isOpen: boolean;
  items: BagLineItem[];
  onClose: () => void;
  onUpdateQty: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
  onClearBag: () => void;
}

export const BagDrawer: React.FC<BagDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQty,
  onRemove,
  onClearBag,
}) => {
  const [orderReference, setOrderReference] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, entry) => acc + entry.item.price * entry.quantity, 0);
  const totalCount = items.reduce((acc, entry) => acc + entry.quantity, 0);

  const handleCheckout = () => {
    const code = `MV-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    setOrderReference(code);
    onClearBag();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Корзина ателье"
      className="fixed inset-0 z-80 flex justify-end bg-[#141312]/45 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOrderReference(null);
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[440px] h-full bg-[#FFFFFF] border-l border-[#E4E1DA] flex flex-col shadow-2xl">
        <div className="px-6 py-5 border-b border-[#E4E1DA] flex items-center justify-between gap-4">
          <div>
            <h2 className="font-editorial text-2xl font-medium text-[#141312]">
              Корзина ателье
            </h2>
            <p className="text-[12px] text-[#6B6760] tabular-nums">
              {totalCount} {pluralizeRu(totalCount, 'вещь', 'вещи', 'вещей')} в резерве
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => {
              setOrderReference(null);
              onClose();
            }}
            aria-label="Закрыть корзину"
            className="w-11 h-11 rounded-full border border-[#E4E1DA] inline-flex items-center justify-center text-[#141312] hover:bg-[#141312] hover:text-[#FFFFFF] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {orderReference ? (
            <div role="status" className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#141312] text-[#FFFFFF] mx-auto flex items-center justify-center">
                <Check className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-editorial text-2xl font-medium text-[#141312]">
                Резерв подтверждён
              </h3>
              <p className="text-[13px] text-[#6B6760] max-w-[290px] mx-auto leading-relaxed">
                Заказ{' '}
                <span className="text-[#141312] font-medium tabular-nums">
                  №{orderReference}
                </span>{' '}
                зарегистрирован в клиентской службе Maison Véra. Курьерская доставка ателье предоставляется бесплатно.
              </p>
              <button
                type="button"
                onClick={() => {
                  setOrderReference(null);
                  onClose();
                }}
                className="mt-2 px-5 py-2.5 text-[13px] font-medium border border-[#141312] text-[#141312] hover:bg-[#141312] hover:text-[#FFFFFF] rounded-[3px] transition-colors cursor-pointer"
              >
                Вернуться на подиум
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="font-editorial text-2xl text-[#141312]">Корзина пуста</p>
              <p className="text-[13px] text-[#6B6760] max-w-[270px] mx-auto leading-relaxed">
                Нажмите на любую метку на подиуме или откройте изделие в списке образа, чтобы выбрать размер.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#E4E1DA]">
              {items.map((entry) => (
                <li key={entry.key} className="py-4 first:pt-0 flex gap-4">
                  <div className="w-16 h-20 rounded-[2px] bg-[#F4F2EE] overflow-hidden shrink-0">
                    <img
                      src={entry.lookImage}
                      alt={entry.item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: entry.item.cropPosition,
                        transformOrigin: entry.item.cropPosition,
                        transform: `scale(${entry.item.cropScale ?? 1})`,
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[13px] font-medium text-[#141312] leading-snug">
                        {entry.item.name}
                      </h3>
                      <span className="text-[13px] font-medium text-[#141312] tabular-nums shrink-0">
                        {formatCurrency(entry.item.price * entry.quantity)}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#6B6760] mt-1">
                      Образ {String(entry.lookNumber).padStart(2, '0')} · {entry.item.color} · Размер {entry.size}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center border border-[#E4E1DA] rounded-[2px]">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(entry.key, -1)}
                          aria-label={`Уменьшить количество «${entry.item.name}»`}
                          className="w-8 h-8 inline-flex items-center justify-center text-[#141312] hover:bg-[#F7F6F3] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" aria-hidden="true" />
                        </button>
                        <span className="w-8 text-center text-[12px] font-medium tabular-nums">
                          {entry.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(entry.key, 1)}
                          aria-label={`Увеличить количество «${entry.item.name}»`}
                          className="w-8 h-8 inline-flex items-center justify-center text-[#141312] hover:bg-[#F7F6F3] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(entry.key)}
                        aria-label={`Удалить «${entry.item.name}» из корзины`}
                        className="inline-flex items-center gap-1 text-[12px] text-[#6B6760] hover:text-[#7A2429] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Удалить</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && !orderReference && (
          <div className="px-6 py-5 border-t border-[#E4E1DA] bg-[#FAF9F6] space-y-3">
            <div className="flex items-center justify-between text-[12px] text-[#6B6760]">
              <span>Курьерская доставка ателье</span>
              <span className="text-[#141312] font-medium">Бесплатно</span>
            </div>
            <div className="flex items-baseline justify-between pt-2 border-t border-[#E4E1DA]">
              <span className="text-[13px] font-medium text-[#141312]">Итого</span>
              <span className="font-editorial text-2xl font-medium text-[#141312] tabular-nums">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full min-h-[48px] bg-[#141312] hover:bg-[#2B2926] text-[#FFFFFF] text-[13px] font-medium rounded-[3px] transition-colors cursor-pointer"
            >
              Оформить заказ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
