import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DomainErrorScreen } from './components/auth/DomainErrorScreen';
import { ProfileCompletionPage } from './pages/ProfileCompletionPage';

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
import { Shield } from 'lucide-react';

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
  const [activeElectionId, setActiveElectionId] = useState<string>('el-001');
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

  // Handle SSO redirect cleanup if needed
  if (window.location.pathname.startsWith('/sso-callback')) {
    window.location.replace('/');
    return null;
  }

  // 1. Show professional Domain Rejection Screen if email domain was rejected
  if (domainError) {
    return (
      <DomainErrorScreen
        rejectedEmail={domainError}
        onTryAnotherAccount={() => {
          clearDomainError();
          signInWithGoogle();
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

  // 3. Unauthenticated -> Show pristine Login Page
  if (!isAuthenticated || !profile) {
    return <LoginPage />;
  }

  // 4. Student onboarding (Profile completion) if required fields are missing
  if (role === 'STUDENT' && !profile.is_profile_complete) {
    return (
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
      return (
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
      return (
        <CreateElectionPage
          onBack={() => setAdminTab('admin_elections')}
          onCreated={() => setAdminTab('admin_elections')}
        />
      );
    }
    if (adminTab === 'admin_edit_election' && selectedElectionForEdit) {
      return (
        <AdminEditElectionPage
          election={selectedElectionForEdit}
          onBack={() => setAdminTab('admin_elections')}
          onUpdated={() => setAdminTab('admin_elections')}
        />
      );
    }

    // Staff Capabilities for Super Admin: Candidates Management
    if (adminTab === 'admin_candidates') {
      return (
        <StaffCandidatesPage
          onNavigateTab={handleAdminNavigation}
        />
      );
    }
    if (adminTab === 'admin_add_candidate') {
      return (
        <StaffAddCandidatePage
          onBack={() => setAdminTab('admin_candidates')}
          onSuccess={() => setAdminTab('admin_candidates')}
        />
      );
    }

    // Staff Capabilities for Super Admin: Nomination Applications
    if (adminTab === 'admin_applications') {
      return (
        <StaffApplicationsPage
          onNavigateTab={handleAdminNavigation}
        />
      );
    }

    // Staff Capabilities for Super Admin: Analytics & Live Tallies
    if (adminTab === 'admin_analytics') {
      return (
        <StaffAnalyticsPage
          onNavigateTab={handleAdminNavigation}
        />
      );
    }

    // Staff Capabilities for Super Admin: Reports & CSV Export
    if (adminTab === 'admin_reports') {
      return (
        <StaffReportsPage
          onNavigateTab={handleAdminNavigation}
        />
      );
    }

    // Staff Capabilities for Super Admin: Staff Dashboard Console View
    if (adminTab === 'admin_staff_console') {
      return (
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
      return (
        <VotingPage
          electionId={activeElectionId || 'el-001'}
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
      return (
        <VoteSuccessPage
          receipt={adminReceipt}
          onDone={() => setAdminTab('home')}
        />
      );
    }

    // Super Admin Institutional Governance Consoles
    if (adminTab === 'admin_staff') {
      return (
        <AdminStaffPage
          onBack={() => setAdminTab('home')}
          onAddNewStaff={() => setAdminTab('admin_add_staff')}
        />
      );
    }
    if (adminTab === 'admin_add_staff') {
      return (
        <AdminAddStaffPage
          onBack={() => setAdminTab('admin_staff')}
          onSuccess={() => setAdminTab('admin_staff')}
        />
      );
    }
    if (adminTab === 'admin_students') {
      return <AdminStudentsPage onBack={() => setAdminTab('home')} />;
    }
    if (adminTab === 'admin_audit') {
      return <AdminAuditLogsPage onBack={() => setAdminTab('home')} />;
    }
    if (adminTab === 'admin_security') {
      return <AdminSecurityEventsPage onBack={() => setAdminTab('home')} />;
    }
    return (
      <AdminDashboardPage
        onNavigateTab={handleAdminNavigation}
      />
    );
  }

  // 6. Staff Admin Flow
  if (role === 'STAFF_ADMIN') {
    if (staffTab === 'create_election') {
      return (
        <CreateElectionPage
          onBack={() => setStaffTab('home')}
          onCreated={() => setStaffTab('elections')}
        />
      );
    }

    if (staffTab === 'elections') {
      return (
        <StaffElectionsPage
          onNavigateTab={(tab: string) => setStaffTab(tab as any)}
        />
      );
    }

    if (staffTab === 'candidates') {
      return (
        <StaffCandidatesPage
          onNavigateTab={(tab: string) => setStaffTab(tab as any)}
        />
      );
    }

    if (staffTab === 'add_candidate') {
      return (
        <StaffAddCandidatePage
          onBack={() => setStaffTab('candidates')}
          onSuccess={() => setStaffTab('candidates')}
        />
      );
    }

    if (staffTab === 'applications' || staffTab === 'more') {
      return (
        <StaffApplicationsPage
          onNavigateTab={(tab: string) => setStaffTab(tab as any)}
        />
      );
    }

    if (staffTab === 'analytics') {
      return (
        <StaffAnalyticsPage
          onNavigateTab={(tab: string) => setStaffTab(tab as any)}
        />
      );
    }

    if (staffTab === 'reports') {
      return (
        <StaffReportsPage
          onNavigateTab={(tab: string) => setStaffTab(tab as any)}
        />
      );
    }

    // Staff Member Casting Ballot
    if (staffTab === 'staff_vote') {
      return (
        <VotingPage
          electionId="el-001"
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
      return (
        <VoteSuccessPage
          receipt={staffReceipt}
          onDone={() => setStaffTab('home')}
        />
      );
    }

    // Default: Staff Dashboard Home
    return (
      <StaffDashboardPage
        onNavigateTab={(tab: string) => setStaffTab(tab as any)}
        onViewStaffReceipt={(receipt) => {
          setStaffReceipt(receipt);
          setStaffTab('staff_receipt');
        }}
      />
    );
  }

  // 7. Student Flow
  if (studentTab === 'vote') {
    return (
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
    return (
      <VoteSuccessPage
        receipt={activeReceipt}
        onDone={() => setStudentTab('home')}
      />
    );
  }

  if (studentTab === 'apply') {
    return (
      <CandidateApplyPage
        onBack={() => setStudentTab('home')}
        onSuccess={() => setStudentTab('home')}
      />
    );
  }

  // Default: Student Home Dashboard
  return (
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
    />
  );
}

export function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen w-full bg-slate-50 flex flex-col relative">
        {/* Application Content */}
        <ApplicationRouter />
      </div>
    </AuthProvider>
  );
}

export default App;
