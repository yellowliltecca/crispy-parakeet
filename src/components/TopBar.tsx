import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { pluralizeRu } from '../data/runwayLooks';

interface TopBarProps {
  bagCount: number;
  onOpenBag: () => void;
  reducedMotion: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  bagCount,
  onOpenBag,
  reducedMotion,
}) => {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <header className="rw-topbar sticky top-0 z-40 h-16 bg-[#F7F6F3]/95 backdrop-blur-sm border-b border-[#E4E1DA]">
      <div className="h-full max-w-[1600px] mx-auto px-5 md:px-10 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#runway"
          onClick={(e) => scrollToSection(e, 'runway')}
          className="font-editorial text-2xl font-medium tracking-[0.06em] text-[#141312] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#141312]"
        >
          MAISON VÉRA
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Основная навигация"
          className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#6B6760]"
        >
          <a
            href="#runway"
            onClick={(e) => scrollToSection(e, 'runway')}
            className="hover:text-[#141312] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Подиум
          </a>
          <a
            href="#looks"
            onClick={(e) => scrollToSection(e, 'looks')}
            className="hover:text-[#141312] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Образы
          </a>
          <a
            href="#atelier"
            onClick={(e) => scrollToSection(e, 'atelier')}
            className="hover:text-[#141312] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Ателье
          </a>
          <a
            href="#sizing"
            onClick={(e) => scrollToSection(e, 'sizing')}
            className="hover:text-[#141312] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Размеры
          </a>
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenBag}
            aria-label={`Открыть корзину, ${bagCount} ${pluralizeRu(bagCount, 'вещь', 'вещи', 'вещей')}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#FFFFFF] bg-[#141312] hover:bg-[#2B2926] rounded-[3px] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141312]"
          >
            <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Корзина</span>
            <span className="tabular-nums opacity-85">({bagCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
