import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Container, SectionLabel } from "@/components/ui";

const EFFECTIVE_DATE = "April 1, 2026";

export const metadata: Metadata = {
  title: "Legal | ADHD Capital",
  description:
    "Privacy policy and terms of use for ADHD Capital—how we handle research, communications, and discretionary funding-related interactions.",
};

const sectionClass =
  "max-w-3xl [&_h2]:mt-12 [&_h2]:scroll-mt-28 [&_h2]:border-b [&_h2]:border-zinc-200 [&_h2]:pb-2 [&_h2]:font-sans [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-zinc-950 [&_h2]:first:mt-0 [&_h3]:mt-8 [&_h3]:font-sans [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_p]:mt-4 [&_p]:font-serif-display [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-zinc-700 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:font-serif-display [&_ul]:text-sm [&_ul]:text-zinc-700 [&_li]:leading-relaxed [&_a]:text-cyan-800 [&_a]:underline [&_a]:decoration-cyan-800/30 [&_a]:underline-offset-4";

export default function LegalPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <Container className="border-b border-zinc-200 py-14 md:py-20">
          <SectionLabel>Legal</SectionLabel>
          <h1 className="mt-2 max-w-2xl font-sans text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Privacy &amp; terms
          </h1>
          <p className="mt-4 max-w-2xl font-serif-display text-base leading-relaxed text-zinc-700">
            These documents explain how ADHD Capital (&quot;ADHD Capital,&quot; &quot;we,&quot; &quot;us,&quot; or
            &quot;our&quot;) treats personal data and the rules that apply when you use our website and
            interact with our research and business-development process.
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Effective {EFFECTIVE_DATE}
          </p>

          <nav
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-zinc-200 pt-8 font-mono text-[11px] uppercase tracking-[0.14em]"
            aria-label="On this page"
          >
            <a href="#privacy" className="text-cyan-800 transition-colors hover:text-cyan-950">
              Privacy policy →
            </a>
            <a href="#terms" className="text-cyan-800 transition-colors hover:text-cyan-950">
              Terms of use →
            </a>
          </nav>

          <section
            id="privacy"
            aria-labelledby="privacy-heading"
            className={`${sectionClass} mt-14 border-t border-zinc-200 pt-14`}
          >
            <h2 id="privacy-heading">Privacy policy</h2>

            <h3>1. Who this notice covers</h3>
            <p>
              This Privacy Policy applies to personal data we process when you visit our public website
              (including pages under domains we operate, such as paths served from{" "}
              <span className="font-mono text-[11px] text-zinc-800">adhdcapital.xyz</span> and related
              properties we link as official), communicate with us by email or other channels we
              control, or otherwise engage with our research and discretionary capital workflow. It
              is designed to align with the transparency requirements of the EU/UK General Data
              Protection Regulation (&quot;GDPR&quot;) and comparable U.S. state privacy statutes, without
              waiving any rights we may have under other laws.
            </p>

            <h3>2. Categories of personal data</h3>
            <p>Depending on how you interact with us, we may process:</p>
            <ul>
              <li>
                <strong className="font-medium text-zinc-800">Identifiers and contact data:</strong>{" "}
                name, email address, social handles, employer or project name, and similar details you
                voluntarily provide (for example when you email{" "}
                <a href="mailto:hello@adhdcapital.xyz">hello@adhdcapital.xyz</a> or{" "}
                <a href="mailto:support@adhdcapital.xyz">support@adhdcapital.xyz</a>).
              </li>
              <li>
                <strong className="font-medium text-zinc-800">Commercial information:</strong>{" "}
                high-level descriptions of technologies, token networks, or other initiatives you
                share so we can assess fit with our research mission and, where applicable, the impact
                case for discretionary funding.
              </li>
              <li>
                <strong className="font-medium text-zinc-800">Internet or device data:</strong> IP
                address, browser type, referring URLs, approximate location derived from IP, and
                diagnostic logs our hosting infrastructure records for security and reliability.
              </li>
              <li>
                <strong className="font-medium text-zinc-800">Inferences:</strong> internal notes or
                ratings derived from diligence meetings, written materials, and public sources—used
                only to prioritize research effort and, separately, any optional capital allocation.
              </li>
            </ul>

            <h3>3. Purposes and legal bases (EEA/UK)</h3>
            <p>
              Under GDPR Article 6, we rely on: (a) <strong className="font-medium text-zinc-800">contract</strong>{" "}
              where processing is necessary to respond to a specific request you make; (b){" "}
              <strong className="font-medium text-zinc-800">legitimate interests</strong> to operate and
              secure the site, publish research, perform outreach, and conduct proportionate
              diligence on potential collaborations—balanced against your rights; and (c){" "}
              <strong className="font-medium text-zinc-800">consent</strong> where we place
              non-essential cookies or similar technologies, when required. Where GDPR Article 9
              special-category data might theoretically arise from free-text submissions, we do not
              solicit it; please do not send health or similarly sensitive information unless we have
              explicitly agreed otherwise in writing.
            </p>

            <h3>4. How we use personal data in practice</h3>
            <ul>
              <li>Serve content, maintain session integrity, and protect against fraud or abuse.</li>
              <li>
                Correspond with founders, researchers, and partners; schedule calls; and archive
                materials subject to our retention rules.
              </li>
              <li>
                Evaluate technical and market impact, reproducibility of claims, and alignment with our
                thesis—criteria that inform whether we deepen research involvement or extend
                discretionary funding, always on a case-by-case basis.
              </li>
              <li>Comply with law, enforce our Terms of Use, and defend legal claims.</li>
            </ul>

            <h3>5. Disclosure</h3>
            <p>
              We share personal data with subprocessors that provide hosting, email delivery, security
              monitoring, and similar infrastructure, under written agreements that require
              confidentiality and appropriate safeguards. We may disclose information if required by
              subpoena, court order, or applicable law, or to protect the rights and safety of ADHD
              Capital personnel or the public. We do not sell personal data as that term is defined
              under the California Consumer Privacy Act as amended by the California Privacy Rights Act
              (“CCPA/CPRA”), nor do we “share” it for cross-context behavioral advertising.
            </p>

            <h3>6. International transfers</h3>
            <p>
              We may process data in the United States and other jurisdictions. Where GDPR applies,
              we rely on approved transfer mechanisms such as the EU Commission Standard Contractual
              Clauses, supplemented by technical and organizational measures that reflect the
              Schrems II remedial guidance from the Court of Justice of the European Union.
            </p>

            <h3>7. Retention</h3>
            <p>
              Server logs and security telemetry are kept only as long as needed for the underlying
              purpose—typically rolling deletion within months unless incident investigation requires
              longer retention. Business correspondence and diligence records may be retained for
              several years to document research conclusions, satisfy regulatory expectations for
              financial institutions we partner with, and manage disputes, after which they are
              deleted or anonymized where feasible.
            </p>

            <h3>8. Your rights</h3>
            <p>
              Depending on jurisdiction, you may have rights to access, rectify, erase, restrict, or
              export your personal data, and to object to certain processing or automated
              decision-making. Under GDPR Articles 15–22 these rights are subject to statutory
              exceptions. California residents may exercise CPRA rights (access, deletion,
              correction, opt-out of sale/sharing—N/A here, and limiting use of sensitive data) by
              emailing{" "}
              <a href="mailto:support@adhdcapital.xyz">support@adhdcapital.xyz</a>. We will verify
              requests in line with applicable law and may need additional information to process
              them. You may lodge a complaint with your local supervisory authority; the Irish Data
              Protection Commission and UK Information Commissioner’s Office publish helpful
              guidance for EU/UK individuals.
            </p>

            <h3>9. Children</h3>
            <p>
              Our services are not directed to anyone under 16, and we do not knowingly collect
              personal data from children in violation of the U.S. Children’s Online Privacy
              Protection Act framework or comparable rules.
            </p>

            <h3>10. Changes</h3>
            <p>
              We may update this Privacy Policy to reflect new practices or legal requirements. The
              “Effective” date at the top will change when revisions are material, and we will post the
              updated notice on this page.
            </p>

            <h3>11. Contact</h3>
            <p>
              Questions: <a href="mailto:support@adhdcapital.xyz">support@adhdcapital.xyz</a>.
            </p>
          </section>

          <section
            id="terms"
            aria-labelledby="terms-heading"
            className={`${sectionClass} mt-20 border-t border-zinc-200 pt-14`}
          >
            <h2 id="terms-heading">Terms of use</h2>

            <h3>1. Acceptance</h3>
            <p>
              By accessing our website or otherwise using materials we publish, you agree to these
              Terms of Use and to the Privacy Policy above, which is incorporated by reference. If you
              disagree, do not use the site.
            </p>

            <h3>2. Who we are; informational nature of content</h3>
            <p>
              ADHD Capital is a research-led collective focused on crypto, fintech, deep tech, and
              anything in between—including networks, rails, and frontier stacks. Everything on this
              site—including articles, memos, models,
              and charts—is provided for <strong className="font-medium text-zinc-800">informational and
              educational purposes only</strong>. It is not investment advice, a recommendation to buy,
              sell, or hold any asset, or an offer or solicitation in any jurisdiction where such
              activity would be unlawful. Securities, tokens, and derivatives involve extreme risk;
              consult licensed professionals before making financial decisions.
            </p>

            <h3>3. No advisory or fiduciary relationship</h3>
            <p>
              Use of the site does not create a client, advisory, fiduciary, or partnership
              relationship between you and ADHD Capital. Communications through email, social
              channels, or meetings—including exploratory diligence—do not constitute an agreement to
              provide services unless we both execute a separate written contract that expressly says
              so.
            </p>

            <h3>4. Research independence; discretionary funding theory</h3>
            <p>
              Our workflow separates (a) public and bespoke <strong className="font-medium text-zinc-800">research</strong> from
              (b) any <strong className="font-medium text-zinc-800">discretionary funding or resource allocation</strong>. Research
              is driven by intellectual merit, falsifiability, and public-interest relevance. Funding
              decisions—when made—are additive and narrow: they depend on impact we can defend ex
              post, alignment with our mandate, availability of capital, legal eligibility, and
              diligence outcomes. <strong className="font-medium text-zinc-800">There is no obligation to fund, partner,
              respond, or continue discussions.</strong> Past engagement, publication, or verbal
              encouragement implies no commitment. Any allocation is preceded by separate documentation
              where legally required.
            </p>

            <h3>5. Submissions and confidentiality</h3>
            <p>
              If you share pitch materials, data rooms, or other non-public information, you represent
              you have authority to share it. Unless we sign a mutual NDA, we cannot guarantee
              treatment as a legally enforceable trade secret, but we will use reasonable measures to
              limit internal distribution to personnel who need it for research or investment
              evaluation and will not intentionally disclose your confidential information except as
              required by law or with your consent.
            </p>

            <h3>6. Intellectual property</h3>
            <p>
              Unless otherwise noted, site content is owned by ADHD Capital or its licensors and is
              protected by copyright and other intellectual property laws. You may view, download,
              and print reasonable portions for personal, non-commercial use, provided you keep
              attribution intact. You may not scrape the site in bulk, resell our materials, or remove
              proprietary notices. Trademarks displayed are the property of their respective owners.
            </p>

            <h3>7. Acceptable use</h3>
            <p>You agree not to:</p>
            <ul>
              <li>Introduce malware, attempt unauthorized access, or probe our systems for weakness.</li>
              <li>Mislead us as to identity, affiliation, or authority.</li>
              <li>Use our research to defraud others or manipulate markets.</li>
              <li>Violate applicable sanctions, export-control, or anti-money-laundering laws.</li>
            </ul>

            <h3>8. Third-party links and embedded content</h3>
            <p>
              We may link to third-party sites, protocols, or social platforms. Their terms and privacy
              practices govern your use; we are not responsible for third-party content or losses
              arising from reliance on it.
            </p>

            <h3>9. Disclaimers</h3>
            <p>
              THE SITE AND ALL CONTENT ARE PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT
              PERMITTED BY LAW, ADHD CAPITAL DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR
              STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT. WE DO NOT WARRANT ERROR-FREE OR UNINTERRUPTED SERVICE.
            </p>

            <h3>10. Limitation of liability</h3>
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, NEITHER ADHD CAPITAL NOR ITS CONTRIBUTORS WILL BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY
              LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SITE OR
              RELIANCE ON OUR RESEARCH, EVEN IF ADVISED OF THE POSSIBILITY. OUR AGGREGATE LIABILITY FOR
              ANY CLAIM RELATING TO THE SITE WILL NOT EXCEED THE GREATER OF (A) ONE HUNDRED U.S.
              DOLLARS (US$100) OR (B) THE AMOUNTS YOU PAID US (IF ANY) IN THE TWELVE MONTHS PRECEDING
              THE CLAIM—WHICH WILL USUALLY BE ZERO FOR PUBLIC SITE USERS. SOME JURISDICTIONS DO NOT
              ALLOW CERTAIN LIMITATIONS; IN THOSE CASES OUR LIABILITY IS LIMITED TO THE MINIMUM
              PERMITTED BY LAW.
            </p>

            <h3>11. Indemnity</h3>
            <p>
              You will indemnify and hold harmless ADHD Capital and its personnel from claims, losses,
              and expenses (including reasonable attorneys’ fees) arising from your misuse of the site,
              your breach of these Terms, or your violation of law.
            </p>

            <h3>12. Governing law and venue</h3>
            <p>
              These Terms are governed by the laws of the State of Delaware, United States, excluding
              conflict-of-law rules that would apply another jurisdiction’s substantive law. Subject
              to mandatory consumer protections where you reside, you consent to the exclusive
              jurisdiction of the state and federal courts located in Delaware for disputes arising
              from or relating to these Terms or the site, and waive any objection to inconvenient
              forum, except that ADHD Capital may seek injunctive relief in any court of competent
              jurisdiction.
            </p>

            <h3>13. General</h3>
            <p>
              If any provision is unenforceable, the remainder stays in effect. Failure to enforce a
              provision is not a waiver. You may not assign these Terms without our consent; we may
              assign them in connection with a merger or asset sale. These Terms constitute the entire
              agreement between you and ADHD Capital regarding use of the public site (but do not
              supersede a separate signed contract, if one exists).
            </p>

            <h3>14. Contact</h3>
            <p>
              Legal notices: <a href="mailto:support@adhdcapital.xyz">support@adhdcapital.xyz</a>.
            </p>
          </section>

          <p className="mt-16 border-t border-zinc-200 pt-10 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
            <Link href="/" className="text-cyan-800 transition-colors hover:text-cyan-950">
              ← Home
            </Link>
          </p>
        </Container>
      </main>
      <Footer />
    </>
  );
}
