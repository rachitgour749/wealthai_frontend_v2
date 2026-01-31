export const bestCombinations = [
    {
        id: 1,
        name: "US Growth Leaders",
        strategy_type: "International_ETF_Rotation",
        tickers: ["VTI", "VOO", "QQQ"],
        startDate: "2020-01-01",
        endDate: "2023-12-31",
        metrics: {
            totalReturn: "58.4%",
            cagr: "15.2%",
            maxDrawdown: "-12.5%"
        },
        parameters: {
            accumulationWeeks: 52,
            totalCapitalPerWeek: 50000,
            brokerage: 0.01,
            riskLevel: 0.08
        }
    },
    {
        id: 2,
        name: "Safe Haven Blend",
        strategy_type: "International_ETF_Rotation",
        tickers: ["VTI", "AGG", "BND"],
        startDate: "2019-06-01",
        endDate: "2023-06-01",
        metrics: {
            totalReturn: "24.5%",
            cagr: "6.8%",
            maxDrawdown: "-4.2%"
        },
        parameters: {
            accumulationWeeks: 104,
            totalCapitalPerWeek: 25000,
            brokerage: 0.005,
            riskLevel: 0.04
        }
    },
    {
        id: 3,
        name: "Bluechip Momentum",
        strategy_type: "Stock_Rotation",
        tickers: ["RELIANCE", "TCS", "HDFCBANK"],
        startDate: "2021-01-01",
        endDate: "2023-12-31",
        metrics: {
            totalReturn: "38.2%",
            cagr: "12.8%",
            maxDrawdown: "-10.5%"
        },
        parameters: {
            accumulationWeeks: 52,
            totalCapitalPerWeek: 50000,
            brokerage: 0,
            riskFreeRate: 6
        }
    },
    {
        id: 4,
        name: "ETF Alpha",
        strategy_type: "ETF_Rotation",
        tickers: ["NIFTYBEES", "JUNIORBEES", "BANKBEES"],
        startDate: "2020-01-01",
        endDate: "2023-12-31",
        metrics: {
            totalReturn: "45.6%",
            cagr: "14.1%",
            maxDrawdown: "-8.9%"
        },
        parameters: {
            accumulationWeeks: 52,
            totalCapitalPerWeek: 30000,
            brokerage: 0,
            riskFreeRate: 6
        }
    }
];
