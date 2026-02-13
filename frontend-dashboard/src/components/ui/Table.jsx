import PropTypes from 'prop-types';

export function Table({ children, className = '' }) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full whitespace-nowrap text-left border-collapse">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead className="bg-slate-50 border-b border-slate-200">
      {children}
    </thead>
  );
}

export function TableBody({ children }) {
  return (
    <tbody className="divide-y divide-slate-100">
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '' }) {
  return (
    <tr className={`hover:bg-slate-50 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '', as = 'td', colSpan }) {
  const Component = as;
  const baseClasses = as === 'th'
    ? "px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
    : "px-6 py-4 text-sm text-slate-600";

  return (
    <Component className={`${baseClasses} ${className}`} colSpan={colSpan}>
      {children}
    </Component>
  );
}

Table.propTypes = { children: PropTypes.node, className: PropTypes.string };
TableHead.propTypes = { children: PropTypes.node };
TableBody.propTypes = { children: PropTypes.node };
TableRow.propTypes = { children: PropTypes.node, className: PropTypes.string };
TableCell.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  as: PropTypes.oneOf(['td', 'th']),
  colSpan: PropTypes.number
};
