// Add this to your sidebar navigation items:

<li>
  <Link 
    to="/admin/subscription"
    className={`flex items-center px-4 py-2 rounded-md ${
      location.pathname === '/admin/subscription' 
        ? 'bg-blue-100 text-blue-700' 
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <CreditCardIcon className="h-5 w-5 mr-3" />
    <span>Subscription</span>
  </Link>
</li>