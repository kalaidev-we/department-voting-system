import React, { useState } from 'react';
import {
  ChevronLeft,
  Headphones,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  ShieldCheck,
  FileQuestion,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

interface HelpSupportPageProps {
  onBack: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How is my ballot kept completely secret?',
    answer:
      'SecureVote utilizes zero-knowledge cryptographic separation. When you sign in with your official Google account, the system validates your eligibility and generates an anonymous voter cryptographic hash. When you submit your vote, it is sealed into the SHA-256 ledger without any link to your name, email, or student roll number.',
    category: 'Security',
  },
  {
    question: 'Why does the login require a @kpriet.ac.in email address?',
    answer:
      'To ensure strict one-person-one-vote integrity, only authenticated members of KPR Institute of Engineering and Technology are permitted access. Personal accounts (e.g. personal @gmail.com or @yahoo.com) are automatically blocked by the collegiate Domain Guard.',
    category: 'Authentication',
  },
  {
    question: 'Can I change or cancel my vote after submitting?',
    answer:
      'No. In compliance with collegiate election regulations, once an anonymous ballot is cryptographically committed and sealed into the tamper-evident ledger, it is permanent and irreversible.',
    category: 'Voting',
  },
  {
    question: 'How do I submit a candidate nomination application?',
    answer:
      'If an election is currently accepting candidate nominations, eligible students will see an "Apply for Office" button on the Student Home portal. Fill in your manifesto and leadership platform. The faculty returning officer committee will review and approve valid nominations.',
    category: 'Candidacy',
  },
  {
    question: 'What should I do if my department or year is shown incorrectly?',
    answer:
      'Student departments and batches are synchronized from the official college voter registry. If your details need updating, you can adjust your section in the Institutional Profile page or contact the Election Helpdesk below with your roll number.',
    category: 'Profile',
  },
  {
    question: 'How do I verify that my vote was accurately counted?',
    answer:
      'Immediately after casting your ballot, you receive a digital Cryptographic Vote Receipt containing a unique SHA-256 confirmation hash and timestamp. You can view, save, or print this receipt at any time from your Student Portal.',
    category: 'Verification',
  },
];

export function HelpSupportPage({ onBack }: HelpSupportPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Ticket Form State
  const [category, setCategory] = useState('Voting Booth Issue');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTicketSubmitted(true);
      setSubject('');
      setMessage('');
      setTimeout(() => setTicketSubmitted(false), 5000);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col select-none antialiased">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2 min-w-0">
          <button
            onClick={onBack}
            className="w-8 h-8 sm:w-9 sm:h-9 -ml-1 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-bold text-slate-900 leading-none truncate">
              Election Help & Support
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
              KPRIET Election Helpdesk, FAQs & Incident Reporting
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-3.5 sm:px-6 py-5 sm:py-7 space-y-6">
        {/* Support Hero Card */}
        <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-brand-600 via-blue-600 to-indigo-700 text-white shadow-xl shadow-brand-500/20 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                How can we assist your vote?
              </h2>
              <p className="text-xs text-blue-100 leading-relaxed">
                Find quick answers below or connect directly with the campus election returning desk.
              </p>
            </div>
          </div>

          {/* Search FAQ */}
          <div className="relative pt-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 mt-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics (e.g. secrecy, receipt, nomination)..."
              className="w-full h-11 pl-10 pr-4 bg-white rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
            />
          </div>
        </div>

        {/* 3 Contact Quick Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="mailto:contact@ariseagency.in"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-300 shadow-xs transition-all flex flex-col justify-between space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mail className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Email Returning Desk</span>
              <span className="text-[11px] text-slate-400 font-mono truncate block mt-0.5">
                contact@ariseagency.in
              </span>
            </div>
          </a>

          <a
            href="tel:9025488266"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 shadow-xs transition-all flex flex-col justify-between space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Phone className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Campus Hotline</span>
              <span className="text-[11px] text-emerald-600 font-mono font-bold block mt-0.5">
                +91 90254 88266
              </span>
            </div>
          </a>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Helpdesk Location</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Student Affairs SA-204
              </span>
            </div>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <FileQuestion className="w-4.5 h-4.5 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Frequently Asked Questions ({filteredFaqs.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredFaqs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No matching topics found for "{searchQuery}". Please send an inquiry below.
              </p>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-3">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left gap-2 cursor-pointer group"
                    >
                      <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-brand-600 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="mt-2 text-xs text-slate-600 leading-relaxed pl-1 animate-fadeIn space-y-2">
                        <p>{faq.answer}</p>
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-mono text-[10px]">
                          Category: {faq.category}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Submit Inquiry Ticket Form */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <MessageSquare className="w-4.5 h-4.5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Submit an Inquiry / Report an Issue</h3>
              <p className="text-[11px] text-slate-400">Our returning officer desk responds within 2 hours during active polls</p>
            </div>
          </div>

          {ticketSubmitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Inquiry received! Ticket #SV-{Math.floor(100000 + Math.random() * 900000)} generated.</span>
            </div>
          )}

          <form onSubmit={handleTicketSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                >
                  <option value="Voting Booth Issue">Voting Booth / Ballot Issue</option>
                  <option value="Candidate Nomination">Candidate Nomination / Manifesto</option>
                  <option value="Login or SSO Error">Login or SSO Google Authentication</option>
                  <option value="Profile Correction">Profile or Department Correction</option>
                  <option value="General Question">General Election Question</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Subject Summary</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Could not view candidate manifesto"
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Detailed Description</label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe what happened, including any error messages..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Transmitting Ticket...' : 'Send Inquiry to Election Officers'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
