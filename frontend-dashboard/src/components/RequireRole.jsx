import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import { roleOf } from "../utils/auth";

/** Route guard: renders children only for the listed roles (the API enforces this too). */
export default function RequireRole({ roles, children }) {
  const { user } = useStateContext();
  const role = roleOf(user);

  if (!role) {
    return <div className="py-16 text-center text-slate-500">Loading…</div>;
  }
  if (!roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

RequireRole.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
};
