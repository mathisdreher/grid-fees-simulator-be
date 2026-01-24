// Storage Index Data for Belgium
// Values are in k€ (thousands of euros)
// Source: Clean Horizon Storage Index

const storageIndexData = {
    // Storage Index calculation parameters
    parameters: {
        roundTripEfficiency: 0.85, // 85% at grid connection point
        cyclesPerDay: 1.5, // Clean Horizon's reference cycling constraint
        systemAvailability: 1.0, // 100%
    },

    // Monthly Storage Index values (k€)
    monthlyData: [
        // 2023
        { month: "Jan.2023", "1h": 341, "2h": 632, "4h": 638 },
        { month: "Feb.2023", "1h": 168, "2h": 313, "4h": 524 },
        { month: "Mar.2023", "1h": 257, "2h": 443, "4h": 467 },
        { month: "Apr.2023", "1h": 219, "2h": 372, "4h": 407 },
        { month: "May.2023", "1h": 231, "2h": 432, "4h": 458 },
        { month: "Jun.2023", "1h": 138, "2h": 256, "4h": 270 },
        { month: "Jul.2023", "1h": 242, "2h": 421, "4h": 457 },
        { month: "Aug.2023", "1h": 227, "2h": 391, "4h": 429 },
        { month: "Sep.2023", "1h": 204, "2h": 375, "4h": 404 },
        { month: "Oct.2023", "1h": 310, "2h": 584, "4h": 622 },
        { month: "Nov.2023", "1h": 230, "2h": 431, "4h": 447 },
        { month: "Dec.2023", "1h": 222, "2h": 417, "4h": 436 },

        // 2024
        { month: "Jan.2024", "1h": 171, "2h": 313, "4h": 328 },
        { month: "Feb.2024", "1h": 178, "2h": 315, "4h": 329 },
        { month: "Mar.2024", "1h": 243, "2h": 445, "4h": 482 },
        { month: "Apr.2024", "1h": 338, "2h": 629, "4h": 637 },
        { month: "May.2024", "1h": 457, "2h": 885, "4h": 921 },
        { month: "Jun.2024", "1h": 350, "2h": 665, "4h": 699 },
        { month: "Jul.2024", "1h": 343, "2h": 665, "4h": 729 },
        { month: "Aug.2024", "1h": 427, "2h": 828, "4h": 882 },
        { month: "Sep.2024", "1h": 354, "2h": 679, "4h": 705 },
        { month: "Oct.2024", "1h": 357, "2h": 678, "4h": 706 },
        { month: "Nov.2024", "1h": 219, "2h": 394, "4h": 430 },
        { month: "Dec.2024", "1h": 216, "2h": 411, "4h": 474 },

        // 2025
        { month: "Jan.2025", "1h": 145, "2h": 261, "4h": 312 },
        { month: "Feb.2025", "1h": 98, "2h": 173, "4h": 209 },
        { month: "Mar.2025", "1h": 119, "2h": 207, "4h": 276 },
        { month: "Apr.2025", "1h": 124, "2h": 207, "4h": 296 },
        { month: "May.2025", "1h": 178, "2h": 311, "4h": 420 },
        { month: "Jun.2025", "1h": 159, "2h": 289, "4h": 405 },
        { month: "Jul.2025", "1h": 237, "2h": 424, "4h": 483 },
        { month: "Aug.2025", "1h": 127, "2h": 220, "4h": 280 },
        { month: "Sep.2025", "1h": 126, "2h": 211, "4h": 280 },
        { month: "Oct.2025", "1h": 95, "2h": 161, "4h": 210 },
        { month: "Nov.2025", "1h": 63, "2h": 101, "4h": 130 },
        { month: "Dec.2025", "1h": 50, "2h": 82, "4h": 100 }
    ],

    // Calculate annualized value (if this month's performance continued all year)
    calculateAnnualizedValue: function(monthlyValue) {
        return monthlyValue * 12;
    },

    // Get average Storage Index for a year
    getYearlyAverage: function(year, duration) {
        const yearData = this.monthlyData.filter(d => d.month.includes(year.toString()));
        if (yearData.length === 0) return 0;

        const sum = yearData.reduce((acc, d) => acc + d[duration], 0);
        return sum / yearData.length;
    },

    // Get total Storage Index for a year
    getYearlyTotal: function(year, duration) {
        const yearData = this.monthlyData.filter(d => d.month.includes(year.toString()));
        if (yearData.length === 0) return 0;

        return yearData.reduce((acc, d) => acc + d[duration], 0);
    },

    // Calculate capturable value based on BESS parameters
    calculateCapturableValue: function(power_mw, duration_hours, cycles_per_day, efficiency) {
        // Find the appropriate duration index (1h, 2h, or 4h)
        let durationKey;
        if (duration_hours <= 1) {
            durationKey = "1h";
        } else if (duration_hours <= 2) {
            durationKey = "2h";
        } else {
            durationKey = "4h";
        }

        // Calculate the capturable value for each month
        return this.monthlyData.map(monthData => {
            // Base Storage Index value for the duration (k€/MW)
            const storageIndexValue = monthData[durationKey];

            // Capturable value = Storage Index × Power (MW)
            // Adjust for actual efficiency vs reference (85%)
            const efficiencyFactor = efficiency / this.parameters.roundTripEfficiency;

            // Adjust for actual cycles vs reference (1.5 cycles/day)
            const cyclesFactor = cycles_per_day / this.parameters.cyclesPerDay;

            const monthlyValue = storageIndexValue * power_mw * efficiencyFactor * cyclesFactor;
            const annualizedValue = this.calculateAnnualizedValue(monthlyValue);

            return {
                month: monthData.month,
                durationUsed: durationKey,
                storageIndex: storageIndexValue,
                monthlyValue: monthlyValue,
                annualizedValue: annualizedValue
            };
        });
    },

    // Get the most recent 12 months total
    getRecentYearTotal: function(duration) {
        const recent12 = this.monthlyData.slice(-12);
        return recent12.reduce((acc, d) => acc + d[duration], 0);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = storageIndexData;
}
