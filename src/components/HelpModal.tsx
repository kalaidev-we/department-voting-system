import React from 'react';
import { X, Headphones, Mail, Phone, ShieldCheck, ExternalLink, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-600">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Election Helpdesk</h3>
              <p className="text-xs text-slate-500">SecureVote Campus Support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3.5 text-sm">
          <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100/60 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-brand-900">Eligible Domain</p>
              <p className="text-xs text-brand-700 mt-0.5">
                Only students and faculty with an active <span className="font-semibold">@kpriet.ac.in</span> Google account can sign in and cast votes.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Channels</p>
            
            <a
              href="mailto:contact@ariseagency.in"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/40 transition-colors group"
            >
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
                <span className="text-xs font-medium text-slate-700">contact@ariseagency.in</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600" />
            </a>

            <a
              href="tel:9025488266"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/40 transition-colors group"
            >
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
                <span className="text-xs font-medium text-slate-700 font-mono">+91 90254 88266</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Helpline Active
              </span>
            </a>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              KPR Institute of Engineering and Technology &bull; Student Affairs
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/20 transition-all"
        >
          Got It
        </button>
      </div>
    </div>
  );
}
