function ContactSection({ title, email, phone }) {
    return (
      <section className="bg-white py-12 px-6 text-center text-gray-800">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-4">Email: <a href={`mailto:${email}`} className="text-blue-600">{email}</a></p>
        <p className="mt-2">Phone: <a href={`tel:${phone}`} className="text-blue-600">{phone}</a></p>
      </section>
    );
  }
  
  export default ContactSection;
  