-- DhanSathi: Seed 20 Real Indian Government Schemes
-- Each scheme includes Hindi name, eligibility criteria JSONB, documents, and application URLs

INSERT INTO public.government_schemes (name, name_hi, description, ministry, scheme_type, benefit_amount, eligibility_criteria, documents_required, application_url, is_active, is_verified, states) VALUES

-- 1. PM-KISAN
(
  'PM-KISAN Samman Nidhi',
  'प्रधानमंत्री किसान सम्मान निधि',
  'Direct income support of Rs 6,000 per year to small and marginal farmer families, paid in three equal installments of Rs 2,000 each.',
  'Ministry of Agriculture & Farmers Welfare',
  'direct_benefit',
  'Rs 6,000/year (3 installments of Rs 2,000)',
  '{"min_age": 18, "max_age": null, "categories": ["General", "OBC", "SC", "ST", "EWS"], "max_income": null, "gender": null, "states": [], "occupations": ["Farmer", "Agriculture"], "bpl_only": false, "disability": null, "land_required": true, "max_land_hectares": 2}',
  ARRAY['Aadhaar Card', 'Land Records / Khasra-Khatauni', 'Bank Account Details', 'Mobile Number'],
  'https://pmkisan.gov.in/',
  true, true, ARRAY[]::text[]
),

-- 2. PM Awas Yojana (Gramin)
(
  'Pradhan Mantri Awas Yojana - Gramin',
  'प्रधानमंत्री आवास योजना - ग्रामीण',
  'Financial assistance for construction of pucca house with basic amenities to all houseless and those living in kutcha/dilapidated houses in rural areas.',
  'Ministry of Rural Development',
  'subsidy',
  'Rs 1,20,000 (Plain) / Rs 1,30,000 (Hilly/IAP/Difficult areas)',
  '{"min_age": 18, "max_age": null, "categories": ["SC", "ST", "OBC", "EWS"], "max_income": 300000, "gender": null, "states": [], "occupations": [], "bpl_only": true, "disability": null, "houseless": true}',
  ARRAY['Aadhaar Card', 'BPL Certificate', 'Income Certificate', 'Land Documents', 'Bank Account', 'Photograph'],
  'https://pmayg.nic.in/',
  true, true, ARRAY[]::text[]
),

-- 3. Ayushman Bharat (PM-JAY)
(
  'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana',
  'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
  'Health insurance coverage of Rs 5 lakh per family per year for secondary and tertiary care hospitalization to poor and vulnerable families.',
  'Ministry of Health and Family Welfare',
  'insurance',
  'Rs 5,00,000/year health cover per family',
  '{"min_age": null, "max_age": null, "categories": ["SC", "ST", "OBC", "EWS"], "max_income": 200000, "gender": null, "states": [], "occupations": [], "bpl_only": true, "disability": null, "secc_listed": true}',
  ARRAY['Aadhaar Card', 'Ration Card', 'SECC Database Entry', 'Mobile Number'],
  'https://pmjay.gov.in/',
  true, true, ARRAY[]::text[]
),

-- 4. Atal Pension Yojana
(
  'Atal Pension Yojana',
  'अटल पेंशन योजना',
  'Guaranteed minimum monthly pension of Rs 1,000 to Rs 5,000 to subscribers at the age of 60 years. Government co-contributes 50% of the total contribution.',
  'Ministry of Finance',
  'pension',
  'Rs 1,000 to Rs 5,000/month pension after age 60',
  '{"min_age": 18, "max_age": 40, "categories": ["General", "OBC", "SC", "ST", "EWS"], "max_income": null, "gender": null, "states": [], "occupations": [], "bpl_only": false, "disability": null, "unorganized_sector": true}',
  ARRAY['Aadhaar Card', 'Bank/Post Office Savings Account', 'Mobile Number'],
  'https://www.npscra.nsdl.co.in/scheme-details.php',
  true, true, ARRAY[]::text[]
),

-- 5. PM MUDRA Yojana
(
  'Pradhan Mantri MUDRA Yojana',
  'प्रधानमंत्री मुद्रा योजना',
  'Loans up to Rs 10 lakh to non-corporate, non-farm small/micro enterprises. Three categories: Shishu (up to Rs 50K), Kishore (Rs 50K-5L), Tarun (Rs 5L-10L).',
  'Ministry of Finance',
  'loan',
  'Up to Rs 10,00,000 (Shishu/Kishore/Tarun)',
  '{"min_age": 18, "max_age": null, "categories": ["General", "OBC", "SC", "ST", "EWS"], "max_income": null, "gender": null, "states": [], "occupations": ["Self-employed", "Business", "Entrepreneur", "Shopkeeper", "Vendor"], "bpl_only": false, "disability": null}',
  ARRAY['Aadhaar Card', 'PAN Card', 'Business Plan/Proposal', 'Identity Proof', 'Address Proof', 'Caste Certificate (if applicable)', 'Photographs'],
  'https://www.mudra.org.in/',
  true, true, ARRAY[]::text[]
),

-- 6. PM Ujjwala Yojana
(
  'Pradhan Mantri Ujjwala Yojana',
  'प्रधानमंत्री उज्ज्वला योजना',
  'Free LPG connections to women from BPL households. Rs 1,600 subsidy for each LPG connection covering security deposit, regulator, and gas hose.',
  'Ministry of Petroleum and Natural Gas',
  'direct_benefit',
  'Free LPG connection + Rs 1,600 subsidy',
  '{"min_age": 18, "max_age": null, "categories": ["SC", "ST", "OBC", "EWS"], "max_income": null, "gender": "Female", "states": [], "occupations": [], "bpl_only": true, "disability": null}',
  ARRAY['BPL Card / Ration Card', 'Aadhaar Card', 'Bank Account (Jan Dhan preferred)', 'Passport Size Photograph', 'Address Proof'],
  'https://www.pmuy.gov.in/',
  true, true, ARRAY[]::text[]
),

-- 7. Sukanya Samriddhi Yojana
(
  'Sukanya Samriddhi Yojana',
  'सुकन्या समृद्धि योजना',
  'Small savings scheme for girl children with attractive interest rate and tax benefits under Section 80C. Account matures when girl turns 21.',
  'Ministry of Finance',
  'savings',
  'Interest rate ~8% p.a. + Tax benefits under 80C',
  '{"min_age": 0, "max_age": 10, "categories": ["General", "OBC", "SC", "ST", "EWS"], "max_income": null, "gender": "Female", "states": [], "occupations": [], "bpl_only": false, "disability": null, "for_girl_child": true, "max_girls": 2}',
  ARRAY['Birth Certificate of Girl Child', 'Identity Proof of Parent/Guardian', 'Address Proof of Parent/Guardian', 'Photographs'],
  'https://www.india.gov.in/sukanya-samriddhi-yojna',
  true, true, ARRAY[]::text[]
),

-- 8. PM Jan Dhan Yojana
(
  'Pradhan Mantri Jan Dhan Yojana',
  'प्रधानमंत्री जन धन योजना',
  'Financial inclusion program providing universal access to banking facilities with zero balance account, RuPay debit card, and Rs 2 lakh accident insurance.',
  'Ministry of Finance',
  'financial_inclusion',
  'Zero balance bank account + RuPay card + Rs 2L accident insurance + Rs 30K life cover',
  '{"min_age": 10, "max_age": null, "categories": ["General", "OBC", "SC", "ST", "EWS"], "max_income": null, "gender": null, "states": [], "occupations": [], "bpl_only": false, "disability": null, "no_bank_account": true}',
  ARRAY['Aadhaar Card / Voter ID / Driving License', 'Passport Size Photograph', 'Address Proof (if Aadhaar not available)'],
  'https://pmjdy.gov.in/',
  true, true, ARRAY[]::text[]
),

-- 9. PM Fasal Bima Yojana
(
  'Pradhan Mantri Fasal Bima Yojana',
  'प्रधानमंत्री फसल बीमा योजना',
  'Crop insurance scheme providing financial support to farmers suffering crop loss/damage due to natural calamities, pests, and diseases.',
  'Ministry of Agriculture & Farmers Welfare',
  'insurance',
  'Crop insurance at 2% premium (Kharif), 1.5% (Rabi), 5% (Horticulture)',
  '{"min_age": 18, "max_age": null, "categories": ["General", "OBC", "SC", "ST", "EWS"], "max_income": null, "gender": null, "states": [], "occupations": ["Farmer", "Agriculture"], "bpl_only": false, "disability": null, "land_required": true}',
  ARRAY['Aadhaar Card', 'Bank Account Details', 'Land Records', 'Sowing Certificate', 'Crop Details'],
  'https://pmfby.gov.in/',
  true, true, ARRAY[]::text[]
),

-- 10. Stand Up India
(
  'Stand Up India Scheme',
  'स्टैंड अप इंडिया योजना',
  'Bank loans between Rs 10 lakh and Rs 1 crore to at least one SC/ST borrower and one woman borrower per bank branch for setting up greenfield enterprises.',
  'Ministry of Finance',
  'loan',
  'Rs 10 lakh to Rs 1 crore loan',
  '{"min_age": 18, "max_age": null, "categories": ["SC", "ST"], "max_income": null, "gender": "Female", "states": [], "occupations": ["Entrepreneur", "Business"], "bpl_only": false, "disability": null, "sc_st_or_woman": true, "greenfield_enterprise": true}',
  ARRAY['Aadhaar Card', 'PAN Card', 'Caste Certificate (SC/ST)', 'Business Plan', 'Address Proof', 'Identity Proof', 'Photographs', 'IT Returns (if available)'],
  'https://www.standupmitra.in/',
  true, true, ARRAY[]::text[]
),

-- 11. PM Vishwakarma
(
  'PM Vishwakarma Yojana',
  'प्रधानमंत्री विश्वकर्मा योजना',
  'End-to-end support for traditional artisans and craftspeople through skill training, toolkit incentive, credit support, and digital payment facilitation.',
  'Ministry of Micro, Small and Medium Enterprises',
  'skill_and_credit',
  'Skill training + Rs 15,000 toolkit + Collateral-free loan up to Rs 3 lakh',
  '{"min_age": 18, "max_age": null, "categories": ["General", "OBC", "SC", "ST", "EWS"], "max_income": null, "gender": null, "states": [], "occupations": ["Carpenter", "Blacksmith", "Goldsmith", "Potter", "Sculptor", "Cobbler", "Tailor", "Weaver", "Artisan", "Craftsperson", "Mason", "Boat Maker", "Locksmith", "Basket Maker", "Doll Maker", "Barber", "Garland Maker", "Washerman"], "bpl_only": false, "disability": null, "traditional_artisan": true}',
  ARRAY['Aadhaar Card', 'Bank Account Details', 'Mobile Number', 'Skill Verification Certificate from Gram Panchayat/ULB', 'Photographs'],
  'https://pmvishwakarma.gov.in/',
  true, true, ARRAY[]::text[]
),

-- 12. MGNREGA
(
  'Mahatma Gandhi National Rural Employment Guarantee Act',
  'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम (मनरेगा)',
  'Legal guarantee of 100 days of wage employment per year to every rural household whose adult members volunteer to do unskilled manual work.',
  'Ministry of Rural Development',
  'employment',
  '100 days guaranteed wage employment (Rs 267-349/day varies by state)',
  '{"min_age": 18, "max_age": null, "categories": ["General", "OBC", "SC", "ST", "EWS"], "max_income": null, "gender": null, "states": [], "occupations": [], "bpl_only": false, "disability": null, "rural_only": true}',
  ARRAY['Aadhaar Card', 'Photograph', 'Bank/Post Office Account', 'Job Card (issued by Gram Panchayat)'],
  'https://nrega.nic.in/',
  true, true, ARRAY[]::text[]
),

-- 13. Startup India
(
  'Startup India Initiative',
  'स्टार्टअप इंडिया पहल',
  'Tax exemptions for 3 consecutive years, self-certification compliance, patent fee rebate, easy winding up, and Fund of Funds support for DPIIT-recognized startups.',
  'Ministry of Commerce and Industry (DPIIT)',
  'startup_support',
  'Tax exemption (3 yrs) + Patent rebate (80%) + Fund of Funds access',
  '{"min_age": 18, "max_age": null, "categories": ["General", "OBC", "SC", "ST", "EWS"], "max_income": null, "gender": null, "states": [], "occupations": ["Entrepreneur", "Startup Founder"], "bpl_only": false, "disability": null, "entity_age_max_years": 10, "turnover_max_cr": 100}',
  ARRAY['Certificate of Incorporation', 'PAN Card of Entity', 'Aadhaar of Founder(s)', 'Business Plan / Pitch Deck', 'DPIIT Recognition Certificate'],
  'https://www.startupindia.gov.in/',
  true, true, ARRAY[]::text[]
),

-- 14. PM SVANidhi
(
  'PM Street Vendors AtmaNirbhar Nidhi',
  'प्रधानमंत्री स्ट्रीट वेंडर्स आत्मनिर्भर निधि (पीएम स्वनिधि)',
  'Micro-credit facility for street vendors. Working capital loan of Rs 10,000 (1st), Rs 20,000 (2nd), Rs 50,000 (3rd cycle) with 7% interest subsidy.',
  'Ministry of Housing and Urban Affairs',
  'loan',
  'Rs 10,000 to Rs 50,000 (3 cycles) + 7% interest subsidy + cashback on digital payments',
  '{"min_age": 18, "max_age": null, "categories": ["General", "OBC", "SC", "ST", "EWS"], "max_income": null, "gender": null, "states": [], "occupations": ["Street Vendor", "Hawker", "Thela Vendor", "Peddler"], "bpl_only": false, "disability": null, "vending_certificate": true}',
  ARRAY['Aadhaar Card', 'Vending Certificate / Letter of Recommendation from ULB', 'Bank Account', 'Photographs', 'Mobile Number'],
  'https://pmsvanidhi.mohua.gov.in/',
  true, true, ARRAY[]::text[]
),

-- 15. National Scholarship Portal
(
  'National Scholarship Portal (Pre-Matric & Post-Matric)',
  'राष्ट्रीय छात्रवृत्ति पोर्टल',
  'Centralized scholarship portal offering pre-matric and post-matric scholarships for SC, ST, OBC, Minority, and EWS students from various central ministries.',
  'Ministry of Electronics and IT / Ministry of Social Justice',
  'scholarship',
  'Varies: Rs 3,500 to Rs 25,000+ per year depending on course and category',
  '{"min_age": null, "max_age": 35, "categories": ["SC", "ST", "OBC", "EWS"], "max_income": 250000, "gender": null, "states": [], "occupations": ["Student"], "bpl_only": false, "disability": null, "student_only": true}',
  ARRAY['Aadhaar Card', 'Income Certificate', 'Caste Certificate', 'Previous Year Marksheet', 'Fee Receipt', 'Bank Account', 'Institution Verification', 'Domicile Certificate'],
  'https://scholarships.gov.in/',
  true, true, ARRAY[]::text[]
),

-- 16. PM Suraksha Bima Yojana
(
  'Pradhan Mantri Suraksha Bima Yojana',
  'प्रधानमंत्री सुरक्षा बीमा योजना',
  'Accidental death and disability insurance cover of Rs 2 lakh at a premium of just Rs 20 per year, auto-debited from bank account.',
  'Ministry of Finance',
  'insurance',
  'Rs 2,00,000 accidental death/disability cover at Rs 20/year premium',
  '{"min_age": 18, "max_age": 70, "categories": ["General", "OBC", "SC", "ST", "EWS"], "max_income": null, "gender": null, "states": [], "occupations": [], "bpl_only": false, "disability": null, "bank_account_required": true}',
  ARRAY['Aadhaar Card', 'Bank Account with auto-debit consent', 'Nominee Details'],
  'https://www.jansuraksha.gov.in/',
  true, true, ARRAY[]::text[]
),

-- 17. PM Jeevan Jyoti Bima Yojana
(
  'Pradhan Mantri Jeevan Jyoti Bima Yojana',
  'प्रधानमंत्री जीवन ज्योति बीमा योजना',
  'Life insurance cover of Rs 2 lakh in case of death due to any reason at a premium of Rs 436 per year, auto-debited from savings account.',
  'Ministry of Finance',
  'insurance',
  'Rs 2,00,000 life cover at Rs 436/year premium',
  '{"min_age": 18, "max_age": 50, "categories": ["General", "OBC", "SC", "ST", "EWS"], "max_income": null, "gender": null, "states": [], "occupations": [], "bpl_only": false, "disability": null, "bank_account_required": true}',
  ARRAY['Aadhaar Card', 'Bank Account with auto-debit consent', 'Nominee Details', 'Self-declaration of good health'],
  'https://www.jansuraksha.gov.in/',
  true, true, ARRAY[]::text[]
),

-- 18. Skill India (PMKVY)
(
  'Pradhan Mantri Kaushal Vikas Yojana (Skill India)',
  'प्रधानमंत्री कौशल विकास योजना (स्किल इंडिया)',
  'Skill certification and training scheme enabling Indian youth to take up industry-relevant skill training and become employable. Includes free training and assessment.',
  'Ministry of Skill Development and Entrepreneurship',
  'skill_training',
  'Free skill training + Rs 8,000 reward on certification + placement assistance',
  '{"min_age": 15, "max_age": 45, "categories": ["General", "OBC", "SC", "ST", "EWS"], "max_income": null, "gender": null, "states": [], "occupations": ["Unemployed", "Student", "Dropout"], "bpl_only": false, "disability": null, "class_10_dropout_eligible": true}',
  ARRAY['Aadhaar Card', 'Bank Account', 'Educational Certificates (if available)', 'Photographs', 'Mobile Number'],
  'https://www.pmkvyofficial.org/',
  true, true, ARRAY[]::text[]
),

-- 19. PM Garib Kalyan Anna Yojana
(
  'Pradhan Mantri Garib Kalyan Anna Yojana',
  'प्रधानमंत्री गरीब कल्याण अन्न योजना',
  'Free foodgrain (5 kg per person per month of rice/wheat) to all beneficiaries covered under the National Food Security Act (NFSA) including AAY and PHH cardholders.',
  'Ministry of Consumer Affairs, Food & Public Distribution',
  'food_security',
  '5 kg free foodgrain per person per month (rice/wheat)',
  '{"min_age": null, "max_age": null, "categories": ["SC", "ST", "OBC", "EWS"], "max_income": null, "gender": null, "states": [], "occupations": [], "bpl_only": true, "disability": null, "ration_card_required": true, "nfsa_beneficiary": true}',
  ARRAY['Ration Card (AAY/PHH)', 'Aadhaar Card', 'Family Details'],
  'https://nfsa.gov.in/',
  true, true, ARRAY[]::text[]
),

-- 20. Kanya Sumangala Yojana (UP)
(
  'Mukhyamantri Kanya Sumangala Yojana',
  'मुख्यमंत्री कन्या सुमंगला योजना',
  'Financial assistance of Rs 25,000 to girl children in Uttar Pradesh in 6 installments from birth to graduation to ensure their education and empowerment.',
  'Department of Women and Child Development, UP',
  'direct_benefit',
  'Rs 25,000 in 6 installments (birth to graduation)',
  '{"min_age": 0, "max_age": null, "categories": ["General", "OBC", "SC", "ST", "EWS"], "max_income": 300000, "gender": "Female", "states": ["Uttar Pradesh"], "occupations": [], "bpl_only": false, "disability": null, "for_girl_child": true, "max_girls": 2, "state_specific": true}',
  ARRAY['Birth Certificate', 'Aadhaar Card of Parent', 'Income Certificate (below Rs 3 lakh)', 'Bank Account (Joint with mother preferred)', 'Domicile Certificate (UP)', 'Photographs', 'Affidavit'],
  'https://mksy.up.gov.in/',
  true, true, ARRAY['Uttar Pradesh']
);
