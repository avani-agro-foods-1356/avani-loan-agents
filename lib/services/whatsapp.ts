import { Lead } from '../db/client';
import { SyncResult } from './hubspot';

export async function sendWhatsAppPickyassist(lead: Lead): Promise<SyncResult> {
  const pickyassistUrl = process.env.PICKYASSIST_WEBHOOK_URL || 
    'https://app.pickyassist.com/url/5cb2564f744736ff1b4d09e1ebad26748625043e';

  if (!pickyassistUrl) {
    return { success: true, message: "Pickyassist URL not configured." };
  }

  // Format a professional loan message for Pickyassist WhatsApp trigger
  const payload = {
    name: lead.name,
    phone: lead.phone,
    email: lead.email || "enquiry@avanifinserv.com",
    loan_type: lead.loan_type,
    loan_amount: lead.loan_amount,
    monthly_income: lead.monthly_income,
    eligibility_status: lead.eligibility_status,
    eligibility_reason: lead.eligibility_reason,
    source: lead.source,
    message: `Hello ${lead.name}, thank you for contacting AVANI LOAN SERVICES! We have received your inquiry for a ${lead.loan_type} of ₹${lead.loan_amount.toLocaleString('en-IN')}. Our advisor Sachin Shinde will contact you shortly.`
  };

  try {
    const response = await fetch(pickyassistUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log(`Lead ${lead.name} synced to Pickyassist.`);
      return { success: true, message: "WhatsApp triggered via Pickyassist." };
    }
    return { success: false, message: `Pickyassist returned status ${response.status}` };
  } catch (error: any) {
    console.error("Pickyassist error:", error);
    return { success: false, message: error.message || "Network error" };
  }
}

export async function sendWhatsAppTwilio(lead: Lead): Promise<SyncResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || '+13203773219';

  if (!accountSid || !authToken) {
    console.warn("Twilio credentials missing. Skipping Twilio WhatsApp notification.");
    return { success: true, message: "Simulated: Twilio credentials missing." };
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  // Standard template or professional notification message
  const bodyText = `Hello ${lead.name},

Thank you for contacting AVANI LOAN SERVICES. 
We've received your request for a ${lead.loan_type} of ₹${lead.loan_amount.toLocaleString('en-IN')}.
Status: ${lead.eligibility_status}
Reason: ${lead.eligibility_reason}

Sachin Shinde (Founder & Advisor) will reach out to you shortly to finalize details.
Office: Rajiv Gandhi Chauk, Opposite Bank of Baroda, Latur.
Email: enquiry@avanifinserv.com`;

  // Standardize phone format for Twilio (requires '+')
  let toPhone = lead.phone.trim();
  if (!toPhone.startsWith('+')) {
    if (toPhone.length === 10) {
      toPhone = '+91' + toPhone; // default to India
    } else {
      toPhone = '+' + toPhone;
    }
  }

  let fromPhone = twilioWhatsAppNumber.trim();
  if (!fromPhone.startsWith('whatsapp:')) {
    fromPhone = `whatsapp:${fromPhone.startsWith('+') ? '' : '+'}${fromPhone}`;
  }

  const twilioTo = `whatsapp:${toPhone}`;

  // Form-urlencoded data for Twilio API
  const params = new URLSearchParams();
  params.append('To', twilioTo);
  params.append('From', fromPhone);
  params.append('Body', bodyText);

  const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`Twilio WhatsApp sent successfully to ${toPhone}. SID: ${data.sid}`);
      return { success: true, message: `WhatsApp sent successfully. SID: ${data.sid}` };
    } else {
      const errorText = await response.text();
      console.error(`Twilio WhatsApp failed: Status ${response.status}. Details: ${errorText}`);
      return { success: false, message: `Twilio returned status ${response.status}` };
    }
  } catch (error: any) {
    console.error("Twilio WhatsApp sync network error:", error);
    return { success: false, message: error.message || "Network error" };
  }
}
