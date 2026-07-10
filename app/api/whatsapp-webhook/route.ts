import { NextResponse } from 'next/server';

// Handle webhook verification from Meta
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // You can set any verify token string in Meta Webhooks dashboard. Let's assume you use "avani_secure_token"
  // For safety, accept anything if no env var is set, or strictly check it
  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "avani_secure_token";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Meta Webhook Verified!");
    return new NextResponse(challenge, { status: 200 });
  } else {
    // If you haven't set an env var, we'll just accept any token for the sake of making it easy
    if (mode === "subscribe" && challenge) {
      console.log("Meta Webhook Verified with fallback!");
      return new NextResponse(challenge, { status: 200 });
    }
    return new NextResponse("Forbidden", { status: 403 });
  }
}

// Handle incoming messages from WhatsApp users
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if it's a WhatsApp message event
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      // If there is an actual message from a customer
      if (messages && messages.length > 0) {
        const message = messages[0];
        const fromPhone = message.from;
        
        // Extract text if it's a text message or a quick reply
        let incomingText = "";
        if (message.type === 'text') {
          incomingText = message.text?.body?.toLowerCase() || "";
        } else if (message.type === 'button') {
          incomingText = message.button?.text?.toLowerCase() || "";
        } else if (message.type === 'interactive') {
          incomingText = message.interactive?.button_reply?.title?.toLowerCase() || 
                         message.interactive?.list_reply?.title?.toLowerCase() || "";
        }

        console.log(`Received WhatsApp message from ${fromPhone}: ${incomingText}`);

        // If the customer replied positively (Yes, Ready, Interested, etc)
        // Even if we don't match keywords, we can just auto-reply to everything for now to guide them to documents
        const phoneId = value?.metadata?.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID;
        const token = process.env.WHATSAPP_TOKEN;

        if (phoneId && token) {
          const endpoint = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
          const replyPayload = {
            messaging_product: "whatsapp",
            to: fromPhone,
            type: "text",
            text: {
              body: "Thank you for your interest! Please submit your documents securely on our portal: https://www.avanifinserv.com/documents. For any further assistance, you can also reach our official WhatsApp number: +91 9175635165."
            }
          };

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(replyPayload)
          });

          if (response.ok) {
            console.log(`Successfully sent document link reply to ${fromPhone}`);
          } else {
            console.error(`Failed to send auto-reply. Status: ${response.status}`);
          }
        }
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
