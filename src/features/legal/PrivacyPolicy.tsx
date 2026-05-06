import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
            {/* Tricolor bar */}
            <div className="h-1 flex">
                <div className="flex-1 bg-saffron" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-india-green" />
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-primary hover:text-primary/80 mb-8 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span className="font-medium">Back</span>
                </button>

                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-outline-variant/20">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-saffron via-white to-india-green rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-sky-900 font-black text-xl">D</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-headline font-bold text-primary">Privacy Policy</h1>
                            <p className="text-on-surface-variant text-sm">Last updated: March 29, 2026</p>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none space-y-6 text-on-surface-variant leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">1. Introduction</h2>
                            <p>
                                DhanSathi ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our financial intelligence platform, including our website, mobile application, and related services (collectively, the "Service").
                            </p>
                            <p>
                                By using DhanSathi, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this privacy policy, please do not access the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">2. Information We Collect</h2>
                            <h3 className="text-lg font-semibold text-on-surface mt-4 mb-2">2.1 Personal Information</h3>
                            <p>We may collect the following personal information:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Full name, email address, and phone number</li>
                                <li>Date of birth, gender, and category (General/SC/ST/OBC)</li>
                                <li>State, district, and pincode</li>
                                <li>Occupation and annual income</li>
                                <li>BPL (Below Poverty Line) status</li>
                                <li>Authentication credentials (encrypted)</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-on-surface mt-4 mb-2">2.2 Financial Information</h3>
                            <p>To provide personalized scheme recommendations and stock analysis:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Government scheme eligibility data</li>
                                <li>Stock watchlist preferences</li>
                                <li>Simulation and trading history within the platform</li>
                                <li>Subscription and payment information (processed securely via Razorpay)</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-on-surface mt-4 mb-2">2.3 Usage Data</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Device information, browser type, and IP address</li>
                                <li>Pages visited, features used, and time spent</li>
                                <li>AI chat interactions (for service improvement)</li>
                                <li>Search queries and stock screening preferences</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">3. How We Use Your Information</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>To provide personalized government scheme recommendations</li>
                                <li>To deliver real-time stock market data and analysis</li>
                                <li>To power AI-driven financial advisory (DhanMitra & Ask DhanSathi)</li>
                                <li>To run stock market simulations and SIP projections</li>
                                <li>To process payments and manage subscriptions</li>
                                <li>To send alerts and notifications about schemes and stocks</li>
                                <li>To improve our services through analytics</li>
                                <li>To comply with legal obligations under Indian law</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">4. Data Security</h2>
                            <p>
                                We implement industry-standard security measures including:
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>End-to-end encryption for data transmission (TLS/SSL)</li>
                                <li>Secure authentication via Supabase with Row Level Security (RLS)</li>
                                <li>Payment processing through PCI-DSS compliant Razorpay</li>
                                <li>Regular security audits and vulnerability assessments</li>
                                <li>Data stored on secure cloud infrastructure within India</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">5. Data Sharing</h2>
                            <p>We do NOT sell your personal data. We may share information with:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li><strong>Service Providers:</strong> Supabase (database), Razorpay (payments), Yahoo Finance API (stock data)</li>
                                <li><strong>Legal Requirements:</strong> When required by Indian law, court order, or government authority</li>
                                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">6. Your Rights</h2>
                            <p>Under the Digital Personal Data Protection Act, 2023 (DPDPA), you have the right to:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Access your personal data</li>
                                <li>Correct inaccurate data</li>
                                <li>Delete your account and associated data</li>
                                <li>Withdraw consent for data processing</li>
                                <li>Data portability</li>
                                <li>Lodge a grievance with the Data Protection Board of India</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">7. Cookies & Tracking</h2>
                            <p>
                                We use essential cookies for authentication and session management. We use analytics cookies to understand usage patterns. You can control cookie preferences through your browser settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">8. Children's Privacy</h2>
                            <p>
                                DhanSathi is not intended for users under 18 years of age. We do not knowingly collect personal information from minors. If you are a parent and believe your child has provided us with personal data, please contact us.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">9. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Continued use of the Service after changes constitutes acceptance.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">10. Contact Us</h2>
                            <p>For privacy-related inquiries or to exercise your rights:</p>
                            <div className="bg-sky-50 rounded-xl p-4 mt-2">
                                <p><strong>DhanSathi - Digital Sovereign Financial Services</strong></p>
                                <p>Email: privacy@dhansathi.in</p>
                                <p>Grievance Officer: Data Protection Officer</p>
                                <p>Address: India</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">11. Governing Law</h2>
                            <p>
                                This Privacy Policy is governed by the laws of India, including the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.
                            </p>
                        </section>
                    </div>
                </div>

                <p className="text-center text-on-surface-variant/60 text-sm mt-8">
                    © 2024 Digital Sovereign Financial Services. All rights reserved.
                </p>
            </div>
        </div>
    );
}