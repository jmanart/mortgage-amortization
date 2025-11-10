// Global type declarations for the mortgage calculator application

declare global {
  interface Window {
    // Toast notification functions
    showToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', duration?: number) => void;
    hideToast: (toastId: string) => void;
    
    // i18n system
    i18n: {
      getCurrentLanguage: () => string;
      changeLanguage: (lang: string) => void;
      waitForReady?: () => Promise<void>;
      updateTranslations?: () => void;
    };
    
    // Simulation classes
    MortgageSimulation: any;
    AmortizationSimulation: any;
    
    // Global arrays for payments
    servicePayments: any[];
    amortizationPayments: any[];
    periodicPayments: any[];
    
    // Global functions
    markSimulationAsLoaded: () => void;
    markSimulationAsChanged: () => void;
    getServicePaymentsFromUI: () => any[];
    updateAmortizationPaymentsDisplay: () => void;
    updatePeriodicPaymentsDisplay: () => void;
    updateServicePaymentsDisplay: () => void;
    calculateAndDisplay: () => void;
    saveSimulation: (name: string) => void;
    loadSimulation: (name: string) => void;
    deleteSimulation: (name: string) => void;
    getSavedSimulations: () => any[];
  }
}

export {};
