import { FeesType } from '../../modules/service/entities/service.entity.js';

export type DevelopmentServiceSeed = {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  sourceUrl: string;
  officialUrl: string;
  feesType: FeesType;
  feesText: string | null;
  processingTime: string | null;
  jurisdictionCode: 'GUJARAT' | 'CENTRAL';
  requiredDocuments: ReadonlyArray<{
    description: string;
    example: string | null;
  }>;
  steps: readonly string[];
};

export const DEVELOPMENT_SERVICE_SEEDS = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Digital Gujarat Scholarship',
    description:
      'Online access to scholarship applications offered through the Digital Gujarat portal for eligible students.',
    eligibility:
      'Eligibility depends on the selected scholarship, including category, income, residence, course, and academic requirements. Confirm the current criteria on the official portal.',
    sourceUrl: 'https://www.digitalgujarat.gov.in/',
    officialUrl: 'https://www.digitalgujarat.gov.in/',
    feesType: FeesType.FREE,
    feesText: null,
    processingTime: 'Varies by scholarship and institution',
    jurisdictionCode: 'GUJARAT',
    requiredDocuments: [
      { description: 'Aadhaar card', example: 'Applicant Aadhaar card' },
      {
        description: 'Income certificate',
        example: 'Current family income certificate',
      },
      {
        description: 'Educational records',
        example: 'Latest marksheet or admission proof',
      },
      {
        description: 'Bank account proof',
        example: 'First page of the applicant bank passbook',
      },
    ],
    steps: [
      'Create or sign in to your Digital Gujarat account.',
      'Choose the scholarship that matches your course and category.',
      'Complete the application and upload the requested documents.',
      'Submit the application and save the acknowledgement number.',
    ],
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    name: 'Gujarat Income Certificate',
    description:
      'Application guidance for obtaining an income certificate used for scholarships, reservations, and other public services.',
    eligibility:
      'Residents of Gujarat who need official evidence of family or household income may apply. The issuing authority may request additional local evidence.',
    sourceUrl: 'https://www.digitalgujarat.gov.in/',
    officialUrl: 'https://www.digitalgujarat.gov.in/',
    feesType: FeesType.SPECIFIED,
    feesText: 'Portal or service-centre charges may apply',
    processingTime: 'Usually 7 to 15 working days',
    jurisdictionCode: 'GUJARAT',
    requiredDocuments: [
      { description: 'Identity proof', example: 'Aadhaar card or voter ID' },
      {
        description: 'Address proof',
        example: 'Electricity bill, ration card, or residence proof',
      },
      {
        description: 'Income evidence',
        example: 'Salary slip, employer certificate, or income declaration',
      },
    ],
    steps: [
      'Sign in to the Digital Gujarat portal or visit an approved service centre.',
      'Select the income certificate service.',
      'Enter household and income information and attach supporting evidence.',
      'Submit the request and track it using the application number.',
    ],
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    name: 'Gujarat Ration Card Services',
    description:
      'Guidance for new ration-card applications and common updates such as adding a family member or changing an address.',
    eligibility:
      'Households ordinarily residing in Gujarat may apply subject to food and civil-supplies rules. Entitlement categories depend on current government criteria.',
    sourceUrl: 'https://dcs-dof.gujarat.gov.in/',
    officialUrl: 'https://www.digitalgujarat.gov.in/',
    feesType: FeesType.SPECIFIED,
    feesText: 'Service-centre or document charges may apply',
    processingTime: 'Varies by verification requirements',
    jurisdictionCode: 'GUJARAT',
    requiredDocuments: [
      {
        description: 'Family identity documents',
        example: 'Aadhaar cards for household members',
      },
      {
        description: 'Residence evidence',
        example: 'Electricity bill or registered rent agreement',
      },
      {
        description: 'Passport-size photograph',
        example: 'Recent photograph of the head of household',
      },
    ],
    steps: [
      'Choose the required ration-card service or correction.',
      'Provide household, address, and existing ration-card information.',
      'Upload or submit identity and residence evidence.',
      'Submit the application and cooperate with local verification if requested.',
    ],
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    name: 'Gujarat Widow Pension Assistance',
    description:
      'Application guidance for eligible widowed women seeking financial assistance under the applicable Gujarat social-security scheme.',
    eligibility:
      'Eligibility depends on age, residence, marital status, income, and other current scheme rules. Confirm current limits with the official authority.',
    sourceUrl: 'https://sje.gujarat.gov.in/',
    officialUrl: 'https://www.digitalgujarat.gov.in/',
    feesType: FeesType.FREE,
    feesText: null,
    processingTime: 'Varies after document and local verification',
    jurisdictionCode: 'GUJARAT',
    requiredDocuments: [
      { description: 'Applicant identity proof', example: 'Aadhaar card' },
      {
        description: 'Spouse death certificate',
        example: 'Certificate issued by the competent authority',
      },
      {
        description: 'Residence certificate',
        example: 'Domicile or residence evidence',
      },
      {
        description: 'Applicant bank account proof',
        example: 'Bank passbook showing account and IFSC details',
      },
    ],
    steps: [
      'Confirm current eligibility and obtain the required certificates.',
      'Open the relevant assistance service on the official portal.',
      'Complete the application and attach identity, status, and bank evidence.',
      'Submit the application and retain the acknowledgement for tracking.',
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000001',
    name: 'Passport Services',
    description:
      'Guidance for applying for a new Indian passport or reissuing an existing passport through Passport Seva.',
    eligibility:
      'Indian citizens may apply. Required documents and verification depend on age, application type, address, and individual circumstances.',
    sourceUrl: 'https://www.passportindia.gov.in/',
    officialUrl: 'https://www.passportindia.gov.in/',
    feesType: FeesType.SPECIFIED,
    feesText: 'Fees depend on booklet, application, and processing type',
    processingTime: 'Depends on application type and police verification',
    jurisdictionCode: 'CENTRAL',
    requiredDocuments: [
      { description: 'Date-of-birth proof', example: 'Birth certificate' },
      {
        description: 'Current address proof',
        example: 'Utility bill, Aadhaar card, or bank statement',
      },
      {
        description: 'Existing passport',
        example: 'Required for reissue applications',
      },
    ],
    steps: [
      'Register or sign in on the Passport Seva portal.',
      'Complete the appropriate passport application form.',
      'Pay the applicable fee and schedule an appointment.',
      'Attend the Passport Seva appointment with original documents.',
      'Complete police verification if it is required for the application.',
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    name: 'PM-KISAN Income Support',
    description:
      'Guidance for eligible farmer families using the PM-KISAN portal for registration, status checks, and record updates.',
    eligibility:
      'Eligibility is determined by current PM-KISAN rules, verified land records, and applicable exclusion categories.',
    sourceUrl: 'https://pmkisan.gov.in/',
    officialUrl: 'https://pmkisan.gov.in/',
    feesType: FeesType.FREE,
    feesText: null,
    processingTime: 'Varies by land-record and identity verification',
    jurisdictionCode: 'CENTRAL',
    requiredDocuments: [
      { description: 'Farmer Aadhaar card', example: 'Aadhaar card' },
      {
        description: 'Agricultural land record',
        example: 'Current ownership or cultivation record',
      },
      {
        description: 'Farmer bank account proof',
        example: 'Passbook showing account and IFSC details',
      },
    ],
    steps: [
      'Check the latest eligibility and exclusion rules.',
      'Open farmer registration on the official PM-KISAN portal.',
      'Provide Aadhaar, bank, and land-record information.',
      'Submit the details and monitor verification or beneficiary status.',
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000003',
    name: 'Ayushman Bharat PM-JAY',
    description:
      'Guidance for checking PM-JAY eligibility, finding an empanelled hospital, and obtaining beneficiary support.',
    eligibility:
      'Eligibility is based on the current PM-JAY beneficiary database and applicable state implementation rules.',
    sourceUrl: 'https://pmjay.gov.in/',
    officialUrl: 'https://beneficiary.nha.gov.in/',
    feesType: FeesType.FREE,
    feesText: null,
    processingTime: 'Eligibility checks are generally immediate',
    jurisdictionCode: 'CENTRAL',
    requiredDocuments: [
      { description: 'Beneficiary identity proof', example: 'Aadhaar card' },
      {
        description: 'Family eligibility evidence',
        example: 'Ration card or listed family record',
      },
    ],
    steps: [
      'Check beneficiary eligibility on the official portal or helpline.',
      'Verify the listed family and identity details.',
      'Locate an empanelled hospital when treatment is required.',
      'Present the requested identity information at the hospital help desk.',
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000004',
    name: 'National Scholarship Portal',
    description:
      'Central portal guidance for discovering and applying to participating government scholarship schemes.',
    eligibility:
      'Eligibility varies by scholarship and may include academic, income, category, domicile, institution, and course requirements.',
    sourceUrl: 'https://scholarships.gov.in/',
    officialUrl: 'https://scholarships.gov.in/',
    feesType: FeesType.FREE,
    feesText: null,
    processingTime: 'Varies by scheme and verification authority',
    jurisdictionCode: 'CENTRAL',
    requiredDocuments: [
      { description: 'Student identity proof', example: 'Aadhaar card' },
      {
        description: 'Student academic records',
        example: 'Latest marksheet and admission details',
      },
      {
        description: 'Student bank account proof',
        example: 'Applicant bank passbook',
      },
      {
        description: 'Scheme eligibility certificates',
        example: 'Income, category, or domicile certificate when required',
      },
    ],
    steps: [
      'Review available scholarships and their current eligibility rules.',
      'Register or sign in on the National Scholarship Portal.',
      'Complete the selected scholarship application and upload documents.',
      'Submit the application and monitor institution and authority verification.',
    ],
  },
] as const satisfies readonly DevelopmentServiceSeed[];
