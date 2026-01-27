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

    // Store results globally for export/filtering
    window.dsoComparisonResults = results;
    window.dsoComparisonBaseParams = baseParams;

    // Create comparison table with controls
    renderComparisonMatrix(results, baseParams, bestOption, detailsDiv);
}

// Render Comparison Matrix with filtering and sorting
function renderComparisonMatrix(results, baseParams, bestOption, container) {
    // Get unique values for filters
    const allDSOs = [...new Set(results.map(r => r.dso))];
    const allVoltages = [...new Set(results.map(r => r.voltage))];

    // Current filter/sort state (use stored state or defaults)
    const currentFilters = window.comparisonFilters || {
        dso: 'all',
        voltage: 'all',
        sortBy: 'cost',
        sortOrder: 'asc'
    };

    // Apply filters
    let filteredResults = results.filter(r => {
        if (currentFilters.dso !== 'all' && r.dso !== currentFilters.dso) return false;
        if (currentFilters.voltage !== 'all' && r.voltage !== currentFilters.voltage) return false;
        return true;
    });

    // Apply sorting
    filteredResults.sort((a, b) => {
        let aVal, bVal;
        switch(currentFilters.sortBy) {
            case 'cost':
                aVal = a.result.total;
                bVal = b.result.total;
                break;
            case 'costPerMWh':
                aVal = a.costPerMWh;
                bVal = b.costPerMWh;
                break;
            case 'dso':
                aVal = a.dso;
                bVal = b.dso;
                break;
            case 'voltage':
                aVal = a.voltage;
                bVal = b.voltage;
                break;
            default:
                aVal = a.result.total;
                bVal = b.result.total;
        }

        const comparison = typeof aVal === 'string'
            ? aVal.localeCompare(bVal)
            : aVal - bVal;

        return currentFilters.sortOrder === 'asc' ? comparison : -comparison;
    });

    const tableHTML = `
        <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4 style="margin: 0; color: #495057;">Comparison Matrix</h4>
                <div>
                    <button onclick="exportComparisonToExcel()" class="btn btn-small btn-secondary" style="margin-right: 8px;">
                        📊 Export to Excel
                    </button>
                    <button onclick="copyComparisonToClipboard()" class="btn btn-small btn-secondary">
                        📋 Copy to Clipboard
                    </button>
                </div>
            </div>

            <!-- Filters and Sort Controls -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <div>
                    <label style="display: block; font-size: 0.85rem; margin-bottom: 5px; color: #6c757d;">Filter by DSO</label>
                    <select onchange="updateComparisonFilter('dso', this.value)" style="width: 100%; padding: 8px; border: 1px solid #dee2e6; border-radius: 4px;">
                        <option value="all" ${currentFilters.dso === 'all' ? 'selected' : ''}>All DSOs</option>
                        ${allDSOs.map(dso => `<option value="${dso}" ${currentFilters.dso === dso ? 'selected' : ''}>${dso}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display: block; font-size: 0.85rem; margin-bottom: 5px; color: #6c757d;">Filter by Voltage</label>
                    <select onchange="updateComparisonFilter('voltage', this.value)" style="width: 100%; padding: 8px; border: 1px solid #dee2e6; border-radius: 4px;">
                        <option value="all" ${currentFilters.voltage === 'all' ? 'selected' : ''}>All Voltages</option>
                        ${allVoltages.map(v => `<option value="${v}" ${currentFilters.voltage === v ? 'selected' : ''}>${v}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display: block; font-size: 0.85rem; margin-bottom: 5px; color: #6c757d;">Sort by</label>
                    <select onchange="updateComparisonFilter('sortBy', this.value)" style="width: 100%; padding: 8px; border: 1px solid #dee2e6; border-radius: 4px;">
                        <option value="cost" ${currentFilters.sortBy === 'cost' ? 'selected' : ''}>Annual Cost</option>
                        <option value="costPerMWh" ${currentFilters.sortBy === 'costPerMWh' ? 'selected' : ''}>Cost per MWh</option>
                        <option value="dso" ${currentFilters.sortBy === 'dso' ? 'selected' : ''}>DSO Name</option>
                        <option value="voltage" ${currentFilters.sortBy === 'voltage' ? 'selected' : ''}>Voltage Level</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; font-size: 0.85rem; margin-bottom: 5px; color: #6c757d;">Order</label>
                    <select onchange="updateComparisonFilter('sortOrder', this.value)" style="width: 100%; padding: 8px; border: 1px solid #dee2e6; border-radius: 4px;">
                        <option value="asc" ${currentFilters.sortOrder === 'asc' ? 'selected' : ''}>Ascending</option>
                        <option value="desc" ${currentFilters.sortOrder === 'desc' ? 'selected' : ''}>Descending</option>
                    </select>
                </div>
            </div>

            <p style="margin-bottom: 15px; color: #6c757d; font-size: 0.9rem;">
                ℹ️ Showing ${filteredResults.length} of ${results.length} configurations
            </p>
        </div>

        <div class="comparison-table-wrapper">
            <table class="breakdown-table" id="comparison-matrix-table">
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
                    ${filteredResults.map((r, index) => {
                        const diff = (r.result.total - bestOption.result.total) * 1000;
                        const isBest = r.dso === bestOption.dso && r.voltage === bestOption.voltage;
                        const isWorst = index === filteredResults.length - 1 && filteredResults.length === results.length;

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

    container.innerHTML = tableHTML;
}

// Update comparison filter
function updateComparisonFilter(filterType, value) {
    if (!window.comparisonFilters) {
        window.comparisonFilters = {
            dso: 'all',
            voltage: 'all',
            sortBy: 'cost',
            sortOrder: 'asc'
        };
    }

    window.comparisonFilters[filterType] = value;

    // Re-render the matrix
    const detailsDiv = document.getElementById('dso-comparison-details');
    const results = window.dsoComparisonResults;
    const baseParams = window.dsoComparisonBaseParams;
    const bestOption = results.sort((a, b) => a.result.total - b.result.total)[0];

    renderComparisonMatrix(results, baseParams, bestOption, detailsDiv);
}

// Export comparison to Excel
function exportComparisonToExcel() {
    if (!window.dsoComparisonResults) {
        alert('No comparison data available. Please run a comparison first.');
        return;
    }

    const results = window.dsoComparisonResults;
    const baseParams = window.dsoComparisonBaseParams;

    // Prepare data for Excel
    const excelData = [
        ['DSO Comparison Report'],
        ['Generated:', new Date().toLocaleString()],
        [],
        ['Parameters:'],
        ['Annual Offtake (MWh):', baseParams.offtake_energy],
        ['Annual Injection (MWh):', baseParams.injection_energy],
        ['Monthly Peak (MW):', baseParams.peak_monthly],
        ['Annual Peak (MW):', baseParams.peak_yearly],
        ['Contracted Capacity (MVA):', baseParams.contracted_capacity],
        ['BESS:', baseParams.is_bess ? 'Yes' : 'No'],
        [],
        ['DSO/TSO', 'Voltage Level', 'Region', 'Connection', 'Annual Cost (€)', 'Cost per MWh (€)', 'Difference vs Best (€)']
    ];

    // Sort by cost
    const sortedResults = [...results].sort((a, b) => a.result.total - b.result.total);
    const bestCost = sortedResults[0].result.total;

    sortedResults.forEach(r => {
        const diff = (r.result.total - bestCost) * 1000;
        excelData.push([
            r.dso,
            r.voltage,
            r.region || '-',
            r.connection_type || '-',
            (r.result.total * 1000).toFixed(2),
            r.costPerMWh.toFixed(2),
            diff.toFixed(2)
        ]);
    });

    // Convert to CSV (simple Excel-compatible format)
    const csvContent = excelData.map(row =>
        row.map(cell => {
            const cellStr = String(cell);
            // Escape quotes and wrap in quotes if contains comma
            return cellStr.includes(',') || cellStr.includes('"')
                ? `"${cellStr.replace(/"/g, '""')}"`
                : cellStr;
        }).join(',')
    ).join('\n');

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dso_comparison_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Copy comparison to clipboard
function copyComparisonToClipboard() {
    if (!window.dsoComparisonResults) {
        alert('No comparison data available. Please run a comparison first.');
        return;
    }

    const results = window.dsoComparisonResults;
    const sortedResults = [...results].sort((a, b) => a.result.total - b.result.total);
    const bestCost = sortedResults[0].result.total;

    let text = 'DSO COMPARISON RESULTS\n';
    text += '======================\n\n';
    text += `Generated: ${new Date().toLocaleString()}\n\n`;
    text += 'DSO/TSO\t\tVoltage\t\tAnnual Cost\tCost/MWh\tDifference\n';
    text += '-'.repeat(70) + '\n';

    sortedResults.forEach(r => {
        const diff = (r.result.total - bestCost) * 1000;
        text += `${r.dso}\t\t${r.voltage}\t\t€${(r.result.total * 1000).toFixed(2)}\t€${r.costPerMWh.toFixed(2)}\t`;
        text += diff === 0 ? '✓ Best\n' : `+€${diff.toFixed(2)}\n`;
    });

    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
        // Show success message
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        btn.style.background = '#28a745';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy to clipboard. Please try again.');
        console.error('Copy failed:', err);
    });
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

// Copy results to clipboard
function copyResultsToClipboard(result, params) {
    let text = '═══════════════════════════════════════\n';
    text += '  BELGIAN GRID FEES CALCULATOR\n';
    text += '  Results Report\n';
    text += '═══════════════════════════════════════\n\n';
    text += `Generated: ${new Date().toLocaleString()}\n\n`;

    text += '📍 CONFIGURATION\n';
    text += '─────────────────────────────────────\n';
    text += `DSO/TSO: ${params.dso_tso}\n`;
    if (params.region) text += `Region: ${params.region}\n`;
    text += `Voltage Level: ${params.voltage}\n`;
    if (params.connection_type) text += `Connection Type: ${params.connection_type}\n`;
    text += `BESS Exemptions: ${params.is_bess ? 'Yes' : 'No'}\n\n`;

    text += '⚡ INPUT VALUES\n';
    text += '─────────────────────────────────────\n';
    text += `Annual Offtake: ${params.offtake_energy} MWh/year\n`;
    text += `Annual Injection: ${params.injection_energy} MWh/year\n`;
    text += `Monthly Peak Demand: ${params.peak_monthly} MW\n`;
    text += `Annual Peak Demand: ${params.peak_yearly} MW\n`;
    text += `Contracted Capacity: ${params.contracted_capacity} MVA\n\n`;

    text += '💰 RESULTS\n';
    text += '─────────────────────────────────────\n';
    text += `TOTAL ANNUAL COST: €${(result.total * 1000).toFixed(2)}\n\n`;
    text += `  Offtake Fees:   €${(result.total_offtake * 1000).toFixed(2)}\n`;
    text += `  Injection Fees: €${(result.total_injection * 1000).toFixed(2)}\n\n`;

    text += '📊 FEE BREAKDOWN\n';
    text += '─────────────────────────────────────\n';
    text += 'Component                Rate     Qty    Mult   Amount\n';
    text += '─────────────────────────────────────\n';

    Object.entries(result.breakdown).forEach(([name, fee]) => {
        if (fee.total > 0) {
            const nameShort = name.length > 20 ? name.substring(0, 20) : name.padEnd(20);
            text += `${nameShort} ${fee.rate.toFixed(3)} ${fee.quantity.toFixed(1)} ${fee.multiplier.toFixed(2)} €${(fee.total * 1000).toFixed(2)}\n`;
        }
    });

    text += '\n═══════════════════════════════════════\n';
    text += 'gridfeessimulator.com\n';
    text += '═══════════════════════════════════════\n';

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copy-results-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        btn.style.background = '#28a745';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy to clipboard. Please try again.');
        console.error('Copy failed:', err);
    });
}

// Print results
function printResults(result, params) {
    const printWindow = window.open('', '_blank');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Grid Fees Report - ${params.dso_tso}</title>
            <style>
                @media print {
                    @page {
                        margin: 2cm;
                        size: A4;
                    }
                }
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #DC143C;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #DC143C;
                    font-size: 24px;
                    margin-bottom: 10px;
                }
                .header .subtitle {
                    color: #666;
                    font-size: 14px;
                }
                .section {
                    margin-bottom: 30px;
                    page-break-inside: avoid;
                }
                .section h2 {
                    color: #495057;
                    font-size: 18px;
                    margin-bottom: 15px;
                    border-bottom: 2px solid #e9ecef;
                    padding-bottom: 8px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 200px 1fr;
                    gap: 10px;
                    margin-bottom: 10px;
                }
                .info-label {
                    font-weight: 600;
                    color: #6c757d;
                }
                .info-value {
                    color: #333;
                }
                .total-box {
                    background: linear-gradient(135deg, #DC143C 0%, #8B0000 100%);
                    color: white;
                    padding: 25px;
                    border-radius: 8px;
                    text-align: center;
                    margin: 20px 0;
                }
                .total-box .label {
                    font-size: 16px;
                    margin-bottom: 10px;
                }
                .total-box .amount {
                    font-size: 36px;
                    font-weight: bold;
                }
                .summary-cards {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin: 20px 0;
                }
                .summary-card {
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 15px;
                    background: #f8f9fa;
                }
                .summary-card .label {
                    font-size: 12px;
                    color: #6c757d;
                    margin-bottom: 5px;
                }
                .summary-card .value {
                    font-size: 20px;
                    font-weight: bold;
                    color: #DC143C;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }
                th, td {
                    padding: 10px;
                    text-align: left;
                    border-bottom: 1px solid #dee2e6;
                }
                th {
                    background: #f8f9fa;
                    font-weight: 600;
                    color: #495057;
                    font-size: 12px;
                    text-transform: uppercase;
                }
                td {
                    font-size: 13px;
                }
                .amount-col {
                    text-align: right;
                    font-weight: 600;
                    color: #DC143C;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #dee2e6;
                    text-align: center;
                    color: #6c757d;
                    font-size: 12px;
                }
                .print-btn {
                    background: #DC143C;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    font-size: 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    margin: 20px auto;
                    display: block;
                }
                .print-btn:hover {
                    background: #8B0000;
                }
                @media print {
                    .print-btn {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Grid Fees Calculator Report</h1>
                <div class="subtitle">Generated on ${new Date().toLocaleString()}</div>
            </div>

            <div class="section">
                <h2>📍 Configuration</h2>
                <div class="info-grid">
                    <div class="info-label">DSO/TSO:</div>
                    <div class="info-value">${params.dso_tso}</div>
                    ${params.region ? `
                        <div class="info-label">Region:</div>
                        <div class="info-value">${params.region}</div>
                    ` : ''}
                    <div class="info-label">Voltage Level:</div>
                    <div class="info-value">${params.voltage}</div>
                    ${params.connection_type ? `
                        <div class="info-label">Connection Type:</div>
                        <div class="info-value">${params.connection_type}</div>
                    ` : ''}
                    <div class="info-label">BESS Exemptions:</div>
                    <div class="info-value">${params.is_bess ? 'Yes' : 'No'}</div>
                </div>
            </div>

            <div class="section">
                <h2>⚡ Input Parameters</h2>
                <div class="info-grid">
                    <div class="info-label">Annual Offtake:</div>
                    <div class="info-value">${params.offtake_energy} MWh/year</div>
                    <div class="info-label">Annual Injection:</div>
                    <div class="info-value">${params.injection_energy} MWh/year</div>
                    <div class="info-label">Monthly Peak Demand:</div>
                    <div class="info-value">${params.peak_monthly} MW</div>
                    <div class="info-label">Annual Peak Demand:</div>
                    <div class="info-value">${params.peak_yearly} MW</div>
                    <div class="info-label">Contracted Capacity:</div>
                    <div class="info-value">${params.contracted_capacity} MVA</div>
                </div>
            </div>

            <div class="section">
                <h2>💰 Results</h2>
                <div class="total-box">
                    <div class="label">Total Annual Grid Fees (excl. VAT)</div>
                    <div class="amount">€${(result.total * 1000).toFixed(2)}</div>
                </div>
                <div class="summary-cards">
                    <div class="summary-card">
                        <div class="label">Offtake Fees</div>
                        <div class="value">€${(result.total_offtake * 1000).toFixed(2)}</div>
                    </div>
                    <div class="summary-card">
                        <div class="label">Injection Fees</div>
                        <div class="value">€${(result.total_injection * 1000).toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>📊 Detailed Fee Breakdown</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Fee Component</th>
                            <th>Rate (k€)</th>
                            <th>Quantity</th>
                            <th>Multiplier</th>
                            <th class="amount-col">Amount (€/year)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(result.breakdown).map(([name, fee]) => `
                            <tr>
                                <td><strong>${name}</strong></td>
                                <td>${fee.rate.toFixed(6)}</td>
                                <td>${fee.quantity.toFixed(2)}</td>
                                <td>${fee.multiplier.toFixed(2)}</td>
                                <td class="amount-col">€${(fee.total * 1000).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="footer">
                <p>This report was generated by the Belgian Grid Fees Calculator</p>
                <p>gridfeessimulator.com</p>
            </div>

            <button class="print-btn" onclick="window.print()">🖨️ Print This Report</button>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
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

    const copyBtn = document.getElementById('copy-results-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const params = getFormData();
            const result = window.lastCalculationResult;
            if (result && !result.error) {
                copyResultsToClipboard(result, params);
            }
        });
    }

    const printBtn = document.getElementById('print-results-btn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            const params = getFormData();
            const result = window.lastCalculationResult;
            if (result && !result.error) {
                printResults(result, params);
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

// Dark Mode Functions
function toggleDarkMode() {
    const body = document.body;
    const icon = document.getElementById('dark-mode-icon');

    body.classList.toggle('dark-mode');

    const isDarkMode = body.classList.contains('dark-mode');

    // Update icon
    icon.textContent = isDarkMode ? '☀️' : '🌙';

    // Save preference
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

function loadDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode');
    const body = document.body;
    const icon = document.getElementById('dark-mode-icon');

    if (darkMode === 'enabled') {
        body.classList.add('dark-mode');
        if (icon) icon.textContent = '☀️';
    }

    // Auto-enable dark mode based on system preference if no preference saved
    if (!darkMode && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark-mode');
        if (icon) icon.textContent = '☀️';
        localStorage.setItem('darkMode', 'enabled');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initEnhancements();
        loadDarkModePreference();
    });
} else {
    initEnhancements();
    loadDarkModePreference();
}
