// Internationalization (i18n) for Belgian Grid Fees Calculator
// Supports: English (EN), French (FR), Dutch (NL)

const translations = {
    en: {
        // Header
        title: "Belgian Grid Fees Calculator",
        subtitle: "Calculate network tariffs for Belgium 2026",

        // BESS Calculator
        bessCalculatorTitle: "BESS Energy Calculator",
        bessCalculatorSubtitle: "Calculate offtake & injection from BESS parameters",
        bessPower: "BESS Power (MW)",
        bessDuration: "Duration (hours)",
        bessCycles: "Cycles per Day",
        bessEfficiency: "Round-Trip Efficiency (%)",
        calculatedValues: "Calculated Energy Values:",
        dischargeEnergy: "Discharge Energy:",
        offtakeCharging: "Offtake (Charging):",
        injectionDischarging: "Injection (Discharging):",
        energyLosses: "Energy Losses:",
        oneWayEfficiency: "One-Way Efficiency:",
        autoFilledNotice: "These values have been automatically filled in the form below",

        // Main Form
        dsoTsoLabel: "DSO/TSO",
        selectDsoTso: "Select DSO/TSO",
        regionLabel: "Region",
        selectRegion: "Select Region",
        voltageLabel: "Voltage Level",
        selectVoltage: "Select Voltage Level",
        connectionLabel: "Connection Type",
        selectConnection: "Select Connection Type",
        offtakeEnergyLabel: "Annual Offtake (MWh/year)",
        injectionEnergyLabel: "Annual Injection (MWh/year)",
        peakMonthlyLabel: "Monthly Peak Demand (MW)",
        peakYearlyLabel: "Annual Peak Demand (MW)",
        contractedCapacityLabel: "Contracted Capacity (MVA)",
        bessCheckbox: "Battery Energy Storage System (BESS) - Grid Fees Exempted",
        calculateButton: "Calculate Grid Fees",
        calculating: "Calculating...",

        // Results
        totalAnnualFees: "Total Annual Grid Fees (excl. VAT)",
        injectionFees: "Injection Fees",
        offtakeFees: "Offtake Fees",
        feeBreakdown: "Fee Breakdown",
        feeComponent: "Fee Component",
        rate: "Rate",
        quantity: "Quantity",
        multiplier: "Multiplier",
        amount: "Amount",

        // Action Buttons
        saveForComparison: "Save for Comparison",
        exportToCsv: "Export to CSV",
        printResults: "Print Results",

        // Insights
        bessExemptionsActive: "BESS Exemptions Active",
        bessExemptionsSavings: "You're benefiting from BESS grid fee exemptions. Estimated savings compared to standard tariffs.",
        highCostWarning: "High Cost Per MWh",
        highCostMessage: "Your grid fees are €{cost}/MWh. Consider optimizing peak demand to reduce costs.",
        peakDemandTitle: "Peak Demand Represents {percentage}% of Costs",
        peakDemandMessage: "Reducing peak demand could significantly lower your grid fees. Consider load shifting or demand response strategies.",
        highInjectionTitle: "High Injection Ratio",
        highInjectionMessage: "Your injection is {percentage}% of offtake. Make sure you're benefiting from available exemptions.",
        largestComponentTitle: "{component} is Your Largest Cost ({percentage}%)",
        largestComponentMessage: "This component costs €{amount}/year.",

        // Comparison
        scenarioComparison: "Scenario Comparison",
        clearAll: "Clear All",
        bestOption: "Best Option: {name}",
        bestOptionSavings: "Saves €{amount}/year compared to {other}",
        scenario: "Scenario",
        bess: "BESS",
        totalCost: "Total Cost",
        offtake: "Offtake",
        injection: "Injection",
        action: "Action",
        remove: "Remove",
        noScenarios: "No scenarios saved yet. Click \"Save for Comparison\" after calculating.",

        // Footer
        createdBy: "Created by",
        disclaimer: "For informational purposes only. Always verify calculations with official DSO/TSO documentation.",

        // Units
        mwhYear: "MWh/year",
        mw: "MW",
        mva: "MVA",
        percent: "%",
        year: "year",

        // Savings Comparison
        savingsComparisonTitle: "Savings Comparison with Other DSOs",
        savingsComparisonSubtitle: "Same usage parameters applied across all Belgian DSOs and voltage levels",
        savingsLoading: "Comparing all DSOs...",
        savingsNoData: "No comparison data available",
        savingsYourCurrent: "Your Current Cost",
        savingsCheapest: "Cheapest Option",
        savingsPotential: "Potential Savings",
        savingsBySwitching: "by switching to {dso}",
        savingsYou: "YOU",
        savingsBest: "BEST",

        // Errors
        errorCalculation: "Failed to calculate fees. Please try again.",
        errorNoConfig: "No matching fee configuration found"
    },

    fr: {
        // Header
        title: "Calculateur de Frais de Réseau Belge",
        subtitle: "Calculer les tarifs de réseau pour la Belgique 2026",

        // BESS Calculator
        bessCalculatorTitle: "Calculateur d'Énergie BESS",
        bessCalculatorSubtitle: "Calculer le prélèvement et l'injection à partir des paramètres BESS",
        bessPower: "Puissance BESS (MW)",
        bessDuration: "Durée (heures)",
        bessCycles: "Cycles par jour",
        bessEfficiency: "Rendement aller-retour (%)",
        calculatedValues: "Valeurs d'énergie calculées :",
        dischargeEnergy: "Énergie de décharge :",
        offtakeCharging: "Prélèvement (Charge) :",
        injectionDischarging: "Injection (Décharge) :",
        energyLosses: "Pertes d'énergie :",
        oneWayEfficiency: "Rendement unidirectionnel :",
        autoFilledNotice: "Ces valeurs ont été automatiquement remplies dans le formulaire ci-dessous",

        // Main Form
        dsoTsoLabel: "GRD/GRT",
        selectDsoTso: "Sélectionner GRD/GRT",
        regionLabel: "Région",
        selectRegion: "Sélectionner la région",
        voltageLabel: "Niveau de tension",
        selectVoltage: "Sélectionner le niveau de tension",
        connectionLabel: "Type de raccordement",
        selectConnection: "Sélectionner le type de raccordement",
        offtakeEnergyLabel: "Prélèvement annuel (MWh/an)",
        injectionEnergyLabel: "Injection annuelle (MWh/an)",
        peakMonthlyLabel: "Puissance de pointe mensuelle (MW)",
        peakYearlyLabel: "Puissance de pointe annuelle (MW)",
        contractedCapacityLabel: "Capacité contractée (MVA)",
        bessCheckbox: "Système de stockage d'énergie par batterie (BESS) - Frais de réseau exemptés",
        calculateButton: "Calculer les frais de réseau",
        calculating: "Calcul en cours...",

        // Results
        totalAnnualFees: "Frais de réseau annuels totaux (hors TVA)",
        injectionFees: "Frais d'injection",
        offtakeFees: "Frais de prélèvement",
        feeBreakdown: "Détail des frais",
        feeComponent: "Composant de frais",
        rate: "Tarif",
        quantity: "Quantité",
        multiplier: "Multiplicateur",
        amount: "Montant",

        // Action Buttons
        saveForComparison: "Enregistrer pour comparaison",
        exportToCsv: "Exporter en CSV",
        printResults: "Imprimer les résultats",

        // Insights
        bessExemptionsActive: "Exemptions BESS actives",
        bessExemptionsSavings: "Vous bénéficiez des exemptions de frais de réseau BESS. Économies estimées par rapport aux tarifs standard.",
        highCostWarning: "Coût élevé par MWh",
        highCostMessage: "Vos frais de réseau sont de {cost}€/MWh. Envisagez d'optimiser la demande de pointe pour réduire les coûts.",
        peakDemandTitle: "La demande de pointe représente {percentage}% des coûts",
        peakDemandMessage: "Réduire la demande de pointe pourrait réduire considérablement vos frais de réseau. Envisagez le déplacement de charge ou les stratégies de réponse à la demande.",
        highInjectionTitle: "Ratio d'injection élevé",
        highInjectionMessage: "Votre injection représente {percentage}% du prélèvement. Assurez-vous de bénéficier des exemptions disponibles.",
        largestComponentTitle: "{component} est votre plus grand coût ({percentage}%)",
        largestComponentMessage: "Ce composant coûte {amount}€/an.",

        // Comparison
        scenarioComparison: "Comparaison de scénarios",
        clearAll: "Tout effacer",
        bestOption: "Meilleure option : {name}",
        bestOptionSavings: "Économise {amount}€/an par rapport à {other}",
        scenario: "Scénario",
        bess: "BESS",
        totalCost: "Coût total",
        offtake: "Prélèvement",
        injection: "Injection",
        action: "Action",
        remove: "Supprimer",
        noScenarios: "Aucun scénario enregistré. Cliquez sur \"Enregistrer pour comparaison\" après le calcul.",

        // Footer
        createdBy: "Créé par",
        disclaimer: "À titre indicatif uniquement. Vérifiez toujours les calculs avec la documentation officielle GRD/GRT.",

        // Units
        mwhYear: "MWh/an",
        mw: "MW",
        mva: "MVA",
        percent: "%",
        year: "an",

        // Savings Comparison
        savingsComparisonTitle: "Comparaison des économies avec d'autres GRD",
        savingsComparisonSubtitle: "Mêmes paramètres d'utilisation appliqués à tous les GRD et niveaux de tension belges",
        savingsLoading: "Comparaison de tous les GRD...",
        savingsNoData: "Aucune donnée de comparaison disponible",
        savingsYourCurrent: "Votre coût actuel",
        savingsCheapest: "Option la moins chère",
        savingsPotential: "Économies potentielles",
        savingsBySwitching: "en passant à {dso}",
        savingsYou: "VOUS",
        savingsBest: "MEILLEUR",

        // Errors
        errorCalculation: "Échec du calcul des frais. Veuillez réessayer.",
        errorNoConfig: "Aucune configuration de frais correspondante trouvée"
    },

    nl: {
        // Header
        title: "Belgische Netkosten Calculator",
        subtitle: "Bereken nettarieven voor België 2026",

        // BESS Calculator
        bessCalculatorTitle: "BESS Energie Calculator",
        bessCalculatorSubtitle: "Bereken afname en injectie vanuit BESS parameters",
        bessPower: "BESS Vermogen (MW)",
        bessDuration: "Duur (uren)",
        bessCycles: "Cycli per dag",
        bessEfficiency: "Roundtrip rendement (%)",
        calculatedValues: "Berekende energiewaarden:",
        dischargeEnergy: "Ontlaadenergie:",
        offtakeCharging: "Afname (Opladen):",
        injectionDischarging: "Injectie (Ontladen):",
        energyLosses: "Energieverliezen:",
        oneWayEfficiency: "Eenrichtingsrendement:",
        autoFilledNotice: "Deze waarden zijn automatisch ingevuld in onderstaand formulier",

        // Main Form
        dsoTsoLabel: "DNB/TNB",
        selectDsoTso: "Selecteer DNB/TNB",
        regionLabel: "Regio",
        selectRegion: "Selecteer regio",
        voltageLabel: "Spanningsniveau",
        selectVoltage: "Selecteer spanningsniveau",
        connectionLabel: "Aansluitingstype",
        selectConnection: "Selecteer aansluitingstype",
        offtakeEnergyLabel: "Jaarlijkse afname (MWh/jaar)",
        injectionEnergyLabel: "Jaarlijkse injectie (MWh/jaar)",
        peakMonthlyLabel: "Maandelijks piekvermogen (MW)",
        peakYearlyLabel: "Jaarlijks piekvermogen (MW)",
        contractedCapacityLabel: "Gecontracteerd vermogen (MVA)",
        bessCheckbox: "Batterij Energie Opslag Systeem (BESS) - Netwerkkosten vrijgesteld",
        calculateButton: "Bereken netwerkkosten",
        calculating: "Berekenen...",

        // Results
        totalAnnualFees: "Totale jaarlijkse netwerkkosten (excl. BTW)",
        injectionFees: "Injectiekosten",
        offtakeFees: "Afnamekosten",
        feeBreakdown: "Kostenspecificatie",
        feeComponent: "Kostencomponent",
        rate: "Tarief",
        quantity: "Hoeveelheid",
        multiplier: "Vermenigvuldiger",
        amount: "Bedrag",

        // Action Buttons
        saveForComparison: "Opslaan voor vergelijking",
        exportToCsv: "Exporteren naar CSV",
        printResults: "Resultaten afdrukken",

        // Insights
        bessExemptionsActive: "BESS vrijstellingen actief",
        bessExemptionsSavings: "U profiteert van BESS netwerkkosten vrijstellingen. Geschatte besparingen ten opzichte van standaardtarieven.",
        highCostWarning: "Hoge kosten per MWh",
        highCostMessage: "Uw netwerkkosten zijn €{cost}/MWh. Overweeg piekvermogen te optimaliseren om kosten te verlagen.",
        peakDemandTitle: "Piekafname vertegenwoordigt {percentage}% van de kosten",
        peakDemandMessage: "Het verminderen van piekvermogen kan uw netwerkkosten aanzienlijk verlagen. Overweeg lastverschuiving of vraagresponsstrategieën.",
        highInjectionTitle: "Hoge injectieverhouding",
        highInjectionMessage: "Uw injectie is {percentage}% van de afname. Zorg ervoor dat u profiteert van beschikbare vrijstellingen.",
        largestComponentTitle: "{component} is uw grootste kostenpost ({percentage}%)",
        largestComponentMessage: "Deze component kost €{amount}/jaar.",

        // Comparison
        scenarioComparison: "Scenariovergelijking",
        clearAll: "Alles wissen",
        bestOption: "Beste optie: {name}",
        bestOptionSavings: "Bespaart €{amount}/jaar ten opzichte van {other}",
        scenario: "Scenario",
        bess: "BESS",
        totalCost: "Totale kosten",
        offtake: "Afname",
        injection: "Injectie",
        action: "Actie",
        remove: "Verwijderen",
        noScenarios: "Nog geen scenario's opgeslagen. Klik op \"Opslaan voor vergelijking\" na het berekenen.",

        // Footer
        createdBy: "Gemaakt door",
        disclaimer: "Alleen ter informatie. Controleer berekeningen altijd met officiële DNB/TNB documentatie.",

        // Units
        mwhYear: "MWh/jaar",
        mw: "MW",
        mva: "MVA",
        percent: "%",
        year: "jaar",

        // Savings Comparison
        savingsComparisonTitle: "Besparingsvergelijking met andere DNB's",
        savingsComparisonSubtitle: "Dezelfde gebruiksparameters toegepast op alle Belgische DNB's en spanningsniveaus",
        savingsLoading: "Alle DNB's vergelijken...",
        savingsNoData: "Geen vergelijkingsgegevens beschikbaar",
        savingsYourCurrent: "Uw huidige kosten",
        savingsCheapest: "Goedkoopste optie",
        savingsPotential: "Potentiële besparing",
        savingsBySwitching: "door over te stappen naar {dso}",
        savingsYou: "U",
        savingsBest: "BEST",

        // Errors
        errorCalculation: "Berekening van kosten mislukt. Probeer het opnieuw.",
        errorNoConfig: "Geen overeenkomende kostenconfiguratie gevonden"
    }
};

// Current language
let currentLanguage = 'en';

// Initialize language from localStorage or browser
function initLanguage() {
    const savedLang = localStorage.getItem('gridFeesLanguage');
    const browserLang = navigator.language.substring(0, 2);

    if (savedLang && translations[savedLang]) {
        currentLanguage = savedLang;
    } else if (translations[browserLang]) {
        currentLanguage = browserLang;
    } else {
        currentLanguage = 'en';
    }

    updateLanguageSelector();
    updateAllText();
}

// Get translation
function t(key, replacements = {}) {
    let text = translations[currentLanguage][key] || translations['en'][key] || key;

    // Replace placeholders
    Object.keys(replacements).forEach(placeholder => {
        text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    });

    return text;
}

// Change language
function changeLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('gridFeesLanguage', lang);
        updateLanguageSelector();
        updateAllText();
    }
}

// Update language selector
function updateLanguageSelector() {
    const selector = document.getElementById('language-selector');
    if (selector) {
        selector.value = currentLanguage;
    }
}

// Update all text in the page
function updateAllText() {
    // Header
    updateElementText('page-title', t('title'));
    updateElementText('page-subtitle', t('subtitle'));

    // BESS Calculator
    updateElementText('bess-calc-title', t('bessCalculatorTitle'));
    updateElementText('bess-calc-subtitle', t('bessCalculatorSubtitle'));
    updateLabelText('bess_power', t('bessPower'));
    updateLabelText('bess_duration', t('bessDuration'));
    updateLabelText('bess_cycles', t('bessCycles'));
    updateLabelText('bess_efficiency', t('bessEfficiency'));
    updateElementText('bess-calc-values-title', t('calculatedValues'));
    updateElementText('bess-discharge-label', t('dischargeEnergy'));
    updateElementText('bess-offtake-label', t('offtakeCharging'));
    updateElementText('bess-injection-label', t('injectionDischarging'));
    updateElementText('bess-losses-label', t('energyLosses'));
    updateElementText('bess-efficiency-label', t('oneWayEfficiency'));
    updateElementText('bess-autofill-notice', `ℹ️ ${t('autoFilledNotice')}`);

    // Main Form
    updateLabelText('dso_tso', t('dsoTsoLabel') + ' *');
    updateLabelText('region', t('regionLabel') + ' *');
    updateLabelText('voltage', t('voltageLabel') + ' *');
    updateLabelText('connection_type', t('connectionLabel') + ' *');
    updateLabelText('offtake_energy', t('offtakeEnergyLabel'));
    updateLabelText('injection_energy', t('injectionEnergyLabel'));
    updateLabelText('peak_monthly', t('peakMonthlyLabel'));
    updateLabelText('peak_yearly', t('peakYearlyLabel'));
    updateLabelText('contracted_capacity', t('contractedCapacityLabel'));
    updateCheckboxLabelText('is_bess', t('bessCheckbox'));
    updateButtonText('calculate-btn', t('calculateButton'));

    // Update select placeholders
    updateSelectOption('dso_tso', '', t('selectDsoTso'));
    updateSelectOption('region', '', t('selectRegion'));
    updateSelectOption('voltage', '', t('selectVoltage'));
    updateSelectOption('connection_type', '', t('selectConnection'));

    // Results
    updateElementText('results-title', t('totalAnnualFees'));
    updateElementText('injection-fees-label', t('injectionFees'));
    updateElementText('offtake-fees-label', t('offtakeFees'));
    updateElementText('breakdown-title', t('feeBreakdown'));

    // Action Buttons
    updateButtonText('save-scenario-btn', `💾 ${t('saveForComparison')}`);
    updateButtonText('export-csv-btn', `📊 ${t('exportToCsv')}`);
    updateButtonText('print-btn', `🖨️ ${t('printResults')}`);

    // Comparison
    updateElementText('comparison-title', t('scenarioComparison'));
    updateButtonText('clear-comparison-btn', t('clearAll'));

    // Savings Comparison
    updateElementText('savings-comparison-title', t('savingsComparisonTitle'));
    updateElementText('savings-comparison-subtitle', t('savingsComparisonSubtitle'));

    // Footer
    updateElementText('footer-disclaimer', t('disclaimer'));
}

// Helper functions
function updateElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function updateLabelText(inputId, text) {
    const input = document.getElementById(inputId);
    if (input) {
        const label = document.querySelector(`label[for="${inputId}"]`);
        if (label) label.textContent = text;
    }
}

function updateCheckboxLabelText(inputId, text) {
    const checkbox = document.getElementById(inputId);
    if (checkbox) {
        const label = checkbox.nextElementSibling;
        if (label && label.tagName === 'LABEL') {
            label.textContent = text;
        }
    }
}

function updateButtonText(id, text) {
    const btn = document.getElementById(id);
    if (btn) btn.innerHTML = text;
}

function updateSelectOption(selectId, optionValue, text) {
    const select = document.getElementById(selectId);
    if (select) {
        const option = Array.from(select.options).find(opt => opt.value === optionValue);
        if (option) option.textContent = text;
    }
}

// Export functions
window.t = t;
window.changeLanguage = changeLanguage;
window.currentLanguage = () => currentLanguage;

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
} else {
    initLanguage();
}
