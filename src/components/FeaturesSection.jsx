import { RocketLaunchIcon, DevicePhoneMobileIcon, CogIcon } from '@heroicons/react/24/outline';

const iconMap = {
  RocketLaunchIcon,
  DevicePhoneMobileIcon,
  CogIcon
};

function FeaturesSection({ title, items, primaryColor }) {
  return (
    <section id="features" className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-10">{title}</h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {items.map((feature, index) => {
            const Icon = iconMap[feature.icon] || CogIcon;
            return (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition text-left">
                <Icon className={`h-8 w-8 text-${primaryColor}-500 mb-4`} />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
