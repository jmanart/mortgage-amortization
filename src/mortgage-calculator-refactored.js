// Refactored Mortgage Calculator using the new separated classes
// This file integrates the new MortgageSimulation and AmortizationSimulation classes

// Global simulation instances
let currentMortgageSimulation = null;
let currentAmortizationSimulation = null;
let currentCombinedSimulation = null;

// Service payments management
let servicePayments = [];

/**
 * Calculate and display the amortization schedule using the new architecture
 */
function calculateAndDisplay() {
    const loanAmountInput = document.getElementById('loan-amount');
    const interestRateInput = document.getElementById('interest-rate');
    const loanTermInput = document.getElementById('loan-term');
    const startDateInput = document.getElementById('start-date');
    
    const principal = parseFloat(loanAmountInput.value);
    const annualRate = parseFloat(interestRateInput.value);
    const years = parseInt(loanTermInput.value);
    const startDate = startDateInput.value;
    const servicePayments = getServicePaymentsFromUI();
    
    if (principal <= 0 || annualRate <= 0 || years <= 0 || !startDate) {
        return;
    }
    
    // Create the mortgage simulation object (only with service payments)
    const mortgageSim = new MortgageSimulation(principal, annualRate, years, startDate, servicePayments);
    
    // Validate
    const validation = mortgageSim.validate();
    if (!validation.isValid) {
        console.error('Mortgage simulation validation failed:', validation.errors);
        return;
    }
    
    // Calculate the basic amortization schedule (without extra payments)
    const amortizationData = calculateBasicAmortizationSchedule(mortgageSim);
    const totalInterestWithoutAmortization = mortgageSim.calculateTotalInterest();
    
    displayAmortizationTable(amortizationData, totalInterestWithoutAmortization);
    
    // Trigger change detection for header functionality
    if (typeof window.markSimulationAsChanged === 'function') {
        window.markSimulationAsChanged();
    }
}

/**
 * Calculate basic amortization schedule for mortgage simulation (without extra payments)
 */
function calculateBasicAmortizationSchedule(mortgageSim) {
    const monthlyRate = mortgageSim.interestRate / 100 / 12;
    const totalPayments = mortgageSim.loanTerm * 12;
    const monthlyPayment = mortgageSim.calculateMonthlyPayment();
    
    const schedule = [];
    let balance = mortgageSim.loanAmount;
    let totalInterest = 0;
    let totalServicePayments = 0;
    let totalPaymentsMade = 0;
    
    for (let i = 0; i < totalPayments; i++) {
        // Calculate payment date
        const paymentDate = new Date(mortgageSim.startDate);
        paymentDate.setMonth(paymentDate.getMonth() + i);
        
        // Calculate regular payment components
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        
        // Calculate service payments for this month
        const monthlyServicePayments = mortgageSim.getServicePaymentsForMonth(paymentDate);
        totalServicePayments += monthlyServicePayments;
        
        // Update balance
        balance = Math.max(0, balance - principalPayment);
        totalInterest += interestPayment;
        
        // Calculate total payment for this month (monthly payment + service payments)
        const monthlyTotalPayment = monthlyPayment + monthlyServicePayments;
        totalPaymentsMade += monthlyTotalPayment;
        
        // If balance is paid off early, stop the schedule
        if (balance <= 0) {
            schedule.push({
                period: i + 1,
                date: paymentDate.toISOString().split('T')[0],
                payment: monthlyPayment,
                principal: principalPayment,
                interest: interestPayment,
                servicePayments: monthlyServicePayments,
                totalPayment: monthlyTotalPayment,
                balance: 0,
                cumulativeInterest: totalInterest,
                cumulativeServicePayments: totalServicePayments,
                cumulativePayments: totalPaymentsMade
            });
            break;
        }
        
        schedule.push({
            period: i + 1,
            date: paymentDate.toISOString().split('T')[0],
            payment: monthlyPayment,
            principal: principalPayment,
            interest: interestPayment,
            servicePayments: monthlyServicePayments,
            totalPayment: monthlyTotalPayment,
            balance: balance,
            cumulativeInterest: totalInterest,
            cumulativeServicePayments: totalServicePayments,
            cumulativePayments: totalPaymentsMade
        });
    }
    
    return {
        schedule: schedule,
        totalInterest: totalInterest,
        totalServicePayments: totalServicePayments,
        totalPayments: totalPaymentsMade,
        finalBalance: balance
    };
}

/**
 * Save simulation using the new architecture (mortgage only)
 */
function saveSimulation(name) {
    if (!name || name.trim() === '') {
        showToast(window.i18n.t('messages.pleaseEnterName'), 'warning');
        return;
    }
    
    const loanAmount = parseFloat(document.getElementById('loan-amount').value);
    const interestRate = parseFloat(document.getElementById('interest-rate').value);
    const loanTerm = parseInt(document.getElementById('loan-term').value);
    const startDate = document.getElementById('start-date').value;
    const servicePayments = getServicePaymentsFromUI();
    
    // Create the mortgage simulation object (only with service payments)
    const mortgageSim = new MortgageSimulation(loanAmount, interestRate, loanTerm, startDate, servicePayments);
    
    const simulation = {
        name: name.trim(),
        mortgageSimulation: mortgageSim.toJSON(),
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

/**
 * Load simulation using the new architecture
 * Handles both old and new simulation formats for backward compatibility
 */
function loadSimulation(simulationName) {
    const simulations = getSavedSimulations();
    const simulation = simulations.find(s => s.name === simulationName);
    
    if (!simulation) {
        showToast(window.i18n.t('messages.simulationNotFound'), 'error');
        return;
    }
    
    // Check if this is a new format simulation (has mortgageSimulation property)
    const isNewFormat = simulation.mortgageSimulation;
    
    let loanAmount, interestRate, loanTerm, startDate;
    
    if (isNewFormat) {
        // New format: data is nested under mortgageSimulation
        loanAmount = simulation.mortgageSimulation.loanAmount;
        interestRate = simulation.mortgageSimulation.interestRate;
        loanTerm = simulation.mortgageSimulation.loanTerm;
        startDate = simulation.mortgageSimulation.startDate;
    } else {
        // Old format: data is directly on the simulation object
        loanAmount = simulation.loanAmount;
        interestRate = simulation.interestRate;
        loanTerm = simulation.loanTerm;
        startDate = simulation.startDate;
    }
    
    // Load basic mortgage details
    document.getElementById('loan-amount').value = loanAmount;
    document.getElementById('interest-rate').value = interestRate;
    document.getElementById('loan-term').value = loanTerm;
    document.getElementById('start-date').value = startDate;
    
    // Update header input
    const simulationTitleInput = document.getElementById('simulation-title-input');
    if (simulationTitleInput) {
        simulationTitleInput.value = simulation.name;
    }
    
    // Load service payments - update the module-level variable
    servicePayments = simulation.mortgageSimulation?.servicePayments || simulation.servicePayments || [];
    updateServicePaymentsDisplay();
    
    // Mark simulation as loaded
    if (typeof window.markSimulationAsLoaded === 'function') {
        window.markSimulationAsLoaded();
    }
    
    // Recalculate and display
    calculateAndDisplay();
    
    showToast(window.i18n.t('messages.simulationLoaded', { name: simulationName }), 'success');
}

// Keep all the existing UI management functions for compatibility
// These functions remain unchanged from the original implementation

function displayAmortizationTable(data, totalInterestWithoutAmortization) {
	const container = document.getElementById('chart-container');
	
	// Create summary section for basic mortgage (without extra payments)
	const summary = `
		<div class="mb-6 p-4 bg-blue-50 rounded-lg">
			<h3 class="text-lg font-semibold text-blue-900 mb-2" data-i18n="schedule.summary">Mortgage Summary</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
				<div>
					<span class="font-medium" data-i18n="schedule.monthlyPayment">Monthly Payment:</span>
					<span class="text-blue-700">€${data.schedule[0]?.payment?.toFixed(2) || '0.00'}</span>
				</div>
				<div>
					<span class="font-medium" data-i18n="schedule.totalInterest">Total Interest:</span>
					<span class="text-blue-700">€${data.totalInterest?.toFixed(2) || '0.00'}</span>
				</div>
				<div>
					<span class="font-medium" data-i18n="schedule.totalServicePayments">Total Service Payments:</span>
					<span class="text-orange-700">€${data.totalServicePayments?.toFixed(2) || '0.00'}</span>
				</div>
				<div>
					<span class="font-medium" data-i18n="schedule.totalPaymentsMade">Total Payments Made:</span>
					<span class="text-purple-700 font-semibold">€${data.totalPayments?.toFixed(2) || '0.00'}</span>
				</div>
			</div>
			<div class="mt-3 p-3 bg-white rounded-lg border border-blue-200">
				<h4 class="text-sm font-semibold text-gray-800 mb-2" data-i18n="schedule.basicMortgage">Basic Mortgage Information</h4>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
					<div>
						<span class="font-medium text-gray-600" data-i18n="schedule.loanAmount">Loan Amount:</span>
						<span class="text-gray-700">€${data.schedule[0]?.balance?.toFixed(2) || '0.00'}</span>
					</div>
					<div>
						<span class="font-medium text-gray-600" data-i18n="schedule.totalInterest">Total Interest:</span>
						<span class="text-blue-700">€${data.totalInterest?.toFixed(2) || '0.00'}</span>
					</div>
				</div>
				<div class="mt-2 text-xs text-gray-600">
					<p data-i18n="schedule.amortizationNote">Note: This shows the basic mortgage schedule. For extra payment scenarios, use the <a href="/amortization" class="text-blue-600 hover:text-blue-800 underline">Amortization Simulation</a> page.</p>
				</div>
			</div>
		</div>
	`;
	
	// Create table for basic mortgage schedule
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
						<th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="schedule.services">Services</th>
						<th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="schedule.totalPayment">Total Payment</th>
						<th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="schedule.balance">Balance</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					${data.schedule.map(row => `
						<tr class="hover:bg-gray-50">
							<td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">${row.period}</td>
							<td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">${row.date}</td>
							<td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">€${row.payment?.toFixed(2) || '0.00'}</td>
							<td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">€${row.principal?.toFixed(2) || '0.00'}</td>
							<td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">€${row.interest?.toFixed(2) || '0.00'}</td>
							<td class="px-3 py-2 whitespace-nowrap text-sm text-right ${row.servicePayments > 0 ? 'text-orange-700 font-medium' : 'text-gray-500'}">€${row.servicePayments?.toFixed(2) || '0.00'}</td>
							<td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right font-medium">€${row.totalPayment?.toFixed(2) || '0.00'}</td>
							<td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">€${row.balance?.toFixed(2) || '0.00'}</td>
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

// Note: Amortization and periodic payment functions have been moved to the separate /amortization page


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

function getSavedSimulations() {
	const stored = localStorage.getItem(SIMULATION_STORAGE_KEY);
	return stored ? JSON.parse(stored) : [];
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
		
		// Handle both old and new format for display
		let loanAmount, interestRate, loanTerm;
		if (simulation.mortgageSimulation) {
			// New format
			loanAmount = simulation.mortgageSimulation.loanAmount;
			interestRate = simulation.mortgageSimulation.interestRate;
			loanTerm = simulation.mortgageSimulation.loanTerm;
		} else {
			// Old format
			loanAmount = simulation.loanAmount;
			interestRate = simulation.interestRate;
			loanTerm = simulation.loanTerm;
		}
		
		option.textContent = `${simulation.name} (€${loanAmount.toLocaleString()}, ${interestRate}%, ${loanTerm}y)`;
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
	
	
	// Auto-calculate on input change
	[loanAmountInput, interestRateInput, loanTermInput, startDateInput].forEach(input => {
		input.addEventListener('input', calculateAndDisplay);
		input.addEventListener('change', calculateAndDisplay);
	});
	
	// Note: Amortization payments are now handled on the separate /amortization page
	
	// Service payments
	const addServicePaymentBtn = document.getElementById('add-service-payment-btn');
	
	addServicePaymentBtn.addEventListener('click', addServicePayment);
	
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
	window.getServicePaymentsFromUI = getServicePaymentsFromUI;
});
