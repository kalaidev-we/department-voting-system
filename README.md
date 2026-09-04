# SecureVote Campus — Secure College Voting & Election Platform

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_15+-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**SecureVote Campus** is a production-grade, cryptographically verifiable campus election and student governance platform designed for higher education institutions. Tailored for **KPR Institute of Engineering and Technology**, it guarantees secret ballots, zero voter coercion, verifiable cryptographic receipts, and real-time certified analytics.

---

## 🏛️ System Overview

SecureVote Campus replaces traditional paper and insecure online polls with an end-to-end verifiable voting protocol:

```
                          ┌───────────────────────────┐
                          │   College Google SSO      │
                          │   (@kpriet.ac.in Domain)  │
                          └─────────────┬─────────────┘
                                        │
                         ┌──────────────▼──────────────┐
                         │   Identity & Eligibility   │
                         │   (election_eligibility)   │
                         └──────────────┬─────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           │                                                         │
┌──────────▼──────────┐                                   ┌──────────▼──────────┐
│  Anonymous Ballot   │                                   │    Voter Receipt    │
│  (anonymous_votes)  │                                   │   (vote_receipts)   │
│  • Candidate Choice │                                   │  • SHA-256 Hash     │
│  • NO User ID       │                                   │  • Audit Code       │
└──────────┬──────────┘                                   └─────────────────────┘
           │
┌──────────▼──────────┐
│  Tamper-Evident     │
│  Hash Ledger        │
│  (vote_ledger)      │
│  • Block Linkage    │
└─────────────────────┘
```

---

## ✨ Key Features

### 1. Cryptographic Anonymous Voting Architecture
- **Strict Decoupling**: Voter participation tracking (`election_eligibility`) is stored independently from ballot choices (`anonymous_votes`).
- **Tamper-Evident Ledger**: Every ballot is cryptographically linked to previous votes using SHA-256 block hash chaining (`vote_ledger`).
- **Cryptographic Receipts**: Voters receive an irreversible verification hash (`vote_receipts`) and unique 8-character verification code proving their vote was counted without revealing candidate selection.

### 2. Domain-Enforced College Authentication
- **Strict Domain Gatekeeping**: Only official institutional Google accounts ending with `@kpriet.ac.in` can authenticate.
- **Master Admin Bypass**: Designated Super Administrator account is exempt from institutional domain rejection and granted full governance privileges.
- **Dual Login Methods**:
  - **Google SSO**: Instant authentication for students and faculty.
  - **Institutional Credentials**: Direct password authentication for Master Admin and staff administrators.

### 3. Automatic Student ID & Roll Number Intelligence
- Automatically detects student roll patterns (e.g., `26SCL03`):
  - **Admission Year**: 2026
  - **Department**: Cybersecurity Department (`SC`)
  - **Entry Type**: Lateral Entry (`L`)
  - **Academic Standing**: 2nd Year
  - **Batch Allocation**: Batch of 2026

### 4. Multi-Role Governance Model

#### 👑 Master Administrator (`SUPER_ADMIN`)
- **Faculty & Staff Management**: Enroll faculty members, assign designations, and grant election officer permissions.
- **Student Roster Governance**: View and search student voter registrations and import CSV rosters.
- **Cryptographic Ledger Audit**: Inspect blockchain hash integrity and block verification timestamps.
- **Security Operations Center**: Live threat log, domain rejection telemetry, and security event audits.

#### 👨‍🏫 Staff / Election Officer (`STAFF_ADMIN`)
- **Election Management**: Create and schedule college-wide or department-specific elections with strict eligibility rules.
- **Candidate Addition**: Nominate candidates directly with symbols, portraits, slogans, and campaign manifestos.
- **Application Review**: Review student candidacy filings with approval and rejection workflows.
- **Real-Time Certified Analytics**: Projected winners, candidate percentage bars, turnouts by academic year, and CSV result exports.
- **Faculty Voting Rights**: Staff members are eligible to cast official ballots in eligible elections.

#### 🎓 Student Voter (`STUDENT`)
- **Interactive Voting Booth**: Compare candidate manifestos, key campaign promises, and symbols before casting a ballot.
- **Immediate Digital Receipt**: Downloadable and printable cryptographic receipt.
- **Candidate Application Filing**: Submit candidacy with custom symbols, slogans, and platform manifestos.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | Fast, responsive single-page application |
| **Language** | TypeScript | Strict type safety and complete interfaces |
| **Styling** | Tailwind CSS | Modern institutional UI with smooth responsive layout |
| **Icons** | Lucide React | Lightweight, consistent iconography |
| **Database** | Supabase (PostgreSQL 15+) | Relational storage with strict Row Level Security (RLS) |
| **Authentication** | Supabase Auth (GoTrue) | Direct Google OAuth SSO and Supabase Email/Password authentication |
| **Cryptography** | Web Crypto API + `pgcrypto` | Client-side and server-side SHA-256 digest calculation |

---

## 📁 Repository Structure

```
├── database.sql               # Master idempotent PostgreSQL schema & RLS policies
├── index.html                 # HTML shell with mobile viewport & Google fonts
├── package.json               # NPM scripts and dependencies
├── tailwind.config.js         # Custom institutional theme tokens
├── vite.config.ts             # Vite build and plugin configuration
├── public/                    # Static assets and icons
└── src/
    ├── App.tsx                # Central role-based router & layout shell
    ├── components/
    │   ├── auth/              # Domain rejection and security screens
    │   ├── common/            # Dropdowns, loaders, and badges
    │   └── staff/             # Quick actions, election summary cards, navigation
    ├── context/
    │   └── AuthContext.tsx    # Supabase session, Google SSO, and role hydration
    ├── lib/
    │   ├── domainValidator.ts # Domain rules (@kpriet.ac.in) & Master Admin config
    │   ├── studentParser.ts   # Roll number regex intelligence and department mapping
    │   ├── supabase.ts        # Supabase client initialization
    │   └── types.ts           # TypeScript type definitions
    ├── pages/
    │   ├── LoginPage.tsx      # Dual Google SSO & Institutional credentials portal
    │   ├── ProfileCompletionPage.tsx # First-time student profile onboarding
    │   ├── admin/             # Master Admin consoles (Staff, Students, Audit, Security)
    │   ├── staff/             # Election Officer views (Candidates, Elections, Analytics)
    │   └── student/           # Student voter experience (Booth, Receipt, Nomination)
    └── services/
        ├── adminService.ts    # Staff enrollment, roster, and audit log services
        ├── authService.ts     # OAuth helpers and identity extraction
        ├── profileService.ts  # Database profile syncing and role assignment
        └── votingService.ts   # Ballot casting, candidate loading, cryptographic receipts
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **NPM**: v9.0.0 or higher
- **Supabase Account**: With a new or existing project

### 1. Clone the Repository
```bash
git clone https://github.com/kalaidev-we/department-voting-system.git
cd department-voting-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Initialization
1. Log in to your [Supabase Dashboard](https://app.supabase.com/).
2. Navigate to **SQL Editor**.
3. Copy and paste the entire contents of [`database.sql`](./database.sql).
4. Click **Run**.

> [!NOTE]
> The database script is completely idempotent. It creates all tables, functions, triggers, cryptographic extensions (`pgcrypto`, `uuid-ossp`), Row Level Security (RLS) policies, and seeds the Master Admin account.

### 4. Configure Environment Variables (Optional)
Create a `.env` file in the root directory if customizing endpoints:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ALLOWED_DOMAIN=@kpriet.ac.in
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Build for Production
```bash
npm run build
```
Generates production-optimized static assets in the `dist/` folder.

---

## 🔐 Master Administrator Access

The initial Super Administrator account is configured securely in `database.sql` (Section 12).

### Accessing the Master Governance Console
1. Open the application at [http://localhost:5173](http://localhost:5173).
2. Click the **Admin & Faculty** tab on the login card.
3. Sign in using your configured administrator credentials or authorized administrator Google account.
4. Upon authentication, users with the `SUPER_ADMIN` role are automatically routed to the Master Governance Dashboard.

> [!TIP]
> Administrators can manage faculty permissions, candidate nominations, student rosters, and view tamper-evident cryptographic audit logs directly from the Master Governance Console.

---


## 🔒 Security & Privacy Guarantees

1. **Secret Ballot Guarantee**: No record links voter identities (`election_eligibility`) to candidate choices (`anonymous_votes`).
2. **Double-Voting Prevention**: Database unique constraints enforce `UNIQUE(election_id, student_id)` on voter eligibility.
3. **Coercion Resistance**: Receipts prove that a vote was recorded in the ledger without indicating which candidate was selected.
4. **Row Level Security (RLS)**: Enforced directly at the PostgreSQL engine level; clients cannot read unauthorized rows regardless of frontend code modifications.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🏫 Institutional Accreditation

Developed for **KPR Institute of Engineering and Technology (KPRIET)**  
*Arasur, Coimbatore, Tamil Nadu, India — 641407*
