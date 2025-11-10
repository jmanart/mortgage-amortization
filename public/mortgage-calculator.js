// Amortization calculation functions
function calculateAmortizationWithoutExtraPayments(principal, annualRate, years) {
	const monthlyRate = annualRate / 100 / 12;
	const totalPayments = years * 12;
	
	// Calculate fixed monthly payment using French amortization formula
	const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
		(Math.pow(1 + monthlyRate, totalPayments) - 1);
	
	let balance = principal;
	let totalInterest = 0;
	
	for (let i = 0; i < totalPayments; i++) {
		const interestPayment = balance * monthlyRate;
		const principalPayment = monthlyPayment - interestPayment;
		
		balance = Math.max(0, balance - principalPayment);
		totalInterest += interestPayment;
		
		if (balance <= 0) break;
	}
	
	return totalInterest;
}

function calculateAmortization(principal, annualRate, years, startDate, amortizationPayments = [], periodicPayments = [], servicePayments = []) {
	const monthlyRate = annualRate / 100 / 12;
	const totalPayments = years * 12;
	
	// Calculate fixed monthly payment using French amortization formula
	const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
		(Math.pow(1 + monthlyRate, totalPayments) - 1);
	
	const schedule = [];
	let balance = principal;
	let totalInterest = 0;
	let totalAmortizationPaid = 0;
	let totalPenaltyPaid = 0;
	let totalServicePayments = 0;
	let totalPaymentsMade = 0;
	
	// Sort amortization payments by date
	const sortedAmortizations = [...amortizationPayments].sort((a, b) => new Date(a.date) - new Date(b.date));
	
	for (let i = 0; i < totalPayments; i++) {
		// Calculate payment date
		const paymentDate = new Date(startDate);
		paymentDate.setMonth(paymentDate.getMonth() + i);
		
		// Check if there's an amortization payment this month
		const amortizationThisMonth = sortedAmortizations.find(amp => {
			const ampDate = new Date(amp.date);
			return ampDate.getFullYear() === paymentDate.getFullYear() && 
				   ampDate.getMonth() === paymentDate.getMonth();
		});
		
		// Check if there's a periodic payment this month
		const periodicPaymentThisMonth = periodicPayments.find(pp => {
			const currentPeriod = i + 1; // Current payment period (1-based)
			return currentPeriod >= pp.startPeriod && 
				   currentPeriod <= pp.endPeriod && 
				   (currentPeriod - pp.startPeriod) % pp.interval === 0;
		});
		
		// Calculate regular payment components
		const interestPayment = balance * monthlyRate;
		const principalPayment = monthlyPayment - interestPayment;
		
		// Apply amortization payment if it exists this month
		let amortizationAmount = 0;
		let penaltyAmount = 0;
		let effectivePrincipalPayment = principalPayment;
		
		if (amortizationThisMonth) {
			amortizationAmount = parseFloat(amortizationThisMonth.amount);
			penaltyAmount = amortizationAmount * (parseFloat(amortizationThisMonth.penalty) / 100);
			effectivePrincipalPayment = principalPayment + amortizationAmount;
			totalAmortizationPaid += amortizationAmount;
			totalPenaltyPaid += penaltyAmount;
		}
		
		// Apply periodic payment if it exists this month
		let periodicAmount = 0;
		let periodicPenaltyAmount = 0;
		
		if (periodicPaymentThisMonth) {
			periodicAmount = parseFloat(periodicPaymentThisMonth.amount);
			periodicPenaltyAmount = periodicAmount * (parseFloat(periodicPaymentThisMonth.penalty) / 100);
			effectivePrincipalPayment += periodicAmount;
			totalAmortizationPaid += periodicAmount;
			totalPenaltyPaid += periodicPenaltyAmount;
		}
		
		// Calculate service payments for this month
		let monthlyServicePayments = 0;
		servicePayments.forEach(service => {
			// Check if service is still active this month
			const serviceFinishDate = service.finishDate ? new Date(service.finishDate) : null;
			const isServiceActive = !serviceFinishDate || paymentDate <= serviceFinishDate;
			
			if (isServiceActive) {
				monthlyServicePayments += parseFloat(service.monthlyCost);
			}
		});
		totalServicePayments += monthlyServicePayments;
		
		// Update balance
		balance = Math.max(0, balance - effectivePrincipalPayment);
		totalInterest += interestPayment;
		
		// Calculate total payment for this month (monthly payment + amortization + penalties + service payments)
		const monthlyTotalPayment = monthlyPayment + amortizationAmount + penaltyAmount + periodicAmount + periodicPenaltyAmount + monthlyServicePayments;
		totalPaymentsMade += monthlyTotalPayment;
		
		// If balance is paid off early, stop the schedule
		if (balance <= 0) {
			schedule.push({
				payment: i + 1,
				date: paymentDate.toLocaleDateString('fr-FR'),
				paymentAmount: monthlyTotalPayment,
				principalPayment: effectivePrincipalPayment,
				interestPayment: interestPayment,
				amortizationAmount: amortizationAmount,
				penaltyAmount: penaltyAmount,
				periodicAmount: periodicAmount,
				periodicPenaltyAmount: periodicPenaltyAmount,
				servicePayments: monthlyServicePayments,
				balance: Math.max(0, balance),
				totalInterest: totalInterest,
				totalAmortizationPaid: totalAmortizationPaid,
				totalPenaltyPaid: totalPenaltyPaid,
				totalServicePayments: totalServicePayments,
				totalPaymentsMade: totalPaymentsMade,
				isAmortizationMonth: !!amortizationThisMonth,
				isPeriodicPaymentMonth: !!periodicPaymentThisMonth
			});
			break;
		}
		
		schedule.push({
			payment: i + 1,
			date: paymentDate.toLocaleDateString('fr-FR'),
			paymentAmount: monthlyTotalPayment,
			principalPayment: effectivePrincipalPayment,
			interestPayment: interestPayment,
			amortizationAmount: amortizationAmount,
			penaltyAmount: penaltyAmount,
			periodicAmount: periodicAmount,
			periodicPenaltyAmount: periodicPenaltyAmount,
			servicePayments: monthlyServicePayments,
			balance: balance,
			totalInterest: totalInterest,
			totalAmortizationPaid: totalAmortizationPaid,
			totalPenaltyPaid: totalPenaltyPaid,
			totalServicePayments: totalServicePayments,
			totalPaymentsMade: totalPaymentsMade,
			isAmortizationMonth: !!amortizationThisMonth,
			isPeriodicPaymentMonth: !!periodicPaymentThisMonth
		});
	}
	
	return {
		schedule: schedule,
		monthlyPayment: monthlyPayment,
		totalInterest: totalInterest,
		totalPayments: schedule.length,
		totalAmortizationPaid: totalAmortizationPaid,
		totalPenaltyPaid: totalPenaltyPaid,
		totalServicePayments: totalServicePayments,
		totalPaymentsMade: totalPaymentsMade,
		amortizationPayments: amortizationPayments
	};
}

function displayAmortizationTable(data, totalInterestWithoutAmortization) {
	const container = document.getElementById('chart-container');
	
	// Calculate interest savings
	const interestSavings = totalInterestWithoutAmortization - data.totalInterest;
	const interestSavingsPercentage = totalInterestWithoutAmortization > 0 ? 
		(interestSavings / totalInterestWithoutAmortization * 100) : 0;

	// Create summary section
	const summary = `
		<div class="mb-6 p-4 bg-blue-50 rounded-lg">
			<h3 class="text-lg font-semibold text-blue-900 mb-2" data-i18n="schedule.summary">Summary</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 text-sm">
				<div>
					<span class="font-medium" data-i18n="schedule.monthlyPayment">Monthly Payment:</span>
					<span class="text-blue-700">€${data.monthlyPayment.toFixed(2)}</span>
				</div>
				<div>
					<span class="font-medium" data-i18n="schedule.totalInterest">Total Interest:</span>
					<span class="text-blue-700">€${data.totalInterest.toFixed(2)}</span>
				</div>
				<div>
					<span class="font-medium" data-i18n="schedule.totalPayments">Total Payments:</span>
					<span class="text-blue-700">${data.totalPayments}</span>
				</div>
				<div>
					<span class="font-medium" data-i18n="schedule.totalAmortization">Total Amortization:</span>
					<span class="text-green-700">€${data.totalAmortizationPaid.toFixed(2)}</span>
				</div>
				<div>
					<span class="font-medium" data-i18n="schedule.totalServicePayments">Total Service Payments:</span>
					<span class="text-orange-700">€${data.totalServicePayments.toFixed(2)}</span>
				</div>
				<div>
					<span class="font-medium" data-i18n="schedule.totalPaymentsMade">Total Payments Made:</span>
					<span class="text-purple-700 font-semibold">€${data.totalPaymentsMade.toFixed(2)}</span>
				</div>
			</div>
			<div class="mt-3 p-3 bg-white rounded-lg border border-blue-200">
				<h4 class="text-sm font-semibold text-gray-800 mb-2" data-i18n="schedule.interestComparison">Interest Comparison</h4>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
					<div>
						<span class="font-medium text-gray-600" data-i18n="schedule.withoutAmortization">Without Amortization:</span>
						<span class="text-gray-700">€${totalInterestWithoutAmortization.toFixed(2)}</span>
					</div>
					<div>
						<span class="font-medium text-gray-600" data-i18n="schedule.withAmortization">With Amortization:</span>
						<span class="text-blue-700">€${data.totalInterest.toFixed(2)}</span>
					</div>
					<div>
						<span class="font-medium text-gray-600" data-i18n="schedule.interestSaved">Interest Saved:</span>
						<span class="text-green-700 font-semibold">€${interestSavings.toFixed(2)} (${interestSavingsPercentage.toFixed(1)}%)</span>
					</div>
				</div>
			</div>
			${data.totalPenaltyPaid > 0 ? `
				<div class="mt-2 text-sm">
					<span class="font-medium" data-i18n="schedule.totalPenalties">Total Penalties:</span>
					<span class="text-red-700">€${data.totalPenaltyPaid.toFixed(2)}</span>
				</div>
			` : ''}
		</div>
	`;
	
	// Create table
	const table = `
		<div class="overflow-auto h-full">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50 sticky top-0 z-10">
					<tr>
						<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="schedule.paymentNumber">Payment #</th>
						<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="schedule.date">Date</th>
						<th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="schedule.payment">Payment</th>
						<th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="schedule.principal">Principal</th>
						<th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="schedule.interest">Interest</th>
						<th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="schedule.amortization">Amortization</th>
						<th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="schedule.periodic">Periodic</th>
						<th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="schedule.services">Services</th>
						<th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="schedule.penalty">Penalty</th>
						<th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="schedule.balance">Balance</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					${data.schedule.map(row => `
						<tr class="hover:bg-gray-50 ${row.isAmortizationMonth ? 'bg-green-50' : ''} ${row.isPeriodicPaymentMonth ? 'bg-blue-50' : ''}">
							<td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">${row.payment}</td>
							<td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">${row.date}</td>
							<td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">€${row.paymentAmount.toFixed(2)}</td>
							<td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">€${row.principalPayment.toFixed(2)}</td>
							<td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">€${row.interestPayment.toFixed(2)}</td>
							<td class="px-3 py-2 whitespace-nowrap text-sm text-right ${row.amortizationAmount > 0 ? 'text-green-700 font-medium' : 'text-gray-500'}">€${row.amortizationAmount.toFixed(2)}</td>
							<td class="px-3 py-2 whitespace-nowrap text-sm text-right ${row.periodicAmount > 0 ? 'text-blue-700 font-medium' : 'text-gray-500'}">€${row.periodicAmount.toFixed(2)}</td>
							<td class="px-3 py-2 whitespace-nowrap text-sm text-right ${row.servicePayments > 0 ? 'text-orange-700 font-medium' : 'text-gray-500'}">€${row.servicePayments.toFixed(2)}</td>
							<td class="px-3 py-2 whitespace-nowrap text-sm text-right ${row.penaltyAmount > 0 ? 'text-red-700 font-medium' : 'text-gray-500'}">€${row.penaltyAmount.toFixed(2)}</td>
							<td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">€${row.balance.toFixed(2)}</td>
						</tr>
					`).join('')}
				</tbody>
			</table>
		</div>
	`;
	
	container.innerHTML = `
		<div class="h-full flex flex-col">
			<div class="flex-shrink-0">
				${summary}
			</div>
			<div class="flex-1 overflow-hidden">
				${table}
			</div>
		</div>
	`;
	
	// Update translations for the new content
	if (window.i18n) {
		window.i18n.updateTranslations();
	}
}

// Amortization payments management
let amortizationPayments = [];

// Periodic payments management
let periodicPayments = [];

// Service payments management
let servicePayments = [];

// Global function for calculation and display
function calculateAndDisplay() {
	const loanAmountInput = document.getElementById('loan-amount');
	const interestRateInput = document.getElementById('interest-rate');
	const loanTermInput = document.getElementById('loan-term');
	const startDateInput = document.getElementById('start-date');
	
	const principal = parseFloat(loanAmountInput.value);
	const annualRate = parseFloat(interestRateInput.value);
	const years = parseInt(loanTermInput.value);
	const startDate = startDateInput.value;
	const amortizationPayments = getAmortizationPaymentsFromUI();
	const periodicPayments = getPeriodicPaymentsFromUI();
	const servicePayments = getServicePaymentsFromUI();
	
	if (principal <= 0 || annualRate <= 0 || years <= 0 || !startDate) {
		return;
	}
	
	const amortizationData = calculateAmortization(principal, annualRate, years, startDate, amortizationPayments, periodicPayments, servicePayments);
	const totalInterestWithoutAmortization = calculateAmortizationWithoutExtraPayments(principal, annualRate, years);
	displayAmortizationTable(amortizationData, totalInterestWithoutAmortization);
	
	// Trigger change detection for header functionality
	if (typeof window.markSimulationAsChanged === 'function') {
		window.markSimulationAsChanged();
	}
}

function createAmortizationPaymentRow(index, payment = {}) {
	return `
		<div class="amortization-payment-row border border-gray-200 rounded-lg p-3 bg-gray-50" data-index="${index}">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-3">
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1" data-i18n="amortization.amount">Amount (€)</label>
					<input type="number" class="amortization-amount w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
						   placeholder="10000" value="${payment.amount || ''}" />
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1" data-i18n="amortization.date">Date</label>
					<input type="date" class="amortization-date w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
						   value="${payment.date || ''}" />
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1" data-i18n="amortization.penalty">Penalty (%)</label>
					<input type="number" step="0.01" class="amortization-penalty w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
						   placeholder="0.5" value="${payment.penalty || ''}" />
				</div>
				<div class="flex items-end">
					<button type="button" class="remove-amortization-btn w-full px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" data-i18n="amortization.remove">
						Remove
					</button>
				</div>
			</div>
		</div>
	`;
}

function addAmortizationPayment() {
	const container = document.getElementById('amortization-payments-list');
	const index = amortizationPayments.length;
	amortizationPayments.push({ amount: '', date: '', penalty: '' });
	
	const row = document.createElement('div');
	row.innerHTML = createAmortizationPaymentRow(index);
	container.appendChild(row);
	
	// Add event listeners to the new row
	const newRow = container.lastElementChild;
	const amountInput = newRow.querySelector('.amortization-amount');
	const dateInput = newRow.querySelector('.amortization-date');
	const penaltyInput = newRow.querySelector('.amortization-penalty');
	const removeBtn = newRow.querySelector('.remove-amortization-btn');
	
	[amountInput, dateInput, penaltyInput].forEach(input => {
		input.addEventListener('input', calculateAndDisplay);
		input.addEventListener('change', calculateAndDisplay);
	});
	
	removeBtn.addEventListener('click', () => removeAmortizationPayment(index));
	
	// Update translations for the new row
	if (window.i18n) {
		window.i18n.updateTranslations();
	}
}

function removeAmortizationPayment(index) {
	amortizationPayments.splice(index, 1);
	updateAmortizationPaymentsDisplay();
	calculateAndDisplay();
}

function updateAmortizationPaymentsDisplay() {
	const container = document.getElementById('amortization-payments-list');
	container.innerHTML = '';
	
	amortizationPayments.forEach((payment, index) => {
		const row = document.createElement('div');
		row.innerHTML = createAmortizationPaymentRow(index, payment);
		container.appendChild(row);
		
		// Add event listeners
		const newRow = container.lastElementChild;
		const amountInput = newRow.querySelector('.amortization-amount');
		const dateInput = newRow.querySelector('.amortization-date');
		const penaltyInput = newRow.querySelector('.amortization-penalty');
		const removeBtn = newRow.querySelector('.remove-amortization-btn');
		
		[amountInput, dateInput, penaltyInput].forEach(input => {
			input.addEventListener('input', calculateAndDisplay);
			input.addEventListener('change', calculateAndDisplay);
		});
		
		removeBtn.addEventListener('click', () => removeAmortizationPayment(index));
	});
	
	// Update translations for all rows
	if (window.i18n) {
		window.i18n.updateTranslations();
	}
}

function getAmortizationPaymentsFromUI() {
	const rows = document.querySelectorAll('.amortization-payment-row');
	const payments = [];
	
	rows.forEach(row => {
		const amount = parseFloat(row.querySelector('.amortization-amount').value);
		const date = row.querySelector('.amortization-date').value;
		const penalty = parseFloat(row.querySelector('.amortization-penalty').value);
		
		if (amount > 0 && date && penalty >= 0) {
			payments.push({
				amount: amount,
				date: date,
				penalty: penalty || 0
			});
		}
	});
	
	return payments;
}

// Periodic payments management functions
function createPeriodicPaymentRow(index, payment = {}) {
	return `
		<div class="periodic-payment-row border border-gray-200 rounded-lg p-3 bg-blue-50" data-index="${index}">
			<div class="flex justify-between items-start">
				<div class="grid grid-cols-2 md:grid-cols-5 gap-3 flex-1">
					<div>
						<span class="text-xs font-medium text-gray-700" data-i18n="periodic.amount">Amount:</span>
						<span class="text-sm text-blue-700">€${payment.amount || 0}</span>
					</div>
					<div>
						<span class="text-xs font-medium text-gray-700" data-i18n="periodic.every">Every:</span>
						<span class="text-sm text-blue-700">${payment.interval || 0} <span data-i18n="periodic.months">months</span></span>
					</div>
					<div>
						<span class="text-xs font-medium text-gray-700" data-i18n="periodic.start">Start:</span>
						<span class="text-sm text-blue-700"><span data-i18n="periodic.periodLabel">Period</span> ${payment.startPeriod || 0}</span>
					</div>
					<div>
						<span class="text-xs font-medium text-gray-700" data-i18n="periodic.end">End:</span>
						<span class="text-sm text-blue-700"><span data-i18n="periodic.periodLabel">Period</span> ${payment.endPeriod || 0}</span>
					</div>
					<div>
						<span class="text-xs font-medium text-gray-700" data-i18n="periodic.penaltyLabel">Penalty:</span>
						<span class="text-sm text-blue-700">${payment.penalty || 0}%</span>
					</div>
				</div>
				<button type="button" class="remove-periodic-payment-btn ml-3 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" data-i18n="amortization.remove">
					Remove
				</button>
			</div>
		</div>
	`;
}

function addPeriodicPayment() {
	const amount = parseFloat(document.getElementById('periodic-amount').value);
	const interval = parseInt(document.getElementById('periodic-interval').value);
	const startPeriod = parseInt(document.getElementById('periodic-start').value);
	const endPeriod = parseInt(document.getElementById('periodic-end').value);
	const penalty = parseFloat(document.getElementById('periodic-penalty').value);
	
	if (amount <= 0 || interval <= 0 || startPeriod <= 0 || endPeriod <= 0 || penalty < 0) {
		showToast(window.i18n.t('messages.fillAllFields'), 'warning');
		return;
	}
	
	if (startPeriod >= endPeriod) {
		showToast(window.i18n.t('messages.startPeriodLessThanEnd'), 'warning');
		return;
	}
	
	const payment = {
		amount: amount,
		interval: interval,
		startPeriod: startPeriod,
		endPeriod: endPeriod,
		penalty: penalty
	};
	
	periodicPayments.push(payment);
	updatePeriodicPaymentsDisplay();
	calculateAndDisplay();
	
	// Clear form
	document.getElementById('periodic-amount').value = '';
	document.getElementById('periodic-interval').value = '';
	document.getElementById('periodic-start').value = '';
	document.getElementById('periodic-end').value = '';
}

function removePeriodicPayment(index) {
	periodicPayments.splice(index, 1);
	updatePeriodicPaymentsDisplay();
	calculateAndDisplay();
}

function clearPeriodicPayments() {
	periodicPayments = [];
	updatePeriodicPaymentsDisplay();
	calculateAndDisplay();
}

function updatePeriodicPaymentsDisplay() {
	const container = document.getElementById('periodic-payments-list');
	container.innerHTML = '';
	
	periodicPayments.forEach((payment, index) => {
		const row = document.createElement('div');
		row.innerHTML = createPeriodicPaymentRow(index, payment);
		container.appendChild(row);
		
		// Add event listener for remove button
		const newRow = container.lastElementChild;
		const removeBtn = newRow.querySelector('.remove-periodic-payment-btn');
		removeBtn.addEventListener('click', () => removePeriodicPayment(index));
	});
	
	// Update translations for all rows
	if (window.i18n) {
		window.i18n.updateTranslations();
	}
}

function getPeriodicPaymentsFromUI() {
	return periodicPayments;
}

// Service payments management functions
function createServicePaymentRow(index, service = {}) {
	return `
		<div class="service-payment-row border border-gray-200 rounded-lg p-3 bg-orange-50" data-index="${index}">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-3">
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1" data-i18n="service.serviceName">Service Name</label>
					<input type="text" class="service-name w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" 
						   placeholder="Life Insurance" value="${service.name || ''}" />
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1" data-i18n="service.monthlyCost">Monthly Cost (€)</label>
					<input type="number" step="0.01" class="service-cost w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" 
						   placeholder="50.00" value="${service.monthlyCost || ''}" />
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-700 mb-1" data-i18n="service.finishDate">Finish Date</label>
					<input type="date" class="service-finish-date w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" 
						   value="${service.finishDate || ''}" />
				</div>
				<div class="flex items-end">
					<button type="button" class="remove-service-btn w-full px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" data-i18n="service.remove">
						Remove
					</button>
				</div>
			</div>
		</div>
	`;
}

function addServicePayment() {
	const container = document.getElementById('service-payments-list');
	const index = servicePayments.length;
	servicePayments.push({ name: '', monthlyCost: '', finishDate: '' });
	
	const row = document.createElement('div');
	row.innerHTML = createServicePaymentRow(index);
	container.appendChild(row);
	
	// Add event listeners to the new row
	const newRow = container.lastElementChild;
	const nameInput = newRow.querySelector('.service-name');
	const costInput = newRow.querySelector('.service-cost');
	const finishDateInput = newRow.querySelector('.service-finish-date');
	const removeBtn = newRow.querySelector('.remove-service-btn');
	
	[nameInput, costInput, finishDateInput].forEach(input => {
		input.addEventListener('input', calculateAndDisplay);
		input.addEventListener('change', calculateAndDisplay);
	});
	
	removeBtn.addEventListener('click', () => removeServicePayment(index));
	
	// Update translations for the new row
	if (window.i18n) {
		window.i18n.updateTranslations();
	}
}

function removeServicePayment(index) {
	servicePayments.splice(index, 1);
	updateServicePaymentsDisplay();
	calculateAndDisplay();
}

function updateServicePaymentsDisplay() {
	const container = document.getElementById('service-payments-list');
	container.innerHTML = '';
	
	servicePayments.forEach((service, index) => {
		const row = document.createElement('div');
		row.innerHTML = createServicePaymentRow(index, service);
		container.appendChild(row);
		
		// Add event listeners
		const newRow = container.lastElementChild;
		const nameInput = newRow.querySelector('.service-name');
		const costInput = newRow.querySelector('.service-cost');
		const finishDateInput = newRow.querySelector('.service-finish-date');
		const removeBtn = newRow.querySelector('.remove-service-btn');
		
		[nameInput, costInput, finishDateInput].forEach(input => {
			input.addEventListener('input', calculateAndDisplay);
			input.addEventListener('change', calculateAndDisplay);
		});
		
		removeBtn.addEventListener('click', () => removeServicePayment(index));
	});
	
	// Update translations for all rows
	if (window.i18n) {
		window.i18n.updateTranslations();
	}
}

function getServicePaymentsFromUI() {
	const rows = document.querySelectorAll('.service-payment-row');
	const services = [];
	
	rows.forEach(row => {
		const name = row.querySelector('.service-name').value.trim();
		const monthlyCost = parseFloat(row.querySelector('.service-cost').value);
		const finishDate = row.querySelector('.service-finish-date').value;
		
		if (name && monthlyCost > 0) {
			services.push({
				name: name,
				monthlyCost: monthlyCost,
				finishDate: finishDate
			});
		}
	});
	
	return services;
}

// Simulation Management Functions
const SIMULATION_STORAGE_KEY = 'mortgage-calculator-simulations';

function saveSimulation(name) {
	if (!name || name.trim() === '') {
		showToast(window.i18n.t('messages.pleaseEnterName'), 'warning');
		return;
	}
	
	const simulation = {
		name: name.trim(),
		loanAmount: parseFloat(document.getElementById('loan-amount').value),
		interestRate: parseFloat(document.getElementById('interest-rate').value),
		loanTerm: parseInt(document.getElementById('loan-term').value),
		startDate: document.getElementById('start-date').value,
		amortizationPayments: getAmortizationPaymentsFromUI(),
		periodicPayments: getPeriodicPaymentsFromUI(),
		servicePayments: getServicePaymentsFromUI(),
		savedAt: new Date().toISOString()
	};
	
	// Get existing simulations
	const existingSimulations = getSavedSimulations();
	
	// Check if name already exists
	const existingIndex = existingSimulations.findIndex(simulation => simulation.name === name.trim());
	if (existingIndex !== -1) {
		if (!confirm(window.i18n.t('messages.simulationExists', { name: name }))) {
			return;
		}
		existingSimulations[existingIndex] = simulation;
	} else {
		existingSimulations.push(simulation);
	}
	
	// Save to localStorage
	localStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(existingSimulations));
	
	// Update UI - removed since simulation management section was deleted
	
	// Update header input
	const simulationTitleInput = document.getElementById('simulation-title-input');
	if (simulationTitleInput) {
		simulationTitleInput.value = name.trim();
	}
	
	// Mark simulation as loaded (saved state)
	if (typeof window.markSimulationAsLoaded === 'function') {
		window.markSimulationAsLoaded();
	}
	
	showToast(window.i18n.t('messages.simulationSaved', { name: name }), 'success');
}

function getSavedSimulations() {
	const stored = localStorage.getItem(SIMULATION_STORAGE_KEY);
	return stored ? JSON.parse(stored) : [];
}

function loadSimulation(simulationName) {
	const simulations = getSavedSimulations();
	const simulation = simulations.find(s => s.name === simulationName);
	
	if (!simulation) {
		showToast(window.i18n.t('messages.simulationNotFound'), 'error');
		return;
	}
	
	// Load basic mortgage details
	document.getElementById('loan-amount').value = simulation.loanAmount;
	document.getElementById('interest-rate').value = simulation.interestRate;
	document.getElementById('loan-term').value = simulation.loanTerm;
	document.getElementById('start-date').value = simulation.startDate;
	
	// Update header input
	const simulationTitleInput = document.getElementById('simulation-title-input');
	if (simulationTitleInput) {
		simulationTitleInput.value = simulation.name;
	}
	
	// Load amortization payments
	amortizationPayments = simulation.amortizationPayments || [];
	updateAmortizationPaymentsDisplay();
	
	// Load periodic payments
	periodicPayments = simulation.periodicPayments || [];
	updatePeriodicPaymentsDisplay();
	
	// Load service payments
	servicePayments = simulation.servicePayments || [];
	updateServicePaymentsDisplay();
	
	// Mark simulation as loaded
	if (typeof window.markSimulationAsLoaded === 'function') {
		window.markSimulationAsLoaded();
	}
	
	// Recalculate and display
	calculateAndDisplay();
	
	showToast(window.i18n.t('messages.simulationLoaded', { name: simulationName }), 'success');
}

function deleteSimulation(simulationName) {
	if (!confirm(window.i18n.t('messages.confirmDelete', { name: simulationName }))) {
		return;
	}
	
	const simulations = getSavedSimulations();
	const filteredSimulations = simulations.filter(s => s.name !== simulationName);
	
	localStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(filteredSimulations));
	updateSavedSimulationsList();
	
	// Clear selection
	document.getElementById('saved-simulations').value = '';
	document.getElementById('simulation-actions').style.display = 'none';
	
	showToast(window.i18n.t('messages.simulationDeleted', { name: simulationName }), 'success');
}

function updateSavedSimulationsList() {
	const simulations = getSavedSimulations();
	const select = document.getElementById('saved-simulations');
	
	// Clear existing options except the first one
	select.innerHTML = '<option value="">Select a simulation...</option>';
	
	// Add saved simulations
	simulations.forEach(simulation => {
		const option = document.createElement('option');
		option.value = simulation.name;
		option.textContent = `${simulation.name} (€${simulation.loanAmount.toLocaleString()}, ${simulation.interestRate}%, ${simulation.loanTerm}y)`;
		select.appendChild(option);
	});
}

function loadSavedSimulationsOnStart() {
	updateSavedSimulationsList();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
	const loanAmountInput = document.getElementById('loan-amount');
	const interestRateInput = document.getElementById('interest-rate');
	const loanTermInput = document.getElementById('loan-term');
	const startDateInput = document.getElementById('start-date');
	const addAmortizationBtn = document.getElementById('add-amortization-btn');
	
	
	// Auto-calculate on input change
	[loanAmountInput, interestRateInput, loanTermInput, startDateInput].forEach(input => {
		input.addEventListener('input', calculateAndDisplay);
		input.addEventListener('change', calculateAndDisplay);
	});
	
	// Amortization payments
	addAmortizationBtn.addEventListener('click', addAmortizationPayment);
	
	// Periodic payments
	const addPeriodicPaymentBtn = document.getElementById('add-periodic-payment-btn');
	const clearPeriodicPaymentsBtn = document.getElementById('clear-periodic-payments-btn');
	
	addPeriodicPaymentBtn.addEventListener('click', addPeriodicPayment);
	clearPeriodicPaymentsBtn.addEventListener('click', clearPeriodicPayments);
	
	// Service payments
	const addServicePaymentBtn = document.getElementById('add-service-payment-btn');
	
	addServicePaymentBtn.addEventListener('click', addServicePayment);
	
	// Simulation management - removed since section was deleted
	
	// Load saved simulations on page start - removed since simulation management section was deleted
	
	// Calculate on page load with default values, but wait for i18n to be ready
	async function initializeCalculator() {
		if (window.i18n && window.i18n.waitForReady) {
			await window.i18n.waitForReady();
		}
		calculateAndDisplay();
	}
	
	initializeCalculator();
	
	// Make functions globally accessible for header functionality
	window.saveSimulation = saveSimulation;
	window.loadSimulation = loadSimulation;
	window.getSavedSimulations = getSavedSimulations;
	window.deleteSimulation = deleteSimulation;
	window.getAmortizationPaymentsFromUI = getAmortizationPaymentsFromUI;
	window.getPeriodicPaymentsFromUI = getPeriodicPaymentsFromUI;
	window.getServicePaymentsFromUI = getServicePaymentsFromUI;
});