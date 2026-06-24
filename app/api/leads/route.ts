import { NextResponse } from 'next/server';
import { getAllLeads } from '../../../lib/db/client';
import { orchestrateLeadSync } from '../../../lib/services/orchestrator';

export async function GET() {
  try {
    const leads = await getAllLeads();
    return NextResponse.json({ success: true, data: leads }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json({ success: false, error: "Lead ID is required" }, { status: 400 });
    }

    console.log(`Manually retrying integrations sync for lead ID: ${leadId}`);
    const syncSummary = await orchestrateLeadSync(leadId);

    if (syncSummary) {
      return NextResponse.json({ success: true, syncSummary }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Failed to retry integrations:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
