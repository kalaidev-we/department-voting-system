import React, { useState } from 'react';
import { VoteReceipt } from '../../lib/types';
import {
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  Download,
  ArrowRight,
  Shield,
  FileCheck,
  Hash,
} from 'lucide-react';

interface VoteSuccessPageProps {
  receipt: VoteReceipt;
  onDone: () => void;
}

export function VoteSuccessPage({ receipt, onDone }: VoteSuccessPageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(receipt.receipt_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const textContent = `=====================================================
KPR INSTITUTE OF ENGINEERING AND TECHNOLOGY
SECUREVOTE CAMPUS — OFFICIAL VOTING RECEIPT
=====================================================
Receipt Token:    ${receipt.receipt_id}
Verification:     ${receipt.verification_code}
Election:         ${receipt.election_title}
Timestamp:        ${new Date(receipt.timestamp).toUTCString()}
Sequence Number:  #${receipt.sequence_number}
Block Hash:       ${receipt.ledger_hash}
Status:           CRYPTOGRAPHICALLY SEALED (SHA-256)
=====================================================
VOTER PRIVACY NOTICE:
This receipt certifies your democratic participation in
the designated election. Per college voting architecture,
your candidate choice was decoupled prior to storage
and cannot be reverse-engineered from this receipt.
=====================================================`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SecureVote-Receipt-${receipt.verification_code}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-3 sm:p-6 select-none antialiased">
      <div className="w-full max-w-md space-y-4 sm:space-y-5">
        {/* Top Branding */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <span className="text-base font-black tracking-tight text-slate-900">
            Secure<span className="text-blue-600">Vote</span>
          </span>
        </div>

        {/* Hero Success Badge */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/15 animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Ballot Successfully Cast!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            Your vote has been cryptographically sealed and appended to the college election ledger.
          </p>
        </div>

        {/* Digital Receipt Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-md space-y-4 relative overflow-hidden">
          {/* Header watermark */}
          <div className="border-b border-dashed border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                Official Digital Receipt
              </span>
              <span className="text-xs font-bold text-slate-800">
                KPRIET Campus Node
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified & Sealed
            </span>
          </div>

          {/* Receipt Details */}
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Receipt Token</span>
              <div className="flex items-center justify-between mt-0.5 bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono font-bold text-slate-800">
                <span className="truncate">{receipt.receipt_id}</span>
                <button
                  onClick={handleCopy}
                  className="ml-2 px-2 py-1 bg-white hover:bg-slate-100 rounded-lg text-slate-600 text-[11px] font-semibold border border-slate-200 flex items-center space-x-1 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Election</span>
                <span className="font-bold text-slate-800 line-clamp-1 mt-0.5">
                  {receipt.election_title}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Time Recorded</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {new Date(receipt.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] block">Cryptographic Hash</span>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 font-mono text-[10px] text-slate-600 break-all leading-tight mt-0.5">
                {receipt.ledger_hash}
              </div>
            </div>
          </div>

          {/* Anonymity Shield Banner */}
          <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Strict Voter Privacy Guarantee</span>
            </div>
            <p className="text-[10px] text-blue-800/80 leading-relaxed">
              Your candidate choice has been permanently decoupled from your student roll number. This receipt proves you submitted a ballot without exposing your selection.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleDownload}
            className="w-full h-11 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center space-x-2 text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download Official Receipt (.txt)</span>
          </button>

          <button
            onClick={onDone}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 text-xs transition-colors cursor-pointer"
          >
            <span>Return to Student Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
