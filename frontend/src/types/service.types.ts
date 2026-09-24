export type Jurisdiction = {
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
  jurisdiction: Jurisdiction;
};
