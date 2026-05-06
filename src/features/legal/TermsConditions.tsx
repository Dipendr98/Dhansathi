import { useNavigate } from 'react-router-dom';

export default function TermsConditions() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
            <div className="h-1 flex">
                <div className="flex-1 bg-saffron" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-india-green" />
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-primary hover:text-primary/80 mb-8 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span className="font-medium">Back</span>
                </button>

                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-outline-variant/20">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-saffron via-white to-india-green rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-sky-900 font-black text-xl">D</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-headline font-bold text-primary">Terms & Conditions</h1>
                            <p className="text-on-surface-variant text-sm">Last updated: March 29, 2026</p>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none space-y-6 text-on-surface-variant leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">1. Acceptance of Terms</h2>
                            <p>By accessing or using DhanSathi ("the Platform"), operated by Digital Sovereign Financial Services ("Company", "we", "us"), you agree to be bound by these Terms and Conditions. If you disagree with any part, you may not access the Platform.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">2. Description of Service</h2>
                            <p>DhanSathi is India's Financial Intelligence Platform that provides:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li><strong>Government Scheme Discovery:</strong> Aggregated information about central and state government schemes, subsidies, and benefits</li>
                                <li><strong>Stock Market Screening:</strong> Real-time NSE/BSE stock data, technical indicators, and screening tools</li>
                                <li><strong>AI Financial Advisory:</strong> DhanMitra AI simulator and Ask DhanSathi chatbot for financial guidance</li>
                                <li><strong>Crossover Engine:</strong> SIP calculator and investment projection tools</li>
                                <li><strong>Stock Alerts:</strong> Price and technical indicator notifications</li>
                                <li><strong>Trading Education:</strong> Beginner-friendly tools, glossary, and learning resources</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">3. Important Disclaimers</h2>
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="font-bold text-red-800 mb-2">⚠️ NOT SEBI REGISTERED</p>
                                <p className="text-red-700">DhanSathi is NOT a SEBI-registered investment advisor, research analyst, or stockbroker. The Platform provides educational and informational content only.</p>
                            </div>
                            <ul className="list-disc pl-6 space-y-1 mt-4">
                                <li>All stock data, simulations, and AI recommendations are for <strong>educational purposes only</strong></li>
                                <li>Nothing on this Platform constitutes investment advice, financial advice, or trading advice</li>
                                <li>Past performance does not guarantee future results</li>
                                <li>Users should consult a SEBI-registered advisor before making investment decisions</li>
                                <li>We are not responsible for any financial losses incurred based on information from this Platform</li>
                                <li>AI-generated responses may contain errors and should not be relied upon as sole decision-making tools</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">4. User Accounts</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>You must be at least 18 years old to create an account</li>
                                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                                <li>You must provide accurate and complete information during registration</li>
                                <li>One account per person; multiple accounts may be terminated</li>
                                <li>You are responsible for all activities under your account</li>
                                <li>Notify us immediately of any unauthorized access</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">5. Subscription Plans</h2>
                            <h3 className="text-lg font-semibold text-on-surface mt-4 mb-2">5.1 Free Plan</h3>
                            <p>Includes limited access to stock screening, scheme discovery, and AI features with daily credit limits.</p>
                            <h3 className="text-lg font-semibold text-on-surface mt-4 mb-2">5.2 Pro Plan</h3>
                            <p>Paid subscription with enhanced features, higher credit limits, and priority support. Pricing is displayed on the Platform.</p>
                            <h3 className="text-lg font-semibold text-on-surface mt-4 mb-2">5.3 Payment & Refunds</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Payments are processed securely through Razorpay</li>
                                <li>Subscriptions auto-renew unless cancelled before the renewal date</li>
                                <li>Refunds are processed as per our refund policy within 7 business days</li>
                                <li>No refunds for partial month usage after cancellation</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">6. Acceptable Use</h2>
                            <p>You agree NOT to:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Use the Platform for any illegal purpose</li>
                                <li>Scrape, crawl, or use automated tools to extract data</li>
                                <li>Redistribute, resell, or commercially exploit Platform content</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Upload malicious code or interfere with Platform operations</li>
                                <li>Impersonate another person or entity</li>
                                <li>Use the Platform to manipulate stock markets or engage in insider trading</li>
                                <li>Share your account credentials with others</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">7. Intellectual Property</h2>
                            <p>All content, features, and functionality of DhanSathi — including but not limited to text, graphics, logos, icons, algorithms, AI models, and software — are owned by Digital Sovereign Financial Services and protected by Indian and international copyright, trademark, and intellectual property laws.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">8. Third-Party Data</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Stock market data is sourced from Yahoo Finance and NSE/BSE feeds</li>
                                <li>Government scheme information is aggregated from official government portals</li>
                                <li>We do not guarantee the accuracy, completeness, or timeliness of third-party data</li>
                                <li>Third-party services have their own terms and privacy policies</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">9. Limitation of Liability</h2>
                            <p>To the maximum extent permitted by Indian law:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>DhanSathi is provided "AS IS" without warranties of any kind</li>
                                <li>We shall not be liable for any indirect, incidental, special, or consequential damages</li>
                                <li>Our total liability shall not exceed the amount paid by you in the last 12 months</li>
                                <li>We are not liable for losses arising from investment decisions made using our Platform</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">10. Termination</h2>
                            <p>We may terminate or suspend your account immediately, without prior notice, for:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Violation of these Terms</li>
                                <li>Fraudulent or illegal activity</li>
                                <li>Non-payment of subscription fees</li>
                                <li>Any reason at our sole discretion</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">11. Dispute Resolution</h2>
                            <p>Any disputes arising from these Terms shall be resolved through:</p>
                            <ol className="list-decimal pl-6 space-y-1">
                                <li>Good faith negotiation between the parties</li>
                                <li>Mediation under the Mediation Act, 2023</li>
                                <li>Arbitration under the Arbitration and Conciliation Act, 1996</li>
                            </ol>
                            <p className="mt-2">The seat of arbitration shall be India, and proceedings shall be in English or Hindi.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">12. Governing Law</h2>
                            <p>These Terms are governed by the laws of India. Courts in India shall have exclusive jurisdiction over any disputes.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-on-surface mt-8 mb-3">13. Contact</h2>
                            <div className="bg-sky-50 rounded-xl p-4 mt-2">
                                <p><strong>DhanSathi - Digital Sovereign Financial Services</strong></p>
                                <p>Email: legal@dhansathi.in</p>
                                <p>Support: support@dhansathi.in</p>
                            </div>
                        </section>
                    </div>
                </div>

                <p className="text-center text-on-surface-variant/60 text-sm mt-8">© 2024 Digital Sovereign Financial Services. All rights reserved.</p>
            </div>
        </div>
    );
}