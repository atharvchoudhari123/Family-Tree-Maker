import React from 'react';
import { 
  Download, Printer, RotateCcw, Sparkles, 
  Eye, EyeOff, Layout, Type, Palette 
} from 'lucide-react';
import { FamilyTreeSettings, LineStyle } from '../types';

interface ControlPanelProps {
  settings: FamilyTreeSettings;
  onUpdateSettings: (updates: Partial<FamilyTreeSettings>) => void;
  onLoadDemo: () => void;
  onReset: () => void;
  onDownloadPDF: () => void;
  onPrint: () => void;
  nodeCount: number;
}

export default function ControlPanel({
  settings,
  onUpdateSettings,
  onLoadDemo,
  onReset,
  onDownloadPDF,
  onPrint,
  nodeCount,
}: ControlPanelProps) {
  return (
    <div className="no-export bg-[#FEF9F2] border-4 border-[#2D3436] shadow-[8px_8px_0px_0px_#2D3436] rounded-2xl p-5 mb-8 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-[#2D3436]/10">
        <div>
          <h2 className="text-2xl font-black text-[#1A535C] flex items-center space-x-2">
            <span>🌳</span>
            <span>Family Tree Designer</span>
          </h2>
          <p className="text-xs font-semibold text-[#1A535C]/80 mt-1">
            Build your genealogy visually, reorder members, customize colors, and export as a PDF.
          </p>
        </div>

        {/* Counter & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-extrabold bg-[#1A535C] text-white border-2 border-[#2D3436] px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_#2D3436]">
            {nodeCount} {nodeCount === 1 ? 'Person' : 'People'}
          </span>

          <button
            onClick={onLoadDemo}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-extrabold text-[#2D3436] bg-[#FFE66D] hover:bg-[#ffd73d] border-2 border-[#2D3436] rounded-xl shadow-[3px_3px_0px_0px_#2D3436] hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_#2D3436] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            title="Load Tudor / Sterling template tree"
          >
            <Sparkles size={14} className="stroke-[2.5px]" />
            <span>Load Demo</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-extrabold text-white bg-[#FF6B6B] hover:bg-[#ff5252] border-2 border-[#2D3436] rounded-xl shadow-[3px_3px_0px_0px_#2D3436] hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_#2D3436] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            title="Delete all nodes and start fresh"
          >
            <RotateCcw size={14} className="stroke-[2.5px]" />
            <span>Reset Tree</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        {/* Title & Subtitle Settings */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <label className="block text-xs font-black text-[#1A535C] uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Type size={12} className="stroke-[2.5px]" />
              <span>Tree Title</span>
            </label>
            <input
              type="text"
              value={settings.treeTitle}
              onChange={(e) => onUpdateSettings({ treeTitle: e.target.value })}
              placeholder="e.g. The Smith Ancestry"
              className="w-full text-sm font-bold border-2 border-[#2D3436] bg-white rounded-xl px-3 py-2 focus:ring-0 focus:border-[#4ECDC4] focus:outline-none transition-all text-[#2D3436]"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-[#1A535C] uppercase tracking-wider mb-1">Tree Subtitle</label>
            <input
              type="text"
              value={settings.treeSubtitle}
              onChange={(e) => onUpdateSettings({ treeSubtitle: e.target.value })}
              placeholder="e.g. Generations spanning 1900 - Present"
              className="w-full text-sm font-bold border-2 border-[#2D3436] bg-white rounded-xl px-3 py-2 focus:ring-0 focus:border-[#4ECDC4] focus:outline-none transition-all text-[#2D3436]"
            />
          </div>
        </div>

        {/* Display Settings */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <span className="block text-xs font-black text-[#1A535C] uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Eye size={12} className="stroke-[2.5px]" />
              <span>Card Fields</span>
            </span>

            <label className="flex items-center space-x-2 text-sm font-bold text-[#2D3436] cursor-pointer hover:text-[#1A535C] transition-colors">
              <input
                type="checkbox"
                checked={settings.showTitles}
                onChange={(e) => onUpdateSettings({ showTitles: e.target.checked })}
                className="rounded-md border-2 border-[#2D3436] text-[#4ECDC4] focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>Show Roles</span>
            </label>

            <label className="flex items-center space-x-2 text-sm font-bold text-[#2D3436] cursor-pointer hover:text-[#1A535C] transition-colors">
              <input
                type="checkbox"
                checked={settings.showDates}
                onChange={(e) => onUpdateSettings({ showDates: e.target.checked })}
                className="rounded-md border-2 border-[#2D3436] text-[#4ECDC4] focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span>Show Lifespans</span>
            </label>
          </div>

          <div className="space-y-3">
            <span className="block text-xs font-black text-[#1A535C] uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Layout size={12} className="stroke-[2.5px]" />
              <span>Line Styles</span>
            </span>

            <div className="flex flex-col space-y-1.5">
              {(['curved', 'orthogonal', 'straight'] as LineStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => onUpdateSettings({ lineStyle: style })}
                  className={`text-left text-xs capitalize py-1.5 px-2.5 rounded-lg border-2 font-black transition-all cursor-pointer ${
                    settings.lineStyle === style
                      ? 'bg-[#1A535C] text-white border-[#2D3436] shadow-[2px_2px_0px_0px_#2D3436]'
                      : 'bg-white text-[#2D3436] border-[#2D3436]/40 hover:border-[#2D3436] hover:bg-slate-50'
                  }`}
                >
                  {style === 'curved' && '〰️ Curved'}
                  {style === 'orthogonal' && '📐 Orthogonal'}
                  {style === 'straight' && '➖ Straight'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Line Customization & Export */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div>
            <span className="block text-xs font-black text-[#1A535C] uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Palette size={12} className="stroke-[2.5px]" />
              <span>Line Color</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { hex: '#2D3436', label: 'Dark Charcoal' },
                { hex: '#1A535C', label: 'Deep Teal' },
                { hex: '#FF6B6B', label: 'Coral Red' },
                { hex: '#4ECDC4', label: 'Vibrant Teal' },
                { hex: '#FFE66D', label: 'Gold Yellow' },
                { hex: '#8b5cf6', label: 'Violet' },
              ].map((color) => (
                <button
                  key={color.hex}
                  onClick={() => onUpdateSettings({ lineColor: color.hex })}
                  style={{ backgroundColor: color.hex }}
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-115 cursor-pointer ${
                    settings.lineColor === color.hex ? 'border-[#2D3436] scale-110 shadow-[2px_2px_0px_0px_#2D3436]' : 'border-slate-300'
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onDownloadPDF}
              disabled={nodeCount === 0}
              className="flex-1 flex items-center justify-center space-x-2 bg-[#4ECDC4] hover:bg-[#3fb8af] disabled:bg-slate-200 disabled:shadow-none disabled:translate-y-0 disabled:border-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed text-[#2D3436] text-sm font-black py-2.5 px-4 rounded-xl border-3 border-[#2D3436] shadow-[4px_4px_0px_0px_#2D3436] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#2D3436] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <Download size={16} className="stroke-[2.5px]" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onPrint}
              disabled={nodeCount === 0}
              className="flex items-center justify-center space-x-2 bg-[#FFE66D] hover:bg-[#ffd73d] disabled:bg-slate-200 disabled:shadow-none disabled:translate-y-0 disabled:border-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed text-[#2D3436] text-sm font-black py-2.5 px-4 rounded-xl border-3 border-[#2D3436] shadow-[4px_4px_0px_0px_#2D3436] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#2D3436] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              title="Print to Paper or Save as System PDF"
            >
              <Printer size={16} className="stroke-[2.5px]" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
