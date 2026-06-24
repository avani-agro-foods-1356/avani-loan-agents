export interface EligibilityResult {
  eligible: boolean;
  status: 'Qualified' | 'Needs Review' | 'Disqualified';
  reason: string;
  suggestedAmount: number;
}

export function evaluateEligibility(
  loanType: string,
  loanAmount: number,
  monthlyIncome: number,
  employmentType: string
): EligibilityResult {
  const normLoanType = loanType.toLowerCase().replace(/[^a-z]/g, '');
  const normEmpType = employmentType.toLowerCase();

  let eligible = true;
  let status: 'Qualified' | 'Needs Review' | 'Disqualified' = 'Qualified';
  let reason = '';
  let suggestedAmount = loanAmount;

  // 1. Personal Loan Eligibility
  if (normLoanType.includes('personal')) {
    if (monthlyIncome < 25000) {
      eligible = false;
      status = 'Disqualified';
      reason = `Minimum monthly income for a Personal Loan is ₹25,000. Your income is ₹${monthlyIncome.toLocaleString('en-IN')}.`;
      suggestedAmount = 0;
    } else {
      const maxEligible = monthlyIncome * 12;
      if (loanAmount > maxEligible) {
        status = 'Needs Review';
        reason = `Requested loan amount (₹${loanAmount.toLocaleString('en-IN')}) exceeds the typical limit of 12x monthly income (₹${maxEligible.toLocaleString('en-IN')}). We will review for specialized caps.`;
        suggestedAmount = maxEligible;
      } else {
        reason = `Income of ₹${monthlyIncome.toLocaleString('en-IN')} qualifies for Personal Loan up to ₹${maxEligible.toLocaleString('en-IN')}.`;
      }
    }
  }
  // 2. Doctor Loan Eligibility
  else if (normLoanType.includes('doctor')) {
    const isDoc = normEmpType.includes('doc') || normEmpType.includes('med') || normEmpType.includes('dent') || normEmpType.includes('physi');
    if (!isDoc) {
      status = 'Needs Review';
      reason = "Doctor loans are specialized for medical professionals. Employment profile does not explicitly show medical practice; requires professional degree verification.";
    }
    if (monthlyIncome < 40000) {
      eligible = false;
      status = 'Disqualified';
      reason = `Minimum monthly income for a Doctor Loan is ₹40,000. Your income is ₹${monthlyIncome.toLocaleString('en-IN')}.`;
      suggestedAmount = 0;
    } else {
      const maxEligible = monthlyIncome * 24;
      if (loanAmount > maxEligible) {
        status = 'Needs Review';
        reason = `Requested amount exceeds typical 24x monthly income limit of ₹${maxEligible.toLocaleString('en-IN')} for medical professionals.`;
        suggestedAmount = maxEligible;
      } else {
        reason = `Specialized Doctor Loan qualified. Maximum eligible amount based on income is ₹${maxEligible.toLocaleString('en-IN')}.`;
      }
    }
  }
  // 3. Business Loan Eligibility
  else if (normLoanType.includes('business')) {
    if (monthlyIncome < 30000) {
      eligible = false;
      status = 'Disqualified';
      reason = `Minimum business monthly income/turnover equivalent is ₹30,000. Your income is ₹${monthlyIncome.toLocaleString('en-IN')}.`;
      suggestedAmount = 0;
    } else {
      const maxEligible = monthlyIncome * 15;
      if (loanAmount > maxEligible) {
        status = 'Needs Review';
        reason = `Requested loan amount (₹${loanAmount.toLocaleString('en-IN')}) exceeds the typical business credit line multiplier (₹${maxEligible.toLocaleString('en-IN')}). Subject to audit of GST/ITR.`;
        suggestedAmount = maxEligible;
      } else {
        reason = `Business profile qualified. Subject to GST returns and 2-year business vintage verification.`;
      }
    }
  }
  // 4. Home Loan / Mortgage Loan Eligibility
  else if (normLoanType.includes('home') || normLoanType.includes('mortgage')) {
    if (monthlyIncome < 25000) {
      eligible = false;
      status = 'Disqualified';
      reason = `Minimum monthly income for Home/Mortgage loans is ₹25,000. Your income is ₹${monthlyIncome.toLocaleString('en-IN')}.`;
      suggestedAmount = 0;
    } else {
      const maxEligible = monthlyIncome * 60; // 5 years salary equivalent
      if (loanAmount > maxEligible) {
        status = 'Needs Review';
        reason = `Loan request is very high relative to income. Typical home loan limits go up to 60x monthly income (₹${maxEligible.toLocaleString('en-IN')}). Co-applicant may be required.`;
        suggestedAmount = maxEligible;
      } else {
        reason = `Qualified for home financing. Estimated maximum property funding eligibility: ₹${maxEligible.toLocaleString('en-IN')}.`;
      }
    }
  }
  // 5. Education Loan Eligibility (India or Global)
  else if (normLoanType.includes('education') || normLoanType.includes('study') || normLoanType.includes('student')) {
    if (monthlyIncome < 20000) {
      status = 'Needs Review';
      reason = `Co-signer monthly income (₹${monthlyIncome.toLocaleString('en-IN')}) is below ₹20,000. A strong co-applicant or collateral security will be required for approval.`;
    } else {
      reason = `Education loan assessment initiated. Co-signer income qualified. Subject to admission letter and fee structure review.`;
    }
  }
  // 6. Generic or School Funding
  else {
    if (monthlyIncome < 20000) {
      status = 'Needs Review';
      reason = `Monthly income of ₹${monthlyIncome.toLocaleString('en-IN')} requires co-applicant support.`;
    } else {
      reason = "General loan query received. Assessment subject to standard documentation.";
    }
  }

  return { eligible, status, reason, suggestedAmount };
}
