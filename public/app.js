// API base URL - will be updated for production
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

let optionsData = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    await loadOptions();
    setupEventListeners();
});

// Load available options from API
async function loadOptions() {
    try {
        const response = await fetch(`${API_BASE}/options`);
        optionsData = await response.json();
        
        // Populate DSO/TSO dropdown
        const dsoSelect = document.getElementById('dso_tso');
        optionsData.dsos.forEach(dso => {
            const option = document.createElement('option');
            option.value = dso;
            option.textContent = dso;
            dsoSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading options:', error);
        showError('Failed to load configuration options. Please refresh the page.');
    }
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
    const connectionSelect = document.getElementById('connection_type');
    
    // Clear dependent dropdowns
    voltageSelect.innerHTML = '<option value="">Select Voltage Level</option>';
    connectionSelect.innerHTML = '<option value="">Select Connection Type</option>';
    regionSelect.innerHTML = '<option value="">Select Region</option>';
    
    if (!dso) {
        regionGroup.style.display = 'none';
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
    const connectionSelect = document.getElementById('connection_type');
    
    // Clear connection type dropdown
    connectionSelect.innerHTML = '<option value="">Select Connection Type</option>';
    
    if (!dso) return;
    
    // Populate connection types
    if (optionsData.connection_types[dso]) {
        optionsData.connection_types[dso].forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            connectionSelect.appendChild(option);
        });
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
            displayResults(result);
        }
    } catch (error) {
        console.error('Calculation error:', error);
        showError('Failed to calculate fees. Please try again.');
    } finally {
        document.getElementById('loading').classList.remove('show');
    }
}

// Display calculation results
function displayResults(result) {
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
        
        const multiplierCell = document.createElement('td');
        multiplierCell.textContent = feeData.multiplier.toFixed(2);
        if (feeData.multiplier < 1) {
            const badge = document.createElement('span');
            badge.className = 'info-badge';
            badge.textContent = 'BESS';
            multiplierCell.appendChild(badge);
        }
        
        const amountCell = document.createElement('td');
        amountCell.className = 'fee-amount';
        amountCell.textContent = formatCurrency(feeData.total);
        
        row.appendChild(nameCell);
        row.appendChild(rateCell);
        row.appendChild(quantityCell);
        row.appendChild(multiplierCell);
        row.appendChild(amountCell);
        
        tbody.appendChild(row);
    });
    
    // Show results
    document.getElementById('results').classList.add('show');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
