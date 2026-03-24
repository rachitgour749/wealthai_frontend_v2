export const bestCombinations = [
    {
        id: 1,
        name: "Rank 1",
        strategy_type: "International_ETF_Rotation",
        tickers: ['QQQ', 'SPY', 'IWM', 'VGT', 'GLD', 'SLV'],
        startDate: "2023-11-23",
        endDate: "2026-01-23",
        metrics: {
            totalReturn: "78.18%",
            cagr: "30.52%",
            maxDrawdown: "-13.78%"
        },
        parameters: {
            accumulationWeeks: 52,
            totalCapitalPerWeek: 50000,
            brokerage: 0.01,
            riskFreeRate: 4.5
        }
    },
    {
        id: 2,
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
        id: 3,
        name: "Rank 1",
        strategy_type: "ETF_Rotation",
        tickers: ['INFRABEES', 'SILVERBEES', 'MAFANG', 'GOLDBEES', 'JUNIORBEES', 'HNGSNGBEES'],
        startDate: "2023-02-10",
        endDate: "2026-01-23",
        metrics: {
            totalReturn: "178.17%",
            cagr: "41.75%",
            maxDrawdown: "-6.91%"
        },
        parameters: {
            accumulationWeeks: 42,
            totalCapitalPerWeek: 50000,
            brokerage: 0.1,
            riskFreeRate: 6
        }
    },
    {
        id: 4,
        name: "Rank 2",
        strategy_type: "ETF_Rotation",
        tickers: ['INFRABEES', 'MON100', 'MAFANG', 'GOLDBEES', 'JUNIORBEES', 'BANKBEES'],
        startDate: "2022-05-20",
        endDate: "2026-01-23",
        metrics: {
            totalReturn: "148.20%",
            cagr: "28.19%",
            maxDrawdown: "-6.98%"
        },
        parameters: {
            accumulationWeeks: 52,
            totalCapitalPerWeek: 50000,
            brokerage: 0.1,
            riskFreeRate: 6
        }
    },
    {
        id: 5,
        name: "Rank 3",
        strategy_type: "ETF_Rotation",
        tickers: ['MON100', 'PSUBNKBEES', 'MAFANG', 'HNGSNGBEES', 'GOLDBEES', 'JUNIORBEES', 'NIFTYBEES', 'BANKBEES', 'CPSEETF'],
        startDate: "2023-02-10",
        endDate: "2026-01-23",
        metrics: {
            totalReturn: "128.06%",
            cagr: "25.26%",
            maxDrawdown: "-5.08%"
        },
        parameters: {
            accumulationWeeks: 52,
            totalCapitalPerWeek: 50000,
            brokerage: 0.2,
            riskFreeRate: 6
        }
    },
    {
        id: 6,
        name: "Rank 1",
        strategy_type: "ETF_Payout",
        tickers: ['INFRABEES', 'SILVERBEES', 'MAFANG', 'GOLDBEES', 'JUNIORBEES', 'HNGSNGBEES'],
        startDate: "2023-02-10",
        endDate: "2026-01-23",
        metrics: {
            totalReturn: "108.62%",
            cagr: "28.47%",
            maxDrawdown: "-10.11%",
            totalWithdrawlAmount: "950000"
        },
        parameters: {
            accumulationWeeks: 42,
            totalCapitalPerWeek: 50000,
            withdrawAmountPerWeek: 10000,
            payoutStartWeek: 60,
            brokerage: 0.1,
            riskFreeRate: 6
        }
    },
    {
        id: 7,
        name: "Rank 2",
        strategy_type: "ETF_Payout",
        tickers: ['INFRABEES', 'MON100', 'MAFANG', 'GOLDBEES', 'JUNIORBEES', 'BANKBEES'],
        startDate: "2022-05-20",
        endDate: "2026-01-23",
        metrics: {
            totalReturn: "95.52%",
            cagr: "20.10%",
            maxDrawdown: "-07.25%",
            totalWithdrawlAmount: "700000"
        },
        parameters: {
            accumulationWeeks: 52,
            totalCapitalPerWeek: 50000,
            withdrawAmountPerWeek: 5000,
            payoutStartWeek: 53,
            brokerage: 0.1,
            riskFreeRate: 6
        }
    },
    {
        id: 8,
        name: "Rank 1",
        strategy_type: "RS_ETF_Rotation",
        tickers: ['NIFTYBEES', 'GOLDBEES', 'BANKBEES', 'HNGSNGBEES', 'SILVERBEES', 'CPSEETF', 'PHARMABEES'],
        startDate: "2022-05-20",
        endDate: "2026-01-23",
        metrics: {
            totalReturn: "101.67%",
            cagr: "21.12%",
            maxDrawdown: "-4.99%"
        },
        parameters: {
            noOfPositions: 4,
            totalCapital: 1000000,
            stopLoss: 15,
            bufferCapital: 10,
            brokerage: 0.1,
            riskFreeRate: 6,
            compoundingThreshold: 25
        }
    },
    {
        id: 9,
        name: "Rank 2",
        strategy_type: "RS_ETF_Rotation",
        tickers: ['ITBEES', 'MON100', 'GOLDBEES', 'PSUBNKBEES', 'CPSEETF', 'MID150BEES', 'JUNIERBEES', 'INFRABEES'],
        startDate: "2022-04-01",
        endDate: "2026-01-23",
        metrics: {
            totalReturn: "91.17%",
            cagr: "18.62%",
            maxDrawdown: "-12.79%"
        },
        parameters: {
            noOfPositions: 4,
            totalCapital: 1000000,
            stopLoss: 15,
            bufferCapital: 10,
            brokerage: 0.1,
            riskFreeRate: 6,
            compoundThreshold: 25
        }
    }
];
