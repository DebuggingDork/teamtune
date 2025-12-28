import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Can I change my plan later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle. When upgrading, you'll have immediate access to new features.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise plans. All payments are processed securely.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes! All plans come with a 14-day free trial. No credit card required to start. You can explore all features before committing to a paid plan.",
  },
  {
    question: "What happens when my trial ends?",
    answer:
      "When your trial ends, you'll be prompted to choose a plan. If you don't select a plan, your account will be limited to basic features until you upgrade.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your current billing period.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team for a full refund within the first 30 days.",
  },
  {
    question: "What's included in the Enterprise plan?",
    answer:
      "Enterprise includes everything in Professional plus custom integrations, dedicated account management, SSO authentication, advanced security features, SLA guarantees, and priority 24/7 support.",
  },
  {
    question: "How does team billing work?",
    answer:
      "Team billing is based on the number of seats. Each team member requires a seat. You can add or remove seats at any time, and billing is prorated accordingly.",
  },
];

const PricingFAQ = () => {
  return (
    <section className="py-20 bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about our pricing and billing.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-foreground hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default PricingFAQ;
