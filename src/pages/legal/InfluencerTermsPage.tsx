import { Link } from "react-router-dom";
import { Rocket, ArrowLeft, FileText, Scale, Shield, Clock, Ban, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import gradientBg from "@/assets/gradient-bg.jpg";
import gradientBgDark from "@/assets/gradient-bg-dark.png";

export function InfluencerTermsPage() {
  const { theme } = useTheme();
  const lastUpdated = "February 1, 2026";

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage: `url(${theme === "dark" ? gradientBgDark : gradientBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Rocket className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">LaunchPad</span>
          </Link>
          <Link to="/creator/login">
            <Button variant="outline" size="sm" className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Creator Portal
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-16">
        <div className="glass rounded-2xl p-8 md:p-12">
          {/* Title Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Terms and Conditions
            </h1>
            <p className="text-lg text-muted-foreground">
              for Influencers & Content Creators
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-muted/30 rounded-xl p-6 mb-10">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Table of Contents
            </h2>
            <nav className="grid md:grid-cols-2 gap-2 text-sm">
              <a href="#scope" className="hover:text-primary transition-colors">1. Scope of Application</a>
              <a href="#subject" className="hover:text-primary transition-colors">2. Subject Matter</a>
              <a href="#obligations" className="hover:text-primary transition-colors">3. Influencer Obligations</a>
              <a href="#compensation" className="hover:text-primary transition-colors">4. Compensation & Payouts</a>
              <a href="#term" className="hover:text-primary transition-colors">5. Term & Termination</a>
              <a href="#confidentiality" className="hover:text-primary transition-colors">6. Confidentiality</a>
              <a href="#liability" className="hover:text-primary transition-colors">7. Liability</a>
              <a href="#data-protection" className="hover:text-primary transition-colors">8. Data Protection</a>
              <a href="#final-provisions" className="hover:text-primary transition-colors">9. Final Provisions</a>
            </nav>
          </div>

          {/* Sections */}
          <div className="space-y-10 text-foreground/90">
            {/* Section 1 */}
            <section id="scope">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">1</span>
                Scope of Application
              </h2>
              <div className="space-y-3 pl-10">
                <p>
                  1.1 These Terms and Conditions (hereinafter "Terms") govern all contractual relationships
                  between PeakForce OÜ (hereinafter "Agency") and the Influencer/Content Creator
                  (hereinafter "Influencer").
                </p>
                <p>
                  1.2 Any deviating, conflicting, or supplementary terms and conditions of the
                  Influencer shall only become part of the contract if and to the extent that the
                  Agency has expressly agreed to their validity in writing.
                </p>
                <p>
                  1.3 These Terms are an integral part of every individual cooperation agreement
                  between the Agency and the Influencer.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="subject">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">2</span>
                Subject Matter
              </h2>
              <div className="space-y-3 pl-10">
                <p>
                  2.1 The subject matter of this agreement is the facilitation of advertising
                  partnerships between the Influencer and advertising clients (hereinafter "Brands")
                  by the Agency, as well as the provision of the LaunchPad platform.
                </p>
                <p>
                  2.2 The Influencer agrees to create promotional content in accordance with the
                  agreed campaign briefs and to publish it on their social media channels.
                </p>
                <p>
                  2.3 The Agency provides the Influencer with access to the Creator Portal,
                  which includes the following features:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Overview of active campaigns and partnerships</li>
                  <li>Management of referral codes and tracking</li>
                  <li>Access to compensation details and payout history</li>
                  <li>Communication with the Agency team</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="obligations">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">3</span>
                Influencer Obligations
              </h2>
              <div className="space-y-3 pl-10">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
                  <h3 className="font-medium flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    The Influencer agrees to:
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>a) Create and publish promotional content according to the brief and within agreed timelines</li>
                    <li>b) Properly disclose all sponsored content as advertising in compliance with applicable laws</li>
                    <li>c) Not make any misleading or false statements about products or services</li>
                    <li>d) Respect the rights of third parties (in particular copyrights, trademark rights, personality rights)</li>
                    <li>e) Provide current and accurate contact and payment information</li>
                    <li>f) Immediately inform the Agency of any changes to their reach or channel status</li>
                  </ul>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <h3 className="font-medium flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                    <Ban className="h-5 w-5" />
                    The Influencer is prohibited from:
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>a) Manipulating reach or engagement metrics (e.g., through bots, fake followers)</li>
                    <li>b) Simultaneous partnerships with direct competitors without prior consent</li>
                    <li>c) Disclosing confidential campaign information to third parties</li>
                    <li>d) Making unauthorized changes to agreed content without prior consultation</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="compensation">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">4</span>
                Compensation & Payouts
              </h2>
              <div className="space-y-3 pl-10">
                <p>
                  4.1 The Influencer's compensation is determined by the individually agreed
                  compensation model as specified in the respective cooperation agreement.
                </p>
                <p>
                  4.2 Possible compensation models include:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Fixed compensation:</strong> One-time payment per content piece or campaign</li>
                  <li><strong>Performance-based:</strong> Commissions based on sales, downloads, or registrations</li>
                  <li><strong>Hybrid:</strong> Combination of fixed fee and performance share</li>
                </ul>
                <p>
                  4.3 Payouts are processed monthly by the 15th of the following month, provided the
                  minimum payout threshold of EUR 50.00 has been reached. If the threshold is not met,
                  the balance will be carried over to the following month.
                </p>
                <p>
                  4.4 Payouts are made to the bank account registered by the Influencer in the Creator Portal.
                  For payouts outside the SEPA area, bank fees may apply and will be deducted from the payout amount.
                </p>
                <p>
                  4.5 The Influencer is solely responsible for the proper taxation of their earnings.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="term">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">5</span>
                Term & Termination
              </h2>
              <div className="space-y-3 pl-10">
                <p>
                  5.1 The framework agreement is concluded for an indefinite period and may be
                  terminated by either party with 30 days' notice to the end of a calendar month.
                </p>
                <p>
                  5.2 Individual campaign agreements have the duration specified in the respective agreement.
                </p>
                <p>
                  5.3 The right to extraordinary termination for good cause remains unaffected.
                  Good cause exists in particular in the event of:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Violation of disclosure requirements</li>
                  <li>Manipulation of reach or performance data</li>
                  <li>Serious damage to the reputation of the Agency or Brands</li>
                  <li>Insolvency or material deterioration of financial circumstances</li>
                </ul>
                <p>
                  5.4 Upon termination, already concluded campaign agreements remain unaffected
                  and must be fulfilled according to their terms.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="confidentiality">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">6</span>
                Confidentiality
              </h2>
              <div className="space-y-3 pl-10">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                    <p className="text-sm">
                      The Influencer agrees to keep strictly confidential all confidential information
                      that becomes known to them in the course of the collaboration.
                    </p>
                  </div>
                </div>
                <p>
                  6.1 The following are considered confidential:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Information about planned but not yet published campaigns</li>
                  <li>Compensation agreements and terms</li>
                  <li>Trade secrets of the Brands and the Agency</li>
                  <li>Strategic information and business plans</li>
                </ul>
                <p>
                  6.2 The confidentiality obligation shall continue for a period of two years
                  following the termination of the agreement.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="liability">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">7</span>
                Liability
              </h2>
              <div className="space-y-3 pl-10">
                <p>
                  7.1 The Influencer shall be liable for all damages arising from the breach of
                  their contractual obligations, in particular for:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Violations of advertising disclosure requirements</li>
                  <li>Infringement of third-party rights in created content</li>
                  <li>False or misleading product claims</li>
                </ul>
                <p>
                  7.2 The Influencer shall indemnify and hold harmless the Agency against all
                  third-party claims arising from a breach of their contractual obligations.
                </p>
                <p>
                  7.3 The Agency's liability is limited to intent and gross negligence,
                  except in the case of breach of material contractual obligations.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <p className="text-sm">
                      <strong>Important Notice:</strong> The Agency assumes no liability for
                      technical disruptions of social media platforms or changes to their
                      algorithms that may affect the reach of content.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="data-protection">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">8</span>
                Data Protection
              </h2>
              <div className="space-y-3 pl-10">
                <p>
                  8.1 The processing of personal data is carried out in accordance with the
                  General Data Protection Regulation (GDPR) and applicable data protection laws.
                </p>
                <p>
                  8.2 The following data is processed by the Agency:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Contact details (name, email, phone, address)</li>
                  <li>Bank details for payouts</li>
                  <li>Social media handles and public statistics</li>
                  <li>Campaign performance data</li>
                </ul>
                <p>
                  8.3 Data is used exclusively for contract fulfillment, billing, and
                  campaign optimization purposes.
                </p>
                <p>
                  8.4 The Influencer has the right at any time to request information about,
                  rectification, deletion, and restriction of processing of their data.
                </p>
                <p>
                  8.5 Further information on data protection can be found in our separate
                  Privacy Policy at{" "}
                  <Link to="/legal/privacy" className="text-primary hover:underline">
                    launchpad.app/legal/privacy
                  </Link>.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="final-provisions">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">9</span>
                Final Provisions
              </h2>
              <div className="space-y-3 pl-10">
                <p>
                  9.1 Amendments and additions to these Terms must be made in writing.
                  This also applies to the waiver of this written form requirement.
                </p>
                <p>
                  9.2 Should any provision of these Terms be or become invalid, the validity
                  of the remaining provisions shall not be affected. In place of the invalid
                  provision, a regulation shall apply that comes closest to the economic
                  purpose of the invalid provision.
                </p>
                <p>
                  9.3 The law of the Republic of Estonia shall apply exclusively,
                  excluding the UN Convention on Contracts for the International Sale of Goods.
                </p>
                <p>
                  9.4 The exclusive place of jurisdiction for all disputes arising from or
                  in connection with this agreement shall be the registered office of the Agency,
                  to the extent permitted by law.
                </p>
                <div className="bg-muted/50 rounded-xl p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">Last Update</p>
                      <p>These Terms were last updated on {lastUpdated}.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Contact Section */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Questions about these Terms?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                For questions regarding these Terms and Conditions, please contact:
              </p>
              <a
                href="mailto:admin@prometheus.coach"
                className="text-primary hover:underline font-medium"
              >
                admin@prometheus.coach
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-border/50 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PeakForce OÜ. All rights reserved.</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link to="/legal/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/legal/imprint" className="hover:text-primary transition-colors">
              Imprint
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
