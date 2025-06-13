// src/components/FeaturesSection.jsx
import { motion } from 'framer-motion'
import * as HeroIcons from '@heroicons/react/24/solid'

function FeaturesSection({ title, items, primaryColor }) {
  return (
    <section id='features' className='bg-white py-20 px-6'>
      <div className='max-w-6xl mx-auto text-center'>
        <h2 className='text-3xl font-bold mb-10'>{title}</h2>
        <div className='grid gap-8 sm:grid-cols-2 md:grid-cols-3'>
          {items.map((f, i) => {
            const Icon = HeroIcons[f.iconName] ?? HeroIcons.CogIcon
            return (
              <motion.div key={i} className='bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer' whileHover={{ scale: 1.05 }}>
                <Icon className={`h-10 w-10 text-${primaryColor}-500 mb-4`} />
                <h3 className='text-xl font-semibold mb-2'>{f.title}</h3>
                <p className='text-gray-600'>{f.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
