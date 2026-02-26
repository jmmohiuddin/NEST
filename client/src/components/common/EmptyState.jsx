const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="text-center py-16 px-4">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-500 max-w-sm mx-auto mb-6">{description}</p>}
      {action && action}
    </div>
  );
};

export default EmptyState;
