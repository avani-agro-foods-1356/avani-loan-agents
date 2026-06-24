import { evaluateEligibility } from '../lib/tools/eligibility';
import { calculateEMI } from '../lib/tools/calculators';
import { saveLead, getAllLeads } from '../lib/db/client';
import { orchestrateLeadSync } from '../lib/services/orchestrator';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function runTests() {
  console.log("=========================================");
  console.log("STARTING AVANI LOAN SERVICES SYSTEM TESTS");
  console.log("=========================================");

  // 1. Test Eligibility Calculations
  console.log("\n1. Testing Eligibility Calculations...");
  const personalTest = evaluateEligibility('Personal Loan', 500000, 60000, 'Salaried');
  console.log("Personal Loan (Income 60k, Request 5L):", personalTest.status, `- ${personalTest.reason}`);

  const businessTest = evaluateEligibility('Business Loan', 1500000, 20000, 'Business Owner');
  console.log("Business Loan (Income 20k, Request 15L):", businessTest.status, `- ${businessTest.reason}`);

  const doctorTest = evaluateEligibility('Doctor Loan', 2000000, 80000, 'Doctor (Self-Employed)');
  console.log("Doctor Loan (Income 80k, Request 20L):", doctorTest.status, `- ${doctorTest.reason}`);

  // 2. Test EMI Calculations
  console.log("\n2. Testing EMI Calculations...");
  const emiTest = calculateEMI(1000000, 10.5, 36);
  console.log("EMI for 10 Lakhs @ 10.5% for 36 months:", `₹${emiTest.emi}/mo (Total Interest: ₹${emiTest.totalInterest})`);

  // 3. Test Database Operations
  console.log("\n3. Testing Database Actions...");
  try {
    const testLeadId = await saveLead({
      name: "Integration Test Lead",
      email: "test.lead@avanifinserv.com",
      phone: "+919999988888",
      loan_type: "Personal Loan",
      loan_amount: 300000,
      monthly_income: 45000,
      employment_type: "Salaried",
      eligibility_status: "Qualified",
      eligibility_reason: "Test lead generated during verification.",
      source: "Web Chat",
      hubspot_synced: 0,
      sheets_synced: 0,
      make_synced: 0,
      pabbly_synced: 0,
      pickyassist_synced: 0
    });

    console.log("Successfully saved test lead. ID:", testLeadId);

    const leads = await getAllLeads();
    console.log("Total leads currently in database:", leads.length);

    // 4. Test Orchestrator Sync (using mock fallback where keys are empty)
    console.log("\n4. Executing End-to-End Orchestrator Sync...");
    const syncSummary = await orchestrateLeadSync(testLeadId);
    
    if (syncSummary) {
      console.log("Sync results:");
      console.log("- HubSpot CRM sync:", syncSummary.hubspot.success ? "SUCCESS" : "FAILED", `(${syncSummary.hubspot.message})`);
      console.log("- Google Sheets sync:", syncSummary.sheets.success ? "SUCCESS" : "FAILED", `(${syncSummary.sheets.message})`);
      console.log("- Make.com webhook:", syncSummary.make.success ? "SUCCESS" : "FAILED", `(${syncSummary.make.message})`);
      console.log("- Pabbly webhook:", syncSummary.pabbly.success ? "SUCCESS" : "FAILED", `(${syncSummary.pabbly.message})`);
      console.log("- Pickyassist WhatsApp webhook:", syncSummary.pickyassist.success ? "SUCCESS" : "FAILED", `(${syncSummary.pickyassist.message})`);
      console.log("- Twilio WhatsApp direct notification:", syncSummary.twilio.success ? "SUCCESS" : "FAILED", `(${syncSummary.twilio.message})`);
    } else {
      console.error("Orchestrator sync failed to return summary.");
    }

  } catch (error) {
    console.error("Database or sync operation failed:", error);
  }

  console.log("\n=========================================");
  console.log("TEST RUN COMPLETE");
  console.log("=========================================");
}

runTests();
