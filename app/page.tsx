'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Briefcase, 
  Stethoscope, 
  Home, 
  FileText, 
  GraduationCap, 
  School, 
  MessageSquare, 
  LayoutDashboard,
  MapPin,
  Mail,
  PhoneCall,
  Clock
} from 'lucide-react';

export default function HomePage() {
  const [loanAmount, setLoanAmount] = useState(1000000); // 10 Lakhs default
  const [interestRate, setInterestRate] = useState(9.5); // 9.5% default
  const [loanTenure, setLoanTenure] = useState(120); // 10 years (120 months) default
  const [loanType, setLoanType] = useState('Personal Loan');

  // Interactive Live EMI Calculations
  const monthlyRate = interestRate / 12 / 100;
  let emi = 0;
  if (monthlyRate === 0) {
    emi = loanAmount / loanTenure;
  } else {
    emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTenure)) /
          (Math.pow(1 + monthlyRate, loanTenure) - 1);
  }
  const totalPayment = emi * loanTenure;
  const totalInterest = totalPayment - loanAmount;

  const roundedEMI = Math.round(emi);
  const roundedInterest = Math.round(totalInterest);
  const roundedTotal = Math.round(totalPayment);
  const interestPercentage = Math.round((roundedInterest / roundedTotal) * 100) || 0;
  const principalPercentage = 100 - interestPercentage;

  const services = [
    {
      title: 'Personal Loan',
      desc: 'Flexible funding for salaried and self-employed professionals to meet immediate financial needs.',
      icon: <User size={24} />,
      badge: 'Min. Income ₹25,000'
    },
    {
      title: 'Business Loan',
      desc: 'Fuel your enterprise growth, buy inventory, or expand operations. Custom MSME & SME funding.',
      icon: <Briefcase size={24} />,
      badge: 'Flexible Tenure'
    },
    {
      title: 'Doctor Loan',
      desc: 'Exclusive, high-limit loan programs with competitive interest rates tailored for medical practitioners.',
      icon: <Stethoscope size={24} />,
      badge: 'Specialized Rates'
    },
    {
      title: 'Home Loan',
      desc: 'Make your dream home a reality with long tenure options, competitive rates, and fast verification.',
      icon: <Home size={24} />,
      badge: 'Up to 60x Income'
    },
    {
      title: 'Mortgage Loan',
      desc: 'Unlock the value of your commercial or residential property to fund your personal or business goals.',
      icon: <FileText size={24} />,
      badge: 'LAP Solutions'
    },
    {
      title: 'Education Loan (Global & India)',
      desc: 'Complete financial assistance for studying in top Indian institutions and overseas universities.',
      icon: <GraduationCap size={24} />,
      badge: 'Global Studies'
    },
    {
      title: 'School & College Funding',
      desc: 'Specialized corporate loan structures for educational infrastructure, expansion, and development.',
      icon: <School size={24} />,
      badge: 'Institutional Loans'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header-glass">
        <div className="logo-container">
          <div className="logo-text">AVANI <span>LOAN SERVICES</span></div>
        </div>
        <nav>
          <ul className="nav-links">
            <li><Link href="/" className="nav-link active">Home</Link></li>
            <li><Link href="/chat" className="nav-link">AI Advisor</Link></li>
            <li><Link href="/dashboard" className="nav-link">Dashboard</Link></li>
          </ul>
        </nav>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/chat" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
            <MessageSquare size={16} /> Consult AI
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <span className="hero-subtitle">Authorized Loan Advisory & Consultancy</span>
          <h1 className="hero-title">Empowering Your Financial Growth With Simple, Trusted Solutions</h1>
          <p className="hero-desc">
            Founded by Sachin Shinde, AVANI LOAN SERVICES is Latur's leading advisory firm assisting professionals, students, business owners, and institutions in finding authorized banking loan structures.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link href="/chat" className="btn btn-accent">
              <MessageSquare size={18} /> Talk to AI Advisor
            </Link>
            <Link href="/dashboard" className="btn btn-outline">
              <LayoutDashboard size={18} /> Admin Lead Center
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section style={{ padding: '4rem 2rem', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>Our Advisory Offerings</h2>
            <p style={{ color: 'var(--text-light)', maxWidth: '600px', margin: '0 auto' }}>
              We simplify documentation, perform eligibility checks, and secure authorizations through leading banking partners.
            </p>
          </div>

          <div className="grid-3" style={{ padding: '0', margin: '0' }}>
            {services.map((svc, i) => (
              <div key={i} className="card-glass">
                <div className="card-icon">{svc.icon}</div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', marginBottom: '0.75rem' }}>{svc.title}</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{svc.desc}</p>
                <span className="badge badge-qualified" style={{ background: 'var(--primary-extralight)', color: 'var(--primary-color)' }}>
                  {svc.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Calculator Section */}
      <section style={{ padding: '5rem 2rem', backgroundColor: '#fafbfc', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="hero-subtitle">Interactive EMI Tool</span>
            <h2 style={{ fontSize: '2.25rem', color: 'var(--primary-color)', marginTop: '0.5rem', marginBottom: '1rem' }}>Customize Your Loan Profile</h2>
            <p style={{ color: 'var(--text-light)', maxWidth: '600px', margin: '0 auto' }}>
              Estimate your monthly payments dynamically. Click the AI consult button to pre-seed these calculations straight into your eligibility assessment!
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', background: 'var(--white)', padding: '2.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
            
            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--primary-color)', marginBottom: '0.75rem' }}>
                  <span>Loan Amount</span>
                  <span style={{ color: 'var(--accent-color)', fontSize: '1.1rem' }}>₹{loanAmount.toLocaleString('en-IN')}</span>
                </label>
                <input 
                  type="range" 
                  min="100000" 
                  max="10000000" 
                  step="50000" 
                  value={loanAmount} 
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                  <span>₹1 Lakh</span>
                  <span>₹1 Crore</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--primary-color)', marginBottom: '0.75rem' }}>
                  <span>Annual Interest Rate</span>
                  <span style={{ color: 'var(--accent-color)', fontSize: '1.1rem' }}>{interestRate}%</span>
                </label>
                <input 
                  type="range" 
                  min="5" 
                  max="20" 
                  step="0.1" 
                  value={interestRate} 
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                  <span>5% p.a.</span>
                  <span>20% p.a.</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--primary-color)', marginBottom: '0.75rem' }}>
                  <span>Loan Tenure</span>
                  <span style={{ color: 'var(--accent-color)', fontSize: '1.1rem' }}>{loanTenure / 12} Years ({loanTenure} Mos)</span>
                </label>
                <input 
                  type="range" 
                  min="12" 
                  max="240" 
                  step="12" 
                  value={loanTenure} 
                  onChange={(e) => setLoanTenure(Number(e.target.value))}
                  style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                  <span>1 Year</span>
                  <span>20 Years</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, color: 'var(--primary-color)', marginBottom: '0.75rem' }}>Loan Type Selection</label>
                <select 
                  value={loanType} 
                  onChange={(e) => setLoanType(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '0.9rem', color: 'var(--primary-color)', cursor: 'pointer' }}
                >
                  <option value="Personal Loan">Personal Loan (Starting @ 10.5%)</option>
                  <option value="Business Loan">Business Loan (Starting @ 14%)</option>
                  <option value="Doctor Loan">Doctor Loan (Starting @ 11%)</option>
                  <option value="Home Loan">Home Loan (Starting @ 8.5%)</option>
                  <option value="Mortgage Loan">Mortgage Loan / LAP (Starting @ 9.5%)</option>
                  <option value="Education Loan (India)">Education Loan (India) (Starting @ 9.2%)</option>
                  <option value="Education Loan (Global Studies)">Education Loan (Global Studies) (Starting @ 10.2%)</option>
                </select>
              </div>
            </div>

            {/* Calculations Breakdown Output */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--primary-extralight)', padding: '2rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>ESTIMATED MONTHLY EMI</div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-color)', margin: '0.5rem 0' }}>
                    ₹{roundedEMI.toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>Principal Amount</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>₹{loanAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>Total Interest Payable</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>₹{roundedInterest.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem' }}>
                    <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>Total Repayment</span>
                    <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>₹{roundedTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.35rem' }}>
                    <span>Principal: {principalPercentage}%</span>
                    <span>Interest: {interestPercentage}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#cbd5e1', borderRadius: '4px', display: 'flex', overflow: 'hidden' }}>
                    <div style={{ width: `${principalPercentage}%`, height: '100%', backgroundColor: 'var(--primary-color)' }}></div>
                    <div style={{ width: `${interestPercentage}%`, height: '100%', backgroundColor: 'var(--accent-color)' }}></div>
                  </div>
                </div>
              </div>

              <Link 
                href={`/chat?amount=${loanAmount}&type=${encodeURIComponent(loanType)}`}
                className="btn btn-accent" 
                style={{ width: '100%', marginTop: '2rem' }}
              >
                Pre-Qualify with AI Advisor
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* About & Contact Section */}
      <section style={{ padding: '5rem 2rem', background: '#f8fafc', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem' }}>
          
          {/* Business Info Column */}
          <div>
            <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>AVANI LOAN SERVICES</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.7' }}>
              We assist salaried professionals, self-employed individuals, doctors, architects, and MSMEs in getting hassle-free loan approvals. With transparent documentation support and real-time eligibility assessments, we bring the best financial options to your doorstep.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ color: 'var(--accent-color)', background: 'var(--white)', padding: '0.5rem', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}>
                  <PhoneCall size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>WHATSAPP BUSINESS</div>
                  <a href="https://wa.me/919175635165" target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>+91 91756 35165</a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ color: 'var(--accent-color)', background: 'var(--white)', padding: '0.5rem', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}>
                  <Mail size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>EMAIL ADDRESS</div>
                  <a href="mailto:enquiry@avanifinserv.com" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>enquiry@avanifinserv.com</a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ color: 'var(--accent-color)', background: 'var(--white)', padding: '0.5rem', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>OFFICE ADDRESS</div>
                  <p style={{ fontWeight: 500, color: 'var(--primary-color)', fontSize: '0.85rem' }}>
                    Rajiv Gandhi Chauk, Opp Bank of Baroda,<br />
                    Above Monginis Cake Shop, Ausa Road, Latur - 413512
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ / Hours Column */}
          <div className="card-glass" style={{ background: 'var(--white)' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-color)', paddingBottom: '0.5rem', display: 'inline-block' }}>
              Business Hours & Info
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>Monday - Saturday</span>
                <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>10:00 AM - 7:00 PM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>Sunday</span>
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Closed</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>Founder</span>
                <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Sachin Shinde</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>Location Coverage</span>
                <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Maharashtra & Pan-India</span>
              </div>

              <div style={{ background: 'var(--primary-extralight)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)', marginTop: '1rem' }}>
                <h4 style={{ color: 'var(--primary-color)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Need immediate support?</h4>
                <p style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>
                  Our WhatsApp assistant (+91 91756 35165) operates 24/7. Ask questions, check document lists, and pre-qualify in seconds!
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--primary-color)', color: '#94a3b8', padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid var(--primary-light)' }}>
        <p style={{ fontSize: '0.9rem' }}>&copy; {new Date().getFullYear()} AVANI LOAN SERVICES. All Rights Reserved. Founded by Sachin Shinde.</p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#64748b' }}>
          Disclaimer: AVANI LOAN SERVICES is a consultancy and does not directly issue loans. Approvals are sole decisions of partnering banks and NBFCs.
        </p>
      </footer>
    </div>
  );
}
