import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, HelpCircle } from 'lucide-react';
import { Person, LineStyle } from '../types';
import PersonCard from './PersonCard';

interface FamilyTreeCanvasProps {
  people: Person[];
  onUpdatePerson: (id: string, updates: Partial<Person>) => void;
  onDeletePerson: (id: string) => void;
  onAddRelation: (id: string, relationType: 'father' | 'mother' | 'spouse' | 'son' | 'daughter' | 'sibling') => void;
  onAddUnconnectedToRow: (generation: number) => void;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
  lineStyle: LineStyle;
  lineColor: string;
  showDates: boolean;
  showTitles: boolean;
}

export default function FamilyTreeCanvas({
  people,
  onUpdatePerson,
  onDeletePerson,
  onAddRelation,
  onAddUnconnectedToRow,
  onMoveLeft,
  onMoveRight,
  lineStyle,
  lineColor,
  showDates,
  showTitles,
}: FamilyTreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Array<{ id: string; d: string; isSpouse: boolean }>>([]);

  // Calculate coordinates and paths for SVG lines
  const updateLines = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines: Array<{ id: string; d: string; isSpouse: boolean }> = [];
    const processedSpouses = new Set<string>();

    people.forEach((person) => {
      const childEl = document.getElementById(`person-card-${person.id}`);
      if (!childEl) return;
      const childRect = childEl.getBoundingClientRect();

      const childX = childRect.left - containerRect.left + childRect.width / 2;
      const childY = childRect.top - containerRect.top;

      // 1. Draw Parent-Child lines
      person.parents.forEach((parentId) => {
        const parentEl = document.getElementById(`person-card-${parentId}`);
        if (!parentEl) return;
        const parentRect = parentEl.getBoundingClientRect();

        const parentX = parentRect.left - containerRect.left + parentRect.width / 2;
        const parentY = parentRect.bottom - containerRect.top;

        let d = '';
        if (lineStyle === 'curved') {
          const midY = (parentY + childY) / 2;
          d = `M ${parentX} ${parentY} C ${parentX} ${midY}, ${childX} ${midY}, ${childX} ${childY}`;
        } else if (lineStyle === 'orthogonal') {
          const midY = (parentY + childY) / 2;
          d = `M ${parentX} ${parentY} L ${parentX} ${midY} L ${childX} ${midY} L ${childX} ${childY}`;
        } else {
          // straight
          d = `M ${parentX} ${parentY} L ${childX} ${childY}`;
        }

        newLines.push({
          id: `line-parent-${parentId}-child-${person.id}`,
          d,
          isSpouse: false,
        });
      });

      // 2. Draw Spouse lines
      person.spouses.forEach((spouseId) => {
        const pairKey = [person.id, spouseId].sort().join('-');
        if (processedSpouses.has(pairKey)) return;
        processedSpouses.add(pairKey);

        const spouseEl = document.getElementById(`person-card-${spouseId}`);
        if (!spouseEl) return;
        const spouseRect = spouseEl.getBoundingClientRect();

        const isCurrentOnLeft = childRect.left < spouseRect.left;
        const leftRect = isCurrentOnLeft ? childRect : spouseRect;
        const rightRect = isCurrentOnLeft ? spouseRect : childRect;

        const x1 = leftRect.right - containerRect.left;
        const y1 = leftRect.top - containerRect.top + leftRect.height / 2;
        const x2 = rightRect.left - containerRect.left;
        const y2 = rightRect.top - containerRect.top + rightRect.height / 2;

        let d = '';
        if (lineStyle === 'orthogonal') {
          d = `M ${x1} ${y1} L ${x2} ${y2}`;
        } else if (lineStyle === 'curved') {
          const midX = (x1 + x2) / 2;
          const offset = Math.min(25, Math.abs(x2 - x1) * 0.15);
          d = `M ${x1} ${y1} Q ${midX} ${y1 + offset} ${x2} ${y2}`;
        } else {
          // straight
          d = `M ${x1} ${y1} L ${x2} ${y2}`;
        }

        newLines.push({
          id: `line-spouse-${pairKey}`,
          d,
          isSpouse: true,
        });
      });
    });

    setLines(newLines);
  };

  // Re-run line updating when elements mount, resize, or wrap
  useEffect(() => {
    updateLines();

    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      updateLines();
    });

    observer.observe(containerRef.current);

    people.forEach((p) => {
      const el = document.getElementById(`person-card-${p.id}`);
      if (el) observer.observe(el);
    });

    window.addEventListener('resize', updateLines);
    window.addEventListener('scroll', updateLines);

    const timer = setTimeout(updateLines, 150);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateLines);
      window.removeEventListener('scroll', updateLines);
      clearTimeout(timer);
    };
  }, [people, lineStyle, showDates, showTitles]);

  // Group people by generation
  const generationsMap: Record<number, Person[]> = {};
  people.forEach((p) => {
    const gen = p.generation;
    if (!generationsMap[gen]) {
      generationsMap[gen] = [];
    }
    generationsMap[gen].push(p);
  });

  // Sort generation indices from smallest (ancestors) to largest (descendants)
  const sortedGenerations = Object.keys(generationsMap)
    .map(Number)
    .sort((a, b) => a - b);

  // Find root generation (usually containing ID 'me', or default 0)
  const hasSelf = people.find((p) => p.id === 'me' || p.title?.toLowerCase() === 'self');
  const rootGenNum = hasSelf ? hasSelf.generation : 0;

  // Utility to label generation
  const getGenLabel = (gen: number) => {
    const diff = gen - rootGenNum;
    if (diff === 0) return 'Core Generation';
    if (diff === -1) return 'Parents';
    if (diff === -2) return 'Grandparents';
    if (diff === -3) return 'Great-Grandparents';
    if (diff < -3) return `Ancestors (Gen ${Math.abs(diff)})`;
    if (diff === 1) return 'Children';
    if (diff === 2) return 'Grandchildren';
    if (diff === 3) return 'Great-Grandchildren';
    return `Descendants (Gen ${diff})`;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full min-h-[600px] bg-[#FEF9F2]/40 rounded-2xl border-3 border-[#2D3436] p-8 overflow-auto select-none shadow-[inset_0px_2px_8px_rgba(45,52,54,0.05)]"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(45, 52, 54, 0.12) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px'
      }}
    >
      {/* SVG Connection Lines Overlay */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ minHeight: '100%', minWidth: '100%' }}
      >
        <defs>
          <marker
            id="spouse-marker"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="4"
            markerHeight="4"
          >
            <circle cx="5" cy="5" r="3" fill="#cbd5e1" />
          </marker>
        </defs>
        
        {lines.map((line) => (
          <motion.path
            key={line.id}
            id={line.id}
            d={line.d}
            fill="none"
            stroke={lineColor}
            strokeWidth={line.isSpouse ? 4 : 3}
            strokeDasharray={line.isSpouse ? '5 4' : 'none'}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.9 }}
            transition={{ duration: 0.4 }}
            style={{ strokeLinecap: 'round' }}
          />
        ))}
      </svg>

      {/* Render Generations as Rows */}
      <div className="relative z-10 flex flex-col space-y-16 items-center min-w-max">
        {people.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#2D3436]/60">
            <HelpCircle size={48} className="mb-3 text-[#1A535C]" />
            <p className="text-sm font-black">Your family tree is currently empty.</p>
            <p className="text-xs mt-1 font-bold text-[#2D3436]/50">Click &quot;Reset Tree&quot; or &quot;Load Demo&quot; to begin!</p>
          </div>
        ) : (
          sortedGenerations.map((genNum) => {
            // Sort members horizontally by sortOrder
            const genPeople = [...generationsMap[genNum]].sort(
              (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
            );

            return (
              <div 
                key={`row-${genNum}`}
                className="flex flex-col items-center w-full"
              >
                {/* Generation Label */}
                <div className="no-export flex items-center space-x-2 mb-4 bg-[#FFE66D] border-2 border-[#2D3436] shadow-[2px_2px_0px_0px_#2D3436] px-3.5 py-1 rounded-xl text-[#2D3436] text-xs font-black select-none">
                  <span className="w-1.5 h-1.5 bg-[#FF6B6B] rounded-full"></span>
                  <span>{getGenLabel(genNum)}</span>
                </div>
                
                {/* Visual Label shown ONLY in export/print (no-export omitted) */}
                <div className="hidden export-only items-center justify-center mb-2 text-[#2D3436] text-xs font-black uppercase tracking-wider">
                  {getGenLabel(genNum)}
                </div>

                {/* People Container */}
                <div className="flex items-center justify-center space-x-8 px-4 py-2 min-h-[140px]">
                  {/* Left Side Add Button (Row-specific) */}
                  <button
                    onClick={() => onAddUnconnectedToRow(genNum)}
                    title={`Add member directly to ${getGenLabel(genNum)}`}
                    className="no-export flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#2D3436] bg-[#4ECDC4] hover:bg-[#3fb8af] text-[#2D3436] shadow-[2px_2px_0px_0px_#2D3436] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#2D3436] active:translate-y-1 active:shadow-none transition-all cursor-pointer shrink-0"
                  >
                    <Plus size={16} className="stroke-[3px]" />
                  </button>

                  <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8">
                    <AnimatePresence mode="popLayout">
                      {genPeople.map((person, index) => (
                        <PersonCard
                          key={person.id}
                          person={person}
                          onUpdate={onUpdatePerson}
                          onDelete={onDeletePerson}
                          onAddRelation={onAddRelation}
                          onMoveLeft={onMoveLeft}
                          onMoveRight={onMoveRight}
                          isFirstInRow={index === 0}
                          isLastInRow={index === genPeople.length - 1}
                          showDates={showDates}
                          showTitles={showTitles}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Right Side Add Button (Row-specific) */}
                  <button
                    onClick={() => onAddUnconnectedToRow(genNum)}
                    title={`Add member directly to ${getGenLabel(genNum)}`}
                    className="no-export flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#2D3436] bg-[#4ECDC4] hover:bg-[#3fb8af] text-[#2D3436] shadow-[2px_2px_0px_0px_#2D3436] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#2D3436] active:translate-y-1 active:shadow-none transition-all cursor-pointer shrink-0"
                  >
                    <Plus size={16} className="stroke-[3px]" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
