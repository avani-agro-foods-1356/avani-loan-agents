import { Lead } from '../db/client';
import { SyncResult } from './hubspot';

export async function syncLeadToMake(lead: Lead): Promise<SyncResult> {
  const makeUrl = process.env.MAKE_WEBHOOK_URL || 'https://hook.eu1.make.com/n46s2vx5oil7ptwdhhgsnn9rpm6ck5j0';

  if (!makeUrl) {
    return { success: true, message: "Make.com URL not configured." };
  }

  try {
    const response = await fetch(makeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });

    if (response.ok) {
      console.log(`Lead ${lead.name} synced to Make.com.`);
      return { success: true, message: "Synced to Make.com." };
    }
    return { success: false, message: `Make.com returned status ${response.status}` };
  } catch (error: any) {
    console.error("Make.com sync error:", error);
    return { success: false, message: error.message || "Network error" };
  }
}

export async function syncLeadToPabbly(lead: Lead): Promise<SyncResult> {
  const pabblyHookUrl = process.env.PABBLY_HOOK_URL || 
    'https://hook.pabbly.com/api/webhook/6a080bc1e6a8ff432d89bea8/6a0811cf22f0d1bfa6095a6d';
  
  const pabblyConnectUrl = process.env.PABBLY_CONNECT_URL || 
    'https://connect.pabbly.com/webhook-listener/webhook/IjU3NjIwNTY0MDYzMDA0M2Q1MjY4NTUzNCI_3D_pc/IjU3NjcwNTZlMDYzMDA0MzU1MjZmNTUzMjUxMzQi_pc';

  let successCount = 0;
  const errors: string[] = [];

  // Post to Pabbly Hook
  if (pabblyHookUrl) {
    try {
      const response = await fetch(pabblyHookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
      if (response.ok) successCount++;
      else errors.push(`Pabbly API Hook returned status ${response.status}`);
    } catch (e: any) {
      errors.push(`Pabbly Hook Error: ${e.message}`);
    }
  }

  // Post to Pabbly Connect Webhook Listener
  if (pabblyConnectUrl) {
    try {
      const response = await fetch(pabblyConnectUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
      if (response.ok) successCount++;
      else errors.push(`Pabbly Connect Listener returned status ${response.status}`);
    } catch (e: any) {
      errors.push(`Pabbly Connect Listener Error: ${e.message}`);
    }
  }

  const expectedCalls = (pabblyHookUrl ? 1 : 0) + (pabblyConnectUrl ? 1 : 0);

  if (successCount === expectedCalls) {
    console.log(`Lead ${lead.name} synced to Pabbly successfully.`);
    return { success: true, message: "Synced to Pabbly successfully." };
  } else {
    return { 
      success: successCount > 0, 
      message: `Pabbly sync partially succeeded (${successCount}/${expectedCalls}). Errors: ${errors.join(', ')}` 
    };
  }
}
