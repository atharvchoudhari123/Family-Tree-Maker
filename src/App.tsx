import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  Download, Printer, RotateCcw, Sparkles, Undo, 
  HelpCircle, Trash2, Heart, Plus, GitMerge, FileText
} from 'lucide-react';
import { Person, FamilyTreeSettings } from './types';
import { initialPerson, demoFamilyTree } from './components/DemoData';
import ControlPanel from './components/ControlPanel';
import FamilyTreeCanvas from './components/FamilyTreeCanvas';

export default function App() {
  const [people, setPeople] = useState<Person[]>([initialPerson]);
  const [peopleHistory, setPeopleHistory] = useState<Person[][]>([]);
  const [exporting, setExporting] = useState(false);
  const [settings, setSettings] = useState<FamilyTreeSettings>({
    treeTitle: 'Our Family Tree',
    treeSubtitle: 'Generations of ancestors and descendants',
    theme: 'elegant',
    lineStyle: 'curved',
    showDates: true,
    showTitles: true,
    lineColor: '#94a3b8',
  });

  // Track state history for Undo operations
  const updatePeople = (newPeople: Person[]) => {
    setPeopleHistory((prev) => [...prev, people]);
    setPeople(newPeople);
  };

  const handleUndo = () => {
    if (peopleHistory.length === 0) return;
    const previous = peopleHistory[peopleHistory.length - 1];
    setPeople(previous);
    setPeopleHistory((prev) => prev.slice(0, -1));
  };

  // Reset tree to a single starting node
  const handleReset = () => {
    const confirmReset = window.confirm('Are you sure you want to reset? This will delete the entire tree.');
    if (confirmReset) {
      updatePeople([
        {
          id: 'me',
          name: 'Alex Mercer',
          title: 'Self',
          birthYear: '1995',
          parents: [],
          children: [],
          spouses: [],
          generation: 0,
          colorTheme: 'blue',
          sortOrder: Date.now(),
        },
      ]);
    }
  };

  // Load the prebuilt 3-generation demo tree
  const handleLoadDemo = () => {
    const confirmLoad = window.confirm('Load the multi-generation demo tree? Your current changes will be overwritten.');
    if (confirmLoad) {
      updatePeople(demoFamilyTree);
      setSettings((prev) => ({
        ...prev,
        treeTitle: 'The Sterling Ancestry',
        treeSubtitle: 'Generations of the Sterling and Mercer Families',
      }));
    }
  };

  // Update fields of an individual person (e.g. name, title, birth/death, color)
  const handleUpdatePerson = (id: string, updates: Partial<Person>) => {
    const updated = people.map((p) => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    });
    updatePeople(updated);
  };

  // Delete a person and securely clean up all relationship pointers
  const handleDeletePerson = (id: string) => {
    const updated = people
      .filter((p) => p.id !== id)
      .map((p) => ({
        ...p,
        parents: p.parents.filter((parentId) => parentId !== id),
        children: p.children.filter((childId) => childId !== id),
        spouses: p.spouses.filter((spouseId) => spouseId !== id),
      }));
    updatePeople(updated);
  };

  // Create a relative (parent, spouse, sibling, child) with bi-directional pointer resolution
  const handleAddRelation = (
    personId: string,
    relationType: 'father' | 'mother' | 'spouse' | 'son' | 'daughter' | 'sibling'
  ) => {
    const currentPerson = people.find((p) => p.id === personId);
    if (!currentPerson) return;

    const newId = `person_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newPerson: Person = {
      id: newId,
      name: '',
      birthYear: '',
      parents: [],
      children: [],
      spouses: [],
      generation: currentPerson.generation,
      sortOrder: Date.now(),
    };

    const updatedPeople = [...people];

    if (relationType === 'father' || relationType === 'mother') {
      newPerson.name = relationType === 'father' ? 'New Father' : 'New Mother';
      newPerson.gender = relationType === 'father' ? 'male' : 'female';
      newPerson.title = relationType === 'father' ? 'Father' : 'Mother';
      newPerson.generation = currentPerson.generation - 1;
      newPerson.children = [personId];
      newPerson.colorTheme = relationType === 'father' ? 'blue' : 'rose';

      // Update child's parents array
      const childIdx = updatedPeople.findIndex((p) => p.id === personId);
      if (childIdx !== -1) {
        updatedPeople[childIdx] = {
          ...updatedPeople[childIdx],
          parents: [...updatedPeople[childIdx].parents, newId],
        };
      }
    } else if (relationType === 'spouse') {
      newPerson.name = 'New Spouse';
      newPerson.gender =
        currentPerson.gender === 'male'
          ? 'female'
          : currentPerson.gender === 'female'
          ? 'male'
          : 'unspecified';
      newPerson.title = 'Spouse';
      newPerson.generation = currentPerson.generation;
      newPerson.spouses = [personId];
      newPerson.colorTheme = currentPerson.colorTheme === 'blue' ? 'rose' : 'blue';

      // Update original spouse array
      const spouseIdx = updatedPeople.findIndex((p) => p.id === personId);
      if (spouseIdx !== -1) {
        updatedPeople[spouseIdx] = {
          ...updatedPeople[spouseIdx],
          spouses: [...updatedPeople[spouseIdx].spouses, newId],
        };
      }
    } else if (relationType === 'son' || relationType === 'daughter') {
      newPerson.name = relationType === 'son' ? 'New Son' : 'New Daughter';
      newPerson.gender = relationType === 'son' ? 'male' : 'female';
      newPerson.title = relationType === 'son' ? 'Son' : 'Daughter';
      newPerson.generation = currentPerson.generation + 1;
      newPerson.parents = [personId];
      newPerson.colorTheme = relationType === 'son' ? 'blue' : 'rose';

      // Blended family smart lookup: connect child to parent's primary spouse as well
      if (currentPerson.spouses.length > 0) {
        const spouseId = currentPerson.spouses[0];
        newPerson.parents.push(spouseId);

        // Update spouse's children array
        const spouseIdx = updatedPeople.findIndex((p) => p.id === spouseId);
        if (spouseIdx !== -1) {
          updatedPeople[spouseIdx] = {
            ...updatedPeople[spouseIdx],
            children: [...updatedPeople[spouseIdx].children, newId],
          };
        }
      }

      // Update primary parent's children array
      const parentIdx = updatedPeople.findIndex((p) => p.id === personId);
      if (parentIdx !== -1) {
        updatedPeople[parentIdx] = {
          ...updatedPeople[parentIdx],
          children: [...updatedPeople[parentIdx].children, newId],
        };
      }
    } else if (relationType === 'sibling') {
      let parentIds = [...currentPerson.parents];
      const updatedPeopleWithParent = [...updatedPeople];

      // Auto-generative parent: if current sibling has no parents, automatically mock a shared parent
      if (parentIds.length === 0) {
        const autoParentId = `parent_of_${currentPerson.id}`;
        const autoParent: Person = {
          id: autoParentId,
          name: `Parent of ${currentPerson.name || 'Member'}`,
          title: 'Parent',
          birthYear: '',
          parents: [],
          children: [personId],
          spouses: [],
          generation: currentPerson.generation - 1,
          sortOrder: Date.now() - 5000,
          colorTheme: 'slate',
        };
        updatedPeopleWithParent.push(autoParent);
        parentIds = [autoParentId];

        // Link current person to this new autoParent
        const targetIdx = updatedPeopleWithParent.findIndex((p) => p.id === personId);
        if (targetIdx !== -1) {
          updatedPeopleWithParent[targetIdx] = {
            ...updatedPeopleWithParent[targetIdx],
            parents: [autoParentId],
          };
        }
      }

      newPerson.name = 'New Sibling';
      newPerson.title = 'Sibling';
      newPerson.generation = currentPerson.generation;
      newPerson.parents = parentIds;
      newPerson.colorTheme = 'slate';

      // Ensure all parents register this sibling child
      parentIds.forEach((parentId) => {
        const parentIdx = updatedPeopleWithParent.findIndex((p) => p.id === parentId);
        if (parentIdx !== -1) {
          const childrenList = updatedPeopleWithParent[parentIdx].children.includes(newId)
            ? updatedPeopleWithParent[parentIdx].children
            : [...updatedPeopleWithParent[parentIdx].children, newId];

          updatedPeopleWithParent[parentIdx] = {
            ...updatedPeopleWithParent[parentIdx],
            children: childrenList,
          };
        }
      });

      updatedPeopleWithParent.push(newPerson);
      updatePeople(updatedPeopleWithParent);
      return;
    }

    updatedPeople.push(newPerson);
    updatePeople(updatedPeople);
  };

  // Add an unconnected node directly to a row
  const handleAddUnconnectedToRow = (generation: number) => {
    const newId = `person_${Date.now()}_unconnected`;
    const newPerson: Person = {
      id: newId,
      name: 'New Member',
      title: 'Family Member',
      birthYear: '',
      parents: [],
      children: [],
      spouses: [],
      generation: generation,
      sortOrder: Date.now(),
      colorTheme: 'slate',
    };
    updatePeople([...people, newPerson]);
  };

  // Reorder person cards horizontally within their generation
  const handleMoveHorizontal = (id: string, direction: 'left' | 'right') => {
    const target = people.find((p) => p.id === id);
    if (!target) return;

    const sameGen = people
      .filter((p) => p.generation === target.generation)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const index = sameGen.findIndex((p) => p.id === id);
    if (index === -1) return;

    if (direction === 'left' && index > 0) {
      const leftSibling = sameGen[index - 1];
      const targetSort = target.sortOrder || 0;
      const siblingSort = leftSibling.sortOrder || 0;

      // In case they have identical sort values, space them out
      const newTargetSort = siblingSort === targetSort ? siblingSort - 10 : siblingSort;
      const newSiblingSort = siblingSort === targetSort ? targetSort + 10 : targetSort;

      const updated = people.map((p) => {
        if (p.id === id) return { ...p, sortOrder: newTargetSort };
        if (p.id === leftSibling.id) return { ...p, sortOrder: newSiblingSort };
        return p;
      });
      updatePeople(updated);
    } else if (direction === 'right' && index < sameGen.length - 1) {
      const rightSibling = sameGen[index + 1];
      const targetSort = target.sortOrder || 0;
      const siblingSort = rightSibling.sortOrder || 0;

      // In case they have identical sort values, space them out
      const newTargetSort = siblingSort === targetSort ? siblingSort + 10 : siblingSort;
      const newSiblingSort = siblingSort === targetSort ? targetSort - 10 : targetSort;

      const updated = people.map((p) => {
        if (p.id === id) return { ...p, sortOrder: newTargetSort };
        if (p.id === rightSibling.id) return { ...p, sortOrder: newSiblingSort };
        return p;
      });
      updatePeople(updated);
    }
  };

  // Download PDF of the family tree
  const handleDownloadPDF = async () => {
    const element = document.getElementById('family-tree-export-container');
    if (!element) return;

    setExporting(true);

    try {
      // Small timeout to guarantee any inputs loose focus and active menus hide
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Capture canvas
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution scaling
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff', // Clean white printable backgrounds
        ignoreElements: (el) => el.classList.contains('no-export'),
      });

      const imgData = canvas.toDataURL('image/png');
      const width = canvas.width;
      const height = canvas.height;

      // Fit layout landscape vs portrait to match canvas bounds perfectly (single-page canvas)
      const orientation = width > height ? 'l' : 'p';
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [width, height],
        hotfixes: ['px_scaling'],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, width, height);

      const cleanFileName = `${settings.treeTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')}_family_tree.pdf`;
      pdf.save(cleanFileName);
    } catch (err) {
      console.error('Failed to export family tree as PDF:', err);
      alert('An unexpected issue occurred while printing the PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Trigger system printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FEF9F2] text-[#2D3436] font-sans">
      {/* Top Navigation Bar */}
      <header className="no-export sticky top-0 z-20 bg-[#FFE66D] border-b-4 border-[#2D3436] px-4 py-3.5 shadow-[0px_4px_0px_0px_#2D3436]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-label="tree">🌳</span>
            <h1 className="text-lg font-black text-[#2D3436] tracking-tight font-display">
              Aesthetic Family Tree PDF Builder
            </h1>
            <span className="hidden md:inline-block font-mono text-[10px] font-bold bg-[#FEF9F2] text-[#2D3436] px-2 py-0.5 rounded border-2 border-[#2D3436] shadow-[2px_2px_0px_0px_#2D3436]">
              Vibrant Palette
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Undo Action Button */}
            <button
              onClick={handleUndo}
              disabled={peopleHistory.length === 0}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl border-2 font-black transition-all cursor-pointer text-xs ${
                peopleHistory.length > 0
                  ? 'bg-[#FF6B6B] text-white border-[#2D3436] shadow-[3px_3px_0px_0px_#2D3436] hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_#2D3436] active:translate-y-1 active:shadow-none'
                  : 'bg-slate-100 text-slate-400 border-slate-300 shadow-none cursor-not-allowed'
              }`}
              title="Undo last action"
            >
              <Undo size={12} className="stroke-[2.5px]" />
              <span>Undo</span>
            </button>
            
            <span className="no-export font-mono text-[10px] font-bold bg-[#4ECDC4] text-[#2D3436] px-2 py-1 rounded border-2 border-[#2D3436] shadow-[2px_2px_0px_0px_#2D3436] hidden sm:inline-block">
              Offline Exporter
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Export loading modal */}
        {exporting && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white text-center">
            <div className="bg-[#FEF9F2] text-[#2D3436] rounded-2xl p-6 shadow-[8px_8px_0px_0px_#2D3436] flex flex-col items-center max-w-sm border-4 border-[#2D3436]">
              <svg className="animate-spin h-10 w-10 text-[#4ECDC4] mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <h3 className="text-xl font-black font-display">Generating PDF</h3>
              <p className="text-xs font-bold text-[#2D3436]/70 mt-2 leading-relaxed">
                Capturing vector canvas nodes and compiling your high-definition lineage layout...
              </p>
            </div>
          </div>
        )}

        {/* Control and Design Settings Dashboard */}
        <ControlPanel
          settings={settings}
          onUpdateSettings={(updates) => setSettings((prev) => ({ ...prev, ...updates }))}
          onLoadDemo={handleLoadDemo}
          onReset={handleReset}
          onDownloadPDF={handleDownloadPDF}
          onPrint={handlePrint}
          nodeCount={people.length}
        />

        {/* Dynamic Instructional Banner */}
        <div className="no-export bg-[#4ECDC4]/20 border-4 border-[#2D3436] rounded-2xl p-4.5 mb-8 flex items-start space-x-3 text-[#2D3436] shadow-[4px_4px_0px_0px_#2D3436]">
          <HelpCircle className="text-[#1A535C] shrink-0 mt-0.5" size={18} />
          <div className="text-xs space-y-1">
            <p className="font-black text-sm text-[#1A535C]">Tips for the perfect family tree export:</p>
            <ul className="list-disc list-inside space-y-1 text-[#2D3436] font-bold leading-relaxed">
              <li>Type directly inside any person card to <strong className="font-black underline text-[#1A535C]">change their name</strong>, title, or lifespan.</li>
              <li>Hover on a card and click <strong className="font-black underline text-[#1A535C]">+ Add Relation</strong> to connect siblings, partners, parents, or kids.</li>
              <li>Use the horizontal alignment controls (<strong className="font-black">Position ← / →</strong>) on any card to slide them left or right to avoid overlapping.</li>
              <li>The control settings panel and editing buttons will <strong className="font-black text-[#FF6B6B]">automatically hide</strong> during PDF download and printing.</li>
            </ul>
          </div>
        </div>

        {/* Printable Canvas Section */}
        <div 
          id="family-tree-export-container"
          className="bg-white rounded-2xl border-4 border-[#2D3436] shadow-[12px_12px_0px_0px_#2D3436] p-6 sm:p-8 md:p-10 transition-all"
        >
          {/* Tree Header Title / Subtitle - Included in Export */}
          {(settings.treeTitle || settings.treeSubtitle) && (
            <div className="text-center mb-10 pb-6 border-b-2 border-[#2D3436]/10 flex flex-col justify-center items-center">
              {settings.treeTitle && (
                <h2 className="text-4xl font-black text-[#1A535C] tracking-tight leading-none font-display">
                  {settings.treeTitle}
                </h2>
              )}
              {settings.treeSubtitle && (
                <p className="text-sm font-bold text-[#1A535C]/80 mt-2 italic max-w-2xl leading-relaxed">
                  {settings.treeSubtitle}
                </p>
              )}
            </div>
          )}

          {/* Interactive Family Tree Canvas */}
          <FamilyTreeCanvas
            people={people}
            onUpdatePerson={handleUpdatePerson}
            onDeletePerson={handleDeletePerson}
            onAddRelation={handleAddRelation}
            onAddUnconnectedToRow={handleAddUnconnectedToRow}
            onMoveLeft={(id) => handleMoveHorizontal(id, 'left')}
            onMoveRight={(id) => handleMoveHorizontal(id, 'right')}
            lineStyle={settings.lineStyle}
            lineColor={settings.lineColor}
            showDates={settings.showDates}
            showTitles={settings.showTitles}
          />
          
          {/* Subtle watermark only visible on printable documents */}
          <div className="hidden export-only text-center mt-8 pt-4 border-t-2 border-[#2D3436]/10 text-[10px] text-[#2D3436]/50 font-mono tracking-wider">
            Created with the Family Tree Designer Workspace
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="no-export border-t-4 border-[#2D3436] bg-[#FFE66D] py-6 mt-16 text-center text-xs font-bold text-[#2D3436] shadow-[0px_-4px_0px_0px_#2D3436]">
        <p>© 2026 Family Tree Designer. Fully offline-safe, browser-compiled PDF exporter.</p>
      </footer>
    </div>
  );
}
