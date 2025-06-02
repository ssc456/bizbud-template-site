function Header({ siteTitle, logoUrl }) {
    return (
      <header className="bg-white py-4 px-6 flex items-center justify-center shadow">
        <img src={logoUrl} alt="Logo" className="h-10 w-auto mr-3" />
        <h1 className="text-xl font-bold text-gray-800">{siteTitle}</h1>
      </header>
    );
  }
  
  export default Header;
  