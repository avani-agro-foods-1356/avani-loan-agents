export interface EMICalculation {
  emi: number;
  totalInterest: number;
  totalPayment: number;
}

export function calculateEMI(
  principal: number,
  annualRatePercentage: number,
  tenureMonths: number
): EMICalculation {
  const monthlyRate = annualRatePercentage / 12 / 100;
  
  let emi = 0;
  if (monthlyRate === 0) {
    emi = principal / tenureMonths;
  } else {
    emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
          (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  }

  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;

  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment)
  };
}

export function getAmortizationSchedule(
  principal: number,
  annualRatePercentage: number,
  tenureMonths: number
) {
  const monthlyRate = annualRatePercentage / 12 / 100;
  let balance = principal;
  const schedule = [];
  const emi = calculateEMI(principal, annualRatePercentage, tenureMonths).emi;

  for (let month = 1; month <= tenureMonths; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = emi - interest;
    balance = balance - principalPaid;

    schedule.push({
      month,
      emi,
      interest: Math.round(interest),
      principalPaid: Math.round(principalPaid),
      remainingBalance: Math.round(Math.max(0, balance))
    });
  }

  return schedule;
}
