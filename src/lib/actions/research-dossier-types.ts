export enum SourceTier {
  OFFICIAL = 1,
  RESEARCH = 2,
  GENERAL = 3,
}

export interface Source {
  title: string;
  url: string;
  tier: SourceTier;
  credibility: number;
}

export interface ResearchDossier {
  executiveBrief: {
    whatIsHappening: string;
    whyItMatters: string;
    whatDoesUnSay: string;
    currentSituation: string;
  };
  countryPosition: {
    officialPosition: string;
    relevantPolicies: string[];
    previousStatements: string[];
    votingBehavior: string;
    treaties: string[];
    alliances: string[];
    regionalInterests: string;
  };
  agendaDeepDive: {
    keyIssues: string[];
    causes: string[];
    currentDevelopments: string[];
    majorDisputes: string[];
    importantTerminology: { term: string; definition: string }[];
  };
  otherCountries: {
    country: string;
    position: string;
    interests: string[];
    allies: string[];
    opponents: string[];
    vulnerabilities: string[];
    likelyStance: string;
  }[];
  unFramework: {
    resolutions: { symbol: string; title: string; relevance: string }[];
    charter: string[];
    treaties: string[];
    agencies: string[];
    relevantArticles: string[];
  };
  munApplication: {
    realisticProposals: string[];
    solutions: string[];
    clauses: string[];
    fundingMechanisms: string[];
    implementation: string[];
    monitoring: string[];
    cooperation: string[];
  };
  attackMaterial: {
    contradictions: string[];
    votingInconsistencies: string[];
    treatyInconsistencies: string[];
    implementationFailures: string[];
    relevantStatistics: string[];
    diplomaticWeaknesses: string[];
  };
  sources: {
    id: number;
    title: string;
    url: string;
    tier: number;
    credibility: number;
  }[];
}
