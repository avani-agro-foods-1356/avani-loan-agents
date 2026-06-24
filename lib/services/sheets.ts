import { Lead } from '../db/client';
import { SyncResult } from './hubspot';

export async function syncLeadToGoogleSheets(lead: Lead): Promise<SyncResult> {
  const appsScriptUrl = process.env.GOOGLE_SHEET_APP_SCRIPT_URL || 
    'https://script.google.com/macros/s/AKfycbwadPvvLiVgLOUbIcnQm7ZeLEOsh1bamEYVJKi11ub8fZc-EAVugAv2WvgfTc5Izg7A4w/exec';

  if (!appsScriptUrl) {
    console.warn("Google Sheet Apps Script URL not configured. Simulating successful sync.");
    return { success: true, message: "Simulated: Google Sheets URL missing." };
  }

  const payload = {
    timestamp: lead.created_at || new Date().toISOString(),
    name: lead.name,
    email: lead.email || "N/A",
    phone: lead.phone,
    loanType: lead.loan_type,
    loanAmount: lead.loan_amount,
    monthlyIncome: lead.monthly_income,
    employmentType: lead.employment_type,
    eligibilityStatus: lead.eligibility_status,
    eligibilityReason: lead.eligibility_reason,
    source: lead.source,
    callSid: lead.call_sid || "N/A",
    transcript: lead.transcript || "N/A"
  };

  try {
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Google Apps Scripts return a 200 or 302 redirect. Fetch handles redirects transparently.
    if (response.ok) {
      console.log(`Lead ${lead.name} logged to Google Sheets successfully.`);
      return { success: true, message: "Lead added to Google Sheets successfully." };
    } else {
      console.error(`Google Sheets sync failed: Status ${response.status}`);
      return { success: false, message: `Google Sheets API returned status ${response.status}` };
    }
  } catch (error: any) {
    console.error("Google Sheets sync error:", error);
    return { success: false, message: error.message || "Network error" };
  }
}
