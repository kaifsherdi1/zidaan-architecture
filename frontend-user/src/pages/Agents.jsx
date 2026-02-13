import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import Layout from "../components/Layout";
import { Heading, Text } from "../components/ui/Typography";
import { Search, Mail, Phone } from "lucide-react";

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = (query = "") => {
    setLoading(true);
    axiosClient.get('/agents', { params: { search: query } })
      .then(({ data }) => {
        setAgents(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAgents(searchTerm);
  };

  return (
    <Layout>
      <section className="pt-40 pb-20 bg-white">
        <div className="section-container">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10">
            <div className="max-w-2xl">
              <span className="text-[10px] uppercase tracking-[0.5em] text-black/40 mb-6 block">
                The Studio
              </span>
              <Heading level={1} className="mb-8">
                The<br />Team
              </Heading>
              <Text className="text-secondary font-light max-w-lg">
                Zidaan Architectures is composed of a diverse team of architects, designers, and thinkers dedicated to the pursuit of spatial excellence.
              </Text>
            </div>

            <div className="w-full md:w-auto">
              <form onSubmit={handleSearch} className="relative min-w-[300px]">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-black/20" size={16} />
                <input
                  type="text"
                  placeholder="Find a specialist"
                  className="w-full bg-transparent border-b border-black/10 pl-8 py-3 text-xs uppercase tracking-widest outline-none focus:border-black transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="section-container">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-6">
              <div className="w-12 h-px bg-black/10 animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-[0.5em] text-secondary animate-pulse">Consulting Directory...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {agents.map((agent, index) => (
                <div key={agent.id} className="group cursor-default">
                  <div className="image-zoom-container aspect-[3/4] mb-8 grayscale hover:grayscale-0 transition-all duration-700">
                    <img
                      src={agent.image || `https://randomuser.me/api/portraits/men/${index + 40}.jpg`}
                      alt={agent.name}
                      className="w-full h-full object-cover image-zoom"
                    />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-2">{agent.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-black/40 mb-6 font-medium">Principal Architect</p>
                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a href={`mailto:${agent.email}`} className="text-black hover:text-accent transition-colors"><Mail size={16} /></a>
                    <a href={`tel:${agent.phone}`} className="text-black hover:text-accent transition-colors"><Phone size={16} /></a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
