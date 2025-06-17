function FormField({ 
  label, 
  id, 
  type = 'text', 
  value, 
  onChange,
  options = [],
  helpText,
  placeholder,
  rows = 3,
  ...props 
}) {
  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={rows}
            placeholder={placeholder}
            {...props}
          />
        );
      
      case 'select':
        return (
          <select
            id={id}
            value={value}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...props}
          >
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={id}
              type="checkbox"
              checked={value}
              onChange={onChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              {...props}
            />
            <label htmlFor={id} className="ml-2 block text-gray-700">
              {label}
            </label>
          </div>
        );
        
      case 'color':
        return (
          <div className="flex items-center">
            <input
              id={id}
              type="color"
              value={value}
              onChange={onChange}
              className="h-8 w-8 border-0 rounded-md cursor-pointer"
              {...props}
            />
            <input
              type="text"
              value={value}
              onChange={onChange}
              className="ml-2 flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );
        
      default:
        return (
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder}
            {...props}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      {type !== 'checkbox' && (
        <label htmlFor={id} className="block font-medium text-gray-700">
          {label}
        </label>
      )}
      {renderField()}
      {helpText && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
}

export default FormField;