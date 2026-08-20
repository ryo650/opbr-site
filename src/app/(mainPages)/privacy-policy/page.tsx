import type { Metadata } from "next";
import styles from "./page.module.css";

const contactEmail = "opbrsite.contact@gmail.com";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the OPBR Guide privacy policy covering analytics, cookies, third-party advertising, external links, and contact information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className={`${styles.page} upper-page-background`}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Privacy Policy</p>
          <h1>Privacy Policy</h1>
          <p className={styles.lead}>
            This Privacy Policy explains how OPBR Guide may collect and use
            information when you visit this website. We aim to keep this notice
            clear and update it as site features change.
          </p>
        </section>

        <section className={styles.content} aria-label="Privacy Policy details">
          <article className={styles.card}>
            <h2>Access analytics</h2>
            <p>
              We may use analytics tools to understand how visitors use the
              site, such as pages viewed, device or browser type, approximate
              region, referring pages, and general usage trends. This
              information helps us improve content and site performance.
            </p>
          </article>

          <article className={styles.card}>
            <h2>Cookies</h2>
            <p>
              This site and third-party services may use cookies or similar
              technologies to remember preferences, measure traffic, maintain
              security, and improve functionality. You can usually manage or
              disable cookies through your browser settings, though some site
              features may not work as intended.
            </p>
          </article>

          <article className={styles.card}>
            <h2>Google AdSense / third-party advertising</h2>
            <p>
              We may introduce Google AdSense or other third-party advertising
              services in the future. These services may use cookies, web
              beacons, or similar technologies to serve ads, measure ad
              performance, and help show ads that are relevant to users.
            </p>
            <p>
              No AdSense script, ads.txt file, Auto Ads configuration, or ad
              placement is added as part of this preparation update.
            </p>
          </article>

          <article className={styles.card}>
            <h2>Advertising cookies and personalized advertising</h2>
            <p>
              Advertising partners, including Google if AdSense is enabled, may
              use advertising cookies to personalize ads based on visits to this
              and other websites. Depending on your location and settings, you
              may be able to manage personalized advertising through your
              browser, device, Google account, or applicable consent controls.
            </p>
          </article>

          <article className={styles.card}>
            <h2>External links</h2>
            <p>
              OPBR Guide may link to external websites or services. We are not
              responsible for the content, security, or privacy practices of
              external sites. Please review the privacy policies of any external
              services you visit.
            </p>
          </article>

          <article className={styles.card}>
            <h2>Contact information</h2>
            <p>
              If you have questions, correction requests, or privacy-related
              concerns, contact us at{" "}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
            </p>
          </article>

          <article className={styles.card}>
            <h2>Changes to this Privacy Policy</h2>
            <p>
              We may revise this Privacy Policy from time to time to reflect
              site updates, service changes, or legal and operational needs. The
              updated version will be posted on this page.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
