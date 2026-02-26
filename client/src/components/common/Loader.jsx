const Loader = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`${sizes[size]} border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin`}
      />
      {text && <p className="mt-4 text-sm text-gray-500">{text}</p>}
    </div>
  );
};

// Full page loader
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto" />
      <p className="mt-4 text-gray-500 font-medium">Loading...</p>
    </div>
  </div>
);

export default Loader;
