export interface ResearchDossier {
  executiveBrief: {
    whatIsHappening: string;
    whyItMatters: string;
    currentSituation: string;
    whyCommitteeShouldCare: string;
  };
  agendaDeepDive: {
    historicalBackground: string;
    currentSituation: string;
    majorCauses: string[];
    majorConsequences: string[];
    importantActors: string[];
    majorDisputes: string[];
    keyTerminology: Array<{ term: string; definition: string }>;
  };
  countryPosition: {
    officialPosition: string;
    relevantPolicies: string[];
    historicalInvolvement: string[];
    treaties: string[];
    relevantInternationalCommitments: string[];
    governmentStatements: string[];
    votingRecord: string[];
    relevantRegionalInterests: string;
    economicInterests: string;
    securityInterests: string;
    politicalInterests: string;
    likelyNegotiatingPriorities: string[];
  };
  countryInterests: {
    whatDoesCountryWant: string[];
    whatDoesCountryNeedToAvoid: string[];
    whatWouldBePoliticallyDifficult: string[];
  };
  internationalLandscape: {
    allies: Array<{ country: string; why: string }>;
    likelyAllies: Array<{ country: string; why: string }>;
    neutralStates: Array<{ country: string; why: string }>;
    opposingStates: Array<{ country: string; why: string }>;
    regionalBlocs: Array<{ name: string; position: string }>;
    organizations: Array<{ name: string; relevance: string }>;
  };
  unFramework: {
    charterProvisions: string[];
    resolutions: Array<{ symbol: string; title: string; relevance: string }>;
    treaties: Array<{ name: string; relevance: string }>;
    conventions: string[];
    relevantAgencies: Array<{ name: string; role: string }>;
  };
  currentAffairs: Array<{
    whatHappened: string;
    when: string;
    whyItMatters: string;
    whyItMattersToCountry: string;
    source: string;
  }>;
  evidence: Array<{
    type: string;
    content: string;
    source: string;
  }>;
  diplomaticAmmunition: {
    contradictions: string[];
    inconsistentPolicies: string[];
    implementationFailures: string[];
    treatyInconsistencies: string[];
    votingContradictions: string[];
    relevantHistoricalPositions: string[];
  };
  poiBank: Array<{
    text: string;
    type: string;
    targetCountry: string;
    rationale: string;
  }>;
  defenseBank: Array<{
    expectedAttack: string;
    whyTheyMayUseIt: string;
    bestResponse: string;
    followUpResponse: string;
  }>;
  policyOptions: Array<{
    problem: string;
    proposal: string;
    implementation: string;
    funding: string;
    monitoring: string;
    responsibleActors: string[];
    potentialObstacle: string;
    howToAddressObstacle: string;
  }>;
  resolutionMaterial: {
    preambulatoryClauses: string[];
    operativeClauses: string[];
    subclauses: string[];
    implementationMechanisms: string[];
    fundingMechanisms: string[];
    monitoringMechanisms: string[];
    timelines: string[];
    responsibleOrganizations: string[];
  };
  gslMaterial: {
    strongestOpeningHook: string;
    strongestCountryPosition: string;
    strongestEvidence: string;
    strongestSolution: string;
    strongestClosingHook: string;
  };
  takeaways: string[];
  sources: Array<{
    title: string;
    organization: string;
    date: string;
    tier: number;
    url: string;
    supports: string;
  }>;
  assistantContext: string;
}
