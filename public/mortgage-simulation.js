/**
 * MortgageSimulation class
 * Represents a mortgage loan with basic parameters and service payments
 */
class MortgageSimulation {
    constructor(loanAmount, interestRate, loanTerm, startDate, servicePayments = []) {
        this.loanAmount = loanAmount;
        this.interestRate = interestRate;
        this.loanTerm = loanTerm;
        this.startDate = startDate;
        this.servicePayments = servicePayments;
    }

    /**
     * Calculate the monthly payment using French amortization formula
     */
    calculateMonthlyPayment() {
        const monthlyRate = this.interestRate / 100 / 12;
        const totalPayments = this.loanTerm * 12;
        
        return this.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
               (Math.pow(1 + monthlyRate, totalPayments) - 1);
    }

    /**
     * Calculate total interest without any extra payments
     */
    calculateTotalInterest() {
        const monthlyPayment = this.calculateMonthlyPayment();
        const totalPayments = this.loanTerm * 12;
        return (monthlyPayment * totalPayments) - this.loanAmount;
    }

    /**
     * Get service payments for a specific month
     */
    getServicePaymentsForMonth(paymentDate) {
        let monthlyServicePayments = 0;
        
        this.servicePayments.forEach(service => {
            // Check if service is still active this month
            const serviceFinishDate = service.finishDate ? new Date(service.finishDate) : null;
            const isServiceActive = !serviceFinishDate || paymentDate <= serviceFinishDate;
            
            if (isServiceActive) {
                monthlyServicePayments += parseFloat(service.monthlyCost);
            }
        });
        
        return monthlyServicePayments;
    }

    /**
     * Validate the mortgage simulation parameters
     */
    validate() {
        const errors = [];
        
        if (this.loanAmount <= 0) {
            errors.push('Loan amount must be greater than 0');
        }
        
        if (this.interestRate < 0) {
            errors.push('Interest rate cannot be negative');
        }
        
        if (this.loanTerm <= 0) {
            errors.push('Loan term must be greater than 0');
        }
        
        if (!this.startDate) {
            errors.push('Start date is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Create a copy of this mortgage simulation
     */
    clone() {
        return new MortgageSimulation(
            this.loanAmount,
            this.interestRate,
            this.loanTerm,
            this.startDate,
            [...this.servicePayments]
        );
    }

    /**
     * Convert to JSON object for storage
     */
    toJSON() {
        return {
            loanAmount: this.loanAmount,
            interestRate: this.interestRate,
            loanTerm: this.loanTerm,
            startDate: this.startDate,
            servicePayments: this.servicePayments
        };
    }

    /**
     * Create from JSON object
     */
    static fromJSON(data) {
        return new MortgageSimulation(
            data.loanAmount,
            data.interestRate,
            data.loanTerm,
            data.startDate,
            data.servicePayments || []
        );
    }
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
    window.MortgageSimulation = MortgageSimulation;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MortgageSimulation;
}
