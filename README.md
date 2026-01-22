# Belgian Grid Fees Calculator 2026

A Python-based web application to calculate Belgian electricity grid fees for 2026, deployable on Vercel.

## Features

- 🔌 Support for all Belgian DSOs/TSOs: Elia, Fluvius, Sibelga, Ores, Resa
- 📊 Comprehensive fee calculation including:
  - Fixed fees
  - Contracted capacity fees
  - Peak demand fees (monthly and yearly)
  - Volumetric fees
  - Other applicable fees
- 🔋 BESS (Battery Energy Storage System) exemptions support
- 💰 Real-time calculation with detailed breakdown
- 📱 Responsive, modern UI
- 🚀 Serverless deployment on Vercel

## Project Structure

```
gridfees-simulator/
├── api/
│   ├── calculate.py       # Main calculation API endpoint
│   ├── options.py         # Options/configuration API endpoint
│   └── data.json          # Grid fees database (from Excel)
├── public/
│   ├── index.html         # Main HTML page
│   └── app.js             # Frontend JavaScript
├── vercel.json            # Vercel configuration
├── requirements.txt       # Python dependencies
└── README.md              # This file
```

## Deployment to Vercel

### Prerequisites

1. Install [Vercel CLI](https://vercel.com/docs/cli):
   ```bash
   npm install -g vercel
   ```

2. Create a [Vercel account](https://vercel.com/signup) if you don't have one

### Deploy Steps

1. **Navigate to the project directory:**
   ```bash
   cd gridfees-simulator
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? Press Enter or provide a name
   - In which directory is your code located? **/** (current directory)

4. **Deploy to production:**
   ```bash
   vercel --prod
   ```

Your application will be live at: `https://your-project-name.vercel.app`

### Alternative: Deploy via GitHub

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Vercel will auto-detect the configuration
6. Click "Deploy"

## Local Development

To test locally before deployment:

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run with Vercel dev server:**
   ```bash
   vercel dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Usage

1. **Select DSO/TSO**: Choose your distribution/transmission system operator
2. **Select Region**: (Fluvius only) Choose your region
3. **Select Voltage Level**: Choose your connection voltage level
4. **Select Connection Type**: Choose Post/Grid/Main/Backup as applicable
5. **Enter Energy Values**:
   - Annual offtake consumption (MWh/year)
   - Annual injection (MWh/year)
6. **Enter Demand Values**:
   - Monthly peak demand (MW)
   - Annual peak demand (MW)
   - Contracted capacity (MVA)
7. **BESS Option**: Check if this is a Battery Energy Storage System
8. **Calculate**: Click the button to see results

## Data Source

The grid fees data is sourced from the `GridFees_BE2026.xlsx` file and includes:

- **DSO/TSO Operators**: Elia, Fluvius, Sibelga, Ores, Resa
- **Fluvius Regions**: Antwerpen, Halle-Vilvoorde, Kempen, Limburg, Midden-Vlaanderen, West, Zenne-Dijle, Imewo
- **Voltage Levels**: Various from 1-26 kV up to 110-380 kV
- **Connection Types**: Post, Grid, Main, Backup (depending on DSO)
- **BESS Exemptions**: Reduced rates for battery storage systems

## API Endpoints

### GET /api/options
Returns available configuration options (DSOs, regions, voltage levels, connection types)

### POST /api/calculate
Calculates grid fees based on provided parameters

**Request Body:**
```json
{
  "dso_tso": "Fluvius",
  "region": "Antwerpen",
  "voltage": "26-36 kV",
  "connection_type": "Post",
  "offtake_energy": 1000,
  "injection_energy": 500,
  "peak_monthly": 1.5,
  "peak_yearly": 2.0,
  "contracted_capacity": 1.0,
  "is_bess": false
}
```

**Response:**
```json
{
  "success": true,
  "total_injection": 123.45,
  "total_offtake": 234.56,
  "total": 358.01,
  "breakdown": {...},
  "configuration": {...}
}
```

## Technology Stack

- **Backend**: Python (serverless functions)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Deployment**: Vercel
- **Data Format**: JSON (converted from Excel)

## Notes

- All fees are in k€ (thousands of euros) and exclude VAT
- The calculator uses 2026 Belgian grid fee structures
- BESS exemptions are automatically applied when the BESS checkbox is selected
- Different multipliers apply for different DSOs (Elia, Fluvius, Sibelga, Ores, Resa)

## Support

For issues or questions about:
- **Data accuracy**: Verify against official DSO/TSO tariff publications
- **Deployment**: Check [Vercel Documentation](https://vercel.com/docs)
- **Bugs**: Create an issue in the repository

## License

This tool is for informational purposes only. Always verify calculations with official DSO/TSO documentation.

---

Created for Flexcity Belgium - Energy Flexibility Services
