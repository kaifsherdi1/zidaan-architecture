import { User, MapPin, Building, Phone, Mail } from "lucide-react";

export default function AgentCard({ agent }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-slate-100 group">
      <div className="relative h-48 bg-slate-100">
        {agent.profile_image ? (
          <img
            src={agent.profile_image}
            alt={agent.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
            <User className="w-16 h-16" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white text-xl font-bold truncate">{agent.name}</h3>
          <p className="text-white/80 text-sm flex items-center gap-1">
            <Building className="w-3 h-3" /> Real Estate Agent
          </p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Mail className="w-4 h-4 text-primary" />
          <span className="truncate">{agent.email}</span>
        </div>
        {/* Placeholder for phone if available in future */}
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Phone className="w-4 h-4 text-primary" />
          <span className="truncate">+1 (555) 000-0000</span>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
            Verified Agent
          </span>
          <button className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
