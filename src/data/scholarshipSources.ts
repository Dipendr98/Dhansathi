export interface ScholarshipSource {
  id: string;
  name: string;
  url: string;
  description: string;
}

export const SCHOLARSHIP_SOURCES: ScholarshipSource[] = [
  {
    id: 'nsp',
    name: 'National Scholarship Portal',
    url: 'https://scholarships.gov.in/All-Scholarships',
    description: 'Central, centrally sponsored, UGC, AICTE and state scholarship schemes.',
  },
  {
    id: 'aicte',
    name: 'AICTE Student Development Schemes',
    url: 'https://www.aicte-india.org/schemes/students-development-schemes',
    description: 'Technical diploma and degree scholarships such as Pragati, Saksham and Swanath.',
  },
  {
    id: 'ugc',
    name: 'UGC Scholarships and Fellowships',
    url: 'https://www.ugc.gov.in/',
    description: 'Postgraduate scholarships, fellowships and higher education notices.',
  },
  {
    id: 'nos',
    name: 'National Overseas Scholarship',
    url: 'https://nosmsje.gov.in/',
    description: 'Overseas masters and PhD support for eligible Indian students.',
  },
  {
    id: 'vidya-lakshmi',
    name: 'Vidya Lakshmi',
    url: 'https://www.vidyalakshmi.co.in/',
    description: 'Education loan portal for study in India and abroad.',
  },
  {
    id: 'ongc',
    name: 'ONGC Foundation Scholarship',
    url: 'https://www.ongcfoundation.org/scholarship-scheme/',
    description: 'Public-sector merit scholarships for eligible professional-course students.',
  },
];
