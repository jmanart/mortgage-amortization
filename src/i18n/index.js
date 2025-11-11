// i18n utility functions
let currentLanguage = 'en';
let translations = {};
let isInitialized = false;

// Get base URL from script tag or current location
function getBaseUrl() {
  // Try to get base URL from the script tag that loaded this file
  const scripts = document.getElementsByTagName('script');
  for (let script of scripts) {
    if (script.src && script.src.includes('i18n/index.js')) {
      const url = new URL(script.src);
      return url.pathname.replace('/i18n/index.js', '');
    }
  }
  // Fallback: detect base URL from current path
  // If path starts with /mortgage-amortization, use that as base
  const path = window.location.pathname;
  if (path.startsWith('/mortgage-amortization')) {
    return '/mortgage-amortization';
  }
  return '';
}

// Load translations for a specific language
async function loadTranslations(lang) {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/i18n/${lang}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${lang}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading translations for ${lang}:`, error);
    // Fallback to English if the requested language fails
    if (lang !== 'en') {
      return await loadTranslations('en');
    }
    return {};
  }
}

// Initialize i18n system
async function initI18n(lang = 'en') {
  currentLanguage = lang;
  translations = await loadTranslations(lang);
  isInitialized = true;
  
  // Store language preference
  localStorage.setItem('mortgage-calculator-language', lang);
  
  // Update HTML lang attribute
  document.documentElement.lang = lang;
  
  // Trigger translation update
  updateTranslations();
}

// Get translation for a key
function t(key, params = {}) {
  if (!isInitialized) {
    console.warn(`Translation system not initialized yet for key "${key}"`);
    return key;
  }
  
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key "${key}" not found for language "${currentLanguage}"`);
      return key; // Return the key if translation not found
    }
  }
  
  if (typeof value !== 'string') {
    console.warn(`Translation key "${key}" is not a string for language "${currentLanguage}"`);
    return key;
  }
  
  // Replace parameters in the translation
  return value.replace(/\{(\w+)\}/g, (match, param) => {
    return params[param] !== undefined ? params[param] : match;
  });
}

// Update all translatable elements on the page
function updateTranslations() {
  // Update elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const params = JSON.parse(element.getAttribute('data-i18n-params') || '{}');
    
    if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email')) {
      element.placeholder = t(key, params);
    } else if (element.tagName === 'OPTION') {
      element.textContent = t(key, params);
    } else {
      element.textContent = t(key, params);
    }
  });
  
  // Update title and meta description
  document.title = t('app.title');
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', t('app.description'));
  }
}

// Change language
async function changeLanguage(lang) {
  if (lang === currentLanguage) return;
  
  await initI18n(lang);
}

// Get current language
function getCurrentLanguage() {
  return currentLanguage;
}

// Get available languages
function getAvailableLanguages() {
  return [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' }
  ];
}

// Initialize with saved language preference or default
async function initializeI18n() {
  const savedLanguage = localStorage.getItem('mortgage-calculator-language') || 'en';
  await initI18n(savedLanguage);
}

// Check if i18n system is ready
function isReady() {
  return isInitialized;
}

// Wait for i18n system to be ready
async function waitForReady() {
  while (!isInitialized) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

// Export functions for global use
window.i18n = {
  t,
  changeLanguage,
  getCurrentLanguage,
  getAvailableLanguages,
  initI18n,
  updateTranslations,
  isReady,
  waitForReady
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeI18n);
} else {
  initializeI18n();
}
