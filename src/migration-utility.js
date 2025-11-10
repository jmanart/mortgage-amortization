/**
 * Migration Utility for Mortgage Calculator
 * Converts old simulation format to new separated format
 */

/**
 * Migrate a single simulation from old format to new format
 * @param {Object} oldSimulation - Simulation in old format
 * @returns {Object} Simulation in new format
 */
function migrateSimulation(oldSimulation) {
    // Check if already migrated
    if (oldSimulation.mortgageSimulation && oldSimulation.amortizationSimulation) {
        return oldSimulation;
    }
    
    // Create new format simulation
    const newSimulation = {
        name: oldSimulation.name,
        savedAt: oldSimulation.savedAt,
        mortgageSimulation: {
            loanAmount: oldSimulation.loanAmount,
            interestRate: oldSimulation.interestRate,
            loanTerm: oldSimulation.loanTerm,
            startDate: oldSimulation.startDate,
            servicePayments: oldSimulation.servicePayments || []
        },
        amortizationSimulation: {
            oneOffPayments: oldSimulation.amortizationPayments || [],
            periodicPayments: oldSimulation.periodicPayments || []
        }
    };
    
    return newSimulation;
}

/**
 * Migrate all simulations in localStorage
 * @returns {number} Number of simulations migrated
 */
function migrateAllSimulations() {
    const simulations = JSON.parse(localStorage.getItem('mortgage-calculator-simulations') || '[]');
    let migratedCount = 0;
    
    const migratedSimulations = simulations.map(simulation => {
        const isOldFormat = !simulation.mortgageSimulation;
        if (isOldFormat) {
            migratedCount++;
            return migrateSimulation(simulation);
        }
        return simulation;
    });
    
    if (migratedCount > 0) {
        localStorage.setItem('mortgage-calculator-simulations', JSON.stringify(migratedSimulations));
        console.log(`Migrated ${migratedCount} simulations to new format`);
    }
    
    return migratedCount;
}

/**
 * Check if any simulations need migration
 * @returns {boolean} True if migration is needed
 */
function needsMigration() {
    const simulations = JSON.parse(localStorage.getItem('mortgage-calculator-simulations') || '[]');
    return simulations.some(simulation => !simulation.mortgageSimulation);
}

// Auto-migrate on load
document.addEventListener('DOMContentLoaded', function() {
    if (needsMigration()) {
        const migratedCount = migrateAllSimulations();
        if (migratedCount > 0) {
            // Show a toast notification if available
            if (typeof showToast === 'function') {
                showToast(`Migrated ${migratedCount} simulations to new format`, 'success');
            } else {
                console.log(`Migrated ${migratedCount} simulations to new format`);
            }
        }
    }
});

// Make functions globally available
if (typeof window !== 'undefined') {
    window.migrateSimulation = migrateSimulation;
    window.migrateAllSimulations = migrateAllSimulations;
    window.needsMigration = needsMigration;
}
