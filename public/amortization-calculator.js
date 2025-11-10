/**
 * Amortization Calculator
 * Handles amortization simulation management and calculations
 */

// Global state
let currentAmortizationSimulation = null;
let amortizationPayments = [];
let periodicPayments = [];

// Storage key for amortization simulations
const AMORTIZATION_STORAGE_KEY = 'amortization-calculator-simulations';

/**
 * Initialize the amortization calculator
 */
function initializeAmortizationCalculator() {
    // Set up event listeners
    setupEventListeners();
    
    // Load any existing simulation from URL
    const urlParams = new URLSearchParams(window.location.search);
    const simulationToLoad = urlParams.get('load');
    if (simulationToLoad) {
        loadAmortizationSimulation(decodeURIComponent(simulationToLoad));
        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Sidebar functionality
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const toggleBtn = document.getElementById('sidebar-toggle');
    
    // Toggle sidebar
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('expanded');
            mainContent.classList.toggle('expanded');
        });
    }
    
    // New amortization simulation
    const newBtn = document.getElementById('new-amortization-btn');
    if (newBtn) {
        newBtn.addEventListener('click', function() {
            startNewAmortizationSimulation();
        });
    }
    
    // Load amortization simulation
    const loadBtn = document.getElementById('load-amortization-menu-btn');
    if (loadBtn) {
        loadBtn.addEventListener('click', function() {
            showLoadModal();
        });
    }
    
    // One-off payment management
    const addAmortizationBtn = document.getElementById('add-amortization-btn');
    if (addAmortizationBtn) {
        addAmortizationBtn.addEventListener('click', function() {
            addOneOffPayment();
        });
    }
    
    // Periodic payment management
    const addPeriodicBtn = document.getElementById('add-periodic-payment-btn');
    if (addPeriodicBtn) {
        addPeriodicBtn.addEventListener('click', function() {
            addPeriodicPayment();
        });
    }
    
    const clearPeriodicBtn = document.getElementById('clear-periodic-payments-btn');
    if (clearPeriodicBtn) {
        clearPeriodicBtn.addEventListener('click', function() {
            clearAllPeriodicPayments();
        });
    }
    
    // Simulation title management
    const simulationTitleInput = document.getElementById('simulation-title-input');
    if (simulationTitleInput) {
        simulationTitleInput.addEventListener('input', function() {
            updateSimulationSummary();
        });
    }
    
    // Download spreadsheet button
    const downloadSpreadsheetBtn = document.getElementById('download-spreadsheet-btn');
    if (downloadSpreadsheetBtn) {
        downloadSpreadsheetBtn.addEventListener('click', function() {
            downloadSpreadsheet();
        });
    }
    
    // Modal management
    const loadModal = document.getElementById('load-modal');
    const closeLoadModalBtn = document.getElementById('close-load-modal');
    const languageModal = document.getElementById('language-modal');
    const closeLanguageModalBtn = document.getElementById('close-language-modal');
    const languageMenuBtn = document.getElementById('language-menu-btn');
    
    // Close load modal button
    if (closeLoadModalBtn && loadModal) {
        closeLoadModalBtn.addEventListener('click', function() {
            loadModal.classList.add('hidden');
        });
    }
    
    // Close modals on outside click
    if (loadModal) {
        loadModal.addEventListener('click', function(e) {
            if (e.target === loadModal) {
                loadModal.classList.add('hidden');
            }
        });
    }
    
    // Language modal functionality
    if (languageMenuBtn && languageModal) {
        languageMenuBtn.addEventListener('click', function() {
            languageModal.classList.remove('hidden');
        });
    }
    
    if (closeLanguageModalBtn && languageModal) {
        closeLanguageModalBtn.addEventListener('click', function() {
            languageModal.classList.add('hidden');
        });
    }
    
    if (languageModal) {
        languageModal.addEventListener('click', function(e) {
            if (e.target === languageModal) {
                languageModal.classList.add('hidden');
            }
        });
    }
    
    // Language selection
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.addEventListener('click', function() {
            const lang = this.dataset.lang;
            if (window.i18n && lang) {
                window.i18n.changeLanguage(lang);
            }
            if (languageModal) {
                languageModal.classList.add('hidden');
            }
        });
    });
}

/**
 * Start a new amortization simulation
 */
function startNewAmortizationSimulation() {
    // Clear all payments
    amortizationPayments = [];
    periodicPayments = [];
    
    // Clear UI
    document.getElementById('amortization-payments-list').innerHTML = '';
    document.getElementById('periodic-payments-list').innerHTML = '';
    document.getElementById('simulation-title-input').value = '';
    
    // Show simulation content
    showSimulationContent();
    
    // Update summary
    updateSimulationSummary();
    
    showToast('New amortization simulation started!', 'success');
}

/**
 * Show simulation content
 */
function showSimulationContent() {
    const simulationContent = document.getElementById('simulation-content');
    if (simulationContent) {
        simulationContent.style.display = 'block';
    }
    
    // Show download button when there are payments
    updateDownloadButtonVisibility();
}

/**
 * Update download button visibility
 */
function updateDownloadButtonVisibility() {
    const downloadBtn = document.getElementById('download-spreadsheet-btn');
    if (downloadBtn) {
        if (amortizationPayments.length > 0 || periodicPayments.length > 0) {
            downloadBtn.style.display = 'inline-flex';
        } else {
            downloadBtn.style.display = 'none';
        }
    }
}

/**
 * Add a one-off payment
 */
function addOneOffPayment() {
    const amount = prompt('Enter payment amount (€):');
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    const date = prompt('Enter payment date (YYYY-MM-DD):');
    if (!date || isNaN(Date.parse(date))) {
        showToast('Please enter a valid date', 'error');
        return;
    }
    
    const penalty = prompt('Enter penalty percentage (0-100):', '0');
    if (penalty === null || isNaN(penalty) || parseFloat(penalty) < 0) {
        showToast('Please enter a valid penalty percentage', 'error');
        return;
    }
    
    const payment = {
        amount: parseFloat(amount),
        date: date,
        penalty: parseFloat(penalty)
    };
    
    amortizationPayments.push(payment);
    
    // Show simulation content if first payment
    if (amortizationPayments.length === 1 && periodicPayments.length === 0) {
        showSimulationContent();
    }
    
    updateAmortizationPaymentsDisplay();
    updateSimulationSummary();
    
    showToast('One-off payment added!', 'success');
}

/**
 * Add a periodic payment
 */
function addPeriodicPayment() {
    const amount = document.getElementById('periodic-amount').value;
    const interval = document.getElementById('periodic-interval').value;
    const startPeriod = document.getElementById('periodic-start').value;
    const endPeriod = document.getElementById('periodic-end').value;
    const penalty = document.getElementById('periodic-penalty').value;
    
    if (!amount || !interval || !startPeriod || !endPeriod) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (parseFloat(amount) <= 0) {
        showToast('Amount must be greater than 0', 'error');
        return;
    }
    
    if (parseInt(interval) <= 0) {
        showToast('Interval must be greater than 0', 'error');
        return;
    }
    
    if (parseInt(startPeriod) <= 0) {
        showToast('Start period must be greater than 0', 'error');
        return;
    }
    
    if (parseInt(endPeriod) <= parseInt(startPeriod)) {
        showToast('End period must be greater than start period', 'error');
        return;
    }
    
    const payment = {
        amount: parseFloat(amount),
        interval: parseInt(interval),
        startPeriod: parseInt(startPeriod),
        endPeriod: parseInt(endPeriod),
        penalty: parseFloat(penalty) || 0
    };
    
    periodicPayments.push(payment);
    
    // Show simulation content if first payment
    if (amortizationPayments.length === 0 && periodicPayments.length === 1) {
        showSimulationContent();
    }
    
    updatePeriodicPaymentsDisplay();
    updateSimulationSummary();
    
    // Clear form
    document.getElementById('periodic-amount').value = '';
    document.getElementById('periodic-interval').value = '';
    document.getElementById('periodic-start').value = '';
    document.getElementById('periodic-end').value = '';
    document.getElementById('periodic-penalty').value = '0.5';
    
    showToast('Periodic payment added!', 'success');
}

/**
 * Update amortization payments display
 */
function updateAmortizationPaymentsDisplay() {
    const container = document.getElementById('amortization-payments-list');
    if (!container) return;
    
    if (amortizationPayments.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No one-off payments added</p>';
        return;
    }
    
    container.innerHTML = amortizationPayments.map((payment, index) => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex-1">
                <div class="font-medium">€${payment.amount.toLocaleString()}</div>
                <div class="text-sm text-gray-600">Date: ${payment.date}</div>
                <div class="text-sm text-gray-600">Penalty: ${payment.penalty}%</div>
            </div>
            <button onclick="removeOneOffPayment(${index})" class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                Remove
            </button>
        </div>
    `).join('');
}

/**
 * Update periodic payments display
 */
function updatePeriodicPaymentsDisplay() {
    const container = document.getElementById('periodic-payments-list');
    if (!container) return;
    
    if (periodicPayments.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No periodic payments added</p>';
        return;
    }
    
    container.innerHTML = periodicPayments.map((payment, index) => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex-1">
                <div class="font-medium">€${payment.amount.toLocaleString()} every ${payment.interval} months</div>
                <div class="text-sm text-gray-600">Periods: ${payment.startPeriod} - ${payment.endPeriod}</div>
                <div class="text-sm text-gray-600">Penalty: ${payment.penalty}%</div>
            </div>
            <button onclick="removePeriodicPayment(${index})" class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                Remove
            </button>
        </div>
    `).join('');
}

/**
 * Remove a one-off payment
 */
function removeOneOffPayment(index) {
    if (index >= 0 && index < amortizationPayments.length) {
        amortizationPayments.splice(index, 1);
        updateAmortizationPaymentsDisplay();
        updateSimulationSummary();
        showToast('One-off payment removed', 'success');
    }
}

/**
 * Remove a periodic payment
 */
function removePeriodicPayment(index) {
    if (index >= 0 && index < periodicPayments.length) {
        periodicPayments.splice(index, 1);
        updatePeriodicPaymentsDisplay();
        updateSimulationSummary();
        showToast('Periodic payment removed', 'success');
    }
}

/**
 * Clear all periodic payments
 */
function clearAllPeriodicPayments() {
    if (periodicPayments.length === 0) {
        showToast('No periodic payments to clear', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to clear all periodic payments?')) {
        periodicPayments = [];
        updatePeriodicPaymentsDisplay();
        updateSimulationSummary();
        showToast('All periodic payments cleared', 'success');
    }
}

/**
 * Update simulation summary
 */
function updateSimulationSummary() {
    const container = document.getElementById('summary-container');
    if (!container) return;
    
    // Update download button visibility
    updateDownloadButtonVisibility();
    
    if (amortizationPayments.length === 0 && periodicPayments.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center" data-i18n="amortization.summaryPlaceholder">Add amortization payments to see simulation summary</p>';
        // Hide comparison section when no amortization payments
        updateComparisonTable();
        return;
    }
    
    // Calculate totals
    const oneOffTotal = amortizationPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const oneOffPenalties = amortizationPayments.reduce((sum, payment) => sum + (payment.amount * payment.penalty / 100), 0);
    
    // Calculate periodic totals (simplified)
    const periodicTotal = periodicPayments.reduce((sum, payment) => {
        const periods = Math.floor((payment.endPeriod - payment.startPeriod) / payment.interval) + 1;
        return sum + (payment.amount * periods);
    }, 0);
    
    const periodicPenalties = periodicPayments.reduce((sum, payment) => {
        const periods = Math.floor((payment.endPeriod - payment.startPeriod) / payment.interval) + 1;
        return sum + (payment.amount * payment.penalty / 100 * periods);
    }, 0);
    
    const totalAmount = oneOffTotal + periodicTotal;
    const totalPenalties = oneOffPenalties + periodicPenalties;
    const totalCost = totalAmount + totalPenalties;
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg">
                <div class="text-sm text-blue-600 font-medium">One-off Payments</div>
                <div class="text-2xl font-bold text-blue-900">€${oneOffTotal.toLocaleString()}</div>
                <div class="text-sm text-blue-600">${amortizationPayments.length} payments</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
                <div class="text-sm text-green-600 font-medium">Periodic Payments</div>
                <div class="text-2xl font-bold text-green-900">€${periodicTotal.toLocaleString()}</div>
                <div class="text-sm text-green-600">${periodicPayments.length} schedules</div>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg">
                <div class="text-sm text-yellow-600 font-medium">Total Penalties</div>
                <div class="text-2xl font-bold text-yellow-900">€${totalPenalties.toLocaleString()}</div>
                <div class="text-sm text-yellow-600">Early payment fees</div>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg">
                <div class="text-sm text-purple-600 font-medium">Total Cost</div>
                <div class="text-2xl font-bold text-purple-900">€${totalCost.toLocaleString()}</div>
                <div class="text-sm text-purple-600">Amount + penalties</div>
            </div>
        </div>
    `;
    
    // Update comparison table
    updateComparisonTable();
}

/**
 * Update comparison table showing impact on mortgage simulations
 */
function updateComparisonTable() {
    const comparisonSection = document.getElementById('comparison-section');
    const tableBody = document.getElementById('comparison-table-body');
    const noSimulationsMessage = document.getElementById('no-mortgage-simulations-message');
    
    if (!comparisonSection || !tableBody || !noSimulationsMessage) return;
    
    // Hide comparison section if no amortization payments
    if (amortizationPayments.length === 0 && periodicPayments.length === 0) {
        comparisonSection.style.display = 'none';
        return;
    }
    
    // Get all saved mortgage simulations
    const mortgageSimulations = getSavedMortgageSimulations();
    
    if (mortgageSimulations.length === 0) {
        comparisonSection.style.display = 'block';
        tableBody.parentElement.parentElement.style.display = 'none';
        noSimulationsMessage.style.display = 'block';
        return;
    }
    
    // Show comparison section with data
    comparisonSection.style.display = 'block';
    tableBody.parentElement.parentElement.style.display = 'block';
    noSimulationsMessage.style.display = 'none';
    
    // Generate rows for each mortgage simulation
    tableBody.innerHTML = mortgageSimulations.map(simulation => createComparisonRow(simulation)).join('');
    
    // Add event listeners for expand/collapse buttons
    tableBody.querySelectorAll('.expand-savings-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const rowId = this.dataset.rowId;
            toggleSavingsDetails(rowId);
        });
    });
}

/**
 * Toggle savings details row
 */
function toggleSavingsDetails(rowId) {
    const detailsRow = document.querySelector(`.savings-details-row[data-row-id="${rowId}"]`);
    const expandBtn = document.querySelector(`.expand-savings-btn[data-row-id="${rowId}"] svg`);
    
    if (detailsRow && expandBtn) {
        const isHidden = detailsRow.classList.contains('hidden');
        
        if (isHidden) {
            detailsRow.classList.remove('hidden');
            expandBtn.classList.add('rotate-90');
        } else {
            detailsRow.classList.add('hidden');
            expandBtn.classList.remove('rotate-90');
        }
    }
}

/**
 * Get saved mortgage simulations from localStorage
 */
function getSavedMortgageSimulations() {
    const stored = localStorage.getItem('mortgage-calculator-simulations');
    return stored ? JSON.parse(stored) : [];
}

/**
 * Create a comparison row for a mortgage simulation
 */
function createComparisonRow(simulation) {
    // Handle both old and new format
    const isNewFormat = simulation.mortgageSimulation;
    
    let loanAmount, interestRate, loanTerm, startDate, servicePayments;
    
    if (isNewFormat) {
        // New format - mortgage simulation with nested structure
        loanAmount = simulation.mortgageSimulation?.loanAmount || 0;
        interestRate = simulation.mortgageSimulation?.interestRate || 0;
        loanTerm = simulation.mortgageSimulation?.loanTerm || 0;
        startDate = simulation.mortgageSimulation?.startDate || new Date().toISOString().split('T')[0];
        servicePayments = simulation.mortgageSimulation?.servicePayments || [];
    } else {
        // Old format - direct properties
        loanAmount = simulation.loanAmount || 0;
        interestRate = simulation.interestRate || 0;
        loanTerm = simulation.loanTerm || 0;
        startDate = simulation.startDate || new Date().toISOString().split('T')[0];
        servicePayments = simulation.servicePayments || [];
    }
    
    // Calculate baseline (without amortization)
    const baselineResult = calculateMortgageImpact(
        loanAmount, 
        interestRate, 
        loanTerm, 
        startDate, 
        servicePayments, 
        [], 
        []
    );
    
    // Calculate with amortization
    const withAmortizationResult = calculateMortgageImpact(
        loanAmount, 
        interestRate, 
        loanTerm, 
        startDate, 
        servicePayments, 
        amortizationPayments, 
        periodicPayments
    );
    
    const savings = baselineResult.totalPayment - withAmortizationResult.totalPayment;
    const monthsSaved = baselineResult.actualMonths - withAmortizationResult.actualMonths;
    const interestSavings = baselineResult.totalInterest - withAmortizationResult.totalInterest;
    const serviceSavings = baselineResult.totalServicePayments - withAmortizationResult.totalServicePayments;
    
    // Color coding for savings
    const savingsColor = savings > 0 ? 'text-green-700' : 'text-gray-700';
    const monthsColor = monthsSaved > 0 ? 'text-green-700' : 'text-gray-700';
    
    // Create unique ID for this row
    const rowId = simulation.name.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Generate service breakdown HTML
    let serviceBreakdownHtml = '';
    if (servicePayments.length > 0 && monthsSaved > 0) {
        serviceBreakdownHtml = servicePayments.map(service => {
            const serviceName = service.name || 'Unnamed Service';
            const monthlyCost = parseFloat(service.monthlyCost || 0);
            
            // Calculate months this service would have been active in the baseline
            let baselineServiceMonths = baselineResult.actualMonths;
            if (service.finishDate) {
                const finishDate = new Date(service.finishDate);
                const start = new Date(startDate);
                const monthsUntilFinish = Math.floor((finishDate - start) / (1000 * 60 * 60 * 24 * 30.44));
                baselineServiceMonths = Math.min(baselineResult.actualMonths, Math.max(0, monthsUntilFinish));
            }
            
            // Calculate months this service is active with amortization
            let withAmortizationServiceMonths = withAmortizationResult.actualMonths;
            if (service.finishDate) {
                const finishDate = new Date(service.finishDate);
                const start = new Date(startDate);
                const monthsUntilFinish = Math.floor((finishDate - start) / (1000 * 60 * 60 * 24 * 30.44));
                withAmortizationServiceMonths = Math.min(withAmortizationResult.actualMonths, Math.max(0, monthsUntilFinish));
            }
            
            const monthsSavedForService = baselineServiceMonths - withAmortizationServiceMonths;
            const serviceSavingsAmount = monthsSavedForService * monthlyCost;
            
            if (serviceSavingsAmount > 0) {
                return `
                    <div class="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                        <span class="text-gray-600">${serviceName} (${monthsSavedForService} months)</span>
                        <span class="font-medium text-green-700">€${serviceSavingsAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    </div>
                `;
            }
            return '';
        }).filter(html => html !== '').join('');
    }
    
    return `
        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td class="py-4 px-4">
                <div class="flex items-center">
                    <button class="expand-savings-btn mr-3 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0" data-row-id="${rowId}">
                        <svg class="w-4 h-4 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                    <div>
                        <div class="font-medium text-gray-900">${simulation.name}</div>
                        <div class="text-sm text-gray-500">${Number(interestRate).toFixed(2)}%</div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-4 text-right text-gray-700">€${Number(loanAmount).toLocaleString()}</td>
            <td class="py-4 px-4 text-right text-gray-700">${Number(loanTerm)} years</td>
            <td class="py-4 px-4 text-right font-medium text-gray-900">€${baselineResult.totalPayment.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
            <td class="py-4 px-4 text-right font-medium text-blue-700">€${withAmortizationResult.totalPayment.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
            <td class="py-4 px-4 text-right font-semibold ${savingsColor}">
                ${savings > 0 ? '-' : ''}€${Math.abs(savings).toLocaleString(undefined, {maximumFractionDigits: 0})}
            </td>
            <td class="py-4 px-4 text-right font-semibold ${monthsColor}">
                ${monthsSaved > 0 ? '-' : ''}${Math.abs(monthsSaved)} months
            </td>
        </tr>
        <tr class="savings-details-row hidden" data-row-id="${rowId}">
            <td colspan="7" class="py-4 px-4 bg-gray-50">
                <div class="max-w-4xl mx-auto">
                    <h4 class="font-semibold text-gray-900 mb-3">Savings Breakdown</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Interest Savings -->
                        <div class="bg-white p-4 rounded-lg border border-gray-200">
                            <div class="flex justify-between items-start mb-2">
                                <span class="text-sm font-medium text-gray-700">Interest Savings</span>
                                <span class="text-lg font-bold text-green-700">€${interestSavings.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                            </div>
                            <div class="text-xs text-gray-500 space-y-1">
                                <div class="flex justify-between">
                                    <span>Baseline Interest:</span>
                                    <span>€${baselineResult.totalInterest.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>With Amortization:</span>
                                    <span>€${withAmortizationResult.totalInterest.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Service Payment Savings -->
                        <div class="bg-white p-4 rounded-lg border border-gray-200">
                            <div class="flex justify-between items-start mb-2">
                                <span class="text-sm font-medium text-gray-700">Service Payment Savings</span>
                                <span class="text-lg font-bold text-green-700">€${serviceSavings.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                            </div>
                            ${serviceBreakdownHtml ? `
                                <div class="text-xs text-gray-500 mt-2">
                                    <div class="font-medium mb-1">By Service:</div>
                                    ${serviceBreakdownHtml}
                                </div>
                            ` : `
                                <div class="text-xs text-gray-500">
                                    ${servicePayments.length === 0 ? 'No service payments configured' : 'No service payment savings (loan paid off before service end dates)'}
                                </div>
                            `}
                        </div>
                    </div>
                    
                    <!-- Summary -->
                    <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium text-blue-900">Total Savings</span>
                            <span class="text-xl font-bold text-blue-900">€${savings.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        </div>
                        <div class="text-xs text-blue-700 mt-1">
                            By paying off the loan ${monthsSaved} months early, you save on ${interestSavings > 0 ? 'interest' : ''}${interestSavings > 0 && serviceSavings > 0 ? ' and ' : ''}${serviceSavings > 0 ? 'service payments' : ''}
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Calculate mortgage impact with or without amortization
 */
function calculateMortgageImpact(loanAmount, interestRate, loanTerm, startDate, servicePayments = [], amortizationPayments = [], periodicPayments = []) {
    const principal = Number(loanAmount);
    const annualRate = Number(interestRate);
    const years = Number(loanTerm);
    
    const monthlyRate = annualRate / 100 / 12;
    const totalPayments = years * 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    let balance = principal;
    let totalPayment = 0;
    let totalInterest = 0;
    let totalServicePayments = 0;
    let actualMonths = 0;
    
    for (let i = 0; i < totalPayments && balance > 0.01; i++) {
        const paymentDate = new Date(startDate);
        paymentDate.setMonth(paymentDate.getMonth() + i);
        
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        
        // Check for amortization payments this month
        let amortizationAmount = 0;
        let penaltyAmount = 0;
        
        const amortizationThisMonth = amortizationPayments.find(payment => {
            const paymentDateObj = new Date(payment.date);
            return paymentDateObj.getFullYear() === paymentDate.getFullYear() && 
                   paymentDateObj.getMonth() === paymentDate.getMonth();
        });
        
        if (amortizationThisMonth) {
            amortizationAmount = parseFloat(amortizationThisMonth.amount);
            penaltyAmount = amortizationAmount * (parseFloat(amortizationThisMonth.penalty) / 100);
        }
        
        // Check for periodic payments this month
        let periodicAmount = 0;
        let periodicPenaltyAmount = 0;
        
        const currentPeriod = i + 1;
        const periodicPaymentThisMonth = periodicPayments.find(payment => {
            return currentPeriod >= payment.startPeriod && 
                   currentPeriod <= payment.endPeriod && 
                   (currentPeriod - payment.startPeriod) % payment.interval === 0;
        });
        
        if (periodicPaymentThisMonth) {
            periodicAmount = parseFloat(periodicPaymentThisMonth.amount);
            periodicPenaltyAmount = periodicAmount * (parseFloat(periodicPaymentThisMonth.penalty) / 100);
        }
        
        // Calculate service payments for this month
        let monthlyServicePayments = 0;
        servicePayments.forEach(service => {
            const serviceFinishDate = service.finishDate ? new Date(service.finishDate) : null;
            const isServiceActive = !serviceFinishDate || paymentDate <= serviceFinishDate;
            
            if (isServiceActive) {
                monthlyServicePayments += parseFloat(service.monthlyCost || 0);
            }
        });
        
        // Calculate effective principal payment
        const effectivePrincipalPayment = principalPayment + amortizationAmount + periodicAmount;
        
        // Update balance
        balance = Math.max(0, balance - effectivePrincipalPayment);
        
        // Accumulate totals
        totalInterest += interestPayment;
        totalServicePayments += monthlyServicePayments;
        
        // Calculate total payment for this month
        const monthlyTotalPayment = monthlyPayment + amortizationAmount + penaltyAmount + periodicAmount + periodicPenaltyAmount + monthlyServicePayments;
        totalPayment += monthlyTotalPayment;
        
        actualMonths++;
    }
    
    return {
        totalPayment: totalPayment,
        actualMonths: actualMonths,
        totalInterest: totalInterest,
        totalServicePayments: totalServicePayments
    };
}

/**
 * Save amortization simulation
 */
function saveAmortizationSimulation(name) {
    if (!name || name.trim() === '') {
        showToast('Please enter a simulation name', 'warning');
        return;
    }
    
    const simulation = {
        name: name.trim(),
        oneOffPayments: [...amortizationPayments],
        periodicPayments: [...periodicPayments],
        savedAt: new Date().toISOString()
    };
    
    // Get existing simulations
    const existingSimulations = getSavedAmortizationSimulations();
    
    // Check if name already exists
    const existingIndex = existingSimulations.findIndex(s => s.name === name.trim());
    if (existingIndex !== -1) {
        if (!confirm(`A simulation with the name "${name}" already exists. Do you want to overwrite it?`)) {
            return;
        }
        existingSimulations[existingIndex] = simulation;
    } else {
        existingSimulations.push(simulation);
    }
    
    // Save to localStorage
    localStorage.setItem(AMORTIZATION_STORAGE_KEY, JSON.stringify(existingSimulations));
    
    // Update header input
    const simulationTitleInput = document.getElementById('simulation-title-input');
    if (simulationTitleInput) {
        simulationTitleInput.value = name.trim();
    }
    
    showToast(`Amortization simulation "${name}" saved!`, 'success');
}

/**
 * Load amortization simulation
 */
function loadAmortizationSimulation(simulationName) {
    const simulations = getSavedAmortizationSimulations();
    const simulation = simulations.find(s => s.name === simulationName);
    
    if (!simulation) {
        showToast('Simulation not found!', 'error');
        return;
    }
    
    // Load payments
    amortizationPayments = simulation.oneOffPayments || [];
    periodicPayments = simulation.periodicPayments || [];
    
    // Update UI
    updateAmortizationPaymentsDisplay();
    updatePeriodicPaymentsDisplay();
    
    // Update header input
    const simulationTitleInput = document.getElementById('simulation-title-input');
    if (simulationTitleInput) {
        simulationTitleInput.value = simulation.name;
    }
    
    // Show simulation content
    showSimulationContent();
    
    // Update summary
    updateSimulationSummary();
    
    showToast(`Amortization simulation "${simulationName}" loaded!`, 'success');
}

/**
 * Get saved amortization simulations
 */
function getSavedAmortizationSimulations() {
    const stored = localStorage.getItem(AMORTIZATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

/**
 * Show load modal
 */
function showLoadModal() {
    const modal = document.getElementById('load-modal');
    if (!modal) return;
    
    const simulations = getSavedAmortizationSimulations();
    const container = document.getElementById('load-simulations-list');
    
    if (simulations.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No saved amortization simulations found</p>';
    } else {
        container.innerHTML = simulations.map(simulation => `
            <div class="simulation-item" data-name="${simulation.name}">
                <div class="simulation-info">
                    <div class="simulation-name">${simulation.name}</div>
                    <div class="simulation-details">
                        ${simulation.oneOffPayments.length} one-off • ${simulation.periodicPayments.length} periodic • ${new Date(simulation.savedAt).toLocaleDateString()}
                    </div>
                </div>
                <div class="simulation-actions">
                    <button class="load-simulation-btn px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm" data-name="${simulation.name}">
                        Load
                    </button>
                    <button class="delete-simulation-btn px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm" data-name="${simulation.name}">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        container.querySelectorAll('.load-simulation-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const simulationName = this.dataset.name;
                modal.classList.add('hidden');
                loadAmortizationSimulation(simulationName);
            });
        });
        
        container.querySelectorAll('.delete-simulation-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const simulationName = this.dataset.name;
                if (confirm(`Are you sure you want to delete "${simulationName}"?`)) {
                    deleteAmortizationSimulation(simulationName);
                    showLoadModal(); // Refresh the list
                }
            });
        });
    }
    
    modal.classList.remove('hidden');
}

/**
 * Delete amortization simulation
 */
function deleteAmortizationSimulation(simulationName) {
    const simulations = getSavedAmortizationSimulations();
    const filteredSimulations = simulations.filter(s => s.name !== simulationName);
    
    localStorage.setItem(AMORTIZATION_STORAGE_KEY, JSON.stringify(filteredSimulations));
    showToast(`Amortization simulation "${simulationName}" deleted!`, 'success');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAmortizationCalculator();
});

/**
 * Download spreadsheet with amortization simulation data
 */
function downloadSpreadsheet() {
    if (typeof XLSX === 'undefined') {
        showToast('Spreadsheet library not loaded. Please refresh the page.', 'error');
        return;
    }
    
    const simulationTitle = document.getElementById('simulation-title-input')?.value || 'Amortization Simulation';
    
    try {
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Create overview sheet
        const overviewSheet = createOverviewSheet();
        XLSX.utils.book_append_sheet(wb, overviewSheet, 'Overview');
        
        // Create detailed sheets for each mortgage simulation
        const mortgageSimulations = getSavedMortgageSimulations();
        mortgageSimulations.forEach((simulation, index) => {
            const mortgageSheet = createMortgageDetailSheet(simulation);
            // Truncate sheet name if too long (Excel limit is 31 characters)
            let sheetName = simulation.name.substring(0, 28);
            if (simulation.name.length > 28) {
                sheetName += '...';
            }
            XLSX.utils.book_append_sheet(wb, mortgageSheet, sheetName);
        });
        
        // Generate file (XLSX for better styling support)
        const fileName = `${simulationTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName, { bookType: 'xlsx' });
        
        showToast('Spreadsheet downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error generating spreadsheet:', error);
        showToast('Error generating spreadsheet: ' + error.message, 'error');
    }
}

/**
 * Create overview sheet with amortization summary and mortgage comparisons
 */
function createOverviewSheet() {
    const data = [];
    
    // Title
    data.push(['Amortization Simulation Overview']);
    data.push([]);
    
    // Simulation name
    const simulationTitle = document.getElementById('simulation-title-input')?.value || 'Unnamed Simulation';
    data.push(['Simulation Name:', simulationTitle]);
    data.push(['Generated:', new Date().toLocaleString()]);
    data.push([]);
    
    // One-off Payments Summary
    data.push(['ONE-OFF PAYMENTS']);
    const oneOffHeaderRow = data.length + 1; // Track header row for formulas
    if (amortizationPayments.length > 0) {
        data.push(['Date', 'Amount (€)', 'Penalty (%)', 'Penalty Amount (€)']);
        const oneOffDataStartRow = data.length + 1;
        amortizationPayments.forEach(payment => {
            data.push([payment.date, payment.amount, payment.penalty, null]); // null will be replaced with formula
        });
        const oneOffDataEndRow = data.length;
        data.push(['TOTAL', null, '', null]); // nulls will be replaced with formulas
    } else {
        data.push(['No one-off payments']);
    }
    data.push([]);
    
    // Periodic Payments Summary
    const periodicHeaderRow = data.length;
    data.push(['PERIODIC PAYMENTS']);
    const periodicDataHeaderRow = data.length + 1;
    if (periodicPayments.length > 0) {
        data.push(['Amount (€)', 'Interval (months)', 'Start Period', 'End Period', 'Penalty (%)', 'Total Payments', 'Total Amount (€)']);
        const periodicDataStartRow = data.length + 1;
        periodicPayments.forEach(payment => {
            data.push([payment.amount, payment.interval, payment.startPeriod, payment.endPeriod, payment.penalty, null, null]); // nulls will be replaced with formulas
        });
        const periodicDataEndRow = data.length;
        data.push(['', '', '', '', '', 'TOTAL', null]); // null will be replaced with formula
    } else {
        data.push(['No periodic payments']);
    }
    data.push([]);
    
    // Overall Summary
    const summaryStartRow = data.length + 1;
    data.push(['OVERALL SUMMARY']);
    data.push(['Total One-off Payments:', null]);
    data.push(['Total Periodic Payments:', null]);
    data.push(['Total Amortization Amount:', null]);
    data.push(['Total Penalties:', null]);
    data.push(['Total Cost (Amount + Penalties):', null]);
    data.push([]);
    
    // Mortgage Simulations Comparison
    const mortgageComparisonStartRow = data.length + 1;
    data.push(['IMPACT ON MORTGAGE SIMULATIONS']);
    const mortgageSimulations = getSavedMortgageSimulations();
    
    if (mortgageSimulations.length > 0) {
        data.push(['Name', 'Loan Amount (€)', 'Interest Rate (%)', 'Loan Term (years)', 'Baseline Total (€)', 'With Amortization (€)', 'Savings (€)', 'Interest Savings (€)', 'Service Savings (€)', 'Months Saved']);
        const mortgageDataStartRow = data.length + 1;
        
        mortgageSimulations.forEach(simulation => {
            const isNewFormat = simulation.mortgageSimulation;
            let loanAmount, interestRate, loanTerm, startDate, servicePayments;
            
            if (isNewFormat) {
                loanAmount = simulation.mortgageSimulation?.loanAmount || 0;
                interestRate = simulation.mortgageSimulation?.interestRate || 0;
                loanTerm = simulation.mortgageSimulation?.loanTerm || 0;
                startDate = simulation.mortgageSimulation?.startDate || new Date().toISOString().split('T')[0];
                servicePayments = simulation.mortgageSimulation?.servicePayments || [];
            } else {
                loanAmount = simulation.loanAmount || 0;
                interestRate = simulation.interestRate || 0;
                loanTerm = simulation.loanTerm || 0;
                startDate = simulation.startDate || new Date().toISOString().split('T')[0];
                servicePayments = simulation.servicePayments || [];
            }
            
            const baselineResult = calculateMortgageImpact(loanAmount, interestRate, loanTerm, startDate, servicePayments, [], []);
            const withAmortizationResult = calculateMortgageImpact(loanAmount, interestRate, loanTerm, startDate, servicePayments, amortizationPayments, periodicPayments);
            
            data.push([
                simulation.name,
                loanAmount,
                interestRate,
                loanTerm,
                baselineResult.totalPayment,
                withAmortizationResult.totalPayment,
                null, // Savings - will be formula
                null, // Interest Savings - will be formula
                null, // Service Savings - will be formula
                baselineResult.actualMonths - withAmortizationResult.actualMonths
            ]);
        });
    } else {
        data.push(['No saved mortgage simulations found']);
    }
    
    // Create worksheet from array
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Add formulas where we put null values
    // One-off Payments - Penalty Amount formulas
    if (amortizationPayments.length > 0) {
        const oneOffDataStartRow = oneOffHeaderRow + 1;
        amortizationPayments.forEach((payment, idx) => {
            const row = oneOffDataStartRow + idx;
            const cellAddr = XLSX.utils.encode_cell({ r: row - 1, c: 3 }); // Column D (Penalty Amount)
            ws[cellAddr] = { t: 'n', f: `B${row}*C${row}/100` };
        });
        
        // One-off Total formulas
        const totalRow = oneOffDataStartRow + amortizationPayments.length;
        const amountTotalAddr = XLSX.utils.encode_cell({ r: totalRow - 1, c: 1 }); // Column B
        const penaltyTotalAddr = XLSX.utils.encode_cell({ r: totalRow - 1, c: 3 }); // Column D
        ws[amountTotalAddr] = { t: 'n', f: `SUM(B${oneOffDataStartRow}:B${totalRow - 1})` };
        ws[penaltyTotalAddr] = { t: 'n', f: `SUM(D${oneOffDataStartRow}:D${totalRow - 1})` };
    }
    
    // Periodic Payments - Total Payments and Total Amount formulas
    if (periodicPayments.length > 0) {
        const periodicDataStartRow = periodicDataHeaderRow + 1;
        periodicPayments.forEach((payment, idx) => {
            const row = periodicDataStartRow + idx;
            const totalPaymentsAddr = XLSX.utils.encode_cell({ r: row - 1, c: 5 }); // Column F (Total Payments)
            const totalAmountAddr = XLSX.utils.encode_cell({ r: row - 1, c: 6 }); // Column G (Total Amount)
            ws[totalPaymentsAddr] = { t: 'n', f: `FLOOR((D${row}-C${row})/B${row})+1` };
            ws[totalAmountAddr] = { t: 'n', f: `A${row}*F${row}` };
        });
        
        // Periodic Total formula
        const totalRow = periodicDataStartRow + periodicPayments.length;
        const periodicTotalAddr = XLSX.utils.encode_cell({ r: totalRow - 1, c: 6 }); // Column G
        ws[periodicTotalAddr] = { t: 'n', f: `SUM(G${periodicDataStartRow}:G${totalRow - 1})` };
    }
    
    // Overall Summary formulas
    const oneOffTotalRow = amortizationPayments.length > 0 ? (oneOffHeaderRow + amortizationPayments.length + 1) : 0;
    const periodicTotalRow = periodicPayments.length > 0 ? (periodicDataHeaderRow + periodicPayments.length + 1) : 0;
    
    const summaryRow1 = summaryStartRow + 1; // Total One-off Payments
    const summaryRow2 = summaryStartRow + 2; // Total Periodic Payments
    const summaryRow3 = summaryStartRow + 3; // Total Amortization Amount
    const summaryRow4 = summaryStartRow + 4; // Total Penalties
    const summaryRow5 = summaryStartRow + 5; // Total Cost
    
    if (amortizationPayments.length > 0) {
        ws[XLSX.utils.encode_cell({ r: summaryRow1 - 1, c: 1 })] = { t: 'n', f: `B${oneOffTotalRow}` };
        const oneOffPenaltyFormula = `D${oneOffTotalRow}`;
        
        if (periodicPayments.length > 0) {
            const periodicPenaltyFormula = `SUMPRODUCT((A${periodicDataHeaderRow + 1}:A${periodicDataHeaderRow + periodicPayments.length})*(E${periodicDataHeaderRow + 1}:E${periodicDataHeaderRow + periodicPayments.length})/100*(F${periodicDataHeaderRow + 1}:F${periodicDataHeaderRow + periodicPayments.length}))`;
            ws[XLSX.utils.encode_cell({ r: summaryRow2 - 1, c: 1 })] = { t: 'n', f: `G${periodicTotalRow}` };
            ws[XLSX.utils.encode_cell({ r: summaryRow3 - 1, c: 1 })] = { t: 'n', f: `B${summaryRow1}+B${summaryRow2}` };
            ws[XLSX.utils.encode_cell({ r: summaryRow4 - 1, c: 1 })] = { t: 'n', f: `${oneOffPenaltyFormula}+${periodicPenaltyFormula}` };
        } else {
            ws[XLSX.utils.encode_cell({ r: summaryRow2 - 1, c: 1 })] = { t: 'n', v: 0 };
            ws[XLSX.utils.encode_cell({ r: summaryRow3 - 1, c: 1 })] = { t: 'n', f: `B${summaryRow1}` };
            ws[XLSX.utils.encode_cell({ r: summaryRow4 - 1, c: 1 })] = { t: 'n', f: oneOffPenaltyFormula };
        }
    } else if (periodicPayments.length > 0) {
        ws[XLSX.utils.encode_cell({ r: summaryRow1 - 1, c: 1 })] = { t: 'n', v: 0 };
        ws[XLSX.utils.encode_cell({ r: summaryRow2 - 1, c: 1 })] = { t: 'n', f: `G${periodicTotalRow}` };
        ws[XLSX.utils.encode_cell({ r: summaryRow3 - 1, c: 1 })] = { t: 'n', f: `B${summaryRow2}` };
        const periodicPenaltyFormula = `SUMPRODUCT((A${periodicDataHeaderRow + 1}:A${periodicDataHeaderRow + periodicPayments.length})*(E${periodicDataHeaderRow + 1}:E${periodicDataHeaderRow + periodicPayments.length})/100*(F${periodicDataHeaderRow + 1}:F${periodicDataHeaderRow + periodicPayments.length}))`;
        ws[XLSX.utils.encode_cell({ r: summaryRow4 - 1, c: 1 })] = { t: 'n', f: periodicPenaltyFormula };
    }
    
    ws[XLSX.utils.encode_cell({ r: summaryRow5 - 1, c: 1 })] = { t: 'n', f: `B${summaryRow3}+B${summaryRow4}` };
    
    // Mortgage Comparisons - Add formulas for Savings
    if (mortgageSimulations.length > 0) {
        const mortgageDataStartRow = mortgageComparisonStartRow + 2;
        mortgageSimulations.forEach((simulation, idx) => {
            const row = mortgageDataStartRow + idx;
            const savingsAddr = XLSX.utils.encode_cell({ r: row - 1, c: 6 }); // Column G (Savings)
            const interestSavingsAddr = XLSX.utils.encode_cell({ r: row - 1, c: 7 }); // Column H (Interest Savings)
            const serviceSavingsAddr = XLSX.utils.encode_cell({ r: row - 1, c: 8 }); // Column I (Service Savings)
            
            ws[savingsAddr] = { t: 'n', f: `E${row}-F${row}` };
            ws[interestSavingsAddr] = { t: 'n', f: `G${row}-(B${summaryRow3}+B${summaryRow4})` };
            ws[serviceSavingsAddr] = { t: 'n', f: `G${row}-(B${summaryRow3}+B${summaryRow4})-H${row}` };
        });
    }
    
    // Set column widths for better readability
    ws['!cols'] = [
        { wch: 30 },  // Column A - Names/Labels
        { wch: 18 },  // Column B
        { wch: 18 },  // Column C
        { wch: 18 },  // Column D
        { wch: 18 },  // Column E
        { wch: 22 },  // Column F - With Amortization
        { wch: 15 },  // Column G
        { wch: 18 },  // Column H
        { wch: 18 },  // Column I
        { wch: 15 }   // Column J
    ];
    
    return ws;
}

/**
 * Create detailed mortgage sheet with payment table
 */
function createMortgageDetailSheet(simulation) {
    const data = [];
    
    // Extract mortgage data
    const isNewFormat = simulation.mortgageSimulation;
    let loanAmount, interestRate, loanTerm, startDate, servicePayments;
    
    if (isNewFormat) {
        loanAmount = simulation.mortgageSimulation?.loanAmount || 0;
        interestRate = simulation.mortgageSimulation?.interestRate || 0;
        loanTerm = simulation.mortgageSimulation?.loanTerm || 0;
        startDate = simulation.mortgageSimulation?.startDate || new Date().toISOString().split('T')[0];
        servicePayments = simulation.mortgageSimulation?.servicePayments || [];
    } else {
        loanAmount = simulation.loanAmount || 0;
        interestRate = simulation.interestRate || 0;
        loanTerm = simulation.loanTerm || 0;
        startDate = simulation.startDate || new Date().toISOString().split('T')[0];
        servicePayments = simulation.servicePayments || [];
    }
    
    // Mortgage details header
    data.push([simulation.name]);
    data.push([]);
    data.push(['Loan Amount:', loanAmount, '€']);
    data.push(['Interest Rate:', interestRate, '%']);
    data.push(['Loan Term:', loanTerm, 'years']);
    data.push(['Start Date:', startDate]);
    data.push([]);
    
    const detailsRowOffset = data.length - 7; // Keep track of where details start
    
    // Service payments
    if (servicePayments.length > 0) {
        data.push(['SERVICE PAYMENTS']);
        data.push(['Name', 'Monthly Cost (€)', 'Finish Date']);
        servicePayments.forEach(service => {
            data.push([service.name || 'Unnamed', service.monthlyCost || 0, service.finishDate || 'N/A']);
        });
        data.push([]);
    }
    
    // Generate payment schedule with amortization
    const scheduleStartRow = data.length + 1;
    data.push(['PAYMENT SCHEDULE WITH AMORTIZATION']);
    data.push(['Period', 'Date', 'Monthly Payment (€)', 'Interest (€)', 'Principal (€)', 'Amortization (€)', 'Penalty (€)', 'Service Payments (€)', 'Total Payment (€)', 'Remaining Balance (€)']);
    
    const principal = Number(loanAmount);
    const annualRate = Number(interestRate);
    const years = Number(loanTerm);
    const monthlyRate = annualRate / 100 / 12;
    const totalPayments = years * 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    let balance = principal;
    let period = 0;
    const scheduleDataStartRow = data.length + 1;
    
    for (let i = 0; i < totalPayments && balance > 0.01; i++) {
        period = i + 1;
        const paymentDate = new Date(startDate);
        paymentDate.setMonth(paymentDate.getMonth() + i);
        
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        
        // Check for amortization payments this month
        let amortizationAmount = 0;
        let penaltyAmount = 0;
        
        const amortizationThisMonth = amortizationPayments.find(payment => {
            const paymentDateObj = new Date(payment.date);
            return paymentDateObj.getFullYear() === paymentDate.getFullYear() && 
                   paymentDateObj.getMonth() === paymentDate.getMonth();
        });
        
        if (amortizationThisMonth) {
            amortizationAmount = parseFloat(amortizationThisMonth.amount);
            penaltyAmount = amortizationAmount * (parseFloat(amortizationThisMonth.penalty) / 100);
        }
        
        // Check for periodic payments
        const periodicPaymentThisMonth = periodicPayments.find(payment => {
            return period >= payment.startPeriod && 
                   period <= payment.endPeriod && 
                   (period - payment.startPeriod) % payment.interval === 0;
        });
        
        if (periodicPaymentThisMonth) {
            amortizationAmount += parseFloat(periodicPaymentThisMonth.amount);
            penaltyAmount += parseFloat(periodicPaymentThisMonth.amount) * (parseFloat(periodicPaymentThisMonth.penalty) / 100);
        }
        
        // Calculate service payments for this month
        let monthlyServicePayments = 0;
        servicePayments.forEach(service => {
            const serviceFinishDate = service.finishDate ? new Date(service.finishDate) : null;
            const isServiceActive = !serviceFinishDate || paymentDate <= serviceFinishDate;
            
            if (isServiceActive) {
                monthlyServicePayments += parseFloat(service.monthlyCost || 0);
            }
        });
        
        // Calculate effective principal payment
        const effectivePrincipalPayment = principalPayment + amortizationAmount;
        
        // Update balance
        const newBalance = Math.max(0, balance - effectivePrincipalPayment);
        
        // Calculate total payment for this month
        const monthlyTotalPayment = monthlyPayment + amortizationAmount + penaltyAmount + monthlyServicePayments;
        
        // Push row with nulls for values that will be formulas
        data.push([
            period,
            paymentDate.toISOString().split('T')[0],
            monthlyPayment,
            null, // Interest - will be formula
            null, // Principal - will be formula
            amortizationAmount,
            penaltyAmount,
            monthlyServicePayments,
            null, // Total Payment - will be formula
            null  // Remaining Balance - will be formula
        ]);
        
        balance = newBalance;
    }
    
    const scheduleDataEndRow = data.length;
    
    // Summary at the end
    data.push([]);
    const summaryStartRow = data.length + 1;
    data.push(['SUMMARY']);
    const baselineResult = calculateMortgageImpact(loanAmount, interestRate, loanTerm, startDate, servicePayments, [], []);
    const withAmortizationResult = calculateMortgageImpact(loanAmount, interestRate, loanTerm, startDate, servicePayments, amortizationPayments, periodicPayments);
    
    data.push(['Total Payments (Baseline):', baselineResult.totalPayment, '€']);
    data.push(['Total Payments (With Amortization):', withAmortizationResult.totalPayment, '€']);
    data.push(['Total Savings:', null, '€']); // Will be formula
    data.push(['Months (Baseline):', baselineResult.actualMonths]);
    data.push(['Months (With Amortization):', withAmortizationResult.actualMonths]);
    data.push(['Months Saved:', null]); // Will be formula
    
    // Create worksheet from array
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Add formulas to payment schedule
    for (let i = 0; i < (scheduleDataEndRow - scheduleDataStartRow + 1); i++) {
        const row = scheduleDataStartRow + i;
        const isFirstRow = i === 0;
        const prevRow = row - 1;
        
        // Interest formula: Remaining Balance (previous row) * monthly rate
        // For first row, use initial loan amount
        const interestAddr = XLSX.utils.encode_cell({ r: row - 1, c: 3 }); // Column D
        if (isFirstRow) {
            ws[interestAddr] = { t: 'n', f: `B3*B4/100/12` }; // Use loan amount and interest rate from header
        } else {
            ws[interestAddr] = { t: 'n', f: `J${prevRow}*B4/100/12` };
        }
        
        // Principal formula: Monthly Payment - Interest
        const principalAddr = XLSX.utils.encode_cell({ r: row - 1, c: 4 }); // Column E
        ws[principalAddr] = { t: 'n', f: `C${row}-D${row}` };
        
        // Total Payment formula: Monthly Payment + Amortization + Penalty + Service Payments
        const totalPaymentAddr = XLSX.utils.encode_cell({ r: row - 1, c: 8 }); // Column I
        ws[totalPaymentAddr] = { t: 'n', f: `C${row}+F${row}+G${row}+H${row}` };
        
        // Remaining Balance formula: Previous Balance - (Principal + Amortization)
        const balanceAddr = XLSX.utils.encode_cell({ r: row - 1, c: 9 }); // Column J
        if (isFirstRow) {
            ws[balanceAddr] = { t: 'n', f: `MAX(0,B3-(E${row}+F${row}))` };
        } else {
            ws[balanceAddr] = { t: 'n', f: `MAX(0,J${prevRow}-(E${row}+F${row}))` };
        }
    }
    
    // Add formulas to summary
    const summaryRow3 = summaryStartRow + 2; // Total Savings
    const summaryRow6 = summaryStartRow + 5; // Months Saved
    
    ws[XLSX.utils.encode_cell({ r: summaryRow3 - 1, c: 1 })] = { t: 'n', f: `B${summaryStartRow+1}-B${summaryStartRow+2}` };
    ws[XLSX.utils.encode_cell({ r: summaryRow6 - 1, c: 1 })] = { t: 'n', f: `B${summaryStartRow+4}-B${summaryStartRow+5}` };
    
    return ws;
}

// Make functions globally accessible
window.removeOneOffPayment = removeOneOffPayment;
window.removePeriodicPayment = removePeriodicPayment;
window.saveAmortizationSimulation = saveAmortizationSimulation;
window.loadAmortizationSimulation = loadAmortizationSimulation;
window.downloadSpreadsheet = downloadSpreadsheet;
