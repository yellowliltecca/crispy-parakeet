import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  RUNWAY_LOOKS,
  SIZE_CHART_MENS,
  SIZE_CHART_WOMENS,
  formatCurrency,
  pluralizeRu,
} from '../data/runwayLooks';

interface AtelierAndIndexProps {
  activeLookIndex: number;
  onSelectLook: (index: number) => void;
  reducedMotion: boolean;
}

export const AtelierAndIndex: React.FC<AtelierAndIndexProps> = ({
  activeLookIndex,
  onSelectLook,
  reducedMotion,
}) => {
  const [sizeTab, setSizeTab] = useState<'womens' | 'mens'>('womens');
  const rows = sizeTab === 'womens' ? SIZE_CHART_WOMENS : SIZE_CHART_MENS;

  const handleLookJump = (idx: number) => {
    onSelectLook(idx);
    const runwayEl = document.getElementById('runway');
    if (runwayEl) {
      runwayEl.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <>
      {/* Section 2: Complete Lookbook Index */}
      <section
        id="looks"
        aria-labelledby="looks-heading"
        className="max-w-[1600px] mx-auto px-5 md:px-10 py-16 md:py-24 border-b border-[#E4E1DA]"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[12px] text-[#6B6760]">
              Осень / Зима 2026 · Полный каталог выходов
            </p>
            <h2
              id="looks-heading"
              className="font-editorial text-3xl md:text-4xl font-medium text-[#141312] mt-1 text-balance"
            >
              Пять силуэтов с подиума
            </h2>
          </div>
          <p className="text-[13px] text-[#6B6760] max-w-md">
            Выберите любой силуэт, чтобы открыть его на подиуме, изучить метки на изделиях и зарезервировать отдельные вещи или образ целиком.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6">
          {RUNWAY_LOOKS.map((look, idx) => {
            const lookTotal = look.items.reduce((sum, item) => sum + item.price, 0);
            const isCurrent = idx === activeLookIndex;
            return (
              <button
                key={look.id}
                type="button"
                onClick={() => handleLookJump(idx)}
                className={`group text-left flex flex-col bg-[#FFFFFF] border rounded-[3px] overflow-hidden transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141312] ${
                  isCurrent ? 'border-[#141312]' : 'border-[#E4E1DA] hover:border-[#9E9990]'
                }`}
              >
                <div className="relative aspect-[3/4] w-full bg-[#F4F2EE] overflow-hidden">
                  <img
                    src={look.image}
                    alt={look.alt}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-3.5 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px] text-[#6B6760] tabular-nums">
                    <span>Образ {String(look.number).padStart(2, '0')}</span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 text-[#141312] opacity-60 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="font-editorial text-xl font-medium text-[#141312] leading-tight">
                    {look.title}
                  </span>
                  <span className="text-[12px] text-[#6B6760] tabular-nums mt-0.5">
                    {look.items.length}{' '}
                    {pluralizeRu(look.items.length, 'вещь', 'вещи', 'вещей')} ·{' '}
                    {formatCurrency(lookTotal)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 3: Atelier Craft & Sizing Guide */}
      <section
        id="atelier"
        className="max-w-[1600px] mx-auto px-5 md:px-10 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20"
      >
        {/* Left: Atelier Material Provenance */}
        <div className="space-y-8">
          <div>
            <p className="text-[12px] text-[#6B6760]">
              Парижское ателье · Рю Сент-Оноре
            </p>
            <h2 className="font-editorial text-3xl md:text-4xl font-medium text-[#141312] mt-1 text-balance">
              Происхождение тканей и мастерство кроя
            </h2>
            <p className="text-[14px] text-[#6B6760] leading-relaxed mt-3 max-w-xl">
              Каждый силуэт коллекции Осень / Зима 2026 отшивается ограниченной серией из натуральных волокон мануфактур Биеллы, Лиона и Каталонии с ручной обработкой внутренних швов.
            </p>
          </div>

          <dl className="divide-y divide-[#E4E1DA] border-t border-b border-[#E4E1DA]">
            <div className="py-4 grid grid-cols-[150px_1fr] gap-4 text-[13px]">
              <dt className="font-medium text-[#141312]">Костюмная шерсть</dt>
              <dd className="text-[#6B6760]">
                Двусторонняя шерсть вирджин 420 г/м² и ткань grain de poudre на свободной бортовке из конского волоса.
              </dd>
            </div>
            <div className="py-4 grid grid-cols-[150px_1fr] gap-4 text-[13px]">
              <dt className="font-medium text-[#141312]">Тяжёлый шёлк</dt>
              <dd className="text-[#6B6760]">
                Шёлк малбери плотностью 40 момми из Комо, драпируемый вручную на манекене перед раскроем.
              </dd>
            </div>
            <div className="py-4 grid grid-cols-[150px_1fr] gap-4 text-[13px]">
              <dt className="font-medium text-[#141312]">Кожа и овчина</dt>
              <dd className="text-[#6B6760]">
                Тосканская телячья кожа растительного дубления и двусторонняя испанская овчина.
              </dd>
            </div>
            <div className="py-4 grid grid-cols-[150px_1fr] gap-4 text-[13px]">
              <dt className="font-medium text-[#141312]">Подгонка в ателье</dt>
              <dd className="text-[#6B6760]">
                Бесплатная корректировка длины рукавов и брюк включена в каждый подиумный заказ.
              </dd>
            </div>
          </dl>
        </div>

        {/* Right: Interactive Size Conversion Chart */}
        <div id="sizing" className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[12px] text-[#6B6760]">Таблица соответствия</p>
              <h2 className="font-editorial text-3xl font-medium text-[#141312] mt-1">
                Размерная сетка
              </h2>
            </div>

            <div
              role="tablist"
              aria-label="Категория размерной сетки"
              className="inline-flex items-center p-1 bg-[#EFECE6] rounded-[4px]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={sizeTab === 'womens'}
                onClick={() => setSizeTab('womens')}
                className={`px-3.5 py-1.5 text-[12px] font-medium rounded-[3px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  sizeTab === 'womens'
                    ? 'bg-[#FFFFFF] text-[#141312] shadow-xs'
                    : 'text-[#6B6760] hover:text-[#141312]'
                }`}
              >
                Женская линия
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={sizeTab === 'mens'}
                onClick={() => setSizeTab('mens')}
                className={`px-3.5 py-1.5 text-[12px] font-medium rounded-[3px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  sizeTab === 'mens'
                    ? 'bg-[#FFFFFF] text-[#141312] shadow-xs'
                    : 'text-[#6B6760] hover:text-[#141312]'
                }`}
              >
                Мужская линия
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#E4E1DA] rounded-[3px] bg-[#FFFFFF]">
            <table className="w-full text-left border-collapse text-[13px] tabular-nums">
              <thead>
                <tr className="border-b border-[#E4E1DA] bg-[#FAF9F6] text-[12px] text-[#6B6760]">
                  <th className="py-3 px-4 font-medium">Ателье</th>
                  <th className="py-3 px-4 font-medium">RU</th>
                  <th className="py-3 px-4 font-medium">EU</th>
                  <th className="py-3 px-4 font-medium">US</th>
                  <th className="py-3 px-4 font-medium">Грудь (см)</th>
                  <th className="py-3 px-4 font-medium">Талия (см)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E1DA]">
                {rows.map((row) => (
                  <tr key={row.atelier} className="hover:bg-[#FAF9F6]">
                    <td className="py-3 px-4 font-medium text-[#141312]">{row.atelier}</td>
                    <td className="py-3 px-4 font-medium text-[#141312]">{row.ru}</td>
                    <td className="py-3 px-4 text-[#6B6760]">{row.eu}</td>
                    <td className="py-3 px-4 text-[#6B6760]">{row.us}</td>
                    <td className="py-3 px-4 text-[#6B6760]">{row.chestCm}</td>
                    <td className="py-3 px-4 text-[#6B6760]">{row.waistCm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-[#6B6760]">
            Верхняя одежда скроена с архитектурным запасом для свободной посадки поверх трикотажа и жакетов. Рекомендуем выбирать свой привычный размер.
          </p>
        </div>
      </section>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#E4E1DA] bg-[#F7F6F3]">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[12px] text-[#6B6760]">
          <span className="font-editorial text-lg text-[#141312] tracking-[0.06em]">
            MAISON VÉRA
          </span>
          <div className="flex flex-wrap items-center gap-6">
            <span>Париж · Москва · Милан</span>
            <span>Бесплатная курьерская доставка</span>
            <span>© 2026 Maison Véra</span>
          </div>
        </div>
      </footer>
    </>
  );
};
