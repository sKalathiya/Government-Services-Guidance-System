export type ServiceJurisdiction = {
  code: string;
  name: string;
};

export type ServiceFilterParameters = {
  q?: string;
  jurisdiction?: string;
};

export type ServiceListItem = {
  id: string;
  name: string;
  jurisdiction: ServiceJurisdiction;
};

export const FeesType = {
  FREE: "FREE",
  UNKNOWN: "UNKNOWN",
  SPECIFIED: "SPECIFIED",
} as const;

export type FeesType = (typeof FeesType)[keyof typeof FeesType];

export type ServiceRequiredDocument = {
  id: string;
  description: string;
  example: string | null;
};

export type ServiceStep = {
  id: string;
  text: string;
  order: number;
};

export type ServiceDetail = {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  sourceUrl: string;
  officialUrl: string;
  feesType: FeesType;
  feesText: string | null;
  processingTime: string | null;
  requiredDocuments: ServiceRequiredDocument[];
  steps: ServiceStep[];
  jurisdiction: ServiceJurisdiction;
};
