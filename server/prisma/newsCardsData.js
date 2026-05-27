/**
 * Generates 200 unique news cards for the game pool.
 * ~125 multi-stock (2+ tickers, mixed up/down) + ~75 single-stock.
 */

const STOCKS = ['AERO', 'GRNV', 'NXBK', 'PHRX', 'OILF', 'AGRI'];

const NAMES = {
  AERO: 'AeroCore',
  GRNV: 'GreenVolt',
  NXBK: 'NexBank',
  PHRX: 'PharmaCore',
  OILF: 'OilForge',
  AGRI: 'AgriHarvest',
};

const SINGLE_HEADLINES = {
  AERO: [
    '{co} wins major domestic route bundle from aviation regulator.',
    '{co} fleet expansion plan approved; delivery slots secured for next 18 months.',
    '{co} reports strongest quarterly passenger load factor in five years.',
    'Global airline safety audit flags maintenance gaps; {co} orders review.',
    '{co} faces class-action suit over delayed refunds on cancelled routes.',
    'Budget carriers cut fares; {co} warns on near-term yield pressure.',
    '{co} signs codeshare pact with international hub operator.',
    'Aviation turbine shortage eases; {co} upgrades full-year outlook.',
    '{co} cargo division hits record tonnage on e-commerce demand.',
    'Fuel hedging gains boost {co} margins despite ticket price cap talk.',
    '{co} cabin crew union votes to approve new wage agreement.',
    'Monsoon disruptions ease; {co} restores regional flight schedule.',
    '{co} unveils premium economy rollout across wide-body fleet.',
    'Air traffic control strike averted; {co} operations normalize.',
  ],
  GRNV: [
    '{co} secures 1.2GW solar park approvals across three states.',
    '{co} battery storage unit wins national grid stability pilot.',
    '{co} reports record inverter shipments on housing rooftop boom.',
    'Panel import duty review hurts margins; {co} guides cautiously.',
    '{co} signs green hydrogen offtake MOU with industrial buyers.',
    'State DISCOM payment delays weigh on {co} working capital.',
    '{co} wind-solar hybrid project reaches commercial operation.',
    'Carbon credit prices rally; {co} monetizes bundled REC portfolio.',
    '{co} lands EPC contract for corporate decarbonization campuses.',
    'Raw material costs fall; {co} raises FY margin guidance.',
    '{co} community solar program crosses two million subscribers.',
    'Grid congestion curtailment hits {co} near-term generation volumes.',
    '{co} partners with automaker on nationwide charging corridor.',
    'Renewable auction clears at premium; {co} wins largest tranche.',
  ],
  NXBK: [
    '{co} posts double-digit growth in retail deposit base.',
    '{co} digital lending book crosses milestone with lower NPAs.',
    '{co} launches UPI credit line for MSME merchants nationwide.',
    'RBI fines {co} over KYC lapses in select branches.',
    '{co} investment banking fees surge on IPO pipeline revival.',
    'Rate-sensitive treasury book drags {co} NIM this quarter.',
    '{co} partners with fintech on co-branded metal card launch.',
    'Festive season spending lifts {co} card transaction volumes 28%.',
    '{co} wealth management AUM crosses ₹50,000 crore mark.',
    'Cyber fraud incident contained; {co} reinforces payment rails.',
    '{co} rural microfinance arm reports improved collection efficiency.',
    'Wholesale funding costs spike; {co} pauses aggressive loan growth.',
    '{co} mobile banking app tops store charts after UX overhaul.',
    'Merger rumor involving {co} regional peer sparks volatility.',
  ],
  PHRX: [
    '{co} cancer therapy wins priority review from drug regulator.',
    '{co} Phase-2 diabetes candidate meets primary endpoint.',
    '{co} manufacturing plant receives USFDA inspection clearance.',
    'Patent cliff fears resurface for {co} legacy cardiovascular drug.',
    '{co} licenses antibody platform from European biotech.',
    'Clinical hold lifted on {co} rare disease trial.',
    '{co} domestic generic rivals undercut key chronic care brand.',
    'Vaccine cold-chain JV boosts {co} distribution reach.',
    '{co} R&D spend rises as pipeline enters late-stage wave.',
    'Pricing cap talk on essential medicines pressures {co}.',
    '{co} animal health division reports steady export growth.',
    'Adverse event report triggers probe into {co} trial site.',
    '{co} signs CRAMS supply deal with global pharma major.',
    'Institutional investors add {co} on oncology franchise optimism.',
  ],
  OILF: [
    '{co} refinery utilization hits 98% on strong domestic demand.',
    '{co} discovers promising offshore block in latest survey.',
    'OPEC+ supply cut extension lifts {co} realization per barrel.',
    '{co} pipeline leak contained; restart timeline announced.',
    '{co} retail fuel margin expands as marketing costs fall.',
    'Windfall tax review clouds {co} downstream profitability outlook.',
    '{co} signs long-term LNG import contract with Gulf supplier.',
    'Geopolitical risk premium fades; {co} guides lower near-term ASP.',
    '{co} petrochemical complex expansion on track for commissioning.',
    'Exploration dry well write-off dents {co} quarterly earnings.',
    '{co} biofuel blending mandate supports green diesel volumes.',
    'Currency moves favor {co} import cost structure this quarter.',
    '{co} wins fuel retail license batch in highway corridor states.',
    'Carbon levy proposal sparks debate on {co} capex plans.',
  ],
  AGRI: [
    '{co} basmati export orders surge on Middle East restocking.',
    '{co} drip irrigation kits see record sales in water-stressed districts.',
    'Unseasonal hail damages crop belt; {co} revises procurement forecast.',
    '{co} organic fertilizer line crosses one million farmer sign-ups.',
    'Minimum support price hike benefits {co} contract farming network.',
    'Pest outbreak in key states raises input cost for {co} growers.',
    '{co} cold storage expansion supports horticulture shelf life gains.',
    'Monsoon onset delay clouds {co} kharif sowing outlook.',
    '{co} agri-tech app usage doubles after regional language rollout.',
    'Export ban rumor on key commodity hits {co} sentiment.',
    '{co} seed hybrid trials show higher yield in drought zones.',
    'Warehouse receipt financing tie-up boosts {co} farmer liquidity.',
    '{co} food processing unit begins trial runs for ready-to-cook line.',
    'Commodity exchange volumes rally; {co} hedging book benefits.',
  ],
};

const MULTI_THEMES = [
  {
    headline:
      'Aviation fuel prices expected to rise further. Airlines under pressure as costs increase.',
    stocks: ['AERO', 'OILF'],
    deltas: { AERO: -16, OILF: 20 },
  },
  {
    headline:
      'Government announces major green energy push. Plans to reduce dependency on thermal power and fossil fuels.',
    stocks: ['GRNV', 'OILF', 'AERO'],
    deltas: { GRNV: 22, OILF: -14, AERO: -6 },
  },
  {
    headline:
      'Major policy change: Government increases defense budget by 18%. Focus on indigenous manufacturing.',
    stocks: ['AERO', 'OILF', 'NXBK'],
    deltas: { AERO: 18, OILF: 10, NXBK: 6 },
  },
  {
    headline:
      'Crude oil prices surge 12% due to geopolitical tensions. Fuel costs rise sharply.',
    stocks: ['OILF', 'AERO', 'GRNV'],
    deltas: { OILF: 24, AERO: -15, GRNV: -8 },
  },
  {
    headline:
      'Government announces 40% subsidy and tax benefits for Electric Vehicles. Major boost expected for EV manufacturers.',
    stocks: ['GRNV', 'AERO', 'OILF'],
    deltas: { GRNV: 20, AERO: 12, OILF: -10 },
  },
  {
    headline: 'Fuel costs squeeze airlines while oil producers rally on supply fears.',
    stocks: ['AERO', 'OILF', 'NXBK'],
    deltas: { AERO: -12, OILF: 16, NXBK: -5 },
  },
  {
    headline: 'RBI hikes repo rate 25 bps; banks gain while rate-sensitive pharma dips.',
    stocks: ['NXBK', 'PHRX'],
    deltas: { NXBK: 14, PHRX: -9 },
  },
  {
    headline: 'Weak monsoon forecast hits agri names; green energy names firm on policy support.',
    stocks: ['AGRI', 'GRNV'],
    deltas: { AGRI: -18, GRNV: 15 },
  },
  {
    headline: 'Oil spike lifts energy complex; aviation and renewables trade mixed.',
    stocks: ['OILF', 'AERO', 'GRNV'],
    deltas: { OILF: 19, AERO: -11, GRNV: 7 },
  },
  {
    headline: 'Banking sector stress test passed; oil and pharma see rotation outflows.',
    stocks: ['NXBK', 'OILF', 'PHRX'],
    deltas: { NXBK: 12, OILF: -8, PHRX: -6 },
  },
];

/** Pairwise multi templates — filled programmatically for volume */
const MULTI_PAIR_TEMPLATES = [
  ['{a} and {b} move opposite as sector rotation accelerates.', (s1, s2, d1, d2) => ({ [s1]: d1, [s2]: d2 })],
  ['Policy shift benefits {a} while {b} faces near-term headwinds.', (s1, s2, d1, d2) => ({ [s1]: d1, [s2]: d2 })],
  ['Supply chain shock: {a} rallies, {b} warns on margin compression.', (s1, s2, d1, d2) => ({ [s1]: d1, [s2]: d2 })],
  ['Earnings season surprise lifts {a}; {b} cuts guidance.', (s1, s2, d1, d2) => ({ [s1]: d1, [s2]: d2 })],
  ['Analyst day optimism for {a} overshadows {b} regulatory overhang.', (s1, s2, d1, d2) => ({ [s1]: d1, [s2]: d2 })],
];

const TRIPLE_TEMPLATES = [
  'Macro risk-off: {a} down, {b} up, {c} flat as investors reposition.',
  'Triple-sector rally led by {a}; {b} and {c} lag on stock-specific news.',
  'Composite index rebalancing favors {a} and {b}; pressure on {c}.',
  'Global cues lift {a}; profit booking in {b} and {c}.',
  'Budget follow-through: tailwind for {a}, headwind for {b} and {c}.',
];

function clampDelta(n) {
  return Math.max(-30, Math.min(30, n));
}

function pickDeltas(stocks, seed) {
  const deltas = {};
  const signs = [1, -1, 1, -1];
  stocks.forEach((stock, i) => {
    const base = 8 + ((seed + i * 7) % 18);
    const sign = signs[(seed + i) % signs.length];
    deltas[stock] = clampDelta(base * sign);
  });
  return deltas;
}

function buildSingleCards(seen) {
  const cards = [];
  let seed = 0;

  for (const ticker of STOCKS) {
    const templates = SINGLE_HEADLINES[ticker];
    const co = NAMES[ticker];

    for (const tpl of templates) {
      const headline = tpl.replace(/\{co\}/g, co);
      if (seen.has(headline)) continue;
      seen.add(headline);

      const sign = seed % 3 === 0 ? -1 : 1;
      const magnitude = clampDelta(10 + (seed % 19));
      cards.push({
        headline,
        affectedStocks: [ticker],
        priceDeltas: { [ticker]: magnitude * sign },
      });
      seed += 1;
    }
  }

  return cards;
}

function buildMultiFromThemes(seen) {
  const cards = [];
  for (const theme of MULTI_THEMES) {
    if (seen.has(theme.headline)) continue;
    seen.add(theme.headline);
    cards.push({
      headline: theme.headline,
      affectedStocks: theme.stocks,
      priceDeltas: theme.deltas,
    });
  }
  return cards;
}

function buildPairMultiCards(seen, targetCount) {
  const cards = [];
  let seed = 0;

  for (let i = 0; i < STOCKS.length; i += 1) {
    for (let j = i + 1; j < STOCKS.length; j += 1) {
      for (let t = 0; t < MULTI_PAIR_TEMPLATES.length; t += 1) {
        if (cards.length >= targetCount) return cards;

        const s1 = STOCKS[i];
        const s2 = STOCKS[j];
        const [tpl, deltaFn] = MULTI_PAIR_TEMPLATES[t];
        const d1 = clampDelta(10 + ((seed * 3) % 16)) * (seed % 2 === 0 ? 1 : -1);
        const d2 = clampDelta(10 + ((seed * 5) % 16)) * (seed % 3 === 0 ? -1 : 1);
        const headline = tpl
          .replace(/\{a\}/g, NAMES[s1])
          .replace(/\{b\}/g, NAMES[s2]);

        if (seen.has(headline)) {
          seed += 1;
          continue;
        }
        seen.add(headline);

        cards.push({
          headline,
          affectedStocks: [s1, s2],
          priceDeltas: deltaFn(s1, s2, d1, d2),
        });
        seed += 1;
      }
    }
  }

  return cards;
}

function buildTripleMultiCards(seen, targetCount) {
  const cards = [];
  let seed = 0;

  for (let i = 0; i < STOCKS.length; i += 1) {
    for (let j = i + 1; j < STOCKS.length; j += 1) {
      for (let k = j + 1; k < STOCKS.length; k += 1) {
        for (let t = 0; t < TRIPLE_TEMPLATES.length; t += 1) {
          if (cards.length >= targetCount) return cards;

          const s1 = STOCKS[i];
          const s2 = STOCKS[j];
          const s3 = STOCKS[k];
          const headline = TRIPLE_TEMPLATES[t]
            .replace(/\{a\}/g, NAMES[s1])
            .replace(/\{b\}/g, NAMES[s2])
            .replace(/\{c\}/g, NAMES[s3]);

          if (seen.has(headline)) {
            seed += 1;
            continue;
          }
          seen.add(headline);

          cards.push({
            headline,
            affectedStocks: [s1, s2, s3],
            priceDeltas: pickDeltas([s1, s2, s3], seed),
          });
          seed += 1;
        }
      }
    }
  }

  return cards;
}

function buildQuadMultiCards(seen, targetCount) {
  const cards = [];
  const quads = [
    ['AERO', 'GRNV', 'NXBK', 'PHRX'],
    ['OILF', 'AGRI', 'NXBK', 'GRNV'],
    ['PHRX', 'AGRI', 'AERO', 'OILF'],
    ['GRNV', 'OILF', 'NXBK', 'AERO'],
    ['AGRI', 'PHRX', 'GRNV', 'OILF'],
    ['NXBK', 'AERO', 'OILF', 'PHRX'],
  ];

  const headlines = [
    'Broad market selloff hits {a}, {b}; {c}, {d} hold defensive bid.',
    'Sector rotation: strength in {a} and {b}; weakness in {c} and {d}.',
    'Index heavyweight reshuffle lifts {a}, {c}; drags {b}, {d}.',
    'Global risk-on: {a} and {d} lead; {b} and {c} consolidate.',
    'Policy bundle supports {b} and {c}; oil and aviation mixed on {a}, {d}.',
    'Earnings cluster: beats at {a}, {c}; misses at {b}, {d}.',
    'Commodity complex ripples through {d}, {a}; financials {b}, {c} react.',
    'Monsoon and energy headlines cross-impact {c}, {d}, {a}, {b}.',
  ];

  let idx = 0;
  for (const quad of quads) {
    for (const tpl of headlines) {
      if (cards.length >= targetCount) return cards;
      const [s1, s2, s3, s4] = quad;
      const headline = tpl
        .replace(/\{a\}/g, NAMES[s1])
        .replace(/\{b\}/g, NAMES[s2])
        .replace(/\{c\}/g, NAMES[s3])
        .replace(/\{d\}/g, NAMES[s4]);

      if (seen.has(headline)) continue;
      seen.add(headline);

      cards.push({
        headline,
        affectedStocks: [s1, s2, s3, s4],
        priceDeltas: pickDeltas([s1, s2, s3, s4], idx++),
      });
    }
  }

  return cards;
}

function buildExtraSingleCards(seen, needed) {
  const cards = [];
  let n = 0;
  let round = 0;

  while (cards.length < needed) {
    for (const ticker of STOCKS) {
      if (cards.length >= needed) break;
      const co = NAMES[ticker];
      const headline = `${co} update #${round + 1}: management outlines strategic priorities for upcoming quarter.`;
      if (!seen.has(headline)) {
        seen.add(headline);
        const sign = (round + n) % 2 === 0 ? 1 : -1;
        cards.push({
          headline,
          affectedStocks: [ticker],
          priceDeltas: { [ticker]: clampDelta(8 + (round % 15)) * sign },
        });
      }
      n += 1;
    }
    round += 1;
  }

  return cards;
}

function buildNewsPool() {
  const seen = new Set();
  const TARGET = 200;
  const TARGET_MULTI = 125;
  const TARGET_SINGLE = 75;

  const singles = buildSingleCards(seen);
  let multi = [
    ...buildMultiFromThemes(seen),
    ...buildPairMultiCards(seen, 80),
    ...buildTripleMultiCards(seen, 50),
    ...buildQuadMultiCards(seen, 20),
  ];

  let singleCards = singles.slice(0, TARGET_SINGLE);
  if (singleCards.length < TARGET_SINGLE) {
    singleCards = [
      ...singleCards,
      ...buildExtraSingleCards(seen, TARGET_SINGLE - singleCards.length),
    ];
  }

  if (multi.length < TARGET_MULTI) {
    multi = [
      ...multi,
      ...buildPairMultiCards(seen, TARGET_MULTI - multi.length),
      ...buildTripleMultiCards(seen, TARGET_MULTI - multi.length),
    ];
  }
  multi = multi.slice(0, TARGET_MULTI);

  const all = [...multi, ...singleCards];

  if (all.length < TARGET) {
    const extra = buildExtraSingleCards(seen, TARGET - all.length);
    return [...all, ...extra].slice(0, TARGET);
  }

  return all.slice(0, TARGET);
}

const NEWS_CARDS = buildNewsPool();

function validatePool(cards) {
  const headlines = new Set();
  let multi = 0;
  let single = 0;

  for (const card of cards) {
    if (headlines.has(card.headline)) {
      throw new Error(`Duplicate headline: ${card.headline}`);
    }
    headlines.add(card.headline);

    const count = card.affectedStocks?.length || 0;
    if (count > 1) multi += 1;
    else if (count === 1) single += 1;
    else throw new Error(`Invalid affectedStocks: ${card.headline}`);
  }

  if (cards.length !== 200) {
    throw new Error(`Expected 200 cards, got ${cards.length}`);
  }
  if (multi < 5 || single < 3) {
    throw new Error(`Pool too small: multi=${multi}, single=${single}`);
  }

  return { total: cards.length, multi, single };
}

const POOL_STATS = validatePool(NEWS_CARDS);

module.exports = { NEWS_CARDS, POOL_STATS, buildNewsPool };
