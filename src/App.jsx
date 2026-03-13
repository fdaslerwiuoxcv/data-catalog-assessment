import React, { useState, useEffect } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip, Legend,
} from "recharts";

// ═══════════════════════════════════════════════════════════════════════════════
// THEME & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const C = {
  bg: "#F4F6FA",        // Light grey background
  surface: "#FFFFFF",   // White surface
  elevated: "#EDF0F7",  // Slightly elevated
  border: "#D8DEE9",    // Soft border
  borderMid: "#B8C4D8", // Medium border
  primary: "#0072BC",   // NTT Future Blue (primary in light mode)
  primaryDim: "#005A96",// Darker blue
  accent: "#009AA4",    // Teal accent
  text: "#0A1628",      // Deep navy text
  textMuted: "#4A6080", // Muted text
  textDim: "#8FA3BE",   // Dim text
  gold: "#B8860B",      // Darker gold for readability on light
  silver: "#6B7A8D",
  bronze: "#8B5E2A",
};

const TOOLS = [
  { id: "purview",  name: "Microsoft Purview",  shortName: "Purview",  color: "#0072BC", bg: "rgba(0,114,188,0.12)" },  // Future Blue
  { id: "collibra", name: "Collibra",            shortName: "Collibra", color: "#FF7A00", bg: "rgba(255,122,0,0.12)"  },  // Orange
  { id: "alation",  name: "Alation",             shortName: "Alation",  color: "#E42600", bg: "rgba(228,38,0,0.12)"   },  // Orange 100
  { id: "atlan",    name: "Atlan",               shortName: "Atlan",    color: "#00CB5D", bg: "rgba(0,203,93,0.12)"   },  // Green
  { id: "cdgc",     name: "Informatica CDGC",    shortName: "CDGC",     color: "#19A3FC", bg: "rgba(25,163,252,0.12)" },  // Future Blue 50
];

const DIMENSIONS = [
  { id: "functional",  label: "Functional",   fullLabel: "Functional Capabilities", weight: 0.30 },
  { id: "technical",   label: "Technical",    fullLabel: "Technical Fit",           weight: 0.25 },
  { id: "maturity",    label: "Maturity",     fullLabel: "Org Maturity & Scale",    weight: 0.20 },
  { id: "cost",        label: "Cost",         fullLabel: "Cost & Licensing",         weight: 0.15 },
  { id: "compliance",  label: "Compliance",   fullLabel: "Regulatory & Compliance", weight: 0.10 },
];


// ═══════════════════════════════════════════════════════════════════════════════
// EVALUATION MATRIX CRITERIA (42 items)
// ═══════════════════════════════════════════════════════════════════════════════

// Dimension mapping:
// functional  — core catalog feature capabilities
// technical   — platform/integration/architecture fit
// maturity    — adoption ease, org readiness, non-technical user fit
// cost        — budget and licensing
// compliance  — regulatory, security, audit
const CRITERIA = [
  { id:1,  poc:"B", dim:"functional",  topic:"Business Glossary",           desc:"Does the metadata repository consist of both business and technical definitions, and can it be easily browsed by end users and power users via client/server and/or Web Connections?" },
  { id:2,  poc:"T", dim:"functional",  topic:"Business Glossary",           desc:"Does the repository allow for custom business metadata crowd sourced from users? (Ex. Ability to store metric calculation details, use cases, value identified $, Issues Identified)?" },
  { id:3,  poc:"T", dim:"functional",  topic:"Data Catalog",                desc:"Is there support to generate, manage, and maintain transformation rules?" },
  { id:4,  poc:"T", dim:"functional",  topic:"Data Catalog",                desc:"Is there support to generate, manage, and maintain derived computations?" },
  { id:5,  poc:"T", dim:"functional",  topic:"Data Catalog",                desc:"Is there ML support for automatic generation of source data definitions, transformation objects, target data models, and operational statistics?" },
  { id:6,  poc:"T", dim:"technical",   topic:"Data Catalog",                desc:"Does the tool collect Business and Technical metadata from ERP systems, such as SAP?" },
  { id:7,  poc:"T", dim:"technical",   topic:"Data Catalog",                desc:"Does the tool integrate with preferred BI Tools (e.g. Tableau, Power BI, Sisense, Looker)?" },
  { id:8,  poc:"T", dim:"functional",  topic:"Data Dictionary",             desc:"Is there support for automatic generation of source data definitions, transformation objects, target data models, and operational statistics?" },
  { id:9,  poc:"T", dim:"functional",  topic:"Data Lineage",                desc:"Is there the ability to support Data Lineage analysis from source systems all of the way through to the reports with all the transformation steps in between?" },
  { id:10, poc:"T", dim:"technical",   topic:"Data Lineage",                desc:"Does the tool have ability to automatically build Lineage from ETL platforms (e.g. SQL Stored Procedures, Database Views, data movement routines)?" },
  { id:11, poc:"T", dim:"functional",  topic:"Data Lineage",                desc:"Does the tool allow for automatic propagation of changes in the metadata and its impact on Lineage?" },
  { id:12, poc:"T", dim:"functional",  topic:"Data Lineage",                desc:"Does the Tool allow for storing and displaying different levels of lineage information — High level, system level data flow all the way up to field level dataflow?" },
  { id:13, poc:"T", dim:"compliance",  topic:"Data Lineage/Lifecycle Mgmt", desc:"Ability to locate, report, and be able to delete data of any individual, based on PII laws." },
  { id:14, poc:"T", dim:"functional",  topic:"Data Linking and Search",     desc:"Are automatic propagation of changes supported?" },
  { id:15, poc:"T", dim:"functional",  topic:"Data Quality",                desc:"Does the tool provide System metadata such as last refresh date/time of the dataset?" },
  { id:16, poc:"T", dim:"functional",  topic:"Data Quality",                desc:"Does the tool provide data quality score based on pre-defined rules and thresholds?" },
  { id:17, poc:"B", dim:"maturity",    topic:"Data Quality",                desc:"Does the tool provide ability for non-technical business users to define business rules as simple language and can be pointed to different databases for its implementation?" },
  { id:18, poc:"T", dim:"functional",  topic:"Data Quality",                desc:"Does the tool allow for defining workflows based on data quality checks for orchestration of changes to improve data quality? The workflow can also include manual intervention by Data Owners and Data Stewards." },
  { id:19, poc:"T", dim:"functional",  topic:"Tags",                        desc:"Does the tool allow for adding multiple Tags?" },
  { id:20, poc:"B", dim:"maturity",    topic:"Usability",                   desc:"Does the tool offer ML enabled definition/categorization/Tagging of data?" },
  { id:21, poc:"B", dim:"maturity",    topic:"Usability",                   desc:"Ease of Use. How quickly can users get up to speed with the tools, and how much training and support will they require?" },
  { id:22, poc:"B", dim:"maturity",    topic:"Usability",                   desc:"Does the toolset allow multiple users to work on the same project concurrently, sharing ideas and results?" },
  { id:23, poc:"B", dim:"technical",   topic:"Usability",                   desc:"Can users attach to the development environment via a LAN, WAN, or the Internet?" },
  { id:24, poc:"B", dim:"maturity",    topic:"Usability",                   desc:"Does the tool provide a point and click environment versus programming?" },
  { id:25, poc:"T", dim:"functional",  topic:"Usability",                   desc:"Does the tool enable clear ownership / stewardship and data management capabilities for data products?" },
  { id:26, poc:"T", dim:"functional",  topic:"Usability",                   desc:"Does the tool allow for multiple owners (Business Owner / IT Owner) of each data collection?" },
  { id:27, poc:"T", dim:"maturity",    topic:"Usability",                   desc:"Does the tool leverage machine learning to reduce the administrative burden on data stewards and data owners?" },
  { id:28, poc:"T", dim:"functional",  topic:"Usability",                   desc:"Does the tool provide data about how users interact with data sources or the repository itself? (Ex. top users, sort by popularity)" },
  { id:29, poc:"B", dim:"functional",  topic:"Usability — Search",          desc:"Ability to search Taxonomy, business glossary, Tags, Table Name, Field names (Metadata), and data owners." },
  { id:30, poc:"T", dim:"compliance",  topic:"Security",                    desc:"Does the tool allow source and target database Security to prevail?" },
  { id:31, poc:"T", dim:"compliance",  topic:"Security",                    desc:"Does the tool require registration of users to gain access to environment?" },
  { id:32, poc:"T", dim:"compliance",  topic:"Security",                    desc:"Does the tool allow for user permissions to be set by work area (or folder)?" },
  { id:33, poc:"T", dim:"technical",   topic:"Setup and Configuration",     desc:"What is the ease of installation and configuration?" },
  { id:34, poc:"T", dim:"technical",   topic:"Setup and Configuration",     desc:"Does the platform have the capabilities of a modern application? (Ex. elastic, resilient, automation & monitoring)" },
  { id:35, poc:"T", dim:"technical",   topic:"Setup and Configuration",     desc:"Does the tool capture metadata across On-premise and Cloud environments?" },
  { id:36, poc:"T", dim:"technical",   topic:"Setup and Configuration",     desc:"Does the tool integrate with preferred BI Tools (e.g. Sisense, Tableau)?" },
  { id:37, poc:"T", dim:"technical",   topic:"Setup and Configuration",     desc:"Does the tool read the metadata tags, query logs, and table schemas from common data repositories (e.g. AWS Redshift, SQL Server, Tableau Server)?" },
  { id:38, poc:"T", dim:"cost",        topic:"Cost",                        desc:"Is the enterprise cost of the tool within expected budget?" },
  { id:39, poc:"T", dim:"cost",        topic:"Cost",                        desc:"What is the licensing model? (Enterprise License, User based License, Usage/CPU based License, etc.)" },
  { id:40, poc:"T", dim:"cost",        topic:"Cost",                        desc:"What is the one time license cost and what is the running annual license cost?" },
  { id:41, poc:"T", dim:"compliance",  topic:"Audit Capability",            desc:"Can the tool produce audit and operational reports for each table update of the environment?" },
  { id:42, poc:"T", dim:"compliance",  topic:"Audit Capability",            desc:"Can metadata compliance against metadata standards be reported on?" },
];

// Score labels
const SEL_LABELS = ["0 - Does not meet","1 - Partially meets","2 - Minimally meets","3 - Meets criteria","4 - Exceeds criteria","5 - Impressively exceeds"];
const SOL_LABELS = ["0 - Not Available","1 - Custom Dev required","2 - Requires configuration","3 - Out of the Box"];
const WT_LABELS  = ["1x - Nice to Have","2x - Desirable","3x - Essential / Critical"];

function buildMatrixPrompt(answers, vendorIds) {
  const clientName = answers.profile?.client_name || "the client";
  const getAns = (sec, q) => { const v = answers[sec]?.[q]; return Array.isArray(v) ? v.join(", ") : v || "Not specified"; };

  const clientCtx = `Client: ${clientName} | Industry: ${getAns("profile","industry")} | Size: ${getAns("profile","org_size")}
Primary driver: ${getAns("profile","primary_goal")} | Deployment: ${getAns("technical","deployment")} | Cloud: ${getAns("technical","cloud_platform")}
Existing tools: ${getAns("technical","existing_tools")} | Data sources: ${getAns("technical","data_sources")}
DG Maturity: ${getAns("maturity","dg_maturity")} | Budget: ${getAns("cost","budget")} | Contracts: ${getAns("cost","contracts")}
Regulations: ${getAns("compliance","regulations")} | Audit: ${getAns("compliance","audit_trail")} | PII: ${getAns("compliance","pii_classification")}`;

  const vendorList = vendorIds.join(", ");

  return `You are a senior data governance consultant at NTT DATA. Score each of the 42 evaluation criteria for each tool listed below, based on the client requirements provided.

CLIENT REQUIREMENTS:
${clientCtx}

TOOLS TO SCORE: ${vendorList}

For each criterion, provide:
- sel: Selection Score 0-5 (5=impressively exceeds, 4=exceeds, 3=meets, 2=minimally meets, 1=partially meets, 0=does not meet)
- sol: Solution Score 0-3 (3=Out of Box, 2=Requires Configuration, 1=Custom Development, 0=Not Available)
- wt: Suggested weight 1-3 (3=Essential/Critical to this client, 2=Desirable, 1=Nice to Have) — based on client's stated priorities

Differentiate scores meaningfully. Consider actual tool capabilities and this client's specific requirements.

Return ONLY a raw JSON object. No markdown, no prose. Start with { end with }. All values must be plain integers.

Format: {"criteria":[{"id":1,"wt":2,"purview":{"sel":4,"sol":3},"collibra":{"sel":3,"sol":2},"alation":{"sel":3,"sol":3},"atlan":{"sel":2,"sol":3},"cdgc":{"sel":3,"sol":2}},{"id":2,...},...]}

All 42 criteria must be present (id 1 through 42).`;
}


const SECTIONS = [
  { id: "profile",    title: "Organization Profile",      subtitle: "Context about the client organization",                        icon: "⬡", dim: null },
  { id: "functional", title: "Functional Capabilities",   subtitle: "Which catalog features are mission-critical?",                  icon: "◎", dim: "functional" },
  { id: "technical",  title: "Technical Fit",             subtitle: "Cloud platform, integrations & architecture",                   icon: "⬢", dim: "technical" },
  { id: "maturity",   title: "Org Maturity & Scale",      subtitle: "Governance maturity and team capacity",                         icon: "◇", dim: "maturity" },
  { id: "cost",       title: "Cost & Licensing",          subtitle: "Budget constraints and commercial model",                       icon: "◈", dim: "cost" },
  { id: "compliance", title: "Regulatory & Compliance",   subtitle: "Regulations and data sovereignty requirements",                 icon: "△", dim: "compliance" },
  { id: "criteria_a", title: "Feature & Metadata Criteria",   subtitle: "Rate the importance of each capability to this client (0 = Not Required → 5 = Mission Critical)", icon: "◑", dim: null },
  { id: "criteria_b", title: "Platform & Governance Criteria", subtitle: "Rate the importance of each capability to this client (0 = Not Required → 5 = Mission Critical)", icon: "◐", dim: null },
];

const CRIT_SCALE = [
  { v: 0, l: "Not Required",    s: "0" },
  { v: 1, l: "Low",             s: "1" },
  { v: 2, l: "Moderate",        s: "2" },
  { v: 3, l: "Important",       s: "3" },
  { v: 4, l: "High Priority",   s: "4" },
  { v: 5, l: "Mission Critical", s: "5" },
];

const IMP = [
  { v: 1, l: "Not Needed" },
  { v: 2, l: "Low" },
  { v: 3, l: "Medium" },
  { v: 4, l: "High" },
  { v: 5, l: "Critical" },
];

const QUESTIONS = {
  profile: [
    { id: "client_name",  label: "Client / Organization Name", type: "text",   placeholder: "e.g., Acme Financial Corp" },
    { id: "industry",     label: "Industry Vertical",          type: "select", options: ["Financial Services","Healthcare & Life Sciences","Retail & Consumer","Manufacturing","Energy & Utilities","Government & Public Sector","Technology","Insurance","Telecommunications","Other"] },
    { id: "org_size",     label: "Organization Size (Employees)", type: "select", options: ["< 500","500 – 2,000","2,000 – 10,000","10,000 – 50,000","> 50,000"] },
    { id: "data_domains", label: "Estimated Data Domains to Catalog", type: "select", options: ["1 – 5","6 – 15","16 – 30","31 – 50","50+"] },
    { id: "primary_goal", label: "Primary Driver for a Data Catalog", type: "select", options: ["Data discovery & self-service analytics","Regulatory compliance & audit readiness","Data governance & stewardship workflows","End-to-end data lineage & impact analysis","MDM / data quality improvement","AI/ML data management & model governance","Enterprise-wide data democratization"] },
  ],
  functional: [
    { id: "lineage",       label: "End-to-end data lineage (column-level)",     type: "importance", desc: "Track data from source to consumption, including column-level transformations" },
    { id: "glossary",      label: "Business glossary & metadata management",     type: "importance", desc: "Centralized business terms, definitions, and metadata authoring" },
    { id: "stewardship",   label: "Data stewardship & workflow automation",      type: "importance", desc: "Assign ownership, tasks, approvals, and manage governance workflows" },
    { id: "discovery",     label: "Data discovery & intelligent search",         type: "importance", desc: "Find data assets via AI-powered search, recommendations, and usage signals" },
    { id: "dq_integration",label: "Data quality integration & trust scoring",   type: "importance", desc: "Surface data quality metrics and trust scores within the catalog" },
    { id: "policy_mgmt",   label: "Policy management & access governance",      type: "importance", desc: "Define, enforce, and audit data access policies and classification rules" },
    { id: "ai_ml_metadata",label: "AI/ML metadata & model governance",          type: "importance", desc: "Catalog ML features, models, experiments, and their lineage" },
    { id: "collaboration", label: "Social collaboration & crowdsourced curation",type: "importance", desc: "Comments, ratings, crowdsourced annotations, and usage behavior tracking" },
  ],
  technical: [
    { id: "deployment",    label: "Preferred Deployment Model",        type: "select", options: ["Cloud-native / SaaS preferred","On-premises required","Hybrid (cloud + on-prem)","No strong preference"] },
    { id: "cloud_platform",label: "Primary Cloud Platform",            type: "select", options: ["Microsoft Azure","Amazon Web Services (AWS)","Google Cloud Platform (GCP)","Multi-cloud environment","On-premises / No public cloud"] },
    { id: "existing_tools",label: "Existing Data Management Tools",    type: "multicheck", options: ["Informatica (IICS / IDQ / MDM)","Microsoft Purview / Azure Data Factory","Collibra (existing deployment)","IBM InfoSphere / Watson","Talend","dbt Core / dbt Cloud","Apache Spark / Databricks","None — greenfield environment","Other"] },
    { id: "data_sources",  label: "Key Data Sources to Integrate",     type: "multicheck", options: ["Snowflake","Databricks / Delta Lake","SQL Server / Azure SQL","Oracle Database","Salesforce","SAP (S/4HANA, BW)","AWS Redshift","Google BigQuery","Teradata","Hadoop / Hive","Other"] },
    { id: "api_needs",     label: "API & Custom Extensibility Needs",  type: "select", options: ["High — deep API access and custom integrations required","Medium — standard REST APIs for key integrations","Low — out-of-the-box connectors are sufficient"] },
    { id: "asset_volume",  label: "Estimated Volume of Data Assets",   type: "select", options: ["< 10,000 assets","10,000 – 100,000 assets","100,000 – 1M assets","1M+ assets"] },
  ],
  maturity: [
    { id: "dg_maturity",   label: "Current Data Governance Maturity",           type: "select", options: ["Level 1 – Initial (ad hoc, no formal DG program)","Level 2 – Managed (some policies, limited enforcement)","Level 3 – Defined (standardized processes, active stewards)","Level 4 – Quantitatively Managed (metrics-driven DG)","Level 5 – Optimizing (continuous improvement, AI-assisted DG)"] },
    { id: "steward_count", label: "Active Data Stewards / Data Owners",          type: "select", options: ["Fewer than 5","5 – 20","21 – 50","51 – 100","More than 100"] },
    { id: "user_tech",     label: "Technical Sophistication of Primary Users",   type: "select", options: ["Business users (non-technical, simple UX required)","Analysts & data consumers (moderately technical)","Data engineers & architects (highly technical)","Mixed — wide range of technical capability"] },
    { id: "timeline",      label: "Expected Implementation Timeline",            type: "select", options: ["Under 3 months","3 – 6 months","6 – 12 months","12 – 18 months","18+ months"] },
    { id: "team_capacity", label: "Internal Implementation Team Availability",   type: "select", options: ["Large dedicated team (10+ FTEs)","Small dedicated team (3 – 9 FTEs)","Partial — shared alongside other duties","Limited — highly dependent on vendor / SI"] },
  ],
  cost: [
    { id: "budget",        label: "Annual Budget for Data Catalog Tooling",  type: "select", options: ["Under $100K","$100K – $250K","$250K – $500K","$500K – $1M","Over $1M","Budget not yet determined"] },
    { id: "license_model", label: "Preferred Commercial / Licensing Model",  type: "select", options: ["SaaS subscription (OpEx preferred)","Perpetual license (CapEx preferred)","Open-source with commercial support","No preference"] },
    { id: "tco_sensitivity",label: "Sensitivity to Total Cost of Ownership", type: "select", options: ["High — cost is a primary decision factor","Medium — cost matters but capability takes priority","Low — best-fit tool regardless of cost"] },
    { id: "contracts",     label: "Existing Enterprise Agreements That Could Reduce Cost", type: "multicheck", options: ["Microsoft Enterprise Agreement / Azure Commitment","Informatica Enterprise License Agreement","AWS Enterprise Discount Program (EDP)","Salesforce Enterprise Agreement","None of the above"] },
  ],
  compliance: [
    { id: "regulations",      label: "Applicable Regulatory Frameworks",    type: "multicheck", options: ["GDPR (EU data privacy)","CCPA / CPRA (California)","HIPAA (healthcare)","SOX (financial reporting)","Basel III / IV","BCBS 239 (risk data aggregation)","PCI-DSS (payment card)","DORA (EU digital operational resilience)","NIST / FedRAMP (US federal)","None currently applicable"] },
    { id: "data_residency",   label: "Data Residency / Sovereignty Requirements", type: "select", options: ["Strict — data must remain within a specific geography","Moderate — preferred geography with some flexibility","None — no data residency constraints"] },
    { id: "audit_trail",      label: "Audit Trail & Access Logging Requirements", type: "select", options: ["Critical — full audit trail required for regulatory exams","Important — needed for internal audit and compliance","Nice to have — not a current compliance requirement"] },
    { id: "pii_classification",label: "PII / Sensitive Data Classification Needs", type: "select", options: ["Extensive — large PII volumes, automated classification essential","Moderate — some PII, manual classification acceptable","Minimal — limited PII exposure"] },
  ],
  criteria_a: CRITERIA.slice(0, 21).map(c => ({ id: `c${c.id}`, criterionId: c.id, type: "criterion_rating", topic: c.topic, poc: c.poc, desc: c.desc })),
  criteria_b: CRITERIA.slice(21).map(c => ({ id: `c${c.id}`, criterionId: c.id, type: "criterion_rating", topic: c.topic, poc: c.poc, desc: c.desc })),
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const getAns = (answers, section, q) => {
  const v = answers[section]?.[q];
  if (Array.isArray(v)) return v.length ? v.join(", ") : "Not specified";
  return v || "Not specified";
};

function buildPrompt(answers) {
  const critA = answers.criteria_a || {};
  const critB = answers.criteria_b || {};
  const allCritAnswers = { ...critA, ...critB };
  const criteriaLines = CRITERIA.map(c => {
    const sel = allCritAnswers[`c${c.id}`] ?? 0;
    return `[${c.id}] ${c.topic} | ${c.desc.slice(0, 80)}${c.desc.length > 80 ? "…" : ""} | Client Priority: ${sel}/5`;
  }).join("\n");

  return `You are a senior data governance consultant at NTT DATA evaluating data catalog tool fit.

## CLIENT REQUIREMENTS

**Organization:** ${getAns(answers,"profile","client_name")} | Industry: ${getAns(answers,"profile","industry")} | Size: ${getAns(answers,"profile","org_size")} employees
**Data domains:** ${getAns(answers,"profile","data_domains")} | **Primary driver:** ${getAns(answers,"profile","primary_goal")}

**Functional Priorities (1=Low, 5=Critical):**
- Data lineage: ${getAns(answers,"functional","lineage")}/5 | Business glossary: ${getAns(answers,"functional","glossary")}/5
- Stewardship workflows: ${getAns(answers,"functional","stewardship")}/5 | Discovery & search: ${getAns(answers,"functional","discovery")}/5
- Data quality: ${getAns(answers,"functional","dq_integration")}/5 | Policy governance: ${getAns(answers,"functional","policy_mgmt")}/5

**Technical:** Deployment: ${getAns(answers,"technical","deployment")} | Cloud: ${getAns(answers,"technical","cloud_platform")}
Existing tools: ${getAns(answers,"technical","existing_tools")} | Data sources: ${getAns(answers,"technical","data_sources")}

**Org Maturity:** ${getAns(answers,"maturity","dg_maturity")} | Stewards: ${getAns(answers,"maturity","steward_count")} | Timeline: ${getAns(answers,"maturity","timeline")}

**Cost:** Budget: ${getAns(answers,"cost","budget")} | TCO sensitivity: ${getAns(answers,"cost","tco_sensitivity")}
Existing contracts: ${getAns(answers,"cost","contracts")}

**Compliance:** ${getAns(answers,"compliance","regulations")} | Audit: ${getAns(answers,"compliance","audit_trail")} | PII: ${getAns(answers,"compliance","pii_classification")}

## CONSULTANT-RATED CRITERIA (42 items)
Format: [ID] Topic | Description | Client Priority (0=Not Required, 5=Mission Critical)
${criteriaLines}

## TOOLS
purview=Microsoft Purview | collibra=Collibra | alation=Alation | atlan=Atlan | cdgc=Informatica CDGC

## YOUR TASK
Score each vendor against every criterion:
- sol: 0=Not Available, 1=Custom Dev Required, 2=Requires Configuration, 3=Out of Box
- wt: 1=Nice to Have, 2=Desirable, 3=Essential (your judgment based on this client's context)

Criteria are mapped to dimensions: dimension scores are auto-computed as sum(sel*sol*wt)/max*100.
For criteria with client priority=0, set sol=0.
Differentiate sol scores meaningfully — they directly drive all rankings.

CRITICAL: Return ONLY a raw JSON object. No markdown, no code fences. Start with { end with }.
All values must be plain integers. Include all 42 criteria in matrix.criteria.

{
  "rationale": {
    "purview": "2-3 sentence fit rationale for this specific client",
    "collibra": "2-3 sentence fit rationale",
    "alation": "2-3 sentence fit rationale",
    "atlan": "2-3 sentence fit rationale",
    "cdgc": "2-3 sentence fit rationale"
  },
  "strengths": {
    "purview": ["strength 1", "strength 2", "strength 3"],
    "collibra": ["strength 1", "strength 2", "strength 3"],
    "alation": ["strength 1", "strength 2", "strength 3"],
    "atlan": ["strength 1", "strength 2", "strength 3"],
    "cdgc": ["strength 1", "strength 2", "strength 3"]
  },
  "gaps": {
    "purview": ["gap 1", "gap 2"],
    "collibra": ["gap 1", "gap 2"],
    "alation": ["gap 1", "gap 2"],
    "atlan": ["gap 1", "gap 2"],
    "cdgc": ["gap 1", "gap 2"]
  },
  "executiveSummary": "3-4 sentences naming the top tool and runner-up with key reasons.",
  "topPick": "purview",
  "runnerUp": "collibra",
  "matrix": {
    "criteria": [
      {"id":1,"wt":2,"purview":{"sol":2},"collibra":{"sol":3},"alation":{"sol":2},"atlan":{"sol":2},"cdgc":{"sol":2}},
      {"id":2,"wt":1,"purview":{"sol":2},"collibra":{"sol":3},"alation":{"sol":2},"atlan":{"sol":3},"cdgc":{"sol":2}}
    ]
  }
}`;
}
`;
}

// ── Option A: Dimension scores derived from criteria (Sel × Sol × Wt rollup) ──

function getCritAnswers(answers) {
  return { ...(answers.criteria_a || {}), ...(answers.criteria_b || {}) };
}

function getSel(answers, cId) {
  return getCritAnswers(answers)[`c${cId}`] ?? 0;
}

function getSol(matrixCriteria, cId, toolId) {
  return matrixCriteria.find(r => r.id === cId)?.[toolId]?.sol ?? 0;
}

function getWt(matrixCriteria, cId) {
  return matrixCriteria.find(r => r.id === cId)?.wt ?? 1;
}

function getDimScore(matrixCriteria, answers, toolId, dimId) {
  const dimCriteria = CRITERIA.filter(c => c.dim === dimId);
  let raw = 0, max = 0;
  dimCriteria.forEach(c => {
    const sel = getSel(answers, c.id);
    if (sel === 0) return;
    const sol = getSol(matrixCriteria, c.id, toolId);
    const wt  = getWt(matrixCriteria, c.id);
    raw += sel * sol * wt;
    max += sel * 3 * wt;
  });
  return max > 0 ? Math.round(raw / max * 100) : 0;
}

function getDimRaw(matrixCriteria, answers, toolId, dimId) {
  const dimCriteria = CRITERIA.filter(c => c.dim === dimId);
  return dimCriteria.reduce((sum, c) => {
    const sel = getSel(answers, c.id);
    if (sel === 0) return sum;
    return sum + sel * getSol(matrixCriteria, c.id, toolId) * getWt(matrixCriteria, c.id);
  }, 0);
}

function getDimMax(matrixCriteria, answers, dimId) {
  const dimCriteria = CRITERIA.filter(c => c.dim === dimId);
  return dimCriteria.reduce((sum, c) => {
    const sel = getSel(answers, c.id);
    if (sel === 0) return sum;
    return sum + sel * 3 * getWt(matrixCriteria, c.id);
  }, 0);
}

function rankToolsFromCriteria(matrixCriteria, answers) {
  return TOOLS
    .map(t => {
      const dimScores = {};
      DIMENSIONS.forEach(d => { dimScores[d.id] = getDimScore(matrixCriteria, answers, t.id, d.id); });
      const overall = Math.round(DIMENSIONS.reduce((sum, d) => sum + dimScores[d.id] * d.weight, 0));
      return { ...t, dimScores, overall };
    })
    .sort((a, b) => b.overall - a.overall);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const FONT_URL = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=JetBrains+Mono:wght@400;500&display=swap";

const GlobalStyles = () => (
  <style>{`
    @import url('${FONT_URL}');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: ${C.bg}; color: ${C.text}; font-family: 'Outfit', sans-serif; -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${C.surface}; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: ${C.borderMid}; }
    .fraunces { font-family: 'Fraunces', Georgia, serif; }
    .outfit { font-family: 'Outfit', sans-serif; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes shimmer { from { background-position: -200% center; } to { background-position: 200% center; } }
    .fade-up { animation: fadeUp 0.4s ease both; }
    .fade-up-1 { animation: fadeUp 0.4s 0.05s ease both; }
    .fade-up-2 { animation: fadeUp 0.4s 0.10s ease both; }
    .fade-up-3 { animation: fadeUp 0.4s 0.15s ease both; }
    .fade-up-4 { animation: fadeUp 0.4s 0.20s ease both; }
    .fade-up-5 { animation: fadeUp 0.4s 0.25s ease both; }
    .shimmer-text {
      background: linear-gradient(90deg, ${C.primary} 0%, ${C.primaryDim} 40%, ${C.accent} 100%);
      background-size: 200% auto;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      animation: shimmer 3s linear infinite;
    }
    .grid-bg {
      background-image: linear-gradient(rgba(184,196,216,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(184,196,216,0.5) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .btn-primary {
      background: ${C.primary}; color: #FFFFFF; border: none; cursor: pointer;
      font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.9rem;
      padding: 0.75rem 1.75rem; border-radius: 6px; letter-spacing: 0.02em;
      transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem;
    }
    .btn-primary:hover { background: ${C.primaryDim}; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,114,188,0.25); }
    .btn-primary:active { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    .btn-ghost {
      background: transparent; color: ${C.textMuted}; border: 1px solid ${C.border}; cursor: pointer;
      font-family: 'Outfit', sans-serif; font-weight: 500; font-size: 0.9rem;
      padding: 0.75rem 1.5rem; border-radius: 6px; transition: all 0.2s;
    }
    .btn-ghost:hover { border-color: ${C.borderMid}; color: ${C.text}; background: ${C.elevated}; }
    .card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 10px; }
    .card-elevated { background: ${C.elevated}; border: 1px solid ${C.borderMid}; border-radius: 10px; }
    .importance-btn {
      flex: 1; padding: 0.5rem 0.25rem; border-radius: 5px; border: 1px solid ${C.border};
      background: transparent; color: ${C.textMuted}; cursor: pointer; font-family: 'Outfit', sans-serif;
      font-size: 0.72rem; font-weight: 500; text-align: center; transition: all 0.15s;
    }
    .importance-btn:hover { border-color: ${C.borderMid}; color: ${C.text}; }
    .importance-btn.active { border-color: ${C.primary}; background: rgba(0,114,188,0.08); color: ${C.primary}; font-weight: 600; }
    .select-opt {
      display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem;
      border-radius: 7px; border: 1px solid ${C.border}; cursor: pointer;
      transition: all 0.15s; font-size: 0.88rem;
    }
    .select-opt:hover { border-color: ${C.borderMid}; background: ${C.elevated}; }
    .select-opt.selected { border-color: ${C.primary}; background: rgba(0,114,188,0.06); }
    .radio-circle {
      width: 16px; height: 16px; border-radius: 50%; border: 2px solid ${C.borderMid};
      flex-shrink: 0; transition: all 0.15s; display: flex; align-items: center; justify-content: center;
    }
    .radio-circle.checked { border-color: ${C.primary}; background: ${C.primary}; }
    .radio-circle.checked::after { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #FFFFFF; }
    .checkbox-box {
      width: 16px; height: 16px; border-radius: 3px; border: 2px solid ${C.borderMid};
      flex-shrink: 0; transition: all 0.15s; display: flex; align-items: center; justify-content: center;
    }
    .checkbox-box.checked { border-color: ${C.primary}; background: ${C.primary}; }
    .checkbox-box.checked::after { content: '✓'; color: #FFFFFF; font-size: 10px; font-weight: 700; line-height: 1; }
    input[type="text"] {
      width: 100%; padding: 0.75rem 1rem; background: ${C.elevated}; border: 1px solid ${C.border};
      border-radius: 7px; color: ${C.text}; font-family: 'Outfit', sans-serif; font-size: 0.9rem;
      outline: none; transition: border-color 0.2s;
    }
    input[type="text"]:focus { border-color: ${C.primary}; }
    input[type="text"]::placeholder { color: ${C.textDim}; }
    .score-bar-wrap { height: 6px; background: ${C.border}; border-radius: 3px; overflow: hidden; }
    .score-bar { height: 100%; border-radius: 3px; transition: width 1s cubic-bezier(0.4,0,0.2,1); }
    .medal { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; flex-shrink: 0; }
    .print-btn { display: none; } @media print { .no-print { display: none !important; } .print-btn { display: block; } }
    @media (max-width: 768px) { .hide-mobile { display: none !important; } }
  `}</style>
);

// ═══════════════════════════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════════════════════════

function Header({ clientName, onReset }) {
  return (
    <header style={{ borderBottom: `1px solid ${C.border}`, background: `${C.surface}E0`, backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100, padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg viewBox="0 0 1596.7 439.3" style={{ height: 24, width: "auto" }} xmlns="http://www.w3.org/2000/svg">
            <style>{`.nL2{fill-rule:evenodd;clip-rule:evenodd;fill:#0A1628;}.nL3{fill:#0A1628;}`}</style>
            <path className="nL2" d="M318.3,85.5c-12.8,0-25.4,2.8-34.3,6.4c-8.9-3.6-21.5-6.4-34.3-6.4c-56.4,0-107.4,53.4-107.4,126.6c0,79.8,65.2,141.6,141.7,141.6c76.5,0,141.7-61.7,141.7-141.6C425.7,138.9,374.7,85.5,318.3,85.5L318.3,85.5z M284,129c10.9,6.5,25.2,25.2,25.2,46.4c0,15.5-10.2,27.7-25.2,27.7c-15,0-25.2-12.2-25.2-27.7C258.7,154.2,273.1,135.5,284,129L284,129z M284,318.8c-58.5,0-106.9-47.1-106.9-107.4c0-55.1,39.8-92.7,71-91.3c-14.8,14.7-23.8,36.2-23.8,57c0,35.8,28.4,60.9,59.7,60.9c31.3,0,59.7-25.1,59.7-60.9c0-20.8-9-42.3-23.8-57c31.2-1.4,71,36.2,71,91.3C390.9,271.8,342.5,318.8,284,318.8z"/>
            <path className="nL3" d="M629.8,146.6v29.2c0,0,41.3,0,44.5,0c0,3.2,0,109.5,0,109.5h31.5c0,0,0-106.2,0-109.5c3.1,0,44.5,0,44.5,0v-29.2H629.8z"/>
            <path className="nL3" d="M1148.1,146.6h-79.3V176h77.2c11.3,0,15.7,5.2,15.7,18.4c0,0.1,0,3.8,0,4.9c-3.2,0-64,0-64,0c-24.3,0-36.4,12.2-36.4,39.7v6.5c0,28.3,12.5,39.6,37.8,39.6h93.8v-91.1C1193,159.2,1181.4,146.6,1148.1,146.6z M1102.4,255.6c-4.8,0-10.1-2.4-10.1-14.3c0-11.9,5.3-14,10.1-14c0,0,56.2,0,59.4,0v28.3C1158.6,255.6,1102.4,255.6,1102.4,255.6z"/>
            <path className="nL3" d="M1409.6,146.6h-79.3V176h77.2c11.3,0,15.7,5.2,15.7,18.4c0,0.1,0,3.8,0,4.9c-3.2,0-64,0-64,0c-24.3,0-36.4,12.2-36.4,39.7v6.5c0,28.3,12.5,39.6,37.8,39.6h93.8v-91.1C1454.4,159.2,1442.9,146.6,1409.6,146.6z M1363.9,255.6c-4.8,0-10.1-2.4-10.1-14.3c0-11.9,5.3-14,10.1-14c0,0,56.2,0,59.4,0v28.3C1420.1,255.6,1363.9,255.6,1363.9,255.6z"/>
            <path className="nL3" d="M760.2,146.6v29.2c0,0,41.4,0,44.5,0c0,3.2,0,109.5,0,109.5h31.5c0,0,0-106.2,0-109.5c3.1,0,44.5,0,44.5,0v-29.2H760.2z"/>
            <path className="nL3" d="M1199.3,146.6v29.2c0,0,41.3,0,44.5,0c0,3.2,0,109.5,0,109.5h31.5c0,0,0-106.2,0-109.5c3.1,0,44.5,0,44.5,0v-29.2H1199.3z"/>
            <path className="nL3" d="M1049.2,236.7v-41.5c0-36.3-14.1-48.6-45.9-48.6H919v138.6h85.8C1038.5,285.2,1049.2,268.5,1049.2,236.7z M1017,237.3c0,13.3-4.5,18.4-15.8,18.4c0,0-47.6,0-50.7,0v-79.6c3.1,0,50.7,0,50.7,0c11.3,0,15.8,5.2,15.8,18.4C1017,194.7,1017,237.3,1017,237.3z"/>
            <path className="nL3" d="M585.4,252.2c-0.7-1.3-42.8-83.3-47.9-91.3c-5.9-9.3-13.2-15.8-27-15.8c-12.9,0-28.1,5.7-28.1,36.6v103.7h31.1c0,0,0-80.2,0-86.5c0-6.2-0.4-15.4-0.5-17.2c-0.1-1.5,0-3,0.8-3.4c0.9-0.5,1.8,0.3,2.4,1.5c0.6,1.2,39.6,78.3,47.9,91.3c5.9,9.3,13.2,15.8,27,15.8c12.8,0,28.1-5.7,28.1-36.6V146.6h-31c0,0,0,80.2,0,86.5c0,6.2,0.4,15.4,0.5,17.3c0.1,1.5,0,3-0.8,3.4C586.9,254.2,586,253.4,585.4,252.2z"/>
          </svg>
        </div>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <span className="outfit" style={{ fontWeight: 600, fontSize: "0.9rem", color: C.text }}>Data Catalog Fit Assessment</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {clientName && <span style={{ fontSize: "0.8rem", color: C.textMuted, background: C.elevated, padding: "0.3rem 0.75rem", borderRadius: 20, border: `1px solid ${C.border}` }}>{clientName}</span>}
        {onReset && <button onClick={onReset} className="btn-ghost" style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}>↩ Restart</button>}
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTRO SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

function IntroScreen({ onStart }) {
  return (
    <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1.5rem", position: "relative", overflow: "hidden" }}>
      <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.3 }} />
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: `radial-gradient(circle, rgba(0,114,188,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "relative", maxWidth: 680, width: "100%", textAlign: "center" }}>
        <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: C.elevated, border: `1px solid ${C.borderMid}`, borderRadius: 20, padding: "0.35rem 1rem", marginBottom: "2rem" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.primary, display: "inline-block" }} />
          <span className="mono" style={{ fontSize: "0.75rem", color: C.primary, letterSpacing: "0.1em" }}>AI-POWERED TOOL EVALUATION</span>
        </div>
        <h1 className="fraunces shimmer-text fade-up-1" style={{ fontSize: "clamp(2.4rem, 6vw, 3.5rem)", fontWeight: 700, lineHeight: 1.08, marginBottom: "1.25rem" }}>
          Data Catalog<br />Fit Assessment
        </h1>
        <p className="fade-up-2" style={{ fontSize: "1.05rem", color: C.textMuted, lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: 520, margin: "0 auto 2.5rem" }}>
          A structured evaluation framework that compares leading enterprise data catalog platforms against your client's specific requirements, maturity level, and business goals.
        </p>
        <div className="fade-up-3" style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
          {TOOLS.map(t => (
            <div key={t.id} style={{ padding: "0.4rem 0.9rem", background: t.bg, border: `1px solid ${t.color}40`, borderRadius: 20, fontSize: "0.8rem", fontWeight: 600, color: t.color }}>
              {t.shortName}
            </div>
          ))}
        </div>
        <div className="fade-up-4" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "3rem" }}>
          {[
            { icon: "◎", title: "6 Dimensions", desc: "Functional, technical, maturity, cost, compliance" },
            { icon: "⬡", title: "AI-Powered", desc: "Claude generates nuanced, context-aware scores" },
            { icon: "△", title: "Full Report", desc: "Rankings, radar chart, matrix & narrative output" },
          ].map((f, i) => (
            <div key={i} className="card" style={{ padding: "1.25rem", textAlign: "left" }}>
              <div className="fraunces" style={{ color: C.primary, fontSize: "1.1rem", marginBottom: "0.5rem" }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.25rem" }}>{f.title}</div>
              <div style={{ fontSize: "0.8rem", color: C.textMuted, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
        <div className="fade-up-5">
          <button className="btn-primary" onClick={onStart} style={{ fontSize: "1rem", padding: "0.9rem 2.5rem" }}>
            Begin Assessment →
          </button>
        </div>
        <p style={{ marginTop: "1.5rem", fontSize: "0.78rem", color: C.textDim }}>
          ~10 minutes · 6 sections · Powered by Claude Sonnet 4
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════════

function ProgressBar({ current, total }) {
  const pct = Math.round(((current) / total) * 100);
  return (
    <div className="no-print" style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0.75rem 1.5rem" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ flex: 1, height: 3, background: C.border, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: C.primary, borderRadius: 2, transition: "width 0.5s ease" }} />
        </div>
        <span className="mono" style={{ fontSize: "0.75rem", color: C.textMuted, flexShrink: 0 }}>
          {current} / {total}
        </span>
      </div>
      <div style={{ maxWidth: 860, margin: "0.6rem auto 0", display: "flex", gap: "0.5rem" }}>
        {SECTIONS.map((s, i) => (
          <div key={s.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
            <div style={{ width: "100%", height: 2, borderRadius: 1, background: i < current ? C.primary : i === current - 1 ? C.primaryDim : C.border, transition: "background 0.3s" }} />
            <span className="hide-mobile" style={{ fontSize: "0.65rem", color: i < current ? C.primary : C.textDim, fontWeight: i === current - 1 ? 600 : 400, transition: "color 0.3s", whiteSpace: "nowrap" }}>
              {s.title.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION RENDERERS
// ═══════════════════════════════════════════════════════════════════════════════

function TextField({ q, value, onChange }) {
  return (
    <input type="text" placeholder={q.placeholder} value={value || ""} onChange={e => onChange(e.target.value)} />
  );
}

function SelectField({ q, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {q.options.map(opt => (
        <div key={opt} className={`select-opt ${value === opt ? "selected" : ""}`} onClick={() => onChange(opt)}>
          <div className={`radio-circle ${value === opt ? "checked" : ""}`} />
          <span style={{ color: value === opt ? C.text : C.textMuted, fontWeight: value === opt ? 500 : 400 }}>{opt}</span>
        </div>
      ))}
    </div>
  );
}

function MultiCheckField({ q, value = [], onChange }) {
  const toggle = opt => {
    const next = value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt];
    onChange(next);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {q.options.map(opt => (
        <div key={opt} className={`select-opt ${value.includes(opt) ? "selected" : ""}`} onClick={() => toggle(opt)}>
          <div className={`checkbox-box ${value.includes(opt) ? "checked" : ""}`} />
          <span style={{ color: value.includes(opt) ? C.text : C.textMuted, fontWeight: value.includes(opt) ? 500 : 400 }}>{opt}</span>
        </div>
      ))}
    </div>
  );
}

function ImportanceField({ q, value, onChange }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "1rem 1.25rem" }}>
      <div style={{ marginBottom: "0.6rem" }}>
        <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.15rem" }}>{q.label}</div>
        {q.desc && <div style={{ fontSize: "0.78rem", color: C.textMuted }}>{q.desc}</div>}
      </div>
      <div style={{ display: "flex", gap: "0.4rem" }}>
        {IMP.map(opt => (
          <button key={opt.v} className={`importance-btn ${value === opt.v ? "active" : ""}`} onClick={() => onChange(opt.v)}>
            {opt.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function CriteriaRatingField({ q, value, onChange, topicColor }) {
  const val = value ?? 0;
  return (
    <div style={{ background: C.surface, border: `1px solid ${val > 0 ? topicColor + "50" : C.border}`, borderRadius: 8, padding: "0.85rem 1.1rem", transition: "border-color 0.2s" }}>
      <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", marginBottom: "0.65rem" }}>
        <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: q.poc === "B" ? "rgba(184,134,11,0.12)" : "rgba(0,114,188,0.1)", color: q.poc === "B" ? C.gold : C.primary, flexShrink: 0, marginTop: 1 }}>{q.poc}</span>
        <span style={{ fontSize: "0.82rem", color: val > 0 ? C.text : C.textMuted, lineHeight: 1.45, fontWeight: val > 0 ? 500 : 400 }}>{q.desc}</span>
      </div>
      <div style={{ display: "flex", gap: "0.3rem" }}>
        {CRIT_SCALE.map(opt => (
          <button key={opt.v} onClick={() => onChange(opt.v)} style={{
            flex: 1, padding: "0.4rem 0.15rem", borderRadius: 5, border: `1px solid ${val === opt.v ? topicColor : C.border}`,
            background: val === opt.v ? topicColor + "22" : "transparent", color: val === opt.v ? topicColor : C.textDim,
            cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: "0.68rem", fontWeight: val === opt.v ? 700 : 400,
            textAlign: "center", transition: "all 0.15s", lineHeight: 1.2,
          }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 1 }}>{opt.s}</div>
            <div style={{ fontSize: "0.58rem" }}>{opt.l}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function QuestionBlock({ q, value, onChange, topicColor }) {
  if (q.type === "text") return <div><label style={{ fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.5rem", display: "block" }}>{q.label}</label><TextField q={q} value={value} onChange={onChange} /></div>;
  if (q.type === "select") return <div><label style={{ fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.75rem", display: "block" }}>{q.label}</label><SelectField q={q} value={value} onChange={onChange} /></div>;
  if (q.type === "multicheck") return <div><label style={{ fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.5rem", display: "block" }}>{q.label} <span style={{ color: C.textDim, fontWeight: 400 }}>(select all that apply)</span></label><MultiCheckField q={q} value={value} onChange={onChange} /></div>;
  if (q.type === "importance") return <ImportanceField q={q} value={value} onChange={onChange} />;
  if (q.type === "criterion_rating") return <CriteriaRatingField q={q} value={value} onChange={onChange} topicColor={topicColor || C.primary} />;
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION FORM
// ═══════════════════════════════════════════════════════════════════════════════

function SectionForm({ section, sectionIndex, answers, setAnswers, onNext, onBack }) {
  const qs = QUESTIONS[section.id] || [];
  const sectionAnswers = answers[section.id] || {};
  const isCriteriaSection = section.id === "criteria_a" || section.id === "criteria_b";

  const update = (qid, val) => setAnswers(prev => ({ ...prev, [section.id]: { ...prev[section.id], [qid]: val } }));

  // Criteria sections are always completable (0 is a valid answer meaning "Not Required")
  const nonOptionalQs = qs.filter(q => q.type !== "importance" && q.type !== "criterion_rating");
  const allAnswered = isCriteriaSection || nonOptionalQs.every(q => {
    const v = sectionAnswers[q.id];
    if (Array.isArray(v)) return v.length > 0;
    return !!v;
  });

  // Group criteria by topic for display
  const topicGroups = isCriteriaSection ? qs.reduce((acc, q) => {
    if (!acc[q.topic]) acc[q.topic] = [];
    acc[q.topic].push(q);
    return acc;
  }, {}) : null;

  return (
    <div style={{ maxWidth: isCriteriaSection ? 860 : 720, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      <div className="fade-up" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <span className="fraunces" style={{ fontSize: "1.4rem", color: C.primary }}>{section.icon}</span>
          <h2 className="fraunces" style={{ fontSize: "1.5rem", fontWeight: 700 }}>{section.title}</h2>
        </div>
        <p style={{ color: C.textMuted, fontSize: "0.9rem" }}>{section.subtitle}</p>
        {isCriteriaSection && (
          <div style={{ marginTop: "0.75rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.75rem", color: C.textDim }}>
              <span style={{ color: C.gold, fontWeight: 700 }}>B</span> = Business POC &nbsp;·&nbsp; <span style={{ color: C.primary, fontWeight: 700 }}>T</span> = Technical POC &nbsp;·&nbsp; AI will score vendor delivery against each criterion
            </span>
          </div>
        )}
        {section.dim && (
          <div style={{ marginTop: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="mono" style={{ fontSize: "0.72rem", color: C.textDim }}>DIMENSION WEIGHT —</span>
            <span className="mono" style={{ fontSize: "0.72rem", color: C.primary }}>{Math.round(DIMENSIONS.find(d => d.id === section.dim)?.weight * 100)}%</span>
          </div>
        )}
      </div>

      {isCriteriaSection ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {Object.entries(topicGroups).map(([topic, topicQs]) => {
            const topicColor = TOPIC_COLORS[topic] || C.accent;
            return (
              <div key={topic}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: `1px solid ${topicColor}30` }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: topicColor, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: topicColor, letterSpacing: "0.04em" }}>{topic.toUpperCase()}</span>
                  <span className="mono" style={{ fontSize: "0.7rem", color: C.textDim }}>({topicQs.length} {topicQs.length === 1 ? "criterion" : "criteria"})</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {topicQs.map(q => (
                    <CriteriaRatingField key={q.id} q={q} value={sectionAnswers[q.id]} onChange={val => update(q.id, val)} topicColor={topicColor} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: section.id === "functional" ? "0.75rem" : "1.5rem" }}>
          {qs.map((q, i) => (
            <div key={q.id} className={`fade-up-${Math.min(i + 1, 5)}`}>
              <QuestionBlock q={q} value={sectionAnswers[q.id]} onChange={val => update(q.id, val)} />
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: `1px solid ${C.border}` }}>
        <button onClick={onBack} className="btn-ghost" disabled={sectionIndex === 0}>
          ← Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {!allAnswered && <span style={{ fontSize: "0.78rem", color: C.textDim }}>Complete required fields to continue</span>}
          <button onClick={onNext} className="btn-primary" disabled={!allAnswered}>
            {sectionIndex === SECTIONS.length - 1 ? "Generate Assessment →" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

function LoadingScreen() {
  const [step, setStep] = useState(0);
  const steps = ["Analyzing 42 evaluation criteria...", "Scoring 5 tools across 5 dimensions...", "Generating fit rationale...", "Computing detailed criteria matrix...", "Preparing your report..."];
  const stepsLen = steps.length;
  useEffect(() => {
    const interval = setInterval(() => setStep(s => (s + 1) % stepsLen), 2200);
    return () => clearInterval(interval);
  }, [stepsLen]);
  return (
    <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2rem" }}>
      <div style={{ position: "relative", width: 64, height: 64 }}>
        <div style={{ position: "absolute", inset: 0, border: `2px solid ${C.border}`, borderTopColor: C.primary, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <div style={{ position: "absolute", inset: 8, border: `2px solid ${C.border}`, borderBottomColor: C.primaryDim, borderRadius: "50%", animation: "spin 1.5s linear infinite reverse" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div className="fraunces" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Evaluating Tool Fit</div>
        <div className="mono" style={{ fontSize: "0.82rem", color: C.primary, height: "1.2rem", transition: "opacity 0.3s" }}>{steps[step]}</div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        {steps.map((_, i) => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === step ? C.primary : C.border, transition: "background 0.3s" }} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS: SCORE BADGE
// ═══════════════════════════════════════════════════════════════════════════════

function ScoreBadge({ score, color, size = "md" }) {
  const sz = size === "lg" ? { w: 64, h: 64, fs: "1.5rem" } : { w: 44, h: 44, fs: "1rem" };
  return (
    <div style={{ width: sz.w, height: sz.h, borderRadius: "50%", border: `2px solid ${color}40`, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span className="mono" style={{ fontSize: sz.fs, fontWeight: 700, color }}>{score}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS: TOOL RANK CARD
// ═══════════════════════════════════════════════════════════════════════════════

const MEDALS = [
  { bg: "#F5C84220", border: "#F5C84260", color: C.gold, label: "1st" },
  { bg: "#94A3B820", border: "#94A3B860", color: C.silver, label: "2nd" },
  { bg: "#C0844820", border: "#C0844860", color: C.bronze, label: "3rd" },
];

function ToolRankCard({ tool, rank, result, rationale, strengths, gaps }) {
  const [expanded, setExpanded] = useState(rank === 0);
  const medal = MEDALS[rank];
  return (
    <div className={`fade-up-${rank + 1}`} style={{ border: `1px solid ${rank === 0 ? tool.color + "60" : C.border}`, borderRadius: 10, overflow: "hidden", background: rank === 0 ? `${tool.color}08` : C.surface }}>
      <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer" }} onClick={() => setExpanded(e => !e)}>
        {medal ? (
          <div className="medal" style={{ background: medal.bg, border: `1px solid ${medal.border}`, color: medal.color }}>{medal.label}</div>
        ) : (
          <div className="medal" style={{ background: C.elevated, color: C.textMuted }}>#{rank + 1}</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span className="fraunces" style={{ fontWeight: 700, fontSize: "1rem" }}>{tool.name}</span>
            {rank === 0 && <span style={{ fontSize: "0.7rem", fontWeight: 700, color: C.primary, background: "rgba(0,114,188,0.1)", padding: "0.2rem 0.5rem", borderRadius: 12, border: `1px solid ${C.primaryDim}`, letterSpacing: "0.05em" }}>TOP PICK</span>}
          </div>
          <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="score-bar-wrap" style={{ flex: 1, maxWidth: 260 }}>
              <div className="score-bar" style={{ width: `${result.overall}%`, background: tool.color }} />
            </div>
            <span className="mono" style={{ fontSize: "0.85rem", fontWeight: 600, color: tool.color }}>{result.overall}</span>
            <span style={{ fontSize: "0.75rem", color: C.textMuted }}>/ 100</span>
          </div>
        </div>
        <ScoreBadge score={result.overall} color={tool.color} />
        <span style={{ color: C.textMuted, fontSize: "0.9rem", flexShrink: 0 }}>{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
            {DIMENSIONS.map(d => (
              <div key={d.id} style={{ textAlign: "center" }}>
                <div className="mono" style={{ fontSize: "1rem", fontWeight: 700, color: tool.color }}>{result.dimScores[d.id] ?? "—"}</div>
                <div style={{ fontSize: "0.65rem", color: C.textMuted, marginTop: "0.2rem", lineHeight: 1.3 }}>{d.label}</div>
              </div>
            ))}
          </div>
          {rationale && <p style={{ fontSize: "0.85rem", color: C.textMuted, lineHeight: 1.65, marginBottom: "1rem" }}>{rationale}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {strengths?.length > 0 && (
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: C.primary, marginBottom: "0.5rem", letterSpacing: "0.08em" }}>KEY STRENGTHS</div>
                {strengths.map((s, i) => <div key={i} style={{ fontSize: "0.8rem", color: C.text, marginBottom: "0.3rem", paddingLeft: "0.75rem", borderLeft: `2px solid ${tool.color}`, lineHeight: 1.4 }}>{s}</div>)}
              </div>
            )}
            {gaps?.length > 0 && (
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: C.textMuted, marginBottom: "0.5rem", letterSpacing: "0.08em" }}>CONSIDERATIONS</div>
                {gaps.map((g, i) => <div key={i} style={{ fontSize: "0.8rem", color: C.textMuted, marginBottom: "0.3rem", paddingLeft: "0.75rem", borderLeft: `2px solid ${C.border}`, lineHeight: 1.4 }}>{g}</div>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS: RADAR CHART
// ═══════════════════════════════════════════════════════════════════════════════

function RadarComparison({ ranked, scores }) {
  const top3 = ranked.slice(0, 3);
  const data = DIMENSIONS.map(d => {
    const point = { dim: d.label };
    top3.forEach(t => { point[t.shortName] = scores[t.id]?.[d.id] ?? 0; });
    return point;
  });
  return (
    <div className="card fade-up" style={{ padding: "1.5rem" }}>
      <div className="fraunces" style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>Capability Radar — Top 3 Tools</div>
      <div style={{ fontSize: "0.8rem", color: C.textMuted, marginBottom: "1.25rem" }}>Dimension scores across functional, technical, maturity, cost, and compliance axes</div>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke={C.border} />
          <PolarAngleAxis dataKey="dim" tick={{ fill: C.textMuted, fontSize: 12, fontFamily: "Outfit" }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          {top3.map(t => (
            <Radar key={t.id} name={t.shortName} dataKey={t.shortName} stroke={t.color} fill={t.color} fillOpacity={0.08} strokeWidth={2} />
          ))}
          <Tooltip contentStyle={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "JetBrains Mono", fontSize: 12, color: C.text }} />
          <Legend wrapperStyle={{ fontSize: "0.8rem", fontFamily: "Outfit", paddingTop: "1rem" }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED SCORE MATRIX
// Each tool row expands to show per-dimension breakdown;
// each dimension expands to show its contributing criteria rows.
// Dimension scores are derived: score = sum(Sel×Sol×Wt) / max × 100
// ═══════════════════════════════════════════════════════════════════════════════

const DIM_COLORS = {
  functional:  "#0072BC",
  technical:   "#009AA4",
  maturity:    "#9B59B6",
  cost:        "#B8860B",
  compliance:  "#C0392B",
};

function UnifiedScoreMatrix({ matrixCriteria, answers, ranked }) {
  const [expandedTools, setExpandedTools] = useState(() => new Set([ranked[0]?.id]));
  const [expandedDims, setExpandedDims]   = useState({});   // { toolId: Set<dimId> }

  if (!matrixCriteria?.length) return null;

  const toggleTool = (tid) => setExpandedTools(prev => {
    const next = new Set(prev);
    next.has(tid) ? next.delete(tid) : next.add(tid);
    return next;
  });

  const toggleDim = (tid, did) => setExpandedDims(prev => {
    const toolSet = new Set(prev[tid] || []);
    toolSet.has(did) ? toolSet.delete(did) : toolSet.add(did);
    return { ...prev, [tid]: toolSet };
  });

  const dimCriteriaFor = (dimId) => CRITERIA.filter(c => c.dim === dimId);

  return (
    <div className="card fade-up" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${C.border}` }}>
        <div className="fraunces" style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>
          Unified Score Matrix
        </div>
        <div style={{ fontSize: "0.78rem", color: C.textMuted }}>
          Dimension scores derived from 42 criteria &nbsp;·&nbsp;
          <span className="mono" style={{ color: C.primary }}>Sel</span> × <span className="mono" style={{ color: C.primary }}>Sol</span> × <span className="mono" style={{ color: C.primary }}>Wt</span> rollup &nbsp;·&nbsp;
          Expand a tool → expand a dimension to see contributing criteria
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(5,80px) 72px 28px", gap: 0, padding: "0.5rem 1.5rem", background: C.elevated, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: "0.68rem", color: C.textMuted, fontWeight: 600 }}>TOOL</div>
        {DIMENSIONS.map(d => (
          <div key={d.id} style={{ textAlign: "center", fontSize: "0.64rem", fontWeight: 700, color: DIM_COLORS[d.id] }}>
            {d.label.toUpperCase()}
            <div style={{ fontSize: "0.58rem", color: C.textDim, fontWeight: 400 }}>{Math.round(d.weight * 100)}%</div>
          </div>
        ))}
        <div style={{ textAlign: "center", fontSize: "0.68rem", color: C.primary, fontWeight: 700 }}>OVERALL</div>
        <div />
      </div>

      {/* Tool rows */}
      {ranked.map((tool, rank) => {
        const isToolExpanded = expandedTools.has(tool.id);
        const dimScores = {};
        DIMENSIONS.forEach(d => { dimScores[d.id] = getDimScore(matrixCriteria, answers, tool.id, d.id); });
        const overall = Math.round(DIMENSIONS.reduce((s, d) => s + dimScores[d.id] * d.weight, 0));
        const medal = MEDALS[rank];

        return (
          <div key={tool.id} style={{ borderBottom: `1px solid ${C.border}` }}>
            {/* ── Tool header row ── */}
            <div
              onClick={() => toggleTool(tool.id)}
              style={{
                display: "grid", gridTemplateColumns: "1fr repeat(5,80px) 72px 28px",
                alignItems: "center", gap: 0, padding: "0.9rem 1.5rem",
                cursor: "pointer", background: isToolExpanded ? `${tool.color}06` : "transparent",
                transition: "background 0.2s",
              }}
            >
              {/* Tool name + medal */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
                {medal ? (
                  <div className="medal" style={{ background: medal.bg, border: `1px solid ${medal.border}`, color: medal.color, fontSize: "0.7rem", width: 24, height: 24 }}>{medal.label}</div>
                ) : (
                  <div className="medal" style={{ background: C.elevated, color: C.textMuted, fontSize: "0.7rem", width: 24, height: 24 }}>#{rank + 1}</div>
                )}
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: tool.color, flexShrink: 0 }} />
                <span style={{ fontWeight: rank === 0 ? 700 : 500, fontSize: "0.88rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tool.name}</span>
                {rank === 0 && (
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#fff", background: tool.color, padding: "1px 6px", borderRadius: 8, flexShrink: 0 }}>TOP</span>
                )}
              </div>

              {/* Dimension score cells */}
              {DIMENSIONS.map(d => {
                const s = dimScores[d.id];
                const col = s >= 75 ? tool.color : s >= 50 ? C.textMuted : C.textDim;
                return (
                  <div key={d.id} style={{ textAlign: "center" }}>
                    <span className="mono" style={{ fontSize: "0.88rem", fontWeight: s >= 75 ? 700 : 400, color: col }}>{s}</span>
                    <div style={{ height: 3, margin: "3px 8px 0", borderRadius: 2, background: C.border, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${s}%`, background: col, borderRadius: 2, transition: "width 0.8s" }} />
                    </div>
                  </div>
                );
              })}

              {/* Overall */}
              <div style={{ textAlign: "center" }}>
                <span className="mono" style={{ fontSize: "1rem", fontWeight: 800, color: tool.color }}>{overall}</span>
              </div>

              {/* Chevron */}
              <div style={{ textAlign: "center", color: C.textDim, fontSize: "0.75rem" }}>
                {isToolExpanded ? "▲" : "▼"}
              </div>
            </div>

            {/* ── Expanded: dimension panels ── */}
            {isToolExpanded && (
              <div style={{ borderTop: `1px solid ${C.border}`, background: `${tool.color}04` }}>
                {DIMENSIONS.map((dim, di) => {
                  const isDimExpanded = expandedDims[tool.id]?.has(dim.id);
                  const dimScore = dimScores[dim.id];
                  const raw = getDimRaw(matrixCriteria, answers, tool.id, dim.id);
                  const max = getDimMax(matrixCriteria, answers, dim.id);
                  const dc = DIM_COLORS[dim.id];
                  const dimCriteria = dimCriteriaFor(dim.id);
                  const activeCriteria = dimCriteria.filter(c => getSel(answers, c.id) > 0);

                  return (
                    <div key={dim.id} style={{ borderTop: di > 0 ? `1px solid ${C.border}` : "none" }}>
                      {/* Dimension sub-header */}
                      <div
                        onClick={() => toggleDim(tool.id, dim.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: "0.75rem",
                          padding: "0.65rem 1.5rem 0.65rem 3.5rem",
                          cursor: "pointer", background: isDimExpanded ? `${dc}08` : "transparent",
                        }}
                      >
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: dc, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: dc, minWidth: 180 }}>{dim.fullLabel}</span>
                        <span className="mono" style={{ fontSize: "0.68rem", color: C.textDim, background: C.elevated, padding: "1px 6px", borderRadius: 3 }}>
                          {Math.round(dim.weight * 100)}%
                        </span>
                        <span style={{ fontSize: "0.7rem", color: C.textDim }}>{activeCriteria.length}/{dimCriteria.length} criteria active</span>
                        <div style={{ flex: 1 }} />
                        {/* Score derivation */}
                        <span className="mono" style={{ fontSize: "0.7rem", color: C.textDim }}>{raw} / {max}</span>
                        <div style={{ width: 80, height: 4, borderRadius: 2, background: C.border, overflow: "hidden", flexShrink: 0 }}>
                          <div style={{ height: "100%", width: `${dimScore}%`, background: dc, borderRadius: 2 }} />
                        </div>
                        <span className="mono" style={{ fontSize: "0.9rem", fontWeight: 700, color: dc, minWidth: 28, textAlign: "right" }}>{dimScore}</span>
                        <span style={{ color: C.textDim, fontSize: "0.7rem", marginLeft: 4 }}>{isDimExpanded ? "▲" : "▼"}</span>
                      </div>

                      {/* Criteria detail table */}
                      {isDimExpanded && (
                        <div style={{ padding: "0 1.5rem 0.75rem 3.5rem" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                            <thead>
                              <tr style={{ background: C.elevated, borderBottom: `1px solid ${C.borderMid}` }}>
                                <th style={{ padding: "5px 6px", textAlign: "center", color: C.textDim, fontWeight: 600, width: 24 }}>#</th>
                                <th style={{ padding: "5px 4px", textAlign: "center", color: C.textDim, fontWeight: 600, width: 24 }}>POC</th>
                                <th style={{ padding: "5px 8px", textAlign: "left", color: C.textMuted, fontWeight: 600 }}>Criterion</th>
                                <th style={{ padding: "5px 6px", textAlign: "center", color: C.primary, fontWeight: 700, width: 40, fontSize: "0.65rem" }}>Priority<br/>(Sel)</th>
                                <th style={{ padding: "5px 6px", textAlign: "center", color: dc, fontWeight: 700, width: 36, fontSize: "0.65rem" }}>Sol</th>
                                <th style={{ padding: "5px 6px", textAlign: "center", color: C.textMuted, fontWeight: 700, width: 28, fontSize: "0.65rem" }}>Wt</th>
                                <th style={{ padding: "5px 6px", textAlign: "center", color: tool.color, fontWeight: 700, width: 46, fontSize: "0.65rem" }}>Score</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dimCriteria.map((c, ci) => {
                                const sel  = getSel(answers, c.id);
                                const sol  = getSol(matrixCriteria, c.id, tool.id);
                                const wt   = getWt(matrixCriteria, c.id);
                                const score = sel * sol * wt;
                                const maxScore = sel * 3 * wt;
                                const pct = maxScore > 0 ? score / maxScore : 0;
                                const scoreColor = pct >= 0.7 ? tool.color : pct >= 0.35 ? C.gold : C.textDim;
                                const topicColor = TOPIC_COLORS[c.topic] || C.accent;
                                return (
                                  <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}`, opacity: sel === 0 ? 0.4 : 1, background: ci % 2 === 0 ? "transparent" : `${C.elevated}50` }}>
                                    <td className="mono" style={{ padding: "5px 6px", textAlign: "center", color: C.textDim }}>{c.id}</td>
                                    <td style={{ padding: "5px 4px", textAlign: "center" }}>
                                      <span style={{ fontSize: "0.58rem", fontWeight: 700, padding: "1px 4px", borderRadius: 3, background: c.poc === "B" ? "rgba(184,134,11,0.1)" : "rgba(0,114,188,0.08)", color: c.poc === "B" ? C.gold : C.primary }}>{c.poc}</span>
                                    </td>
                                    <td style={{ padding: "5px 8px", color: sel === 0 ? C.textDim : C.text, lineHeight: 1.4 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 1 }}>
                                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: topicColor, flexShrink: 0 }} />
                                        <span style={{ fontSize: "0.6rem", color: topicColor, fontWeight: 600 }}>{c.topic}</span>
                                      </div>
                                      {c.desc.length > 90 ? c.desc.slice(0, 90) + "…" : c.desc}
                                    </td>
                                    <td style={{ padding: "5px 6px", textAlign: "center" }}>
                                      <span className="mono" style={{ fontWeight: 700, color: sel > 0 ? C.primary : C.textDim }}>{sel}</span>
                                    </td>
                                    <td style={{ padding: "5px 6px", textAlign: "center" }}>
                                      <span className="mono" style={{ fontWeight: 700, color: dc }}>{sol}</span>
                                    </td>
                                    <td style={{ padding: "5px 6px", textAlign: "center" }}>
                                      <span className="mono" style={{ color: C.textMuted }}>{wt}×</span>
                                    </td>
                                    <td style={{ padding: "5px 6px", textAlign: "center" }}>
                                      <span className="mono" style={{ fontWeight: 700, fontSize: "0.82rem", color: scoreColor }}>{sel > 0 ? score : "—"}</span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr style={{ background: C.elevated, borderTop: `1px solid ${C.borderMid}` }}>
                                <td colSpan={3} style={{ padding: "6px 8px", fontSize: "0.68rem", color: C.textDim }}>
                                  <span className="mono">{raw}</span> / <span className="mono">{max}</span> raw points → normalized to <span className="mono" style={{ color: dc, fontWeight: 700 }}>{dimScore}/100</span>
                                </td>
                                <td colSpan={4} style={{ padding: "6px 8px", textAlign: "right", fontSize: "0.65rem", color: C.textDim }}>
                                  Sol: 0=N/A · 1=Custom · 2=Config · 3=OOB
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Legend footer */}
      <div style={{ padding: "0.75rem 1.5rem", background: C.elevated, display: "flex", gap: "1.5rem", flexWrap: "wrap", borderTop: `1px solid ${C.border}` }}>
        <span style={{ fontSize: "0.72rem", color: C.textMuted }}><span className="mono" style={{ color: C.primary }}>Sel</span> = Client Priority (0–5, set in wizard)</span>
        <span style={{ fontSize: "0.72rem", color: C.textMuted }}><span className="mono" style={{ color: C.primary }}>Sol</span> = AI Solution Score (0=N/A · 1=Custom Dev · 2=Config · 3=Out of Box)</span>
        <span style={{ fontSize: "0.72rem", color: C.textMuted }}><span className="mono" style={{ color: C.primary }}>Wt</span> = AI-suggested weight (1–3×)</span>
        <span style={{ fontSize: "0.72rem", color: C.textMuted }}><span className="mono" style={{ color: C.primary }}>Dim Score</span> = Σ(Sel×Sol×Wt) ÷ max × 100 &nbsp;·&nbsp; <span className="mono" style={{ color: C.primary }}>Overall</span> = weighted avg of dim scores</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

function ResultsScreen({ result, answers }) {
  const { rationale, strengths, gaps, executiveSummary, topPick, matrix } = result;
  const matrixCriteria = matrix?.criteria || [];
  const ranked = rankToolsFromCriteria(matrixCriteria, answers);
  const clientName = answers.profile?.client_name || "Client";
  const topTool = ranked[0]; // always use computed #1, not AI's guess

  const handlePrint = () => window.print();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      {/* Hero */}
      <div className="fade-up" style={{ marginBottom: "2.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <div className="mono" style={{ fontSize: "0.72rem", color: C.primary, letterSpacing: "0.1em", marginBottom: "0.5rem" }}>ASSESSMENT COMPLETE — {clientName.toUpperCase()}</div>
          <h2 className="fraunces" style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.25rem" }}>Tool Fit Results</h2>
          <p style={{ color: C.textMuted, fontSize: "0.9rem" }}>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <button onClick={handlePrint} className="btn-ghost no-print" style={{ fontSize: "0.82rem" }}>⎙ Print Report</button>
      </div>

      {/* Executive Summary */}
      {executiveSummary && (
        <div className="fade-up-1" style={{ background: `${topTool.color}10`, border: `1px solid ${topTool.color}40`, borderRadius: 10, padding: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: topTool.color }} />
            <span className="fraunces" style={{ fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.06em", color: topTool.color }}>EXECUTIVE SUMMARY</span>
          </div>
          <p style={{ fontSize: "0.92rem", lineHeight: 1.7, color: C.text }}>{executiveSummary}</p>
        </div>
      )}

      {/* Rankings */}
      <div style={{ marginBottom: "2rem" }}>
        <div className="fraunces" style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "1rem", color: C.textMuted, letterSpacing: "0.05em" }}>RANKED RECOMMENDATIONS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {ranked.map((t, i) => (
            <ToolRankCard key={t.id} tool={t} rank={i} result={t} rationale={rationale?.[t.id]} strengths={strengths?.[t.id]} gaps={gaps?.[t.id]} />
          ))}
        </div>
      </div>

      {/* Radar */}
      <div style={{ marginBottom: "1.5rem" }}>
        <RadarComparison ranked={ranked} scores={Object.fromEntries(ranked.map(t => [t.id, t.dimScores]))} />
      </div>

      {/* Unified Score Matrix */}
      {matrixCriteria.length > 0 && (
        <div style={{ marginBottom: "2.5rem" }}>
          <UnifiedScoreMatrix matrixCriteria={matrixCriteria} answers={answers} ranked={ranked} />
        </div>
      )}

      {/* Footer stats */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "1.5rem", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <div style={{ textAlign: "center", padding: "0.5rem 1rem", background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 7 }}>
            <div className="mono" style={{ fontSize: "0.85rem", fontWeight: 700, color: C.primary }}>{TOOLS.length}</div>
            <div style={{ fontSize: "0.65rem", color: C.textDim }}>Tools</div>
          </div>
          <div style={{ textAlign: "center", padding: "0.5rem 1rem", background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 7 }}>
            <div className="mono" style={{ fontSize: "0.85rem", fontWeight: 700, color: C.primary }}>{CRITERIA.length}</div>
            <div style={{ fontSize: "0.65rem", color: C.textDim }}>Criteria</div>
          </div>
          <div style={{ textAlign: "center", padding: "0.5rem 1rem", background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 7 }}>
            <div className="mono" style={{ fontSize: "0.85rem", fontWeight: 700, color: C.primary }}>AI</div>
            <div style={{ fontSize: "0.65rem", color: C.textDim }}>Scoring</div>
          </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// MATRIX SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

const TOPIC_COLORS = {
  "Business Glossary": "#9B59B6",
  "Data Catalog": "#0099A8",
  "Data Dictionary": "#0072BC",
  "Data Lineage": "#3498DB",
  "Data Lineage/Lifecycle Mgmt": "#2980B9",
  "Data Linking and Search": "#1ABC9C",
  "Data Quality": "#00CB5D",
  "Tags": "#F39C12",
  "Usability": "#FF7A00",
  "Usability — Search": "#E67E22",
  "Security": "#E42600",
  "Setup and Configuration": "#E91E63",
  "Cost": "#FFC400",
  "Audit Capability": "#8E44AD",
};

function ScoreCell({ val, max, onChange, color }) {
  const pct = max > 0 ? val / max : 0;
  const bg = val === 0 ? "transparent" : pct >= 0.75 ? `${color}22` : pct >= 0.4 ? "rgba(255,196,0,0.1)" : "rgba(255,100,50,0.08)";
  const textColor = val === 0 ? C.textDim : pct >= 0.75 ? color : pct >= 0.4 ? C.gold : "#FF7A55";
  return (
    <input
      type="number"
      min={0} max={max} step={1}
      value={val}
      onChange={e => onChange(Math.max(0, Math.min(max, parseInt(e.target.value) || 0)))}
      style={{
        width: "100%", padding: "4px 6px", textAlign: "center",
        background: bg, border: `1px solid ${val > 0 ? color + "40" : C.border}`,
        borderRadius: 4, color: textColor, fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.82rem", fontWeight: 600, outline: "none",
        WebkitAppearance: "none", MozAppearance: "textfield",
      }}
    />
  );
}

// eslint-disable-next-line no-unused-vars
function MatrixScreen({ result, answers, apiKey, onBack }) {
  const clientName = answers.profile?.client_name || "Client";
  const DEFAULT_VENDORS = TOOLS.map(t => ({ id: t.id, name: t.name, shortName: t.shortName, color: t.color }));

  const [vendors, setVendors] = useState(DEFAULT_VENDORS);
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("Preparing matrix...");
  const [error, setError] = useState(null);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#9B59B6");
  const [activeGroup, setActiveGroup] = useState(null); // topic filter

  const COLORS_PALETTE = ["#9B59B6","#E42600","#FF7A00","#FFC400","#00CB5D","#0072BC","#19A3FC","#E91E63","#1ABC9C","#F39C12"];

  // Initial load — generate matrix
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { generateMatrix(vendors); }, []);

  async function generateMatrix(vendorList) {
    setLoading(true);
    setError(null);
    const msgs = [
      "Analyzing client requirements...",
      "Scoring criteria across all tools...",
      "Applying solution delivery assessment...",
      "Suggesting priority weights...",
      "Finalizing matrix...",
    ];
    let mi = 0;
    const iv = setInterval(() => { setLoadMsg(msgs[Math.min(++mi, msgs.length - 1)]); }, 2200);
    try {
      const vendorIds = vendorList.map(v => v.id);
      const prompt = buildMatrixPrompt(answers, vendorIds);
      const headers = { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-calls": "true" };
      if (apiKey) headers["x-api-key"] = apiKey;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers,
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 6000, messages: [{ role: "user", content: prompt }] }),
      });
      if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error?.message || `API error ${res.status}`); }
      const raw = await res.json();
      const text = raw.content?.[0]?.text || "";
      const cleaned = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(cleaned);
      // Build editable state
      const initialState = {};
      parsed.criteria.forEach(row => {
        initialState[row.id] = { wt: row.wt || 2 };
        vendorIds.forEach(vid => {
          initialState[row.id][vid] = { sel: row[vid]?.sel ?? 0, sol: row[vid]?.sol ?? 0 };
        });
      });
      setMatrixData(initialState);
    } catch(e) {
      setError(e.message);
    } finally {
      clearInterval(iv);
      setLoading(false);
    }
  }

  function updateCell(criterionId, vendorId, field, val) {
    setMatrixData(prev => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        [vendorId]: { ...prev[criterionId][vendorId], [field]: val },
      }
    }));
  }

  function updateWeight(criterionId, val) {
    setMatrixData(prev => ({ ...prev, [criterionId]: { ...prev[criterionId], wt: val } }));
  }

  function getFinal(criterionId, vendorId) {
    if (!matrixData?.[criterionId]) return 0;
    const { sel, sol } = matrixData[criterionId][vendorId] || { sel: 0, sol: 0 };
    return sel * sol * (matrixData[criterionId].wt || 1);
  }

  function getColTotal(vendorId) {
    if (!matrixData) return 0;
    return CRITERIA.reduce((sum, c) => sum + getFinal(c.id, vendorId), 0);
  }

  function getMaxPossible() {
    if (!matrixData) return 0;
    return CRITERIA.reduce((sum, c) => sum + 5 * 3 * (matrixData[c.id]?.wt || 1), 0);
  }

  function addVendor() {
    if (!newName.trim()) return;
    const id = newName.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20);
    const v = { id, name: newName.trim(), shortName: newName.trim().split(" ").map(w=>w[0]).join("").slice(0,4).toUpperCase(), color: newColor };
    const newVendors = [...vendors, v];
    setVendors(newVendors);
    setShowAddVendor(false);
    setNewName("");
    // Re-generate with new vendor
    generateMatrix(newVendors);
  }

  function removeVendor(id) {
    if (vendors.length <= 2) return;
    setVendors(prev => prev.filter(v => v.id !== id));
    // Remove from matrixData
    setMatrixData(prev => {
      if (!prev) return prev;
      const next = {};
      Object.keys(prev).forEach(k => {
        const row = { ...prev[k] };
        delete row[id];
        next[k] = row;
      });
      return next;
    });
  }

  const uniqueTopics = [...new Set(CRITERIA.map(c => c.topic))];
  const visibleCriteria = activeGroup ? CRITERIA.filter(c => c.topic === activeGroup) : CRITERIA;
  const maxPossible = getMaxPossible();

  if (loading) return (
    <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
      <div style={{ position: "relative", width: 64, height: 64 }}>
        <div style={{ position: "absolute", inset: 0, border: `2px solid ${C.border}`, borderTopColor: C.primary, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <div style={{ position: "absolute", inset: 10, border: `2px solid ${C.border}`, borderBottomColor: C.primaryDim, borderRadius: "50%", animation: "spin 1.5s linear infinite reverse" }} />
      </div>
      <div>
        <div className="fraunces" style={{ fontSize: "1.1rem", fontWeight: 700, textAlign: "center", marginBottom: "0.5rem" }}>Generating Scoring Matrix</div>
        <div className="mono" style={{ fontSize: "0.8rem", color: C.primary, textAlign: "center" }}>{loadMsg}</div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[0,1,2,3,4].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary, opacity: 0.3 + i*0.15 }} />)}
      </div>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 500, margin: "4rem auto", padding: "2rem", textAlign: "center" }}>
      <div className="fraunces" style={{ fontSize: "1rem", fontWeight: 700, color: C.accent, marginBottom: "0.5rem" }}>Matrix Generation Error</div>
      <p style={{ color: C.textMuted, fontSize: "0.85rem", marginBottom: "1.5rem" }}>{error}</p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
        <button className="btn-ghost" onClick={onBack}>← Back to Results</button>
        <button className="btn-primary" onClick={() => generateMatrix(vendors)}>↺ Retry</button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "100%" }}>
      {/* Header */}
      <div style={{ maxWidth: 1400, margin: "0 auto 1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <div className="mono" style={{ fontSize: "0.7rem", color: C.primary, letterSpacing: "0.1em", marginBottom: "0.4rem" }}>DETAILED EVALUATION — {clientName.toUpperCase()}</div>
          <h2 className="fraunces" style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "0.25rem" }}>Scoring Matrix</h2>
          <p style={{ color: C.textMuted, fontSize: "0.85rem" }}>42 criteria · AI-generated scores, consultant-editable · Formula: Sel × Sol × Wt = Final</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn-ghost" style={{ fontSize: "0.8rem" }} onClick={onBack}>← Results</button>
          <button className="btn-ghost" style={{ fontSize: "0.8rem" }} onClick={() => generateMatrix(vendors)}>↺ Regenerate</button>
          <button className="btn-primary" style={{ fontSize: "0.8rem" }} onClick={() => setShowAddVendor(v => !v)}>+ Add Tool</button>
        </div>
      </div>

      {/* Add vendor panel */}
      {showAddVendor && (
        <div style={{ maxWidth: 1400, margin: "0 auto 1rem" }}>
          <div className="card" style={{ padding: "1.25rem", display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.4rem" }}>Tool / Vendor Name</div>
              <input type="text" placeholder="e.g. Ataccama ONE" value={newName} onChange={e => setNewName(e.target.value)} style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem" }} />
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.4rem" }}>Color</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {COLORS_PALETTE.map(c => (
                  <div key={c} onClick={() => setNewColor(c)} style={{ width: 22, height: 22, borderRadius: "50%", background: c, cursor: "pointer", border: `2px solid ${newColor === c ? "#fff" : "transparent"}`, transition: "border 0.15s" }} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn-ghost" style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }} onClick={() => setShowAddVendor(false)}>Cancel</button>
              <button className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }} disabled={!newName.trim()} onClick={addVendor}>Add & Score →</button>
            </div>
          </div>
        </div>
      )}

      {/* Topic filter pills */}
      <div style={{ maxWidth: 1400, margin: "0 auto 1rem", display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <div onClick={() => setActiveGroup(null)} style={{ padding: "4px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", background: !activeGroup ? C.primary : C.surface, color: !activeGroup ? C.bg : C.textMuted, border: `1px solid ${!activeGroup ? C.primary : C.border}` }}>All 42</div>
        {uniqueTopics.map(t => {
          const count = CRITERIA.filter(c => c.topic === t).length;
          const col = TOPIC_COLORS[t] || C.accent;
          return (
            <div key={t} onClick={() => setActiveGroup(activeGroup === t ? null : t)} style={{ padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", background: activeGroup === t ? col + "22" : C.surface, color: activeGroup === t ? col : C.textMuted, border: `1px solid ${activeGroup === t ? col + "60" : C.border}` }}>
              {t} ({count})
            </div>
          );
        })}
      </div>

      {/* Score key */}
      <div style={{ maxWidth: 1400, margin: "0 auto 1rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div className="mono" style={{ fontSize: "0.7rem", color: C.textDim }}>SEL (0–5):</div>
          {["0","1","2","3","4","5"].map((v,i) => <div key={v} style={{ fontSize: "0.65rem", padding: "2px 7px", borderRadius: 3, background: `${C.surface}`, border: `1px solid ${C.border}`, color: C.textMuted }} title={SEL_LABELS[i]}>{v}</div>)}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div className="mono" style={{ fontSize: "0.7rem", color: C.textDim }}>SOL (0–3):</div>
          {["0","1","2","3"].map((v,i) => <div key={v} style={{ fontSize: "0.65rem", padding: "2px 7px", borderRadius: 3, background: `${C.surface}`, border: `1px solid ${C.border}`, color: C.textMuted }} title={SOL_LABELS[i]}>{v}</div>)}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div className="mono" style={{ fontSize: "0.7rem", color: C.textDim }}>WT (1–3):</div>
          {["1x","2x","3x"].map((v,i) => <div key={v} style={{ fontSize: "0.65rem", padding: "2px 7px", borderRadius: 3, background: `${C.surface}`, border: `1px solid ${C.border}`, color: C.textMuted }} title={WT_LABELS[i]}>{v}</div>)}
        </div>
      </div>

      {/* Matrix table */}
      <div style={{ maxWidth: 1400, margin: "0 auto", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", minWidth: 900 }}>
          <colgroup>
            <col style={{ width: 30 }} />
            <col style={{ width: 28 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 280 }} />
            <col style={{ width: 40 }} />
            {vendors.map(() => <><col style={{ width: 48 }} /><col style={{ width: 48 }} /><col style={{ width: 48 }} /></>)}
          </colgroup>
          <thead>
            <tr style={{ background: C.elevated, borderBottom: `2px solid ${C.borderMid}` }}>
              <th style={{ padding: "8px 6px", textAlign: "center", color: C.textMuted, fontWeight: 600 }}>#</th>
              <th style={{ padding: "8px 6px", textAlign: "center", color: C.textMuted, fontWeight: 600 }}>POC</th>
              <th style={{ padding: "8px 8px", textAlign: "left", color: C.textMuted, fontWeight: 600 }}>Topic</th>
              <th style={{ padding: "8px 8px", textAlign: "left", color: C.textMuted, fontWeight: 600 }}>Selection Criteria</th>
              <th style={{ padding: "8px 6px", textAlign: "center", color: C.primary, fontWeight: 700, fontSize: "0.7rem" }}>Wt</th>
              {vendors.map(v => (
                <th key={v.id} colSpan={3} style={{ padding: "8px 4px", textAlign: "center", borderLeft: `2px solid ${v.color}40` }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: v.color }} />
                      <span style={{ color: v.color, fontWeight: 700, fontSize: "0.8rem" }}>{v.shortName}</span>
                      {!DEFAULT_VENDORS.find(d => d.id === v.id) && (
                        <span onClick={() => removeVendor(v.id)} style={{ cursor: "pointer", color: C.textDim, fontSize: "0.7rem", lineHeight: 1 }} title="Remove">✕</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 3, fontSize: "0.62rem", color: C.textDim }}>
                      <span style={{ width: 46, textAlign: "center" }}>Sel</span>
                      <span style={{ width: 46, textAlign: "center" }}>Sol</span>
                      <span style={{ width: 46, textAlign: "center", color: v.color }}>Score</span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleCriteria.map((c, idx) => {
              const topicColor = TOPIC_COLORS[c.topic] || C.accent;
              const isFirst = idx === 0 || visibleCriteria[idx-1].topic !== c.topic;
              const wt = matrixData?.[c.id]?.wt || 2;
              return (
                <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}`, background: idx % 2 === 0 ? "transparent" : `${C.surface}60` }}>
                  <td style={{ padding: "6px", textAlign: "center" }}>
                    <span className="mono" style={{ fontSize: "0.72rem", color: C.textDim }}>{c.id}</span>
                  </td>
                  <td style={{ padding: "6px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 5px", borderRadius: 3, background: c.poc === "B" ? "rgba(184,134,11,0.1)" : "rgba(0,114,188,0.08)", color: c.poc === "B" ? C.gold : C.primary }}>
                      {c.poc}
                    </span>
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    {isFirst && <span style={{ fontSize: "0.72rem", fontWeight: 700, color: topicColor }}>{c.topic}</span>}
                  </td>
                  <td style={{ padding: "6px 8px", color: C.textMuted, lineHeight: 1.45, fontSize: "0.77rem" }}>
                    {c.desc}
                  </td>
                  <td style={{ padding: "6px", textAlign: "center" }}>
                    {matrixData && (
                      <select
                        value={wt}
                        onChange={e => updateWeight(c.id, parseInt(e.target.value))}
                        style={{ background: C.elevated, border: `1px solid ${C.primary}40`, color: C.primary, borderRadius: 4, padding: "3px 4px", fontSize: "0.8rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", width: "100%" }}
                      >
                        <option value={1}>1x</option>
                        <option value={2}>2x</option>
                        <option value={3}>3x</option>
                      </select>
                    )}
                  </td>
                  {vendors.map(v => {
                    const sel = matrixData?.[c.id]?.[v.id]?.sel ?? 0;
                    const sol = matrixData?.[c.id]?.[v.id]?.sol ?? 0;
                    const final = sel * sol * wt;
                    const maxFinal = 5 * 3 * wt;
                    const pct = maxFinal > 0 ? final / maxFinal : 0;
                    const finalColor = final === 0 ? C.textDim : pct >= 0.7 ? v.color : pct >= 0.4 ? C.gold : "#FF7A55";
                    return (
                      <React.Fragment key={v.id}>
                        <td style={{ padding: "4px 3px", borderLeft: `2px solid ${v.color}20` }}>
                          {matrixData && <ScoreCell val={sel} max={5} onChange={val => updateCell(c.id, v.id, "sel", val)} color={v.color} />}
                        </td>
                        <td style={{ padding: "4px 3px" }}>
                          {matrixData && <ScoreCell val={sol} max={3} onChange={val => updateCell(c.id, v.id, "sol", val)} color={v.color} />}
                        </td>
                        <td style={{ padding: "4px 6px", textAlign: "center" }}>
                          <span className="mono" style={{ fontWeight: 700, fontSize: "0.85rem", color: finalColor }}>{matrixData ? final : "—"}</span>
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${C.borderMid}`, background: C.elevated }}>
              <td colSpan={4} style={{ padding: "10px 8px", fontWeight: 700, fontSize: "0.85rem" }}>
                <span className="fraunces">TOTAL SCORE</span>
                <span className="mono" style={{ fontSize: "0.7rem", color: C.textDim, marginLeft: "0.75rem" }}>Max possible: {maxPossible}</span>
              </td>
              <td />
              {vendors.map(v => {
                const total = getColTotal(v.id);
                const pct = maxPossible > 0 ? Math.round(total / maxPossible * 100) : 0;
                const col = pct >= 65 ? v.color : pct >= 40 ? C.gold : "#FF7A55";
                return (
                  <React.Fragment key={v.id}>
                    <td colSpan={2} style={{ borderLeft: `2px solid ${v.color}40` }} />
                    <td style={{ padding: "10px 6px", textAlign: "center" }}>
                      <div className="mono" style={{ fontWeight: 800, fontSize: "1rem", color: col }}>{total}</div>
                      <div style={{ fontSize: "0.65rem", color: C.textDim }}>{pct}%</div>
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend */}
      <div style={{ maxWidth: 1400, margin: "1.5rem auto 0", display: "flex", gap: "1.5rem", flexWrap: "wrap", padding: "1rem", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: "0.75rem", color: C.textMuted }}>
          <span className="mono" style={{ color: C.primary, fontWeight: 700 }}>Sel</span> — Selection Score (0–5): how well vendor meets criterion
        </div>
        <div style={{ fontSize: "0.75rem", color: C.textMuted }}>
          <span className="mono" style={{ color: C.primary, fontWeight: 700 }}>Sol</span> — Solution Score (0–3): delivery mode (OOB / config / custom / N/A)
        </div>
        <div style={{ fontSize: "0.75rem", color: C.textMuted }}>
          <span className="mono" style={{ color: C.primary, fontWeight: 700 }}>Wt</span> — Consultant-set weight (1x Nice to Have · 2x Desirable · 3x Essential)
        </div>
        <div style={{ fontSize: "0.75rem", color: C.textMuted }}>
          <span className="mono" style={{ color: C.primary, fontWeight: 700 }}>Score</span> — Sel × Sol × Wt
        </div>
        <div style={{ fontSize: "0.75rem", color: C.textMuted }}>
          <span style={{ color: C.gold, fontWeight: 700 }}>B</span> = Business POC &nbsp;|&nbsp; <span style={{ color: C.primary, fontWeight: 700 }}>T</span> = Technical POC
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// API CALL
// ═══════════════════════════════════════════════════════════════════════════════

async function callAnthropicAPI(prompt, apiKey) {
  // In production (any non-localhost host) always route through the Netlify function —
  // the function holds the key server-side and avoids CORS entirely.
  // In local dev (localhost) fall back to a direct browser call using the manually-entered key.
  const isLocal = window.location.hostname === "localhost";
  const url = isLocal
    ? "https://api.anthropic.com/v1/messages"
    : "/.netlify/functions/anthropic";

  const headers = { "Content-Type": "application/json" };
  if (isLocal) {
    headers["anthropic-version"] = "2023-06-01";
    headers["anthropic-dangerous-direct-browser-calls"] = "true";
    headers["x-api-key"] = apiKey;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  const raw = data.content?.[0]?.text || "";
  // Strip markdown fences then find the outermost JSON object
  let text = raw.replace(/```json|```/g, "").trim();
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("AI did not return valid JSON. Please try again.");
  }
  const extracted = text.slice(jsonStart, jsonEnd + 1);
  try {
    return JSON.parse(extracted);
  } catch (_) {
    // Fallback: replace any numeric range patterns (e.g. 70-80) with midpoint
    const safe = extracted.replace(/:\s*(\d+)-(\d+)/g, (_, a, b) => ": " + Math.round((+a + +b) / 2));
    return JSON.parse(safe);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// API KEY GATE
// ═══════════════════════════════════════════════════════════════════════════════

function ApiKeyGate({ onConfirm }) {
  const [key, setKey] = useState("");
  return (
    <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div className="card" style={{ maxWidth: 480, width: "100%", padding: "2rem" }}>
        <div className="fraunces" style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>Anthropic API Key</div>
        <p style={{ fontSize: "0.85rem", color: C.textMuted, marginBottom: "1.5rem", lineHeight: 1.6 }}>
          Enter your Anthropic API key to enable AI-powered scoring. The key is used only for this session and never stored.
        </p>
        <input type="text" placeholder="sk-ant-api03-..." value={key} onChange={e => setKey(e.target.value)} style={{ marginBottom: "1rem" }} />
        <button className="btn-primary" onClick={() => onConfirm(key)} disabled={!key.startsWith("sk-ant")} style={{ width: "100%" }}>
          Confirm & Continue →
        </button>
        <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: C.textDim, lineHeight: 1.5 }}>
          Alternatively, set <span className="mono" style={{ color: C.primary }}>REACT_APP_ANTHROPIC_API_KEY</span> in your .env file to skip this step.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════

const ENV_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY || "";

export default function App() {
  const [screen, setScreen] = useState("intro");      // intro | apikey | wizard | loading | results
  const [sectionIdx, setSectionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState(ENV_KEY || "");

  const clientName = answers.profile?.client_name || "";

  const handleStart = () => {
    if (!apiKey) { setScreen("apikey"); } else { setScreen("wizard"); }
  };

  const handleApiKey = (key) => { setApiKey(key); setScreen("wizard"); };

  const handleNext = async () => {
    if (sectionIdx < SECTIONS.length - 1) {
      setSectionIdx(i => i + 1);
    } else {
      setScreen("loading");
      try {
        const prompt = buildPrompt(answers);
        const data = await callAnthropicAPI(prompt, apiKey);
        setResult(data);
        setScreen("results");
      } catch (e) {
        setError(e.message);
        setScreen("error");
      }
    }
  };

  const handleBack = () => {
    if (sectionIdx > 0) setSectionIdx(i => i - 1);
  };

  const handleReset = () => {
    setScreen("intro"); setSectionIdx(0); setAnswers({}); setResult(null); setError(null);
  };


  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: "100vh", background: C.bg }}>
        <Header
          clientName={screen === "results" ? clientName : ""}
          onReset={screen !== "intro" ? handleReset : null}
        />
        {screen === "intro" && <IntroScreen onStart={handleStart} />}
        {screen === "apikey" && <ApiKeyGate onConfirm={handleApiKey} />}
        {screen === "wizard" && (
          <>
            <ProgressBar current={sectionIdx + 1} total={SECTIONS.length} />
            <SectionForm
              section={SECTIONS[sectionIdx]}
              sectionIndex={sectionIdx}
              answers={answers}
              setAnswers={setAnswers}
              onNext={handleNext}
              onBack={handleBack}
            />
          </>
        )}
        {screen === "loading" && <LoadingScreen />}
        {screen === "results" && result && <ResultsScreen result={result} answers={answers} />}
        {screen === "error" && (
          <div style={{ maxWidth: 500, margin: "4rem auto", padding: "2rem", textAlign: "center" }}>
            <div className="fraunces" style={{ fontSize: "1.1rem", fontWeight: 700, color: C.accent, marginBottom: "0.75rem" }}>Assessment Error</div>
            <p style={{ color: C.textMuted, marginBottom: "1.5rem", fontSize: "0.88rem" }}>{error}</p>
            <button className="btn-primary" onClick={() => setScreen("wizard")}>← Try Again</button>
          </div>
        )}
      </div>
    </>
  );
}
