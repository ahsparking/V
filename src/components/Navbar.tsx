import React from 'react';
import {
  ShieldCheck,
  Lock,
  Cloud,
  UploadCloud,
  Settings,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface NavbarProps {
  onLockApp: () => void;
  onOpenCloudSync: () => void;
  onOpenCrmExport: () => void;
  onOpenSettings: () => void;
  totalLeads: number;
  isOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLockApp,
  onOpenCloudSync,
  onOpenCrmExport,
  onOpenSettings,
  totalLeads,
  isOnline,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#070b14]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand & Security Badge */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/15">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                CardVault<span className="text-emerald-400">AI</span>
              </span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 leading-none">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                {isOnline ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online &bull; AES-256
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-400" />
                    Offline Encrypted
                  </>
                )}
              </span>
              <span>&bull;</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {totalLeads} {totalLeads === 1 ? 'Lead' : 'Leads'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <a
            href="/download/cardvault-ai.zip"
            download="cardvault-ai.zip"
            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition text-xs font-bold"
            title="Download complete project source ZIP"
          >
            <span className="hidden sm:inline">Download</span> .ZIP
          </a>

          <button
            onClick={onOpenCloudSync}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 flex items-center gap-1.5 transition text-xs font-medium"
            title="Cloud Backup & Sync"
          >
            <Cloud className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          <button
            onClick={onOpenCrmExport}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5 transition text-xs font-semibold"
            title="Export to Salesforce / HubSpot / Phone"
          >
            <UploadCloud className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">CRM Export</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/80 transition"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onLockApp}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition flex items-center gap-1"
            title="Lock App with Biometrics"
          >
            <Lock className="w-4 h-4 text-rose-400" />
            <span className="hidden md:inline text-xs font-medium">Lock</span>
          </button>
        </div>
      </div>
    </header>
  );
};
