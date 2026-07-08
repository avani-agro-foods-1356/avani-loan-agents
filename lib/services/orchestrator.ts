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

export async function orchestrateLeadSync(leadId: string): Promise<SyncSummary | null> {
  // Retrieve the lead from the database
  const leads = await getAllLeads();
  const lead = leads.find(l => l.id === leadId);

  if (!lead) {
    console.error(`Lead with ID ${leadId} not found in database for sync.`);
    return null;
  }

  console.log(`Starting orchestrator sync for lead: ${lead.name} (ID: ${leadId})`);

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
  const metaWaResult = await sendWhatsAppMeta(lead);

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
