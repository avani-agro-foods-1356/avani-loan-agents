import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AVANI LOAN SERVICES - Expert Loan Consultancy & Advisory',
  description: 'AVANI LOAN SERVICES provides professional financial consultancy and loan advisory services in Latur, Maharashtra. Personal Loans, Business Loans, Doctor Loans, Home Loans, and Global Education Funding.',
  keywords: 'loan services, loan consultancy, personal loan, business loan, doctor loan, home loan, education loan, global studies funding, Latur, Sachin Shinde, Avani Finserv',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
