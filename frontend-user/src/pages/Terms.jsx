import React from 'react';
import LegalPage from '../components/LegalPage';
import { COMPANY } from '../data/site';

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="1 September 2026"
      sections={[
        {
          heading: 'Acceptance',
          body: [
            `By using this website you agree to these terms. If you do not agree, please do not use the site. ${COMPANY.name} may update these terms from time to time; continued use means you accept the changes.`,
          ],
        },
        {
          heading: 'Use of the site',
          body: [
            'You may browse the site and use its features for personal, non-commercial purposes.',
            'You agree not to misuse the site — including attempting to gain unauthorised access, scraping content at scale, or interfering with its normal operation.',
          ],
        },
        {
          heading: 'Property information',
          body: [
            'Listings, prices, dimensions and availability are provided in good faith but may change without notice and are not an offer or contract. Always verify details directly with our team before acting on them.',
            'Imagery may include indicative visualisations. Where a photograph is a render or a staged interior, we aim to make that clear.',
          ],
        },
        {
          heading: 'Accounts',
          body: [
            'You are responsible for keeping your account credentials secure and for activity that happens under your account. Tell us immediately if you believe your account has been compromised.',
          ],
        },
        {
          heading: 'Liability',
          body: [
            'To the extent permitted by law, we are not liable for indirect or consequential loss arising from use of this website. Nothing in these terms limits liability that cannot be limited by law.',
          ],
        },
        {
          heading: 'Contact',
          body: [`Questions about these terms can be sent to ${COMPANY.email}.`],
        },
      ]}
    />
  );
}
