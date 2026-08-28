import { motion } from 'motion/react';

/**
 * EmptyState - accepts `icon` as either a React component OR JSX element.
 */
export default function EmptyState({ icon, title, description, actionText, onAction }) {
  // Render icon whether it's a component class/function or already a JSX element
  const renderIcon = () => {
    if (!icon) return null;
    // If it's a valid React element (JSX), render directly
    if (typeof icon === 'object' && icon !== null && '$$typeof' in icon) {
      return <div className="text-text-muted">{icon}</div>;
    }
    // Otherwise treat as a component
    const IconComponent = icon;
    return <IconComponent className="w-10 h-10 text-text-muted" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center py-16 px-6"
    >
      {icon && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-2xl bg-bg flex items-center justify-center mb-6"
        >
          {renderIcon()}
        </motion.div>
      )}

      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>

      {description && (
        <p className="text-text-secondary text-sm max-w-md mb-6 leading-relaxed">{description}</p>
      )}

      {actionText && onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow"
        >
          {actionText}
        </motion.button>
      )}
    </motion.div>
  );
}
