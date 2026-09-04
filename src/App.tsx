import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { LoginPage } from './pages/LoginPage';
import { DomainErrorScreen } from './components/auth/DomainErrorScreen';
import { ProfileCompletionPage } from './pages/ProfileCompletionPage';

// Common System & User Pages
import { ProfilePage } from './pages/common/ProfilePage';
import { SettingsPage } from './pages/common/SettingsPage';
import { HelpSupportPage } from './pages/common/HelpSupportPage';
import { NotFoundPage } from './pages/common/NotFoundPage';
import { OfflinePage } from './pages/common/OfflinePage';
import { ErrorPage } from './pages/common/ErrorPage';
import { SlowInternetPage } from './pages/common/SlowInternetPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Staff Admin Pages
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { StaffElectionsPage } from './pages/staff/StaffElectionsPage';
import { CreateElectionPage } from './pages/staff/CreateElectionPage';
import { StaffCandidatesPage } from './pages/staff/StaffCandidatesPage';
import { StaffAddCandidatePage } from './pages/staff/StaffAddCandidatePage';
import { StaffApplicationsPage } from './pages/staff/StaffApplicationsPage';
import { StaffAnalyticsPage } from './pages/staff/StaffAnalyticsPage';
import { StaffReportsPage } from './pages/staff/StaffReportsPage';

// Student Pages
import { StudentHomePage } from './pages/student/StudentHomePage';
import { VotingPage } from './pages/student/VotingPage';
import { VoteSuccessPage } from './pages/student/VoteSuccessPage';
import { CandidateApplyPage } from './pages/student/CandidateApplyPage';

// Super Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminElectionsPage } from './pages/admin/AdminElectionsPage';
import { AdminEditElectionPage } from './pages/admin/AdminEditElectionPage';
import { AdminStaffPage } from './pages/admin/AdminStaffPage';
import { AdminAddStaffPage } from './pages/admin/AdminAddStaffPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSecurityEventsPage } from './pages/admin/AdminSecurityEventsPage';

import { VoteReceipt, Election } from './lib/types';
import { fetchStaffElections } from './services/electionService';
import { Shield, WifiOff } from 'lucide-react';

function ApplicationRouter() {
  const {
    isAuthenticated,
    isLoading,
    profile,
    role,
    domainError,
    authMessage,
    clearDomainError,
    signInWithGoogle,
    signOut,
  } = useAuth();

  // Navigation states for Student
  const [studentTab, setStudentTab] = useState<'home' | 'vote' | 'success' | 'apply'>('home');
  const [activeElectionId, setActiveElectionId] = useState<string>('');
  const [activeReceipt, setActiveReceipt] = useState<VoteReceipt | null>(null);

  // Navigation states for Staff Admin
  const [staffTab, setStaffTab] = useState<
    | 'home'
    | 'elections'
    | 'create_election'
    | 'candidates'
    | 'add_candidate'
    | 'applications'
    | 'analytics'
    | 'reports'
    | 'staff_vote'
    | 'staff_receipt'
    | 'more'
  >('home');
  const [staffReceipt, setStaffReceipt] = useState<VoteReceipt | null>(null);
  const [staffActiveElectionId, setStaffActiveElectionId] = useState<string>('');

  // Auto-resolve the active election ID from the database for staff & admin voting
  useEffect(() => {
    async function resolveActiveElection() {
      try {
        const elections = await fetchStaffElections();
        const active = elections.find((e) => e.status === 'ACTIVE') || elections[0];
        if (active) {
          setStaffActiveElectionId(active.id);
          // Also update student's activeElectionId if it hasn't been set yet
          if (!activeElectionId) {
            setActiveElectionId(active.id);
          }
        }
      } catch {
        // Ignore
      }
    }
    if (isAuthenticated && profile) {
      resolveActiveElection();
    }
  }, [isAuthenticated, profile]);

  // Navigation states for Super Admin
  const [adminTab, setAdminTab] = useState<
    | 'home'
    | 'admin_elections'
    | 'admin_create_election'
    | 'admin_edit_election'
    | 'admin_candidates'
    | 'admin_add_candidate'
    | 'admin_applications'
    | 'admin_analytics'
    | 'admin_reports'
    | 'admin_staff_console'
    | 'admin_vote'
    | 'admin_receipt'
    | 'admin_staff'
    | 'admin_add_staff'
    | 'admin_students'
    | 'admin_audit'
    | 'admin_security'
  >('home');
  const [adminReceipt, setAdminReceipt] = useState<VoteReceipt | null>(null);
  const [selectedElectionForEdit, setSelectedElectionForEdit] = useState<Election | null>(null);

  // Global / Common Navigation states (Profile, Settings, Help, 404, Offline, Error, Slow Internet)
  const [commonView, setCommonView] = useState<
    null | 'profile' | 'settings' | 'help' | '404' | 'offline' | 'error' | 'slow_internet'
  >(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper to optionally wrap content with connectivity banner when offline
  const wrapWithOfflineBanner = (content: React.ReactElement) => {
    if (!isOffline || commonView === 'offline') return content;
    return (
      <div className="min-h-screen w-full flex flex-col">
        <div className="bg-amber-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between shadow-md sticky top-0 z-50 select-none">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>You are currently offline. Real-time voting sync will resume once reconnected.</span>
          </div>
          <button
            onClick={() => setCommonView('offline')}
            className="underline hover:text-amber-100 cursor-pointer font-bold text-xs ml-4 shrink-0"
          >
            Check Status
          </button>
        </div>
        <div className="flex-1 flex flex-col">{content}</div>
      </div>
    );
  };

  // Handle Clerk SSO redirect callback
  if (window.location.pathname.startsWith('/sso-callback')) {
    return <AuthenticateWithRedirectCallback signUpForceRedirectUrl="/" signInForceRedirectUrl="/" />;
  }

  // 1. Show professional Domain Rejection Screen if email domain was rejected
  if (domainError) {
    return (
      <DomainErrorScreen
        rejectedEmail={domainError}
        onTryAnotherAccount={() => {
          clearDomainError();
        }}
        onBackToLogin={() => {
          clearDomainError();
        }}
      />
    );
  }

  // 2. Production Loading / Verification state
  if (isLoading && !profile) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center space-y-4 p-4 select-none">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield className="w-7 h-7" />
          </div>
          <div className="absolute -inset-1 rounded-2xl border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold text-slate-900">
            {authMessage || 'Securing Campus Session...'}
          </h3>
          <p className="text-xs text-slate-400">Verifying college credentials (@kpriet.ac.in)</p>
        </div>
      </div>
    );
  }

  // Check if URL is an unknown path that should trigger 404
  const isUnknownRoute =
    window.location.pathname !== '/' &&
    !window.location.pathname.startsWith('/sso-callback');

  // Common View Screens (404, Offline, Error, Slow Internet, Help, Settings, Profile)
  if (commonView === '404' || isUnknownRoute) {
    return wrapWithOfflineBanner(
      <NotFoundPage
        onBackToHome={() => {
          if (window.location.pathname !== '/') {
            window.history.pushState({}, '', '/');
          }
          setCommonView(null);
        }}
        onOpenHelp={() => setCommonView('help')}
      />
    );
  }

  if (commonView === 'offline') {
    return (
      <OfflinePage
        onRetryConnection={() => {
          if (navigator.onLine) {
            setIsOffline(false);
            setCommonView(null);
          }
        }}
        onBackToHome={() => setCommonView(null)}
      />
    );
  }

  if (commonView === 'error') {
    return wrapWithOfflineBanner(
      <ErrorPage
        onResetError={() => setCommonView(null)}
        onBackToHome={() => setCommonView(null)}
      />
    );
  }

  if (commonView === 'slow_internet') {
    return wrapWithOfflineBanner(
      <SlowInternetPage
        onRetry={() => setCommonView(null)}
        onContinueLowBandwidth={() => setCommonView(null)}
        onBackToHome={() => setCommonView(null)}
      />
    );
  }

  if (commonView === 'help') {
    return wrapWithOfflineBanner(<HelpSupportPage onBack={() => setCommonView(null)} />);
  }

  // 3. Unauthenticated -> Show pristine Login Page
  if (!isAuthenticated || !profile) {
    return wrapWithOfflineBanner(<LoginPage />);
  }

  if (commonView === 'settings') {
    return wrapWithOfflineBanner(
      <SettingsPage
        onBack={() => setCommonView(null)}
        onSimulatePage={(type) => setCommonView(type)}
      />
    );
  }

  if (commonView === 'profile') {
    return wrapWithOfflineBanner(<ProfilePage onBack={() => setCommonView(null)} />);
  }

  // 4. Student onboarding (Profile completion) if required fields are missing
  if (role === 'STUDENT' && !profile.is_profile_complete) {
    return wrapWithOfflineBanner(
      <ProfileCompletionPage
        onCompleted={() => {
          // Profile is complete, automatically navigates to student home
        }}
      />
    );
  }

  // 5. Super Admin Governance Flow (All Staff + Institutional Governance Capabilities)
  if (role === 'SUPER_ADMIN') {
    const handleAdminNavigation = (tab: string) => {
      if (tab === 'profile' || tab === 'settings' || tab === 'help') {
        setCommonView(tab as any);
        return;
      }
      if (tab === '404' || tab === 'offline' || tab === 'error' || tab === 'slow_internet') {
        setCommonView(tab as any);
        return;
      }
      if (tab === 'home' || tab === 'admin_home') setAdminTab('home');
      else if (tab === 'elections') setAdminTab('admin_elections');
      else if (tab === 'create_election') setAdminTab('admin_create_election');
      else if (tab === 'candidates') setAdminTab('admin_candidates');
      else if (tab === 'add_candidate') setAdminTab('admin_add_candidate');
      else if (tab === 'applications' || tab === 'more') setAdminTab('admin_applications');
      else if (tab === 'analytics') setAdminTab('admin_analytics');
      else if (tab === 'reports') setAdminTab('admin_reports');
      else if (tab === 'staff_vote' || tab === 'admin_vote') setAdminTab('admin_vote');
      else if (tab === 'staff_receipt' || tab === 'admin_receipt') setAdminTab('admin_receipt');
      else if (tab === 'admin_staff_console') setAdminTab('admin_staff_console');
      else setAdminTab(tab as any);
    };

    // Election Governance & CRUD
    if (adminTab === 'admin_elections') {
      return wrapWithOfflineBanner(
        <AdminElectionsPage
          onBack={() => setAdminTab('home')}
          onCreateElection={() => setAdminTab('admin_create_election')}
          onEditElection={(el) => {
            setSelectedElectionForEdit(el);
            setAdminTab('admin_edit_election');
          }}
        />
      );
    }
    if (adminTab === 'admin_create_election') {
      return wrapWithOfflineBanner(
        <CreateElectionPage
          onBack={() => setAdminTab('admin_elections')}
          onCreated={() => setAdminTab('admin_elections')}
        />
      );
    }
    if (adminTab === 'admin_edit_election' && selectedElectionForEdit) {
      return wrapWithOfflineBanner(
        <AdminEditElectionPage
          election={selectedElectionForEdit}
          onBack={() => setAdminTab('admin_elections')}
          onUpdated={() => setAdminTab('admin_elections')}
        />
      );
    }

    // Staff Capabilities for Super Admin: Candidates Management
    if (adminTab === 'admin_candidates') {
      return wrapWithOfflineBanner(
        <StaffCandidatesPage
          onNavigateTab={handleAdminNavigation}
        />
      );
    }
    if (adminTab === 'admin_add_candidate') {
      return wrapWithOfflineBanner(
        <StaffAddCandidatePage
          onBack={() => setAdminTab('admin_candidates')}
          onSuccess={() => setAdminTab('admin_candidates')}
        />
      );
    }

    // Staff Capabilities for Super Admin: Nomination Applications
    if (adminTab === 'admin_applications') {
      return wrapWithOfflineBanner(
        <StaffApplicationsPage
          onNavigateTab={handleAdminNavigation}
        />
      );
    }

    // Staff Capabilities for Super Admin: Analytics & Live Tallies
    if (adminTab === 'admin_analytics') {
      return wrapWithOfflineBanner(
        <StaffAnalyticsPage
          onNavigateTab={handleAdminNavigation}
        />
      );
    }

    // Staff Capabilities for Super Admin: Reports & CSV Export
    if (adminTab === 'admin_reports') {
      return wrapWithOfflineBanner(
        <StaffReportsPage
          onNavigateTab={handleAdminNavigation}
        />
      );
    }

    // Staff Capabilities for Super Admin: Staff Dashboard Console View
    if (adminTab === 'admin_staff_console') {
      return wrapWithOfflineBanner(
        <StaffDashboardPage
          onNavigateTab={handleAdminNavigation}
          onViewStaffReceipt={(receipt) => {
            setAdminReceipt(receipt);
            setAdminTab('admin_receipt');
          }}
        />
      );
    }

    // Super Admin Casting Vote
    if (adminTab === 'admin_vote') {
      return wrapWithOfflineBanner(
        <VotingPage
          electionId={staffActiveElectionId || activeElectionId}
          onBack={() => setAdminTab('home')}
          onVoteSuccess={(receipt) => {
            setAdminReceipt(receipt);
            setAdminTab('admin_receipt');
          }}
        />
      );
    }

    // Super Admin Viewing Digital Receipt
    if (adminTab === 'admin_receipt' && adminReceipt) {
      return wrapWithOfflineBanner(
        <VoteSuccessPage
          receipt={adminReceipt}
          onDone={() => setAdminTab('home')}
        />
      );
    }

    // Super Admin Institutional Governance Consoles
    if (adminTab === 'admin_staff') {
      return wrapWithOfflineBanner(
        <AdminStaffPage
          onBack={() => setAdminTab('home')}
          onAddNewStaff={() => setAdminTab('admin_add_staff')}
        />
      );
    }
    if (adminTab === 'admin_add_staff') {
      return wrapWithOfflineBanner(
        <AdminAddStaffPage
          onBack={() => setAdminTab('admin_staff')}
          onSuccess={() => setAdminTab('admin_staff')}
        />
      );
    }
    if (adminTab === 'admin_students') {
      return wrapWithOfflineBanner(<AdminStudentsPage onBack={() => setAdminTab('home')} />);
    }
    if (adminTab === 'admin_audit') {
      return wrapWithOfflineBanner(<AdminAuditLogsPage onBack={() => setAdminTab('home')} />);
    }
    if (adminTab === 'admin_security') {
      return wrapWithOfflineBanner(<AdminSecurityEventsPage onBack={() => setAdminTab('home')} />);
    }
    return wrapWithOfflineBanner(
      <AdminDashboardPage
        onNavigateTab={handleAdminNavigation}
      />
    );
  }

  // 6. Staff Admin Flow
  if (role === 'STAFF_ADMIN') {
    const handleStaffNavigation = (tab: string) => {
      if (tab === 'profile' || tab === 'settings' || tab === 'help') {
        setCommonView(tab as any);
        return;
      }
      if (tab === '404' || tab === 'offline' || tab === 'error' || tab === 'slow_internet') {
        setCommonView(tab as any);
        return;
      }
      setStaffTab(tab as any);
    };

    if (staffTab === 'create_election') {
      return wrapWithOfflineBanner(
        <CreateElectionPage
          onBack={() => setStaffTab('home')}
          onCreated={() => setStaffTab('elections')}
        />
      );
    }

    if (staffTab === 'elections') {
      return wrapWithOfflineBanner(
        <StaffElectionsPage
          onNavigateTab={handleStaffNavigation}
        />
      );
    }

    if (staffTab === 'candidates') {
      return wrapWithOfflineBanner(
        <StaffCandidatesPage
          onNavigateTab={handleStaffNavigation}
        />
      );
    }

    if (staffTab === 'add_candidate') {
      return wrapWithOfflineBanner(
        <StaffAddCandidatePage
          onBack={() => setStaffTab('candidates')}
          onSuccess={() => setStaffTab('candidates')}
        />
      );
    }

    if (staffTab === 'applications' || staffTab === 'more') {
      return wrapWithOfflineBanner(
        <StaffApplicationsPage
          onNavigateTab={handleStaffNavigation}
        />
      );
    }

    if (staffTab === 'analytics') {
      return wrapWithOfflineBanner(
        <StaffAnalyticsPage
          onNavigateTab={handleStaffNavigation}
        />
      );
    }

    if (staffTab === 'reports') {
      return wrapWithOfflineBanner(
        <StaffReportsPage
          onNavigateTab={handleStaffNavigation}
        />
      );
    }

    // Staff Member Casting Ballot
    if (staffTab === 'staff_vote') {
      return wrapWithOfflineBanner(
        <VotingPage
          electionId={staffActiveElectionId || activeElectionId}
          onBack={() => setStaffTab('home')}
          onVoteSuccess={(receipt) => {
            setStaffReceipt(receipt);
            setStaffTab('staff_receipt');
          }}
        />
      );
    }

    // Staff Member Viewing Their Receipt
    if (staffTab === 'staff_receipt' && staffReceipt) {
      return wrapWithOfflineBanner(
        <VoteSuccessPage
          receipt={staffReceipt}
          onDone={() => setStaffTab('home')}
        />
      );
    }

    // Default: Staff Dashboard Home
    return wrapWithOfflineBanner(
      <StaffDashboardPage
        onNavigateTab={handleStaffNavigation}
        onViewStaffReceipt={(receipt) => {
          setStaffReceipt(receipt);
          setStaffTab('staff_receipt');
        }}
      />
    );
  }

  // 7. Student Flow
  const handleStudentNavigation = (tab: string) => {
    if (tab === 'profile' || tab === 'settings' || tab === 'help') {
      setCommonView(tab as any);
      return;
    }
    if (tab === '404' || tab === 'offline' || tab === 'error' || tab === 'slow_internet') {
      setCommonView(tab as any);
      return;
    }
    setStudentTab(tab as any);
  };

  if (studentTab === 'vote') {
    return wrapWithOfflineBanner(
      <VotingPage
        electionId={activeElectionId}
        onBack={() => setStudentTab('home')}
        onVoteSuccess={(receipt) => {
          setActiveReceipt(receipt);
          setStudentTab('success');
        }}
      />
    );
  }

  if (studentTab === 'success' && activeReceipt) {
    return wrapWithOfflineBanner(
      <VoteSuccessPage
        receipt={activeReceipt}
        onDone={() => setStudentTab('home')}
      />
    );
  }

  if (studentTab === 'apply') {
    return wrapWithOfflineBanner(
      <CandidateApplyPage
        onBack={() => setStudentTab('home')}
        onSuccess={() => setStudentTab('home')}
      />
    );
  }

  // Default: Student Home Dashboard
  return wrapWithOfflineBanner(
    <StudentHomePage
      onEnterVotingBooth={(elId) => {
        setActiveElectionId(elId);
        setStudentTab('vote');
      }}
      onApplyForCandidacy={(elId) => {
        setActiveElectionId(elId);
        setStudentTab('apply');
      }}
      onViewReceipt={(receipt) => {
        setActiveReceipt(receipt);
        setStudentTab('success');
      }}
      onNavigateTab={handleStudentNavigation}
    />
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen w-full bg-slate-50 flex flex-col relative">
          {/* Application Content */}
          <ApplicationRouter />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
