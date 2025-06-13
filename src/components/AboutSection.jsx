// src/components/AboutSection.jsx
import { LightBulbIcon } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'

function AboutSection({ title, description, primaryColor }) {
  return (
    <section id='about' className='bg-white py-20 px-6'>
      <motion.div className='max-w-4xl mx-auto text-center' initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <LightBulbIcon className={`h-12 w-12 text-${primaryColor}-500 mx-auto mb-4`} />
        <h2 className='text-3xl font-bold mb-4'>{title}</h2>
        <p className='text-lg text-gray-700'>{description}</p>
      </motion.div>
    </section>
  )
}

export default AboutSection
