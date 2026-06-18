# BornToTrade Challenge

A live, multiplayer **stock market simulation** built for events, workshops, and brand activations. Participants trade fictional stocks in real time, react to breaking news, and compete for the highest profit — all from their phone browser.

Powered by **FYERS** branding. No real money. No app install required.

---

## What participants experience

| Step | Screen | What happens |
|------|--------|----------------|
| 1 | **Welcome** | Tap **Tap To Start** on the BornToTrade Challenge splash |
| 2 | **Instruction** | Short rules: starting cash, how to buy/sell, news headlines, 120-second round |
| 3 | **Register** | Enter name and mobile number → **SMS verification** → continue |
| 4 | **Instruction** | Review rules again, then **Continue to room** |
| 5 | **Room** | Enter the **4-letter room code** from the host and join |
| 6 | **Waiting room** | See who has joined; wait until the host starts the game |
| 7 | **Live trading** | Buy and sell shares as **breaking news** moves stock prices |
| 8 | **Game over** | Winner reveal; return to **Room** (still signed in) |

**Next rounds at the same event:** Room → optional **Instructions** (Close returns to Room) → join with a new code → play again. **No second SMS** unless the player taps **Log out**.

---

## Player journey (visual)

### First time

```
┌─────────┐   ┌──────────────┐   ┌──────────┐   ┌──────────────┐   ┌────────┐
│ Welcome │ → │ Instruction  │ → │ Register │ → │ Instruction  │ → │  Room  │
│  Splash │   │   (rules)    │   │ + SMS OTP│   │ Continue…    │   │ (code) │
└─────────┘   └──────────────┘   └──────────┘   └──────────────┘   └───┬────┘
                                                                          │
                    ┌─────────────┐   ┌────────────┐                      ▼
                    │ Live trading│ ← │  Waiting   │ ←──────────────────────┘
                    │ 120 seconds │   │   room     │
                    └──────┬──────┘   └────────────┘
                           │
                           ▼
                    ┌─────────┐
                    │  Room   │  ← same player, same login
                    └─────────┘
```

### Returning during the event (already verified)

```
┌─────────┐   ┌────────┐   ┌─────────────┐   ┌────────────┐   ┌─────────┐
│ Welcome │ → │  Room  │ → │ Instruction │ → │  Room      │ → │  Game   │ → …
│ (skip)  │   │ (code) │   │  (optional) │   │  (Close)   │   │         │
└─────────┘   └────────┘   └─────────────┘   └────────────┘   └─────────┘
```

If the player is still signed in, **Welcome** goes straight to **Room**. **Log out** on the Room screen starts the full flow again from **Welcome**.

---

## Registration & phone verification

Before joining a room, each player verifies their mobile number with a **one-time SMS code** (Twilio Verify).

### Registration steps

| Step | What the player does |
|------|----------------------|
| 1 | Enter **name** (minimum 2 characters) |
| 2 | Enter **10-digit mobile number** (India format) |
| 3 | Tap **Send verification code** |
| 4 | Enter the **6-digit SMS code** |
| 5 | Tap **Verify & Enter the Market** → **Instruction** → **Continue to room** |

### What players see

- Clear prompts if the number is invalid (e.g. incomplete or obviously fake numbers like `0000000000`)
- Option to **resend** the code after a short wait
- On **Room**: **Instructions** (review rules) and **Log out** (ends session for this device)
- Only after verification can they enter a room code and join the game

### Staying signed in

| Situation | Behaviour |
|-----------|-----------|
| Game ends | Player returns to **Room** with the **same account** (no re-register) |
| New room code from host | Enter code on **Room** and play again |
| Want to switch phone / person | Tap **Log out**, then register again |
| Same phone, later session | Server recognises the number and reuses the player profile |

### Host view

Verified name and phone appear in the **admin dashboard** for the room (standings and player list), so staff can match participants on the floor if needed.

---

## Room screen (join hub)

The **Room** screen is the home base during the event:

| Control | Purpose |
|---------|---------|
| **Room code** | 4-letter code from the host (e.g. `ABCD`) |
| **Join room** | Enters the waiting room for that code |
| **Instructions** | Opens rules; **Close** returns to Room |
| **Log out** | Clears session; next visit starts from Welcome |

---

## How the game works

### Starting position
- **₹10,000** virtual cash  
- **10 shares** of every listed stock (no cash deducted for starter holdings)

### Trading
- Tap **Buy** or **Sell** — each action trades **1 share** at the current price  
- Six fictional companies across different sectors (see table below)

### News-driven market
- **8 breaking headlines** during the round  
- Each headline affects only the stocks it mentions — prices move **up** or **down** immediately  
- Players react in real time on their devices

### Round end
- **120 seconds** to earn profit  
- Any shares still held are **auto-sold** when time runs out  
- **Highest profit wins** the room  
- Players are sent back to **Room** to join the next session

---

## Stocks in the simulation

| Ticker | Company     | Sector            |
|--------|-------------|-------------------|
| AERO   | AeroCore    | Aviation          |
| GRNV   | GreenVolt   | Renewable Energy  |
| NXBK   | NexBank     | Banking           |
| PHRX   | PharmaCore  | Pharma            |
| OILF   | OilForge    | Oil & Gas         |
| AGRI   | AgriHarvest | Agriculture       |

All stocks start at the same base price. Movement is driven entirely by in-game news — not live market data.

---

## Host / admin experience

A separate **admin dashboard** is used by event staff (not shown to players).

| Step | Action |
|------|--------|
| 1 | Sign in to the admin panel |
| 2 | **Create a room** — receive a unique 4-letter code |
| 3 | Share the code with participants (on stage, QR, or chat) |
| 4 | Monitor who has joined and live standings |
| 5 | **Start game** when enough players are in the room (minimum 1 for testing, up to 20 per room) |
| 6 | Watch profit/loss update live during the round |
| 7 | Close or reset rooms between sessions as needed |

The host controls **when** the clock starts; players only need the room code and their phone.

---

## Ideal use cases

- **FYERS BornToTrade Challenge** — arena or booth activations  
- **College / corporate events** — competitive, easy-to-explain format  
- **Trading education demos** — risk-free environment with news-driven volatility  
- **Leaderboard moments** — winner reveal on the big screen after 2 minutes  

---

## What you need on event day

| Role | Needs |
|------|--------|
| **Players** | Smartphone with browser + room code + mobile data or Wi‑Fi |
| **Host** | Laptop or tablet + admin login + projector optional for standings |
| **Internet** | Stable connection for player site and admin (hosted online) |

No app store download. Works on modern mobile browsers (iOS Safari, Android Chrome).

---

## Access URLs (production)

Replace with your live domains when deployed:

| Audience | URL |
|----------|-----|
| **Players** | `https://your-domain.com/` |
| **Admin** | `https://your-domain.com/admin/` |

Custom domains and HTTPS are configured on the hosting provider (e.g. Netlify for the front end).

---

## Registration checks

- Name required (minimum 2 characters)  
- Valid 10-digit Indian mobile number  
- Invalid patterns (e.g. same digit repeated 10 times) are rejected with a clear message  
- **SMS OTP must be verified once** before the player can join a room  
- Session persists across games until **Log out**

---

## Privacy & safety

- **Simulation only** — no real trades, no brokerage integration for players  
- Fictional tickers and prices  
- Player details used for session and leaderboard display during the event  
- SMS OTP is sent **only for phone verification** at registration (Twilio Verify)  

---

## Support & handover

For technical deployment, environment setup, or changes to rules/timing/stocks, refer to your delivery team’s internal documentation (`DEVELOPMENT.md`).

---

**BornToTrade Challenge** — *Born to Trade. Compete. Win.*
