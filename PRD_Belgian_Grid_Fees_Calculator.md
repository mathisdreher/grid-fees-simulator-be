# Product Requirements Document (PRD)
# Belgian Grid Fees Calculator Web Application

**Version:** 1.0  
**Date:** January 23, 2026  
**Author:** Flexcity Product Team  
**Status:** Draft

---

## 1. Executive Summary

This PRD outlines the requirements for a web application that calculates Belgian electricity grid fees for different grid operators, voltage levels, and connection types. The application has a particular focus on Battery Energy Storage Systems (BESS), including applicable regulatory exemptions. The tool provides a user-friendly web interface for both internal use and potential customer-facing scenarios.

---

## 2. Problem Statement

Currently, Flexcity needs a streamlined way to calculate Belgian grid fees for various connection configurations. This application addresses several needs:

- **Accessibility:** Web-based access without requiring specialized software
- **Scalability:** Difficult to use with multiple stakeholders simultaneously
- **Maintenance:** Formula updates require manual distribution
- **User Experience:** Complex navigation across multiple sheets
- **Integration:** Cannot be embedded into sales processes or customer portals

---

## 3. Goals & Objectives

### Primary Goals
1. Provide an intuitive web interface for calculating Belgian grid fees
2. Support all Belgian grid operators (Elia, Fluvius, Sibelga, Ores, Resa)
3. Automatically apply BESS-specific exemptions when applicable
4. Display cost breakdowns with clear visualizations

### Success Metrics
- Calculation accuracy: Validated against DSO/TSO tariff regulations
- User task completion: < 60 seconds from landing to result
- Internal adoption: 80% of sales team using within 3 months

---

## 4. Scope

### In Scope
- Grid fee calculations for all Belgian DSOs/TSO
- BESS exemption handling
- Cost breakdown visualization
- Downloadable results (PDF export)
- Responsive design (desktop + tablet)

### Out of Scope (v1.0)
- User authentication/accounts
- Historical calculation storage
- API access for third-party integrations
- Multi-language support (English only in v1.0)
- Connection fee calculations (one-time fees)
- VAT calculations

---

## 5. User Personas

### Primary: Flexcity Sales Representative
**Profile:** Business development professional selling energy flexibility services  
**Needs:** Quick fee estimates during client meetings, comparison across connection options  
**Pain Points:** Currently needs specialized knowledge and tools to provide estimates

### Secondary: Energy Project Developer
**Profile:** External partner evaluating BESS project economics  
**Needs:** Accurate grid fee projections for business case development  
**Pain Points:** Lacks visibility into complex tariff structures

---

## 6. Functional Requirements

### 6.1 Input Parameters

| Parameter | Type | Required | Options/Constraints |
|-----------|------|----------|---------------------|
| Grid Operator (DSO/TSO) | Dropdown | Yes | Elia, Fluvius, Sibelga, Ores, Resa |
| Region | Dropdown | Conditional | Required for Fluvius only (8 regions: Antwerpen, Halle-Vilvoorde, Kempen, Limburg, Midden-Vlaanderen, West, Zenne-Dijle, Imewo) |
| Voltage Level | Dropdown | Yes | Operator-dependent options (see Section 6.2) |
| Connection Type | Dropdown | Conditional | Post/Grid (Fluvius, Ores, Resa), Main/Backup (Sibelga), N/A (Elia) |
| Yearly Consumption - Offtake | Number | Yes | MWh/year, min: 0 |
| Yearly Consumption - Injection | Number | Yes | MWh/year, min: 0 |
| Monthly Peak Demand | Number | Yes | MW, min: 0 |
| Annual Peak Demand | Number | Yes | MW, min: 0 |
| Contracted Capacity | Number | Yes | MVA, min: 0 |
| Apply BESS Exemptions | Toggle | Yes | Default: On |

### 6.2 Operator-Specific Voltage Levels

| Operator | Voltage Levels |
|----------|----------------|
| Elia | 110-380 kV, 30-70 kV, Transfo < 30 kV |
| Fluvius | 26-36 kV, 1-26 kV |
| Sibelga | 1-26 kV |
| Ores | MT (Medium Tension) |
| Resa | MT (Medium Tension) |

### 6.3 Fee Calculation Components

The calculator must compute the following fee categories for both **Offtake** and **Injection**:

| Fee Type | Unit | Description |
|----------|------|-------------|
| Fixed | k€/year | Annual fixed charges (data management fees) |
| Contracted Capacity | k€/MVA/year | Based on contracted access capacity |
| Peak Monthly | k€/MW/year | Based on monthly peak demand measurements |
| Peak Yearly | k€/MW/year | Based on annual peak demand measurements |
| Volumetric | k€/MWh | Based on energy consumed/injected |
| Other | k€/MWh | PSO, surcharges, and other levies |

### 6.4 BESS Exemptions Logic

When BESS exemptions are enabled, apply multipliers per operator:

**Elia (100% exemption for new storage facilities):**
- Offtake Peak Monthly: 0% (exempt)
- Offtake Peak Yearly: 0% (exempt)
- Offtake Volumetric: 0% (exempt)
- Offtake Other: 0% (exempt)
- Injection Peak Yearly: 0% (exempt)
- Injection Other: 0% (exempt)

**Fluvius:**
- Offtake Contracted: 20% of standard rate
- Offtake Peak Monthly: 20% of standard rate
- Offtake Volumetric: 0% (exempt)
- Offtake Other: 0% (exempt)

**Sibelga:**
- No BESS-specific exemptions (100% of all fees apply)

**Resa:**
- All injection fees: 0% (exempt)
- Offtake Contracted: 0% (exempt)

**Ores:**
- All injection fees: 0% (exempt)
- Offtake Volumetric: 15% of standard rate
- Offtake Other: 15% of standard rate

### 6.5 Output Display

#### Summary View
- **Total Annual Cost** (k€/year) - Large, prominent display
- **Cost with Exemptions** vs **Cost without Exemptions** comparison
- **Savings from Exemptions** (k€/year and percentage)

#### Detailed Breakdown Table
| Category | Offtake Cost | Injection Cost | Total |
|----------|--------------|----------------|-------|
| Fixed Fees | X k€ | X k€ | X k€ |
| Contracted Capacity | X k€ | X k€ | X k€ |
| Peak Monthly | X k€ | X k€ | X k€ |
| Peak Yearly | X k€ | X k€ | X k€ |
| Volumetric | X k€ | X k€ | X k€ |
| Other | X k€ | X k€ | X k€ |
| **TOTAL** | **X k€** | **X k€** | **X k€** |

#### Visualization
- Bar chart comparing cost components
- Optional: Pie chart showing cost distribution

### 6.6 BESS Quick Calculator (Secondary Feature)

Pre-configured input mode for standard BESS scenarios:
- Input: BESS Size (MW), Duration (hours), Cycles per day, Efficiency (%)
- Auto-calculates: Yearly consumption, peak demands based on BESS parameters

**Formula:**
```
Yearly Offtake (MWh) = BESS Size (MW) × Duration (h) × Cycles/day × 365
Yearly Injection (MWh) = Yearly Offtake × Efficiency
Peak Demand (MW) = BESS Size (MW)
```

### 6.7 Export Functionality

- **PDF Export:** Summary report with inputs, outputs, and methodology notes
- **PDF Export:** Detailed breakdown in professional report format
- **Copy to Clipboard:** Quick copy of summary results

---

## 7. Non-Functional Requirements

### 7.1 Performance
- Page load time: < 2 seconds
- Calculation response: < 500ms
- Support 100 concurrent users minimum

### 7.2 Compatibility
- Modern browsers: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Responsive design: Desktop (1200px+), Tablet (768px-1199px)
- Mobile view: Functional but not optimized (v1.0)

### 7.3 Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatible

### 7.4 Security
- HTTPS only
- No sensitive data stored (calculations are stateless)
- Rate limiting on API endpoints

---

## 8. Technical Architecture

### 8.1 Recommended Stack

**Frontend:**
- React.js or Next.js
- Tailwind CSS for styling
- Recharts or Chart.js for visualizations

**Backend:**
- Python (FastAPI or Flask) OR Node.js
- JSON-based fee database
- No database required for v1.0 (stateless)

**Deployment:**
- Vercel or Netlify (frontend)
- Railway or Render (backend API)
- Or: Single Next.js app with API routes

### 8.2 Data Model

```json
// fees_database.json
{
  "configurations": [
    {
      "key": "Elia - 110-380",
      "operator": "Elia",
      "region": null,
      "voltageLevel": "110-380 kV",
      "connectionType": null,
      "fees": {
        "injection": {
          "fixed": 0,
          "contracted": 0,
          "peakMonthly": 0,
          "peakYearly": 0,
          "volumetric": 0,
          "other": 0
        },
        "offtake": {
          "fixed": 0,
          "contracted": 7.5485,
          "peakMonthly": 4.74,
          "peakYearly": 9.826,
          "volumetric": 0.002595,
          "other": 0
        }
      }
    }
    // ... additional configurations
  ],
  "bessExemptions": {
    "Elia": {
      "injectionFixed": 1.0,
      "injectionContracted": 1.0,
      "injectionPeakMonthly": 1.0,
      "injectionPeakYearly": 0.0,
      "injectionVolumetric": 1.0,
      "injectionOther": 0.0,
      "offtakeFixed": 1.0,
      "offtakeContracted": 1.0,
      "offtakePeakMonthly": 0.0,
      "offtakePeakYearly": 0.0,
      "offtakeVolumetric": 0.0,
      "offtakeOther": 0.0
    }
    // ... other operators
  }
}
```

---

## 9. User Interface Design

### 9.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Belgian Grid Fees Calculator          [Flexcity]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │   INPUT PANEL       │  │   RESULTS PANEL             │  │
│  │                     │  │                             │  │
│  │  Operator: [____▼]  │  │   TOTAL ANNUAL COST         │  │
│  │  Region:   [____▼]  │  │   ┌─────────────────────┐   │  │
│  │  Voltage:  [____▼]  │  │   │    €24,955 /year    │   │  │
│  │  Connection:[___▼]  │  │   └─────────────────────┘   │  │
│  │                     │  │                             │  │
│  │  ─── Consumption ── │  │   Without exemptions:       │  │
│  │  Offtake:  [____]   │  │   €62,380 /year             │  │
│  │  Injection:[____]   │  │   Savings: €37,425 (60%)    │  │
│  │                     │  │                             │  │
│  │  ─── Peak Demand ── │  │   ┌─────────────────────┐   │  │
│  │  Monthly:  [____]   │  │   │  [BAR CHART]        │   │  │
│  │  Annual:   [____]   │  │   │                     │   │  │
│  │                     │  │   └─────────────────────┘   │  │
│  │  Contracted: [___]  │  │                             │  │
│  │                     │  │   [Detailed Breakdown ▼]    │  │
│  │  [✓] BESS Exemptions│  │                             │  │
│  │                     │  │   [Export PDF] [Export XLS] │  │
│  │  ─── BESS Mode ──── │  │                             │  │
│  │  [Toggle BESS Mode] │  │                             │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  FOOTER: Methodology Notes | Disclaimer | Flexcity 2026    │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Key UI/UX Principles

1. **Progressive Disclosure:** Show region/connection dropdowns only when relevant
2. **Real-time Calculation:** Update results as user types (debounced)
3. **Clear Feedback:** Highlight which exemptions are being applied
4. **Contextual Help:** Tooltips explaining each fee component
5. **Error Prevention:** Validate inputs with clear error messages

---

## 10. Methodology Notes (In-App Documentation)

Include the following disclaimers and explanations:

### Important Notes:
- All calculations exclude VAT
- Actual grid fees may vary based on specific contractual arrangements
- BESS exemptions apply to new storage facilities commissioned after July 1, 2018
- Peak demand calculations follow specific measurement rules per operator

### Costs Not Included:
- Fees for reactive energy
- Fees for exceeding access power
- Imbalance compensation tariffs (Elia)
- Market integration fees (Elia)
- One-time connection fees

### Peak Calculation Methodology:
**Elia Monthly Peak:** Applied to the 11th measured peak of the month. Quarter-hours during peak demand-reduction period (April-September, weekends, 10am-7pm) are excluded.

**Elia Annual Peak:** Applied to highest measured peak during annual peak period (Jan-Mar, Nov-Dec, 5pm-8pm, excluding weekends/holidays) after excluding the 10 highest monthly peaks.

---

## 11. Implementation Phases

### Phase 1: MVP (4 weeks)
- Core calculator with all operators
- Basic BESS exemptions
- Simple results display
- PDF export

### Phase 2: Enhanced (2 weeks)
- BESS quick calculator mode
- Improved visualizations
- PDF export
- Mobile optimization

### Phase 3: Polish (2 weeks)
- Performance optimization
- Accessibility audit
- User testing feedback implementation
- Documentation

---

## 12. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Tariff data becomes outdated | High | High | Implement admin interface for easy updates; version data with effective dates |
| Calculation discrepancies | High | Medium | Comprehensive testing against DSO/TSO regulations; edge case documentation |
| Low user adoption | Medium | Medium | Training sessions; embed in existing workflows |
| Regulatory changes | Medium | Medium | Modular architecture for easy fee structure updates |

---

## 13. Future Considerations (v2.0+)

- **Multi-language support:** French, Dutch, German
- **User accounts:** Save and compare scenarios
- **API access:** Integration with CRM and proposal tools
- **Historical tariffs:** Compare across years
- **Additional countries:** Netherlands, Germany expansion
- **Advanced BESS modeling:** Degradation, multiple cycling scenarios

---

## 14. Appendix

### A. Complete Fee Database Reference

The web application must support all 41 unique configurations from the source data:
- 3 Elia configurations
- 32 Fluvius configurations (8 regions × 2 voltage levels × 2 connection types)
- 2 Sibelga configurations
- 2 Resa configurations
- 2 Ores configurations

### B. Source Data Reference

Data sources: Belgian DSO/TSO official tariffs (2026)
- Tariff rates for all operators
- BESS exemption multipliers by operator
- Valid connection type combinations per operator

---

**Document Approval:**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Tech Lead | | | |
| Sales Lead | | | |
