function toggleMenu() {
  const nav = document.getElementById('nav');
  nav.classList.toggle('active');
}

// Car Loan Calculator
function calculateCarLoan() {
  const loanAmount = parseFloat(document.getElementById('loanAmount').value);
  const interestRate = parseFloat(document.getElementById('interestRate').value);
  const loanTerm = parseFloat(document.getElementById('loanTerm').value);
  const downPayment = parseFloat(document.getElementById('downPayment')?.value || 0);

  if (!loanAmount || !interestRate || !loanTerm) {
    alert('Please fill in all required fields');
    return;
  }

  const principal = loanAmount - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  let monthlyPayment;
  if (monthlyRate === 0) {
    monthlyPayment = principal / numberOfPayments;
  } else {
    monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                     (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - principal;

  displayResults({
    monthlyPayment,
    totalPayment,
    totalInterest,
    principal
  });
}

// EMI Calculator
function calculateEMI() {
  const loanAmount = parseFloat(document.getElementById('emiLoanAmount').value);
  const interestRate = parseFloat(document.getElementById('emiInterestRate').value);
  const loanTerm = parseFloat(document.getElementById('emiLoanTerm').value);

  if (!loanAmount || !interestRate || !loanTerm) {
    alert('Please fill in all required fields');
    return;
  }

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  let emi;
  if (monthlyRate === 0) {
    emi = loanAmount / numberOfPayments;
  } else {
    emi = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  const totalPayment = emi * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  displayResults({
    monthlyPayment: emi,
    totalPayment,
    totalInterest,
    principal: loanAmount
  });
}

// Used Car Loan Calculator
function calculateUsedCarLoan() {
  const carValue = parseFloat(document.getElementById('carValue').value);
  const interestRate = parseFloat(document.getElementById('usedInterestRate').value);
  const loanTerm = parseFloat(document.getElementById('usedLoanTerm').value);
  const downPayment = parseFloat(document.getElementById('usedDownPayment')?.value || 0);

  if (!carValue || !interestRate || !loanTerm) {
    alert('Please fill in all required fields');
    return;
  }

  const loanAmount = carValue - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  let monthlyPayment;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / numberOfPayments;
  } else {
    monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                     (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  displayResults({
    monthlyPayment,
    totalPayment,
    totalInterest,
    principal: loanAmount
  });
}

// Show Results
function displayResults(results) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `
    <div class="result-item"><span>Monthly Payment:</span><span><strong>$${results.monthlyPayment.toFixed(2)}</strong></span></div>
    <div class="result-item"><span>Total Payment:</span><span><strong>$${results.totalPayment.toFixed(2)}</strong></span></div>
    <div class="result-item"><span>Total Interest:</span><span><strong>$${results.totalInterest.toFixed(2)}</strong></span></div>
    <div class="result-item"><span>Principal Amount:</span><span><strong>$${results.principal.toFixed(2)}</strong></span></div>
  `;
  resultsDiv.classList.add('show');
}

// Format numbers while typing
function formatCurrency(input) {
  let value = input.value.replace(/[^\d.]/g, '');
  input.value = value;
}

document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach(input => {
    input.addEventListener('input', () => formatCurrency(input));
  });
});
