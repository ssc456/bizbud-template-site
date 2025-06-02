import { FaFacebook, FaInstagram } from "react-icons/fa";

const colorMap = {
  blue: "bg-blue-700",
  red: "bg-red-700",
  green: "bg-green-700",
  pink: "bg-pink-700",
  yellow: "bg-yellow-700",
  purple: "bg-purple-700",
  indigo: "bg-indigo-700",
  gray: "bg-gray-700",
};

function Footer({ social, primaryColor }) {
  const bgClass = colorMap[primaryColor] || "bg-blue-700";

  return (
    <footer className={`${bgClass} text-white pt-12 pb-6`}>
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>

        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#about" className="hover:underline">About</a></li>
            <li><a href="#services" className="hover:underline">Services</a></li>
            <li><a href="#testimonials" className="hover:underline">Testimonials</a></li>
            <li><a href="#contact" className="hover:underline">Contact</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            {social.facebook && (
              <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-gray-200">
                <FaFacebook className="h-6 w-6" />
              </a>
            )}
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gray-200">
                <FaInstagram className="h-6 w-6" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-xs text-gray-300">
        © {new Date().getFullYear()} BizBud. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
