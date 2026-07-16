import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Trash2, ArrowLeft, ArrowRight, Palette, 
  Calendar, Check, User, Heart, ShieldAlert 
} from 'lucide-react';
import { Person } from '../types';

interface PersonCardProps {
  key?: string;
  person: Person;
  onUpdate: (id: string, updates: Partial<Person>) => void;
  onDelete: (id: string) => void;
  onAddRelation: (id: string, relationType: 'father' | 'mother' | 'spouse' | 'son' | 'daughter' | 'sibling') => void;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
  isFirstInRow: boolean;
  isLastInRow: boolean;
  showDates: boolean;
  showTitles: boolean;
}

const THEME_STYLES = {
  slate: {
    bg: 'bg-white hover:bg-slate-50/50',
    border: 'border-3 border-[#2D3436]',
    shadow: 'shadow-[6px_6px_0px_0px_rgba(45,52,54,0.15)] hover:shadow-[8px_8px_0px_0px_rgba(45,52,54,1)]',
    accent: 'bg-[#2D3436] text-white border-2 border-[#2D3436]',
    ring: 'focus-within:ring-slate-100',
    badge: 'bg-slate-100 text-slate-800 border-2 border-[#2D3436]',
    input: 'text-[#2D3436]',
    meta: 'text-slate-500',
  },
  blue: {
    bg: 'bg-white hover:bg-slate-50/50',
    border: 'border-4 border-[#4ECDC4]',
    shadow: 'shadow-[6px_6px_0px_0px_rgba(78,205,196,0.25)] hover:shadow-[10px_10px_0px_0px_rgba(78,205,196,1)]',
    accent: 'bg-[#4ECDC4] text-white border-2 border-[#2D3436] hover:bg-[#3fb8af]',
    ring: 'focus-within:ring-teal-100',
    badge: 'bg-[#4ECDC4]/10 text-[#4ECDC4] border-2 border-[#4ECDC4]',
    input: 'text-[#2D3436]',
    meta: 'text-slate-500',
  },
  rose: {
    bg: 'bg-white hover:bg-slate-50/50',
    border: 'border-4 border-[#FF6B6B]',
    shadow: 'shadow-[6px_6px_0px_0px_rgba(255,107,107,0.25)] hover:shadow-[10px_10px_0px_0px_rgba(255,107,107,1)]',
    accent: 'bg-[#FF6B6B] text-white border-2 border-[#2D3436] hover:bg-[#ff5252]',
    ring: 'focus-within:ring-red-100',
    badge: 'bg-[#FF6B6B]/10 text-[#FF6B6B] border-2 border-[#FF6B6B]',
    input: 'text-[#2D3436]',
    meta: 'text-slate-500',
  },
  amber: {
    bg: 'bg-white hover:bg-slate-50/50',
    border: 'border-4 border-[#FFE66D]',
    shadow: 'shadow-[6px_6px_0px_0px_rgba(255,230,109,0.25)] hover:shadow-[10px_10px_0px_0px_rgba(255,230,109,1)]',
    accent: 'bg-[#FFE66D] text-[#2D3436] border-2 border-[#2D3436] hover:bg-[#ffd73d]',
    ring: 'focus-within:ring-yellow-100',
    badge: 'bg-[#FFE66D]/20 text-[#cca600] border-2 border-[#FFE66D]',
    input: 'text-[#2D3436]',
    meta: 'text-slate-500',
  },
  emerald: {
    bg: 'bg-white hover:bg-slate-50/50',
    border: 'border-4 border-[#1A535C]',
    shadow: 'shadow-[6px_6px_0px_0px_rgba(26,83,92,0.25)] hover:shadow-[10px_10px_0px_0px_rgba(26,83,92,1)]',
    accent: 'bg-[#1A535C] text-white border-2 border-[#2D3436] hover:bg-[#133d44]',
    ring: 'focus-within:ring-slate-100',
    badge: 'bg-[#1A535C]/10 text-[#1A535C] border-2 border-[#1A535C]',
    input: 'text-[#2D3436]',
    meta: 'text-slate-500',
  },
  indigo: {
    bg: 'bg-white hover:bg-slate-50/50',
    border: 'border-4 border-indigo-500',
    shadow: 'shadow-[6px_6px_0px_0px_rgba(99,102,241,0.25)] hover:shadow-[10px_10px_0px_0px_rgba(99,102,241,1)]',
    accent: 'bg-indigo-600 text-white border-2 border-[#2D3436] hover:bg-indigo-700',
    ring: 'focus-within:ring-indigo-100',
    badge: 'bg-indigo-50 text-indigo-800 border-2 border-indigo-500',
    input: 'text-[#2D3436]',
    meta: 'text-slate-500',
  },
  violet: {
    bg: 'bg-white hover:bg-slate-50/50',
    border: 'border-4 border-violet-500',
    shadow: 'shadow-[6px_6px_0px_0px_rgba(139,92,246,0.25)] hover:shadow-[10px_10px_0px_0px_rgba(139,92,246,1)]',
    accent: 'bg-violet-600 text-white border-2 border-[#2D3436] hover:bg-violet-700',
    ring: 'focus-within:ring-violet-100',
    badge: 'bg-violet-50 text-violet-800 border-2 border-violet-500',
    input: 'text-[#2D3436]',
    meta: 'text-slate-500',
  }
};

const PALETTES: Array<'slate' | 'blue' | 'rose' | 'amber' | 'emerald' | 'indigo' | 'violet'> = [
  'slate', 'blue', 'rose', 'amber', 'emerald', 'indigo', 'violet'
];

export default function PersonCard({
  person,
  onUpdate,
  onDelete,
  onAddRelation,
  onMoveLeft,
  onMoveRight,
  isFirstInRow,
  isLastInRow,
  showDates,
  showTitles,
}: PersonCardProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const addMenuRef = useRef<HTMLDivElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
      if (colorMenuRef.current && !colorMenuRef.current.contains(event.target as Node)) {
        setShowColorMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const styles = THEME_STYLES[person.colorTheme || 'slate'];

  const handleGenderToggle = () => {
    const genders: Array<'male' | 'female' | 'other' | 'unspecified'> = [
      'unspecified', 'male', 'female', 'other'
    ];
    const currentIndex = genders.indexOf(person.gender || 'unspecified');
    const nextIndex = (currentIndex + 1) % genders.length;
    onUpdate(person.id, { gender: genders[nextIndex] });
  };

  return (
    <div 
      id={`person-card-${person.id}`}
      className="relative flex flex-col items-center justify-center p-1"
    >
      {/* Horizontal Ordering Buttons (Left / Right) - Hidden in Export */}
      <div className="no-export absolute -top-5 flex space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 z-10 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-xs border border-slate-200 text-slate-500">
        <button
          onClick={() => onMoveLeft(person.id)}
          disabled={isFirstInRow}
          title="Move Left"
          className="p-1 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
        >
          <ArrowLeft size={13} />
        </button>
        <span className="text-[10px] self-center select-none text-slate-400">Position</span>
        <button
          onClick={() => onMoveRight(person.id)}
          disabled={isLastInRow}
          title="Move Right"
          className="p-1 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
        >
          <ArrowRight size={13} />
        </button>
      </div>

      <motion.div
        layout
        className={`w-48 sm:w-52 p-4 rounded-2xl transition-all duration-300 ${styles.bg} ${styles.border} ${styles.shadow} ${styles.ring} group`}
      >
        {/* Gender Badge and Controls Row - Hidden in Export */}
        <div className="no-export flex items-center justify-between mb-2">
          {/* Gender Selector Button */}
          <button
            onClick={handleGenderToggle}
            title={`Gender: ${person.gender || 'unspecified'} (Click to change)`}
            className={`p-1 rounded-md transition-all border text-xs flex items-center space-x-1 ${
              person.gender === 'male' ? 'bg-blue-100/80 text-blue-700 border-blue-200' :
              person.gender === 'female' ? 'bg-rose-100/80 text-rose-700 border-rose-200' :
              person.gender === 'other' ? 'bg-violet-100/80 text-violet-700 border-violet-200' :
              'bg-slate-100/80 text-slate-600 border-slate-200'
            }`}
          >
            <User size={12} />
            <span className="capitalize text-[10px] font-medium hidden sm:inline">
              {person.gender || 'unspecified'}
            </span>
          </button>

          {/* Right Action Icons (Palette, Delete) */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
            {/* Color Palette Menu */}
            <div className="relative" ref={colorMenuRef}>
              <button
                onClick={() => setShowColorMenu(!showColorMenu)}
                title="Card Color"
                className="p-1 rounded-md hover:bg-slate-200/60 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <Palette size={13} />
              </button>

              {showColorMenu && (
                <div className="absolute right-0 top-6 bg-white border border-slate-200 rounded-lg shadow-lg p-2 flex space-x-1 z-30">
                  {PALETTES.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        onUpdate(person.id, { colorTheme: p });
                        setShowColorMenu(false);
                      }}
                      className={`w-5 h-5 rounded-full border border-slate-300 transition-transform hover:scale-110 ${
                        p === 'slate' ? 'bg-slate-300' :
                        p === 'blue' ? 'bg-blue-300' :
                        p === 'rose' ? 'bg-rose-300' :
                        p === 'amber' ? 'bg-amber-300' :
                        p === 'emerald' ? 'bg-emerald-300' :
                        p === 'indigo' ? 'bg-indigo-300' :
                        'bg-violet-300'
                      }`}
                    >
                      {person.colorTheme === p && (
                        <Check size={10} className="mx-auto text-slate-800 font-bold" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete Person"
              className="p-1 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Name input - ALWAYS visible, full-width, direct-editable */}
        <input
          type="text"
          value={person.name}
          onChange={(e) => onUpdate(person.id, { name: e.target.value })}
          placeholder="Full Name"
          className={`w-full font-sans font-semibold text-center border-b border-transparent hover:border-slate-300 focus:border-slate-500 focus:outline-none transition-colors py-0.5 text-base rounded-md px-1 bg-transparent placeholder-slate-400 ${styles.input}`}
        />

        {/* Optional Title input - display controlled by settings */}
        {showTitles && (
          <input
            type="text"
            value={person.title || ''}
            onChange={(e) => onUpdate(person.id, { title: e.target.value })}
            placeholder="Relationship/Title"
            className={`w-full text-center border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none transition-colors py-0.5 text-xs text-slate-500 rounded-md px-1 bg-transparent placeholder-slate-300 italic mt-0.5`}
          />
        )}

        {/* Life Span / Birth-Death dates */}
        {showDates && (
          <div className="flex items-center justify-center space-x-1 mt-1 text-xs text-slate-400">
            <Calendar size={11} className="no-export text-slate-300" />
            <input
              type="text"
              value={person.birthYear || ''}
              onChange={(e) => onUpdate(person.id, { birthYear: e.target.value })}
              placeholder="Born"
              className="w-12 text-center text-xs bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none rounded px-0.5"
            />
            <span className="text-slate-300">-</span>
            <input
              type="text"
              value={person.deathYear || ''}
              disabled={!person.isDeceased}
              onChange={(e) => onUpdate(person.id, { deathYear: e.target.value })}
              placeholder={person.isDeceased ? 'Died' : 'Present'}
              className="w-12 text-center text-xs bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none rounded px-0.5 disabled:text-slate-400 disabled:hover:border-transparent"
            />
            {/* Deceased checkbox - Hidden in Export */}
            <label className="no-export flex items-center ml-1 cursor-pointer" title="Mark as deceased">
              <input
                type="checkbox"
                checked={person.isDeceased || false}
                onChange={(e) => {
                  onUpdate(person.id, { 
                    isDeceased: e.target.checked,
                    deathYear: e.target.checked ? person.deathYear : ''
                  });
                }}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3 cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* Plus Button to Add Family Members - Hidden in Export */}
        <div className="no-export flex justify-center mt-3 pt-2 border-t border-slate-200/50">
          <div className="relative" ref={addMenuRef}>
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className={`flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full shadow-xs border transition-all duration-200 cursor-pointer ${styles.accent} hover:scale-105 active:scale-95`}
            >
              <Plus size={12} />
              <span>Add Relation</span>
            </button>

            {showAddMenu && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-8 w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 flex flex-col text-left text-xs z-30 select-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Ancestors</span>
                <button
                  onClick={() => { onAddRelation(person.id, 'father'); setShowAddMenu(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-blue-900 rounded-md transition-colors font-medium flex items-center space-x-1.5"
                >
                  <span>👨‍💼</span> <span>Add Father</span>
                </button>
                <button
                  onClick={() => { onAddRelation(person.id, 'mother'); setShowAddMenu(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-900 rounded-md transition-colors font-medium flex items-center space-x-1.5"
                >
                  <span>👩‍💼</span> <span>Add Mother</span>
                </button>
                
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mt-1 border-t border-slate-100">Partners & Sibs</span>
                <button
                  onClick={() => { onAddRelation(person.id, 'spouse'); setShowAddMenu(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-purple-50 text-purple-900 rounded-md transition-colors font-medium flex items-center space-x-1.5"
                >
                  <Heart size={11} className="text-purple-500" /> <span>Add Spouse</span>
                </button>
                <button
                  onClick={() => { onAddRelation(person.id, 'sibling'); setShowAddMenu(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-800 rounded-md transition-colors font-medium flex items-center space-x-1.5"
                >
                  <span>🧒</span> <span>Add Sibling</span>
                </button>

                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mt-1 border-t border-slate-100">Descendants</span>
                <button
                  onClick={() => { onAddRelation(person.id, 'son'); setShowAddMenu(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-blue-900 rounded-md transition-colors font-medium flex items-center space-x-1.5"
                >
                  <span>👦</span> <span>Add Son</span>
                </button>
                <button
                  onClick={() => { onAddRelation(person.id, 'daughter'); setShowAddMenu(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-900 rounded-md transition-colors font-medium flex items-center space-x-1.5"
                >
                  <span>👧</span> <span>Add Daughter</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Overlay Modal (absolute overlay) */}
      {showDeleteConfirm && (
        <div className="no-export absolute inset-0 bg-slate-900/40 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-3 z-30 text-center">
          <div className="bg-white rounded-lg p-3 shadow-lg border border-slate-100 flex flex-col items-center max-w-[180px]">
            <ShieldAlert size={20} className="text-red-500 mb-1" />
            <h4 className="text-xs font-bold text-slate-800">Delete {person.name || 'this person'}?</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-tight">This will clean up relationship links.</p>
            <div className="flex space-x-2 mt-3 w-full">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 px-1.5 rounded text-[10px] font-semibold transition-colors cursor-pointer"
              >
                Keep
              </button>
              <button
                onClick={() => {
                  onDelete(person.id);
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 px-1.5 rounded text-[10px] font-semibold transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
