import { Lead } from '../db/client';

export interface SyncResult {
  success: boolean;
  message: string;
}

export async function syncLeadToHubSpot(lead: Lead): Promise<SyncResult> {
  const portalId = process.env.HUBSPOT_PORTAL_ID || '244236573';
  const formId = process.env.HUBSPOT_FORM_ID || 'edde042c-3451-420a-a472-6a5c42cbdf98';

  if (!portalId || !formId) {
    console.warn("HubSpot Portal ID or Form ID not configured. Simulating successful sync.");
    return { success: true, message: "Simulated: HubSpot credentials missing." };
  }

  const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;

  // Split name into first and last
  const nameParts = lead.name.trim().split(/\s+/);
  const firstname = nameParts[0] || 'Applicant';
  const lastname = nameParts.slice(1).join(' ') || 'Lead';

  const payload = {
    submittedAt: Date.now(),
    fields: [
      {
        name: "email",
        value: lead.email || "enquiry@avanifinserv.com"
      },
      {
        name: "firstname",
        value: firstname
      },
      {
        name: "lastname",
        value: lastname
      },
      {
        name: "phone",
        value: lead.phone
      },
      {
        name: "message",
        value: `Loan Inquiry: ${lead.loan_type}
Loan Amount Required: ₹${lead.loan_amount.toLocaleString('en-IN')}
Monthly Income: ₹${lead.monthly_income.toLocaleString('en-IN')}
Employment Status: ${lead.employment_type}
Eligibility Status: ${lead.eligibility_status}
Assessed Reason: ${lead.eligibility_reason}
Lead Source: ${lead.source}
Call ID (if Voice): ${lead.call_sid || 'N/A'}`
      }
    ],
    context: {
      pageUri: "https://www.avanifinserv.com/loans",
      pageName: "Avani Loan Services Portal - AI Agent Sync"
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      console.log(`Lead ${lead.name} synced to HubSpot successfully.`, data);
      return { success: true, message: "Lead synced successfully via Form API." };
    } else {
      const errorText = await response.text();
      console.error(`HubSpot sync failed: Status ${response.status}. Details: ${errorText}`);
      return { success: false, message: `HubSpot API returned status ${response.status}` };
    }
  } catch (error: any) {
    console.error("HubSpot sync network error:", error);
    return { success: false, message: error.message || "Network error" };
  }
}
