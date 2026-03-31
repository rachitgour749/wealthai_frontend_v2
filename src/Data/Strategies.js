export const strategies = [
  {
    id: 'etf-strategy',
    name: 'ETF Rotation',
    description: 'Mean Reversion & Low Volatility ETFs rotation strategy',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    borderColor: 'border-emerald-400',
    available: true,
    category: 'Active',
    tags: ['Mean Reversion', 'Low Volatility']
  },
  {
    id: 'stock-strategy',
    name: 'Stock Rotation',
    description: 'Mean Reversion & Low Volatility Stocks rotation strategy',
    gradient: 'from-orange-200 to-orange-300',
    borderColor: 'border-orange-200',
    available: false,
    category: 'Active',
    tags: ['Mean Reversion', 'Low Volatility']
  },
  {
    id: 'RS-ETF-strategy',
    name: 'RS ETF',
    description: 'Relative Strength based ETF trading strategy',
    gradient: 'from-purple-200 to-purple-300',
    borderColor: 'border-purple-200',
    available: true,
    category: 'Active',
    tags: ['Momentum-based', 'Trend Following']
  },
  {
    id: 'RS-strategy',
    name: 'RS Stock',
    description: 'Relative Strength based stock trading strategy',
    gradient: 'from-blue-200 to-blue-300',
    borderColor: 'border-blue-200',
    available: false,
    category: 'Active',
    tags: ['Momentum-based', 'Trend Following']
  },

  {
    id: 'SuperTrend',
    name: 'SuperTrend Strategy',
    description: 'Momentum-based Trend Following System using SuperTrend indicator',
    gradient: 'from-rose-200 to-rose-300',
    borderColor: 'border-rose-200',
    available: false,
    category: 'Active',
    tags: ['Momentum-based', 'Trend Following']
  },
  {
    id: 'etf-strategy-payout',
    name: 'ETF Rotation Payout',
    description: 'Mean Reversion & Low Volatility ETFs rotation strategy',
    gradient: 'from-orange-200 to-orange-300',
    borderColor: 'border-orange-200',
    available: true,
    category: 'Active',
    tags: ['Mean Reversion', 'Low Volatility']
  },
  {
    id: 'etf-strategy-us',
    name: 'ETF US Rotation',
    description: 'Mean Reversion & Low Volatility ETFs rotation strategy',
    gradient: 'from-cyan-200 to-cyan-300',
    borderColor: 'border-cyan-200',
    available: true,
    category: 'Active',
    tags: ['Mean Reversion', 'Low Volatility']
  },
  {
    id: 'adaptive-trend',
    name: 'Adaptive Trend Following',
    description: 'Self-adjusting trend identification with ML optimization',
    gradient: 'from-emerald-200 to-emerald-300',
    borderColor: 'border-emerald-200',
    available: false,
    tags: ['Trend Following', 'Momentum-based']
  },
  {
    id: 'ml-breakouts',
    name: 'ML Breakout Detection',
    description: 'Machine learning powered breakout pattern recognition',
    gradient: 'from-amber-200 to-amber-300',
    borderColor: 'border-amber-200',
    available: false,
    tags: ['Momentum-based']
  },
  {
    id: 'dynamic-risk',
    name: 'Dynamic Risk Parity',
    description: 'Real-time risk allocation using volatility forecasting',
    gradient: 'from-indigo-200 to-indigo-300',
    borderColor: 'border-indigo-200',
    available: false,
    tags: ['Low Volatility']
  },
  {
    id: 'algo-pairs',
    name: 'Algorithmic Pairs Trading',
    description: 'Statistical arbitrage with cointegration analysis',
    gradient: 'from-rose-200 to-rose-300',
    borderColor: 'border-rose-200',
    available: false,
    tags: ['Mean Reversion']
  },
  {
    id: 'dl-volatility',
    name: 'Deep Learning Volatility',
    description: 'Neural networks for volatility trading and hedging',
    gradient: 'from-violet-200 to-violet-300',
    borderColor: 'border-violet-200',
    available: false,
    tags: ['Low Volatility', 'Mean Reversion']
  },
  {
    id: 'etf-swing-strategy',
    name: 'ETF Swing Strategy',
    description: 'Swing trading strategy for ETFs based on SMA and percentage thresholds',
    gradient: 'from-blue-300 via-indigo-400 to-blue-700',
    borderColor: 'border-blue-400',
    available: true,
    category: 'Active',
    tags: ['Mean Reversion', 'Trend Following']
  }
]