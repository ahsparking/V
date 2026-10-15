import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Flame,
  Star,
  Phone,
  Mail,
  Smartphone,
  ShieldCheck,
  MoreVertical,
  UploadCloud,
  ChevronRight,
  UserPlus,
  Trash2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { ScannedContact, LeadPriority } from '../types/contact';
import { downloadVCard } from '../services/crm';
import { playSuccessChime } from '../services/audio';

interface LeadsListProps {
  contacts: ScannedContact[];
  onSelectLead: (contact: ScannedContact) => void;
  onOpenScanner: () => void;
  onOpenCrmExport: () => void;
  onInspectEncryption: (contact: ScannedContact) => void;
}

export const LeadsList: React.FC<LeadsListProps> = ({
  contacts,
  onSelectLead,
  onOpenScanner,
  onOpenCrmExport,
  onInspectEncryption,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | LeadPriority>('all');
  const [syncFilter, setSyncFilter] = useState<'all' | 'synced_phone' | 'synced_crm'>('all');

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      // Search
      const q = searchTerm.toLowerCase();
      const matchesQuery =
        !q ||
        c.fullName.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.jobTitle.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q));

      // Priority filter
      const matchesPriority = priorityFilter === 'all' || c.leadPriority === priorityFilter;

      // Sync filter
      const matchesSync =
        syncFilter === 'all' ||
        (syncFilter === 'synced_phone' && c.syncedToPhone) ||
        (syncFilter === 'synced_crm' && (c.syncedToSalesforce || c.syncedToHubspot));

      return matchesQuery && matchesPriority && matchesSync;
    });
  }, [contacts, searchTerm, priorityFilter, syncFilter]);

  const handleQuickPhoneSync = (e: React.MouseEvent, contact: ScannedContact) => {
    e.stopPropagation();
    playSuccessChime();
    downloadVCard(contact);
  };

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search leads by name, company, email, title, or tags..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCrmExport}
              className="px-4 py-2.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-semibold text-xs border border-sky-500/30 flex items-center gap-1.5 transition whitespace-nowrap shadow-sm"
            >
              <UploadCloud className="w-4 h-4 text-sky-400" />
              <span>CRM Export</span>
            </button>

            <button
              onClick={onOpenScanner}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>Scan Card</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setPriorityFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                priorityFilter === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              All ({contacts.length})
            </button>
            <button
              onClick={() => setPriorityFilter('Hot')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                priorityFilter === 'Hot'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-800/60 text-rose-400 hover:bg-slate-800'
              }`}
            >
              <Flame className="w-3 h-3" />
              Hot Leads
            </button>
            <button
              onClick={() => setPriorityFilter('Warm')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                priorityFilter === 'Warm'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800/60 text-amber-400 hover:bg-slate-800'
              }`}
            >
              Warm
            </button>
            <button
              onClick={() => setPriorityFilter('Cold')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                priorityFilter === 'Cold'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800/60 text-blue-400 hover:bg-slate-800'
              }`}
            >
              Cold
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Local AES-256 Storage</span>
          </div>
        </div>
      </div>

      {/* Leads List Feed */}
      {filteredContacts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center">
            <Search className="w-8 h-8 text-slate-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1">No scanned leads match</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search query, or open the camera to scan a new physical business card.
            </p>
          </div>
          <button
            onClick={onOpenScanner}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            Scan Business Card Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => onSelectLead(contact)}
              className="group p-4 rounded-3xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 shadow-lg transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Initials Avatar */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 font-black text-base flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {contact.firstName?.[0] || contact.fullName?.[0] || 'L'}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition truncate">
                      {contact.fullName}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                        contact.leadPriority === 'Hot'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : contact.leadPriority === 'Warm'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {contact.leadPriority === 'Hot' && <Flame className="w-2.5 h-2.5" />}
                      {contact.leadPriority}
                    </span>

                    {/* Stage Badge */}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {contact.pipelineStage}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                    {contact.jobTitle}
                  </p>

                  <p className="text-xs text-slate-400 truncate">
                    {contact.company} {contact.addressCity ? `&bull; ${contact.addressCity}` : ''}
                  </p>

                  {/* Sync Status Icons */}
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                    {contact.syncedToPhone ? (
                      <span className="text-teal-400 flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        Phone Synced
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        Local Only
                      </span>
                    )}

                    {contact.syncedToSalesforce && (
                      <span className="text-sky-400 flex items-center gap-1">
                        <UploadCloud className="w-3 h-3" />
                        Salesforce Synced
                      </span>
                    )}

                    <span className="text-emerald-400/80 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      AES-256
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Tray */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                {contact.phoneMobile && (
                  <a
                    href={`tel:${contact.phoneMobile}`}
                    onClick={e => e.stopPropagation()}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition"
                    title="Call"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}

                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    onClick={e => e.stopPropagation()}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}

                <button
                  onClick={e => handleQuickPhoneSync(e, contact)}
                  className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 flex items-center gap-1.5 transition"
                  title="Export vCard to Phone"
                >
                  <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden sm:inline">Sync Phone</span>
                </button>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    onInspectEncryption(contact);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700/80 transition"
                  title="Inspect Encryption Vault"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>

                <div className="p-1 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
