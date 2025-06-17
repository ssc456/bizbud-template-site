// src/components/FeaturesSection.jsx
import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'

function FeaturesSection({ title, items, primaryColor }) {
  // Default color if none specified
  const textColorClass = primaryColor ? `text-${primaryColor}-500` : 'text-blue-500'

  return (
    <section id='features' className='bg-white py-20 px-6'>
      <div className='max-w-6xl mx-auto text-center'>
        <h2 className='text-3xl font-bold mb-10'>{title}</h2>
        <div className='grid gap-8 sm:grid-cols-2 md:grid-cols-3'>
          {items.map((feature, index) => {
            // Get the correct icon from Lucide icons
            const IconComponent = feature.iconName && LucideIcons[feature.iconName]
              ? LucideIcons[feature.iconName]
              : LucideIcons.Activity // Fallback icon

            return (
              <motion.div
                key={index}
                className='bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'
                whileHover={{ scale: 1.05 }}
              >
                <IconComponent className={`h-10 w-10 ${textColorClass} mb-4`} />
                <h3 className='text-xl font-semibold mb-2'>{feature.title}</h3>
                <p className='text-gray-600'>{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
