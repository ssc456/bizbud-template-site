import { motion } from 'framer-motion';
import { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

function FAQSection({ title, description, items, primaryColor }) {
  const [openIndex, setOpenIndex] = useState(null);

  // Bold gradient color mapping
  const colorClasses = {
    pink: {
      primary: 'from-pink-400 via-rose-400 to-red-400',
      secondary: 'from-pink-500 to-rose-500',
      accent: 'bg-gradient-to-r from-pink-500 to-rose-500',
      text: 'text-pink-400',
      glow: 'shadow-pink-500/50',
      border: 'border-pink-400/30'
    },
    purple: {
      primary: 'from-purple-400 via-violet-400 to-indigo-400',
      secondary: 'from-purple-500 to-violet-500',
      accent: 'bg-gradient-to-r from-purple-500 to-violet-500',
      text: 'text-purple-400',
      glow: 'shadow-purple-500/50',
      border: 'border-purple-400/30'
    },
    blue: {
      primary: 'from-blue-400 via-cyan-400 to-teal-400',
      secondary: 'from-blue-500 to-cyan-500',
      accent: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      text: 'text-blue-400',
      glow: 'shadow-blue-500/50',
      border: 'border-blue-400/30'
    },
    green: {
      primary: 'from-green-400 via-emerald-400 to-teal-400',
      secondary: 'from-green-500 to-emerald-500',
      accent: 'bg-gradient-to-r from-green-500 to-emerald-500',
      text: 'text-green-400',
      glow: 'shadow-green-500/50',
      border: 'border-green-400/30'
    },
    red: {
      primary: 'from-red-400 via-rose-400 to-pink-400',
      secondary: 'from-red-500 to-rose-500',
      accent: 'bg-gradient-to-r from-red-500 to-rose-500',
      text: 'text-red-400',
      glow: 'shadow-red-500/50',
      border: 'border-red-400/30'
    },
    yellow: {
      primary: 'from-yellow-400 via-amber-400 to-orange-400',
      secondary: 'from-yellow-500 to-amber-500',
      accent: 'bg-gradient-to-r from-yellow-500 to-amber-500',
      text: 'text-yellow-400',
      glow: 'shadow-yellow-500/50',
      border: 'border-yellow-400/30'
    }
  }[primaryColor] || {
    primary: 'from-gray-400 via-slate-400 to-zinc-400',
    secondary: 'from-gray-500 to-slate-500',
    accent: 'bg-gradient-to-r from-gray-500 to-slate-500',
    text: 'text-gray-400',
    glow: 'shadow-gray-500/50',
    border: 'border-gray-400/30'
  };

  const defaultFAQs = [
    {
      question: "What services do you offer?",
      answer: "We offer a comprehensive range of services including web development, design, digital marketing, and custom software solutions. Our team works closely with you to understand your specific needs and deliver tailored solutions."
    },
    {
      question: "How long does a typical project take?",
      answer: "Project timelines vary depending on complexity and scope. Simple projects may take 2-4 weeks, while complex custom solutions can take 2-6 months. We provide detailed timelines during our initial consultation."
    },
    {
      question: "Do you provide ongoing support?",
      answer: "Yes! We offer comprehensive ongoing support and maintenance packages. This includes regular updates, security monitoring, performance optimization, and technical support whenever you need it."
    },
    {
      question: "What are your pricing options?",
      answer: "We offer flexible pricing options including project-based pricing, monthly retainers, and custom packages. We'll work with you to find a pricing structure that fits your budget and requirements."
    },
    {
      question: "Can you work with our existing systems?",
      answer: "Absolutely! We're experienced in integrating with existing systems and platforms. We'll assess your current setup and recommend the best approach for seamless integration."
    }
  ];

  const faqData = items || defaultFAQs;

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-96 h-96 bg-gradient-to-br ${colorClasses.primary} opacity-6 blur-3xl rounded-full`}
            style={{
              left: `${(i * 40) % 100}%`,
              top: `${(i * 30) % 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 15 + i * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 4,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              className="inline-flex items-center gap-3 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div className={`w-16 h-16 ${colorClasses.accent} rounded-2xl flex items-center justify-center ${colorClasses.glow} shadow-xl`}>
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <motion.h2 
              className="text-5xl md:text-6xl font-bold mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className={`bg-gradient-to-r ${colorClasses.primary} bg-clip-text text-transparent`}>
                {title}
              </span>
            </motion.h2>
            
            <motion.p 
              className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {description}
            </motion.p>
          </motion.div>

          {/* FAQ Items */}
          <div className="space-y-6">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${colorClasses.secondary} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 rounded-2xl`} />
                
                <motion.div 
                  className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300"
                  whileHover={{ scale: 1.01 }}
                >
                  {/* Question */}
                  <motion.button
                    className="w-full p-8 text-left flex items-center justify-between gap-4"
                    onClick={() => toggleFAQ(index)}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <h3 className="text-xl font-semibold text-white pr-4">
                      {faq.question}
                    </h3>
                    
                    <motion.div
                      className={`w-10 h-10 ${colorClasses.accent} rounded-full flex items-center justify-center ${colorClasses.glow} shadow-lg flex-shrink-0`}
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {openIndex === index ? (
                        <Minus className="w-5 h-5 text-white" />
                      ) : (
                        <Plus className="w-5 h-5 text-white" />
                      )}
                    </motion.div>
                  </motion.button>

                  {/* Answer */}
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: openIndex === index ? 'auto' : 0,
                      opacity: openIndex === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-8">
                      <div className="border-t border-white/10 pt-6">
                        <p className="text-white/80 leading-relaxed text-lg">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-20"
          >
            <motion.div
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <h3 className={`text-3xl font-bold bg-gradient-to-r ${colorClasses.primary} bg-clip-text text-transparent mb-6`}>
                Still Have Questions?
              </h3>
              <p className="text-white/70 text-lg mb-8">
                Can't find the answer you're looking for? Our team is here to help. Get in touch and we'll get back to you as soon as possible.
              </p>
              <motion.button
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`px-12 py-4 ${colorClasses.accent} text-white font-semibold rounded-full text-lg ${colorClasses.glow} shadow-xl hover:scale-105 transition-all duration-300`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Us
              </motion.button>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default FAQSection;
