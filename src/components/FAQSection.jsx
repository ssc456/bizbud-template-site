function FAQSection({ title, items, primaryColor }) {
  return (
    <section id="faq" className="bg-gray-50 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">{title}</h2>
        <div className="space-y-6">
          {items.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded shadow">
              <h3 className={`text-lg font-semibold text-${primaryColor}-600 mb-2`}>{faq.question}</h3>
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
