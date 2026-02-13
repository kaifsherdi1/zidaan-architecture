import PropTypes from 'prop-types';

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
