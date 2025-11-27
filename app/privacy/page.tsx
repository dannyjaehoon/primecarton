import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

const PrivacyPage = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground">
          We explain what data we collect, why we collect it, and how we handle it.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1. What we collect</h2>
        <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Account details you provide (name, email, phone)</li>
          <li>Order and payment-related information needed to fulfill purchases</li>
          <li>Usage data to improve site performance and security</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. How we use your data</h2>
        <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
          <li>To create and manage your account</li>
          <li>To process and deliver orders</li>
          <li>To send service emails (receipts, verification, password resets)</li>
          <li>To send marketing only if you consent; you can opt out anytime</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3. Sharing</h2>
        <p className="text-muted-foreground">
          We share data only with trusted service providers (payments, email, hosting) as needed
          to operate the service. We do not sell your personal data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4. Security</h2>
        <p className="text-muted-foreground">
          We use encryption and access controls to protect your data. No system is 100% secure, so
          please use a strong, unique password.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">5. Your choices</h2>
        <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Update or delete your profile information in account settings</li>
          <li>Unsubscribe from marketing at any time via email links or profile settings</li>
          <li>Contact us to request data export or deletion</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">6. Contact</h2>
        <p className="text-muted-foreground">
          Questions? Contact our support team and we&apos;ll be happy to help.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPage;
