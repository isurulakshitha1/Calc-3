// Your ExchangeRate-API key
const EXCHANGE_API_KEY = "f3c0a1d2e3b4c5d6f7g8h9i0";

// Supported currencies
const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "JPY", "SGD"];

// This object will hold exchange rates (USD → XXX)
let exchangeRates = {};

// ──────────────────────────────────────────────────────────────────────────────
// 1. Fetch live exchange rates (base = USD)
async function fetchExchangeRates() {
  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/USD`
    );
    const data = await response.json();
    SUPPORTED_CURRENCIES.forEach((code) => {
      exchangeRates[code] = data.conversion_rates[code];
    });
    console.log("Exchange rates loaded:", exchangeRates);
  } catch (err) {
    console.error("Error fetching exchange rates:", err);
    // Fallback: default all rates to 1
    SUPPORTED_CURRENCIES.forEach((code) => {
      exchangeRates[code] = 1;
    });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. Format number as currency string
function formatInCurrency(amount, currencyCode) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: currencyCode,
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. Display results (USD + converted)
function displayResults(resultsInUSD) {
  const currency = document.getElementById("currencySelect").value;
  const rate = exchangeRates[currency] || 1;

  // Converted values
  const monthlyConverted = resultsInUSD.monthlyPayment * rate;
  const totalConverted = resultsInUSD.totalPayment * rate;
  const interestConverted = resultsInUSD.totalInterest * rate;
  const principalConverted = resultsInUSD.principal * rate;

  // Format strings
  const usdMonthlyStr = formatInCurrency(resultsInUSD.monthlyPayment, "USD");
  const localMonthlyStr = formatInCurrency(monthlyConverted, currency);

  const usdTotalStr = formatInCurrency(resultsInUSD.totalPayment, "USD");
  const localTotalStr = formatInCurrency(totalConverted, currency);

  const usdInterestStr = formatInCurrency(resultsInUSD.totalInterest, "USD");
  const localInterestStr = formatInCurrency(interestConverted, currency);

  const usdPrincipalStr = formatInCurrency(resultsInUSD.principal, "USD");
  const localPrincipalStr = formatInCurrency(principalConverted, currency);

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `
    <div class="result-item">
      <span>Monthly Payment (USD):</span>
      <span><strong>${usdMonthlyStr}</strong></span>
    </div>
    <div class="result-item">
      <span>Monthly Payment (${currency}):</span>
      <span><strong>${localMonthlyStr}</strong></span>
    </div>
    <div class="result-item">
      <span>Total Payment (USD):</span>
      <span><strong>${usdTotalStr}</strong></span>
    </div>
    <div class="result-item">
      <span>Total Payment (${currency}):</span>
      <span><strong>${localTotalStr}</strong></span>
    </div>
    <div class="result-item">
      <span>Total Interest (USD):</span>
      <span><strong>${usdInterestStr}</strong></span>
    </div>
    <div class="result-item">
      <span>Total Interest (${currency}):</span>
      <span><strong>${localInterestStr}</strong></span>
    </div>
    <div class="result-item">
      <span>Principal Amount (USD):</span>
      <span><strong>${usdPrincipalStr}</strong></span>
    </div>
    <div class="result-item">
      <span>Principal Amount (${currency}):</span>
      <span><strong>${localPrincipalStr}</strong></span>
    </div>
  `;
  resultsDiv.classList.add("show");
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. Generate amortization schedule (USD) and display the table
function generateAmortizationSchedule(principalUSD, annualRatePercent, termYears) {
  const monthlyRate = annualRatePercent / 100 / 12;
  const numberOfPayments = termYears * 12;

  // Calculate fixed monthly payment (USD)
  let monthlyPayment;
  if (monthlyRate === 0) {
    monthlyPayment = principalUSD / numberOfPayments;
  } else {
    monthlyPayment =
      (principalUSD *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  // Clear existing rows
  const tbody = document.getElementById("amortization-body");
  tbody.innerHTML = "";

  let balance = principalUSD;
  for (let i = 1; i <= numberOfPayments; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance = balance - principalPayment;
    if (i === numberOfPayments) {
      balance = 0; // Avoid negative rounding
    }

    const row = document.createElement("tr");
    const formatUSD = (amt) =>
      amt.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    row.innerHTML = `
      <td style="padding:8px; border-bottom: 1px solid #eee;">${i}</td>
      <td style="padding:8px; border-bottom: 1px solid #eee; text-align: right;">${formatUSD(
        monthlyPayment
      )}</td>
      <td style="padding:8px; border-bottom: 1px solid #eee; text-align: right;">${formatUSD(
        principalPayment
      )}</td>
      <td style="padding:8px; border-bottom: 1px solid #eee; text-align: right;">${formatUSD(
        interestPayment
      )}</td>
      <td style="padding:8px; border-bottom: 1px solid #eee; text-align: right;">${formatUSD(
        balance
      )}</td>
    `;

    tbody.appendChild(row);
  }

  document.getElementById("amortization-container").style.display = "block";
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. Render a line chart of remaining balance over time (USD)
function renderBalanceChart(principalUSD, annualRatePercent, termYears) {
  const monthlyRate = annualRatePercent / 100 / 12;
  const numberOfPayments = termYears * 12;

  // Calculate monthly payment (USD)
  let monthlyPayment;
  if (monthlyRate === 0) {
    monthlyPayment = principalUSD / numberOfPayments;
  } else {
    monthlyPayment =
      (principalUSD *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  let balance = principalUSD;
  const labels = [];
  const dataPoints = [];

  for (let i = 1; i <= numberOfPayments; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance = balance - principalPayment;
    if (i === numberOfPayments) {
      balance = 0;
    }
    labels.push(`Month ${i}`);
    dataPoints.push(parseFloat(balance.toFixed(2)));
  }

  document.getElementById("chart-container").style.display = "block";

  if (window.balanceChartInstance) {
    window.balanceChartInstance.destroy();
  }

  const ctx = document.getElementById("balanceChart").getContext("2d");
  window.balanceChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Remaining Balance (USD)",
          data: dataPoints,
          fill: false,
          borderColor: "#4f46e5",
          tension: 0.2,
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: false, // Hide if too many labels
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "$" + value.toLocaleString("en-US");
            },
          },
        },
      },
    },
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// 6. Car Loan Calculator
function calculateCarLoan() {
  const loanAmount = parseFloat(document.getElementById("loanAmount").value);
  const interestRate = parseFloat(document.getElementById("interestRate").value);
  const loanTerm = parseFloat(document.getElementById("loanTerm").value);
  const downPayment = parseFloat(
    document.getElementById("downPayment")?.value || 0
  );

  if (!loanAmount || !interestRate || !loanTerm) {
    alert("Please fill in all required fields");
    return;
  }

  const principal = loanAmount - downPayment; // USD
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  let monthlyPayment;
  if (monthlyRate === 0) {
    monthlyPayment = principal / numberOfPayments;
  } else {
    monthlyPayment =
      (principal *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - principal;

  displayResults({
    monthlyPayment,
    totalPayment,
    totalInterest,
    principal,
  });

  generateAmortizationSchedule(principal, interestRate, loanTerm);
  renderBalanceChart(principal, interestRate, loanTerm);
}

// ──────────────────────────────────────────────────────────────────────────────
// 7. EMI Calculator
function calculateEMI() {
  const loanAmount = parseFloat(
    document.getElementById("emiLoanAmount").value
  );
  const interestRate = parseFloat(
    document.getElementById("emiInterestRate").value
  );
  const loanTerm = parseFloat(
    document.getElementById("emiLoanTerm").value
  );

  if (!loanAmount || !interestRate || !loanTerm) {
    alert("Please fill in all required fields");
    return;
  }

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  let emi;
  if (monthlyRate === 0) {
    emi = loanAmount / numberOfPayments;
  } else {
    emi =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  const totalPayment = emi * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  displayResults({
    monthlyPayment: emi,
    totalPayment,
    totalInterest,
    principal: loanAmount,
  });

  generateAmortizationSchedule(loanAmount, interestRate, loanTerm);
  renderBalanceChart(loanAmount, interestRate, loanTerm);
}

// ──────────────────────────────────────────────────────────────────────────────
// 8. Used Car Loan Calculator
function calculateUsedCarLoan() {
  const carValue = parseFloat(document.getElementById("carValue").value);
  const interestRate = parseFloat(
    document.getElementById("usedInterestRate").value
  );
  const loanTerm = parseFloat(
    document.getElementById("usedLoanTerm").value
  );
  const downPayment = parseFloat(
    document.getElementById("usedDownPayment")?.value || 0
  );

  if (!carValue || !interestRate || !loanTerm) {
    alert("Please fill in all required fields");
    return;
  }

  const loanAmount = carValue - downPayment; // USD
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  let monthlyPayment;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / numberOfPayments;
  } else {
    monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  displayResults({
    monthlyPayment,
    totalPayment,
    totalInterest,
    principal: loanAmount,
  });

  generateAmortizationSchedule(loanAmount, interestRate, loanTerm);
  renderBalanceChart(loanAmount, interestRate, loanTerm);
}

// ──────────────────────────────────────────────────────────────────────────────
// 9. Format number inputs to allow only digits/decimal
function formatCurrency(input) {
  let value = input.value.replace(/[^\d.]/g, "");
  input.value = value;
}

// ──────────────────────────────────────────────────────────────────────────────
// 10. Hamburger menu toggle
function toggleMenu() {
  const nav = document.getElementById("nav");
  nav.classList.toggle("active");
}

// ──────────────────────────────────────────────────────────────────────────────
// 11. On page load: fetch exchange rates & add input listeners
document.addEventListener("DOMContentLoaded", () => {
  fetchExchangeRates();
  const inputs = document.querySelectorAll("input[type='number']");
  inputs.forEach((input) => {
    input.addEventListener("input", () => formatCurrency(input));
  });
});
