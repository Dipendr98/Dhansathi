import type { GovernmentScheme } from '@/types';

// ─── Comprehensive Database of Real Indian Government Schemes ──────────────
// 50+ schemes across 10 categories, with real eligibility data for live filtering.

export const GOVERNMENT_SCHEMES: GovernmentScheme[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // AGRICULTURE (8 schemes)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'agri-001',
    name: 'PM Kisan Samman Nidhi',
    name_hi: 'पीएम किसान सम्मान निधि',
    description:
      'Direct income support of Rs. 6,000 per year to all landholding farmer families across India, paid in three equal installments of Rs. 2,000 every four months directly into bank accounts via DBT.',
    description_hi:
      'देश भर के सभी भूमिधारक किसान परिवारों को तीन समान किस्तों में प्रति वर्ष ₹6,000 की प्रत्यक्ष आय सहायता।',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    type: 'central',
    benefits: '₹6,000/year in 3 installments of ₹2,000',
    eligibility_criteria: {
      occupations: ['farmer', 'agriculture'],
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Land Ownership Records',
      'Bank Account with IFSC',
      'Mobile Number',
    ],
    status: 'active',
    application_url: 'https://pmkisan.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'agri-002',
    name: 'PM Fasal Bima Yojana',
    name_hi: 'प्रधानमंत्री फसल बीमा योजना',
    description:
      'Comprehensive crop insurance scheme providing financial support to farmers suffering crop loss due to natural calamities, pests, and diseases. Premium is only 2% for Kharif, 1.5% for Rabi, and 5% for commercial/horticultural crops.',
    description_hi:
      'प्राकृतिक आपदाओं, कीटों और रोगों के कारण फसल हानि से पीड़ित किसानों को वित्तीय सहायता प्रदान करने वाली व्यापक फसल बीमा योजना।',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    type: 'central',
    benefits: 'Crop insurance at 1.5–5% premium; full sum insured on crop loss',
    eligibility_criteria: {
      occupations: ['farmer', 'agriculture'],
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Land Records / Lease Agreement',
      'Bank Account Details',
      'Sowing Certificate from Patwari',
    ],
    status: 'active',
    application_url: 'https://pmfby.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'agri-003',
    name: 'Kisan Credit Card (KCC)',
    name_hi: 'किसान क्रेडिट कार्ड',
    description:
      'Provides affordable short-term credit to farmers for crop production, post-harvest expenses, and allied activities at a subsidized interest rate of 4% per annum (with timely repayment). Loan limit up to Rs. 3 lakh.',
    description_hi:
      'किसानों को फसल उत्पादन, कटाई के बाद के खर्चों और संबंधित गतिविधियों के लिए 4% प्रति वर्ष की सब्सिडी दर पर सस्ता अल्पावधि ऋण।',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    type: 'central',
    benefits: 'Credit up to ₹3 lakh at 4% interest (with prompt repayment)',
    eligibility_criteria: {
      min_age: 18,
      max_age: 75,
      occupations: ['farmer', 'agriculture', 'fishery', 'animal husbandry'],
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Land Ownership / Tenancy Proof',
      'Passport-size Photographs',
      'Bank Account Details',
    ],
    status: 'active',
    application_url: 'https://www.myscheme.gov.in/schemes/kcc',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'agri-004',
    name: 'PM Krishi Sinchayee Yojana (PMKSY)',
    name_hi: 'प्रधानमंत्री कृषि सिंचाई योजना',
    description:
      'Ensures access to protective irrigation for every farm ("Har Khet Ko Paani") and promotes efficient water use through micro-irrigation (drip and sprinkler systems) with subsidies of 55–90% on equipment cost.',
    description_hi:
      'हर खेत को पानी सुनिश्चित करने और सूक्ष्म सिंचाई (ड्रिप और स्प्रिंकलर) को 55-90% सब्सिडी के साथ बढ़ावा देने वाली योजना।',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    type: 'central',
    benefits: '55–90% subsidy on micro-irrigation equipment',
    eligibility_criteria: {
      occupations: ['farmer', 'agriculture'],
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Land Records',
      'Bank Account Details',
      'Quotation for Irrigation Equipment',
    ],
    status: 'active',
    application_url: 'https://pmksy.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'agri-005',
    name: 'Soil Health Card Scheme',
    name_hi: 'मृदा स्वास्थ्य कार्ड योजना',
    description:
      'Free soil testing and issuance of Soil Health Cards to all farmers every two years, with crop-wise nutrient recommendations to improve productivity and reduce fertilizer costs.',
    description_hi:
      'सभी किसानों को प्रत्येक दो वर्ष में मुफ्त मिट्टी परीक्षण और मृदा स्वास्थ्य कार्ड जारी किया जाता है।',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    type: 'central',
    benefits: 'Free soil testing and crop-wise nutrient recommendations',
    eligibility_criteria: {
      occupations: ['farmer', 'agriculture'],
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Land Records',
    ],
    status: 'active',
    application_url: 'https://soilhealth.dac.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'agri-006',
    name: 'National Mission for Sustainable Agriculture (NMSA)',
    name_hi: 'राष्ट्रीय सतत कृषि मिशन',
    description:
      'Promotes sustainable agriculture through climate-resilient practices including organic farming, soil health management, and rainfed area development with financial assistance and training.',
    description_hi:
      'जैविक खेती, मृदा स्वास्थ्य प्रबंधन और वर्षा आधारित क्षेत्र विकास सहित जलवायु-लचीली प्रथाओं के माध्यम से सतत कृषि को बढ़ावा देना।',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    type: 'central',
    benefits: 'Financial assistance for sustainable farming practices and training',
    eligibility_criteria: {
      occupations: ['farmer', 'agriculture'],
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Land Records',
      'Bank Account Details',
    ],
    status: 'active',
    application_url: 'https://nmsa.dac.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'agri-007',
    name: 'PM-AASHA (Annadata Aay Sanrakshan Abhiyan)',
    name_hi: 'पीएम-आशा (अन्नदाता आय संरक्षण अभियान)',
    description:
      'Umbrella scheme ensuring farmers receive remunerative prices for their produce through Price Support Scheme (PSS), Price Deficiency Payment Scheme (PDPS), and Private Procurement & Stockist Scheme (PPSS).',
    description_hi:
      'किसानों को उनकी उपज के लिए लाभकारी मूल्य सुनिश्चित करने वाली छत्र योजना।',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    type: 'central',
    benefits: 'MSP-based procurement and price deficiency payments',
    eligibility_criteria: {
      occupations: ['farmer', 'agriculture'],
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Land Records',
      'Bank Account Details',
      'Produce Details',
    ],
    status: 'active',
    application_url: 'https://www.myscheme.gov.in/schemes/pm-aasha',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'agri-008',
    name: 'e-NAM (National Agriculture Market)',
    name_hi: 'ई-नाम (राष्ट्रीय कृषि बाज़ार)',
    description:
      'Pan-India electronic trading portal linking APMCs across states to create a unified national market for agricultural commodities, ensuring better prices through transparent bidding.',
    description_hi:
      'कृषि उपज के लिए एकीकृत राष्ट्रीय बाजार बनाने हेतु राज्यों की मंडियों को जोड़ने वाला इलेक्ट्रॉनिक ट्रेडिंग पोर्टल।',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    type: 'central',
    benefits: 'Better prices through transparent online bidding across mandis',
    eligibility_criteria: {
      occupations: ['farmer', 'agriculture'],
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Bank Account Details',
      'Mobile Number',
    ],
    status: 'active',
    application_url: 'https://enam.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HEALTH (6 schemes)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'health-001',
    name: 'Ayushman Bharat PM-JAY',
    name_hi: 'आयुष्मान भारत पीएम-जय',
    description:
      'World\'s largest government-funded health insurance scheme providing free health coverage of Rs. 5 lakh per family per year for secondary and tertiary care hospitalization across 25,000+ empanelled hospitals.',
    description_hi:
      'विश्व की सबसे बड़ी सरकारी स्वास्थ्य बीमा योजना जो प्रति परिवार प्रति वर्ष ₹5 लाख का मुफ्त स्वास्थ्य कवर प्रदान करती है।',
    ministry: 'Ministry of Health & Family Welfare',
    type: 'central',
    benefits: '₹5,00,000/year free health insurance per family',
    eligibility_criteria: {
      max_income: 500000,
      categories: ['general', 'obc', 'sc', 'st', 'ews'],
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Ration Card / SECC Database Entry',
      'Income Certificate',
      'Family ID',
    ],
    status: 'active',
    application_url: 'https://pmjay.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'health-002',
    name: 'Janani Suraksha Yojana (JSY)',
    name_hi: 'जननी सुरक्षा योजना',
    description:
      'Cash incentive scheme for promoting institutional deliveries. Provides Rs. 1,400 (rural) / Rs. 1,000 (urban) to BPL pregnant women delivering in government or accredited health facilities.',
    description_hi:
      'संस्थागत प्रसव को बढ़ावा देने के लिए बीपीएल गर्भवती महिलाओं को नकद प्रोत्साहन योजना।',
    ministry: 'Ministry of Health & Family Welfare',
    type: 'central',
    benefits: '₹1,400 (rural) / ₹1,000 (urban) cash incentive for institutional delivery',
    eligibility_criteria: {
      gender: 'female',
      min_age: 19,
      is_bpl: true,
    },
    documents_required: [
      'Aadhaar Card',
      'BPL Card',
      'MCH Card (Mother & Child Health)',
      'Bank Account Details',
      'JSY Registration Card',
    ],
    status: 'active',
    application_url: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'health-003',
    name: 'National Health Mission (NHM)',
    name_hi: 'राष्ट्रीय स्वास्थ्य मिशन',
    description:
      'Umbrella mission providing free healthcare services including maternal health, child health, immunization, and communicable disease control through public health facilities across rural and urban areas.',
    description_hi:
      'ग्रामीण और शहरी क्षेत्रों में सार्वजनिक स्वास्थ्य सुविधाओं के माध्यम से मुफ्त स्वास्थ्य सेवाएं प्रदान करने वाला मिशन।',
    ministry: 'Ministry of Health & Family Welfare',
    type: 'central',
    benefits: 'Free healthcare services at public health facilities',
    eligibility_criteria: {
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Any Government ID',
    ],
    status: 'active',
    application_url: 'https://nhm.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'health-004',
    name: 'PM Swasthya Suraksha Yojana (PMSSY)',
    name_hi: 'प्रधानमंत्री स्वास्थ्य सुरक्षा योजना',
    description:
      'Aims to correct regional imbalances in availability of affordable and reliable tertiary healthcare by setting up new AIIMS-like institutions and upgrading Government Medical Colleges across India.',
    description_hi:
      'नई एम्स जैसी संस्थाओं की स्थापना और सरकारी मेडिकल कॉलेजों के उन्नयन द्वारा तृतीयक स्वास्थ्य सेवा की उपलब्धता में क्षेत्रीय असंतुलन को दूर करना।',
    ministry: 'Ministry of Health & Family Welfare',
    type: 'central',
    benefits: 'Access to affordable tertiary healthcare through new AIIMS and upgraded medical colleges',
    eligibility_criteria: {
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Hospital Registration',
    ],
    status: 'active',
    application_url: 'https://pmssy-mohfw.nic.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'health-005',
    name: 'Rashtriya Swasthya Bima Yojana (RSBY)',
    name_hi: 'राष्ट्रीय स्वास्थ्य बीमा योजना',
    description:
      'Health insurance scheme for BPL families providing cashless hospitalization coverage of Rs. 30,000 per family per year. Now largely subsumed under Ayushman Bharat but still operational in some states.',
    description_hi:
      'बीपीएल परिवारों के लिए प्रति परिवार प्रति वर्ष ₹30,000 के कैशलेस अस्पताल उपचार कवरेज प्रदान करने वाली स्वास्थ्य बीमा योजना।',
    ministry: 'Ministry of Labour & Employment',
    type: 'central',
    benefits: '₹30,000/year cashless hospitalization for BPL families',
    eligibility_criteria: {
      is_bpl: true,
      gender: 'any',
    },
    documents_required: [
      'BPL Card',
      'Aadhaar Card',
      'Ration Card',
      'Family Photo',
    ],
    status: 'active',
    application_url: 'https://www.india.gov.in/spotlight/rashtriya-swasthya-bima-yojana',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'health-006',
    name: 'Ayushman Bharat Health & Wellness Centres (AB-HWC)',
    name_hi: 'आयुष्मान भारत स्वास्थ्य और कल्याण केंद्र',
    description:
      'Transforms 1.5 lakh Sub Health Centres and Primary Health Centres into Health & Wellness Centres providing comprehensive primary healthcare including free essential drugs, diagnostics, and teleconsultation.',
    description_hi:
      '1.5 लाख उप स्वास्थ्य केंद्रों और प्राथमिक स्वास्थ्य केंद्रों को स्वास्थ्य और कल्याण केंद्रों में बदलना।',
    ministry: 'Ministry of Health & Family Welfare',
    type: 'central',
    benefits: 'Free comprehensive primary healthcare, essential drugs, and diagnostics',
    eligibility_criteria: {
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
    ],
    status: 'active',
    application_url: 'https://ab-hwc.nhp.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HOUSING (4 schemes)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'housing-001',
    name: 'PM Awas Yojana - Urban (PMAY-U)',
    name_hi: 'प्रधानमंत्री आवास योजना - शहरी',
    description:
      'Affordable housing for the urban poor through interest subsidy of up to 6.5% on home loans, beneficiary-led construction assistance, and affordable housing in partnership. EWS/LIG get up to ₹2.67 lakh subsidy.',
    description_hi:
      'शहरी गरीबों के लिए होम लोन पर 6.5% तक की ब्याज सब्सिडी, लाभार्थी-नेतृत्व निर्माण सहायता। ईडब्ल्यूएस/एलआईजी को ₹2.67 लाख तक सब्सिडी।',
    ministry: 'Ministry of Housing & Urban Affairs',
    type: 'central',
    benefits: 'Up to ₹2.67 lakh interest subsidy on home loans',
    eligibility_criteria: {
      max_income: 1800000,
      categories: ['general', 'obc', 'sc', 'st', 'ews'],
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Income Certificate',
      'Proof of No Pucca House',
      'Bank Account Details',
      'Affidavit of No Home Ownership',
    ],
    status: 'active',
    application_url: 'https://pmaymis.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'housing-002',
    name: 'PM Awas Yojana - Gramin (PMAY-G)',
    name_hi: 'प्रधानमंत्री आवास योजना - ग्रामीण',
    description:
      'Provides financial assistance of Rs. 1.20 lakh (plain areas) and Rs. 1.30 lakh (hilly/difficult areas) for construction of pucca houses in rural areas, along with 90/95 days of MGNREGA wages.',
    description_hi:
      'ग्रामीण क्षेत्रों में पक्के मकान के निर्माण हेतु ₹1.20 लाख (मैदानी) / ₹1.30 लाख (पहाड़ी) की वित्तीय सहायता।',
    ministry: 'Ministry of Rural Development',
    type: 'central',
    benefits: '₹1.20–1.30 lakh for pucca house construction + MGNREGA wages',
    eligibility_criteria: {
      is_bpl: true,
      categories: ['general', 'obc', 'sc', 'st', 'ews'],
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'SECC Data / BPL List',
      'Bank Account Details',
      'Land Documents',
      'Photograph',
    ],
    status: 'active',
    application_url: 'https://pmayg.nic.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'housing-003',
    name: 'Interest Subsidy for Housing the Urban Poor (ISHUP)',
    name_hi: 'शहरी गरीबों के लिए आवास ब्याज सब्सिडी',
    description:
      'Interest subsidy of 5% per annum on housing loans up to Rs. 1 lakh to EWS/LIG segments for purchase/construction of houses. Part of PMAY-U vertical.',
    description_hi:
      'ईडब्ल्यूएस/एलआईजी वर्ग को ₹1 लाख तक के आवास ऋण पर 5% प्रति वर्ष ब्याज सब्सिडी।',
    ministry: 'Ministry of Housing & Urban Affairs',
    type: 'central',
    benefits: '5% interest subsidy on housing loans up to ₹1 lakh',
    eligibility_criteria: {
      max_income: 300000,
      categories: ['ews'],
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Income Certificate',
      'Bank Loan Sanction Letter',
      'Property Documents',
    ],
    status: 'active',
    application_url: 'https://pmaymis.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'housing-004',
    name: 'Credit Linked Subsidy Scheme (CLSS)',
    name_hi: 'क्रेडिट लिंक्ड सब्सिडी योजना',
    description:
      'Interest subsidy on home loans for MIG-I (income ₹6–12 lakh, 4% subsidy on ₹9 lakh) and MIG-II (income ₹12–18 lakh, 3% subsidy on ₹12 lakh) under PM Awas Yojana Urban.',
    description_hi:
      'पीएम आवास योजना शहरी के तहत मध्यम आय वर्ग के लिए होम लोन पर ब्याज सब्सिडी।',
    ministry: 'Ministry of Housing & Urban Affairs',
    type: 'central',
    benefits: '3–4% interest subsidy on home loans for middle-income groups',
    eligibility_criteria: {
      max_income: 1800000,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Income Proof / IT Returns',
      'Property Documents',
      'Home Loan Sanction Letter',
      'No Pucca House Declaration',
    ],
    status: 'active',
    application_url: 'https://pmaymis.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EDUCATION (6 schemes)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'edu-001',
    name: 'PM Vidyalaxmi',
    name_hi: 'पीएम विद्यालक्ष्मी',
    description:
      'Unified portal for students to search and apply for educational loans and government scholarships. Provides collateral-free education loans up to Rs. 10 lakh and interest subsidy for economically weaker sections.',
    description_hi:
      'छात्रों को शैक्षिक ऋण और सरकारी छात्रवृत्ति खोजने और आवेदन करने के लिए एकीकृत पोर्टल। ₹10 लाख तक बिना गारंटी शिक्षा ऋण।',
    ministry: 'Ministry of Education',
    type: 'central',
    benefits: 'Collateral-free education loans up to ₹10 lakh with interest subsidy',
    eligibility_criteria: {
      min_age: 17,
      max_age: 35,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Admission Letter',
      'Income Certificate',
      'Mark Sheets (10th, 12th)',
      'Bank Account Details',
    ],
    status: 'active',
    application_url: 'https://www.vidyalakshmi.co.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'edu-002',
    name: 'National Scholarship Portal (NSP) - Central Schemes',
    name_hi: 'राष्ट्रीय छात्रवृत्ति पोर्टल',
    description:
      'One-stop portal for various central government scholarships including Pre-Matric, Post-Matric, Merit-cum-Means for Minorities, and Top Class Education for SC/ST students. Scholarship amounts range from ₹1,000 to ₹2,00,000 per year.',
    description_hi:
      'विभिन्न केंद्र सरकार छात्रवृत्तियों के लिए एकल पोर्टल। छात्रवृत्ति राशि ₹1,000 से ₹2,00,000 प्रति वर्ष।',
    ministry: 'Ministry of Education',
    type: 'central',
    benefits: '₹1,000–₹2,00,000/year scholarship depending on scheme and category',
    eligibility_criteria: {
      max_income: 800000,
      categories: ['sc', 'st', 'obc', 'ews'],
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Income Certificate',
      'Caste Certificate (if applicable)',
      'Previous Year Mark Sheet',
      'Current Year Admission Proof',
      'Bank Account Details',
    ],
    status: 'active',
    application_url: 'https://scholarships.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'edu-003',
    name: 'Post Matric Scholarship for SC/ST Students',
    name_hi: 'एससी/एसटी छात्रों के लिए पोस्ट मैट्रिक छात्रवृत्ति',
    description:
      'Provides financial assistance to SC/ST students studying at post-matriculation level including maintenance allowance, tuition fees, and non-refundable fees. Family income must be below Rs. 2.50 lakh per annum.',
    description_hi:
      'पोस्ट मैट्रिक स्तर पर अध्ययनरत एससी/एसटी छात्रों को भरण-पोषण भत्ता, ट्यूशन फीस सहित वित्तीय सहायता। परिवार की आय ₹2.50 लाख से कम होनी चाहिए।',
    ministry: 'Ministry of Social Justice & Empowerment',
    type: 'central',
    benefits: 'Full tuition fees + maintenance allowance (₹550–₹1,200/month)',
    eligibility_criteria: {
      categories: ['sc', 'st'],
      max_income: 250000,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Caste Certificate',
      'Income Certificate',
      'Previous Year Mark Sheet',
      'Admission Receipt / Bonafide Certificate',
      'Bank Account Details',
    ],
    status: 'active',
    application_url: 'https://scholarships.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'edu-004',
    name: 'Central Sector Scheme of Scholarship (CSSS)',
    name_hi: 'केंद्रीय क्षेत्र छात्रवृत्ति योजना',
    description:
      'Merit-based scholarship for students from non-creamy-layer families with income below Rs. 8 lakh. Provides Rs. 12,000/year for graduation and Rs. 20,000/year for post-graduation to top 20th percentile of Class XII board exam passers.',
    description_hi:
      '₹8 लाख से कम आय वाले परिवारों के मेधावी छात्रों के लिए। स्नातक हेतु ₹12,000/वर्ष और स्नातकोत्तर हेतु ₹20,000/वर्ष।',
    ministry: 'Ministry of Education',
    type: 'central',
    benefits: '₹12,000/year (graduation) / ₹20,000/year (post-graduation)',
    eligibility_criteria: {
      max_income: 800000,
      min_age: 17,
      max_age: 30,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Class XII Mark Sheet',
      'Income Certificate',
      'College Admission Proof',
      'Bank Account Details',
    ],
    status: 'active',
    application_url: 'https://scholarships.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'edu-005',
    name: 'Prime Minister\'s Research Fellowship (PMRF)',
    name_hi: 'प्रधानमंत्री रिसर्च फेलोशिप',
    description:
      'Attractive fellowship for doctoral research at IITs/IISc/IISERs/NITs. Selected fellows receive Rs. 70,000–80,000/month fellowship and Rs. 2 lakh annual research grant for 5 years.',
    description_hi:
      'आईआईटी/आईआईएससी/एनआईटी में डॉक्टरल अनुसंधान के लिए। चयनित फेलो को ₹70,000–80,000/माह फेलोशिप और ₹2 लाख वार्षिक अनुसंधान अनुदान।',
    ministry: 'Ministry of Education',
    type: 'central',
    benefits: '₹70,000–₹80,000/month fellowship + ₹2 lakh/year research grant',
    eligibility_criteria: {
      min_age: 20,
      max_age: 35,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'B.Tech/M.Sc Degree Certificate',
      'GATE Score / NET Qualification',
      'Research Proposal',
      'Institute Admission Proof',
    ],
    status: 'active',
    application_url: 'https://www.pmrf.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'edu-006',
    name: 'Samagra Shiksha Abhiyan',
    name_hi: 'समग्र शिक्षा अभियान',
    description:
      'Integrated scheme for school education covering pre-school to Class XII. Provides free textbooks, uniforms, transport allowance, and infrastructure support. Special focus on girl child education and inclusive education for CWSN.',
    description_hi:
      'प्री-स्कूल से कक्षा XII तक स्कूली शिक्षा की एकीकृत योजना। मुफ्त पाठ्यपुस्तकें, यूनिफॉर्म, परिवहन भत्ता प्रदान करती है।',
    ministry: 'Ministry of Education',
    type: 'central',
    benefits: 'Free textbooks, uniforms, transport allowance, and school infrastructure',
    eligibility_criteria: {
      max_age: 18,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'School Enrollment Proof',
      'Parent/Guardian ID',
    ],
    status: 'active',
    application_url: 'https://samagra.education.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WOMEN & CHILD (6 schemes)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'women-001',
    name: 'Sukanya Samriddhi Yojana (SSY)',
    name_hi: 'सुकन्या समृद्धि योजना',
    description:
      'Small savings scheme for the girl child offering one of the highest interest rates (8.2%) among government savings schemes. Minimum deposit Rs. 250/year, maximum Rs. 1.5 lakh/year. Tax-free under Section 80C. Account matures after 21 years from opening or on marriage after age 18.',
    description_hi:
      'बालिकाओं के लिए 8.2% ब्याज दर वाली लघु बचत योजना। न्यूनतम ₹250/वर्ष, अधिकतम ₹1.5 लाख/वर्ष। धारा 80C के तहत कर-मुक्त।',
    ministry: 'Ministry of Finance',
    type: 'central',
    benefits: '8.2% interest rate, tax-free maturity, EEE status under 80C',
    eligibility_criteria: {
      gender: 'female',
      max_age: 10,
    },
    documents_required: [
      'Girl Child Birth Certificate',
      'Parent/Guardian Aadhaar Card',
      'Parent/Guardian Address Proof',
      'Passport-size Photographs',
    ],
    status: 'active',
    application_url: 'https://www.india.gov.in/sukanya-samriddhi-yojna',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'women-002',
    name: 'Beti Bachao Beti Padhao (BBBP)',
    name_hi: 'बेटी बचाओ बेटी पढ़ाओ',
    description:
      'Multi-sectoral campaign to address declining Child Sex Ratio, promote girls\' education, and ensure survival and protection of the girl child. Implemented across all districts with focus on gender-critical areas.',
    description_hi:
      'घटते बाल लिंगानुपात को संबोधित करने, बालिकाओं की शिक्षा को बढ़ावा देने और बालिकाओं के अस्तित्व और सुरक्षा सुनिश्चित करने की बहु-क्षेत्रीय अभियान।',
    ministry: 'Ministry of Women & Child Development',
    type: 'central',
    benefits: 'Awareness, institutional delivery incentives, and girls\' education support',
    eligibility_criteria: {
      gender: 'female',
      max_age: 18,
    },
    documents_required: [
      'Birth Certificate',
      'Aadhaar Card (parent)',
    ],
    status: 'active',
    application_url: 'https://wcd.nic.in/bbbp-schemes',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'women-003',
    name: 'PM Matru Vandana Yojana (PMMVY)',
    name_hi: 'प्रधानमंत्री मातृ वंदना योजना',
    description:
      'Cash incentive of Rs. 5,000 in three installments to pregnant women and lactating mothers for the first living child, to compensate for wage loss and ensure safe delivery and nutrition. Additional Rs. 6,000 for second child if girl.',
    description_hi:
      'गर्भवती महिलाओं और स्तनपान कराने वाली माताओं को पहले जीवित बच्चे के लिए तीन किस्तों में ₹5,000 का नकद प्रोत्साहन।',
    ministry: 'Ministry of Women & Child Development',
    type: 'central',
    benefits: '₹5,000 in 3 installments (₹1,000 + ₹2,000 + ₹2,000); ₹6,000 for 2nd girl child',
    eligibility_criteria: {
      gender: 'female',
      min_age: 19,
    },
    documents_required: [
      'Aadhaar Card',
      'MCP (Mother-Child Protection) Card',
      'Bank Account / Post Office Account',
      'Pregnancy Registration Proof',
    ],
    status: 'active',
    application_url: 'https://pmmvy.wcd.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'women-004',
    name: 'Mahila Shakti Kendra',
    name_hi: 'महिला शक्ति केंद्र',
    description:
      'Community-level centres providing one-stop convergent support services for empowering rural women through skill development, employment, digital literacy, health, and nutrition awareness. Student volunteers from colleges serve as catalysts.',
    description_hi:
      'ग्रामीण महिलाओं को कौशल विकास, रोजगार, डिजिटल साक्षरता, स्वास्थ्य और पोषण जागरूकता के माध्यम से सशक्त बनाने वाले सामुदायिक केंद्र।',
    ministry: 'Ministry of Women & Child Development',
    type: 'central',
    benefits: 'Skill development, digital literacy, health & nutrition support for rural women',
    eligibility_criteria: {
      gender: 'female',
      min_age: 18,
    },
    documents_required: [
      'Aadhaar Card',
      'Address Proof',
    ],
    status: 'active',
    application_url: 'https://wcd.nic.in/schemes/mahila-shakti-kendra',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'women-005',
    name: 'One Stop Centre (Sakhi)',
    name_hi: 'वन स्टॉप सेंटर (सखी)',
    description:
      'Integrated support centres for women affected by violence (domestic, sexual, workplace harassment) providing medical aid, police assistance, legal counselling, psycho-social support, and temporary shelter — all under one roof, available 24x7.',
    description_hi:
      'हिंसा से प्रभावित महिलाओं को चिकित्सा सहायता, पुलिस सहायता, कानूनी परामर्श, मनो-सामाजिक सहायता और अस्थायी आश्रय प्रदान करने वाले एकीकृत सहायता केंद्र।',
    ministry: 'Ministry of Women & Child Development',
    type: 'central',
    benefits: 'Free medical, legal, police, counselling, and shelter support for women (24x7)',
    eligibility_criteria: {
      gender: 'female',
    },
    documents_required: [
      'Any Government ID (optional — services not denied without documents)',
    ],
    status: 'active',
    application_url: 'https://wcd.nic.in/schemes/one-stop-centre-scheme-1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'women-006',
    name: 'Working Women Hostel',
    name_hi: 'कामकाजी महिला छात्रावास',
    description:
      'Provides safe, affordable, and conveniently located accommodation to working women, women under training, and their children. Monthly income must not exceed Rs. 50,000 in metros or Rs. 35,000 in other cities.',
    description_hi:
      'कामकाजी महिलाओं, प्रशिक्षणार्थी महिलाओं और उनके बच्चों को सुरक्षित, किफायती और सुविधाजनक आवास प्रदान करना।',
    ministry: 'Ministry of Women & Child Development',
    type: 'central',
    benefits: 'Safe and subsidized hostel accommodation for working women and trainees',
    eligibility_criteria: {
      gender: 'female',
      min_age: 18,
      max_income: 600000,
    },
    documents_required: [
      'Aadhaar Card',
      'Employment / Training Proof',
      'Income Certificate',
      'Passport-size Photographs',
    ],
    status: 'active',
    application_url: 'https://wcd.nic.in/schemes/working-women-hostel',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PENSION & INSURANCE (6 schemes)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'pension-001',
    name: 'Atal Pension Yojana (APY)',
    name_hi: 'अटल पेंशन योजना',
    description:
      'Guaranteed minimum pension of Rs. 1,000 to Rs. 5,000 per month after 60 years of age for workers in the unorganized sector. Government co-contributes 50% of total contribution or Rs. 1,000/year (whichever is lower) for 5 years for eligible subscribers.',
    description_hi:
      'असंगठित क्षेत्र के श्रमिकों के लिए 60 वर्ष की आयु के बाद ₹1,000 से ₹5,000 प्रति माह की गारंटीकृत न्यूनतम पेंशन।',
    ministry: 'Ministry of Finance',
    type: 'central',
    benefits: '₹1,000–₹5,000/month guaranteed pension after age 60',
    eligibility_criteria: {
      min_age: 18,
      max_age: 40,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Savings Bank Account',
      'Mobile Number',
    ],
    status: 'active',
    application_url: 'https://www.npscra.nsdl.co.in/scheme-details.php',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'pension-002',
    name: 'PM Jeevan Jyoti Bima Yojana (PMJJBY)',
    name_hi: 'प्रधानमंत्री जीवन ज्योति बीमा योजना',
    description:
      'Life insurance cover of Rs. 2 lakh at an annual premium of just Rs. 436, auto-debited from bank account. Coverage for death due to any reason, renewable annually. Available through banks and post offices.',
    description_hi:
      'मात्र ₹436 वार्षिक प्रीमियम पर ₹2 लाख का जीवन बीमा कवर। किसी भी कारण से मृत्यु पर कवरेज।',
    ministry: 'Ministry of Finance',
    type: 'central',
    benefits: '₹2 lakh life insurance cover at ₹436/year premium',
    eligibility_criteria: {
      min_age: 18,
      max_age: 50,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Savings Bank Account',
      'Consent-cum-Declaration Form',
    ],
    status: 'active',
    application_url: 'https://www.jansuraksha.gov.in/Forms-PMJJBY.aspx',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'pension-003',
    name: 'PM Suraksha Bima Yojana (PMSBY)',
    name_hi: 'प्रधानमंत्री सुरक्षा बीमा योजना',
    description:
      'Accidental death and disability insurance cover of Rs. 2 lakh (Rs. 1 lakh for partial disability) at an annual premium of just Rs. 20, auto-debited from bank account.',
    description_hi:
      'मात्र ₹20 वार्षिक प्रीमियम पर ₹2 लाख का दुर्घटना मृत्यु और विकलांगता बीमा कवर।',
    ministry: 'Ministry of Finance',
    type: 'central',
    benefits: '₹2 lakh accidental death/disability cover at ₹20/year premium',
    eligibility_criteria: {
      min_age: 18,
      max_age: 70,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Savings Bank Account',
      'Consent-cum-Declaration Form',
    ],
    status: 'active',
    application_url: 'https://www.jansuraksha.gov.in/Forms-PMSBY.aspx',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'pension-004',
    name: 'National Pension System (NPS)',
    name_hi: 'राष्ट्रीय पेंशन प्रणाली',
    description:
      'Voluntary, defined-contribution pension system regulated by PFRDA. Market-linked returns with tax benefits under Sections 80CCD(1), 80CCD(1B) (extra ₹50,000), and 80CCD(2). Minimum ₹1,000/year contribution. 60% corpus tax-free at retirement.',
    description_hi:
      'पीएफआरडीए द्वारा विनियमित स्वैच्छिक, परिभाषित-अंशदान पेंशन प्रणाली। धारा 80CCD के तहत कर लाभ।',
    ministry: 'Ministry of Finance',
    type: 'central',
    benefits: 'Market-linked pension + extra ₹50,000 tax deduction under 80CCD(1B)',
    eligibility_criteria: {
      min_age: 18,
      max_age: 70,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'PAN Card',
      'Bank Account Details',
      'Passport-size Photograph',
    ],
    status: 'active',
    application_url: 'https://enps.nsdl.com/eNPS/NationalPensionSystem.html',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'pension-005',
    name: 'PM Vaya Vandana Yojana (PMVVY)',
    name_hi: 'प्रधानमंत्री वय वंदना योजना',
    description:
      'Pension scheme for senior citizens (60+) operated through LIC. Provides assured return of 7.40% per annum payable monthly. Maximum investment limit Rs. 15 lakh per senior citizen.',
    description_hi:
      'वरिष्ठ नागरिकों (60+) के लिए एलआईसी द्वारा संचालित पेंशन योजना। 7.40% प्रति वर्ष का सुनिश्चित रिटर्न।',
    ministry: 'Ministry of Finance',
    type: 'central',
    benefits: '7.40% assured annual return; monthly pension up to ₹9,250',
    eligibility_criteria: {
      min_age: 60,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'PAN Card',
      'Age Proof',
      'Bank Account Details',
      'Passport-size Photograph',
    ],
    status: 'active',
    application_url: 'https://www.licindia.in/Products/Pension-Plans/Pradhan-Mantri-Vaya-Vandana-Yojana',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'pension-006',
    name: 'Varishtha Pension Bima Yojana',
    name_hi: 'वरिष्ठ पेंशन बीमा योजना',
    description:
      'Subsidized pension scheme for senior citizens providing an assured minimum return on a lump-sum investment for 15 years. Operated through LIC with government-borne differential return guarantee.',
    description_hi:
      'वरिष्ठ नागरिकों के लिए एकमुश्त निवेश पर 15 वर्षों के लिए सुनिश्चित न्यूनतम रिटर्न प्रदान करने वाली सब्सिडी वाली पेंशन योजना।',
    ministry: 'Ministry of Finance',
    type: 'central',
    benefits: 'Guaranteed pension with government-subsidized returns for 15 years',
    eligibility_criteria: {
      min_age: 60,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Age Proof',
      'Bank Account Details',
      'PAN Card',
    ],
    status: 'active',
    application_url: 'https://www.licindia.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPLOYMENT & SKILL DEVELOPMENT (6 schemes)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'employ-001',
    name: 'PM Mudra Yojana (PMMY)',
    name_hi: 'प्रधानमंत्री मुद्रा योजना',
    description:
      'Collateral-free loans up to Rs. 10 lakh for non-corporate, non-farm small/micro enterprises. Three categories: Shishu (up to ₹50,000), Kishore (₹50,000–₹5 lakh), and Tarun (₹5–10 lakh). No processing fee.',
    description_hi:
      'गैर-कॉर्पोरेट, गैर-कृषि लघु/सूक्ष्म उद्यमों के लिए ₹10 लाख तक बिना गारंटी ऋण। शिशु, किशोर और तरुण तीन श्रेणियां।',
    ministry: 'Ministry of Finance',
    type: 'central',
    benefits: 'Collateral-free business loans up to ₹10 lakh (Shishu/Kishore/Tarun)',
    eligibility_criteria: {
      min_age: 18,
      occupations: ['self-employed', 'business', 'entrepreneur', 'shopkeeper', 'vendor'],
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'PAN Card',
      'Business Plan / Project Report',
      'Address Proof (Business & Residential)',
      'Identity Proof',
      'Passport-size Photographs',
    ],
    status: 'active',
    application_url: 'https://www.mudra.org.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'employ-002',
    name: 'PM SVANidhi (Street Vendor\'s AtmaNirbhar Nidhi)',
    name_hi: 'पीएम स्वनिधि',
    description:
      'Micro-credit scheme for street vendors providing working capital loan of Rs. 10,000 (1st cycle), Rs. 20,000 (2nd cycle), and Rs. 50,000 (3rd cycle) with 7% interest subsidy. Digital payment incentive of up to Rs. 1,200/year.',
    description_hi:
      'रेहड़ी-पटरी विक्रेताओं के लिए ₹10,000 से ₹50,000 तक का सूक्ष्म-ऋण, 7% ब्याज सब्सिडी और डिजिटल भुगतान प्रोत्साहन।',
    ministry: 'Ministry of Housing & Urban Affairs',
    type: 'central',
    benefits: '₹10,000–₹50,000 working capital loan with 7% interest subsidy',
    eligibility_criteria: {
      min_age: 18,
      occupations: ['vendor', 'street vendor', 'hawker', 'self-employed'],
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Vending Certificate / Letter of Recommendation from ULB',
      'Bank Account Details',
      'Passport-size Photograph',
    ],
    status: 'active',
    application_url: 'https://pmsvanidhi.mohua.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'employ-003',
    name: 'PM Employment Generation Programme (PMEGP)',
    name_hi: 'प्रधानमंत्री रोजगार सृजन कार्यक्रम',
    description:
      'Credit-linked subsidy programme for setting up new micro-enterprises. Subsidy of 15–35% of project cost (up to ₹50 lakh for manufacturing, ₹20 lakh for services). Higher subsidy for SC/ST/OBC/Women/NER candidates.',
    description_hi:
      'नए सूक्ष्म उद्यम स्थापित करने के लिए ऋण-लिंक्ड सब्सिडी कार्यक्रम। परियोजना लागत का 15-35% सब्सिडी।',
    ministry: 'Ministry of Micro, Small & Medium Enterprises',
    type: 'central',
    benefits: '15–35% subsidy on projects up to ₹50 lakh (manufacturing) / ₹20 lakh (services)',
    eligibility_criteria: {
      min_age: 18,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Project Report',
      'Educational Certificate (8th pass for > ₹10 lakh)',
      'Caste Certificate (if applicable)',
      'Bank Account Details',
      'Passport-size Photographs',
    ],
    status: 'active',
    application_url: 'https://www.kviconline.gov.in/pmegpeportal/jsp/pmegponline.jsp',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'employ-004',
    name: 'Skill India Mission / PM Kaushal Vikas Yojana (PMKVY)',
    name_hi: 'स्किल इंडिया मिशन / पीएम कौशल विकास योजना',
    description:
      'India\'s largest skill certification scheme providing free industry-relevant skill training to youth. Training duration 150–300 hours with monetary reward of ₹8,000 on certification. Covers 300+ job roles across 40+ sectors.',
    description_hi:
      'भारत की सबसे बड़ी कौशल प्रमाणन योजना। युवाओं को मुफ्त उद्योग-प्रासंगिक कौशल प्रशिक्षण। प्रमाणन पर ₹8,000 का मौद्रिक पुरस्कार।',
    ministry: 'Ministry of Skill Development & Entrepreneurship',
    type: 'central',
    benefits: 'Free skill training + ₹8,000 reward on certification + placement assistance',
    eligibility_criteria: {
      min_age: 15,
      max_age: 45,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Bank Account Details',
      'Educational Certificates',
      'Passport-size Photographs',
    ],
    status: 'active',
    application_url: 'https://www.pmkvyofficial.org',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'employ-005',
    name: 'Startup India',
    name_hi: 'स्टार्टअप इंडिया',
    description:
      'Flagship initiative to build a strong ecosystem for startups. DPIIT-recognized startups get 3-year income tax exemption, self-certification for 6 labour laws, fast-tracked patent applications at 80% fee rebate, and access to Fund of Funds (₹10,000 crore corpus).',
    description_hi:
      'स्टार्टअप के लिए मजबूत पारिस्थितिकी तंत्र बनाने की प्रमुख पहल। 3 वर्ष कर छूट, पेटेंट पर 80% शुल्क छूट, और फंड ऑफ फंड्स तक पहुंच।',
    ministry: 'Department for Promotion of Industry & Internal Trade (DPIIT)',
    type: 'central',
    benefits: '3-year tax exemption, 80% patent fee rebate, access to ₹10,000 Cr fund',
    eligibility_criteria: {
      min_age: 18,
      occupations: ['entrepreneur', 'startup', 'business'],
      gender: 'any',
    },
    documents_required: [
      'Company Registration (Certificate of Incorporation)',
      'PAN Card of Company',
      'Director/Founder Aadhaar & PAN',
      'Business Plan',
      'Brief Description of Innovation',
    ],
    status: 'active',
    application_url: 'https://www.startupindia.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'employ-006',
    name: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)',
    name_hi: 'दीन दयाल उपाध्याय ग्रामीण कौशल्य योजना',
    description:
      'Placement-linked skill development programme for rural poor youth. Provides free training for 3–12 months in 250+ trades with guaranteed placement of at least 70% of trained candidates. Includes boarding, lodging, and post-placement support.',
    description_hi:
      'ग्रामीण गरीब युवाओं के लिए प्लेसमेंट-लिंक्ड कौशल विकास कार्यक्रम। 250+ ट्रेडों में 3-12 माह का मुफ्त प्रशिक्षण।',
    ministry: 'Ministry of Rural Development',
    type: 'central',
    benefits: 'Free 3–12 month skill training with 70%+ placement guarantee',
    eligibility_criteria: {
      min_age: 15,
      max_age: 35,
      gender: 'any',
      is_bpl: true,
    },
    documents_required: [
      'Aadhaar Card',
      'BPL/SECC Certificate',
      'Educational Certificates',
      'Bank Account Details',
      'Passport-size Photographs',
    ],
    status: 'active',
    application_url: 'https://ddugky.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCIAL INCLUSION (5 schemes)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'finance-001',
    name: 'PM Jan Dhan Yojana (PMJDY)',
    name_hi: 'प्रधानमंत्री जन धन योजना',
    description:
      'Financial inclusion scheme providing zero-balance savings bank accounts with free RuPay debit card, Rs. 2 lakh accidental insurance cover, and Rs. 30,000 life cover. Overdraft facility of Rs. 10,000 available for eligible accounts.',
    description_hi:
      'जीरो बैलेंस बचत खाता, मुफ्त रुपे डेबिट कार्ड, ₹2 लाख दुर्घटना बीमा और ₹30,000 जीवन कवर प्रदान करने वाली वित्तीय समावेशन योजना।',
    ministry: 'Ministry of Finance',
    type: 'central',
    benefits: 'Zero-balance account + free RuPay card + ₹2L accident + ₹30K life cover + ₹10K OD',
    eligibility_criteria: {
      min_age: 10,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card (or any one of 6 officially valid documents)',
      'Passport-size Photograph',
    ],
    status: 'active',
    application_url: 'https://pmjdy.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'finance-002',
    name: 'Stand-Up India',
    name_hi: 'स्टैंड-अप इंडिया',
    description:
      'Facilitates bank loans between Rs. 10 lakh and Rs. 1 crore to at least one SC/ST borrower and one woman borrower per bank branch for setting up a greenfield enterprise in manufacturing, services, or trading.',
    description_hi:
      'प्रत्येक बैंक शाखा से कम से कम एक एससी/एसटी और एक महिला उद्यमी को ₹10 लाख से ₹1 करोड़ तक का ऋण।',
    ministry: 'Ministry of Finance',
    type: 'central',
    benefits: '₹10 lakh – ₹1 crore bank loans for SC/ST and women entrepreneurs',
    eligibility_criteria: {
      min_age: 18,
      categories: ['sc', 'st'],
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Caste Certificate (for SC/ST)',
      'Business Plan / Project Report',
      'Address Proof',
      'Bank Account Details',
      'Identity Proof',
    ],
    status: 'active',
    application_url: 'https://www.standupmitra.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'finance-003',
    name: 'Digital India Programme',
    name_hi: 'डिजिटल इंडिया कार्यक्रम',
    description:
      'Umbrella programme to transform India into a digitally empowered society. Includes Common Service Centres (CSC), BharatNet for rural broadband, DigiLocker, UMANG app, and digital literacy training through PMGDISHA.',
    description_hi:
      'भारत को डिजिटल रूप से सशक्त समाज में बदलने का छत्र कार्यक्रम। कॉमन सर्विस सेंटर, भारतनेट, डिजीलॉकर, उमंग ऐप शामिल।',
    ministry: 'Ministry of Electronics & Information Technology',
    type: 'central',
    benefits: 'Free digital literacy training, DigiLocker, CSC services, and rural broadband',
    eligibility_criteria: {
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
    ],
    status: 'active',
    application_url: 'https://www.digitalindia.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'finance-004',
    name: 'PM Garib Kalyan Yojana (PMGKY)',
    name_hi: 'प्रधानमंत्री गरीब कल्याण योजना',
    description:
      'Relief package for the poor including free food grains (5 kg wheat/rice per person per month), direct cash transfers to Jan Dhan accounts (₹500/month for women), and enhanced MGNREGA wages.',
    description_hi:
      'गरीबों के लिए राहत पैकेज जिसमें मुफ्त खाद्यान्न, जन धन खातों में नकद हस्तांतरण और बढ़ी हुई मनरेगा मजदूरी शामिल।',
    ministry: 'Ministry of Finance',
    type: 'central',
    benefits: 'Free 5 kg/person/month food grains + ₹500/month to women Jan Dhan holders',
    eligibility_criteria: {
      is_bpl: true,
      gender: 'any',
    },
    documents_required: [
      'Ration Card',
      'Aadhaar Card',
      'Jan Dhan Bank Account (for cash transfer)',
    ],
    status: 'active',
    application_url: 'https://www.india.gov.in/spotlight/pm-garib-kalyan-yojana',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'finance-005',
    name: 'Direct Benefit Transfer (DBT)',
    name_hi: 'प्रत्यक्ष लाभ हस्तांतरण',
    description:
      'Platform to transfer government subsidies and benefits directly to the bank accounts of beneficiaries using Aadhaar authentication, eliminating leakages and middlemen. Covers 300+ schemes across 50+ ministries.',
    description_hi:
      'आधार प्रमाणीकरण का उपयोग करके सरकारी सब्सिडी और लाभ सीधे लाभार्थियों के बैंक खातों में हस्तांतरित करने का मंच।',
    ministry: 'Cabinet Secretariat',
    type: 'central',
    benefits: 'Direct transfer of subsidies to bank account — no middlemen or leakage',
    eligibility_criteria: {
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Bank Account linked with Aadhaar',
    ],
    status: 'active',
    application_url: 'https://dbtbharat.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RURAL DEVELOPMENT (5 schemes)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'rural-001',
    name: 'MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act)',
    name_hi: 'मनरेगा (महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम)',
    description:
      'Legal guarantee of 100 days of wage employment per year to every rural household whose adult members volunteer to do unskilled manual work. Current wage rate varies by state (₹220–₹333/day). Unemployment allowance if work not provided within 15 days.',
    description_hi:
      'प्रत्येक ग्रामीण परिवार को जिनके वयस्क सदस्य अकुशल शारीरिक श्रम करने को तैयार हैं, प्रति वर्ष 100 दिनों के वेतन रोजगार की कानूनी गारंटी।',
    ministry: 'Ministry of Rural Development',
    type: 'central',
    benefits: '100 days guaranteed employment at ₹220–₹333/day (varies by state)',
    eligibility_criteria: {
      min_age: 18,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Job Card (issued by Gram Panchayat)',
      'Bank / Post Office Account',
      'Passport-size Photograph',
    ],
    status: 'active',
    application_url: 'https://nrega.nic.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'rural-002',
    name: 'PM Gram Sadak Yojana (PMGSY)',
    name_hi: 'प्रधानमंत्री ग्राम सड़क योजना',
    description:
      'All-weather road connectivity to unconnected rural habitations with population of 500+ (250+ in hilly/tribal areas). Also includes upgradation of existing rural roads to improve market access for farmers.',
    description_hi:
      '500+ जनसंख्या (पहाड़ी/जनजातीय क्षेत्रों में 250+) वाली असंबद्ध ग्रामीण बस्तियों को सभी मौसम की सड़क संपर्क।',
    ministry: 'Ministry of Rural Development',
    type: 'central',
    benefits: 'All-weather road connectivity to unconnected rural habitations',
    eligibility_criteria: {
      gender: 'any',
    },
    documents_required: [],
    status: 'active',
    application_url: 'https://pmgsy.nic.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'rural-003',
    name: 'National Rural Livelihood Mission (DAY-NRLM)',
    name_hi: 'राष्ट्रीय ग्रामीण आजीविका मिशन (दीनदयाल अंत्योदय योजना)',
    description:
      'Organizes rural poor women into Self Help Groups (SHGs), provides revolving fund of ₹10,000–₹15,000, community investment fund up to ₹2.5 lakh, and bank linkage for livelihood activities. Interest subvention of 3% on loans up to ₹3 lakh.',
    description_hi:
      'ग्रामीण गरीब महिलाओं को स्वयं सहायता समूहों में संगठित करता है, रिवॉल्विंग फंड और बैंक लिंकेज प्रदान करता है।',
    ministry: 'Ministry of Rural Development',
    type: 'central',
    benefits: '₹10,000–₹15,000 revolving fund + bank linkage + 3% interest subvention on loans',
    eligibility_criteria: {
      gender: 'female',
      min_age: 18,
      is_bpl: true,
    },
    documents_required: [
      'Aadhaar Card',
      'BPL Card / SECC List',
      'SHG Membership Proof',
      'Bank Account Details',
    ],
    status: 'active',
    application_url: 'https://nrlm.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'rural-004',
    name: 'Swachh Bharat Mission - Gramin (SBM-G)',
    name_hi: 'स्वच्छ भारत मिशन - ग्रामीण',
    description:
      'Provides Rs. 12,000 incentive for construction of individual household toilets in rural areas. Phase II focuses on ODF Plus — solid and liquid waste management, visual cleanliness, and grey water management.',
    description_hi:
      'ग्रामीण क्षेत्रों में व्यक्तिगत घरेलू शौचालय निर्माण के लिए ₹12,000 का प्रोत्साहन। चरण II ओडीएफ प्लस पर केंद्रित।',
    ministry: 'Ministry of Jal Shakti',
    type: 'central',
    benefits: '₹12,000 incentive for household toilet construction',
    eligibility_criteria: {
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'BPL Card (priority)',
      'Bank Account Details',
      'Photograph of Constructed Toilet',
    ],
    status: 'active',
    application_url: 'https://swachhbharatmission.gov.in/sbmcms/index.htm',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'rural-005',
    name: 'Jal Jeevan Mission',
    name_hi: 'जल जीवन मिशन',
    description:
      'Aims to provide Functional Household Tap Connection (FHTC) to every rural household by 2024, delivering 55 litres of water per person per day of prescribed quality on a regular and long-term basis.',
    description_hi:
      'प्रत्येक ग्रामीण परिवार को कार्यात्मक घरेलू नल कनेक्शन प्रदान करने का लक्ष्य, प्रति व्यक्ति प्रति दिन 55 लीटर जल।',
    ministry: 'Ministry of Jal Shakti',
    type: 'central',
    benefits: 'Free piped water supply — 55 litres/person/day to every rural household',
    eligibility_criteria: {
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Ration Card',
    ],
    status: 'active',
    application_url: 'https://jaljeevanmission.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SENIOR CITIZENS (4 schemes)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'senior-001',
    name: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
    name_hi: 'इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना',
    description:
      'Monthly pension for BPL senior citizens: Rs. 200/month (age 60–79) and Rs. 500/month (age 80+) from Central Government. States add top-up ranging from Rs. 200 to Rs. 2,000 depending on the state.',
    description_hi:
      'बीपीएल वरिष्ठ नागरिकों को मासिक पेंशन: 60-79 वर्ष के लिए ₹200/माह और 80+ के लिए ₹500/माह। राज्य अतिरिक्त राशि जोड़ते हैं।',
    ministry: 'Ministry of Rural Development',
    type: 'central',
    benefits: '₹200/month (60–79 yrs) or ₹500/month (80+ yrs) + state top-up',
    eligibility_criteria: {
      min_age: 60,
      is_bpl: true,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Age Proof (Birth Certificate / Voter ID)',
      'BPL Card',
      'Bank / Post Office Account',
      'Passport-size Photograph',
    ],
    status: 'active',
    application_url: 'https://nsap.nic.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'senior-002',
    name: 'Rashtriya Vayoshri Yojana (RVY)',
    name_hi: 'राष्ट्रीय वयोश्री योजना',
    description:
      'Provides free physical aids and assisted-living devices (walking sticks, hearing aids, wheelchairs, dentures, spectacles) to senior citizens belonging to BPL category who suffer from age-related disabilities.',
    description_hi:
      'बीपीएल श्रेणी के वरिष्ठ नागरिकों को मुफ्त शारीरिक सहायता उपकरण (चलने की छड़ी, श्रवण यंत्र, व्हीलचेयर, चश्मा आदि) प्रदान करना।',
    ministry: 'Ministry of Social Justice & Empowerment',
    type: 'central',
    benefits: 'Free walking sticks, hearing aids, wheelchairs, dentures, and spectacles',
    eligibility_criteria: {
      min_age: 60,
      is_bpl: true,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'BPL Card',
      'Age Proof',
      'Disability Certificate (from doctor)',
    ],
    status: 'active',
    application_url: 'https://www.alimco.in/RVY.aspx',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'senior-003',
    name: 'Senior Citizen Savings Scheme (SCSS)',
    name_hi: 'वरिष्ठ नागरिक बचत योजना',
    description:
      'Government-backed savings scheme for senior citizens offering 8.2% interest rate (highest among small savings). Maximum deposit Rs. 30 lakh. Tenure 5 years, extendable by 3 years. Tax deduction under Section 80C.',
    description_hi:
      'वरिष्ठ नागरिकों के लिए 8.2% ब्याज दर वाली सरकारी बचत योजना। अधिकतम जमा ₹30 लाख। अवधि 5 वर्ष।',
    ministry: 'Ministry of Finance',
    type: 'central',
    benefits: '8.2% interest rate on deposits up to ₹30 lakh + 80C tax benefit',
    eligibility_criteria: {
      min_age: 60,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'PAN Card',
      'Age Proof',
      'Passport-size Photographs',
      'Cheque / Deposit Amount',
    ],
    status: 'active',
    application_url: 'https://www.india.gov.in/senior-citizens-savings-scheme',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'senior-004',
    name: 'Maintenance and Welfare of Parents and Senior Citizens Act',
    name_hi: 'माता-पिता और वरिष्ठ नागरिकों का भरण-पोषण और कल्याण अधिनियम',
    description:
      'Legal provision mandating children/relatives to provide maintenance to senior citizens and parents. Senior Citizens can claim up to Rs. 10,000/month through Maintenance Tribunals. Also ensures protection of life and property.',
    description_hi:
      'वरिष्ठ नागरिकों और माता-पिता को भरण-पोषण प्रदान करने के लिए बच्चों/रिश्तेदारों को अनिवार्य करने वाला कानूनी प्रावधान।',
    ministry: 'Ministry of Social Justice & Empowerment',
    type: 'central',
    benefits: 'Legal right to claim maintenance up to ₹10,000/month from children/relatives',
    eligibility_criteria: {
      min_age: 60,
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card / Age Proof',
      'Income Details',
      'Details of Children / Relatives',
      'Application to Maintenance Tribunal',
    ],
    status: 'active',
    application_url: 'https://www.india.gov.in/maintenance-and-welfare-parents-and-senior-citizens-act-2007',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FOOD SECURITY (3 schemes)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'food-001',
    name: 'National Food Security Act (NFSA) / PDS',
    name_hi: 'राष्ट्रीय खाद्य सुरक्षा अधिनियम / पीडीएस',
    description:
      'Provides highly subsidized food grains to approximately 81.35 crore persons: 5 kg/person/month of rice at ₹3/kg, wheat at ₹2/kg, and coarse grains at ₹1/kg through the Public Distribution System (PDS). Antyodaya (AAY) families get 35 kg/month.',
    description_hi:
      'लगभग 81.35 करोड़ लोगों को अत्यधिक रियायती खाद्यान्न: ₹3/किग्रा चावल, ₹2/किग्रा गेहूं, ₹1/किग्रा मोटे अनाज।',
    ministry: 'Ministry of Consumer Affairs, Food & Public Distribution',
    type: 'central',
    benefits: '5 kg/person/month: rice ₹3/kg, wheat ₹2/kg, coarse grains ₹1/kg',
    eligibility_criteria: {
      gender: 'any',
    },
    documents_required: [
      'Ration Card (PHH/AAY)',
      'Aadhaar Card',
    ],
    status: 'active',
    application_url: 'https://nfsa.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'food-002',
    name: 'Mid-Day Meal Scheme (PM POSHAN)',
    name_hi: 'मध्याह्न भोजन योजना (पीएम पोषण)',
    description:
      'Free cooked nutritious meal to every child studying in Classes I–VIII in government and government-aided schools. Covers 11.80 crore children across 11.20 lakh schools. Caloric norms: 450 cal (primary) and 700 cal (upper primary).',
    description_hi:
      'सरकारी और सरकारी सहायता प्राप्त स्कूलों में कक्षा I-VIII में पढ़ने वाले प्रत्येक बच्चे को मुफ्त पका हुआ पौष्टिक भोजन।',
    ministry: 'Ministry of Education',
    type: 'central',
    benefits: 'Free nutritious cooked meal (450–700 calories) to school children daily',
    eligibility_criteria: {
      max_age: 14,
      gender: 'any',
    },
    documents_required: [
      'School Enrollment / ID Card',
    ],
    status: 'active',
    application_url: 'https://pmposhan.education.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'food-003',
    name: 'Integrated Child Development Services (ICDS)',
    name_hi: 'एकीकृत बाल विकास सेवा',
    description:
      'Provides six services through Anganwadi centres: supplementary nutrition, pre-school education, immunization, health check-ups, referral services, and nutrition/health education for children (0–6 years), pregnant women, and lactating mothers.',
    description_hi:
      'आंगनवाड़ी केंद्रों के माध्यम से छह सेवाएं: पूरक पोषण, पूर्व-विद्यालय शिक्षा, टीकाकरण, स्वास्थ्य जांच, रेफरल सेवाएं।',
    ministry: 'Ministry of Women & Child Development',
    type: 'central',
    benefits: 'Free nutrition, pre-school education, immunization, and health check-ups',
    eligibility_criteria: {
      max_age: 6,
      gender: 'any',
    },
    documents_required: [
      'Birth Certificate',
      'Aadhaar Card (parent)',
      'Anganwadi Registration',
    ],
    status: 'active',
    application_url: 'https://wcd.nic.in/schemes/icds-scheme',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENERGY & UTILITIES (3 schemes)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'energy-001',
    name: 'PM Ujjwala Yojana (PMUY)',
    name_hi: 'प्रधानमंत्री उज्ज्वला योजना',
    description:
      'Provides free LPG connections to women from BPL/SC/ST/most backward/forest dweller households. Financial support of Rs. 1,600 for each LPG connection (security deposit for cylinder + pressure regulator + hose).',
    description_hi:
      'बीपीएल/एससी/एसटी परिवारों की महिलाओं को मुफ्त एलपीजी कनेक्शन। प्रत्येक कनेक्शन के लिए ₹1,600 की वित्तीय सहायता।',
    ministry: 'Ministry of Petroleum & Natural Gas',
    type: 'central',
    benefits: 'Free LPG connection + ₹1,600 financial support',
    eligibility_criteria: {
      gender: 'female',
      min_age: 18,
      is_bpl: true,
    },
    documents_required: [
      'Aadhaar Card',
      'BPL Ration Card',
      'Bank Account Details',
      'Passport-size Photograph',
    ],
    status: 'active',
    application_url: 'https://www.pmujjwalayojana.com',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'energy-002',
    name: 'Saubhagya (PM Sahaj Bijli Har Ghar Yojana)',
    name_hi: 'सौभाग्य (पीएम सहज बिजली हर घर योजना)',
    description:
      'Free electricity connections to all remaining un-electrified households in rural and urban areas. BPL households get completely free connection; other households can pay Rs. 500 in 10 EMIs.',
    description_hi:
      'ग्रामीण और शहरी क्षेत्रों के सभी शेष बिना बिजली वाले परिवारों को मुफ्त बिजली कनेक्शन।',
    ministry: 'Ministry of Power',
    type: 'central',
    benefits: 'Free electricity connection for BPL; ₹500 (in 10 EMIs) for others',
    eligibility_criteria: {
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'BPL Card (for free connection)',
      'Address Proof',
    ],
    status: 'active',
    application_url: 'https://saubhagya.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'energy-003',
    name: 'PM Surya Ghar Muft Bijli Yojana',
    name_hi: 'पीएम सूर्य घर मुफ्त बिजली योजना',
    description:
      'Provides subsidy of Rs. 30,000 to Rs. 78,000 for rooftop solar panel installation (1–3 kW) for residential households. Aims to provide 300 units of free electricity per month through solar energy to 1 crore households.',
    description_hi:
      'आवासीय परिवारों के लिए रूफटॉप सोलर पैनल (1-3 kW) पर ₹30,000 से ₹78,000 की सब्सिडी। प्रति माह 300 यूनिट मुफ्त बिजली का लक्ष्य।',
    ministry: 'Ministry of New & Renewable Energy',
    type: 'central',
    benefits: '₹30,000–₹78,000 subsidy on rooftop solar; 300 units free electricity/month',
    eligibility_criteria: {
      gender: 'any',
    },
    documents_required: [
      'Aadhaar Card',
      'Electricity Bill',
      'Bank Account Details',
      'Roof Ownership Proof',
      'Passport-size Photograph',
    ],
    status: 'active',
    application_url: 'https://pmsuryaghar.gov.in',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

// ─── Derived Exports ───────────────────────────────────────────────────────

/** All unique categories derived from scheme IDs (agri, health, housing, etc.) */
export const SCHEME_CATEGORIES: string[] = [
  'Agriculture',
  'Health',
  'Housing',
  'Education',
  'Women & Child',
  'Pension & Insurance',
  'Employment & Skill Development',
  'Financial Inclusion',
  'Rural Development',
  'Senior Citizens',
  'Food Security',
  'Energy & Utilities',
];

/** Internal map from ID prefix to category label */
const PREFIX_TO_CATEGORY: Record<string, string> = {
  agri: 'Agriculture',
  health: 'Health',
  housing: 'Housing',
  edu: 'Education',
  women: 'Women & Child',
  pension: 'Pension & Insurance',
  employ: 'Employment & Skill Development',
  finance: 'Financial Inclusion',
  rural: 'Rural Development',
  senior: 'Senior Citizens',
  food: 'Food Security',
  energy: 'Energy & Utilities',
};

/** Resolve the display category for a scheme based on its ID prefix. */
function getCategoryForScheme(scheme: GovernmentScheme): string {
  const prefix = scheme.id.split('-')[0];
  return PREFIX_TO_CATEGORY[prefix] ?? 'Other';
}

// ─── Helper Functions ──────────────────────────────────────────────────────

/**
 * Returns all schemes that belong to the given category.
 * Category matching is case-insensitive.
 */
export function getSchemesByCategory(category: string): GovernmentScheme[] {
  const normalised = category.toLowerCase();
  return GOVERNMENT_SCHEMES.filter(
    (s) => getCategoryForScheme(s).toLowerCase() === normalised
  );
}

/**
 * Full-text search across scheme name, name_hi, description, ministry,
 * benefits, and documents_required. Returns matching schemes sorted by
 * relevance (number of field hits).
 */
export function searchSchemes(query: string): GovernmentScheme[] {
  if (!query || !query.trim()) return [...GOVERNMENT_SCHEMES];

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  const scored = GOVERNMENT_SCHEMES.map((scheme) => {
    const haystack = [
      scheme.name,
      scheme.name_hi ?? '',
      scheme.description,
      scheme.description_hi ?? '',
      scheme.ministry,
      scheme.benefits,
      getCategoryForScheme(scheme),
      ...scheme.documents_required,
      ...(scheme.eligibility_criteria.occupations ?? []),
      ...(scheme.eligibility_criteria.categories ?? []),
      ...(scheme.eligibility_criteria.states ?? []),
    ]
      .join(' ')
      .toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (haystack.includes(term)) score += 1;
    }
    return { scheme, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.scheme);
}

/** Total number of schemes in the database. */
export function getSchemeCount(): number {
  return GOVERNMENT_SCHEMES.length;
}

/** Get the display category label for a given scheme. */
export { getCategoryForScheme };
