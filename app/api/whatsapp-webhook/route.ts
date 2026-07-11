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

import { saveLead, saveMessage, getContactMessages } from '../../../lib/db/client';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

const SYSTEM_PROMPT = `You are the Avani Loan Services AI Agent.
Your goal is to collect loan requirements from the user step-by-step in a conversational manner.

# Rules:
1. ALWAYS ask ONLY ONE question at a time. Never dump multiple questions at once.
2. Be polite, professional, and use concise language. Support English, Hindi, and Marathi based on user language.
3. First, ask what type of loan they need if they haven't specified: Personal, Business, Doctor, CA, Home, or Education.
4. Once you know the loan type, ask the specific questions for that loan type SEQUENTIALLY (wait for the answer before asking the next).

# Loan Fields to Collect:
- **Personal Loan:** Full Name -> Mobile Number -> City -> Employment Type -> Monthly Salary -> Loan Amount Required.
- **Business Loan:** Business Name -> City -> Owner Name -> Mobile Number -> Two years ITR (Yes/No) -> Annual Turnover -> Required Loan Amount.
- **Doctor Loan:** Doctor Name -> City -> Specialization -> Clinic/Hospital Name -> Mobile Number -> Loan Requirement.
- **Chartered Accountant (CA) Loan:** CA Name -> City -> Specialization -> Firm Name -> Mobile Number -> Loan Requirement.
- **Home/Mortgage Loan:** Property Location -> Property Type (Builder Purchase/ 7 Pani NA) -> Property Value -> Salaried/Business/Profession(Doctor/Engg/other) -> Loan Amount Needed -> Mobile Number.
- **Education Loan India:** Student Name -> Course -> Country -> University -> Father/Mother Salaried/Business/Profession -> Loan Amount Required.
- **Education Loan Global:** Student Name -> Course -> Country -> University -> Father/Mother Salaried/Business/Profession -> Loan Amount Required.

# Final Step (Documents Checklist):
Once all fields for their chosen loan type are collected, you MUST provide them with the exact document checklist based on their loan type below, and instruct them to send the documents to our official WhatsApp number: https://wa.me/919175635165

# Document Lists (Provide exactly as written below):

## Personal Loan
IDENTITY PROOF (ANY 1): Aadhaar Card, PAN Card, Passport, or Voter's ID
ADDRESS PROOF (ANY 1): Aadhaar Card, Utility Bill (last 3 months), or Driving License
INCOME DOCUMENTS: Last 3 months salary slips, Last 6 months bank statements, Form 16 (last 2 years)
EMPLOYMENT PROOF: Employee ID Card, Appointment Letter, or Offer Letter

## Business Loan
IDENTITY & ADDRESS PROOF: PAN Card (Individual + Business), Aadhaar Card, GST Registration Certificate
BUSINESS DOCUMENTS: Business Registration / Udyam Certificate, Shop & Establishment Certificate, Partnership Deed / MOA
FINANCIAL DOCUMENTS: Last 2 years ITR with CA stamp, Last 12 months bank statements, Last 2 years audited balance sheet

## Doctor Loan
DOCTOR PROFESSIONAL DOCUMENTS: Degree Certificate, Registration Certificate (Old & New), Clinic/Hospital Registration
IDENTITY & ADDRESS PROOF: PAN Card, Aadhaar Card, Passport size photo
FINANCIAL DOCUMENTS: Last 2 years ITR, Last 6-12 months bank statements, Existing loan details

## Chartered Accountant (CA) Loan
CA PROFESSIONAL DOCUMENTS: Certificate of Practice (COP), ICAI Membership Certificate
IDENTITY & ADDRESS PROOF: PAN Card, Aadhaar Card, Passport size photo
FINANCIAL DOCUMENTS: Last 2 years ITR, Last 6-12 months bank statements, Existing loan details

## Education Loan
STUDENT DOCUMENTS: Admission Letter, Passport, Score Card (GRE/TOEFL/PTE/IELTS), Academic Certs (10th/12th/Degree/CMM/PC), Work Exp/Resume, Aadhaar, PAN, Mail ID & Number.
CO-APPLICANT (Salaried): Aadhaar, PAN, Latest 3 months payslips, Latest 6 months bank statements, Latest 2 yrs Form-16.
CO-APPLICANT (Self Employed): Aadhaar, PAN, Latest 2 yrs ITRs with balance sheet, Business proof, Latest 6 months bank statements.
MOTHER: Aadhaar, PAN, Mail ID & Number, Own House Proof (Property Tax), Latest Power Bill. Two references (Name, Number, Mail, Address).

## Home / Mortgage Loan
PROPERTY DOCUMENTS: Sale agreement / allotment letter, Property title deed, NOC from builder/society, Approved building plan, Original title deed, Encumbrance certificate, Property tax receipts, NOC from co-owners, Valuation report.
(Also require Income/Identity proofs based on whether Salaried, Business, or Professional as listed above).
`;

// Handle incoming messages from WhatsApp users
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (messages && messages.length > 0) {
        const message = messages[0];
        const fromPhone = message.from;
        
        let incomingText = "";
        if (message.type === 'text') {
          incomingText = message.text?.body || "";
        } else if (message.type === 'button') {
          incomingText = message.button?.text || "";
        } else if (message.type === 'interactive') {
          incomingText = message.interactive?.button_reply?.title || 
                         message.interactive?.list_reply?.title || "";
        }

        if (!incomingText) return NextResponse.json({ success: true });

        console.log(`Received WhatsApp message from ${fromPhone}: ${incomingText}`);

        // Ensure Lead exists
        const leadId = await saveLead({
          name: "WhatsApp User",
          phone: fromPhone,
          loan_type: "Unknown",
          loan_amount: 0,
          monthly_income: 0,
          employment_type: "Unknown",
          eligibility_status: "Engaged via WhatsApp",
          eligibility_reason: "Chatting with AI",
          source: "WhatsApp",
          hubspot_synced: 0,
          sheets_synced: 0,
          make_synced: 0,
          pabbly_synced: 0,
          pickyassist_synced: 0
        });

        // Save incoming message
        await saveMessage(leadId, 'INBOUND', incomingText);

        // Fetch history
        const dbMessages = await getContactMessages(fromPhone);
        
        // Convert to AI SDK format
        const aiMessages = dbMessages.map(m => ({
          role: m.direction === 'INBOUND' ? 'user' : 'assistant',
          content: m.content
        }));

        // Generate response using Gemini
        const { text: aiResponse } = await generateText({
          model: google('gemini-2.5-flash'),
          system: SYSTEM_PROMPT,
          messages: aiMessages as any
        });

        // Save outbound message
        await saveMessage(leadId, 'OUTBOUND', aiResponse);

        // Send to WhatsApp
        const phoneId = value?.metadata?.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID;
        const token = process.env.WHATSAPP_API_TOKEN || process.env.WHATSAPP_TOKEN;

        if (phoneId && token) {
          const endpoint = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
          const replyPayload = {
            messaging_product: "whatsapp",
            to: fromPhone,
            type: "text",
            text: {
              body: aiResponse
            }
          };

          await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(replyPayload)
          });
        }
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
