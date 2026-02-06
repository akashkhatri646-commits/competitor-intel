// ============================================================
// TYPES
// ============================================================

export type ThreatLevel = "critical" | "high" | "medium" | "low";
export type InsightCategory = "product" | "pricing" | "positioning" | "hiring" | "funding" | "partnership" | "technical";
export type SourceType = "blog" | "press-release" | "job-posting" | "github" | "social-media" | "news-article" | "documentation" | "review-site";
export type SignalStrength = "strong" | "moderate" | "weak";
export type CompetitorType = "direct" | "indirect" | "emerging";
export type InsightImpact = "high" | "medium" | "low";
export type TeamRelevance = "product" | "engineering" | "gtm" | "leadership";
export type VerificationStatus = "verified" | "pending" | "unverified" | "rejected";
export type RejectionReason = "inaccurate" | "duplicate" | "low-relevance" | "outdated";

export interface Competitor {
  id: string;
  slug: string;
  name: string;
  type: CompetitorType;
  description: string;
  website: string;
  threatLevel: ThreatLevel;
  threatScore: number;
  founded: string;
  funding: string;
  employees: string;
  headquarters: string;
  keyProducts: string[];
  strengths: string[];
  weaknesses: string[];
  recentMoves: string[];
  signalCount30d: number;
  lastActivityDate: string;
}

export interface Source {
  id: string;
  url: string;
  title: string;
  type: SourceType;
  publishedAt: string;
  scrapedAt: string;
  competitorId: string;
  snippet: string;
  reliability: "verified" | "unverified";
}

export interface Signal {
  id: string;
  competitorId: string;
  sourceId: string;
  category: InsightCategory;
  title: string;
  summary: string;
  detectedAt: string;
  strength: SignalStrength;
}

export interface InsightVerification {
  verifiedBy: string;
  verifiedAt: string;
  verifierRole: string;
  verifierComment?: string;
}

export interface InsightComment {
  id: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Insight {
  id: string;
  title: string;
  synthesis: string;
  category: InsightCategory;
  impact: InsightImpact;
  teamRelevance: TeamRelevance[];
  competitorIds: string[];
  sourceIds: string[];
  signalIds: string[];
  generatedAt: string;
  confidence: number;
  recommendations: string[];
  status: "new" | "past"; // "new" = within last 7 days and unseen, "past" = older or seen
  verificationStatus: VerificationStatus;
  verification?: InsightVerification;
  rejectionReason?: RejectionReason;
  rejectedAt?: string;
  rejectedBy?: string;
  comments?: InsightComment[];
  relatedInsightIds?: string[];
}

export interface Battlecard {
  id: string;
  competitorId: string;
  updatedAt: string;
  positioning: string;
  ourAdvantages: string[];
  theirAdvantages: string[];
  objectionHandling: { objection: string; response: string }[];
  keyDifferentiators: string[];
  pricingComparison: string;
  winRate: number;
  winRateRationale: string;
  commonScenarios: string[];
}

export interface DashboardKPI {
  label: string;
  value: string;
  change: number;
  changeDirection: "up" | "down" | "flat";
  period: string;
  sparkline: number[];
}

// ============================================================
// CATEGORY & THREAT DISPLAY HELPERS
// ============================================================

export const categoryColors: Record<InsightCategory, string> = {
  product: "#6366f1",
  pricing: "#22c55e",
  positioning: "#a855f7",
  hiring: "#06b6d4",
  funding: "#f59e0b",
  partnership: "#ec4899",
  technical: "#64748b",
};

export const threatColors: Record<ThreatLevel, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

export const sourceTypeLabels: Record<SourceType, string> = {
  blog: "Blog",
  "press-release": "Press Release",
  "job-posting": "Job Posting",
  github: "GitHub",
  "social-media": "Social Media",
  "news-article": "News",
  documentation: "Docs",
  "review-site": "Review",
};

// ============================================================
// COMPETITORS
// ============================================================

export const competitors: Competitor[] = [
  {
    id: "nimbusscale",
    slug: "nimbusscale",
    name: "NimbusScale",
    type: "direct",
    description: "Enterprise cloud infrastructure with managed Kubernetes and AI/ML services. Recently raised $400M Series E.",
    website: "https://nimbusscale.com",
    threatLevel: "critical",
    threatScore: 92,
    founded: "2019",
    funding: "$620M (Series E)",
    employees: "1,800-2,200",
    headquarters: "San Francisco, CA",
    keyProducts: ["NimbusCompute", "NimbusK8s", "NimbusML Studio"],
    strengths: [
      "Massive enterprise sales team (200+ reps)",
      "SOC 2 Type II and FedRAMP certified",
      "Strong managed Kubernetes offering",
      "Aggressive pricing with 3-year commits",
    ],
    weaknesses: [
      "Developer experience rated below average on G2",
      "Slow feature release cadence (quarterly)",
      "High customer churn in SMB segment",
      "Complex onboarding process",
    ],
    recentMoves: [
      "Raised $400M Series E at $4.2B valuation",
      "Launched managed GPU cluster service",
      "Hired former AWS VP as CRO",
    ],
    signalCount30d: 18,
    lastActivityDate: "2026-02-01",
  },
  {
    id: "cloudforge",
    slug: "cloudforge",
    name: "CloudForge",
    type: "direct",
    description: "Developer-first cloud platform built on open-source. Strong community with 40k+ GitHub stars.",
    website: "https://cloudforge.dev",
    threatLevel: "high",
    threatScore: 76,
    founded: "2020",
    funding: "$180M (Series C)",
    employees: "600-800",
    headquarters: "Austin, TX",
    keyProducts: ["ForgeCompute", "ForgeDeploy", "ForgeDB"],
    strengths: [
      "Best-in-class developer experience",
      "Active open-source community (40k+ stars)",
      "Fast iteration — ships weekly",
      "Strong content marketing and DevRel",
    ],
    weaknesses: [
      "Limited enterprise features (no SSO until recently)",
      "Small sales team, weak in enterprise deals",
      "Narrow product surface — gaps in networking/security",
      "No government/compliance certifications",
    ],
    recentMoves: [
      "Launched SSO and RBAC for enterprise tier",
      "Open-sourced their deployment engine",
      "Crossed 10,000 paying customers",
    ],
    signalCount30d: 15,
    lastActivityDate: "2026-01-30",
  },
  {
    id: "skyvault",
    slug: "skyvault",
    name: "SkyVault",
    type: "direct",
    description: "Compliance-focused cloud for regulated industries. FedRAMP High, HIPAA, and PCI-DSS certified.",
    website: "https://skyvault.io",
    threatLevel: "medium",
    threatScore: 62,
    founded: "2018",
    funding: "$340M (Series D)",
    employees: "1,200-1,500",
    headquarters: "Washington, DC",
    keyProducts: ["VaultCloud", "VaultShield", "VaultGov"],
    strengths: [
      "Industry-leading compliance certifications",
      "Strong government and healthcare wins",
      "Dedicated compliance automation tools",
      "High net retention rate (135%)",
    ],
    weaknesses: [
      "Premium pricing — 40% above market average",
      "Slow to adopt modern developer workflows",
      "Perceived as 'boring' by developer community",
      "Limited global presence (US-focused)",
    ],
    recentMoves: [
      "Won $85M DOD contract",
      "Launched healthcare-specific compliance suite",
      "Opened first European data center in Frankfurt",
    ],
    signalCount30d: 7,
    lastActivityDate: "2026-01-28",
  },
  {
    id: "infralayer",
    slug: "infralayer",
    name: "InfraLayer",
    type: "direct",
    description: "Budget-friendly cloud targeting price-sensitive startups and SMBs. Global presence in 30+ regions.",
    website: "https://infralayer.com",
    threatLevel: "low",
    threatScore: 32,
    founded: "2017",
    funding: "$250M (Series D)",
    employees: "900-1,100",
    headquarters: "Berlin, Germany",
    keyProducts: ["LayerCompute", "LayerStore", "LayerCDN"],
    strengths: [
      "30-50% cheaper than major cloud providers",
      "Global presence — 32 data center regions",
      "Simple, transparent pricing (no hidden fees)",
      "Strong in European and APAC markets",
    ],
    weaknesses: [
      "Limited managed services — IaaS-heavy",
      "Support response times average 4+ hours",
      "No native AI/ML services",
      "Smaller ecosystem — fewer integrations",
    ],
    recentMoves: [
      "Expanded to 5 new APAC regions",
      "Launched $0.005/hr compute instances",
      "Partnership with Terraform for native integration",
    ],
    signalCount30d: 2,
    lastActivityDate: "2026-01-25",
  },
  {
    id: "edgepulse",
    slug: "edgepulse",
    name: "EdgePulse",
    type: "indirect",
    description: "Edge computing platform pushing workloads closer to users. Encroaching on core cloud with edge-native applications.",
    website: "https://edgepulse.io",
    threatLevel: "medium",
    threatScore: 45,
    founded: "2021",
    funding: "$95M (Series B)",
    employees: "250-350",
    headquarters: "Seattle, WA",
    keyProducts: ["PulseEdge", "PulseRun", "PulseStream"],
    strengths: [
      "Sub-10ms latency to 95% of global users",
      "Innovative edge-native runtime",
      "Strong IoT and real-time workload positioning",
      "Growing developer mindshare",
    ],
    weaknesses: [
      "Limited compute capacity per edge node",
      "Not suitable for heavy batch/data workloads",
      "Small partner ecosystem",
      "Unproven at large enterprise scale",
    ],
    recentMoves: [
      "Launched edge-native database with global replication",
      "Partnership with Cloudflare for extended PoPs",
      "Published benchmarks showing 5x latency improvement vs cloud",
    ],
    signalCount30d: 16,
    lastActivityDate: "2026-01-27",
  },
  {
    id: "devstreamio",
    slug: "devstreamio",
    name: "DevStreamIO",
    type: "indirect",
    description: "PaaS and serverless platform abstracting away infrastructure. Appeals to developers who don't want to manage servers.",
    website: "https://devstream.io",
    threatLevel: "low",
    threatScore: 25,
    founded: "2022",
    funding: "$45M (Series A)",
    employees: "120-180",
    headquarters: "Portland, OR",
    keyProducts: ["StreamDeploy", "StreamFunctions", "StreamDB"],
    strengths: [
      "Zero-config deployment experience",
      "Generous free tier attracts indie developers",
      "Fast-growing community (15k Discord members)",
      "Excellent documentation and tutorials",
    ],
    weaknesses: [
      "Lock-in concerns — proprietary runtime",
      "Limited customization for power users",
      "No enterprise security features",
      "High cost at scale (serverless tax)",
    ],
    recentMoves: [
      "Launched AI function builder with GPT integration",
      "Hit 50,000 free-tier developers",
      "Hired VP of Engineering from Vercel",
    ],
    signalCount30d: 13,
    lastActivityDate: "2026-01-22",
  },
  {
    id: "quantumbase",
    slug: "quantumbase",
    name: "QuantumBase",
    type: "emerging",
    description: "AI-native cloud startup building infrastructure optimized for model training and inference from the ground up.",
    website: "https://quantumbase.ai",
    threatLevel: "high",
    threatScore: 85,
    founded: "2024",
    funding: "$120M (Seed + Series A)",
    employees: "80-120",
    headquarters: "Palo Alto, CA",
    keyProducts: ["QBase Train", "QBase Inference", "QBase Cluster"],
    strengths: [
      "Purpose-built for AI workloads — 3x cost efficiency",
      "Founding team from Google DeepMind and NVIDIA",
      "Custom silicon partnerships for inference",
      "Backed by Sequoia and a16z",
    ],
    weaknesses: [
      "Pre-revenue — still in private beta",
      "Narrow use case — AI only",
      "Unproven reliability and uptime",
      "No general compute or storage offerings",
    ],
    recentMoves: [
      "Raised $120M at $800M valuation",
      "Signed LOI with 3 Fortune 500 companies",
      "Published paper showing 3x training efficiency vs A100 clusters",
    ],
    signalCount30d: 3,
    lastActivityDate: "2026-01-31",
  },
];

// ============================================================
// SOURCES
// ============================================================

export const sources: Source[] = [
  // NimbusScale sources
  {
    id: "src-1",
    url: "https://techcrunch.com/2026/01/15/nimbusscale-raises-400m-series-e",
    title: "NimbusScale Raises $400M Series E at $4.2B Valuation",
    type: "news-article",
    publishedAt: "2026-01-15T09:00:00Z",
    scrapedAt: "2026-01-15T09:45:00Z",
    competitorId: "nimbusscale",
    snippet: "Cloud infrastructure startup NimbusScale has closed a $400 million Series E round led by Tiger Global, valuing the company at $4.2 billion. The company plans to use the funds to expand its enterprise sales team and invest in AI infrastructure.",
    reliability: "verified",
  },
  {
    id: "src-2",
    url: "https://blog.nimbusscale.com/2026/01/managed-gpu-clusters-launch",
    title: "Introducing NimbusScale Managed GPU Clusters",
    type: "blog",
    publishedAt: "2026-01-22T14:00:00Z",
    scrapedAt: "2026-01-22T14:30:00Z",
    competitorId: "nimbusscale",
    snippet: "Today we're launching managed GPU clusters with NVIDIA H100 and H200 support. Teams can now spin up GPU clusters with a single API call, with automatic scaling and spot pricing starting at $2.50/hr per GPU.",
    reliability: "verified",
  },
  {
    id: "src-3",
    url: "https://www.linkedin.com/posts/nimbusscale-hires-aws-vp",
    title: "NimbusScale Hires Former AWS VP as Chief Revenue Officer",
    type: "social-media",
    publishedAt: "2026-01-28T10:00:00Z",
    scrapedAt: "2026-01-28T10:15:00Z",
    competitorId: "nimbusscale",
    snippet: "Excited to announce that James Chen, former VP of Enterprise Sales at AWS, has joined NimbusScale as CRO. James brings 15 years of enterprise cloud sales experience.",
    reliability: "verified",
  },
  {
    id: "src-4",
    url: "https://careers.nimbusscale.com/senior-ml-platform-engineer",
    title: "Senior ML Platform Engineer - NimbusScale Careers",
    type: "job-posting",
    publishedAt: "2026-01-25T08:00:00Z",
    scrapedAt: "2026-01-25T12:00:00Z",
    competitorId: "nimbusscale",
    snippet: "Build the next generation of ML infrastructure at scale. You'll architect and implement our managed ML training platform serving thousands of enterprise customers.",
    reliability: "verified",
  },
  {
    id: "src-5",
    url: "https://www.g2.com/products/nimbusscale/reviews",
    title: "NimbusScale Reviews 2026 - G2",
    type: "review-site",
    publishedAt: "2026-01-20T00:00:00Z",
    scrapedAt: "2026-01-21T06:00:00Z",
    competitorId: "nimbusscale",
    snippet: "NimbusScale scores 3.8/5 on G2 with 245 reviews. Common praise: powerful enterprise features. Common complaints: steep learning curve, complex pricing model, slow support for non-enterprise tiers.",
    reliability: "verified",
  },
  // CloudForge sources
  {
    id: "src-6",
    url: "https://blog.cloudforge.dev/2026/01/sso-rbac-enterprise",
    title: "CloudForge Now Supports SSO and RBAC for Enterprise Teams",
    type: "blog",
    publishedAt: "2026-01-18T12:00:00Z",
    scrapedAt: "2026-01-18T12:20:00Z",
    competitorId: "cloudforge",
    snippet: "We've shipped SSO (SAML 2.0, OIDC) and role-based access control across all enterprise plans. This has been our most-requested feature from teams evaluating CloudForge for production workloads.",
    reliability: "verified",
  },
  {
    id: "src-7",
    url: "https://github.com/cloudforge/forge-engine/releases/tag/v4.0.0",
    title: "forge-engine v4.0.0 - CloudForge Open Source",
    type: "github",
    publishedAt: "2026-01-25T16:00:00Z",
    scrapedAt: "2026-01-25T16:30:00Z",
    competitorId: "cloudforge",
    snippet: "Major release: forge-engine is now fully open-source under Apache 2.0. Includes the complete deployment pipeline, container orchestration layer, and plugin system. 2,400 stars in first week.",
    reliability: "verified",
  },
  {
    id: "src-8",
    url: "https://cloudforge.dev/blog/10k-customers",
    title: "CloudForge Crosses 10,000 Paying Customers",
    type: "blog",
    publishedAt: "2026-01-30T10:00:00Z",
    scrapedAt: "2026-01-30T10:10:00Z",
    competitorId: "cloudforge",
    snippet: "We're proud to announce that CloudForge has crossed 10,000 paying customers, growing 3.5x in the last 12 months. Our developer-first approach continues to resonate.",
    reliability: "verified",
  },
  {
    id: "src-9",
    url: "https://twitter.com/cloudforge/status/ml-preview",
    title: "CloudForge ML Preview Announcement - Twitter",
    type: "social-media",
    publishedAt: "2026-01-29T15:00:00Z",
    scrapedAt: "2026-01-29T15:05:00Z",
    competitorId: "cloudforge",
    snippet: "Sneak peek: ForgeML is coming. Train and deploy models with the same developer experience you love. Private beta signups open next month.",
    reliability: "unverified",
  },
  // SkyVault sources
  {
    id: "src-10",
    url: "https://www.defense.gov/contracts/2026/01/skyvault-dod-award",
    title: "SkyVault Awarded $85M Department of Defense Cloud Contract",
    type: "press-release",
    publishedAt: "2026-01-10T14:00:00Z",
    scrapedAt: "2026-01-10T15:00:00Z",
    competitorId: "skyvault",
    snippet: "The Department of Defense has awarded SkyVault an $85 million contract to provide secure cloud infrastructure services for classified workloads under the JWCC framework.",
    reliability: "verified",
  },
  {
    id: "src-11",
    url: "https://blog.skyvault.io/healthcare-compliance-suite",
    title: "Introducing VaultHealth: Purpose-Built for Healthcare",
    type: "blog",
    publishedAt: "2026-01-20T09:00:00Z",
    scrapedAt: "2026-01-20T09:30:00Z",
    competitorId: "skyvault",
    snippet: "VaultHealth provides HIPAA-compliant infrastructure with built-in BAA, automated PHI handling, audit trails, and pre-configured compliance policies for healthcare organizations.",
    reliability: "verified",
  },
  {
    id: "src-12",
    url: "https://skyvault.io/press/frankfurt-datacenter",
    title: "SkyVault Opens First European Data Center in Frankfurt",
    type: "press-release",
    publishedAt: "2026-01-28T08:00:00Z",
    scrapedAt: "2026-01-28T09:00:00Z",
    competitorId: "skyvault",
    snippet: "SkyVault expands to Europe with a fully certified data center in Frankfurt, Germany. The facility supports GDPR compliance and EU data sovereignty requirements.",
    reliability: "verified",
  },
  // InfraLayer sources
  {
    id: "src-13",
    url: "https://blog.infralayer.com/new-apac-regions",
    title: "InfraLayer Expands to 5 New APAC Regions",
    type: "blog",
    publishedAt: "2026-01-12T07:00:00Z",
    scrapedAt: "2026-01-12T08:00:00Z",
    competitorId: "infralayer",
    snippet: "We're live in Mumbai, Jakarta, Bangkok, Manila, and Ho Chi Minh City. InfraLayer now operates in 32 regions globally, more than any other independent cloud provider.",
    reliability: "verified",
  },
  {
    id: "src-14",
    url: "https://infralayer.com/pricing/micro-instances",
    title: "InfraLayer Launches $0.005/hr Micro Instances",
    type: "documentation",
    publishedAt: "2026-01-18T10:00:00Z",
    scrapedAt: "2026-01-18T11:00:00Z",
    competitorId: "infralayer",
    snippet: "New micro instances starting at $0.005/hr ($3.65/month). Perfect for development, testing, and lightweight production workloads. Available in all 32 regions.",
    reliability: "verified",
  },
  {
    id: "src-15",
    url: "https://www.hashicorp.com/blog/infralayer-terraform-integration",
    title: "InfraLayer Becomes Official Terraform Provider Partner",
    type: "news-article",
    publishedAt: "2026-01-22T12:00:00Z",
    scrapedAt: "2026-01-22T13:00:00Z",
    competitorId: "infralayer",
    snippet: "HashiCorp announces InfraLayer as an official Terraform provider partner, with first-class support for all InfraLayer resources in Terraform Cloud.",
    reliability: "verified",
  },
  // EdgePulse sources
  {
    id: "src-16",
    url: "https://blog.edgepulse.io/edge-native-database",
    title: "PulseDB: The First Edge-Native Database",
    type: "blog",
    publishedAt: "2026-01-14T11:00:00Z",
    scrapedAt: "2026-01-14T11:30:00Z",
    competitorId: "edgepulse",
    snippet: "PulseDB brings your data to the edge with automatic global replication, conflict-free reads under 5ms, and seamless sync with your origin database.",
    reliability: "verified",
  },
  {
    id: "src-17",
    url: "https://edgepulse.io/benchmarks/vs-cloud-latency",
    title: "EdgePulse vs Traditional Cloud: Latency Benchmarks",
    type: "documentation",
    publishedAt: "2026-01-27T09:00:00Z",
    scrapedAt: "2026-01-27T10:00:00Z",
    competitorId: "edgepulse",
    snippet: "Independent benchmarks show EdgePulse delivers 5.2x lower p99 latency compared to centralized cloud for API workloads, with 99.99% availability across 200+ edge locations.",
    reliability: "verified",
  },
  {
    id: "src-18",
    url: "https://www.cloudflare.com/partners/edgepulse",
    title: "Cloudflare Partners with EdgePulse for Extended Edge Network",
    type: "press-release",
    publishedAt: "2026-01-20T14:00:00Z",
    scrapedAt: "2026-01-20T15:00:00Z",
    competitorId: "edgepulse",
    snippet: "EdgePulse will leverage Cloudflare's global network of 300+ PoPs to extend its edge compute platform, bringing sub-10ms latency to 95% of the world's internet users.",
    reliability: "verified",
  },
  // DevStreamIO sources
  {
    id: "src-19",
    url: "https://devstream.io/blog/ai-function-builder",
    title: "Build Serverless Functions with AI — StreamAI Launch",
    type: "blog",
    publishedAt: "2026-01-15T13:00:00Z",
    scrapedAt: "2026-01-15T13:30:00Z",
    competitorId: "devstreamio",
    snippet: "Describe what you want in plain English, and StreamAI generates a production-ready serverless function. Supports Node.js, Python, and Go runtimes.",
    reliability: "verified",
  },
  {
    id: "src-20",
    url: "https://devstream.io/blog/50k-developers",
    title: "DevStreamIO Hits 50,000 Developers on Free Tier",
    type: "blog",
    publishedAt: "2026-01-22T10:00:00Z",
    scrapedAt: "2026-01-22T10:30:00Z",
    competitorId: "devstreamio",
    snippet: "Our developer community has grown to 50,000 on the free tier. The generous free tier includes 1M function invocations, 10GB storage, and unlimited deploys.",
    reliability: "verified",
  },
  {
    id: "src-21",
    url: "https://www.linkedin.com/in/sarah-chen-devstream-vpe",
    title: "DevStreamIO Hires VP Engineering from Vercel",
    type: "social-media",
    publishedAt: "2026-01-19T11:00:00Z",
    scrapedAt: "2026-01-19T12:00:00Z",
    competitorId: "devstreamio",
    snippet: "Thrilled to join DevStreamIO as VP of Engineering. After 4 years building Vercel's deployment infrastructure, I'm excited to bring that experience to the serverless-first world.",
    reliability: "verified",
  },
  // QuantumBase sources
  {
    id: "src-22",
    url: "https://techcrunch.com/2026/01/08/quantumbase-120m-ai-cloud",
    title: "QuantumBase Raises $120M to Build AI-Native Cloud Infrastructure",
    type: "news-article",
    publishedAt: "2026-01-08T09:00:00Z",
    scrapedAt: "2026-01-08T09:30:00Z",
    competitorId: "quantumbase",
    snippet: "QuantumBase, founded by former Google DeepMind and NVIDIA engineers, has raised $120M in combined seed and Series A funding led by Sequoia Capital. The company is building cloud infrastructure optimized from the ground up for AI model training and inference.",
    reliability: "verified",
  },
  {
    id: "src-23",
    url: "https://arxiv.org/abs/2026.01234",
    title: "QBase: 3x Training Efficiency Through Co-Designed Hardware-Software Stack",
    type: "documentation",
    publishedAt: "2026-01-20T00:00:00Z",
    scrapedAt: "2026-01-20T06:00:00Z",
    competitorId: "quantumbase",
    snippet: "We demonstrate that our co-designed hardware-software stack achieves 3.2x training efficiency compared to standard A100 GPU clusters for large language models, while reducing cost per FLOP by 60%.",
    reliability: "verified",
  },
  {
    id: "src-24",
    url: "https://quantumbase.ai/blog/fortune-500-partnerships",
    title: "QuantumBase Signs LOIs with Three Fortune 500 Companies",
    type: "blog",
    publishedAt: "2026-01-31T08:00:00Z",
    scrapedAt: "2026-01-31T08:30:00Z",
    competitorId: "quantumbase",
    snippet: "We've signed letters of intent with three Fortune 500 companies to pilot our AI training infrastructure. Combined deal value exceeds $15M annually upon conversion.",
    reliability: "unverified",
  },
  {
    id: "src-25",
    url: "https://careers.quantumbase.ai/ml-compiler-engineer",
    title: "ML Compiler Engineer - QuantumBase Careers",
    type: "job-posting",
    publishedAt: "2026-01-25T09:00:00Z",
    scrapedAt: "2026-01-26T06:00:00Z",
    competitorId: "quantumbase",
    snippet: "Design and implement ML compilers that optimize neural network graphs for our custom silicon. You'll work at the intersection of hardware and AI to push the boundaries of training efficiency.",
    reliability: "verified",
  },
  // Cross-competitor sources
  {
    id: "src-26",
    url: "https://www.gartner.com/reviews/cloud-infrastructure-2026",
    title: "Gartner Cloud Infrastructure Magic Quadrant 2026",
    type: "review-site",
    publishedAt: "2026-01-05T00:00:00Z",
    scrapedAt: "2026-01-06T06:00:00Z",
    competitorId: "nimbusscale",
    snippet: "NimbusScale moves to 'Leaders' quadrant. SkyVault positioned as 'Niche Player' for compliance. CloudForge enters as 'Visionary'. InfraLayer remains in 'Challengers' quadrant.",
    reliability: "verified",
  },
  {
    id: "src-27",
    url: "https://newsletter.pragmaticengineer.com/cloud-wars-2026",
    title: "The Cloud Wars of 2026: Who's Actually Winning?",
    type: "news-article",
    publishedAt: "2026-01-28T07:00:00Z",
    scrapedAt: "2026-01-28T08:00:00Z",
    competitorId: "cloudforge",
    snippet: "CloudForge's open-source strategy is paying off. Their developer NPS of 72 leads the industry. But can they convert developer love into enterprise revenue before the war chest runs dry?",
    reliability: "verified",
  },
];

// ============================================================
// SIGNALS
// ============================================================

export const signals: Signal[] = [
  {
    id: "sig-1",
    competitorId: "nimbusscale",
    sourceId: "src-1",
    category: "funding",
    title: "NimbusScale secures massive Series E",
    summary: "NimbusScale closed $400M at $4.2B valuation, signaling aggressive expansion plans and extended runway for enterprise market capture.",
    detectedAt: "2026-01-15T10:00:00Z",
    strength: "strong",
  },
  {
    id: "sig-2",
    competitorId: "nimbusscale",
    sourceId: "src-2",
    category: "product",
    title: "NimbusScale launches managed GPU clusters",
    summary: "Direct competition with AcmeCloud's GPU offering. Spot pricing at $2.50/hr per GPU could undercut our current pricing.",
    detectedAt: "2026-01-22T15:00:00Z",
    strength: "strong",
  },
  {
    id: "sig-3",
    competitorId: "nimbusscale",
    sourceId: "src-3",
    category: "hiring",
    title: "NimbusScale hires AWS VP as CRO",
    summary: "Former AWS enterprise sales VP joining as CRO suggests NimbusScale is doubling down on enterprise sales motion.",
    detectedAt: "2026-01-28T11:00:00Z",
    strength: "strong",
  },
  {
    id: "sig-4",
    competitorId: "nimbusscale",
    sourceId: "src-4",
    category: "hiring",
    title: "NimbusScale expanding ML platform team",
    summary: "Multiple senior ML engineering roles posted, indicating investment in ML-as-a-service capabilities.",
    detectedAt: "2026-01-25T13:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-5",
    competitorId: "cloudforge",
    sourceId: "src-6",
    category: "product",
    title: "CloudForge ships enterprise SSO/RBAC",
    summary: "CloudForge removing a key enterprise blocker. This could accelerate their upmarket push and put them in more AcmeCloud deals.",
    detectedAt: "2026-01-18T13:00:00Z",
    strength: "strong",
  },
  {
    id: "sig-6",
    competitorId: "cloudforge",
    sourceId: "src-7",
    category: "technical",
    title: "CloudForge open-sources deployment engine",
    summary: "Open-sourcing the core deployment engine is a strategic move to build ecosystem lock-in and community-driven development.",
    detectedAt: "2026-01-25T17:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-7",
    competitorId: "cloudforge",
    sourceId: "src-9",
    category: "product",
    title: "CloudForge teases ML product",
    summary: "ForgeML preview suggests CloudForge is entering the ML infrastructure space — could compete directly with AcmeCloud ML services.",
    detectedAt: "2026-01-29T16:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-8",
    competitorId: "skyvault",
    sourceId: "src-10",
    category: "partnership",
    title: "SkyVault wins $85M DOD contract",
    summary: "Major government win strengthens SkyVault's position in regulated industries and could create a moat AcmeCloud can't easily cross.",
    detectedAt: "2026-01-10T16:00:00Z",
    strength: "strong",
  },
  {
    id: "sig-9",
    competitorId: "skyvault",
    sourceId: "src-11",
    category: "product",
    title: "SkyVault launches healthcare compliance suite",
    summary: "Purpose-built healthcare product deepens SkyVault's vertical focus. May capture healthcare customers evaluating AcmeCloud.",
    detectedAt: "2026-01-20T10:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-10",
    competitorId: "skyvault",
    sourceId: "src-12",
    category: "positioning",
    title: "SkyVault expands to Europe",
    summary: "Frankfurt data center gives SkyVault European presence with compliance positioning. Direct competition for our EU customers.",
    detectedAt: "2026-01-28T10:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-11",
    competitorId: "infralayer",
    sourceId: "src-14",
    category: "pricing",
    title: "InfraLayer drops to $0.005/hr instances",
    summary: "Micro instances at $3.65/month — InfraLayer continuing aggressive price competition targeting cost-sensitive startups.",
    detectedAt: "2026-01-18T12:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-12",
    competitorId: "infralayer",
    sourceId: "src-13",
    category: "positioning",
    title: "InfraLayer expands APAC presence",
    summary: "5 new APAC regions puts InfraLayer at 32 total — positioning as the most globally available independent cloud.",
    detectedAt: "2026-01-12T09:00:00Z",
    strength: "weak",
  },
  {
    id: "sig-13",
    competitorId: "edgepulse",
    sourceId: "src-16",
    category: "product",
    title: "EdgePulse launches edge-native database",
    summary: "PulseDB brings stateful workloads to the edge. Could pull data-intensive workloads away from centralized cloud providers.",
    detectedAt: "2026-01-14T12:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-14",
    competitorId: "edgepulse",
    sourceId: "src-17",
    category: "positioning",
    title: "EdgePulse publishes cloud vs edge benchmarks",
    summary: "5.2x latency advantage marketing directly against centralized cloud. Positioning edge as superior, not complementary.",
    detectedAt: "2026-01-27T11:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-15",
    competitorId: "quantumbase",
    sourceId: "src-22",
    category: "funding",
    title: "QuantumBase raises $120M for AI-native cloud",
    summary: "Massive early-stage funding for a purpose-built AI cloud. Backed by Sequoia and a16z — credible threat to AcmeCloud's AI workloads.",
    detectedAt: "2026-01-08T10:00:00Z",
    strength: "strong",
  },
  {
    id: "sig-16",
    competitorId: "quantumbase",
    sourceId: "src-23",
    category: "technical",
    title: "QuantumBase demonstrates 3x training efficiency",
    summary: "Published research showing 3.2x training efficiency and 60% cost reduction. If validated at scale, this is a significant competitive threat.",
    detectedAt: "2026-01-20T07:00:00Z",
    strength: "strong",
  },
  {
    id: "sig-17",
    competitorId: "quantumbase",
    sourceId: "src-24",
    category: "partnership",
    title: "QuantumBase signs Fortune 500 LOIs",
    summary: "Three Fortune 500 LOIs totaling $15M+ annually suggest enterprise interest in specialized AI infrastructure.",
    detectedAt: "2026-02-05T09:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-18",
    competitorId: "devstreamio",
    sourceId: "src-19",
    category: "product",
    title: "DevStreamIO launches AI function builder",
    summary: "AI-powered serverless function generation lowers barrier to entry further. Could attract AcmeCloud developers seeking simplicity.",
    detectedAt: "2026-01-15T14:00:00Z",
    strength: "weak",
  },
  {
    id: "sig-19",
    competitorId: "nimbusscale",
    sourceId: "src-26",
    category: "positioning",
    title: "NimbusScale enters Gartner Leaders quadrant",
    summary: "NimbusScale's move to Leaders in Gartner's Cloud Infrastructure MQ is a major credibility boost for enterprise deals.",
    detectedAt: "2026-01-06T07:00:00Z",
    strength: "strong",
  },
  {
    id: "sig-20",
    competitorId: "cloudforge",
    sourceId: "src-27",
    category: "positioning",
    title: "CloudForge developer NPS leads industry at 72",
    summary: "Industry analyst highlights CloudForge's developer love, but questions ability to convert to enterprise revenue.",
    detectedAt: "2026-02-03T09:00:00Z",
    strength: "moderate",
  },
  // Additional signals for better coverage
  {
    id: "sig-21",
    competitorId: "devstreamio",
    sourceId: "src-20",
    category: "positioning",
    title: "DevStreamIO hits 50K developers milestone",
    summary: "Rapid developer adoption on free tier indicates strong product-market fit. Could convert to paid as projects scale.",
    detectedAt: "2026-01-22T11:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-22",
    competitorId: "devstreamio",
    sourceId: "src-21",
    category: "hiring",
    title: "DevStreamIO hires VP Engineering from Vercel",
    summary: "Senior hire from Vercel brings deployment infrastructure expertise. Signals ambition to move upmarket.",
    detectedAt: "2026-01-19T12:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-23",
    competitorId: "devstreamio",
    sourceId: "src-19",
    category: "technical",
    title: "DevStreamIO adds Go runtime support",
    summary: "Expanding language support beyond Node.js and Python. Go support appeals to performance-focused developers.",
    detectedAt: "2026-01-17T10:00:00Z",
    strength: "weak",
  },
  {
    id: "sig-24",
    competitorId: "nimbusscale",
    sourceId: "src-5",
    category: "technical",
    title: "NimbusScale achieves 99.999% SLA",
    summary: "Five-nines SLA positions NimbusScale for mission-critical enterprise workloads. Creates pressure on AcmeCloud reliability.",
    detectedAt: "2026-02-01T14:00:00Z",
    strength: "strong",
  },
  {
    id: "sig-25",
    competitorId: "cloudforge",
    sourceId: "src-8",
    category: "partnership",
    title: "CloudForge partners with Datadog",
    summary: "Native Datadog integration strengthens CloudForge's enterprise observability story and ecosystem play.",
    detectedAt: "2026-02-02T15:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-26",
    competitorId: "edgepulse",
    sourceId: "src-18",
    category: "hiring",
    title: "EdgePulse hiring 30+ edge engineers",
    summary: "Aggressive hiring push suggests EdgePulse is preparing for rapid expansion. Focus on edge-native compute.",
    detectedAt: "2026-02-01T09:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-27",
    competitorId: "infralayer",
    sourceId: "src-15",
    category: "product",
    title: "InfraLayer launches managed Kubernetes",
    summary: "Entry into managed K8s market at aggressive pricing could capture cost-sensitive container workloads.",
    detectedAt: "2026-02-04T11:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-28",
    competitorId: "quantumbase",
    sourceId: "src-25",
    category: "hiring",
    title: "QuantumBase hiring ML compiler engineers",
    summary: "Custom ML compiler development indicates deep technical moat being built around AI training efficiency.",
    detectedAt: "2026-02-03T10:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-29",
    competitorId: "skyvault",
    sourceId: "src-10",
    category: "technical",
    title: "SkyVault achieves FedRAMP High certification",
    summary: "FedRAMP High opens federal agency opportunities. Further cements SkyVault's compliance moat.",
    detectedAt: "2026-01-15T08:00:00Z",
    strength: "strong",
  },
  // Additional signals for increased coverage
  {
    id: "sig-30",
    competitorId: "nimbusscale",
    sourceId: "src-1",
    category: "partnership",
    title: "NimbusScale announces Microsoft Azure interoperability",
    summary: "Strategic partnership enables workload portability between NimbusScale and Azure, reducing switching costs.",
    detectedAt: "2026-02-04T14:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-31",
    competitorId: "nimbusscale",
    sourceId: "src-4",
    category: "product",
    title: "NimbusScale previews serverless containers",
    summary: "Knative-based serverless containers could compete with AcmeCloud's container offering for event-driven workloads.",
    detectedAt: "2026-02-06T09:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-32",
    competitorId: "cloudforge",
    sourceId: "src-8",
    category: "hiring",
    title: "CloudForge opens Singapore engineering hub",
    summary: "50-person engineering hub signals APAC expansion and 24/7 development capability.",
    detectedAt: "2026-02-05T08:00:00Z",
    strength: "weak",
  },
  {
    id: "sig-33",
    competitorId: "skyvault",
    sourceId: "src-11",
    category: "partnership",
    title: "SkyVault partners with Epic Systems for healthcare",
    summary: "Epic integration deepens healthcare vertical lock-in. Major barrier for AcmeCloud in health IT.",
    detectedAt: "2026-02-02T11:00:00Z",
    strength: "strong",
  },
  {
    id: "sig-34",
    competitorId: "infralayer",
    sourceId: "src-14",
    category: "technical",
    title: "InfraLayer improves network throughput by 40%",
    summary: "Infrastructure upgrade narrows performance gap with premium providers while maintaining cost advantage.",
    detectedAt: "2026-02-01T10:00:00Z",
    strength: "weak",
  },
  {
    id: "sig-35",
    competitorId: "edgepulse",
    sourceId: "src-16",
    category: "partnership",
    title: "EdgePulse integrates with Vercel for edge rendering",
    summary: "Vercel partnership brings EdgePulse to mainstream frontend developers. Expands edge computing awareness.",
    detectedAt: "2026-02-03T15:00:00Z",
    strength: "moderate",
  },
  {
    id: "sig-36",
    competitorId: "devstreamio",
    sourceId: "src-20",
    category: "product",
    title: "DevStreamIO launches preview environments",
    summary: "Automatic preview deployments for PRs — feature parity with Vercel/Netlify in the serverless space.",
    detectedAt: "2026-02-05T13:00:00Z",
    strength: "weak",
  },
  {
    id: "sig-37",
    competitorId: "quantumbase",
    sourceId: "src-23",
    category: "product",
    title: "QuantumBase opens beta access to 100 companies",
    summary: "Controlled beta expansion suggests product readiness. Early customers report 2.8x cost savings vs AWS.",
    detectedAt: "2026-02-06T08:00:00Z",
    strength: "strong",
  },
];

// ============================================================
// INSIGHTS
// ============================================================

export const insights: Insight[] = [
  {
    id: "ins-1",
    title: "NimbusScale Is Executing an Aggressive Enterprise Takeover Play",
    synthesis: "NimbusScale's $400M Series E, combined with hiring a former AWS VP as CRO and achieving Gartner Leaders status, signals a coordinated push to dominate the enterprise cloud market. Their managed GPU cluster launch directly targets the AI/ML workload segment where AcmeCloud has been growing. The hiring of 15+ senior ML engineers suggests a sustained investment in ML-as-a-service, not a one-off product launch. AcmeCloud should expect to see NimbusScale in significantly more enterprise deals over the next two quarters, particularly in AI-heavy use cases.",
    category: "positioning",
    impact: "high",
    teamRelevance: ["product", "gtm", "leadership"],
    competitorIds: ["nimbusscale"],
    sourceIds: ["src-1", "src-2", "src-3", "src-4", "src-26"],
    signalIds: ["sig-1", "sig-2", "sig-3", "sig-4", "sig-19"],
    generatedAt: "2026-01-29T08:00:00Z",
    confidence: 94,
    recommendations: [
      "Accelerate GPU pricing review — match or beat NimbusScale's $2.50/hr spot pricing",
      "Brief sales team on NimbusScale's enterprise positioning and new CRO hire",
      "Fast-track SOC 2 Type II certification to close compliance gap",
      "Create competitive battlecard specifically for NimbusScale AI/ML scenarios",
    ],
    status: "past",
    verificationStatus: "verified",
    verification: {
      verifiedBy: "Sarah Mitchell",
      verifiedAt: "2026-01-30T10:00:00Z",
      verifierRole: "Market Research Lead",
      verifierComment: "Cross-referenced with industry reports and confirmed funding details via SEC filings.",
    },
    comments: [
      {
        id: "cmt-1",
        author: "James Wilson",
        authorRole: "VP Sales",
        authorAvatar: "JW",
        content: "This aligns with what we're hearing from the field. NimbusScale is showing up in 40% more enterprise RFPs this quarter.",
        createdAt: "2026-01-30T14:30:00Z",
      },
      {
        id: "cmt-2",
        author: "Lisa Chen",
        authorRole: "Product Manager",
        authorAvatar: "LC",
        content: "We need to prioritize the GPU pricing review. I'll schedule a meeting with the pricing team this week.",
        createdAt: "2026-01-30T16:45:00Z",
      },
    ],
    relatedInsightIds: ["ins-4", "ins-10"],
  },
  {
    id: "ins-2",
    title: "CloudForge's Open-Source Strategy Could Erode AcmeCloud's Developer Mindshare",
    synthesis: "CloudForge's decision to open-source their deployment engine, combined with their industry-leading developer NPS of 72, creates a powerful flywheel: open-source adoption drives familiarity, which drives paid conversion. Their new SSO/RBAC removes the last major enterprise blocker. The teaser for ForgeML suggests they're expanding beyond deployment into ML infrastructure — directly competing with AcmeCloud. CloudForge's 3.5x customer growth shows the developer-first approach is working commercially.",
    category: "technical",
    impact: "high",
    teamRelevance: ["product", "engineering"],
    competitorIds: ["cloudforge"],
    sourceIds: ["src-6", "src-7", "src-8", "src-9", "src-27"],
    signalIds: ["sig-5", "sig-6", "sig-7", "sig-20"],
    generatedAt: "2026-01-30T10:00:00Z",
    confidence: 87,
    recommendations: [
      "Invest in developer experience — target NPS improvement from 58 to 65+",
      "Evaluate open-sourcing a component of our stack to compete on community",
      "Monitor ForgeML beta closely — assign product team member to track",
      "Strengthen DevRel program with more hands-on content and tutorials",
    ],
    status: "new",
    verificationStatus: "verified",
    verification: {
      verifiedBy: "Michael Torres",
      verifiedAt: "2026-01-31T09:15:00Z",
      verifierRole: "Competitive Intelligence Analyst",
      verifierComment: "Validated GitHub metrics and NPS data through independent developer surveys.",
    },
    comments: [
      {
        id: "cmt-3",
        author: "Rachel Kim",
        authorRole: "Engineering Manager",
        authorAvatar: "RK",
        content: "Their open-source strategy is smart. We should consider a similar approach for our deployment tools.",
        createdAt: "2026-01-31T11:20:00Z",
      },
    ],
    relatedInsightIds: ["ins-7", "ins-8"],
  },
  {
    id: "ins-3",
    title: "Regulated Industries Becoming a SkyVault Moat",
    synthesis: "SkyVault's $85M DOD contract win, new healthcare compliance suite, and European expansion with GDPR focus show a deliberate strategy to own regulated industries. This is creating a compliance moat that's expensive and time-consuming to replicate. Healthcare and government together represent a $4B+ cloud TAM that AcmeCloud is underweight in. SkyVault's 135% net retention rate in these verticals suggests deep customer stickiness once established.",
    category: "positioning",
    impact: "medium",
    teamRelevance: ["product", "gtm", "leadership"],
    competitorIds: ["skyvault"],
    sourceIds: ["src-10", "src-11", "src-12"],
    signalIds: ["sig-8", "sig-9", "sig-10"],
    generatedAt: "2026-01-29T14:00:00Z",
    confidence: 91,
    recommendations: [
      "Evaluate FedRAMP certification timeline and investment requirements",
      "Consider healthcare vertical partnership rather than building compliance in-house",
      "Prioritize European data sovereignty features for Frankfurt region customers",
      "Avoid competing head-to-head with SkyVault in DoD — focus on commercial enterprise",
    ],
    status: "past",
    verificationStatus: "verified",
    verification: {
      verifiedBy: "David Park",
      verifiedAt: "2026-01-30T11:00:00Z",
      verifierRole: "Senior Market Analyst",
      verifierComment: "Confirmed compliance certifications through official government databases.",
    },
    relatedInsightIds: ["ins-11"],
  },
  {
    id: "ins-4",
    title: "AI Infrastructure Is the Next Battleground — QuantumBase and NimbusScale Converging",
    synthesis: "Two major signals point to AI infrastructure becoming the primary competitive front: QuantumBase's $120M raise for purpose-built AI cloud, and NimbusScale's managed GPU clusters. QuantumBase's published research showing 3.2x training efficiency is significant — if validated at enterprise scale, it could fundamentally change the cost economics of AI workloads. Meanwhile, NimbusScale is approaching from the top down with enterprise AI services. AcmeCloud risks being squeezed between a specialized disruptor and a well-funded incumbent.",
    category: "product",
    impact: "high",
    teamRelevance: ["product", "engineering", "leadership"],
    competitorIds: ["quantumbase", "nimbusscale"],
    sourceIds: ["src-2", "src-22", "src-23", "src-24"],
    signalIds: ["sig-2", "sig-15", "sig-16", "sig-17"],
    generatedAt: "2026-01-31T11:00:00Z",
    confidence: 82,
    recommendations: [
      "Commission internal evaluation of QuantumBase's efficiency claims",
      "Accelerate AI infrastructure roadmap — propose to leadership as top priority",
      "Explore custom silicon partnerships to match QuantumBase's cost advantage",
      "Position AcmeCloud as 'general-purpose + AI' vs QuantumBase's 'AI-only' limitation",
    ],
    status: "new",
    verificationStatus: "pending",
    comments: [
      {
        id: "cmt-4",
        author: "Alex Johnson",
        authorRole: "CTO",
        authorAvatar: "AJ",
        content: "This is our top strategic priority. Let's schedule a deep-dive with the AI infrastructure team.",
        createdAt: "2026-02-01T10:00:00Z",
      },
      {
        id: "cmt-5",
        author: "Emily Zhang",
        authorRole: "ML Platform Lead",
        authorAvatar: "EZ",
        content: "I've been tracking QuantumBase closely. Their efficiency claims are credible based on the arxiv paper. We need to accelerate our own silicon partnerships.",
        createdAt: "2026-02-01T11:30:00Z",
      },
      {
        id: "cmt-6",
        author: "James Wilson",
        authorRole: "VP Sales",
        authorAvatar: "JW",
        content: "Already seeing QuantumBase mentioned in enterprise conversations. They're building mindshare fast.",
        createdAt: "2026-02-01T14:15:00Z",
      },
    ],
    relatedInsightIds: ["ins-1", "ins-9", "ins-10"],
  },
  {
    id: "ins-5",
    title: "Price Pressure Increasing from InfraLayer in Startup Segment",
    synthesis: "InfraLayer's $0.005/hr micro instances and expansion to 32 global regions are making it increasingly attractive for cost-sensitive startups. Their Terraform partnership adds infrastructure-as-code credibility. While InfraLayer lacks managed services and AI capabilities, their price advantage is significant for basic compute workloads. AcmeCloud may be losing early-stage startups who start cheap and grow into larger accounts.",
    category: "pricing",
    impact: "medium",
    teamRelevance: ["product", "gtm"],
    competitorIds: ["infralayer"],
    sourceIds: ["src-13", "src-14", "src-15"],
    signalIds: ["sig-11", "sig-12"],
    generatedAt: "2026-01-23T09:00:00Z",
    confidence: 78,
    recommendations: [
      "Introduce a startup-friendly free tier or credits program",
      "Benchmark AcmeCloud pricing against InfraLayer for common startup workloads",
      "Emphasize managed services value prop — total cost vs just compute cost",
      "Create 'graduate from InfraLayer' migration guides and incentives",
    ],
    status: "past",
    verificationStatus: "pending",
  },
  {
    id: "ins-6",
    title: "Edge Computing Narrative Gaining Traction — Potential Workload Shift",
    synthesis: "EdgePulse's Cloudflare partnership and edge-native database launch, combined with benchmarks showing 5.2x latency improvement, suggest edge computing is moving beyond niche use cases. Their positioning of edge as 'superior to cloud' rather than 'complementary' is a narrative shift worth watching. While EdgePulse isn't a direct competitor today, the trend could erode centralized cloud demand for latency-sensitive workloads over the next 12-18 months.",
    category: "technical",
    impact: "low",
    teamRelevance: ["product", "engineering"],
    competitorIds: ["edgepulse"],
    sourceIds: ["src-16", "src-17", "src-18"],
    signalIds: ["sig-13", "sig-14"],
    generatedAt: "2026-01-28T15:00:00Z",
    confidence: 72,
    recommendations: [
      "Monitor edge adoption metrics quarterly",
      "Explore hybrid cloud-edge offering in partnership or build",
      "No immediate action required — revisit in Q3 2026",
    ],
    status: "past",
    verificationStatus: "unverified",
  },
  {
    id: "ins-7",
    title: "Developer Platform Wars: Everyone Is Shipping Enterprise Features",
    synthesis: "CloudForge (SSO/RBAC), DevStreamIO (AI builder), and InfraLayer (Terraform) are all simultaneously adding capabilities that make them more viable for larger teams. The convergence suggests the market is maturing — what were once 'developer toys' are becoming enterprise-ready platforms. AcmeCloud's competitive advantage as a 'complete platform' is narrowing as point solutions expand upmarket.",
    category: "product",
    impact: "medium",
    teamRelevance: ["product", "leadership"],
    competitorIds: ["cloudforge", "devstreamio", "infralayer"],
    sourceIds: ["src-6", "src-15", "src-19"],
    signalIds: ["sig-5", "sig-18"],
    generatedAt: "2026-01-26T16:00:00Z",
    confidence: 85,
    recommendations: [
      "Double down on platform integration as differentiator",
      "Ship features that are hard for point solutions to replicate (unified billing, cross-service IAM)",
      "Track which enterprise features each competitor ships quarter over quarter",
    ],
    status: "new",
    verificationStatus: "verified",
    verification: {
      verifiedBy: "Michael Torres",
      verifiedAt: "2026-01-27T14:00:00Z",
      verifierRole: "Competitive Intelligence Analyst",
      verifierComment: "Tracked enterprise feature launches across all three competitors over past quarter.",
    },
    relatedInsightIds: ["ins-2", "ins-5", "ins-8"],
  },
  {
    id: "ins-8",
    title: "DevStreamIO's Rapid Growth Signals Serverless Momentum",
    synthesis: "DevStreamIO's 50K developer milestone and strategic Vercel hire indicate strong serverless adoption momentum. Their AI-powered function builder lowers the barrier to entry significantly — developers can describe functions in plain English and get production code. While currently focused on developers who 'don't want to manage servers,' the Vercel hire suggests aspirations to move upmarket. The generous free tier (1M invocations) creates switching costs as projects scale.",
    category: "product",
    impact: "low",
    teamRelevance: ["product", "engineering"],
    competitorIds: ["devstreamio"],
    sourceIds: ["src-19", "src-20", "src-21"],
    signalIds: ["sig-18", "sig-21", "sig-22", "sig-23"],
    generatedAt: "2026-01-25T13:00:00Z",
    confidence: 76,
    recommendations: [
      "Evaluate adding AI-assisted code generation to AcmeCloud Functions",
      "Monitor DevStreamIO's enterprise feature roadmap post-VP hire",
      "No immediate competitive threat — but watch for enterprise pivot signals",
    ],
    status: "past",
    verificationStatus: "unverified",
  },
  {
    id: "ins-9",
    title: "QuantumBase Building Technical Moat with Custom Silicon",
    synthesis: "QuantumBase's hiring of ML compiler engineers and published research on hardware-software co-design suggest they're building a deep technical moat. Their 3.2x efficiency claims, if validated, would make them the cost leader for AI training workloads. The Fortune 500 LOIs indicate enterprise validation of their approach. This is a long-term threat that could reshape AI infrastructure economics within 18-24 months.",
    category: "technical",
    impact: "high",
    teamRelevance: ["engineering", "leadership"],
    competitorIds: ["quantumbase"],
    sourceIds: ["src-22", "src-23", "src-24", "src-25"],
    signalIds: ["sig-15", "sig-16", "sig-17", "sig-28"],
    generatedAt: "2026-01-30T09:00:00Z",
    confidence: 79,
    recommendations: [
      "Initiate discussions with custom silicon partners (Cerebras, SambaNova)",
      "Benchmark current AcmeCloud AI training costs vs QuantumBase claims",
      "Position AcmeCloud as 'production-ready today' vs QuantumBase's emerging platform",
    ],
    status: "new",
    verificationStatus: "pending",
    comments: [
      {
        id: "cmt-7",
        author: "Rachel Kim",
        authorRole: "Engineering Manager",
        authorAvatar: "RK",
        content: "The custom silicon angle is particularly concerning. If they can deliver on efficiency claims, it changes the competitive landscape.",
        createdAt: "2026-01-31T09:45:00Z",
      },
    ],
    relatedInsightIds: ["ins-4", "ins-1"],
  },
  {
    id: "ins-10",
    title: "NimbusScale's Azure Partnership Signals Hybrid Cloud Strategy",
    synthesis: "NimbusScale's interoperability deal with Microsoft Azure represents a strategic pivot toward hybrid cloud scenarios. This 'best of both worlds' positioning could appeal to enterprises hesitant to commit fully to a single vendor. Combined with their five-nines SLA achievement, NimbusScale is building an enterprise reliability story that directly challenges AcmeCloud's uptime guarantees.",
    category: "partnership",
    impact: "high",
    teamRelevance: ["product", "gtm", "leadership"],
    competitorIds: ["nimbusscale"],
    sourceIds: ["src-1", "src-5"],
    signalIds: ["sig-24", "sig-30"],
    generatedAt: "2026-01-31T14:00:00Z",
    confidence: 86,
    recommendations: [
      "Evaluate strategic partnerships with AWS or GCP for interoperability",
      "Review SLA commitments — can we match five-nines for enterprise tier?",
      "Create hybrid cloud messaging that addresses multi-vendor requirements",
    ],
    status: "new",
    verificationStatus: "pending",
  },
  {
    id: "ins-11",
    title: "SkyVault's Healthcare Ecosystem Play Creates Lock-in",
    synthesis: "SkyVault's Epic Systems partnership combined with their existing FedRAMP High certification creates a formidable moat in healthcare IT. Epic powers over 35% of US hospital systems — native integration makes SkyVault the path of least resistance for these organizations. This vertical integration strategy is difficult and expensive to replicate.",
    category: "partnership",
    impact: "medium",
    teamRelevance: ["product", "gtm"],
    competitorIds: ["skyvault"],
    sourceIds: ["src-10", "src-11"],
    signalIds: ["sig-29", "sig-33"],
    generatedAt: "2026-01-28T11:00:00Z",
    confidence: 88,
    recommendations: [
      "Deprioritize head-to-head competition in healthcare vertical",
      "Explore partnership opportunities with other healthcare EHR vendors",
      "Focus compliance efforts on financial services instead of healthcare",
    ],
    status: "past",
    verificationStatus: "verified",
    verification: {
      verifiedBy: "David Park",
      verifiedAt: "2026-01-29T15:00:00Z",
      verifierRole: "Senior Market Analyst",
      verifierComment: "Verified Epic partnership through healthcare industry contacts and Epic's official partner listing.",
    },
  },
  {
    id: "ins-12",
    title: "InfraLayer Closing Performance Gap While Maintaining Price Edge",
    synthesis: "InfraLayer's 40% network throughput improvement signals they're no longer competing on price alone. Combined with their managed Kubernetes launch, InfraLayer is evolving from 'cheap VMs' to 'affordable platform.' This could attract workloads that previously required AcmeCloud-tier performance but don't need premium pricing.",
    category: "technical",
    impact: "medium",
    teamRelevance: ["product", "engineering"],
    competitorIds: ["infralayer"],
    sourceIds: ["src-14", "src-15"],
    signalIds: ["sig-27", "sig-34"],
    generatedAt: "2026-01-27T10:00:00Z",
    confidence: 74,
    recommendations: [
      "Benchmark AcmeCloud performance vs InfraLayer's upgraded infrastructure",
      "Consider introducing a cost-optimized tier for price-sensitive workloads",
      "Emphasize managed services depth as differentiator vs InfraLayer's basic K8s",
    ],
    status: "past",
    verificationStatus: "pending",
  },
  {
    id: "ins-13",
    title: "EdgePulse Expanding Developer Reach Through Strategic Partnerships",
    synthesis: "EdgePulse's Vercel and Cloudflare partnerships bring edge computing to mainstream frontend developers who may not have considered it. This 'meet developers where they are' approach could normalize edge-first architecture patterns. While not an immediate revenue threat, mindshare shift toward edge could influence architecture decisions on new projects.",
    category: "partnership",
    impact: "low",
    teamRelevance: ["product", "engineering"],
    competitorIds: ["edgepulse"],
    sourceIds: ["src-16", "src-17", "src-18"],
    signalIds: ["sig-13", "sig-26", "sig-35"],
    generatedAt: "2026-01-25T16:00:00Z",
    confidence: 71,
    recommendations: [
      "Monitor edge adoption patterns in AcmeCloud customer base",
      "Consider adding edge compute points to complement centralized cloud",
      "Partner with edge providers rather than building edge infrastructure",
    ],
    status: "past",
    verificationStatus: "unverified",
  },
];


// ============================================================
// BATTLECARDS
// ============================================================

export const battlecards: Battlecard[] = [
  {
    id: "bc-1",
    competitorId: "nimbusscale",
    updatedAt: "2026-01-30T00:00:00Z",
    positioning: "Enterprise-grade cloud with managed Kubernetes and AI/ML services. Positions as 'the enterprise alternative to hyperscalers.'",
    ourAdvantages: [
      "30% lower total cost of ownership for mid-market",
      "Faster onboarding — 2 hours vs NimbusScale's average 2 weeks",
      "Superior developer experience and documentation",
      "More flexible pricing — no 3-year commit requirements",
    ],
    theirAdvantages: [
      "Gartner Leaders quadrant positioning",
      "FedRAMP and SOC 2 Type II certified",
      "Larger enterprise sales team (200+ reps)",
      "Managed GPU clusters with spot pricing",
    ],
    objectionHandling: [
      {
        objection: "NimbusScale is in the Gartner Leaders quadrant, you're not",
        response: "Gartner evaluates enterprise completeness, which favors incumbents. Our customers consistently rate us higher on G2 for actual product satisfaction (4.5 vs 3.8). We're building the best product, not the biggest slide deck.",
      },
      {
        objection: "NimbusScale has FedRAMP — we need compliance certifications",
        response: "We're on track for SOC 2 Type II by Q3 2026. For FedRAMP-specific needs, we'd recommend evaluating your actual compliance requirements — many teams over-buy compliance and pay a premium for certifications they don't need.",
      },
      {
        objection: "NimbusScale's GPU pricing is very competitive",
        response: "Their $2.50/hr spot pricing comes with availability trade-offs. Our reserved GPU instances offer predictable pricing with guaranteed availability, which matters for production ML workloads.",
      },
    ],
    keyDifferentiators: [
      "Developer experience — 4.5 vs 3.8 on G2",
      "Onboarding speed — hours not weeks",
      "Flexible pricing without lock-in",
      "Unified platform vs NimbusScale's siloed products",
    ],
    pricingComparison: "AcmeCloud is 20-30% cheaper for mid-market workloads. NimbusScale offers aggressive discounts on 3-year enterprise commits that can close the gap.",
    winRate: 58,
    winRateRationale: "Our 58% win rate against NimbusScale reflects a competitive but challenging landscape. We win on price and developer experience in mid-market deals, but lose when enterprises prioritize Gartner positioning, FedRAMP compliance, or require the managed GPU infrastructure they've heavily invested in. Their new CRO from AWS is expected to increase pressure on enterprise deals.",
    commonScenarios: [
      "Enterprise evaluating alternatives to AWS/GCP",
      "Teams scaling from startup to mid-market",
      "AI/ML workloads requiring managed GPU infrastructure",
    ],
  },
  {
    id: "bc-2",
    competitorId: "cloudforge",
    updatedAt: "2026-01-30T00:00:00Z",
    positioning: "Developer-first cloud built on open-source. Positions as 'the cloud developers actually love.'",
    ourAdvantages: [
      "Full platform — compute, storage, networking, security in one place",
      "Enterprise-ready features (audit logs, compliance, SSO since day one)",
      "24/7 enterprise support with <1hr response time",
      "Broader product surface — no gaps in networking or security",
    ],
    theirAdvantages: [
      "Best-in-class developer experience (NPS 72)",
      "Open-source community (40k+ stars)",
      "Faster feature releases (weekly vs monthly)",
      "Strong content marketing and developer community",
    ],
    objectionHandling: [
      {
        objection: "Our developers prefer CloudForge's developer experience",
        response: "We hear you — developer experience is our #1 investment area this year. But developer experience is one dimension. For production workloads, you also need reliability, security, and support. Our platform uptime is 99.99% vs CloudForge's 99.9%.",
      },
      {
        objection: "CloudForge just shipped SSO, so they're enterprise-ready now",
        response: "SSO is table stakes, not enterprise-ready. Enterprise means audit logs, compliance automation, advanced RBAC, support SLAs, and a proven track record. We've had these for 2+ years. CloudForge is just getting started.",
      },
    ],
    keyDifferentiators: [
      "Platform completeness vs point solution",
      "Enterprise maturity (2+ years ahead)",
      "99.99% uptime SLA vs 99.9%",
      "Dedicated account management and support",
    ],
    pricingComparison: "Comparable at the team level. AcmeCloud is slightly more expensive but includes security and compliance features that CloudForge charges extra for at enterprise tier.",
    winRate: 62,
    winRateRationale: "Our 62% win rate against CloudForge is driven by our enterprise maturity — we win when deals require SSO, audit logs, compliance, or dedicated support that CloudForge only recently started building. We lose in developer-led evaluations where their superior DX and open-source community give them an edge. As CloudForge adds enterprise features, this rate may compress.",
    commonScenarios: [
      "Developer-led evaluations in startups",
      "Teams outgrowing CloudForge and needing enterprise features",
      "Organizations wanting open-source alignment",
    ],
  },
  {
    id: "bc-3",
    competitorId: "skyvault",
    updatedAt: "2026-01-28T00:00:00Z",
    positioning: "Compliance-first cloud for regulated industries. Positions as 'the only cloud built for compliance.'",
    ourAdvantages: [
      "40% lower pricing for equivalent compute",
      "Modern developer experience vs SkyVault's legacy UX",
      "Broader product surface beyond compliance",
      "Faster innovation cycle — monthly vs quarterly releases",
    ],
    theirAdvantages: [
      "FedRAMP High, HIPAA, PCI-DSS certified",
      "Proven government and healthcare track record",
      "Dedicated compliance automation suite",
      "135% net retention in regulated verticals",
    ],
    objectionHandling: [
      {
        objection: "We need FedRAMP certification and SkyVault has it",
        response: "If FedRAMP High is a hard requirement today, SkyVault is a valid choice. We're pursuing SOC 2 Type II now. For teams where FedRAMP is 'nice to have' vs 'must have,' you'll save 40% with AcmeCloud and get a better developer experience.",
      },
      {
        objection: "SkyVault understands healthcare/government better",
        response: "SkyVault has deep expertise in compliance certifications, but that comes at a premium. Many regulated workloads don't require FedRAMP High — our standard security posture with BAA support handles 80% of healthcare use cases at a fraction of the cost.",
      },
    ],
    keyDifferentiators: [
      "Price — 40% lower for comparable compute",
      "Developer experience — modern vs legacy",
      "Innovation speed — monthly vs quarterly",
      "General-purpose vs compliance-only",
    ],
    pricingComparison: "SkyVault charges a 40% premium for compliance features. Many customers don't need the full compliance suite.",
    winRate: 45,
    winRateRationale: "Our 45% win rate against SkyVault is our lowest among direct competitors, reflecting the compliance moat they've built. We lose almost all deals where FedRAMP, HIPAA, or strict regulatory compliance is a hard requirement — these buyers pay the premium for SkyVault's certifications. We win when compliance is 'nice to have' rather than mandatory, where our 40% price advantage and modern DX become decisive factors.",
    commonScenarios: [
      "Healthcare organizations evaluating cloud",
      "Government contractors requiring FedRAMP",
      "Financial services with PCI-DSS requirements",
    ],
  },
  {
    id: "bc-4",
    competitorId: "infralayer",
    updatedAt: "2026-01-22T00:00:00Z",
    positioning: "Budget-friendly global cloud. Positions as 'premium cloud at half the price.'",
    ourAdvantages: [
      "Managed services — databases, ML, serverless out of the box",
      "Enterprise support with SLAs and dedicated CSMs",
      "Native AI/ML infrastructure",
      "Single pane of glass for all cloud services",
    ],
    theirAdvantages: [
      "30-50% lower base compute pricing",
      "32 global regions (more than AcmeCloud)",
      "Transparent, predictable pricing",
      "Strong Terraform/IaC integration",
    ],
    objectionHandling: [
      {
        objection: "InfraLayer is half the price for the same compute",
        response: "Compute cost is one part of the total picture. When you factor in managed databases, load balancers, monitoring, and security — which you'll need to self-manage on InfraLayer — our total cost is comparable, often lower. And you save engineering time.",
      },
    ],
    keyDifferentiators: [
      "Total cost of ownership (TCO) vs raw compute cost",
      "Managed services reduce engineering overhead",
      "Enterprise-grade support vs 4+ hour response",
      "AI/ML capabilities included",
    ],
    pricingComparison: "InfraLayer is 30-50% cheaper on raw compute. TCO comparison narrows to ~10% when managed services are included.",
    winRate: 72,
    winRateRationale: "Our strong 72% win rate against InfraLayer comes from successfully reframing the conversation from raw compute cost to total cost of ownership. When we demonstrate the engineering time saved by our managed databases, monitoring, and security services, the 30-50% compute savings evaporate. We lose when procurement is purely price-driven or when customers have strong internal DevOps teams who prefer to self-manage.",
    commonScenarios: [
      "Cost-conscious startups evaluating cloud",
      "Teams migrating from self-hosted to cloud",
      "Price-driven procurement processes",
    ],
  },
  {
    id: "bc-5",
    competitorId: "edgepulse",
    updatedAt: "2026-01-27T00:00:00Z",
    positioning: "Edge-first compute platform. Positions as 'the post-cloud infrastructure.'",
    ourAdvantages: [
      "Full compute capabilities — no per-node limitations",
      "Proven for heavy batch, data, and AI workloads",
      "Mature managed service ecosystem",
      "Enterprise reliability at scale",
    ],
    theirAdvantages: [
      "5x lower latency for edge workloads",
      "200+ global edge locations",
      "Edge-native database with global replication",
      "Innovative Cloudflare partnership for PoP coverage",
    ],
    objectionHandling: [
      {
        objection: "EdgePulse's latency is much better for our use case",
        response: "For truly latency-sensitive workloads (sub-10ms), edge has advantages. But most applications don't need sub-10ms — our CDN delivers sub-50ms globally. Edge also has compute limits and storage constraints that become bottlenecks at scale.",
      },
    ],
    keyDifferentiators: [
      "Full compute power vs edge limitations",
      "Mature managed services ecosystem",
      "Proven at enterprise scale",
      "Lower cost for compute-heavy workloads",
    ],
    pricingComparison: "EdgePulse is competitive for lightweight, latency-sensitive workloads. For compute-heavy or data-intensive work, AcmeCloud is 50-70% cheaper.",
    winRate: 78,
    winRateRationale: "Our 78% win rate against EdgePulse reflects that most workloads don't actually need sub-10ms latency. When we probe requirements, we often find that 50ms (achievable via our CDN) is sufficient. We win by showing that edge computing adds complexity without proportional benefit for most use cases. We lose when latency is genuinely critical — real-time gaming, IoT control systems, or live video processing.",
    commonScenarios: [
      "Real-time applications needing low latency",
      "IoT platforms with edge requirements",
      "Media streaming and content delivery",
    ],
  },
  {
    id: "bc-6",
    competitorId: "devstreamio",
    updatedAt: "2026-01-20T00:00:00Z",
    positioning: "Zero-config serverless platform. Positions as 'the fastest way to ship.'",
    ourAdvantages: [
      "No vendor lock-in — standard containers and runtimes",
      "Full control over infrastructure configuration",
      "Scales to any workload type (not just serverless)",
      "Enterprise security and compliance",
    ],
    theirAdvantages: [
      "Zero-config deployments",
      "Generous free tier (1M invocations)",
      "AI-powered function generation",
      "Fastest time-to-deploy for new projects",
    ],
    objectionHandling: [
      {
        objection: "DevStreamIO is so much easier to use",
        response: "DevStreamIO is great for getting started quickly, but teams often outgrow it. Their proprietary runtime creates lock-in, costs increase significantly at scale, and you'll eventually need infrastructure control they don't offer. Starting on AcmeCloud means no painful migration later.",
      },
    ],
    keyDifferentiators: [
      "No lock-in — portable, standard runtimes",
      "Cost-effective at scale (no serverless tax)",
      "Full infrastructure control when needed",
      "Enterprise-grade from day one",
    ],
    pricingComparison: "DevStreamIO is cheaper for small workloads (free tier). At scale (>5M invocations/month), AcmeCloud is 40-60% cheaper.",
    winRate: 82,
    winRateRationale: "Our high 82% win rate against DevStreamIO reflects that we rarely compete directly — they target early-stage developers while we focus on scaling teams. When we do compete, we win by highlighting the 'serverless tax' at scale and the risks of proprietary lock-in. We lose when speed-to-deploy trumps all other concerns, typically in hackathons or proof-of-concept projects where long-term costs aren't a factor.",
    commonScenarios: [
      "Indie developers and early-stage startups",
      "Hackathon/prototype projects",
      "Teams wanting zero-ops serverless",
    ],
  },
  {
    id: "bc-7",
    competitorId: "quantumbase",
    updatedAt: "2026-01-31T00:00:00Z",
    positioning: "AI-native cloud built from scratch for model training and inference. Positions as 'the future of AI infrastructure.'",
    ourAdvantages: [
      "General-purpose — supports all workload types, not just AI",
      "Production-proven with enterprise customers",
      "Established support and SLA infrastructure",
      "No risk of startup failure — stable, funded, growing",
    ],
    theirAdvantages: [
      "3x training efficiency (published research)",
      "Purpose-built for AI — optimized top to bottom",
      "Custom silicon for inference (coming)",
      "Backed by Sequoia and a16z with strong founding team",
    ],
    objectionHandling: [
      {
        objection: "QuantumBase's training efficiency is 3x better",
        response: "Their research is promising but unproven at production scale. They're still in private beta with no published uptime data or enterprise references. For production AI workloads, reliability and support matter as much as raw efficiency. We offer both.",
      },
      {
        objection: "We want to future-proof our AI infrastructure",
        response: "Future-proofing means not betting on a pre-revenue startup. AcmeCloud's AI infrastructure is production-proven, and we're actively investing in next-gen efficiency. We'll match QuantumBase's efficiency within 12 months while offering the reliability your team depends on.",
      },
    ],
    keyDifferentiators: [
      "Production-proven vs private beta",
      "General-purpose platform vs AI-only",
      "Enterprise reliability and support",
      "Lower risk — established company vs startup",
    ],
    pricingComparison: "QuantumBase claims 60% lower cost per FLOP for training. Pricing is not publicly available (private beta). AcmeCloud offers volume discounts for large AI workloads.",
    winRate: 85,
    winRateRationale: "Our 85% win rate against QuantumBase is currently our highest, but this reflects their pre-revenue status rather than competitive strength. Enterprise buyers are hesitant to bet on a private-beta startup for production AI workloads. We win by emphasizing reliability, support SLAs, and the risk of vendor failure. As QuantumBase matures and validates their efficiency claims at scale, expect this rate to decline significantly.",
    commonScenarios: [
      "Enterprise teams evaluating AI training platforms",
      "Teams with large-scale model training needs",
      "Organizations exploring next-gen AI infrastructure",
    ],
  },
];

// ============================================================
// DASHBOARD KPIs
// ============================================================

export const dashboardKPIs: DashboardKPI[] = [
  {
    label: "Tracked Competitors",
    value: "7",
    change: 0,
    changeDirection: "flat",
    period: "vs last 30d",
    sparkline: [7, 7, 7, 7, 7, 7, 7],
  },
  {
    label: "Active Signals",
    value: "142",
    change: 23,
    changeDirection: "up",
    period: "vs last 30d",
    sparkline: [85, 92, 105, 110, 118, 130, 142],
  },
  {
    label: "AI Insights Generated",
    value: "38",
    change: 12,
    changeDirection: "up",
    period: "vs last 30d",
    sparkline: [20, 22, 26, 28, 31, 35, 38],
  },
  {
    label: "Sources Monitored",
    value: "247",
    change: 15,
    changeDirection: "up",
    period: "vs last 30d",
    sparkline: [180, 195, 210, 220, 230, 240, 247],
  },
  {
    label: "Avg Confidence Score",
    value: "84%",
    change: 3,
    changeDirection: "up",
    period: "vs last 30d",
    sparkline: [78, 79, 80, 82, 83, 83, 84],
  },
  {
    label: "Critical Threats",
    value: "1",
    change: 0,
    changeDirection: "flat",
    period: "vs last 30d",
    sparkline: [1, 1, 1, 1, 1, 1, 1],
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getCompetitor(slug: string): Competitor | undefined {
  return competitors.find((c) => c.slug === slug);
}

export function getCompetitorSources(competitorId: string): Source[] {
  return sources.filter((s) => s.competitorId === competitorId);
}

export function getCompetitorSignals(competitorId: string): Signal[] {
  return signals.filter((s) => s.competitorId === competitorId);
}

export function getCompetitorInsights(competitorId: string): Insight[] {
  return insights.filter((i) => i.competitorIds.includes(competitorId));
}

export function getCompetitorBattlecard(competitorId: string): Battlecard | undefined {
  return battlecards.find((b) => b.competitorId === competitorId);
}

export function getSourceById(id: string): Source | undefined {
  return sources.find((s) => s.id === id);
}

export function getSignalById(id: string): Signal | undefined {
  return signals.find((s) => s.id === id);
}

export function getInsightById(id: string): Insight | undefined {
  return insights.find((i) => i.id === id);
}

export function getRelatedInsights(insightId: string): Insight[] {
  const insight = getInsightById(insightId);
  if (!insight?.relatedInsightIds) return [];
  return insight.relatedInsightIds
    .map((id) => getInsightById(id))
    .filter((i): i is Insight => i !== undefined)
    .slice(0, 3);
}
