export type Topic = {
  id: string;
  name: string;
  category: string;
  exams: string[];
};

export type Exam = {
  id: string;
  name: string;
  short: string;
  description: string;
  categories: { stage: string; name: string; subjectId: string; topicIds: string[] }[];
};

type Pair = readonly [string, string];
type SubjectGroup = { name: string; stage: string; topics: Pair[] };

function subjectKey(name: string) {
  const normalized = name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
  if (normalized.includes("general intelligence") && normalized.includes("reasoning")) return "reasoning";
  if (normalized === "english language and comprehension") return "english";
  if (normalized === "english language advanced") return "english";
  if (normalized.includes("english writing skills")) return "english-writing";
  if (normalized === "mathematical abilities") return "quant";
  if (normalized === "quantitative aptitude") return "quant";
  if (normalized.includes("english descriptive")) return "english-descriptive";
  return normalized;
}

const QUANT: Pair[] = [
  ["quant.simplification","Simplification & Approximation"],["quant.number-system","Number System"],["quant.hcf-lcm","HCF & LCM"],
  ["quant.percentages","Percentage"],["quant.ratio","Ratio & Proportion"],["quant.average","Average"],["quant.profit-loss","Profit, Loss & Discount"],
  ["quant.simple-interest","Simple Interest"],["quant.compound-interest","Compound Interest"],["quant.time-work","Time & Work"],["quant.pipes-cisterns","Pipes & Cisterns"],
  ["quant.time-distance","Time, Speed & Distance"],["quant.boats-streams","Boats & Streams"],["quant.trains","Problems on Trains"],["quant.partnership","Partnership"],
  ["quant.mixture","Mixture & Alligation"],["quant.ages","Problems on Ages"],["quant.probability","Probability"],["quant.permutation-combination","Permutation & Combination"],
  ["quant.sequence","Number Series"],["quant.quadratic","Quadratic Equations"],["quant.arithmetic-equations","Arithmetic Equations"],["quant.data-sufficiency","Data Sufficiency"],
  ["quant.data-interpretation","Data Interpretation"],["quant.line-di","Line Graphs"],["quant.bar-di","Bar Graphs"],["quant.pie-di","Pie Charts"],
  ["quant.caselet-di","Caselet DI"],["quant.mensuration","Mensuration"],["quant.geometry","Geometry"],["quant.algebra","Algebra"],["quant.trigonometry","Trigonometry"],["quant.statistics","Statistics"]
];

const REASONING: Pair[] = [
  ["reasoning.inequality","Inequality"],["reasoning.syllogism","Syllogism"],["reasoning.coding","Coding-Decoding"],["reasoning.alphanumeric","Alphanumeric Series"],
  ["reasoning.direction","Direction & Distance"],["reasoning.blood-relations","Blood Relations"],["reasoning.order-ranking","Order & Ranking"],["reasoning.input-output","Input-Output"],
  ["reasoning.puzzles","Puzzles"],["reasoning.seating","Seating Arrangement"],["reasoning.logical-reasoning","Logical Reasoning"],["reasoning.data-sufficiency","Data Sufficiency"],
  ["reasoning.statement-assumption","Statement & Assumption"],["reasoning.statement-conclusion","Statement & Conclusion"],["reasoning.statement-argument","Statement & Argument"],
  ["reasoning.cause-effect","Cause & Effect"],["reasoning.course-action","Course of Action"],["reasoning-analogy","Analogy"],["reasoning.classification","Classification"],
  ["reasoning.series","Series"],["reasoning.calendar","Calendar"],["reasoning.clock","Clock"],["reasoning.odd-one-out","Odd One Out"],["reasoning.embedded-figures","Embedded Figures"],
  ["reasoning.visual-reasoning","Non-verbal / Figure Reasoning"],["reasoning.word-formation","Word Formation"],
  ["reasoning.order-sequence","Ordering & Sequencing"],["reasoning.logical-connectives","Logical Connectives"],["reasoning.inference","Drawing Inferences"],
  ["reasoning.critical-thinking","Critical Thinking"],["reasoning.symbol-operations","Symbolic Operations"],["reasoning.matrix","Number / Figure Matrix"],
  ["reasoning.paper-folding","Paper Folding & Cutting"],["reasoning.mirror-water-images","Mirror & Water Images"],["reasoning.figure-completion","Figure Completion"],
  ["reasoning.spatial-orientation","Spatial Orientation"],["reasoning.visual-memory","Visual Memory & Observation"]
];

const ENGLISH: Pair[] = [
  ["english.reading","Reading Comprehension"],["english.cloze","Cloze Test"],["english.error","Error Detection"],["english.fillers","Fill in the Blanks"],
  ["english.parajumbles","Para Jumbles"],["english.vocabulary","Vocabulary"],["english.grammar","Grammar"],["english.sentence-improvement","Sentence Improvement"],
  ["english.phrasal-verbs","Phrasal Verbs"],["english.synonyms-antonyms","Synonyms & Antonyms"],["english.one-word","One Word Substitution"],["english.spelling","Spelling"],
  ["english.para-completion","Para Completion"],["english.sentence-rearrangement","Sentence Rearrangement"],["english-word-usage","Word Usage"],
  ["english.sentence-connectors","Sentence Connectors"],["english.mis-spelt-words","Misspelt Words"],["english.word-swapping","Word Swapping"],
  ["english.phrase-replacement","Phrase Replacement"],["english.sentence-completion","Sentence Completion"],["english.rearrangement","Sentence / Paragraph Rearrangement"],
  ["english.grammar-agreement","Subject-Verb Agreement"],["english.prepositions","Prepositions & Conjunctions"],["english.active-passive","Active & Passive Voice"],
  ["english.direct-indirect","Direct & Indirect Speech"],["english.modifiers","Modifiers & Parallelism"]
];

const COMPUTER: Pair[] = [
  ["computer.fundamentals","Computer Fundamentals"],["computer.hardware","Computer Hardware & Input/Output Devices"],["computer.software","Software & Windows Basics"],["computer.operating-systems","Operating Systems"],
  ["computer.internet","Internet, Networking & E-mail"],["computer.ms-office","MS Office (Word, Excel & PowerPoint)"],["computer.database","Database Basics"],["computer.security","Computer Security & Cybersecurity"],
  ["computer.shortcuts","Keyboard Shortcuts"],["computer.number-system","Computer Number System & Common Ports"],
  ["computer.memory","Computer Memory & Storage"],["computer.input-output","Input / Output Devices"],["computer.data-representation","Data Representation & Units"],
  ["computer.network-types","Network Types & Topologies"],["computer.protocols","Internet Protocols & Web Basics"],["computer.email","Email & Communication Tools"],
  ["computer.operating-shortcuts","Operating System Basics & Shortcuts"],["computer.virus-malware","Viruses, Malware & Protection"],["computer.cloud","Cloud Computing Basics"],
  ["computer.ai-basics","AI & Emerging Technology Basics"]
];

const CURRENT_AFFAIRS: Pair[] = [
  ["ga.current-affairs","Current Affairs"],["ga.government-schemes","Government Schemes"],["ga.reports-indices","Reports & Indices"],
  ["ga.international","International Affairs"],["ga.awards","Awards & Honours"],["ga.books","Books & Authors"],["ga.sports","Sports"],
  ["ga.obituaries","Important Appointments & Obituaries"],["ga.commissions","Important Institutions & Commissions"],
  ["ga.defence","Defence Exercises & Organisations"],["ga.places","Places in News"],["ga.days-themes","Important Days & Themes"],
  ["ga.national-parks","National Parks & Protected Areas"],["ga.census","Census & Demographic Indicators"],["ga.organisations","National & International Organisations"],
  ["ga.science-tech","Science & Technology in News"],["ga.summits","Summits & Conferences"]
];

const DIGITAL_AWARENESS: Pair[] = [["digital.payments","Digital Payments"],["digital.upi","UPI & Payment Systems"],["digital.fintech","FinTech & Digital Banking"],["digital.cyber","Cyber Security & Safe Banking"]];

const GENERAL_AWARENESS: Pair[] = [
  ...CURRENT_AFFAIRS,["ga.static-gk","Static GK"],["ga.politics","Indian Polity"],["ga.history","History"],["ga.geography","Geography"],
  ["ga.science","General Science"],["ga.environment","Environment & Ecology"]
];

const ECONOMY_AWARENESS: Pair[] = [
  ["ga.economy","Indian Economy"],["rbi.union-budget","Union Budget"],["rbi.fiscal-policy","Fiscal Policy"],
  ["rbi.monetary-policy","Monetary Policy"],["rbi.inflation","Inflation"]
];

const BANKING_AWARENESS: Pair[] = [
  ["ga.banking","Banking Awareness"],["rbi.financial-system","Financial System"],["rbi.banking-system","Banking System"],
  ["rbi.banking-regulation","Banking Regulation"],["rbi.sebi","SEBI & Capital Markets"],["rbi.insurance","Insurance"],["rbi.pension","Pension"]
];

const FINANCIAL_AWARENESS: Pair[] = [
  ["ga.financial-awareness","Financial Awareness"],["rbi.financial-markets","Financial Markets"],["rbi.external-sector","External Sector"],
  ["rbi.forex","Foreign Exchange"],["rbi.imf-world-bank","IMF & World Bank"],["rbi.wto","WTO"],...DIGITAL_AWARENESS
];

const DATA_ANALYSIS: Pair[] = [
  ["quant.data-interpretation","Data Interpretation"],["quant.data-sufficiency","Data Sufficiency"],
  ["quant.missing-di","Missing / Caselet Data Interpretation"],
  ["quant.quantity-comparison","Quantity Comparison"],["quant.data-comparison","Data Comparison"],["quant.table-di","Table DI"],["quant.mixed-di","Mixed Graph DI"]
];

const RBI_ESI: Pair[] = [
  ["rbi.inflation","Inflation"],["rbi.growth-development","Growth & Development"],["rbi.national-income","National Income"],["rbi.employment","Employment"],
  ["rbi.poverty","Poverty & Inequality"],["rbi.globalisation","Globalisation"],["rbi.bop","Balance of Payments"],["rbi.esi","Economic & Social Issues"],
  ["rbi.imf-world-bank","IMF & World Bank"],["rbi.wto","WTO"],["rbi.monetary-policy","Monetary Policy"],["rbi.fiscal-policy","Fiscal Policy"],
  ["rbi.growth-models","Growth Models & Development Strategies"],["rbi.sustainable-development","Sustainable Development Goals"],
  ["rbi.demographics","Demographics, Migration & Urbanisation"],["rbi.health-education","Health, Education & Human Development"],
  ["rbi.social-justice","Social Justice & Welfare Programmes"],["rbi.climate-economy","Climate Change & Economy"],
  ["rbi.agriculture","Agriculture, Food Security & Rural Development"],["rbi.international-trade","International Trade & Trade Policy"],
  ["rbi.social-sector","Social Sector Initiatives & Government Programmes"]
];

const RBI_FINANCE: Pair[] = [
  ["rbi.financial-system","Financial System"],["rbi.financial-markets","Financial Markets"],["rbi.banking-system","Banking System"],["rbi.banking-regulation","Banking Regulation"],
  ["rbi.sebi","SEBI & Capital Markets"],["rbi.insurance","Insurance"],["rbi.pension","Pension"],["rbi.external-sector","External Sector"],
  ["rbi.forex","Foreign Exchange"],["rbi.public-finance","Public Finance"],["rbi.union-budget","Union Budget"],["rbi.monetary-policy","Monetary Policy"],
  ["rbi.fiscal-policy","Fiscal Policy"],["rbi.inflation","Inflation"],["rbi.imf-world-bank","IMF & World Bank"],["rbi.wto","WTO"],
  ["rbi.government-securities","Government Securities & Bond Markets"],["rbi.money-market","Money Market Instruments"],
  ["rbi.capital-market","Capital Market Instruments"],["rbi.derivatives","Derivatives & Risk Management"],
  ["rbi.financial-inclusion","Financial Inclusion & Priority Sector"],["rbi.regulatory-bodies","Financial Regulators & Institutions"],
  ["rbi.npa","NPA Management & Basel Framework"],["rbi.fintech","FinTech, Digital Payments & Cybersecurity"],
  ["rbi.public-debt","Public Debt & Fiscal Deficit"],["rbi.taxation","Taxation & GST"],
  ["rbi.international-finance","International Financial Institutions & Architecture"]
];

const RBI_MANAGEMENT: Pair[] = [
  ["rbi.management","Management"],["rbi.corporate-governance","Corporate Governance"],["rbi.hrd","Human Resource Development"],["rbi.leadership","Leadership"],
  ["rbi.motivation","Motivation"],["rbi.communication","Communication"],["rbi.organisation","Organisational Structure & Design"],["rbi.planning","Planning & Decision Making"],
  ["rbi.control","Control & Coordination"],["rbi.conflict","Conflict Management & Negotiation"],["rbi.change-management","Change Management"],
  ["rbi.performance","Performance Appraisal & HR Practices"],["rbi.teamwork","Teams & Group Dynamics"],["rbi.work-culture","Organisational Culture & Ethics"]
];

const SEBI_COMMERCE: Pair[] = [
  ["sebi.accounting","Accounting"],["sebi.financial-statement","Financial Statements"],["sebi.accounting-standards","Accounting Standards"],
  ["sebi.audit","Auditing"],["sebi.financial-ratio","Financial Statement Analysis"],
  ["sebi.accounting-concepts","Accounting Principles & Concepts"],["sebi.company-accounts","Company Accounts"],
  ["sebi.cash-flow","Cash Flow & Funds Flow Statements"],["sebi.consolidation","Consolidated Financial Statements"],
  ["sebi.ind-as","Indian Accounting Standards (Ind AS)"],["sebi.corporate-reporting","Corporate Financial Reporting"]
];
const SEBI_FINANCE: Pair[] = [
  ["sebi.securities-market","Securities Market"],["rbi.financial-markets","Financial Markets"],["sebi.equity-market","Equity Markets"],
  ["sebi.debt-market","Debt Markets"],["sebi.mutual-funds","Mutual Funds"],["sebi.derivatives","Derivatives"],
  ["sebi.forex","Foreign Exchange"],["sebi.banking","Banking & Financial System"],["sebi.financial-inclusion","Financial Inclusion"],
  ["sebi-regulation","Securities Regulation"],["sebi.primary-market","Primary Market & Public Issues"],["sebi.secondary-market","Secondary Market & Trading"],
  ["sebi.market-intermediaries","Market Intermediaries & Depositories"],["sebi.investor-protection","Investor Protection & Grievance Redressal"],
  ["sebi.mutual-regulation","Mutual Fund Regulation"],["sebi.insider-trading","Insider Trading & Takeover Regulations"],
  ["sebi.listing-regulations","Listing Obligations & Disclosure Requirements"],["sebi.securitisation","Securitisation & Structured Finance"]
];
const SEBI_ECONOMICS: Pair[] = [
  ["sebi.economics","Economics"],["sebi.microeconomics","Microeconomics"],["sebi.macroeconomics","Macroeconomics"],
  ["sebi.economic-growth","Economic Growth & Development"],["sebi.inflation-policy","Inflation & Monetary Policy"],
  ["sebi.fiscal-policy","Fiscal Policy & Public Finance"],["sebi.international-economics","International Economics & Trade"],
  ["sebi.economic-indicators","National Income & Economic Indicators"]
];
const SEBI_MANAGEMENT: Pair[] = [
  ...RBI_MANAGEMENT,["sebi.management-principles","Management Principles & Functions"],["sebi.strategic-management","Strategic Management"],
  ["sebi.marketing-management","Marketing Management"],["sebi.operations-management","Operations & Quality Management"],
  ["sebi.project-management","Project Management"],["sebi.business-ethics","Business Ethics & Corporate Governance"],
  ["sebi.hr-management","Human Resource Management"],["sebi.organisation-behaviour","Organisational Behaviour"]
];
const SEBI_COSTING: Pair[] = [
  ["sebi.costing","Cost & Management Accounting"],["sebi.cost-accounting","Cost Accounting"],["sebi.budgetary-control","Budgetary Control"],
  ["sebi.marginal-costing","Marginal Costing & CVP Analysis"],["sebi.standard-costing","Standard Costing & Variance Analysis"],
  ["sebi.absorption-costing","Absorption Costing"],["sebi.activity-costing","Activity-Based Costing"],
  ["sebi.cost-control","Cost Control & Cost Reduction"],["sebi.management-accounting","Management Accounting & Decision Making"]
];
const SEBI_COMPANIES: Pair[] = [
  ["sebi.companies","Companies Act & Corporate Law"],["sebi.corporate-governance","Corporate Governance"],
  ["sebi.company-formation","Incorporation & Share Capital"],["sebi.board-management","Board of Directors & Management"],
  ["sebi.company-meetings","Company Meetings & Resolutions"],["sebi.audit-company-law","Accounts, Audit & Auditors under Companies Act"],
  ["sebi.csr","Corporate Social Responsibility"],["sebi.llp","Company Law, LLPs & Related Provisions"]
];
const NABARD_ESI: Pair[] = [
  ["rbi.esi","Economic & Social Issues"],["ga.economy","Indian Economy"],["rbi.inflation","Inflation"],["nabard.poverty","Poverty Alleviation"],
  ["nabard.employment","Employment Generation"],["nabard.population","Population & Demography"],["nabard.social-structure","Social Structure"],["nabard.social-justice","Social Justice"],
  ["nabard.education-health","Education & Health"],["nabard.environment","Environment"],["nabard-climate-change","Climate Change & Sustainable Development"],
  ["nabard.indian-economy","Structure of Indian Economy & Economic Reforms"],["nabard.rural-economy","Rural Economy & Rural Labour"],
  ["nabard.inflation-policy","Inflation, Monetary & Fiscal Policy"],["nabard.poverty-programmes","Poverty Alleviation & Government Programmes"],
  ["nabard.demographic-trends","Demographic Trends & Migration"],["nabard.health-education","Education, Health & Human Development"],
  ["nabard.farmers","Farmers, Land Reforms & Tenancy"],["nabard.food-security","Food Security & Public Distribution"],
  ["nabard.social-protection","Social Protection & Inclusive Growth"]
];
const NABARD_ARD: Pair[] = [
  ["nabard.agriculture-basics","Agriculture Basics"],["nabard.agronomy","Agronomy"],["nabard.soil","Soils & Soil Management"],["nabard.water","Water Resources & Irrigation"],
  ["nabard.cropping","Cropping Systems"],["nabard.seeds","Seeds & Planting Material"],["nabard.plant-breeding","Plant Breeding"],["nabard.horticulture","Horticulture"],
  ["nabard.animal-husbandry","Animal Husbandry"],["nabard.dairy","Dairy Development"],["nabard.fisheries","Fisheries"],["nabard.forestry","Forestry"],
  ["nabard.food-processing","Food Processing"],["nabard.agri-marketing","Agricultural Marketing"],["nabard.agri-schemes","Agriculture & Rural Development Schemes"],
  ["nabard.rural-development","Rural Development"],["nabard.panchayati-raj","Panchayati Raj"],["nabard.tribal-development","Tribal Development"],
  ["nabard.agriculture-economy","Agriculture in Indian Economy"],["nabard.agri-extension","Agricultural Extension & Technology Transfer"],
  ["nabard.plant-protection","Plant Protection & Integrated Pest Management"],["nabard.organic-farming","Organic & Natural Farming"],
  ["nabard.agri-research","Agricultural Research & Education"],["nabard.climate-agriculture","Climate Change & Sustainable Agriculture"],
  ["nabard.agri-insurance","Crop Insurance & Risk Management"],["nabard.cooperatives","Cooperatives, FPOs & SHGs"],
  ["nabard.rural-infrastructure","Rural Infrastructure & Development Institutions"],["nabard.irrigation-schemes","Irrigation Programmes & Watershed Development"],
  ["nabard.livestock-health","Livestock Health, Breeds & Management"],["nabard.fisheries-aquaculture","Fisheries & Aquaculture"],
  ["nabard.agri-marketing-reforms","Agricultural Markets, MSP & Marketing Reforms"]
];
const NABARD_FINANCE: Pair[] = [
  ["nabard.rural-banking","Rural Banking"],["nabard.rural-credit","Rural Credit"],["rbi.financial-system","Financial System"],["nabard.banking-reforms","Banking & Financial Sector Reforms"],["nabard.agri-finance","Agricultural Finance"]
];

const DESCRIPTIVE: Pair[] = [["english.descriptive","Descriptive English"],["english.essay","Essay Writing"],["english.comprehension","Comprehension"],["english.precis","Precis Writing"],["english.email","Email Writing"]];
const DECISION_MAKING: Pair[] = [["reasoning.decision-making","Decision Making"],["reasoning.ethics","Ethical Reasoning"],["reasoning.situational","Situational Judgement"]];
const SSC_MATH: Pair[] = QUANT.filter(([id]) => new Set([
  "quant.number-system","quant.percentages","quant.ratio","quant.average","quant.profit-loss","quant.simple-interest",
  "quant.compound-interest","quant.time-work","quant.time-distance","quant.partnership","quant.mixture","quant.ages",
  "quant.quadratic","quant.arithmetic-equations","quant.data-interpretation","quant.line-di","quant.bar-di","quant.pie-di",
  "quant.caselet-di","quant.mensuration","quant.geometry","quant.algebra","quant.trigonometry","quant.statistics","quant.probability",
  "quant.hcf-lcm","quant.simplification","quant.sequence"
]).has(id));
const SSC_COMPUTER: Pair[] = [["computer.fundamentals","Computer Fundamentals"],["computer.hardware","Computer Hardware & Input/Output Devices"],["computer.software","Software & Windows Basics"],["computer.ms-office","MS Office (Word, Excel & PowerPoint)"],["computer.internet","Internet, Networking & E-mail"],["computer.security","Computer Security & Cybersecurity"],["computer.shortcuts","Keyboard Shortcuts"],["computer.number-system","Computer Number System & Common Ports"]];
const EXAM_GROUPS: Record<string, SubjectGroup[]> = {
  "ibps-po":[
    {stage:"Prelims",name:"English Language",topics:ENGLISH},
    {stage:"Prelims",name:"Quantitative Aptitude",topics:QUANT},
    {stage:"Prelims",name:"Reasoning Ability",topics:REASONING},
    {stage:"Mains",name:"Reasoning Ability",topics:REASONING},
    {stage:"Mains",name:"Computer Aptitude",topics:COMPUTER},
    {stage:"Mains",name:"Data Analysis & Interpretation",topics:DATA_ANALYSIS},
    {stage:"Mains",name:"English Language",topics:ENGLISH},
    {stage:"Mains",name:"General Awareness",topics:GENERAL_AWARENESS},
    {stage:"Mains",name:"Economy Awareness",topics:ECONOMY_AWARENESS},
    {stage:"Mains",name:"Banking Awareness",topics:BANKING_AWARENESS},
    {stage:"Mains",name:"Financial Awareness",topics:FINANCIAL_AWARENESS},
    {stage:"Mains",name:"Descriptive English",topics:DESCRIPTIVE}
  ],
  "sbi-po":[
    {stage:"Prelims",name:"English Language",topics:ENGLISH},
    {stage:"Prelims",name:"Quantitative Aptitude",topics:QUANT},
    {stage:"Prelims",name:"Reasoning Ability",topics:REASONING},
    {stage:"Mains",name:"Reasoning Ability",topics:REASONING},
    {stage:"Mains",name:"Computer Aptitude",topics:COMPUTER},
    {stage:"Mains",name:"Data Analysis & Interpretation",topics:DATA_ANALYSIS},
    {stage:"Mains",name:"General Awareness",topics:GENERAL_AWARENESS},
    {stage:"Mains",name:"Economy Awareness",topics:ECONOMY_AWARENESS},
    {stage:"Mains",name:"Banking Awareness",topics:BANKING_AWARENESS},
    {stage:"Mains",name:"Financial Awareness",topics:FINANCIAL_AWARENESS},
    {stage:"Mains",name:"English Language",topics:ENGLISH},
    {stage:"Mains",name:"Descriptive English",topics:DESCRIPTIVE}
  ],
  "rrb-po":[
    {stage:"Prelims",name:"Reasoning Ability",topics:REASONING},
    {stage:"Prelims",name:"Quantitative Aptitude",topics:QUANT},
    {stage:"Mains",name:"Reasoning Ability",topics:REASONING},
    {stage:"Mains",name:"Quantitative Aptitude",topics:QUANT},
    {stage:"Mains",name:"General Awareness",topics:GENERAL_AWARENESS},
    {stage:"Mains",name:"Computer Knowledge",topics:COMPUTER},
    {stage:"Mains",name:"English Language",topics:ENGLISH}
  ],
  "rbi-grade-b":[
    {stage:"Phase I",name:"General Awareness",topics:GENERAL_AWARENESS},
    {stage:"Phase I",name:"English Language",topics:ENGLISH},
    {stage:"Phase I",name:"Quantitative Aptitude",topics:QUANT},
    {stage:"Phase I",name:"Reasoning Ability",topics:REASONING},
    {stage:"Phase II",name:"Economic & Social Issues",topics:RBI_ESI},
    {stage:"Phase II",name:"Finance",topics:RBI_FINANCE},
    {stage:"Phase II",name:"Management",topics:RBI_MANAGEMENT},
    {stage:"Phase II",name:"English Writing Skills",topics:DESCRIPTIVE}
  ],
  "sebi-grade-a":[
    {stage:"Phase I",name:"General Awareness",topics:GENERAL_AWARENESS},
    {stage:"Phase I",name:"English Language",topics:ENGLISH},
    {stage:"Phase I",name:"Quantitative Aptitude",topics:QUANT},
    {stage:"Phase I",name:"Reasoning Ability",topics:REASONING},
    {stage:"Phase II",name:"English Descriptive",topics:DESCRIPTIVE},
    {stage:"Phase II",name:"Commerce & Accountancy",topics:SEBI_COMMERCE},
    {stage:"Phase II",name:"Management",topics:SEBI_MANAGEMENT},
    {stage:"Phase II",name:"Finance",topics:SEBI_FINANCE},
    {stage:"Phase II",name:"Costing",topics:SEBI_COSTING},
    {stage:"Phase II",name:"Companies Act",topics:SEBI_COMPANIES},
    {stage:"Phase II",name:"Economics",topics:SEBI_ECONOMICS}
  ],
  "nabard-grade-a":[
    {stage:"Prelims",name:"Reasoning Ability",topics:REASONING},
    {stage:"Prelims",name:"English Language",topics:ENGLISH},
    {stage:"Prelims",name:"Computer Knowledge",topics:COMPUTER},
    {stage:"Prelims",name:"Quantitative Aptitude",topics:QUANT},
    {stage:"Prelims",name:"Decision Making",topics:DECISION_MAKING},
    {stage:"Prelims",name:"General Awareness",topics:GENERAL_AWARENESS},
    {stage:"Prelims",name:"Economic & Social Issues",topics:NABARD_ESI},
    {stage:"Prelims",name:"Agriculture & Rural Development",topics:NABARD_ARD},
    {stage:"Mains",name:"English Descriptive",topics:DESCRIPTIVE},
    {stage:"Mains",name:"Economic & Social Issues",topics:NABARD_ESI},
    {stage:"Mains",name:"Agriculture & Rural Development",topics:NABARD_ARD}
  ],
  "ssc-cgl":[
    {stage:"Tier I",name:"Mathematical Abilities",topics:SSC_MATH},
    {stage:"Tier I",name:"General Intelligence & Reasoning",topics:REASONING},
    {stage:"Tier I",name:"English Language & Comprehension",topics:ENGLISH},
    {stage:"Tier I",name:"General Awareness",topics:GENERAL_AWARENESS},
    {stage:"Tier II",name:"Mathematical Abilities",topics:SSC_MATH},
    {stage:"Tier II",name:"Reasoning & General Intelligence",topics:REASONING},
    {stage:"Tier II",name:"English Language & Comprehension",topics:ENGLISH},
    {stage:"Tier II",name:"General Awareness",topics:GENERAL_AWARENESS},
    {stage:"Tier II",name:"Computer Knowledge",topics:SSC_COMPUTER}
  ]
};


function buildData() {
  const map = new Map<string, Topic>();
  const examMap: Record<string,string[]> = {};
  for (const [exam, subjectGroups] of Object.entries(EXAM_GROUPS)) {
    examMap[exam] = [];
    for (const group of subjectGroups) for (const [id,name] of group.topics) {
      if (!map.has(id)) map.set(id,{id,name,category:group.name,exams:[]});
      const topic = map.get(id)!;
      if (!topic.exams.includes(exam)) topic.exams.push(exam);
      if (!examMap[exam].includes(id)) examMap[exam].push(id);
    }
  }
  return {topics:[...map.values()],examMap};
}

export const {topics:TOPICS,examMap:EXAM_TOPIC_IDS}=buildData();

export const EXAMS: Exam[] = [
  {id:"ibps-po",name:"IBPS PO",short:"IB",description:"Probationary Officer"},
  {id:"sbi-po",name:"SBI PO",short:"SB",description:"Probationary Officer"},
  {id:"rrb-po",name:"RRB PO",short:"RB",description:"Officer Scale I"},
  {id:"rbi-grade-b",name:"RBI Grade B",short:"RB",description:"General Cadre"},
  {id:"sebi-grade-a",name:"SEBI Grade A",short:"SE",description:"General Stream"},
  {id:"nabard-grade-a",name:"NABARD Grade A",short:"NA",description:"RDBS / General"},
  {id:"ssc-cgl",name:"SSC CGL",short:"SS",description:"Combined Graduate Level"}
].map(exam=>({...exam,categories:EXAM_GROUPS[exam.id].map(group=>({stage:group.stage,name:group.name,subjectId:subjectKey(group.name),topicIds:[...new Set(group.topics.map(([id])=>id))]}))}));

export const DATA_VERSION="2026.10.28-syllabus-audit-v7";
