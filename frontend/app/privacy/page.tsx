import { Footer } from "@/components/landingpage/footer"
import { Header } from "@/components/landingpage/header"
import { Eye, FileText, Lock, Shield } from "lucide-react"

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto max-w-4xl text-center">
                        <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-primary/10 mb-6">
                            <Shield className="size-10 text-primary" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
                            Privacy <span className="text-primary">Policy</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
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
                            {/* Introduction */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <FileText className="size-6 text-primary" />
                                    Introduction
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Welcome to Briefly. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                                </p>
                            </div>

                            {/* Information We Collect */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Eye className="size-6 text-primary" />
                                    Information We Collect
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">Account Information</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            When you create an account, we collect your email address, name (if provided), and profile picture (if you sign in with OAuth providers like Google or Facebook). If you sign up with email and password, we securely store a hashed version of your password.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">Study Materials</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            We process the text content you provide to generate flashcards, summaries, study guides, and quizzes. This content is processed by our AI systems to create your study materials but is not stored permanently unless you explicitly save it.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">Usage Data</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            We collect information about how you interact with our service, including pages visited, features used, and timestamps. This helps us improve our service and user experience.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">Technical Information</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            We automatically collect certain technical information, including your IP address, browser type, device information, and operating system. This information is used for security purposes and service optimization.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* How We Use Your Information */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Lock className="size-6 text-primary" />
                                    How We Use Your Information
                                </h2>
                                <ul className="space-y-3 text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>To provide, maintain, and improve our services</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>To process your requests and generate study materials</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>To authenticate your account and ensure security</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>To communicate with you about your account and our services</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>To detect, prevent, and address technical issues and security threats</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>To analyze usage patterns and improve user experience</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Data Sharing and Disclosure */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Shield className="size-6 text-primary" />
                                    Data Sharing and Disclosure
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                                </p>
                                <ul className="space-y-3 text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong className="text-foreground">Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our service, such as cloud hosting providers and AI service providers. These providers are contractually obligated to protect your information.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong className="text-foreground">Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests, such as court orders or subpoenas.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong className="text-foreground">Protection of Rights:</strong> We may share information to protect our rights, privacy, safety, or property, or that of our users.</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Data Security */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Lock className="size-6 text-primary" />
                                    Data Security
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    We implement industry-standard security measures to protect your information:
                                </p>
                                <ul className="space-y-3 text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>Encryption of data in transit using SSL/TLS protocols</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>Secure password storage using industry-standard hashing algorithms</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>Regular security audits and updates</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>Access controls and authentication mechanisms</span>
                                    </li>
                                </ul>
                                <p className="text-muted-foreground leading-relaxed mt-4">
                                    However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
                                </p>
                            </div>

                            {/* Your Rights */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Shield className="size-6 text-primary" />
                                    Your Rights
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    You have the following rights regarding your personal information:
                                </p>
                                <ul className="space-y-3 text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong className="text-foreground">Access:</strong> You can request access to your personal information</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong className="text-foreground">Correction:</strong> You can update your profile information at any time</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong className="text-foreground">Deletion:</strong> You can request deletion of your account and associated data</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span><strong className="text-foreground">Opt-out:</strong> You can opt out of certain data collection practices</span>
                                    </li>
                                </ul>
                                <p className="text-muted-foreground leading-relaxed mt-4">
                                    To exercise these rights, please contact us at <a href="mailto:privacy@briefly.app" className="text-primary hover:underline">privacy@briefly.app</a>.
                                </p>
                            </div>

                            {/* Cookies */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <FileText className="size-6 text-primary" />
                                    Cookies and Tracking
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We use cookies and similar tracking technologies to maintain your session, authenticate your account, and improve our service. We use httpOnly cookies for authentication tokens to enhance security. You can control cookies through your browser settings, but disabling cookies may affect your ability to use our service.
                                </p>
                            </div>

                            {/* Children's Privacy */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Shield className="size-6 text-primary" />
                                    Children's Privacy
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                                </p>
                            </div>

                            {/* Changes to Privacy Policy */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <FileText className="size-6 text-primary" />
                                    Changes to This Privacy Policy
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                                </p>
                            </div>

                            {/* Contact */}
                            <div className="p-6 rounded-xl border border-border bg-gradient-to-br from-primary/5 to-accent/5">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Shield className="size-6 text-primary" />
                                    Contact Us
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    If you have any questions about this Privacy Policy, please contact us at{" "}
                                    <a href="mailto:privacy@briefly.app" className="text-primary hover:underline">
                                        privacy@briefly.app
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





