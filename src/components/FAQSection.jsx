// src/components/FAQSection.jsx
function FAQSection({ title, items, primaryColor }) {
  return (
    <section id='faq' className='bg-gray-50 py-20 px-6'>
      <div className='max-w-4xl mx-auto'>
        <h2 className='text-3xl font-bold text-center mb-10'>{title}</h2>
        <div className='space-y-6'>
          {items.map((q, i) => (
            <details key={i} className='bg-white p-6 rounded shadow group'>
              <summary className={`cursor-pointer text-lg font-semibold text-${primaryColor}-600 mb-2 group-open:mb-4`}>{q.question}</summary>
              <p className='text-gray-700'>{q.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQSection
