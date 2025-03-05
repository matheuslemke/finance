# Finance App

A modern finance application built with Next.js, Shadcn UI, Tailwind CSS, and Supabase.

## Features

- **Dashboard**: Overview of your financial status with key metrics
- **Transactions**: Track and manage your income and expenses
- **Reports**: Visualize your financial data with charts and statistics
- **Settings**: Manage your profile and application preferences
- **Database**: Store your transactions in Supabase

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework for building web applications
- [Shadcn UI](https://ui.shadcn.com/) - Re-usable UI components built with Radix UI and Tailwind CSS
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Supabase](https://supabase.com/) - Open source Firebase alternative

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Supabase account

### Supabase Setup

1. Create a new Supabase project at [https://app.supabase.com/](https://app.supabase.com/)
2. Create a new table called `transactions` with the following schema:

```sql
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('income', 'expense')),
  date timestamp with time zone not null,
  description text not null,
  category text not null,
  amount numeric not null check (amount > 0),
  account text not null,
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
│   │   └── add-transaction-dialog.tsx # Dialog for adding transactions
│   ├── context/              # React context
│   │   └── transaction-context.tsx # Transaction context provider
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
