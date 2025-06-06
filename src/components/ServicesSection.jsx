import { motion } from "framer-motion";
import * as HeroIcons from "@heroicons/react/24/solid";

function ServicesSection({ title, items, primaryColor }) {
  return (
    <section id="services" className="bg-gray-50 py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-10">{title}</h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {items.map((service, index) => {
            const IconComponent = HeroIcons[service.iconName] || HeroIcons.Cog6ToothIcon;
            return (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
                whileHover={{ scale: 1.025 }}
              >
                <IconComponent className={`h-10 w-10 text-${primaryColor}-500 mb-4`} />
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
