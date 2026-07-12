import { getAllLeads, Lead, updateLeadSyncStatus } from '../db/client';
import { syncLeadToHubSpot } from './hubspot';
import { syncLeadToGoogleSheets } from './sheets';
import { syncLeadToMake, syncLeadToPabbly } from './make-pabbly';
import { sendWhatsAppPickyassist, sendWhatsAppTwilio, sendWhatsAppMeta } from './whatsapp';

export interface SyncSummary {
  hubspot: { success: boolean; message: string };
  sheets: { success: boolean; message: string };
  make: { success: boolean; message: string };
  pabbly: { success: boolean; message: string };
  pickyassist: { success: boolean; message: string };
  twilio: { success: boolean; message: string };
  meta_wa: { success: boolean; message: string };
}

export async function orchestrateLeadSync(leadId: string, event_type: string = 'interested_lead', fallbackLeadData: any = null): Promise<SyncSummary | null> {
  // Retrieve the lead from the database
  let leads: any[] = [];
  try {
    leads = await getAllLeads();
  } catch (err) {
    console.warn("Could not fetch leads from DB for orchestrator.");
  }
  let lead = leads.find(l => l.id === leadId);

  if (!lead) {
    if (fallbackLeadData) {
      console.log(`Lead with ID ${leadId} not found in database. Using fallback lead data.`);
      lead = { ...fallbackLeadData, id: leadId };
    } else {
      console.error(`Lead with ID ${leadId} not found in database for sync, and no fallback provided.`);
      return null;
    }
  }

  console.log(`Starting orchestrator sync for lead: ${lead.name} (ID: ${leadId}), Event: ${event_type}`);

  if (event_type === 'missed_call' || event_type === 'start_wa_flow') {
    // Only send the WhatsApp Meta template to initiate the conversational flow
    const metaWaResult = await sendWhatsAppMeta(lead, event_type);
    return {
      hubspot: { success: false, message: 'Skipped' },
      sheets: { success: false, message: 'Skipped' },
      make: { success: false, message: 'Skipped' },
      pabbly: { success: false, message: 'Skipped' },
      pickyassist: { success: false, message: 'Skipped' },
      twilio: { success: false, message: 'Skipped' },
      meta_wa: metaWaResult
    };
  }

  // Normal Flow for Interested Leads
  // 1. Sync to HubSpot
  const hubspotResult = await syncLeadToHubSpot(lead);
  if (hubspotResult.success) {
    await updateLeadSyncStatus(leadId, 'hubspot', 1);
  }

  // 2. Sync to Google Sheets
  const sheetsResult = await syncLeadToGoogleSheets(lead);
  if (sheetsResult.success) {
    await updateLeadSyncStatus(leadId, 'sheets', 1);
  }

  // 3. Sync to Make.com
  const makeResult = await syncLeadToMake(lead);
  if (makeResult.success) {
    await updateLeadSyncStatus(leadId, 'make', 1);
  }

  // 4. Sync to Pabbly
  const pabblyResult = await syncLeadToPabbly(lead);
  if (pabblyResult.success) {
    await updateLeadSyncStatus(leadId, 'pabbly', 1);
  }

  // 5. Send WhatsApp notifications
  const pickyassistResult = await sendWhatsAppPickyassist(lead);
  if (pickyassistResult.success) {
    await updateLeadSyncStatus(leadId, 'pickyassist', 1);
  }

  // Keep Twilio as fallback or parallel if they still want it, but also trigger Meta
  const twilioResult = await sendWhatsAppTwilio(lead);
  
  // 6. Send Meta WhatsApp (Official)
  const metaWaResult = await sendWhatsAppMeta(lead, 'interested');

  return {
    hubspot: hubspotResult,
    sheets: sheetsResult,
    make: makeResult,
    pabbly: pabblyResult,
    pickyassist: pickyassistResult,
    twilio: twilioResult,
    meta_wa: metaWaResult
  };
}
