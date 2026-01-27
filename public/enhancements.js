// Enhanced features for Belgian Grid Fees Calculator

// BESS Energy Calculator
function initBESSCalculator() {
    const bessToggle = document.getElementById('bess-calculator-toggle');
    const bessPanel = document.getElementById('bess-calculator-panel');

    if (bessToggle && bessPanel) {
        bessToggle.addEventListener('click', () => {
            bessPanel.classList.toggle('show');
            const icon = bessToggle.querySelector('.toggle-icon');
            if (icon) {
                icon.textContent = bessPanel.classList.contains('show') ? '▼' : '▶';
            }
        });
    }

    // Calculate BESS energy values
    const bessForm = document.getElementById('bess-form');
    if (bessForm) {
        bessForm.addEventListener('input', calculateBESSEnergy);
    }
}

function calculateBESSEnergy() {
    const power = parseFloat(document.getElementById('bess_power').value) || 0;
    const duration = parseFloat(document.getElementById('bess_duration').value) || 0;
    const cycles = parseFloat(document.getElementById('bess_cycles').value) || 0;
    const efficiency = parseFloat(document.getElementById('bess_efficiency').value) || 0;

    if (power > 0 && duration > 0 && cycles > 0 && efficiency > 0) {
        const translate = typeof window.t === 'function' ? window.t : (key) => key;

        // Calculate derived values
        const discharge = power * duration * cycles * 365;
        const oneWayEff = Math.sqrt(efficiency / 100);
        const offtake = discharge / oneWayEff;
        const injection = discharge * oneWayEff;
        const losses = offtake - injection;

        // Display results
        document.getElementById('bess_discharge').textContent = discharge.toFixed(1);
        document.getElementById('bess_offtake').textContent = offtake.toFixed(1);
        document.getElementById('bess_injection').textContent = injection.toFixed(1);
        document.getElementById('bess_losses').textContent = losses.toFixed(1);
        document.getElementById('bess_efficiency_oneway').textContent = (oneWayEff * 100).toFixed(2);

        // Update units
        const unitElements = document.querySelectorAll('.unit-mwh-year');
        unitElements.forEach(el => el.textContent = translate('mwhYear'));
        const unitPercent = document.querySelectorAll('.unit-percent');
        unitPercent.forEach(el => el.textContent = translate('percent'));

        // Auto-fill main form
        document.getElementById('offtake_energy').value = offtake.toFixed(2);
        document.getElementById('injection_energy').value = injection.toFixed(2);
        document.getElementById('peak_monthly').value = power.toFixed(2);
        document.getElementById('peak_yearly').value = power.toFixed(2);
        document.getElementById('contracted_capacity').value = power.toFixed(2);
        document.getElementById('is_bess').checked = true;

        document.getElementById('bess_results').classList.add('show');
    } else {
        document.getElementById('bess_results').classList.remove('show');
    }
}

// Cost Breakdown Chart
function createBreakdownChart(breakdown) {
    const canvas = document.getElementById('breakdown-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = 400;
    const height = canvas.height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate total and percentages
    const total = Object.values(breakdown).reduce((sum, fee) => sum + fee.total, 0);
    if (total === 0) return;

    const data = Object.entries(breakdown)
        .filter(([_, fee]) => fee.total > 0)
        .map(([name, fee]) => ({
            name: name,
            value: fee.total,
            percentage: (fee.total / total * 100).toFixed(1)
        }))
        .sort((a, b) => b.value - a.value);

    // Colors
    const colors = [
        '#DC143C', '#8B0000', '#FF6B6B', '#C92A2A',
        '#FA5252', '#FF8787', '#E03131', '#C0392B'
    ];

    // Draw pie chart
    let currentAngle = -Math.PI / 2;

    data.forEach((item, i) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;

        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        // Draw border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        currentAngle += sliceAngle;
    });

    // Draw legend
    const legendX = width + 20;
    const legendY = 50;
    const legendSpacing = 30;

    data.forEach((item, i) => {
        // Color box
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(legendX, legendY + i * legendSpacing, 20, 20);

        // Text
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`${item.name}: ${item.percentage}%`, legendX + 30, legendY + i * legendSpacing + 15);
    });
}

// Insights and Recommendations function removed per user request

// DSO Comparison Feature
async function compareDSOs() {
    const dsoComparisonSection = document.getElementById('dso-comparison-section');
    const summaryDiv = document.getElementById('dso-comparison-summary');
    const detailsDiv = document.getElementById('dso-comparison-details');

    // Get current form parameters
    const baseParams = getFormData();

    // DSOs to compare
    const dsos = ['Elia', 'Fluvius', 'Sibelga', 'Ores', 'Resa'];

    // Default configurations for each DSO
    const dsoConfigs = {
        'Elia': {
            voltage_levels: ['110-380 kV', '30-70 kV', 'Transfo < 30 kV'],
            region: null,
            connection_type: null
        },
        'Fluvius': {
            voltage_levels: ['26-36 kV', '1-26 kV'],
            region: 'Antwerpen', // Default region
            connection_type: 'Post' // Default connection type
        },
        'Sibelga': {
            voltage_levels: ['1-26 kV'],
            region: null,
            connection_type: 'Main' // Default connection type
        },
        'Ores': {
            voltage_levels: ['MT'],
            region: null,
            connection_type: 'Post' // Default connection type
        },
        'Resa': {
            voltage_levels: ['MT'],
            region: null,
            connection_type: 'Post' // Default connection type
        }
    };

    // Show loading state
    summaryDiv.innerHTML = '<div style="text-align: center; padding: 20px;">Loading comparison data...</div>';
    dsoComparisonSection.style.display = 'block';

    // Fetch results for each DSO
    const results = [];

    for (const dso of dsos) {
        const config = dsoConfigs[dso];

        // For each voltage level of this DSO
        for (const voltage of config.voltage_levels) {
            const params = {
                dso_tso: dso,
                region: config.region || '',
                voltage: voltage,
                connection_type: config.connection_type || '',
                offtake_energy: baseParams.offtake_energy,
                injection_energy: baseParams.injection_energy,
                peak_monthly: baseParams.peak_monthly,
                peak_yearly: baseParams.peak_yearly,
                contracted_capacity: baseParams.contracted_capacity,
                is_bess: baseParams.is_bess
            };

            try {
                const response = await fetch('/api/calculate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(params)
                });

                if (response.ok) {
                    const result = await response.json();
                    results.push({
                        dso: dso,
                        voltage: voltage,
                        region: config.region,
                        connection_type: config.connection_type,
                        params: params,
                        result: result
                    });
                }
            } catch (error) {
                console.error(`Error calculating for ${dso} - ${voltage}:`, error);
            }
        }
    }

    // Sort results by total cost (ascending)
    results.sort((a, b) => a.result.total - b.result.total);

    // Calculate cost per MWh for each result
    results.forEach(r => {
        r.costPerMWh = baseParams.offtake_energy > 0
            ? (r.result.total * 1000) / baseParams.offtake_energy
            : 0;
    });

    // Find best and worst options
    const bestOption = results[0];
    const worstOption = results[results.length - 1];
    const savings = (worstOption.result.total - bestOption.result.total) * 1000;

    // Create summary card
    summaryDiv.innerHTML = `
        <div class="insight-card success">
            <div class="insight-icon">💡</div>
            <div class="insight-content">
                <h4>Best Option: ${bestOption.dso} - ${bestOption.voltage}</h4>
                <p>
                    Annual cost: <strong>€${(bestOption.result.total * 1000).toFixed(2)}</strong>
                    (€${bestOption.costPerMWh.toFixed(2)}/MWh)
                </p>
                <p style="margin-top: 10px;">
                    Potential savings vs most expensive option:
                    <strong>€${savings.toFixed(2)}/year</strong>
                </p>
            </div>
        </div>
    `;

    // Create comparison table
    const tableHTML = `
        <h4 style="margin-bottom: 15px; color: #495057;">Detailed DSO Comparison</h4>
        <p style="margin-bottom: 15px; color: #6c757d; font-size: 0.9rem;">
            ℹ️ This comparison uses the same energy usage and demand parameters across all DSOs.
            Each DSO's standard voltage level and configuration is used.
        </p>
        <div class="comparison-table-wrapper">
            <table class="breakdown-table">
                <thead>
                    <tr>
                        <th>DSO/TSO</th>
                        <th>Voltage Level</th>
                        <th>Region</th>
                        <th>Connection</th>
                        <th>Annual Cost</th>
                        <th>Cost per MWh</th>
                        <th>vs Best Option</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map((r, index) => {
                        const diff = (r.result.total - bestOption.result.total) * 1000;
                        const isBest = index === 0;
                        const isWorst = index === results.length - 1;

                        return `
                            <tr style="background-color: ${isBest ? '#d4edda' : isWorst ? '#f8d7da' : 'transparent'};">
                                <td><strong>${r.dso}</strong></td>
                                <td>${r.voltage}</td>
                                <td>${r.region || '-'}</td>
                                <td>${r.connection_type || '-'}</td>
                                <td><strong>€${(r.result.total * 1000).toFixed(2)}</strong></td>
                                <td>€${r.costPerMWh.toFixed(2)}</td>
                                <td style="color: ${diff === 0 ? '#28a745' : '#dc3545'}; font-weight: 600;">
                                    ${diff === 0 ? '✓ Best' : '+€' + diff.toFixed(2)}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    detailsDiv.innerHTML = tableHTML;
}

// Comparison Mode
let savedScenarios = [];

function saveScenario(params, result) {
    const scenario = {
        id: Date.now(),
        name: `${params.dso_tso} - ${params.voltage}${params.region ? ' - ' + params.region : ''}`,
        params: {...params},
        result: {...result},
        timestamp: new Date().toLocaleString()
    };

    savedScenarios.push(scenario);
    updateComparisonTable();

    // Show comparison section
    document.getElementById('comparison-section').classList.add('show');
}

function updateComparisonTable() {
    const tbody = document.getElementById('comparison-tbody');
    if (!tbody) return;

    const translate = typeof window.t === 'function' ? window.t : (key) => key;

    if (savedScenarios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">${translate('noScenarios')}</td></tr>`;
        return;
    }

    tbody.innerHTML = savedScenarios.map(scenario => `
        <tr>
            <td>${scenario.name}</td>
            <td>${scenario.params.is_bess ? 'Yes' : 'No'}</td>
            <td>€${(scenario.result.total * 1000).toFixed(2)}</td>
            <td>€${(scenario.result.total_offtake * 1000).toFixed(2)}</td>
            <td>€${(scenario.result.total_injection * 1000).toFixed(2)}</td>
            <td>
                <button class="btn-small btn-danger" onclick="removeScenario(${scenario.id})">Remove</button>
            </td>
        </tr>
    `).join('');

    // Show comparison if we have 2+ scenarios
    if (savedScenarios.length >= 2) {
        const cheapest = savedScenarios.reduce((min, s) => s.result.total < min.result.total ? s : min);
        const mostExpensive = savedScenarios.reduce((max, s) => s.result.total > max.result.total ? s : max);
        const savings = (mostExpensive.result.total - cheapest.result.total) * 1000;

        const bestOptionTitle = translate('bestOption', { name: cheapest.name });
        const bestOptionMessage = translate('bestOptionSavings', {
            amount: savings.toFixed(2),
            other: mostExpensive.name
        });

        document.getElementById('comparison-insight').innerHTML = `
            <div class="insight-card success">
                <div class="insight-icon">💡</div>
                <div class="insight-content">
                    <h4>${bestOptionTitle}</h4>
                    <p>${bestOptionMessage}</p>
                </div>
            </div>
        `;
        document.getElementById('comparison-insight').classList.add('show');
    }
}

function removeScenario(id) {
    savedScenarios = savedScenarios.filter(s => s.id !== id);
    updateComparisonTable();
    if (savedScenarios.length === 0) {
        document.getElementById('comparison-section').classList.remove('show');
    }
}

function clearComparison() {
    savedScenarios = [];
    updateComparisonTable();
    document.getElementById('comparison-section').classList.remove('show');
}

// Export functionality
function exportToCSV(result, params) {
    const rows = [
        ['Belgian Grid Fees Calculator - Results'],
        ['Generated:', new Date().toLocaleString()],
        [''],
        ['Configuration'],
        ['DSO/TSO:', params.dso_tso],
        ['Region:', params.region || 'N/A'],
        ['Voltage Level:', params.voltage],
        ['Connection Type:', params.connection_type || 'N/A'],
        ['BESS Exemptions:', params.is_bess ? 'Yes' : 'No'],
        [''],
        ['Input Values'],
        ['Offtake Energy (MWh/year):', params.offtake_energy],
        ['Injection Energy (MWh/year):', params.injection_energy],
        ['Monthly Peak (MW):', params.peak_monthly],
        ['Annual Peak (MW):', params.peak_yearly],
        ['Contracted Capacity (MVA):', params.contracted_capacity],
        [''],
        ['Results (€/year)'],
        ['Total Annual Cost:', (result.total * 1000).toFixed(2)],
        ['Offtake Fees:', (result.total_offtake * 1000).toFixed(2)],
        ['Injection Fees:', (result.total_injection * 1000).toFixed(2)],
        [''],
        ['Fee Breakdown'],
        ['Component', 'Rate (k€)', 'Quantity', 'Multiplier', 'Amount (€/year)']
    ];

    Object.entries(result.breakdown).forEach(([name, fee]) => {
        rows.push([
            name,
            fee.rate.toFixed(6),
            fee.quantity.toFixed(2),
            fee.multiplier.toFixed(2),
            (fee.total * 1000).toFixed(2)
        ]);
    });

    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grid-fees-${params.dso_tso}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}


// Sensitivity Analysis
function showSensitivityAnalysis(params) {
    const modal = document.getElementById('sensitivity-modal');
    if (!modal) return;

    modal.classList.add('show');

    // Calculate sensitivity for peak demand
    const peakVariations = [-50, -25, 0, 25, 50].map(pct => {
        const variation = params.peak_monthly * (pct / 100);
        return {
            label: `${pct > 0 ? '+' : ''}${pct}%`,
            peak: params.peak_monthly + variation,
            pct: pct
        };
    });

    // We'd need to call the API for each variation
    // For now, show the UI structure
    document.getElementById('sensitivity-results').innerHTML = `
        <p>Analyzing impact of peak demand changes...</p>
        <div class="sensitivity-chart">
            ${peakVariations.map(v => `
                <div class="sensitivity-bar">
                    <span class="sensitivity-label">${v.label}</span>
                    <div class="sensitivity-value">${v.peak.toFixed(2)} MW</div>
                </div>
            `).join('')}
        </div>
    `;
}

function closeSensitivityModal() {
    const modal = document.getElementById('sensitivity-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Storage Index Comparison
function compareStorageIndexToGridFees(result, params) {
    const storageIndexSection = document.getElementById('storage-index-section');
    const summaryDiv = document.getElementById('storage-index-summary');
    const detailsDiv = document.getElementById('storage-index-details');

    // Only show if BESS parameters are available
    if (!params.is_bess || params.peak_monthly === 0) {
        storageIndexSection.style.display = 'none';
        return;
    }

    // Check if storage index data is available
    if (typeof storageIndexData === 'undefined') {
        console.warn('Storage Index data not loaded');
        return;
    }

    const translate = typeof window.t === 'function' ? window.t : (key) => key;

    // Get BESS parameters
    const power = params.peak_monthly; // MW
    const duration = parseFloat(document.getElementById('bess_duration')?.value) || 2; // hours
    const cycles = parseFloat(document.getElementById('bess_cycles')?.value) || 1.5;
    const efficiency = (parseFloat(document.getElementById('bess_efficiency')?.value) || 88) / 100;

    // Calculate capturable Storage Index values
    const capturableValues = storageIndexData.calculateCapturableValue(power, duration, cycles, efficiency);

    // Get recent year average (last 12 months)
    const recent12Months = capturableValues.slice(-12);
    const avgMonthlyValue = recent12Months.reduce((sum, v) => sum + v.monthlyValue, 0) / 12;
    const totalAnnualValue = avgMonthlyValue * 12;

    // Grid fees (annual, in k€)
    const gridFeesAnnual = result.total;

    // Calculate comparison
    const netValue = totalAnnualValue - gridFeesAnnual;
    const valueRatio = gridFeesAnnual > 0 ? (totalAnnualValue / gridFeesAnnual * 100).toFixed(1) : 0;

    // Create summary card
    summaryDiv.innerHTML = `
        <div class="insight-card ${netValue > 0 ? 'success' : 'warning'}">
            <div class="insight-icon">${netValue > 0 ? '✅' : '⚠️'}</div>
            <div class="insight-content">
                <h4>Storage Index Value Analysis</h4>
                <p>
                    Based on recent 12-month average, your ${power.toFixed(1)} MW / ${duration}h BESS could capture approximately
                    <strong>€${(totalAnnualValue * 1000).toFixed(0)}/year</strong> from energy arbitrage (Storage Index).
                </p>
                <p style="margin-top: 10px;">
                    Annual Grid Fees: <strong>€${(gridFeesAnnual * 1000).toFixed(0)}</strong>
                    ${params.is_bess ? '(with BESS exemptions applied)' : ''}
                </p>
                <p style="margin-top: 10px; font-size: 1.1em;">
                    <strong>Net Value: ${netValue > 0 ? '+' : ''}€${(netValue * 1000).toFixed(0)}/year</strong>
                    ${netValue > 0
                        ? `(Storage Index value is ${valueRatio}% of grid fees, resulting in positive net value)`
                        : `(Storage Index value is only ${valueRatio}% of grid fees)`
                    }
                </p>
            </div>
        </div>
    `;

    // Create monthly breakdown table
    const tableHTML = `
        <h4 style="margin-bottom: 15px; color: #495057;">Monthly Storage Index Values & Annualized Projections</h4>
        <div class="comparison-table-wrapper">
            <table class="breakdown-table">
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Duration</th>
                        <th>Storage Index<br/>(k€/MW)</th>
                        <th>Monthly Value<br/>(k€)</th>
                        <th>If Annualized<br/>(k€/year)</th>
                        <th>vs Grid Fees</th>
                    </tr>
                </thead>
                <tbody>
                    ${capturableValues.slice(-24).map(v => {
                        const annualizedNetValue = v.annualizedValue - gridFeesAnnual;
                        const isPositive = annualizedNetValue > 0;
                        return `
                            <tr>
                                <td>${v.month}</td>
                                <td>${v.durationUsed}</td>
                                <td>${v.storageIndex.toFixed(1)}</td>
                                <td>€${(v.monthlyValue * 1000).toFixed(0)}</td>
                                <td>€${(v.annualizedValue * 1000).toFixed(0)}</td>
                                <td style="color: ${isPositive ? '#28a745' : '#dc3545'}; font-weight: 600;">
                                    ${isPositive ? '+' : ''}€${(annualizedNetValue * 1000).toFixed(0)}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot style="font-weight: 700; background: #f8f9fa;">
                    <tr>
                        <td colspan="3">Recent 12-Month Average</td>
                        <td>€${(avgMonthlyValue * 1000).toFixed(0)}</td>
                        <td>€${(totalAnnualValue * 1000).toFixed(0)}</td>
                        <td style="color: ${netValue > 0 ? '#28a745' : '#dc3545'};">
                            ${netValue > 0 ? '+' : ''}€${(netValue * 1000).toFixed(0)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
        <p style="margin-top: 15px; padding: 10px; background: #e7f3ff; border-radius: 8px; font-size: 0.9rem;">
            ℹ️ <strong>Note:</strong> Storage Index values are based on Clean Horizon data with ${(efficiency * 100).toFixed(0)}% round-trip efficiency and ${cycles} cycles/day.
            "If Annualized" shows the annual value if each month's performance continued for a full year.
            The comparison shows whether capturable value exceeds grid fees for that scenario.
        </p>
    `;

    detailsDiv.innerHTML = tableHTML;
    storageIndexSection.style.display = 'block';
}

// Initialize all enhancements
function initEnhancements() {
    initBESSCalculator();

    // Add event listeners for new buttons
    const saveBtn = document.getElementById('save-scenario-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const params = getFormData();
            const result = window.lastCalculationResult;
            if (result && !result.error) {
                saveScenario(params, result);
            }
        });
    }

    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const params = getFormData();
            const result = window.lastCalculationResult;
            if (result && !result.error) {
                exportToCSV(result, params);
            }
        });
    }


    const sensitivityBtn = document.getElementById('sensitivity-btn');
    if (sensitivityBtn) {
        sensitivityBtn.addEventListener('click', () => {
            const params = getFormData();
            showSensitivityAnalysis(params);
        });
    }

    const compareDSOsBtn = document.getElementById('compare-dsos-btn');
    if (compareDSOsBtn) {
        compareDSOsBtn.addEventListener('click', () => {
            compareDSOs();
        });
    }
}

function getFormData() {
    return {
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
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancements);
} else {
    initEnhancements();
}
