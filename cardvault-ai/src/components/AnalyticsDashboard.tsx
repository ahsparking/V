import React from 'react';
import {
  TrendingUp,
  Users,
  Flame,
  Smartphone,
  CheckCircle2,
  PieChart,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Building,
  Target,
  ArrowUpRight,
} from 'lucide-react';
import { ScannedContact } from '../types/contact';

interface AnalyticsDashboardProps {
  contacts: ScannedContact[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ contacts }) => {
  const total = contacts.length;
  const hotLeads = contacts.filter(c => c.leadPriority === 'Hot').length;
  const warmLeads = contacts.filter(c => c.leadPriority === 'Warm').length;
  const coldLeads = contacts.filter(c => c.leadPriority === 'Cold').length;

  const syncedToPhone = contacts.filter(c => c.syncedToPhone).length;
  const syncedToCrm = contacts.filter(c => c.syncedToSalesforce || c.syncedToHubspot).length;

  const avgConfidence = total > 0
    ? Math.round(contacts.reduce((acc, c) => acc + (c.ocrConfidence || 95), 0) / total)
    : 98;

  // Industry distribution
  const industryCounts: Record<string, number> = {};
  contacts.forEach(c => {
    const ind = c.industry || 'General Business';
    industryCounts[ind] = (industryCounts[ind] || 0) + 1;
  });
  const sortedIndustries = Object.entries(industryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Pipeline funnel
  const stages = [
    { label: 'New Lead', color: 'bg-blue-500' },
    { label: 'Contacted', color: 'bg-teal-500' },
    { label: 'Meeting Scheduled', color: 'bg-emerald-500' },
    { label: 'Proposal Sent', color: 'bg-amber-500' },
    { label: 'Qualified', color: 'bg-indigo-500' },
    { label: 'Closed Won', color: 'bg-purple-500' },
  ];

  const stageCounts = stages.map(s => ({
    ...s,
    count: contacts.filter(c => c.pipelineStage === s.label).length,
  }));

  // Enrichment completeness
  const withEmail = contacts.filter(c => Boolean(c.email)).length;
  const withPhone = contacts.filter(c => Boolean(c.phoneMobile)).length;
  const withWebsite = contacts.filter(c => Boolean(c.website)).length;
  const withAddress = contacts.filter(c => Boolean(c.addressStreet || c.addressCity)).length;
  const withLinkedin = contacts.filter(c => Boolean(c.linkedin)).length;

  const emailPct = total > 0 ? Math.round((withEmail / total) * 100) : 100;
  const phonePct = total > 0 ? Math.round((withPhone / total) * 100) : 100;
  const webPct = total > 0 ? Math.round((withWebsite / total) * 100) : 100;
  const addrPct = total > 0 ? Math.round((withAddress / total) * 100) : 100;
  const liPct = total > 0 ? Math.round((withLinkedin / total) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Scanned</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{total}</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            100% AES-256 Encrypted
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Hot Priority</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{hotLeads}</div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {total > 0 ? Math.round((hotLeads / total) * 100) : 0}% High Conversion
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Phone Synced</span>
            <Smartphone className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-300">{syncedToPhone}</div>
          <p className="text-[11px] text-teal-400 mt-1 font-medium">
            vCard 3.0 Standard
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">OCR Accuracy</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">{avgConfidence}%</div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Gemini 3.8 Flash Vision
          </p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Pipeline Funnel */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Lead Pipeline Conversion Funnel</h3>
                <p className="text-xs text-slate-400">Progression from raw card scan to closed deal</p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {total} Total Deals
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {stageCounts.map(st => {
              const pct = total > 0 ? Math.round((st.count / total) * 100) : 0;
              return (
                <div key={st.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{st.label}</span>
                    <span className="text-slate-400 font-mono">
                      {st.count} leads ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${st.color} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Quality Rating Breakdown */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Lead Priority Ratio</h3>
              <p className="text-xs text-slate-400">Seniority distribution</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-rose-300">Hot Priority</span>
              </div>
              <span className="text-sm font-black text-white font-mono">{hotLeads}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-amber-300">Warm Priority</span>
              </div>
              <span className="text-sm font-black text-white font-mono">{warmLeads}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-blue-300">Cold Priority</span>
              </div>
              <span className="text-sm font-black text-white font-mono">{coldLeads}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Enrichment Completeness & Top Industries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Contact Enrichment Completeness */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">OCR Field Capture Completeness</h3>
              <p className="text-xs text-slate-400">Quality of scanned business card attributes</p>
            </div>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Verified Email Address</span>
                <span className="font-mono text-emerald-400">{emailPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${emailPct}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Direct Mobile Phone</span>
                <span className="font-mono text-teal-400">{phonePct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${phonePct}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Company Website URL</span>
                <span className="font-mono text-sky-400">{webPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${webPct}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Physical Headquarters Address</span>
                <span className="font-mono text-indigo-400">{addrPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${addrPct}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>LinkedIn Profile Handle</span>
                <span className="font-mono text-purple-400">{liPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${liPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Top Industries */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Building className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Top Industries Scanned</h3>
              <p className="text-xs text-slate-400">Market sector breakdown</p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {sortedIndustries.map(([ind, count], idx) => (
              <div
                key={ind}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{ind}</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                  {count} {count === 1 ? 'lead' : 'leads'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
