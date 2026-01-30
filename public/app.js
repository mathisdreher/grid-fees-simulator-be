// API base URL - will be updated for production
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Configuration data embedded directly - no API call needed
const optionsData = {
    dsos: ['Elia', 'Fluvius', 'Sibelga', 'Ores', 'Resa'],
    regions: ["Antwerpen", "Halle-Vilvoorde", "Kempen", "Limburg", "Midden-Vlaanderen", "West", "Zenne-Dijle", "Imewo"],
    voltage_levels: {
        "Elia": ["110-380 kV", "30-70 kV", "Transfo < 30 kV"],
        "Fluvius": ["26-36 kV", "1-26 kV"],
        "Sibelga": ["1-26 kV"],
        "Ores": ["MT"],
        "Resa": ["MT"]
    },
    connection_types: {
        "Elia": [],
        "Fluvius": ["Post", "Grid"],
        "Sibelga": ["Main", "Backup"],
        "Ores": ["Post", "Grid"],
        "Resa": ["Post", "Grid"]
    }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeOptions();
    setupEventListeners();
});

// Initialize options from embedded data
function initializeOptions() {
    // Populate DSO/TSO dropdown
    const dsoSelect = document.getElementById('dso_tso');
    optionsData.dsos.forEach(dso => {
        const option = document.createElement('option');
        option.value = dso;
        option.textContent = dso;
        dsoSelect.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById('calculator-form');
    const dsoSelect = document.getElementById('dso_tso');
    const voltageSelect = document.getElementById('voltage');
    
    form.addEventListener('submit', handleSubmit);
    dsoSelect.addEventListener('change', handleDSOChange);
    voltageSelect.addEventListener('change', handleVoltageChange);
}

// Handle DSO/TSO selection change
function handleDSOChange(e) {
    const dso = e.target.value;
    const regionGroup = document.getElementById('region-group');
    const regionSelect = document.getElementById('region');
    const voltageSelect = document.getElementById('voltage');
    const connectionGroup = document.getElementById('connection-group');
    const connectionSelect = document.getElementById('connection_type');

    // Clear dependent dropdowns
    voltageSelect.innerHTML = '<option value="">Select Voltage Level</option>';
    connectionSelect.innerHTML = '<option value="">Select Connection Type</option>';
    regionSelect.innerHTML = '<option value="">Select Region</option>';

    if (!dso) {
        regionGroup.style.display = 'none';
        connectionGroup.style.display = 'none';
        return;
    }

    // Show region selector only for Fluvius
    if (dso === 'Fluvius') {
        regionGroup.style.display = 'block';
        regionSelect.required = true;

        // Populate regions
        optionsData.regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });
    } else {
        regionGroup.style.display = 'none';
        regionSelect.required = false;
    }

    // Populate voltage levels
    if (optionsData.voltage_levels[dso]) {
        optionsData.voltage_levels[dso].forEach(voltage => {
            const option = document.createElement('option');
            option.value = voltage;
            option.textContent = voltage;
            voltageSelect.appendChild(option);
        });
    }
}

// Handle voltage level change
function handleVoltageChange(e) {
    const dso = document.getElementById('dso_tso').value;
    const connectionGroup = document.getElementById('connection-group');
    const connectionSelect = document.getElementById('connection_type');

    // Clear connection type dropdown
    connectionSelect.innerHTML = '<option value="">Select Connection Type</option>';

    if (!dso) {
        connectionGroup.style.display = 'none';
        connectionSelect.required = false;
        return;
    }

    // Check if this operator has connection types
    const hasConnectionTypes = optionsData.connection_types[dso] && optionsData.connection_types[dso].length > 0;

    if (hasConnectionTypes) {
        // Show connection type field and make it required
        connectionGroup.style.display = 'block';
        connectionSelect.required = true;

        // Populate connection types
        optionsData.connection_types[dso].forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            connectionSelect.appendChild(option);
        });
    } else {
        // Hide connection type field for operators that don't need it (like Elia)
        connectionGroup.style.display = 'none';
        connectionSelect.required = false;
        connectionSelect.value = ''; // Clear value
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = {
        dso_tso: document.getElementById('dso_tso').value,
        region: document.getElementById('region').value,
        voltage: document.getElementById('voltage').value,
        connection_type: document.getElementById('connection_type').value,
        offtake_energy: parseFloat(document.getElementById('offtake_energy').value) || 0,
        injection_energy: parseFloat(document.getElementById('injection_energy').value) || 0,
        peak_monthly: parseFloat(document.getElementById('peak_monthly').value) || 0,
        peak_yearly: parseFloat(document.getElementById('peak_yearly').value) || 0,
        contracted_capacity: parseFloat(document.getElementById('contracted_capacity').value) || 0,
        is_bess: document.getElementById('is_bess').checked
    };
    
    // Show loading
    document.getElementById('loading').classList.add('show');
    document.getElementById('error').classList.remove('show');
    document.getElementById('results').classList.remove('show');
    
    try {
        const response = await fetch(`${API_BASE}/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.error) {
            showError(result.error);
        } else {
            // Store result globally for enhancements
            window.lastCalculationResult = result;
            window.lastCalculationParams = formData;
            displayResults(result, formData);
        }
    } catch (error) {
        console.error('Calculation error:', error);
        showError('Failed to calculate fees. Please try again.');
    } finally {
        document.getElementById('loading').classList.remove('show');
    }
}

// Display calculation results
function displayResults(result, params) {
    // Update totals
    document.getElementById('total-amount').textContent = formatCurrency(result.total);
    document.getElementById('injection-total').textContent = formatCurrency(result.total_injection);
    document.getElementById('offtake-total').textContent = formatCurrency(result.total_offtake);
    
    // Build breakdown table
    const tbody = document.getElementById('breakdown-body');
    tbody.innerHTML = '';
    
    Object.entries(result.breakdown).forEach(([feeName, feeData]) => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.className = 'fee-name';
        nameCell.textContent = formatFeeName(feeName);
        
        const rateCell = document.createElement('td');
        rateCell.textContent = formatRate(feeData.rate, feeName);
        
        const quantityCell = document.createElement('td');
        quantityCell.textContent = formatQuantity(feeData.quantity, feeName);

        const amountCell = document.createElement('td');
        amountCell.className = 'fee-amount';
        amountCell.textContent = formatCurrency(feeData.total);

        row.appendChild(nameCell);
        row.appendChild(rateCell);
        row.appendChild(quantityCell);
        row.appendChild(amountCell);
        
        tbody.appendChild(row);
    });
    
    // Show results
    document.getElementById('results').classList.add('show');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Insights generation removed per user request

    // Make breakdown rows clickable for drill-down
    if (typeof makeBreakdownClickable === 'function') {
        setTimeout(makeBreakdownClickable, 100);
    }

    // Auto-run savings comparison with other DSOs
    if (typeof runSavingsComparison === 'function') {
        runSavingsComparison();
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-BE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value * 1000); // Convert k€ to €
}

// Format fee name for display
function formatFeeName(name) {
    return name.replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Format rate based on fee type
function formatRate(rate, feeName) {
    if (feeName.includes('Fixed')) {
        return `€${(rate * 1000).toFixed(2)}/year`;
    } else if (feeName.includes('Contracted')) {
        return `€${(rate * 1000).toFixed(2)}/MVA/year`;
    } else if (feeName.includes('Peak')) {
        return `€${(rate * 1000).toFixed(2)}/MW/year`;
    } else if (feeName.includes('Volumetric') || feeName.includes('Other')) {
        return `€${(rate * 1000).toFixed(3)}/MWh`;
    }
    return `€${(rate * 1000).toFixed(2)}`;
}

// Format quantity based on fee type
function formatQuantity(quantity, feeName) {
    if (feeName.includes('Fixed')) {
        return '1 year';
    } else if (feeName.includes('Contracted')) {
        return `${quantity.toFixed(2)} MVA`;
    } else if (feeName.includes('Peak')) {
        return `${quantity.toFixed(2)} MW`;
    } else if (feeName.includes('Volumetric') || feeName.includes('Other')) {
        return `${quantity.toFixed(2)} MWh`;
    }
    return quantity.toFixed(2);
}
