import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Plus,
  Maximize2,
  Check,
} from 'lucide-react';
import {
  GarmentItem,
  RUNWAY_LOOKS,
  RunwayLook,
  formatCurrency,
  pluralizeRu,
} from '../data/runwayLooks';
import { detectFootOffset } from '../utils/feetDetection';
import { SizePickerContent } from './SizePickerContent';
import { LookPopupModal } from './LookPopupModal';

interface RunwaySectionProps {
  activeLookIndex: number;
  onChangeLookIndex: (index: number) => void;
  reducedMotion: boolean;
  onAddItem: (item: GarmentItem, size: string, look: RunwayLook) => void;
  onAddCompleteLook: (
    look: RunwayLook,
    selections: { item: GarmentItem; size: string }[]
  ) => void;
}

const AUTOPLAY_MS = 6500;

function shortestCircularDiff(index: number, target: number, total: number): number {
  let diff = index - target;
  while (diff > total / 2) diff -= total;
  while (diff < -total / 2) diff += total;
  return diff;
}

export const RunwaySection: React.FC<RunwaySectionProps> = ({
  activeLookIndex,
  onChangeLookIndex,
  reducedMotion,
  onAddItem,
  onAddCompleteLook,
}) => {
  const totalLooks = RUNWAY_LOOKS.length;
  const currentLook = RUNWAY_LOOKS[activeLookIndex];

  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const heroArtRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const actorElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const walkIndicatorRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const cursorRef = useRef<HTMLDivElement | null>(null);

  // Reveal state (immediate in reduced motion)
  const [isRevealed, setIsRevealed] = useState<boolean>(reducedMotion);

  // Autoplay state (does not start automatically under reduced motion)
  const [isAutoplaying, setIsAutoplaying] = useState<boolean>(!reducedMotion);
  const [isStageHovered, setIsStageHovered] = useState(false);
  const [autoplayProgress, setAutoplayProgress] = useState(0);

  // Feet detection offsets per look id
  const [footOffsets, setFootOffsets] = useState<Record<string, number>>({});

  // Interactive pin & row highlight state
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  // Open picker state (single open picker at a time)
  const [openPickerId, setOpenPickerId] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  // Viewport tracking for mobile sheet (< 750px)
  const [isMobileSheetViewport, setIsMobileSheetViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 750 : false
  );
  const [sheetHost, setSheetHost] = useState<HTMLDivElement | null>(null);

  // Look popup lightbox state
  const [popupLook, setPopupLook] = useState<RunwayLook | null>(null);
  const [popupOriginRect, setPopupOriginRect] = useState<DOMRect | null>(null);

  // Complete-look bundle feedback
  const [bundleStatus, setBundleStatus] = useState<string>('');
  const [bundleAdded, setBundleAdded] = useState(false);
  const bundleTimerRef = useRef<number | null>(null);

  // Custom stage cursor label & visibility
  const [cursorLabel, setCursorLabel] = useState<string>('Детали');
  const [cursorVisible, setCursorVisible] = useState(false);
  const cursorTargetRef = useRef({ x: 0, y: 0 });
  const cursorPosRef = useRef({ x: 0, y: 0 });

  // Drag / swipe tracking
  const dragStartXRef = useRef<number | null>(null);
  const dragDeltaXRef = useRef<number>(0);

  // Spring physics refs for runway ring & walk line
  const ringPosRef = useRef<number>(activeLookIndex);
  const ringVelRef = useRef<number>(0);
  const targetLookRef = useRef<number>(activeLookIndex);

  // Live announcement text
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  // Keep targetLookRef synced
  useEffect(() => {
    targetLookRef.current = activeLookIndex;
    setOpenPickerId(null);
    setHighlightedItemId(null);
    setBundleStatus('');
    setBundleAdded(false);
    setAutoplayProgress(0);
    setLiveAnnouncement(
      `Образ ${currentLook.number} из ${totalLooks}: ${currentLook.title} — ${currentLook.items.length} ${pluralizeRu(currentLook.items.length, 'вещь', 'вещи', 'вещей')}`
    );
  }, [activeLookIndex, currentLook.items.length, currentLook.number, currentLook.title, totalLooks]);

  // Create and manage dedicated sheet host (and clean removal on unmount)
  useEffect(() => {
    const host = document.createElement('div');
    host.className = 'rw-sheet-host';
    document.body.appendChild(host);
    setSheetHost(host);

    return () => {
      if (host.parentNode) {
        host.parentNode.removeChild(host);
      }
      setSheetHost(null);
    };
  }, []);

  // Breakpoint listener: growing past 749px automatically re-docks pickers inline
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 750px)');
    const handleChange = () => {
      setIsMobileSheetViewport(!mq.matches);
    };
    handleChange();
    mq.addEventListener('change', handleChange);
    return () => {
      mq.removeEventListener('change', handleChange);
    };
  }, []);

  // Reduced-motion sync for reveal & autoplay
  useEffect(() => {
    if (reducedMotion) {
      setIsRevealed(true);
      setIsAutoplaying(false);
    }
  }, [reducedMotion]);

  // IntersectionObserver for section entrance reveal
  useEffect(() => {
    if (reducedMotion || isRevealed) return;
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [reducedMotion, isRevealed]);

  // Feet detection via 48px offscreen canvas for every look's data-probe image
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      RUNWAY_LOOKS.map(async (look) => {
        const offset = await detectFootOffset(look.probeImage);
        return [look.id, offset] as const;
      })
    ).then((entries) => {
      if (cancelled) return;
      const next: Record<string, number> = {};
      for (const [id, offset] of entries) {
        next[id] = offset;
      }
      setFootOffsets(next);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Escape key closes open picker (both inline and mobile sheet)
  useEffect(() => {
    if (!openPickerId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpenPickerId(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openPickerId]);

  // Cleanup bundle timer on unmount
  useEffect(() => {
    return () => {
      if (bundleTimerRef.current !== null) {
        window.clearTimeout(bundleTimerRef.current);
      }
    };
  }, []);

  // Step navigation helpers
  const goToLook = useCallback(
    (nextIndex: number) => {
      const wrapped = ((nextIndex % totalLooks) + totalLooks) % totalLooks;
      onChangeLookIndex(wrapped);
    },
    [onChangeLookIndex, totalLooks]
  );

  const stepPrev = useCallback(() => goToLook(activeLookIndex - 1), [activeLookIndex, goToLook]);
  const stepNext = useCallback(() => goToLook(activeLookIndex + 1), [activeLookIndex, goToLook]);

  // Autoplay loop (pauses on hover, picking, popup open, or reduced motion)
  useEffect(() => {
    if (!isAutoplaying || reducedMotion || isStageHovered || openPickerId || popupLook) {
      return;
    }

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const ratio = Math.min(1, elapsed / AUTOPLAY_MS);
      setAutoplayProgress(ratio);
      if (elapsed >= AUTOPLAY_MS) {
        goToLook(activeLookIndex + 1);
      } else {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [
    isAutoplaying,
    reducedMotion,
    isStageHovered,
    openPickerId,
    popupLook,
    activeLookIndex,
    goToLook,
  ]);

  // Ring & Walk-line spring physics rAF loop (snaps immediately under reduced motion)
  useEffect(() => {
    let rafId = 0;

    const applyPositions = (pos: number) => {
      const stageWidth = stageRef.current?.clientWidth ?? 900;
      const spread = Math.min(340, Math.max(210, stageWidth * 0.36));

      RUNWAY_LOOKS.forEach((_, idx) => {
        const el = actorElsRef.current[idx];
        if (!el) return;

        // Continuous shortest wrapped distance from pos
        let diff = idx - pos;
        while (diff > totalLooks / 2) diff -= totalLooks;
        while (diff < -totalLooks / 2) diff += totalLooks;

        const abs = Math.abs(diff);
        const tx = diff * spread;
        const scale = Math.max(0.72, 1 - abs * 0.16);
        const ty = Math.min(28, abs * 14);
        const opacity = abs > 1.75 ? 0 : Math.max(0.22, 1 - abs * 0.46);
        const zIndex = Math.round(10 - abs * 3);

        el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.zIndex = String(zIndex);
        el.style.pointerEvents = abs < 1.35 ? 'auto' : 'none';
      });

      if (walkIndicatorRef.current && stageRef.current) {
        const trackW = stageRef.current.clientWidth * 0.88 - 72;
        const normalized = (((pos % totalLooks) + totalLooks) % totalLooks) / Math.max(1, totalLooks - 1);
        const x = stageRef.current.clientWidth * 0.06 + normalized * Math.max(0, trackW);
        walkIndicatorRef.current.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
      }
    };

    if (reducedMotion) {
      ringPosRef.current = activeLookIndex;
      ringVelRef.current = 0;
      applyPositions(activeLookIndex);
      return;
    }

    const stiffness = 0.095;
    const damping = 0.78;
    let running = true;

    const step = () => {
      if (!running) return;
      const target = targetLookRef.current;
      // Find shortest angular path to target
      const delta = shortestCircularDiff(target, ringPosRef.current, totalLooks);
      ringVelRef.current = (ringVelRef.current + delta * stiffness) * damping;
      ringPosRef.current += ringVelRef.current;

      // Normalize ringPosRef gently
      if (Math.abs(delta) < 0.0008 && Math.abs(ringVelRef.current) < 0.0008) {
        ringPosRef.current = target;
        ringVelRef.current = 0;
        applyPositions(ringPosRef.current);
        return;
      }

      applyPositions(ringPosRef.current);
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);

    const handleResize = () => applyPositions(ringPosRef.current);
    window.addEventListener('resize', handleResize);

    return () => {
      running = false;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeLookIndex, reducedMotion, totalLooks]);

  // Custom stage cursor ring rAF loop (lerp = 1 in reduced motion)
  useEffect(() => {
    if (!cursorVisible) return;
    let rafId = 0;
    const lerpFactor = reducedMotion ? 1 : 0.18;

    const animateCursor = () => {
      cursorPosRef.current.x +=
        (cursorTargetRef.current.x - cursorPosRef.current.x) * lerpFactor;
      cursorPosRef.current.y +=
        (cursorTargetRef.current.y - cursorPosRef.current.y) * lerpFactor;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorPosRef.current.x.toFixed(1)}px, ${cursorPosRef.current.y.toFixed(1)}px, 0)`;
      }
      rafId = window.requestAnimationFrame(animateCursor);
    };

    rafId = window.requestAnimationFrame(animateCursor);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [cursorVisible, reducedMotion]);

  // Keyboard navigation on stage carousel
  const handleStageKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepPrev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToLook(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToLook(totalLooks - 1);
    }
  };

  // Pointer swipe on stage
  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragStartXRef.current = e.clientX;
    dragDeltaXRef.current = 0;
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') {
      cursorTargetRef.current = { x: e.clientX, y: e.clientY };
      if (!cursorVisible) {
        cursorPosRef.current = { x: e.clientX, y: e.clientY };
        setCursorVisible(true);
      }
    }
    if (dragStartXRef.current !== null) {
      dragDeltaXRef.current = e.clientX - dragStartXRef.current;
    }
  };

  const handleStagePointerUp = () => {
    if (dragStartXRef.current !== null) {
      const dx = dragDeltaXRef.current;
      dragStartXRef.current = null;
      dragDeltaXRef.current = 0;
      if (Math.abs(dx) > 48) {
        if (dx < 0) stepNext();
        else stepPrev();
      }
    }
  };

  const openLookPopup = (look: RunwayLook) => {
    const heroNode = heroArtRefs.current[look.id];
    setPopupOriginRect(heroNode ? heroNode.getBoundingClientRect() : null);
    setPopupLook(look);
    setOpenPickerId(null);
  };

  const handlePinClick = (item: GarmentItem) => {
    setHighlightedItemId(item.id);
    setOpenPickerId(item.id);
    const rowEl = rowRefs.current[item.id];
    if (rowEl) {
      rowEl.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  };

  const handleCompleteLookAdd = () => {
    const selections = currentLook.items.map((item) => {
      const chosen =
        selectedSizes[item.id] ??
        item.sizes.find((s) => !s.soldOut)?.label ??
        item.sizes[0].label;
      return { item, size: chosen };
    });

    onAddCompleteLook(currentLook, selections);
    setBundleAdded(true);
    setBundleStatus(
      `Все ${currentLook.items.length} ${pluralizeRu(currentLook.items.length, 'вещь', 'вещи', 'вещей')} из образа ${String(currentLook.number).padStart(2, '0')} добавлены в корзину`
    );

    if (
      !reducedMotion &&
      typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function'
    ) {
      try {
        navigator.vibrate([12, 30, 12]);
      } catch {
        // Ignore haptic errors
      }
    }

    if (bundleTimerRef.current !== null) {
      window.clearTimeout(bundleTimerRef.current);
    }
    bundleTimerRef.current = window.setTimeout(() => {
      setBundleAdded(false);
    }, 1800);
  };

  const activeSheetItem =
    isMobileSheetViewport && openPickerId
      ? currentLook.items.find((i) => i.id === openPickerId) ?? null
      : null;

  const isSheetOpen = Boolean(activeSheetItem);
  const lookBundleTotal = currentLook.items.reduce((sum, i) => sum + i.price, 0);

  return (
    <section
      id="runway"
      ref={sectionRef}
      aria-label="Показ Осень / Зима 2026"
      className={`rw ${isRevealed ? 'is-revealed' : ''} ${isSheetOpen ? 'rw--picking' : ''}`}
    >
      {/* Polite live region announcing look changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      <div className="rw__grid">
        {/* LEFT COLUMN: RUNWAY STAGE */}
        <div
          className="rw__stage-col"
          onMouseEnter={() => setIsStageHovered(true)}
          onMouseLeave={() => {
            setIsStageHovered(false);
            setCursorVisible(false);
          }}
        >
          {/* Editorial Stage Header */}
          <div className="rw__head">
            <div>
              <p className="text-[12px] text-[#6B6760] mb-1.5 tabular-nums">
                Осень / Зима 2026 · Показ в Париже · Образ{' '}
                {String(currentLook.number).padStart(2, '0')} /{' '}
                {String(totalLooks).padStart(2, '0')}
              </p>
              <h1 className="rw__title">Архитектурная тишина</h1>
            </div>
            <p className="rw__sub">
              Нажмите на метку на силуэте, чтобы выбрать размер прямо с подиума, или кликните по образу для детального просмотра.
            </p>
          </div>

          {/* Focusable Carousel Stage */}
          <div
            ref={stageRef}
            tabIndex={0}
            role="region"
            aria-roledescription="карусель"
            aria-label="Образы показа Осень / Зима 2026"
            onKeyDown={handleStageKeyDown}
            onPointerDown={handleStagePointerDown}
            onPointerMove={handleStagePointerMove}
            onPointerUp={handleStagePointerUp}
            onPointerCancel={handleStagePointerUp}
            className="rw__stage"
          >
            {/* Floor walk line & dynamic indicator */}
            <div className="rw__walk-line" aria-hidden="true" />
            <div ref={walkIndicatorRef} className="rw__walk-indicator" aria-hidden="true" />

            {/* Runway Actors Ring */}
            <div className="rw__actors">
              {RUNWAY_LOOKS.map((look, idx) => {
                const isHero = idx === activeLookIndex;
                const footOffset = footOffsets[look.id] ?? 0;
                const diff = shortestCircularDiff(idx, activeLookIndex, totalLooks);

                return (
                  <div
                    key={look.id}
                    ref={(el) => {
                      actorElsRef.current[idx] = el;
                    }}
                    className={`rw__actor ${isHero ? 'rw__actor--hero' : 'rw__actor--side'}`}
                    style={{ '--rw-foot': footOffset } as React.CSSProperties}
                    onMouseEnter={() => {
                      if (isHero) setCursorLabel('Детали');
                      else setCursorLabel(diff < 0 ? 'Назад' : 'Далее');
                    }}
                    onClick={() => {
                      if (Math.abs(dragDeltaXRef.current) > 12) return;
                      if (isHero) {
                        openLookPopup(look);
                      } else {
                        goToLook(idx);
                      }
                    }}
                  >
                    <div
                      ref={(el) => {
                        heroArtRefs.current[look.id] = el;
                      }}
                      className="rw__art-frame"
                    >
                      <img
                        src={look.image}
                        data-probe={look.probeImage}
                        alt={look.alt}
                        referrerPolicy="no-referrer"
                        draggable={false}
                        className="rw__art"
                      />

                      {/* Interactive Garment Pins on Active Hero */}
                      {isHero &&
                        look.items.map((item, pinIdx) => {
                          const isHighlighted =
                            highlightedItemId === item.id || openPickerId === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              aria-label={`Выбрать «${item.name}», ${formatCurrency(item.price)}`}
                              style={{
                                left: `${item.pinX}%`,
                                top: `${item.pinY}%`,
                                animationDelay: reducedMotion ? '0ms' : `${pinIdx * 75}ms`,
                              }}
                              className={`rw__pin ${isHighlighted ? 'is-active' : ''} ${
                                item.pinX > 56 ? 'rw__pin--left-tag' : ''
                              }`}
                              onMouseEnter={(e) => {
                                e.stopPropagation();
                                setHighlightedItemId(item.id);
                                setCursorLabel(item.category);
                              }}
                              onMouseLeave={() => {
                                setHighlightedItemId(null);
                                setCursorLabel('Детали');
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePinClick(item);
                              }}
                            >
                              <span className="rw__pin-dot" />
                              {isHighlighted && (
                                <span className="rw__pin-tag">
                                  {item.name} · {formatCurrency(item.price)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subtle Inspect Button for keyboard & touch discoverability */}
            <button
              type="button"
              onClick={() => openLookPopup(currentLook)}
              aria-label={`Рассмотреть образ ${currentLook.number}: ${currentLook.title} на весь экран`}
              className="absolute bottom-9 right-6 z-15 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-[#141312] bg-[#FFFFFF]/90 hover:bg-[#141312] hover:text-[#FFFFFF] border border-[#E4E1DA] rounded-[2px] transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141312]"
            >
              <Maximize2 className="w-3 h-3" aria-hidden="true" />
              <span>Рассмотреть образ</span>
            </button>
          </div>

          {/* Stage Controls: Ticks, Prev/Next, Autoplay */}
          <div className="rw__controls">
            <div className="rw__ticks" role="tablist" aria-label="Образы показа">
              {RUNWAY_LOOKS.map((look, idx) => {
                const isActive = idx === activeLookIndex;
                return (
                  <button
                    key={look.id}
                    type="button"
                    aria-current={isActive ? 'true' : undefined}
                    aria-label={`Образ ${look.number}: ${look.title}`}
                    onClick={() => goToLook(idx)}
                    className="rw__tick focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141312]"
                  >
                    {isActive ? (
                      <span className="rw__tick-name tabular-nums">
                        {String(look.number).padStart(2, '0')} · {look.title}
                      </span>
                    ) : (
                      <span className="text-[11px] tabular-nums">
                        {String(look.number).padStart(2, '0')}
                      </span>
                    )}
                    {isActive && (
                      <span
                        className="rw__tick-bar"
                        style={{
                          transform: `scaleX(${
                            isAutoplaying && !reducedMotion && !isStageHovered && !openPickerId && !popupLook
                              ? Math.max(0.06, autoplayProgress)
                              : 1
                          })`,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="rw__hint hidden xl:inline mr-2">Клавиши ← →</span>
              <button
                type="button"
                onClick={stepPrev}
                aria-label="Предыдущий образ"
                className="rw__icon-btn focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141312]"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={stepNext}
                aria-label="Следующий образ"
                className="rw__icon-btn focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141312]"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-pressed={isAutoplaying}
                aria-label={
                  isAutoplaying ? 'Остановить автопрокрутку показа' : 'Запустить автопрокрутку показа'
                }
                onClick={() => setIsAutoplaying((prev) => !prev)}
                className="rw__icon-btn focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141312]"
              >
                {isAutoplaying ? (
                  <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Play className="w-3.5 h-3.5 translate-x-[0.5px]" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SHOP THE LOOK PANEL */}
        <aside className="rw__panel" aria-label={`Вещи в образе ${currentLook.number}`}>
          {/* Desktop Panel Header */}
          <div className="rw__phead">
            <div className="flex items-center justify-between text-[12px] text-[#6B6760] tabular-nums">
              <span>Образ {String(currentLook.number).padStart(2, '0')}</span>
              <span>
                {currentLook.items.length}{' '}
                {pluralizeRu(currentLook.items.length, 'вещь', 'вещи', 'вещей')}
              </span>
            </div>
            <h2 className="font-editorial text-[32px] leading-[1.08] font-medium text-[#141312] mt-1.5">
              {currentLook.title}
            </h2>
            <p className="text-[13px] text-[#6B6760] mt-2 leading-relaxed">
              {currentLook.subtitle}
            </p>
          </div>

          {/* Mobile Panel Header (< 750px) */}
          <div className="rw__mhead">
            <div>
              <p className="text-[11px] text-[#6B6760] tabular-nums">
                Образ {String(currentLook.number).padStart(2, '0')} · {currentLook.items.length}{' '}
                {pluralizeRu(currentLook.items.length, 'вещь', 'вещи', 'вещей')}
              </p>
              <h2 className="font-editorial text-2xl font-medium text-[#141312]">
                {currentLook.title}
              </h2>
            </div>
            <span className="text-[11px] text-[#6B6760]">Листайте вещи</span>
          </div>

          {/* Product Items List (vertical on desktop, horizontal snap on mobile) */}
          <div className="rw__items">
            {currentLook.items.map((item, idx) => {
              const pickerId = `rw-picker-${item.id}`;
              const isOpen = openPickerId === item.id;
              const isHighlighted = highlightedItemId === item.id || isOpen;

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    rowRefs.current[item.id] = el;
                  }}
                  style={{
                    animationDelay: reducedMotion ? '0ms' : `${idx * 55}ms`,
                  }}
                  onMouseEnter={() => setHighlightedItemId(item.id)}
                  onMouseLeave={() => setHighlightedItemId(null)}
                  className={`rw__row ${isHighlighted ? 'is-highlighted' : ''}`}
                >
                  <div className="rw__row-main">
                    {/* Thumbnail link: aria-hidden & tabindex -1 per Spec Section 14 */}
                    <a
                      href={`#${item.id}`}
                      aria-hidden="true"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenPickerId(isOpen ? null : item.id);
                      }}
                      className="rw__thumb-link"
                    >
                      <img
                        src={currentLook.image}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="rw__thumb-img"
                        style={
                          {
                            objectPosition: item.cropPosition,
                            transformOrigin: item.cropPosition,
                            '--rw-crop-scale': item.cropScale ?? 1,
                          } as React.CSSProperties
                        }
                      />
                    </a>

                    {/* Focusable Product Name Link + Clean Unboxed Metadata */}
                    <div className="min-w-0">
                      <p className="text-[11px] text-[#6B6760] truncate">
                        {item.category} · {item.color}
                      </p>
                      <a
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenPickerId(isOpen ? null : item.id);
                        }}
                        className="rw__name-link leading-snug focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141312]"
                      >
                        {item.name}
                      </a>
                      <p className="text-[13px] font-medium text-[#141312] tabular-nums mt-1">
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    {/* Plus Button with aria-expanded and aria-controls */}
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={pickerId}
                      aria-label={
                        isOpen
                          ? `Закрыть выбор размера для «${item.name}»`
                          : `Выбрать размер для «${item.name}»`
                      }
                      onClick={() => setOpenPickerId(isOpen ? null : item.id)}
                      className="rw__plus-btn focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141312]"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Desktop Inline Size Picker (>= 750px) */}
                  {isOpen && !isMobileSheetViewport && (
                    <div className="rw__picker-inline">
                      <SizePickerContent
                        item={item}
                        pickerId={pickerId}
                        selectedSize={selectedSizes[item.id] ?? null}
                        onSelectSize={(size) =>
                          setSelectedSizes((prev) => ({ ...prev, [item.id]: size }))
                        }
                        onConfirmAdd={(garment, size) => onAddItem(garment, size, currentLook)}
                        onClose={() => setOpenPickerId(null)}
                        reducedMotion={reducedMotion}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Complete Look Bundle Bar */}
          <div className="rw__bundle">
            <div className="flex items-baseline justify-between gap-4 mb-3">
              <div>
                <p className="text-[11px] text-[#6B6760]">
                  Весь силуэт · {currentLook.items.length}{' '}
                  {pluralizeRu(currentLook.items.length, 'вещь', 'вещи', 'вещей')}
                </p>
                <p className="text-[13px] font-medium text-[#141312] mt-0.5">
                  Образ {String(currentLook.number).padStart(2, '0')} — {currentLook.title}
                </p>
              </div>
              <span className="font-editorial text-2xl font-medium text-[#141312] tabular-nums shrink-0">
                {formatCurrency(lookBundleTotal)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCompleteLookAdd}
              className={`rw__cta w-full min-h-[46px] px-4 py-2.5 rounded-[3px] text-[13px] font-medium flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141312] ${
                bundleAdded
                  ? 'bg-[#213B2A] text-[#FFFFFF]'
                  : 'bg-[#141312] hover:bg-[#2B2926] text-[#FFFFFF]'
              }`}
            >
              {bundleAdded ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Весь образ добавлен</span>
                </>
              ) : (
                <span>Добавить весь образ в корзину</span>
              )}
              <span className="sr-only">
                {' '}
                — Образ {currentLook.number}: {currentLook.title}
              </span>
            </button>

            <div role="status" aria-live="polite" className="min-h-[18px] mt-2 text-[12px]">
              {bundleStatus && (
                <p className="rw__msg text-[#141312]">{bundleStatus}</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Custom Desktop Stage Cursor Ring */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className={`rw__cursor hidden lg:flex ${cursorVisible && !popupLook ? 'is-visible' : ''}`}
      >
        <span>{cursorLabel}</span>
      </div>

      {/* Mobile Bottom Sheet Portal (< 750px, docks inline if viewport > 749px) */}
      {sheetHost &&
        activeSheetItem &&
        createPortal(
          <>
            <div
              className="rw__scrim"
              aria-hidden="true"
              onClick={() => setOpenPickerId(null)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Выбор размера для «${activeSheetItem.name}»`}
              className="rw__sheet"
            >
              <SizePickerContent
                item={activeSheetItem}
                pickerId={`rw-picker-${activeSheetItem.id}`}
                selectedSize={selectedSizes[activeSheetItem.id] ?? null}
                onSelectSize={(size) =>
                  setSelectedSizes((prev) => ({
                    ...prev,
                    [activeSheetItem.id]: size,
                  }))
                }
                onConfirmAdd={(garment, size) => onAddItem(garment, size, currentLook)}
                onClose={() => setOpenPickerId(null)}
                isSheet
                reducedMotion={reducedMotion}
              />
            </div>
          </>,
          sheetHost
        )}

      {/* Full-Screen Look Inspection Popup */}
      <LookPopupModal
        look={popupLook}
        originRect={popupOriginRect}
        footOffset={popupLook ? footOffsets[popupLook.id] ?? 0 : 0}
        reducedMotion={reducedMotion}
        onClose={() => setPopupLook(null)}
        onAddItem={(item, size) => {
          if (popupLook) onAddItem(item, size, popupLook);
        }}
      />
    </section>
  );
};
