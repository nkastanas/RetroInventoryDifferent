export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-[var(--foreground)]">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-8">Last updated: September 20, 2026</p>

      <p className="mb-6">
        Retro Inventory Different is a self-hosted application. This means your inventory
        data is stored on a server that <strong>you own and control</strong> — not on
        any server operated by the developer. The developer (Michael Wottle) does not
        have access to your data and does not collect, store, or transmit it.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data You Store</h2>
      <p className="mb-4">
        All inventory records, images, notes, financial data, and other content you
        enter into Retro Inventory Different are stored exclusively on your self-hosted server.
        You are responsible for the security and backup of that server.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">AI Chat Feature</h2>
      <p className="mb-4">
        The AI chat feature sends queries about your collection to your self-hosted
        server, which forwards them to an AI provider (such as OpenAI) using an API
        key that you supply. The developer does not operate or have access to the AI
        service used by your server.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Analytics and Tracking</h2>
      <p className="mb-4">
        The web storefront optionally supports Umami Analytics, a privacy-friendly analytics tool —
        this is configured by you on your own server and its data is not accessible
        to the developer.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Third-Party Services</h2>
      <p className="mb-4">
        The optional TemplatesDifferent remote template catalog is operated by the
        developer at{' '}
        <code className="text-sm bg-[var(--muted)] px-1 rounded">
          api.templates.inventorydifferent.com
        </code>
        . When enabled, your server makes requests to this service to fetch device
        template data. No personally identifiable
        information is sent in these requests.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Retention</h2>
      <p className="mb-4">
        The developer retains no data about you or your collection. You can delete
        your data at any time by removing it from your server.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
      <p className="mb-4">
        Questions about this policy can be directed to{' '}
        <a href="mailto:mike@wottle.com" className="text-[var(--apple-blue)] hover:underline">
          mike@wottle.com
        </a>
        .
      </p>
    </div>
  );
}
