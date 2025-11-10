/**
 * AmortizationSimulation class
 * Represents amortization payments (one-off and periodic) that can be applied to a mortgage
 */
class AmortizationSimulation {
    constructor(oneOffPayments = [], periodicPayments = []) {
        this.oneOffPayments = oneOffPayments;
        this.periodicPayments = periodicPayments;
    }

    /**
     * Add a one-off amortization payment
     * @param {number} amount - Payment amount
     * @param {string} date - Payment date (relative to mortgage start date)
     * @param {number} penalty - Penalty percentage (0-100)
     */
    addOneOffPayment(amount, date, penalty = 0) {
        this.oneOffPayments.push({
            amount: parseFloat(amount),
            date: date,
            penalty: parseFloat(penalty)
        });
    }

    /**
     * Add a periodic amortization payment
     * @param {number} amount - Payment amount
     * @param {number} interval - Payment interval in months
     * @param {number} startPeriod - Starting period (1-based)
     * @param {number} endPeriod - Ending period (1-based)
     * @param {number} penalty - Penalty percentage (0-100)
     */
    addPeriodicPayment(amount, interval, startPeriod, endPeriod, penalty = 0) {
        this.periodicPayments.push({
            amount: parseFloat(amount),
            interval: parseInt(interval),
            startPeriod: parseInt(startPeriod),
            endPeriod: parseInt(endPeriod),
            penalty: parseFloat(penalty)
        });
    }

    /**
     * Remove a one-off payment by index
     */
    removeOneOffPayment(index) {
        if (index >= 0 && index < this.oneOffPayments.length) {
            this.oneOffPayments.splice(index, 1);
        }
    }

    /**
     * Remove a periodic payment by index
     */
    removePeriodicPayment(index) {
        if (index >= 0 && index < this.periodicPayments.length) {
            this.periodicPayments.splice(index, 1);
        }
    }

    /**
     * Get one-off payments for a specific month
     * @param {Date} paymentDate - The payment date
     * @param {Date} mortgageStartDate - The mortgage start date
     */
    getOneOffPaymentsForMonth(paymentDate, mortgageStartDate) {
        const sortedPayments = [...this.oneOffPayments].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return sortedPayments.find(payment => {
            const paymentDateObj = new Date(payment.date);
            return paymentDateObj.getFullYear() === paymentDate.getFullYear() && 
                   paymentDateObj.getMonth() === paymentDate.getMonth();
        });
    }

    /**
     * Get periodic payments for a specific payment period
     * @param {number} currentPeriod - Current payment period (1-based)
     */
    getPeriodicPaymentsForPeriod(currentPeriod) {
        return this.periodicPayments.find(payment => {
            return currentPeriod >= payment.startPeriod && 
                   currentPeriod <= payment.endPeriod && 
                   (currentPeriod - payment.startPeriod) % payment.interval === 0;
        });
    }

    /**
     * Calculate total amortization amount paid
     */
    getTotalAmortizationAmount() {
        const oneOffTotal = this.oneOffPayments.reduce((sum, payment) => sum + payment.amount, 0);
        
        // For periodic payments, we need to calculate based on how many times they would be applied
        // This is a simplified calculation - in practice, you'd need the mortgage term
        const periodicTotal = this.periodicPayments.reduce((sum, payment) => {
            const periods = Math.floor((payment.endPeriod - payment.startPeriod) / payment.interval) + 1;
            return sum + (payment.amount * periods);
        }, 0);
        
        return oneOffTotal + periodicTotal;
    }

    /**
     * Calculate total penalty amount
     */
    getTotalPenaltyAmount() {
        const oneOffPenalties = this.oneOffPayments.reduce((sum, payment) => 
            sum + (payment.amount * payment.penalty / 100), 0);
        
        const periodicPenalties = this.periodicPayments.reduce((sum, payment) => {
            const periods = Math.floor((payment.endPeriod - payment.startPeriod) / payment.interval) + 1;
            return sum + (payment.amount * payment.penalty / 100 * periods);
        }, 0);
        
        return oneOffPenalties + periodicPenalties;
    }

    /**
     * Validate the amortization simulation
     */
    validate() {
        const errors = [];
        
        // Validate one-off payments
        this.oneOffPayments.forEach((payment, index) => {
            if (payment.amount <= 0) {
                errors.push(`One-off payment ${index + 1}: Amount must be greater than 0`);
            }
            if (payment.penalty < 0) {
                errors.push(`One-off payment ${index + 1}: Penalty cannot be negative`);
            }
            if (!payment.date) {
                errors.push(`One-off payment ${index + 1}: Date is required`);
            }
        });
        
        // Validate periodic payments
        this.periodicPayments.forEach((payment, index) => {
            if (payment.amount <= 0) {
                errors.push(`Periodic payment ${index + 1}: Amount must be greater than 0`);
            }
            if (payment.interval <= 0) {
                errors.push(`Periodic payment ${index + 1}: Interval must be greater than 0`);
            }
            if (payment.startPeriod <= 0) {
                errors.push(`Periodic payment ${index + 1}: Start period must be greater than 0`);
            }
            if (payment.endPeriod <= payment.startPeriod) {
                errors.push(`Periodic payment ${index + 1}: End period must be greater than start period`);
            }
            if (payment.penalty < 0) {
                errors.push(`Periodic payment ${index + 1}: Penalty cannot be negative`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Create a copy of this amortization simulation
     */
    clone() {
        return new AmortizationSimulation(
            [...this.oneOffPayments],
            [...this.periodicPayments]
        );
    }

    /**
     * Convert to JSON object for storage
     */
    toJSON() {
        return {
            oneOffPayments: this.oneOffPayments,
            periodicPayments: this.periodicPayments
        };
    }

    /**
     * Create from JSON object
     */
    static fromJSON(data) {
        return new AmortizationSimulation(
            data.oneOffPayments || [],
            data.periodicPayments || []
        );
    }
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
    window.AmortizationSimulation = AmortizationSimulation;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AmortizationSimulation;
}
