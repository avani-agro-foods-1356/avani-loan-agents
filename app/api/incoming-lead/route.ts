import { NextResponse } from 'next/server';
import { saveLead } from '../../../lib/db/client';
import { orchestrateLeadSync } from '../../../lib/services/orchestrator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Incoming lead received from CRM:", JSON.stringify(body, null, 2));

    const { name, phone, loanType, requestedAmount, callSummary } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 });
    }

    // Prepare lead data
    const leadData = {
      name: name || "Voice Caller",
      phone: phone,
      loan_type: loanType || "Personal Loan",
      loan_amount: Number(requestedAmount) || 0,
      monthly_income: 0,
      employment_type: "Unknown",
      eligibility_status: "Qualified", // Assuming interested
      eligibility_reason: "Interested from Voice Call",
      source: 'Voice Call',
      call_sid: `ai-crm-${Date.now()}`,
      transcript: callSummary || "",
      hubspot_synced: 0,
      sheets_synced: 0,
      make_synced: 0,
      pabbly_synced: 0,
      pickyassist_synced: 0
    };

    // Save lead in the database
    const leadId = await saveLead(leadData);
    console.log(`Saved incoming lead ID: ${leadId}. Starting sync...`);

    // Orchestrate integrations sync (including Meta WhatsApp)
    const syncSummary = await orchestrateLeadSync(leadId);

    return NextResponse.json({
      success: true,
      leadId,
      sync: syncSummary
    }, { status: 200 });

  } catch (error: any) {
    console.error("Incoming lead handler error:", error);
    return NextResponse.json({ error: "Failed to process incoming lead", details: error.message }, { status: 500 });
  }
}
