import { Footer } from "@/components/landingpage/footer"
import { Header } from "@/components/landingpage/header"
import { AlertCircle, CheckCircle, FileText, Scale } from "lucide-react"

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto max-w-4xl text-center">
                        <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-primary/10 mb-6">
                            <Scale className="size-10 text-primary" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
                            Terms of <span className="text-primary">Service</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                            Please read these terms carefully before using Briefly. By using our service, you agree to these terms.
                        </p>
                        <p className="text-sm text-muted-foreground mt-4">
                            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-12 px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto max-w-4xl">
                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                            {/* Acceptance of Terms */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <CheckCircle className="size-6 text-primary" />
                                    Acceptance of Terms
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    By accessing or using Briefly ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
                                </p>
                            </div>

                            {/* Description of Service */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <FileText className="size-6 text-primary" />
                                    Description of Service
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    Briefly is an AI-powered educational platform that provides tools to help students study more effectively, including:
                                </p>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>AI-powered flashcard generation</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>Text summarization tools</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>Study guide generation</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>Quiz creation and practice</span>
                                    </li>
                                </ul>
                            </div>

                            {/* User Accounts */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <FileText className="size-6 text-primary" />
                                    User Accounts
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">Account Creation</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            To use certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">Account Security</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">Account Termination</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any other reason we deem necessary.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Acceptable Use */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <AlertCircle className="size-6 text-primary" />
                                    Acceptable Use
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    You agree not to use the Service:
                                </p>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>For any unlawful purpose or to solicit others to perform unlawful acts</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>To submit false or misleading information</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>To upload or transmit viruses or any other type of malicious code</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>To collect or track the personal information of others</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>To spam, phish, pharm, pretext, spider, crawl, or scrape</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>For any obscene or immoral purpose</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>To interfere with or circumvent the security features of the Service</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Intellectual Property */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <FileText className="size-6 text-primary" />
                                    Intellectual Property
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">Our Content</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            The Service and its original content, features, and functionality are owned by Briefly and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">Your Content</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            You retain ownership of any content you submit to the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content solely for the purpose of providing and improving the Service.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">AI-Generated Content</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Content generated by our AI tools is provided for your educational use. While you may use this content for your studies, you acknowledge that AI-generated content may not be perfect and should be reviewed and verified for accuracy.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Disclaimer of Warranties */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <AlertCircle className="size-6 text-primary" />
                                    Disclaimer of Warranties
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE MAKE NO WARRANTIES, EXPRESSED OR IMPLIED, AND HEREBY DISCLAIM ALL WARRANTIES INCLUDING, WITHOUT LIMITATION:
                                </p>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>That the Service will meet your requirements</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>That the Service will be uninterrupted, timely, secure, or error-free</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>That the results obtained from using the Service will be accurate or reliable</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>That any errors in the Service will be corrected</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Limitation of Liability */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <AlertCircle className="size-6 text-primary" />
                                    Limitation of Liability
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    IN NO EVENT SHALL BRIEFLY, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
                                </p>
                            </div>

                            {/* Indemnification */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Scale className="size-6 text-primary" />
                                    Indemnification
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    You agree to defend, indemnify, and hold harmless Briefly and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).
                                </p>
                            </div>

                            {/* Changes to Terms */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <FileText className="size-6 text-primary" />
                                    Changes to Terms
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                                </p>
                            </div>

                            {/* Governing Law */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Scale className="size-6 text-primary" />
                                    Governing Law
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    These Terms shall be interpreted and governed by the laws of the jurisdiction in which Briefly operates, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                                </p>
                            </div>

                            {/* Contact */}
                            <div className="p-6 rounded-xl border border-border bg-gradient-to-br from-primary/5 to-accent/5">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <FileText className="size-6 text-primary" />
                                    Contact Information
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    If you have any questions about these Terms of Service, please contact us at{" "}
                                    <a href="mailto:legal@briefly.app" className="text-primary hover:underline">
                                        legal@briefly.app
                                    </a>
                                    .
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}


