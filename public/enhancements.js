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

// Savings Comparison Feature
async function runSavingsComparison() {
    const section = document.getElementById('savings-comparison-section');
    const contentDiv = document.getElementById('savings-comparison-content');
    const translate = typeof window.t === 'function' ? window.t : (key) => key;

    const baseParams = getFormData();

    // DSO configurations
    const dsoConfigs = {
        'Elia': {
            voltage_levels: ['110-380 kV', '30-70 kV', 'Transfo < 30 kV'],
            region: null,
            connection_type: null
        },
        'Fluvius': {
            voltage_levels: ['26-36 kV', '1-26 kV'],
            region: baseParams.dso_tso === 'Fluvius' ? baseParams.region : 'Antwerpen',
            connection_type: 'Post'
        },
        'Sibelga': {
            voltage_levels: ['1-26 kV'],
            region: null,
            connection_type: 'Main'
        },
        'Ores': {
            voltage_levels: ['MT'],
            region: null,
            connection_type: 'Post'
        },
        'Resa': {
            voltage_levels: ['MT'],
            region: null,
            connection_type: 'Post'
        }
    };

    // Show loading
    contentDiv.innerHTML = `<div style="text-align: center; padding: 30px;"><div class="spinner"></div><p style="margin-top: 10px; color: #6c757d;">${translate('savingsLoading')}</p></div>`;
    section.style.display = 'block';

    // Fetch all results in parallel
    const promises = [];
    const dsos = ['Elia', 'Fluvius', 'Sibelga', 'Ores', 'Resa'];

    for (const dso of dsos) {
        const config = dsoConfigs[dso];
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

            const isCurrent = dso === baseParams.dso_tso && voltage === baseParams.voltage;

            promises.push(
                fetch('/api/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(params)
                })
                .then(r => r.ok ? r.json() : null)
                .then(result => result ? {
                    dso, voltage,
                    region: config.region,
                    connection_type: config.connection_type,
                    result,
                    isCurrent
                } : null)
                .catch(() => null)
            );
        }
    }

    const allResults = (await Promise.all(promises)).filter(Boolean);

    if (allResults.length === 0) {
        contentDiv.innerHTML = `<p style="color: #999; text-align: center;">${translate('savingsNoData')}</p>`;
        return;
    }

    // Sort by cost
    allResults.sort((a, b) => a.result.total - b.result.total);

    const cheapest = allResults[0];
    const mostExpensive = allResults[allResults.length - 1];
    const maxCost = mostExpensive.result.total;

    // Find current selection in results
    const currentResult = allResults.find(r => r.isCurrent);
    const currentCost = currentResult ? currentResult.result.total : null;

    // Colors for bars
    const barColors = {
        'Elia': '#1a5276',
        'Fluvius': '#DC143C',
        'Sibelga': '#f39c12',
        'Ores': '#27ae60',
        'Resa': '#8e44ad'
    };

    // Build summary cards
    let summaryHTML = '<div class="savings-summary-cards">';

    if (currentResult) {
        summaryHTML += `
            <div class="savings-summary-card current-card">
                <h4>${translate('savingsYourCurrent')}</h4>
                <div class="value">€${(currentCost * 1000).toFixed(0)}</div>
                <div class="sublabel">${currentResult.dso} - ${currentResult.voltage}</div>
            </div>
        `;
    }

    summaryHTML += `
        <div class="savings-summary-card best">
            <h4>${translate('savingsCheapest')}</h4>
            <div class="value">€${(cheapest.result.total * 1000).toFixed(0)}</div>
            <div class="sublabel">${cheapest.dso} - ${cheapest.voltage}</div>
        </div>
    `;

    if (currentResult && currentCost > cheapest.result.total) {
        const potentialSaving = (currentCost - cheapest.result.total) * 1000;
        summaryHTML += `
            <div class="savings-summary-card potential">
                <h4>${translate('savingsPotential')}</h4>
                <div class="value" style="color: #28a745;">-€${potentialSaving.toFixed(0)}/yr</div>
                <div class="sublabel">${translate('savingsBySwitching', { dso: cheapest.dso })}</div>
            </div>
        `;
    }

    summaryHTML += '</div>';

    // Build bar chart
    let barsHTML = '';
    allResults.forEach(r => {
        const cost = r.result.total * 1000;
        const widthPct = maxCost > 0 ? (r.result.total / maxCost * 100) : 0;
        const color = barColors[r.dso] || '#6c757d';

        let rowClass = 'savings-bar-row';
        let badge = '';
        if (r.isCurrent) {
            rowClass += ' current';
            badge = ` <span style="background: #007bff; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: 700; vertical-align: middle;">${translate('savingsYou')}</span>`;
        }
        if (r === cheapest) {
            rowClass += ' cheapest';
            badge += ` <span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: 700; vertical-align: middle;">${translate('savingsBest')}</span>`;
        }

        // Diff vs current
        let diffHTML = '';
        if (currentCost !== null) {
            const diff = (r.result.total - currentCost) * 1000;
            if (Math.abs(diff) < 0.5) {
                diffHTML = `<span class="savings-bar-diff neutral">—</span>`;
            } else if (diff < 0) {
                diffHTML = `<span class="savings-bar-diff saving">▼ €${Math.abs(diff).toFixed(0)}/yr</span>`;
            } else {
                diffHTML = `<span class="savings-bar-diff extra">▲ €${diff.toFixed(0)}/yr</span>`;
            }
        }

        const costPerMWh = baseParams.offtake_energy > 0 ? cost / baseParams.offtake_energy : 0;

        // Build detail line: voltage, connection type, region, BESS
        const details = [r.voltage];
        if (r.connection_type) details.push(r.connection_type);
        if (r.region) details.push(r.region);
        const bessLabel = baseParams.is_bess ? ' | BESS' : '';

        barsHTML += `
            <div class="${rowClass}">
                <div class="savings-bar-label">
                    ${r.dso}${badge}
                    <small>${details.join(' · ')}${bessLabel}</small>
                </div>
                <div class="savings-bar-container">
                    <div class="savings-bar-fill" style="width: ${widthPct.toFixed(1)}%; background: ${color};"></div>
                </div>
                <div class="savings-bar-cost">€${cost.toFixed(0)}<small style="color: #999; font-weight: 400;"> (${costPerMWh.toFixed(2)}/MWh)</small></div>
                ${diffHTML}
            </div>
        `;
    });

    contentDiv.innerHTML = summaryHTML + barsHTML;
}

// Cost Breakdown Drill-Down
function showCostDetail(feeName, feeData, params) {
    const modal = document.getElementById('cost-detail-modal');
    const titleElement = document.getElementById('modal-fee-title');
    const contentElement = document.getElementById('cost-detail-content');

    // Set modal title
    titleElement.textContent = feeName;

    // Fee descriptions and formulas
    const feeDescriptions = {
        'Injection Fixed': {
            description: 'Fixed annual charge for injection capability, regardless of actual usage.',
            formula: 'Rate (k€/year)',
            type: 'Fixed',
            applies: 'Applied once per year'
        },
        'Injection Contracted': {
            description: 'Charge based on contracted injection capacity.',
            formula: 'Rate (k€/MVA/year) × Contracted Capacity (MVA)',
            type: 'Capacity-based',
            applies: 'Based on contracted MVA'
        },
        'Injection Peak Monthly': {
            description: 'Charge based on the highest monthly injection peak demand.',
            formula: 'Rate (k€/MW/year) × Monthly Peak (MW)',
            type: 'Demand-based',
            applies: 'Based on highest monthly peak'
        },
        'Injection Peak Yearly': {
            description: 'Charge based on the annual peak injection demand.',
            formula: 'Rate (k€/MW/year) × Annual Peak (MW)',
            type: 'Demand-based',
            applies: 'Based on annual peak'
        },
        'Injection Volumetric': {
            description: 'Variable charge based on total energy injected into the grid.',
            formula: 'Rate (k€/MWh) × Injection Energy (MWh/year)',
            type: 'Energy-based',
            applies: 'Per MWh injected'
        },
        'Injection Other': {
            description: 'Additional injection-related charges specific to this tariff.',
            formula: 'Varies by DSO',
            type: 'Other',
            applies: 'DSO-specific'
        },
        'Offtake Fixed': {
            description: 'Fixed annual charge for offtake (consumption) connection.',
            formula: 'Rate (k€/year)',
            type: 'Fixed',
            applies: 'Applied once per year'
        },
        'Offtake Contracted': {
            description: 'Charge based on contracted offtake capacity.',
            formula: 'Rate (k€/MVA/year) × Contracted Capacity (MVA)',
            type: 'Capacity-based',
            applies: 'Based on contracted MVA'
        },
        'Offtake Peak Monthly': {
            description: 'Charge based on the highest monthly offtake peak demand.',
            formula: 'Rate (k€/MW/year) × Monthly Peak (MW)',
            type: 'Demand-based',
            applies: 'Based on highest monthly peak'
        },
        'Offtake Peak Yearly': {
            description: 'Charge based on the annual peak offtake demand.',
            formula: 'Rate (k€/MW/year) × Annual Peak (MW)',
            type: 'Demand-based',
            applies: 'Based on annual peak'
        },
        'Offtake Volumetric': {
            description: 'Variable charge based on total energy consumed from the grid.',
            formula: 'Rate (k€/MWh) × Offtake Energy (MWh/year)',
            type: 'Energy-based',
            applies: 'Per MWh consumed'
        },
        'Offtake Other': {
            description: 'Additional offtake-related charges specific to this tariff.',
            formula: 'Varies by DSO',
            type: 'Other',
            applies: 'DSO-specific'
        }
    };

    const feeInfo = feeDescriptions[feeName] || {
        description: 'Fee component as defined by the DSO tariff structure.',
        formula: 'Rate × Quantity × Multiplier',
        type: 'Standard',
        applies: 'As specified in tariff'
    };

    // Build content HTML
    const content = `
        <div class="detail-section">
            <h4>📋 Description</h4>
            <p style="color: #495057; line-height: 1.6;">${feeInfo.description}</p>
        </div>

        <div class="detail-section">
            <h4>🧮 Calculation</h4>
            <div class="formula-box">
                <strong>Formula:</strong><br>
                ${feeInfo.formula}
            </div>
            <div class="detail-grid">
                <div class="detail-label">Rate:</div>
                <div class="detail-value">${feeData.rate.toFixed(6)} k€</div>
                <div class="detail-label">Quantity:</div>
                <div class="detail-value">${feeData.quantity.toFixed(2)}</div>
                <div class="detail-label">Multiplier:</div>
                <div class="detail-value">${feeData.multiplier.toFixed(2)}${params.is_bess && feeData.multiplier < 1 ? ' (BESS exemption applied)' : ''}</div>
            </div>
            <div class="formula-box" style="background: #e7f3ff; border-color: #007bff;">
                <strong>Result:</strong><br>
                ${feeData.rate.toFixed(6)} × ${feeData.quantity.toFixed(2)} × ${feeData.multiplier.toFixed(2)} = <strong style="color: #DC143C;">${feeData.total.toFixed(6)} k€ = €${(feeData.total * 1000).toFixed(2)}/year</strong>
            </div>
        </div>

        <div class="detail-section">
            <h4>📊 Fee Information</h4>
            <div class="detail-grid">
                <div class="detail-label">Fee Type:</div>
                <div class="detail-value">${feeInfo.type}</div>
                <div class="detail-label">Applies:</div>
                <div class="detail-value">${feeInfo.applies}</div>
                <div class="detail-label">Annual Amount:</div>
                <div class="detail-value" style="font-size: 1.2rem; font-weight: 700; color: #DC143C;">€${(feeData.total * 1000).toFixed(2)}</div>
            </div>
        </div>

        ${feeData.total > 0 ? `
            <div class="detail-section">
                <h4>💡 Optimization Tips</h4>
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
                    ${getOptimizationTip(feeName, feeData, params)}
                </div>
            </div>
        ` : ''}
    `;

    contentElement.innerHTML = content;
    modal.classList.add('show');
}

// Get optimization tips based on fee type
function getOptimizationTip(feeName, feeData, params) {
    if (feeName.includes('Peak Monthly') || feeName.includes('Peak Yearly')) {
        return `
            <strong>💡 Peak Demand Reduction:</strong><br>
            This is a demand charge based on your peak usage. Consider:
            <ul style="margin: 10px 0 0 20px;">
                <li>Load shifting to off-peak hours</li>
                <li>Installing BESS to shave peaks</li>
                <li>Demand response programs</li>
                <li>Even a 10% peak reduction could save €${((feeData.total * 0.1) * 1000).toFixed(2)}/year</li>
            </ul>
        `;
    } else if (feeName.includes('Volumetric')) {
        return `
            <strong>💡 Energy Efficiency:</strong><br>
            This charge is based on total energy usage. Consider:
            <ul style="margin: 10px 0 0 20px;">
                <li>Energy efficiency improvements</li>
                <li>On-site generation (solar, etc.)</li>
                <li>Optimizing operational schedules</li>
            </ul>
        `;
    } else if (feeName.includes('Contracted')) {
        return `
            <strong>💡 Capacity Optimization:</strong><br>
            This charge is based on contracted capacity. Consider:
            <ul style="margin: 10px 0 0 20px;">
                <li>Review if contracted capacity matches actual needs</li>
                <li>Negotiate with DSO if consistently under capacity</li>
                <li>Plan for future expansion needs</li>
            </ul>
        `;
    } else if (feeName.includes('Fixed')) {
        return `
            <strong>💡 Fixed Charges:</strong><br>
            This is a fixed charge that applies regardless of usage. Limited optimization options, but:
            <ul style="margin: 10px 0 0 20px;">
                <li>Ensure you're on the correct tariff for your usage profile</li>
                <li>Compare with other DSOs if available</li>
                <li>Consider if different voltage level might be more economical</li>
            </ul>
        `;
    } else {
        return `
            <strong>💡 General Optimization:</strong><br>
            <ul style="margin: 10px 0 0 20px;">
                <li>Compare with other DSO tariffs</li>
                <li>Monitor usage patterns regularly</li>
                <li>Consider BESS for eligible exemptions</li>
            </ul>
        `;
    }
}

// Close modal
function closeCostDetailModal() {
    const modal = document.getElementById('cost-detail-modal');
    modal.classList.remove('show');
}

// Make breakdown rows clickable
function makeBreakdownClickable() {
    const result = window.lastCalculationResult;
    const params = getFormData();

    if (!result || !result.breakdown) return;

    const breakdownBody = document.getElementById('breakdown-body');
    if (!breakdownBody) return;

    const rows = breakdownBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        const feeName = Object.keys(result.breakdown)[index];
        const feeData = result.breakdown[feeName];

        if (feeName && feeData) {
            row.classList.add('breakdown-row-clickable');
            row.style.cursor = 'pointer';
            row.title = 'Click for details';

            // Remove any existing click handlers
            row.replaceWith(row.cloneNode(true));
            const newRow = breakdownBody.querySelectorAll('tr')[index];

            newRow.addEventListener('click', () => {
                showCostDetail(feeName, feeData, params);
            });
        }
    });
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

// Save results as JSON
function saveResultsJSON(result, params) {
    const data = {
        generated: new Date().toISOString(),
        configuration: {
            dso_tso: params.dso_tso,
            region: params.region || null,
            voltage: params.voltage,
            connection_type: params.connection_type || null,
            is_bess: params.is_bess
        },
        inputs: {
            offtake_energy_mwh: params.offtake_energy,
            injection_energy_mwh: params.injection_energy,
            peak_monthly_mw: params.peak_monthly,
            peak_yearly_mw: params.peak_yearly,
            contracted_capacity_mva: params.contracted_capacity
        },
        results_eur: {
            total: +(result.total * 1000).toFixed(2),
            offtake: +(result.total_offtake * 1000).toFixed(2),
            injection: +(result.total_injection * 1000).toFixed(2)
        },
        breakdown_eur: {}
    };

    Object.entries(result.breakdown).forEach(([name, fee]) => {
        data.breakdown_eur[name] = {
            rate_keur: fee.rate,
            quantity: fee.quantity,
            multiplier: fee.multiplier,
            amount_eur: +(fee.total * 1000).toFixed(2)
        };
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grid-fees-${params.dso_tso}-${new Date().toISOString().slice(0, 10)}.json`;
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

    const saveResultsBtn = document.getElementById('save-results-btn');
    if (saveResultsBtn) {
        saveResultsBtn.addEventListener('click', () => {
            const params = getFormData();
            const result = window.lastCalculationResult;
            if (result && !result.error) {
                saveResultsJSON(result, params);
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
