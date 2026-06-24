import { Lead, saveLead, getAllLeads } from './client';

export async function seedDatabase() {
  try {
    const existing = await getAllLeads();
    if (existing.length > 0) {
      console.log("Database already contains data. Skipping seeding.");
      return;
    }

    const sampleLeads: Lead[] = [
      {
        name: "Dr. Aditya Joshi",
        email: "aditya.joshi@example.com",
        phone: "+919823011223",
        loan_type: "Doctor Loan",
        loan_amount: 1500000,
        monthly_income: 180000,
        employment_type: "Doctor (Self-Employed)",
        employment_history: "Joshi Dental Clinic, Founder & Lead Dentist (8 years)",
        eligibility_status: "Qualified",
        eligibility_reason: "Professional doctor profile with monthly income exceeding ₹1,50,000.",
        source: "Voice Call",
        call_sid: "vapi-call-101",
        transcript: "Hello, I am Dr. Aditya. I run a clinic in Latur. I need a Doctor Loan of 15 lakhs for equipment purchase. My monthly income is around 1.8 lakhs.",
        recording_url: "https://api.vapi.ai/recordings/sample1.wav",
        hubspot_synced: 1,
        sheets_synced: 1,
        make_synced: 1,
        pabbly_synced: 1,
        pickyassist_synced: 1
      },
      {
        name: "Meera Nair",
        email: "meera.nair@example.com",
        phone: "+919175635165",
        loan_type: "Education Loan (Global Studies)",
        loan_amount: 3500000,
        monthly_income: 95000,
        employment_type: "Salaried Co-signer",
        employment_history: "Infosys, Senior Systems Engineer (4 years)",
        eligibility_status: "Qualified",
        eligibility_reason: "Co-signer has stable salaried income with DTI ratio within limits.",
        source: "Web Chat",
        transcript: "Meera wants to pursue MS in Computer Science in Germany. Co-signer monthly income is ₹95,000. Loan amount required is 35 Lakhs.",
        hubspot_synced: 1,
        sheets_synced: 1,
        make_synced: 1,
        pabbly_synced: 1,
        pickyassist_synced: 1
      },
      {
        name: "Sachin Shinde (Test Lead)",
        email: "enquiry@avanifinserv.com",
        phone: "+919175635165",
        loan_type: "Business Loan",
        loan_amount: 2500000,
        monthly_income: 120000,
        employment_type: "Business Owner",
        employment_history: "Avani Loan Services, Founder & Lead Consultant (5 years)",
        eligibility_status: "Qualified",
        eligibility_reason: "Eligible for Business Loan with GST registration and stable business revenue.",
        source: "Web Chat",
        transcript: "User inquired about business loan criteria. Provided business turnover details and registered office at Ausa Road, Latur.",
        hubspot_synced: 0,
        sheets_synced: 0,
        make_synced: 0,
        pabbly_synced: 0,
        pickyassist_synced: 0
      },
      {
        name: "Rahul Patil",
        email: "rahul.patil@example.com",
        phone: "+919921443355",
        loan_type: "Personal Loan",
        loan_amount: 200000,
        monthly_income: 18000,
        employment_type: "Salaried",
        employment_history: "Latur Municipal Corporation, Clerk (2 years)",
        eligibility_status: "Disqualified",
        eligibility_reason: "Monthly income ₹18,000 is below the required minimum of ₹25,000.",
        source: "Voice Call",
        call_sid: "vapi-call-102",
        transcript: "Hi, I need a personal loan of 2 lakhs. I earn 18,000 per month as a clerk.",
        recording_url: "https://api.vapi.ai/recordings/sample2.wav",
        hubspot_synced: 1,
        sheets_synced: 1,
        make_synced: 1,
        pabbly_synced: 1,
        pickyassist_synced: 1
      }
    ];

    for (const lead of sampleLeads) {
      await saveLead(lead);
    }
    console.log("Database seeded successfully with sample leads.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
