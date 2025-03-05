# Finance App

A modern finance application built with Next.js, Shadcn UI, Tailwind CSS, and Supabase.

## Features

- **Dashboard**: Overview of your financial status with key metrics
- **Transactions**: Track and manage your income and expenses
- **Categories**: Manage categories for your transactions
- **Accounts**: Manage your bank accounts and credit cards
- **Reports**: Visualize your financial data with charts and statistics
- **Settings**: Manage your profile and application preferences
- **Database**: Store your transactions in Supabase
- **Theme**: Toggle between light and dark mode

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework for building web applications
- [Shadcn UI](https://ui.shadcn.com/) - Re-usable UI components built with Radix UI and Tailwind CSS
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme management for Next.js

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Supabase account

### Supabase Setup

1. Create a new Supabase project at [https://app.supabase.com/](https://app.supabase.com/)
2. Create the following tables:

#### Categories Table

```sql
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null check (type in ('income', 'expense', 'both')),
  color text,
  icon text
);
```

#### Accounts Table

```sql
create table accounts (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null check (type in ('checking', 'savings', 'credit_card', 'investment', 'cash', 'digital_wallet')),
  institution text,
  color text,
  icon text,
  balance numeric default 0,
  credit_limit numeric,
  closing_day integer,
  due_day integer
);
```

#### Transactions Table

```sql
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('income', 'expense')),
  date timestamp with time zone not null,
  description text not null,
  category_id uuid not null references categories(id),
  amount numeric not null check (amount > 0),
  account_id uuid not null references accounts(id),
  wedding_category text,
  class text not null check (class in ('essential', 'non-essential', 'investment', 'income', 'business'))
);
```

3. Get your Supabase URL and anon key from the project settings
4. Create a `.env.local` file in the root of your project and add the following:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/finance-app.git
cd finance-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
finance/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── accounts/         # Accounts page
│   │   ├── categories/       # Categories page
│   │   ├── transactions/     # Transactions page
│   │   ├── reports/          # Reports page
│   │   ├── settings/         # Settings page
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home/Dashboard page
│   ├── components/           # React components
│   │   ├── ui/               # Shadcn UI components
│   │   ├── dashboard-layout.tsx # Dashboard layout component
│   │   ├── transaction-form.tsx # Transaction form component
│   │   ├── theme-provider.tsx # Theme provider component
│   │   ├── theme-toggle.tsx  # Theme toggle component
│   │   └── add-transaction-dialog.tsx # Dialog for adding transactions
│   ├── context/              # React context
│   │   ├── transaction-context.tsx # Transaction context provider
│   │   ├── category-context.tsx # Category context provider
│   │   └── account-context.tsx # Account context provider
│   ├── lib/                  # Utility functions
│   │   ├── utils.ts          # General utilities
│   │   └── supabase.ts       # Supabase client and functions
│   └── types/                # TypeScript types
│       └── index.ts          # Type definitions
├── public/                   # Static assets
├── .env.local                # Environment variables (not in git)
├── .env.example              # Example environment variables
├── package.json              # Project dependencies
└── README.md                 # Project documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
