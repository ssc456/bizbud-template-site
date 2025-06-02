import { Cog6ToothIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/solid';

const icons = [Cog6ToothIcon, ShieldCheckIcon, SparklesIcon];

function ServicesSection({ title, items, primaryColor }) {
  return (
    <section id="services" className="bg-gray-50 py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-10">{title}</h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {items.map((service, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left">
                <Icon className={`h-8 w-8 text-${primaryColor}-500 mb-4`} />
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
