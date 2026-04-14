// src/lib/demo-data.ts
// Browser-safe demo data for ORGANA MVP.
// Import from here in client components — NOT from tools/scripts/seed-demo.ts
// (seed-demo.ts has `require.main === module` which breaks the browser bundler)

import type { DemoCompany, KnowledgeBase, Message, Agent } from './types'

const NOW = new Date().toISOString()

function msg(role: 'user' | 'assistant', content: string): Message {
  return { role, content, timestamp: NOW }
}

function shell(id: string, name: string, role: string, department: string, reportsTo: string | null): Agent {
  return { id, name, role, department, reportsTo, readinessScore: 0, onboardingComplete: false, knowledgeBase: null, onboardingMessages: [] }
}

// ─── Nova Agency KBs ────────────────────────────────────────────────────────

const valentinaKB: KnowledgeBase = {
  agentId: 'valentina-torres',
  completedAt: NOW,
  summary: 'Valentina Torres is the CEO of Nova Agency, responsible for overall strategy, key client relationships, and team leadership. She runs the business from vision to execution and is the final decision-maker on all major accounts and hires.',
  categories: {
    tasks: [
      'Weekly leadership sync with all department heads every Monday at 9am',
      'Final approval on all proposals over $50k USD',
      'Monthly board report with KPIs: revenue, retention, pitch win rate',
      'Active client sponsor for top 3 accounts: Natura, MercadoLibre, YPF',
      'Recruiting final interviews for senior hires',
    ],
    tools: [
      'Slack — primary comms, monitors #leadership, #deals, #incidents channels',
      'Notion — strategic roadmap, board decks, and OKRs',
      'HubSpot — pipeline review every Friday, tracks deal stages and deal value',
      'Google Meet — all external client calls, always recorded',
      'Loom — async updates to team when traveling',
    ],
    team: [
      'Martín Ruiz (Head of Accounts) — daily syncs, first escalation point for client issues',
      'Sofía Chen (Head of Creative) — weekly creative review, approves final campaign decks',
      'Lucas Fernández (CFO) — biweekly finance review, budget approvals',
      'Reports to Board — quarterly in-person reviews in São Paulo',
    ],
    comms: [
      'Direct, data-first communication style — always leads with numbers',
      'For difficult client situations: always takes the call personally, never delegates a crisis',
      'Prefers async (Loom/Notion) for updates; sync (Meet) for decisions',
      'No WhatsApp for work — strict Slack only policy',
    ],
    decisions: [
      'Any hire above $60k/year salary requires her sign-off',
      'Pitches to new clients over $100k ARS monthly budget',
      'Agency partnerships and vendor contracts',
      'Public statements or press mentions about Nova Agency',
      'Does NOT decide: individual campaign creative direction (Sofía), day-to-day client ops (Martín)',
    ],
    knowledge: [
      'Nova Agency wins pitches on speed — if a proposal takes more than 72 hours, we lose',
      'Natura is our anchor client — 40% of revenue. Never miss a Natura deadline.',
      'The Buenos Aires ad market moves in Q1 and Q3 — pipeline dries up in February and August',
      'We have a preferred vendor list for production — always use them before going external',
      'Culture: no meeting before 9am or after 7pm. Remote Fridays are sacred.',
    ],
  },
  rawTranscript: [
    msg('assistant', "Hi Valentina! I'm ARIA, your AI interviewer. I'm here to capture your operational knowledge so your AI twin can help the team even when you're not available. Let's start simple: what does a typical week look like for you?"),
    msg('user', 'Monday starts with our leadership sync — all department heads for 90 minutes. Rest of the week is split between client calls, pipeline review on Friday with Martín, and catching up on Notion docs. I travel at least one week a month for key accounts.'),
    msg('assistant', "That Monday leadership sync sounds pivotal. What are the 3 things that only you can do at Nova Agency — things that would genuinely break if you were out for two weeks?"),
    msg('user', 'Final approval on big proposals, being the client sponsor for Natura and MercadoLibre, and recruiting senior people. Everything else has a backup.'),
  ],
}

const martinKB: KnowledgeBase = {
  agentId: 'martin-ruiz',
  completedAt: NOW,
  summary: 'Martín Ruiz is Head of Accounts at Nova Agency, managing all client relationships and the account management team of 6. He is the operational hub between clients and creative — everything flows through him before reaching Valentina.',
  categories: {
    tasks: [
      'Daily standup with the 6 account managers at 9:30am',
      'Weekly client health check — reviews NPS and last-touch date for each account',
      'Escalation point for all client complaints before they reach Valentina',
      'Manages revenue forecasting in HubSpot — updates pipeline every Friday',
      'Monthly client business reviews (CBRs) with top 5 accounts',
    ],
    tools: [
      'HubSpot — gospel for all account data, pipeline stages, and client notes',
      'Notion — client runbooks, onboarding templates, CBR decks',
      "WhatsApp — clients prefer it for quick questions; Martín keeps a strict no-WhatsApp-after-9pm rule",
      'Google Sheets — manual revenue tracking (cross-referenced with HubSpot)',
      'Zoom — weekly client calls; internal is always Google Meet',
    ],
    team: [
      '6 direct reports: 2 senior AMs, 3 AMs, 1 AM coordinator',
      'Works most closely with Sofía Chen on delivery timelines',
      'Daily Slack thread with Valentina on deal status',
      'Finance (Lucas) for invoice approvals and payment follow-ups',
    ],
    comms: [
      'When a client is unhappy: first call within 2 hours, no email. Always phone.',
      "Sends written recap after every client call within 24h — in Notion and cc'd in HubSpot",
      'Escalates to Valentina only when: client threatens to leave, contract dispute, or ask outside scope by >30%',
      'Never promises deliverables on a call without checking with creative first',
    ],
    decisions: [
      'Up to 15% scope creep on existing contracts without approval',
      'Which AM is assigned to which client',
      'Client meeting agendas and CBR format',
      'Does NOT decide: final creative output, new client pricing (Valentina), headcount (Valentina)',
    ],
    knowledge: [
      'YPF is our most demanding client — always buffer 20% extra time on their campaigns',
      'The best time to upsell is right after a campaign launch if results are strong — strike in first 48h',
      "Never let a client go 3 weeks without a touch — that's when they start shopping around",
      'HubSpot deal stages: Lead → Qualified → Proposal Sent → Negotiation → Won/Lost',
      "Our payment terms are net-30 but most clients pay net-45 — don't escalate until day 50",
    ],
  },
  rawTranscript: [
    msg('assistant', "Hi Martín! I'm ARIA. Let's capture how you run the accounts team. Walk me through a typical week."),
    msg('user', "Standup with the team every morning, then I'm on client calls most of the day. Fridays I do pipeline review with Valentina. Every third week I'm doing CBRs."),
  ],
}

const sofiaKB: KnowledgeBase = {
  agentId: 'sofia-chen',
  completedAt: NOW,
  summary: 'Sofía Chen is Head of Creative at Nova Agency, leading a team of 8 across design, copy, and video. She sets the creative direction for all accounts and is the final sign-off on anything that goes to a client.',
  categories: {
    tasks: [
      'Monday creative kickoff — reviews all active briefs and assigns to team',
      'Wednesday mid-sprint review — checks work in progress, gives direction',
      "Friday creative showcase — presents week's output to department heads",
      'Final review of all client-facing decks before Martín sends them',
      "Monthly creative retrospective — what worked, what didn't, tools we're testing",
    ],
    tools: [
      'Figma — all design work, shared with clients for feedback via Figma comments',
      'Notion — creative briefs, brand guidelines, project status',
      'Frame.io — video review and client approvals for video productions',
      'Adobe Creative Suite — production work (Premiere, After Effects, Photoshop)',
      'Slack #creative channel — daily async with team',
    ],
    team: [
      '8 direct reports: 2 senior designers, 2 designers, 2 copywriters, 1 video editor, 1 creative coordinator',
      'Closest collaborator: Martín (accounts) — daily handoffs on briefs and timelines',
      'Works with external production houses for large video shoots',
    ],
    comms: [
      'Creative feedback is always in writing — no verbal-only feedback, it never sticks',
      'Uses a traffic light system: green (ship it), yellow (one more round), red (restart)',
      "Never says no to a brief — says \"here's what we can do with this budget and timeline\"",
      'Client feedback rounds: max 2 rounds included in contract. Round 3 is a change order.',
    ],
    decisions: [
      'Which team member works on which account',
      'Which external vendors to use for production',
      'Creative direction on all campaigns',
      'Does NOT decide: client budgets, account assignments (Martín), hiring without Valentina',
    ],
    knowledge: [
      'Natura briefs always come in Friday afternoon — protect the team by negotiating Monday start',
      'MercadoLibre has a strict brand guide — download the latest version every time, they update it quarterly',
      'Our strongest output is social-first campaigns — push clients toward this format if budget allows',
      'When a brief is vague, run a 30-min kickoff call before briefing the team — saves 2 rounds of revisions',
      'The creative coordinator owns the Figma master file — never let an AM edit it directly',
    ],
  },
  rawTranscript: [
    msg('assistant', "Hi Sofía! I'm ARIA. Let's capture the creative process. Walk me through your week."),
    msg('user', 'Monday is kickoff, Wednesday is review, Friday is showcase. The rest is deep work and client reviews.'),
  ],
}

const carlosKB: KnowledgeBase = {
  agentId: 'carlos-operations',
  completedAt: NOW,
  summary: 'Carlos Méndez is Operations Manager at Nova Agency, responsible for all logistics, vendor portals, dispatch workflows, and day-to-day production ops. He is the first responder for any operational outage and owns the Andreani relationship.',
  categories: {
    tasks: [
      'Daily review of all pending dispatches in Andreani portal before 10am',
      'Coordinates print production orders with external vendors every Tuesday',
      'Weekly ops report: delivery SLA compliance, pending invoices, portal incidents',
      'Manages agency courier assignments and vehicle schedule',
      'Escalation contact for any supplier portal issue — client SLAs depend on this',
    ],
    tools: [
      'Andreani portal — primary dispatch and tracking tool at andreani.com/empresas',
      'Google Sheets "Despachos Nova" — manual backup log when portal is down',
      'WhatsApp group "Proveedores Ops" — direct line to Andreani account manager (Rodrigo)',
      'Notion "Ops Runbooks" — step-by-step guides for every recurring incident',
      'Slack #operaciones — internal escalations and status updates',
    ],
    team: [
      'Reports to Valentina Torres (CEO)',
      'Works daily with Martín Ruiz (Accounts) to align dispatch with client deadlines',
      'External: Rodrigo at Andreani (account manager), contact via WhatsApp only',
      '2 direct reports: logistics coordinator and production assistant',
    ],
    comms: [
      'Any portal outage over 30 minutes must be logged in Slack #operaciones with ETA',
      'Client-facing delays always go through Martín — never contact the client directly from ops',
      'Rodrigo at Andreani responds on WhatsApp within 2 hours during business days',
      'Uses Loom to document new workarounds so the team can self-serve next time',
    ],
    decisions: [
      'Which courier to use when Andreani is unavailable (backup: OCA)',
      'Approves all print and production invoices under $200k ARS',
      'Decides dispatch priority when orders conflict on the same day',
      'Does NOT decide: client deadlines (Martín), budget overruns above threshold (Valentina)',
    ],
    knowledge: [
      'Andreani portal crashes almost every Monday morning between 8am and 10am — it is a known issue caused by a batch job that overloads their servers on weekly reset. Rodrigo confirmed this.',
      'When the portal is down: export the pending orders CSV from the last sync saved in Google Sheets "Despachos Nova" tab "Backup CSV", then call Andreani ops line 0810-122-1111 and dictate the top 3 priority dispatches manually — they process by phone during outages.',
      'The CSV backup must be updated every Friday afternoon before EOD — if it is stale you lose visibility on weekend orders.',
      'OCA is the backup courier but takes 48h longer — only use for non-urgent orders.',
      'Andreani portal password resets expire every 60 days — set a calendar reminder or you get locked out on a Monday.',
      'The print vendor (Imprenta Del Sur) needs 72h notice for A3 jobs — never promise same-week delivery for large format.',
    ],
  },
  rawTranscript: [
    msg('assistant', "Hi Carlos! I'm ARIA. Let's capture how you run operations at Nova. Walk me through a typical Monday morning."),
    msg('user', "First thing I do is log into the Andreani portal to check pending dispatches. Mondays are tricky because the portal often crashes between 8 and 10am — there's a batch job on their end that overloads the servers. So I always have the backup CSV ready from Friday."),
    msg('assistant', 'What do you do exactly when the portal is down on a Monday morning?'),
    msg('user', "I pull up the Google Sheets backup — I export the CSV every Friday from the last successful sync. Then I call Andreani's ops line 0810-122-1111 and dictate the top 3 priority dispatches manually. They can process by phone during outages. Rodrigo, my account manager there, usually texts me on WhatsApp when it's back up."),
    msg('assistant', "Smart system. What would happen if someone forgot to update that CSV on Friday?"),
    msg('user', "We'd lose visibility on any orders that came in over the weekend. That's a problem if a client has a Monday deadline. I've made it a hard rule — Friday EOD, no exceptions."),
  ],
}

// ─── Nova Commerce KBs ──────────────────────────────────────────────────────

const elenaKB: KnowledgeBase = {
  agentId: 'elena-vega',
  completedAt: NOW,
  summary: 'Elena Vega is the CEO of Nova Commerce, an ecommerce startup building curated product experiences for Latin America. She owns the product roadmap, investor relations, and key supplier partnerships.',
  categories: {
    tasks: [
      'Weekly all-hands every Monday at 10am — product, growth, and ops updates',
      'Investor update email every Friday with GMV, conversion rate, and CAC',
      'Final approval on all supplier contracts above $10k USD',
      'Monthly roadmap review with tech and growth leads',
      'Bi-weekly 1:1s with each direct report',
    ],
    tools: [
      'Notion — product roadmap, OKRs, investor docs',
      'Slack — primary async comms; monitors #founders, #incidents, #growth channels',
      'Mixpanel — product analytics, funnel performance',
      'Google Meet — all investor calls, always recorded',
      'Linear — tracks product priorities across engineering',
    ],
    team: [
      'Rodrigo Castro (Head of Growth) — daily check-in on acquisition metrics',
      'Paula Jiménez (Head of Operations) — weekly ops review on fulfillment and suppliers',
      'Reports to board — monthly written update, quarterly in-person',
    ],
    comms: [
      'Data-first: every decision pitch starts with a number',
      'Never escalates to investors without a proposed solution in hand',
      'Prefers Loom videos over long Slack threads for strategic updates',
      'Responds to Slack within 4 hours during business hours; off after 8pm',
    ],
    decisions: [
      'Any partnership or supplier contract above $10k',
      'Product bets that require more than 2 weeks of engineering time',
      'Hiring decisions for senior roles (Head-level and above)',
      'Does NOT decide: campaign creative (Rodrigo), logistics vendors (Paula)',
    ],
    knowledge: [
      'Our best converting channel is email — protect the list, never spam it',
      'Argentina logistics is our biggest operational risk — always have a backup carrier',
      'Q4 (Oct-Dec) is 60% of our annual GMV — freeze major tech changes in November',
      'Investors care about CAC:LTV ratio above all — optimize for that, not raw revenue',
      'The founding story (Buenos Aires → LatAm) resonates with both users and press — use it',
    ],
  },
  rawTranscript: [
    msg('assistant', "Hi Elena! I'm ARIA. Let's capture how you run Nova Commerce. Walk me through a typical week."),
    msg('user', 'Monday all-hands, then I spend the week between product calls, investor comms, and supplier negotiations. Fridays I send the investor update and do 1:1s.'),
    msg('assistant', "That investor update sounds critical. What are the 3 things only you can do at Nova Commerce?"),
    msg('user', 'Manage investor relationships, close big supplier deals, and set the product direction. Everything else can be delegated.'),
  ],
}

const rodrigoKB: KnowledgeBase = {
  agentId: 'rodrigo-castro',
  completedAt: NOW,
  summary: 'Rodrigo Castro is Head of Growth at Nova Commerce, owning all acquisition channels, retention marketing, and revenue targets. He runs a lean growth stack and moves fast on experiments.',
  categories: {
    tasks: [
      'Daily review of acquisition metrics: CAC, ROAS, email open rates',
      'Weekly growth experiment review — what launched, what learned, what ships next',
      'Manages paid channels: Meta, Google, TikTok — total budget $50k/month',
      'Email marketing: 3 campaigns per week, all A/B tested',
      'Monthly channel attribution report for Elena and board',
    ],
    tools: [
      'Meta Ads Manager — primary paid social channel, 40% of paid budget',
      'Google Ads — search + shopping, 35% of paid budget',
      'Klaviyo — all email flows and campaigns; owns the 80k subscriber list',
      'Mixpanel — funnel analysis and cohort retention',
      'Notion — growth experiments backlog and retrospectives',
    ],
    team: [
      'Works with Paula on post-purchase email flows and fulfillment messaging',
      'Matías (Tech Lead) for landing page experiments and tracking implementation',
      'Elena for budget approvals above $5k and channel strategy pivots',
    ],
    comms: [
      'Weekly growth update in #growth Slack channel every Monday morning',
      'Escalates to Elena only when ROAS drops below 2x for 3+ consecutive days',
      'All experiment results documented in Notion before launching next experiment',
      'Prefers async — only calls for decisions that need back-and-forth',
    ],
    decisions: [
      'All paid media budget allocation within approved monthly budget',
      'Email calendar and campaign content',
      'Which growth experiments to run and in what order',
      'Does NOT decide: product features, supplier selection, hiring',
    ],
    knowledge: [
      'Our email list converts 3x better than paid — prioritize list growth over paid scale',
      'TikTok works for top-of-funnel but attribution is unreliable — use it for brand, not ROAS',
      'Friday sends have the highest open rates for our audience; avoid Monday sends',
      'Winning creative formula: real user UGC + product in context + price anchor',
      'Black Friday prep starts in September — brief Matías on landing pages by Oct 1',
    ],
  },
  rawTranscript: [
    msg('assistant', "Hi Rodrigo! I'm ARIA. Let's capture the growth playbook. What does your week look like?"),
    msg('user', 'Every morning I check the numbers. Monday I review what experiments ran last week and plan the next ones. The rest of the week is campaign management and email.'),
  ],
}

const paulaKB: KnowledgeBase = {
  agentId: 'paula-jimenez',
  completedAt: NOW,
  summary: 'Paula Jiménez is Head of Operations at Nova Commerce, owning the entire supply chain from supplier onboarding to last-mile delivery. She is the reason orders arrive on time and customers stay.',
  categories: {
    tasks: [
      'Daily fulfillment dashboard review — SLA compliance, pending shipments, exceptions',
      'Weekly supplier performance review — on-time rate, quality complaints, stock levels',
      'Manages 3PL relationship with Andreani and backup carrier OCA',
      'Coordinates returns process: 48h SLA from customer request to refund issued',
      'Monthly inventory forecast with suppliers — 6-week horizon',
    ],
    tools: [
      'Shopify — order management, fulfillment status, customer service tickets',
      'Google Sheets — inventory tracker and supplier scorecards (not yet in a WMS)',
      'WhatsApp — supplier communication (they all prefer it)',
      'Andreani portal — shipment tracking and label generation',
      'Slack — internal ops channel #fulfillment for daily exception alerts',
    ],
    team: [
      'Camila Aguirre (Customer Success) — daily handoff on delivery escalations',
      'Rodrigo (Growth) — coordinates post-purchase email triggers based on fulfillment status',
      'Elena for supplier contract renewals and new vendor approvals',
    ],
    comms: [
      'Posts daily fulfillment summary in #ops Slack by 9am',
      'Calls (never texts) suppliers when there is a stock or delivery issue',
      'Customer delivery escalations: responds within 2 hours during business hours',
      'Weekly ops report to Elena every Thursday afternoon',
    ],
    decisions: [
      'Which carrier to use for each shipment tier',
      'Stock reorder quantities and timing',
      'Supplier quality complaints and resolution',
      'Does NOT decide: product catalog, marketing campaigns, pricing',
    ],
    knowledge: [
      'Andreani is 20% cheaper but has 15% more exceptions than OCA — use OCA for high-value orders',
      'Argentine customs delays spike in March and September — buffer 2 extra weeks for imports',
      'Our return rate is 4% — double the category average. Focus on size guides first.',
      'Suppliers in Mendoza have 3-day shipping lead time; Buenos Aires is same-day',
      'Never promise delivery dates to customers — promise a range and overdeliver',
    ],
  },
  rawTranscript: [
    msg('assistant', "Hi Paula! I'm ARIA. Let's capture how ops runs at Nova Commerce. Walk me through your week."),
    msg('user', 'I start every day checking the fulfillment dashboard. If anything is off-SLA I deal with it immediately. Then supplier check-ins, inventory, and escalations.'),
  ],
}

// ─── Nova Agency partial KBs ─────────────────────────────────────────────────

const lucasKB: KnowledgeBase = {
  agentId: 'lucas-fernandez',
  completedAt: NOW,
  summary: 'Lucas manages financial operations: invoicing, cash flow, bank reconciliation, vendor payments.',
  categories: {
    tasks: [
      'Monthly P&L review and reporting to CEO',
      'Invoice processing through ARCA/AFIP',
      'Weekly cash flow management in Excel — updated every Friday before noon',
      'Bank reconciliation — cross-reference Banco Galicia with MercadoPago every Monday',
      'Vendor payment scheduling based on due dates and cash availability',
    ],
    tools: [
      'ARCA/AFIP — electronic invoicing',
      'Excel — cash flow model and P&L',
      'Banco Galicia Home Banking',
      'MercadoPago — sales reconciliation',
      'Google Sheets — vendor payment tracker',
    ],
    team: [
      'Reports to Valentina (CEO) — expense approvals over $500',
      'Weekly 1:1 with CEO on Wednesdays',
      'Coordinates with Carlos (Operations) on shipping costs',
    ],
    comms: [
      'Email for vendors and accountant',
      'WhatsApp with CEO for urgent approvals',
    ],
    decisions: [
      'Approves expenses under $500 independently',
      'Over $500 require CEO approval',
    ],
    knowledge: [
      'Accountant is Estudio García — Laura, tel 11-4567-8900',
      'ARCA goes down Friday afternoons',
      'Always invoice before the 10th',
    ],
  },
  rawTranscript: [
    msg('assistant', "Hi Lucas! I'm ARIA. Let's capture how you handle finance at Nova Agency."),
    msg('user', 'I handle all invoicing through ARCA/AFIP, manage cash flow weekly, and reconcile Galicia with MercadoPago every Monday.'),
  ],
}

const camilaKB: KnowledgeBase = {
  agentId: 'camila-rios',
  completedAt: NOW,
  summary: 'Camila manages key accounts, creates campaign briefs, coordinates between clients and creative.',
  categories: {
    tasks: [
      'Daily client communication via email and WhatsApp',
      'Weekly status reports for top 5 accounts',
      'Campaign brief creation and handoff to creative',
      'Client onboarding — setup meetings, asset collection',
    ],
    tools: [
      'Google Sheets — client tracker',
      'WhatsApp',
      'Gmail',
      'Google Meet',
    ],
    team: [
      'Reports to Martín Ruiz',
      "Works with Sofía Chen's team",
      'Coordinates with Diego Morales',
    ],
    comms: [
      'WhatsApp for quick updates',
      'Email for proposals',
    ],
    decisions: [
      'Approves minor scope changes within budget',
      'Escalates budget increases over 10%',
    ],
    knowledge: [
      "NDA templates in Drive 'Legal Templates'",
      'Confirm timelines with Creative before promising client',
    ],
  },
  rawTranscript: [
    msg('assistant', "Hi Camila! I'm ARIA. Walk me through how you manage your accounts."),
    msg('user', 'I handle 5 major accounts — daily WhatsApp with clients, weekly status updates, and briefs to creative.'),
  ],
}

const diegoMKB: KnowledgeBase = {
  agentId: 'diego-morales',
  completedAt: NOW,
  summary: 'Diego manages accounts focusing on performance reporting and upsell opportunities.',
  categories: {
    tasks: [
      'Client relationship management',
      'Monthly performance reports',
      'Upsell identification',
    ],
    tools: [
      'Google Sheets',
      'Gmail',
      'Google Meet',
    ],
    team: [
      'Reports to Martín Ruiz',
      'Shares accounts with Camila',
    ],
    comms: [
      'Email formal',
      'WhatsApp internal',
    ],
    decisions: [
      'Approves deliverable revisions within scope',
    ],
    knowledge: [
      'Top clients: Retail Plus, FashionCo, TechStart',
    ],
  },
  rawTranscript: [
    msg('assistant', "Hi Diego! I'm ARIA. Let's capture how you work with your accounts."),
    msg('user', 'I focus on performance — monthly reports for clients and identifying upsell opportunities.'),
  ],
}

const anaGKB: KnowledgeBase = {
  agentId: 'ana-gutierrez',
  completedAt: NOW,
  summary: 'Junior AM supporting seniors with admin and coordination.',
  categories: {
    tasks: [
      'Support senior AMs with admin tasks',
      'Meeting scheduling and notes',
    ],
    tools: [
      'Google Calendar',
      'Gmail',
    ],
    team: [
      'Reports to Martín Ruiz',
      'Assists Camila and Diego',
    ],
    comms: [
      'Email and calendar',
    ],
    decisions: [],
    knowledge: [
      'New to the role — still learning',
    ],
  },
  rawTranscript: [
    msg('assistant', "Hi Ana! I'm ARIA. What does your typical day look like?"),
    msg('user', 'I help Camila and Diego with admin — scheduling meetings, taking notes, and handling coordination tasks.'),
  ],
}

const pabloKB: KnowledgeBase = {
  agentId: 'pablo-solis',
  completedAt: NOW,
  summary: 'Handles follow-ups and presentations. Early onboarding.',
  categories: {
    tasks: [
      'Client follow-ups',
      'Presentation decks for client reviews',
    ],
    tools: [
      'Google Slides',
      'Gmail',
    ],
    team: [
      'Reports to Martín Ruiz',
    ],
    comms: [
      'Email',
    ],
    decisions: [],
    knowledge: [],
  },
  rawTranscript: [
    msg('assistant', "Hi Pablo! I'm ARIA. Walk me through what you work on."),
    msg('user', 'I do client follow-ups and build presentation decks for account reviews.'),
  ],
}

const luciaKB: KnowledgeBase = {
  agentId: 'lucia-mendez',
  completedAt: NOW,
  summary: 'Coordinates client meetings and invoicing follow-ups.',
  categories: {
    tasks: [
      'Client meeting coordination',
      'Invoice follow-ups with finance',
    ],
    tools: [
      'Gmail',
      'Google Calendar',
    ],
    team: [
      'Reports to Martín Ruiz',
    ],
    comms: [
      'Email',
    ],
    decisions: [],
    knowledge: [],
  },
  rawTranscript: [
    msg('assistant', "Hi Lucía! I'm ARIA. What are your main responsibilities?"),
    msg('user', 'I coordinate client meetings and follow up on invoices with the finance team.'),
  ],
}

const joseKB: KnowledgeBase = {
  agentId: 'jose-vera',
  completedAt: NOW,
  summary: 'Senior designer handling brand identity and social assets in Figma and Photoshop.',
  categories: {
    tasks: [
      'Brand identity design',
      'Social media assets — Instagram posts, stories, carousels',
      'Design review for juniors',
      'Client presentation mockups',
    ],
    tools: [
      'Figma',
      'Adobe Photoshop',
      'Canva',
      'Google Drive',
    ],
    team: [
      'Reports to Sofía Chen',
      'Works with Natalia López',
      'Receives briefs from AMs',
    ],
    comms: [
      'Slack for creative feedback',
      'Drive for deliverables',
    ],
    decisions: [
      'Design direction within brand guidelines',
      'Escalates new concepts to Sofía',
    ],
    knowledge: [
      "Brand guidelines in Drive 'Client Brands'",
      'Instagram: 1080x1080, stories 1080x1920',
      'Export PNG for social, PDF for print',
    ],
  },
  rawTranscript: [
    msg('assistant', "Hi José! I'm ARIA. Walk me through your creative process."),
    msg('user', 'I lead brand identity and social assets — Figma for design, Photoshop for production. I also review junior work before it goes to Sofía.'),
  ],
}

const nataliaKB: KnowledgeBase = {
  agentId: 'natalia-lopez',
  completedAt: NOW,
  summary: 'Handles campaign visuals and motion graphics.',
  categories: {
    tasks: [
      'Campaign visual design',
      'Video thumbnails and motion graphics',
      'Design QA before delivery',
    ],
    tools: [
      'Figma',
      'Adobe After Effects',
      'Google Drive',
    ],
    team: [
      'Reports to Sofía Chen',
      'Collaborates with José Vera',
    ],
    comms: [
      'Slack',
      'Email for client deliverables',
    ],
    decisions: [
      'Approves final visual quality',
    ],
    knowledge: [
      'Video specs: 1920x1080 YouTube, 1080x1080 Instagram, 9:16 stories/reels',
    ],
  },
  rawTranscript: [
    msg('assistant', "Hi Natalia! I'm ARIA. What does your creative work look like day to day?"),
    msg('user', 'Campaign visuals and motion — After Effects for animation, Figma for static. I do final QA before anything goes out.'),
  ],
}

const tomasKB: KnowledgeBase = {
  agentId: 'tomás-white',
  completedAt: NOW,
  summary: 'Copywriter supporting campaign messaging and content creation.',
  categories: {
    tasks: [
      'Campaign copy for social and email',
      'Brand voice guidelines',
    ],
    tools: [
      'Google Docs',
    ],
    team: [
      'Reports to Sofía Chen',
    ],
    comms: [
      'Slack for feedback',
    ],
    decisions: [],
    knowledge: [],
  },
  rawTranscript: [
    msg('assistant', "Hi Tomás! I'm ARIA. What do you write for Nova Agency?"),
    msg('user', 'Social copy and campaign messaging mostly. Still getting up to speed with brand voice.'),
  ],
}

const emiliaKB: KnowledgeBase = {
  agentId: 'emilia-suarez',
  completedAt: NOW,
  summary: 'Video editor handling post-production for campaign content.',
  categories: {
    tasks: [
      'Video editing for campaign deliverables',
    ],
    tools: [
      'Adobe Premiere Pro',
    ],
    team: [
      'Reports to Sofía Chen',
    ],
    comms: [
      'Frame.io for video review',
    ],
    decisions: [],
    knowledge: [],
  },
  rawTranscript: [
    msg('assistant', "Hi Emilia! I'm ARIA. Walk me through your editing workflow."),
    msg('user', 'I edit all campaign videos in Premiere and share reviews through Frame.io.'),
  ],
}

// ─── Exported demo companies ─────────────────────────────────────────────────

export const NOVA_AGENCY_DEMO: DemoCompany = {
  name: 'Nova Agency',
  description: 'Full-service marketing and creative agency based in Buenos Aires.',
  agents: [
    { id: 'valentina-torres', name: 'Valentina Torres', role: 'CEO', department: 'General Management', reportsTo: null, readinessScore: 100, onboardingComplete: true, knowledgeBase: valentinaKB, onboardingMessages: valentinaKB.rawTranscript },
    { id: 'martin-ruiz', name: 'Martín Ruiz', role: 'Head of Accounts', department: 'Accounts', reportsTo: 'valentina-torres', readinessScore: 100, onboardingComplete: true, knowledgeBase: martinKB, onboardingMessages: martinKB.rawTranscript },
    { id: 'sofia-chen', name: 'Sofía Chen', role: 'Head of Creative', department: 'Creative', reportsTo: 'valentina-torres', readinessScore: 100, onboardingComplete: true, knowledgeBase: sofiaKB, onboardingMessages: sofiaKB.rawTranscript },
    { id: 'carlos-operations', name: 'Carlos Méndez', role: 'Operations Manager', department: 'Operations', reportsTo: 'valentina-torres', readinessScore: 100, onboardingComplete: true, knowledgeBase: carlosKB, onboardingMessages: carlosKB.rawTranscript },
    { id: 'lucas-fernandez', name: 'Lucas Fernández', role: 'CFO', department: 'Finance', reportsTo: 'valentina-torres', readinessScore: 78, onboardingComplete: true, knowledgeBase: lucasKB, onboardingMessages: lucasKB.rawTranscript },
    { id: 'camila-rios', name: 'Camila Ríos', role: 'Senior Account Manager', department: 'Accounts', reportsTo: 'martin-ruiz', readinessScore: 72, onboardingComplete: true, knowledgeBase: camilaKB, onboardingMessages: camilaKB.rawTranscript },
    { id: 'diego-morales', name: 'Diego Morales', role: 'Senior Account Manager', department: 'Accounts', reportsTo: 'martin-ruiz', readinessScore: 65, onboardingComplete: true, knowledgeBase: diegoMKB, onboardingMessages: diegoMKB.rawTranscript },
    { id: 'ana-gutierrez', name: 'Ana Gutiérrez', role: 'Account Manager', department: 'Accounts', reportsTo: 'martin-ruiz', readinessScore: 55, onboardingComplete: true, knowledgeBase: anaGKB, onboardingMessages: anaGKB.rawTranscript },
    { id: 'pablo-solis', name: 'Pablo Solís', role: 'Account Manager', department: 'Accounts', reportsTo: 'martin-ruiz', readinessScore: 48, onboardingComplete: true, knowledgeBase: pabloKB, onboardingMessages: pabloKB.rawTranscript },
    { id: 'lucia-mendez', name: 'Lucía Méndez', role: 'Account Manager', department: 'Accounts', reportsTo: 'martin-ruiz', readinessScore: 42, onboardingComplete: true, knowledgeBase: luciaKB, onboardingMessages: luciaKB.rawTranscript },
    { id: 'jose-vera', name: 'José Vera', role: 'Senior Designer', department: 'Creative', reportsTo: 'sofia-chen', readinessScore: 70, onboardingComplete: true, knowledgeBase: joseKB, onboardingMessages: joseKB.rawTranscript },
    { id: 'natalia-lopez', name: 'Natalia López', role: 'Senior Designer', department: 'Creative', reportsTo: 'sofia-chen', readinessScore: 62, onboardingComplete: true, knowledgeBase: nataliaKB, onboardingMessages: nataliaKB.rawTranscript },
    { id: 'tomás-white', name: 'Tomás White', role: 'Copywriter', department: 'Creative', reportsTo: 'sofia-chen', readinessScore: 35, onboardingComplete: true, knowledgeBase: tomasKB, onboardingMessages: tomasKB.rawTranscript },
    { id: 'emilia-suarez', name: 'Emilia Suárez', role: 'Video Editor', department: 'Creative', reportsTo: 'sofia-chen', readinessScore: 30, onboardingComplete: true, knowledgeBase: emiliaKB, onboardingMessages: emiliaKB.rawTranscript },
  ],
}

export const NOVA_COMMERCE_DEMO: DemoCompany = {
  name: 'Nova Commerce',
  description: 'Ecommerce startup building curated product experiences for Latin America.',
  agents: [
    { id: 'elena-vega', name: 'Elena Vega', role: 'CEO', department: 'Founders', reportsTo: null, readinessScore: 100, onboardingComplete: true, knowledgeBase: elenaKB, onboardingMessages: elenaKB.rawTranscript },
    { id: 'rodrigo-castro', name: 'Rodrigo Castro', role: 'Head of Growth', department: 'Growth', reportsTo: 'elena-vega', readinessScore: 100, onboardingComplete: true, knowledgeBase: rodrigoKB, onboardingMessages: rodrigoKB.rawTranscript },
    { id: 'paula-jimenez', name: 'Paula Jiménez', role: 'Head of Operations', department: 'Operations', reportsTo: 'elena-vega', readinessScore: 100, onboardingComplete: true, knowledgeBase: paulaKB, onboardingMessages: paulaKB.rawTranscript },
    shell('matias-romero', 'Matías Romero', 'Full Stack Developer', 'Technology', 'elena-vega'),
    shell('camila-aguirre', 'Camila Aguirre', 'Customer Success', 'Operations', 'paula-jimenez'),
  ],
}
