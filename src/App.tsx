import { useEffect, useState, useCallback, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { RunwaySection } from './components/RunwaySection';
import { AtelierAndIndex } from './components/AtelierAndIndex';
import { BagDrawer, BagLineItem } from './components/BagDrawer';
import { GarmentItem, RunwayLook, pluralizeRu } from './data/runwayLooks';

export default function App() {
  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const [bagItems, setBagItems] = useState<BagLineItem[]>([]);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => {
      mq.removeEventListener('change', onChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3400);
  }, []);

  const handleAddItem = useCallback(
    (item: GarmentItem, size: string, look: RunwayLook) => {
      const key = `${item.id}::${size}`;
      setBagItems((prev) => {
        const existing = prev.find((entry) => entry.key === key);
        if (existing) {
          return prev.map((entry) =>
            entry.key === key
              ? { ...entry, quantity: entry.quantity + 1 }
              : entry
          );
        }
        return [
          ...prev,
          {
            key,
            item,
            lookNumber: look.number,
            lookTitle: look.title,
            lookImage: look.image,
            size,
            quantity: 1,
          },
        ];
      });
      showToast(`В корзине: ${item.name} (${size})`);
    },
    [showToast]
  );

  const handleAddCompleteLook = useCallback(
    (look: RunwayLook, selections: { item: GarmentItem; size: string }[]) => {
      setBagItems((prev) => {
        const next = [...prev];
        for (const { item, size } of selections) {
          const key = `${item.id}::${size}`;
          const existingIdx = next.findIndex((entry) => entry.key === key);
          if (existingIdx >= 0) {
            next[existingIdx] = {
              ...next[existingIdx],
              quantity: next[existingIdx].quantity + 1,
            };
          } else {
            next.push({
              key,
              item,
              lookNumber: look.number,
              lookTitle: look.title,
              lookImage: look.image,
              size,
              quantity: 1,
            });
          }
        }
        return next;
      });
      showToast(
        `Образ ${String(look.number).padStart(2, '0')} (${selections.length} ${pluralizeRu(selections.length, 'вещь', 'вещи', 'вещей')}) добавлен в корзину`
      );
    },
    [showToast]
  );

  const handleUpdateQty = useCallback((key: string, delta: number) => {
    setBagItems((prev) =>
      prev
        .map((entry) =>
          entry.key === key
            ? { ...entry, quantity: entry.quantity + delta }
            : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  }, []);

  const handleRemoveItem = useCallback((key: string) => {
    setBagItems((prev) => prev.filter((entry) => entry.key !== key));
  }, []);

  const handleClearBag = useCallback(() => {
    setBagItems([]);
  }, []);

  const totalBagCount = bagItems.reduce((sum, entry) => sum + entry.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#141312]">
      <TopBar
        bagCount={totalBagCount}
        onOpenBag={() => setIsBagOpen(true)}
        reducedMotion={reducedMotion}
      />

      <main className="flex-1">
        <RunwaySection
          activeLookIndex={activeLookIndex}
          onChangeLookIndex={setActiveLookIndex}
          reducedMotion={reducedMotion}
          onAddItem={handleAddItem}
          onAddCompleteLook={handleAddCompleteLook}
        />

        <AtelierAndIndex
          activeLookIndex={activeLookIndex}
          onSelectLook={setActiveLookIndex}
          reducedMotion={reducedMotion}
        />
      </main>

      <BagDrawer
        isOpen={isBagOpen}
        items={bagItems}
        onClose={() => setIsBagOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemoveItem}
        onClearBag={handleClearBag}
      />

      {/* Accessible Bag Toast Notification (no transition under reduced motion) */}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-5 right-5 z-65 pointer-events-none"
      >
        {toastMessage && (
          <div className="rw__toast pointer-events-auto flex items-center gap-4 bg-[#141312] text-[#FFFFFF] px-4 py-3 rounded-[3px] shadow-xl text-[13px]">
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => {
                setToastMessage(null);
                setIsBagOpen(true);
              }}
              className="underline underline-offset-4 text-[12px] font-medium whitespace-nowrap shrink-0 cursor-pointer hover:opacity-80"
            >
              Открыть корзину
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
