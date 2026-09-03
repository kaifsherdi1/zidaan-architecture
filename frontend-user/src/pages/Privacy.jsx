import React from 'react';
import LegalPage from '../components/LegalPage';
import { COMPANY } from '../data/site';

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="1 September 2026"
      sections={[
        {
          heading: 'Who we are',
          body: [
            `${COMPANY.name} ("we", "us") operates this website and the related architecture and real-estate services. This policy explains what personal data we collect and how we use it.`,
          ],
        },
        {
          heading: 'What we collect',
          body: [
            'Account details you provide when registering — your name, email address and, optionally, a phone number.',
            'Enquiry content — the messages, briefs and property details you send us through forms on this site.',
            'Usage data — basic, aggregated analytics about how pages are used, collected in a way that does not identify you personally.',
          ],
        },
        {
          heading: 'How we use it',
          body: [
            'To respond to your enquiries, arrange viewings and provide the services you ask for.',
            'To send you updates you have opted into, such as new listings or the studio journal. You can unsubscribe at any time.',
            'To meet legal and regulatory obligations relating to property transactions.',
          ],
        },
        {
          heading: 'Sharing',
          body: [
            'We do not sell your data. We share it only with the agents and partners directly involved in handling your enquiry, and with service providers who host our systems under contract.',
          ],
        },
        {
          heading: 'Your rights',
          body: [
            `You can ask us to access, correct or delete your personal data, or to stop using it for marketing. Contact ${COMPANY.email} and we will respond within 30 days.`,
          ],
        },
      ]}
    />
  );
}
