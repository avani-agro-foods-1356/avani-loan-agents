import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToCoreMessages } from 'ai';
import { z } from 'zod';
import { SYSTEM_PROMPT } from '../../../lib/agents/advisor-prompt';
import { evaluateEligibility } from '../../../lib/tools/eligibility';
import { calculateEMI } from '../../../lib/tools/calculators';
import { saveLead } from '../../../lib/db/client';
import { orchestrateLeadSync } from '../../../lib/services/orchestrator';

// Allow responses up to 5 minutes long (Vercel hobby is 10s, pro is 15s/300s. We keep it standard).
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // Check for API key
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in env variables. Web chat will use mock response mode.");
      // Return a simulated readable response if API key is not present to avoid server crash
      return new Response(
        JSON.stringify({
          error: "API Key Missing",
          message: "Please configure your GEMINI_API_KEY in .env.local to activate the AI Agent."
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      messages: convertToCoreMessages(messages),
      system: SYSTEM_PROMPT,
      tools: {
        calculateEMI: {
          description: 'Calculate monthly EMI, total interest, and total payment for a loan.',
          parameters: z.object({
            principal: z.number().describe('The loan amount in INR (₹)'),
            annualRate: z.number().describe('The annual interest rate percentage (e.g. 10.5)'),
            tenureMonths: z.number().describe('The loan tenure in months (e.g. 36)')
          }),
          execute: async ({ principal, annualRate, tenureMonths }) => {
            const calculation = calculateEMI(principal, annualRate, tenureMonths);
            return {
              emi: calculation.emi,
              totalInterest: calculation.totalInterest,
              totalPayment: calculation.totalPayment,
              summaryText: `EMI: ₹${calculation.emi.toLocaleString('en-IN')}/mo. Total Interest: ₹${calculation.totalInterest.toLocaleString('en-IN')}. Total Repayment: ₹${calculation.totalPayment.toLocaleString('en-IN')}.`
            };
          }
        },
        checkEligibility: {
          description: 'Evaluate basic loan eligibility based on financial details.',
          parameters: z.object({
            loanType: z.string().describe('The type of loan (e.g. Personal, Business, Home, Doctor, Education)'),
            loanAmount: z.number().describe('The requested loan amount in INR (₹)'),
            monthlyIncome: z.number().describe('The applicant\'s monthly income or business turnover in INR (₹)'),
            employmentType: z.string().describe('The applicant\'s employment status (e.g. Salaried, Self-Employed, Business Owner)')
          }),
          execute: async ({ loanType, loanAmount, monthlyIncome, employmentType }) => {
            const evalResult = evaluateEligibility(loanType, loanAmount, monthlyIncome, employmentType);
            return {
              eligible: evalResult.eligible,
              status: evalResult.status,
              reason: evalResult.reason,
              suggestedAmount: evalResult.suggestedAmount
            };
          }
        },
        submitQualifiedLead: {
          description: 'Save customer details to the database and trigger CRM/WhatsApp/Sheet integrations.',
          parameters: z.object({
            name: z.string().describe('Full name of the customer'),
            phone: z.string().describe('Mobile phone number'),
            email: z.string().optional().describe('Email address of the customer'),
            loanType: z.string().describe('Type of loan interested in'),
            loanAmount: z.number().describe('Loan amount in INR (₹)'),
            monthlyIncome: z.number().describe('Monthly income in INR (₹)'),
            employmentType: z.string().describe('Employment type (e.g. Salaried, Self-Employed, Business Owner)'),
            employmentHistory: z.string().optional().describe('Employment history of the applicant (e.g. current company, title, years of experience)'),
            leadScoreTag: z.string().describe('The calculated lead score tag based on the logic (e.g. PL-HOT, BL-WARM)'),
            crmStage: z.string().describe('The current CRM pipeline stage (e.g. QUALIFIED or DOCUMENTS_PENDING)')
          }),
          execute: async ({ name, phone, email, loanType, loanAmount, monthlyIncome, employmentType, employmentHistory, leadScoreTag, crmStage }) => {
            // First evaluate eligibility
            const evalResult = evaluateEligibility(loanType, loanAmount, monthlyIncome, employmentType);

            // Construct lead object
            const leadData = {
              name,
              phone,
              email: email || undefined,
              loan_type: loanType,
              loan_amount: loanAmount,
              monthly_income: monthlyIncome,
              employment_type: employmentType,
              eligibility_status: crmStage, // Use the stage determined by the AI
              eligibility_reason: evalResult.reason,
              source: 'Web Chat' as const,
              employment_history: employmentHistory || undefined,
              lead_score_tag: leadScoreTag,
              hubspot_synced: 0,
              sheets_synced: 0,
              make_synced: 0,
              pabbly_synced: 0,
              pickyassist_synced: 0
            };

            try {
              // Save to database
              const leadId = await saveLead(leadData);
              
              // Run background integrations sync
              // We trigger this asynchronously so that the chat is not blocked
              orchestrateLeadSync(leadId).catch((err) => {
                console.error(`Background sync failed for lead ID ${leadId}:`, err);
              });

              return {
                success: true,
                leadId,
                status: evalResult.status,
                reason: evalResult.reason,
                message: `Lead successfully submitted and qualified. Lead ID is ${leadId}. Integrations triggered in background.`
              };
            } catch (dbError: any) {
              console.error("Database save failed during tool execution:", dbError);
              return {
                success: false,
                message: `Failed to save lead: ${dbError.message}`
              };
            }
          }
        }
      }
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Error in API Chat Route:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
