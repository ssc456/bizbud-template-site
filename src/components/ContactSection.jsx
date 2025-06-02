import { EnvelopeIcon } from '@heroicons/react/24/solid';
import { themedColor, themedHover } from '../utils/classNames';

function ContactSection({ title, description, email, primaryColor }) {
  return (
    <section id="contact" className="bg-gray-50 py-20 px-6">
      <div className="max-w-xl mx-auto text-center">
        <EnvelopeIcon className={`h-10 w-10 mx-auto mb-4 ${themedColor('text', primaryColor)}`} />
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-gray-700 mb-6">{description}</p>
        <a
          href={`mailto:${email}`}
          className={`inline-block font-semibold py-3 px-6 rounded-full text-white bg-${primaryColor}-500 hover:bg-${primaryColor}-600 transition`}
        >
          Email Us
        </a>
      </div>
    </section>
  );
}


export default ContactSection;
