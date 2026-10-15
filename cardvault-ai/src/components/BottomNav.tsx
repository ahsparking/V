import React from 'react';
import { Camera, Users, BarChart3, Cloud, Layers } from 'lucide-react';

export type TabType = 'scanner' | 'leads' | 'analytics' | 'crm';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  leadsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  leadsCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#070b14]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 select-none md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={() => onChangeTab('scanner')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'scanner'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition ${
              activeTab === 'scanner' ? 'bg-emerald-500/20' : ''
            }`}
          >
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Scanner</span>
        </button>

        <button
          onClick={() => onChangeTab('leads')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition relative ${
            activeTab === 'leads'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition ${
              activeTab === 'leads' ? 'bg-emerald-500/20' : ''
            }`}
          >
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Leads ({leadsCount})</span>
        </button>

        <button
          onClick={() => onChangeTab('analytics')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'analytics'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition ${
              activeTab === 'analytics' ? 'bg-emerald-500/20' : ''
            }`}
          >
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Analytics</span>
        </button>

        <button
          onClick={() => onChangeTab('crm')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'crm'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition ${
              activeTab === 'crm' ? 'bg-emerald-500/20' : ''
            }`}
          >
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-[10px]">CRM & Cloud</span>
        </button>
      </div>
    </nav>
  );
};
