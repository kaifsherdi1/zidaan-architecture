import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";

export default function GuestLayout() {
  const { token } = useStateContext();

  if (token) {
    return <Navigate to="/" />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Outlet />
    </div>
  )
}
