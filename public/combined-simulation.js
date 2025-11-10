/**
 * CombinedSimulation class
 * Combines a MortgageSimulation with an AmortizationSimulation for complete mortgage analysis
 */
class CombinedSimulation {
    constructor(mortgageSimulation, amortizationSimulation) {
        this.mortgageSimulation = mortgageSimulation;
        this.amortizationSimulation = amortizationSimulation;
    }

    /**
     * Calculate the complete amortization schedule
     */
    calculateAmortizationSchedule() {
        const mortgage = this.mortgageSimulation;
        const amortization = this.amortizationSimulation;
        
        const monthlyRate = mortgage.interestRate / 100 / 12;
        const totalPayments = mortgage.loanTerm * 12;
        const monthlyPayment = mortgage.calculateMonthlyPayment();
        
        const schedule = [];
        let balance = mortgage.loanAmount;
        let totalInterest = 0;
        let totalAmortizationPaid = 0;
        let totalPenaltyPaid = 0;
        let totalServicePayments = 0;
        let totalPaymentsMade = 0;
        
        for (let i = 0; i < totalPayments; i++) {
            // Calculate payment date
            const paymentDate = new Date(mortgage.startDate);
            paymentDate.setMonth(paymentDate.getMonth() + i);
            
            // Check for one-off amortization payment this month
            const oneOffPayment = amortization.getOneOffPaymentsForMonth(paymentDate, new Date(mortgage.startDate));
            
            // Check for periodic payment this month
            const periodicPayment = amortization.getPeriodicPaymentsForPeriod(i + 1);
            
            // Calculate regular payment components
            const interestPayment = balance * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;
            
            // Apply one-off amortization payment if it exists this month
            let amortizationAmount = 0;
            let penaltyAmount = 0;
            let effectivePrincipalPayment = principalPayment;
            
            if (oneOffPayment) {
                amortizationAmount = oneOffPayment.amount;
                penaltyAmount = amortizationAmount * (oneOffPayment.penalty / 100);
                effectivePrincipalPayment = principalPayment + amortizationAmount;
                totalAmortizationPaid += amortizationAmount;
                totalPenaltyPaid += penaltyAmount;
            }
            
            // Apply periodic payment if it exists this month
            let periodicAmount = 0;
            let periodicPenaltyAmount = 0;
            
            if (periodicPayment) {
                periodicAmount = periodicPayment.amount;
                periodicPenaltyAmount = periodicAmount * (periodicPayment.penalty / 100);
                effectivePrincipalPayment += periodicAmount;
                totalAmortizationPaid += periodicAmount;
                totalPenaltyPaid += periodicPenaltyAmount;
            }
            
            // Calculate service payments for this month
            const monthlyServicePayments = mortgage.getServicePaymentsForMonth(paymentDate);
            totalServicePayments += monthlyServicePayments;
            
            // Update balance
            balance = Math.max(0, balance - effectivePrincipalPayment);
            totalInterest += interestPayment;
            
            // Calculate total payment for this month
            const monthlyTotalPayment = monthlyPayment + amortizationAmount + penaltyAmount + 
                                      periodicAmount + periodicPenaltyAmount + monthlyServicePayments;
            totalPaymentsMade += monthlyTotalPayment;
            
            // Add to schedule
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
                isAmortizationMonth: !!oneOffPayment,
                isPeriodicPaymentMonth: !!periodicPayment
            });
            
            // If balance is paid off early, stop the schedule
            if (balance <= 0) {
                break;
            }
        }
        
        return {
            schedule: schedule,
            monthlyPayment: monthlyPayment,
            totalInterest: totalInterest,
            totalPayments: schedule.length,
            totalAmortizationPaid: totalAmortizationPaid,
            totalPenaltyPaid: totalPenaltyPaid,
            totalServicePayments: totalServicePayments,
            totalPaymentsMade: totalPaymentsMade
        };
    }

    /**
     * Calculate interest savings compared to no amortization
     */
    calculateInterestSavings() {
        const totalInterestWithoutAmortization = this.mortgageSimulation.calculateTotalInterest();
        const scheduleData = this.calculateAmortizationSchedule();
        return totalInterestWithoutAmortization - scheduleData.totalInterest;
    }

    /**
     * Validate the combined simulation
     */
    validate() {
        const mortgageValidation = this.mortgageSimulation.validate();
        const amortizationValidation = this.amortizationSimulation.validate();
        
        return {
            isValid: mortgageValidation.isValid && amortizationValidation.isValid,
            errors: [...mortgageValidation.errors, ...amortizationValidation.errors]
        };
    }

    /**
     * Create a copy of this combined simulation
     */
    clone() {
        return new CombinedSimulation(
            this.mortgageSimulation.clone(),
            this.amortizationSimulation.clone()
        );
    }

    /**
     * Convert to JSON object for storage
     */
    toJSON() {
        return {
            mortgageSimulation: this.mortgageSimulation.toJSON(),
            amortizationSimulation: this.amortizationSimulation.toJSON()
        };
    }

    /**
     * Create from JSON object
     */
    static fromJSON(data) {
        return new CombinedSimulation(
            MortgageSimulation.fromJSON(data.mortgageSimulation),
            AmortizationSimulation.fromJSON(data.amortizationSimulation)
        );
    }
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
    window.CombinedSimulation = CombinedSimulation;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombinedSimulation;
}
