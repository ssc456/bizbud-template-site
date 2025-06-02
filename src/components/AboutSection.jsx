import { LightBulbIcon } from '@heroicons/react/24/solid';

function AboutSection({ title, description, primaryColor }) {
  return (
    <section id="about" className="bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <LightBulbIcon className={`h-12 w-12 text-${primaryColor}-500 mx-auto mb-4`} />
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-lg text-gray-700">{description}</p>
      </div>
    </section>
  );
}

export default AboutSection;
