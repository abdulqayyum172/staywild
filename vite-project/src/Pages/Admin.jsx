import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Building2,
  ClipboardList,
  Eye,
  EyeOff,
  Home,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  PlusCircle,
  Settings,
  ShieldCheck,
  User,
  Users,
  X,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  UserCheck,
  UserMinus,
  AlertCircle,
  Check,
  TrendingUp,
  MapPin,
  ExternalLink,
  Sliders,
  DollarSign
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from "recharts";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const customStyles = `
  @keyframes slideUp {
    from { transform: translateY(1rem); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-slide-up {
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .animate-fade-in {
    animation: fadeIn 0.25s ease-out forwards;
  }
`;

// Toast Alert System Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300 animate-slide-up ${
        type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600">
        <X size={14} />
      </button>
    </div>
  );
};

// Stat Block Component
const StatBlock = ({ icon, label, value, subtext, color = "emerald" }) => {
  const colorMap = {
    emerald: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
      accent: "from-emerald-500 to-teal-600",
    },
    indigo: {
      bg: "bg-indigo-50 text-indigo-700 border-indigo-100",
      accent: "from-indigo-500 to-blue-600",
    },
    amber: {
      bg: "bg-amber-50 text-amber-700 border-amber-100",
      accent: "from-amber-500 to-orange-600",
    },
    rose: {
      bg: "bg-rose-50 text-rose-700 border-rose-100",
      accent: "from-rose-500 to-pink-600",
    },
  };

  const style = colorMap[color] || colorMap.emerald;

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-200">
      <div className="absolute right-0 top-0 h-2 w-full bg-gradient-to-r" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
          {subtext && <p className="mt-1 text-xs text-slate-500 font-medium">{subtext}</p>}
        </div>
        <span className={`grid h-12 w-12 place-items-center rounded-xl border ${style.bg} shadow-inner`}>
          {icon}
        </span>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, description }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h2>
    <p className="mt-1 text-sm text-slate-500 font-medium">{description}</p>
  </div>
);

// Sidebar Navigation
const AdminSidebar = ({ activePage, setActivePage, isOpen, setIsOpen, user, logout }) => {
  const navItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { id: "listings", label: "Listings", icon: <Building2 size={18} /> },
    { id: "inquiries", label: "Inquiries", icon: <ClipboardList size={18} /> },
    { id: "users", label: "Users", icon: <Users size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed left-0 top-[76px] z-50 flex h-[calc(100vh-76px)] w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-out lg:sticky lg:top-[76px] lg:z-10 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-md">
              <ShieldCheck size={22} />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Administrator</p>
              <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{user?.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 lg:hidden"
            aria-label="Close admin menu"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`flex h-11 w-full items-center gap-3.5 rounded-lg px-4 text-left text-sm font-semibold transition-all duration-150 ${
                activePage === item.id
                  ? "bg-emerald-50 text-emerald-700 shadow-sm border-l-4 border-emerald-700 rounded-l-none"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className={activePage === item.id ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-500"}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 space-y-2">
          <Link
            to="/"
            className="flex h-11 items-center gap-3.5 rounded-lg px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Home size={18} className="text-slate-400" />
            Go to website
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex h-11 w-full items-center gap-3.5 rounded-lg px-4 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut size={18} className="text-rose-400" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

// Overview Tab Component
const OverviewPage = ({ summary, inquiries, users }) => {
  const stats = [
    {
      label: "Total accounts",
      value: summary?.users ?? "-",
      subtext: `${summary?.clients ?? 0} clients, ${summary?.admins ?? 0} admins`,
      icon: <Users size={22} />,
      color: "indigo",
    },
    {
      label: "Total Listings",
      value: summary ? summary.buyProperties + summary.rentProperties : "-",
      subtext: `${summary?.buyProperties ?? 0} buy, ${summary?.rentProperties ?? 0} rent`,
      icon: <Building2 size={22} />,
      color: "emerald",
    },
    {
      label: "Client Inquiries",
      value: summary?.totalInquiries ?? "-",
      subtext: `${summary?.buyInquiries ?? 0} buy, ${summary?.rentInquiries ?? 0} rent`,
      icon: <ClipboardList size={22} />,
      color: "amber",
    },
    {
      label: "Admin Creations",
      value: summary ? summary.adminBuyProperties + summary.adminRentProperties : "-",
      subtext: "Properties created by admins",
      icon: <ShieldCheck size={22} />,
      color: "rose",
    },
  ];

  // Recharts simulated inquiry / user metrics
  const chartData = [
    { name: "Mon", Inquiries: 2, Users: 1 },
    { name: "Tue", Inquiries: 4, Users: 2 },
    { name: "Wed", Inquiries: 3, Users: 1 },
    { name: "Thu", Inquiries: 7, Users: 3 },
    { name: "Fri", Inquiries: 5, Users: 2 },
    { name: "Sat", Inquiries: summary?.totalInquiries ? Math.round(summary.totalInquiries * 0.4) : 8, Users: 4 },
    { name: "Sun", Inquiries: summary?.totalInquiries ?? 12, Users: summary?.users ?? 6 },
  ];

  const pieData = [
    { name: "For Sale", value: summary?.buyProperties ?? 5, color: "#0f766e" },
    { name: "For Rent", value: summary?.rentProperties ?? 5, color: "#4f46e5" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Dashboard Overview" description="Analytical insights on registrations, listings, and client inquiries." />
      
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatBlock key={stat.label} {...stat} />
        ))}
      </section>

      {/* Visual Analytics */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Activity Trends</h3>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              <TrendingUp size={14} />
              Real-time update
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="Inquiries" stroke="#0f766e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInq)" />
                <Area type="monotone" dataKey="Users" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "15px" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Properties Breakdown</h3>
            <p className="text-xs text-slate-400 font-medium mb-4">Distribution by listing category</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            {summary?.buyProperties === 0 && summary?.rentProperties === 0 ? (
              <p className="text-sm text-slate-400">No properties available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} houses`, "Count"]} />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Side-by-side feeds */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Inquiries</h3>
            <Link to="#" onClick={(e) => { e.preventDefault(); }} className="text-xs font-bold text-emerald-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {inquiries.slice(0, 3).map((inq) => (
              <div key={inq.id} className="flex gap-3 items-start border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-amber-50 text-amber-700">
                  <ClipboardList size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{inq.propertyTitle}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                    From {inq.buyer?.name || inq.renter?.name} ({inq.buyer?.email || inq.renter?.email})
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                  inq.status === "new" ? "bg-amber-50 text-amber-700" :
                  inq.status === "contacted" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {inq.status}
                </span>
              </div>
            ))}
            {inquiries.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No recent inquiries</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Registered Users</h3>
            <Link to="#" onClick={(e) => { e.preventDefault(); }} className="text-xs font-bold text-emerald-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {users.slice(0, 3).map((user) => (
              <div key={user.id} className="flex gap-3 items-center border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 font-bold text-slate-700 uppercase">
                  {user.name?.charAt(0) || "U"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">{user.email}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                  user.role === "admin" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No registered users</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

// Form Field helper
const FormField = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</span>
    {children}
  </label>
);

// Listings Tab Component
const ListingsPage = ({ properties, token, onRefresh, showToast }) => {
  const [form, setForm] = useState({
    listingType: "buy",
    title: "",
    location: "",
    price: "",
    type: "",
    bedrooms: "3",
    bathrooms: "3",
    sizeSqm: "120",
    image: "",
    description: "",
    features: "",
    agentName: "",
    agentPhone: "",
    agentEmail: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateProperty = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`${API_URL}/admin/properties`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add property.");
      }

      showToast(data.message || "Property added successfully.", "success");
      setForm({
        listingType: "buy",
        title: "",
        location: "",
        price: "",
        type: "",
        bedrooms: "3",
        bathrooms: "3",
        sizeSqm: "120",
        image: "",
        description: "",
        features: "",
        agentName: "",
        agentPhone: "",
        agentEmail: "",
      });
      setShowAddForm(false);
      onRefresh();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProperty = async (id) => {
    try {
      const response = await fetch(`${API_URL}/admin/properties/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete property.");
      }

      showToast(data.message || "Property deleted successfully.", "success");
      setConfirmDeleteId(null);
      onRefresh();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase()) ||
      p.type?.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      filterType === "all" ||
      (filterType === "buy" && p.listingType === "buy") ||
      (filterType === "rent" && p.listingType === "rent");

    return matchesSearch && matchesType;
  });

  const fieldClass = "h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none focus:bg-white transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader title="Listings Management" description="Publish, filter, and delete houses on StayNest." />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex h-11 items-center justify-center gap-2 rounded-lg px-5 font-semibold text-sm transition-all duration-200 shadow-sm ${
            showAddForm
              ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
              : "bg-emerald-700 text-white hover:bg-emerald-800"
          }`}
        >
          {showAddForm ? <Sliders size={16} /> : <PlusCircle size={16} />}
          {showAddForm ? "Show Listings" : "Add Property"}
        </button>
      </div>

      {showAddForm ? (
        <form onSubmit={handleCreateProperty} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in">
          <div className="mb-6 flex items-center gap-2.5">
            <PlusCircle size={22} className="text-emerald-700" />
            <h3 className="text-lg font-bold text-slate-900">Add New House Listing</h3>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <FormField label="Listing category">
              <select value={form.listingType} onChange={(e) => updateField("listingType", e.target.value)} className={fieldClass}>
                <option value="buy">For Sale (Buy)</option>
                <option value="rent">For Rent (Rentals)</option>
              </select>
            </FormField>

            <FormField label="Title">
              <input value={form.title} onChange={(e) => updateField("title", e.target.value)} className={fieldClass} placeholder="Skyline Royal Duplex" required />
            </FormField>

            <FormField label="Location">
              <input value={form.location} onChange={(e) => updateField("location", e.target.value)} className={fieldClass} placeholder="Banana Island, Lagos" required />
            </FormField>

            <FormField label="Property Type">
              <input value={form.type} onChange={(e) => updateField("type", e.target.value)} className={fieldClass} placeholder="Duplex, Apartment, Villa" required />
            </FormField>

            <FormField label="Price (NGN)">
              <input type="number" min="1" value={form.price} onChange={(e) => updateField("price", e.target.value)} className={fieldClass} placeholder="Price" required />
            </FormField>

            <FormField label="Bedrooms">
              <input type="number" min="0" value={form.bedrooms} onChange={(e) => updateField("bedrooms", e.target.value)} className={fieldClass} required />
            </FormField>

            <FormField label="Bathrooms">
              <input type="number" min="0" value={form.bathrooms} onChange={(e) => updateField("bathrooms", e.target.value)} className={fieldClass} required />
            </FormField>

            <FormField label="Size (Sqm)">
              <input type="number" min="1" value={form.sizeSqm} onChange={(e) => updateField("sizeSqm", e.target.value)} className={fieldClass} required />
            </FormField>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <FormField label="Image URL">
              <input value={form.image} onChange={(e) => updateField("image", e.target.value)} className={fieldClass} placeholder="https://unsplash.com/photos/..." />
            </FormField>

            <FormField label="Key Features (Comma Separated)">
              <input value={form.features} onChange={(e) => updateField("features", e.target.value)} className={fieldClass} placeholder="Pool, Parking, Smart Automation" />
            </FormField>
          </div>

          <div className="mt-5">
            <FormField label="Description">
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none focus:bg-white transition-all resize-y"
                placeholder="Describe the house's key amenities and neighborhood details..."
                required
              />
            </FormField>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Agent Contact details (Optional)</h4>
            <div className="grid gap-5 md:grid-cols-3">
              <FormField label="Agent name">
                <input value={form.agentName} onChange={(e) => updateField("agentName", e.target.value)} className={fieldClass} placeholder="Ngozi Balogun" />
              </FormField>
              <FormField label="Agent phone">
                <input value={form.agentPhone} onChange={(e) => updateField("agentPhone", e.target.value)} className={fieldClass} placeholder="234..." />
              </FormField>
              <FormField label="Agent email">
                <input type="email" value={form.agentEmail} onChange={(e) => updateField("agentEmail", e.target.value)} className={fieldClass} placeholder="ngozi@..." />
              </FormField>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-6 font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <PlusCircle size={18} />}
            Publish Property
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search listings by title, location, type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-slate-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Filter size={14} /> Category:
              </span>
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                {["all", "buy", "rent"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`h-8 rounded-md px-3 text-xs font-bold uppercase tracking-wider transition ${
                      filterType === t
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Listings Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Property info</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Specs</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="h-12 w-16 rounded-md object-cover border border-slate-200 shrink-0 bg-slate-100"
                          onError={(e) => {
                            e.target.src = fallbackPropertyImage;
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[200px]">{p.title}</p>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">{p.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider ${
                        p.listingType === "buy"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                      }`}>
                        {p.listingType === "buy" ? "For Sale" : "Rental"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{p.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {p.priceLabel}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                      <div className="flex flex-col gap-0.5">
                        <span>{p.bedrooms} Beds • {p.bathrooms} Baths</span>
                        <span className="text-[10px] text-slate-400 font-medium">{p.sizeSqm} Sqm</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {confirmDeleteId === p.id ? (
                        <div className="flex items-center justify-center gap-2 animate-fade-in">
                          <button
                            onClick={() => handleDeleteProperty(p.id)}
                            className="bg-rose-600 text-white rounded px-2.5 py-1 text-xs font-bold hover:bg-rose-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="bg-slate-200 text-slate-700 rounded px-2.5 py-1 text-xs font-bold hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <Link
                            to={p.listingType === "buy" ? `/buy/${p.id <= 9 ? p.id : "1"}` : `/rent/${p.id <= 9 ? p.id : "1"}`}
                            className="text-slate-500 hover:text-slate-700"
                            title="View on site"
                          >
                            <ExternalLink size={16} />
                          </Link>
                          <button
                            onClick={() => setConfirmDeleteId(p.id)}
                            className="text-slate-400 hover:text-rose-600"
                            title="Delete listing"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredProperties.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                      No listings found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Inquiries Tab Component
const InquiriesPage = ({ inquiries, token, onRefresh, showToast }) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/admin/inquiries/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update inquiry status.");
      }

      showToast("Inquiry status updated.", "success");
      if (activeInquiry?.id === id) {
        setActiveInquiry((prev) => ({ ...prev, status }));
      }
      onRefresh();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleDeleteInquiry = async (id) => {
    try {
      const response = await fetch(`${API_URL}/admin/inquiries/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete inquiry.");
      }

      showToast("Inquiry deleted successfully.", "success");
      setConfirmDeleteId(null);
      if (activeInquiry?.id === id) {
        setActiveInquiry(null);
      }
      onRefresh();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const buyerName = inq.buyer?.name || inq.renter?.name || "";
    const buyerEmail = inq.buyer?.email || inq.renter?.email || "";
    const matchesSearch =
      inq.propertyTitle?.toLowerCase().includes(search.toLowerCase()) ||
      buyerName.toLowerCase().includes(search.toLowerCase()) ||
      buyerEmail.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "all" || inq.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <SectionHeader title="Client Inquiries" description="Track and reply to incoming leads from interested property buyers and renters." />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left inquiries list panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by buyer name, email, or house..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-300"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                Status:
              </span>
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {["all", "new", "contacted", "closed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`h-7 rounded px-2 text-[10px] font-bold uppercase tracking-wider transition ${
                      filterStatus === st
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredInquiries.map((inq) => {
              const name = inq.buyer?.name || inq.renter?.name;
              const email = inq.buyer?.email || inq.renter?.email;
              const date = new Date(inq.createdAt).toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div
                  key={inq.id}
                  onClick={() => { setActiveInquiry(inq); setConfirmDeleteId(null); }}
                  className={`border rounded-xl p-4 cursor-pointer hover:border-slate-300 transition duration-150 relative ${
                    activeInquiry?.id === inq.id
                      ? "border-emerald-700 bg-emerald-50/20 shadow-sm"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{inq.propertyTitle}</h4>
                      <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1">
                        From {name} • <span className="text-slate-400 font-medium">{email}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        inq.status === "new" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        inq.status === "contacted" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {inq.status}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500 font-medium line-clamp-2">{inq.message}</p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Category: {inq.type === "buy" ? "Buyer Lead" : "Rental Lead"}</span>
                    <span>{date}</span>
                  </div>
                </div>
              );
            })}

            {filteredInquiries.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-12 font-medium">No inquiries found.</p>
            )}
          </div>
        </div>

        {/* Right details panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between min-h-[400px]">
          {activeInquiry ? (
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-base">Inquiry details</h3>
                  <button
                    onClick={() => setActiveInquiry(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4 mt-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Property Details</span>
                    <span className="text-sm font-bold text-slate-900 mt-1 block">{activeInquiry.propertyTitle}</span>
                    <span className="text-xs font-semibold text-emerald-700 mt-0.5 block capitalize">
                      {activeInquiry.type === "buy" ? "For Sale" : "Rental Inquiry"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Client Contact</span>
                    <p className="text-xs font-bold text-slate-900 mt-1">
                      {activeInquiry.buyer?.name || activeInquiry.renter?.name}
                    </p>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Email: {activeInquiry.buyer?.email || activeInquiry.renter?.email}
                    </p>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Phone: {activeInquiry.buyer?.phone || activeInquiry.renter?.phone || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Client Message</span>
                    <div className="mt-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {activeInquiry.message}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Update status</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "new", label: "New", icon: <Clock size={12} /> },
                      { id: "contacted", label: "Contact", icon: <CheckCircle2 size={12} /> },
                      { id: "closed", label: "Close", icon: <Check size={12} /> }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleUpdateStatus(activeInquiry.id, st.id)}
                        className={`flex h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                          activeInquiry.status === st.id
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {st.icon}
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  {confirmDeleteId === activeInquiry.id ? (
                    <div className="flex items-center gap-2 w-full justify-between animate-fade-in">
                      <span className="text-xs font-bold text-rose-700">Delete inquiry permanently?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteInquiry(activeInquiry.id)}
                          className="bg-rose-600 text-white rounded-lg px-3 py-1 text-xs font-bold hover:bg-rose-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="bg-slate-200 text-slate-700 rounded-lg px-3 py-1 text-xs font-bold hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(activeInquiry.id)}
                      className="flex h-9 items-center justify-center gap-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 px-4 text-xs font-bold w-full hover:bg-rose-100 transition"
                    >
                      <Trash2 size={14} />
                      Delete Inquiry
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center flex-1 space-y-2 py-10">
              <ClipboardList size={38} className="text-slate-300" />
              <p className="text-sm font-bold text-slate-800">No inquiry selected</p>
              <p className="text-xs text-slate-400 font-medium max-w-[200px]">
                Click on any inquiry card in the list to view full client message and take actions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Users Tab Component
const UsersPage = ({ users, token, onRefresh, showToast, currentUserId }) => {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user role.");
      }

      showToast(`User role updated to ${newRole}.`, "success");
      onRefresh();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user.");
      }

      showToast(data.message || "User account deleted.", "success");
      setConfirmDeleteId(null);
      onRefresh();
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <SectionHeader title="Admin & Client Accounts" description="Manage access privileges, promote moderators, or delete registered accounts." />

      <div className="space-y-4">
        {/* Filters bar */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search users by name or email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-slate-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              Filter Role:
            </span>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              {["all", "client", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`h-8 rounded-md px-3 text-xs font-bold uppercase tracking-wider transition ${
                    filterRole === r
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Account info</th>
                <th className="px-6 py-4">Access Role</th>
                <th className="px-6 py-4">Verified</th>
                <th className="px-6 py-4">Registered On</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentUserId;
                const regDate = new Date(u.createdAt || Date.now()).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-sm font-extrabold text-slate-700 uppercase">
                          {u.name?.charAt(0) || "U"}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            {u.name}
                            {isSelf && (
                              <span className="text-[9px] font-extrabold tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider ${
                        u.role === "admin"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        Verified
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                      {regDate}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isSelf ? (
                        <span className="text-xs text-slate-400 font-semibold">No actions</span>
                      ) : confirmDeleteId === u.id ? (
                        <div className="flex items-center justify-center gap-2 animate-fade-in">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="bg-rose-600 text-white rounded px-2.5 py-1 text-xs font-bold hover:bg-rose-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="bg-slate-200 text-slate-700 rounded px-2.5 py-1 text-xs font-bold hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-4">
                          {u.role === "admin" ? (
                            <button
                              onClick={() => handleUpdateRole(u.id, "client")}
                              className="text-slate-500 hover:text-slate-700 flex items-center gap-1 font-semibold text-xs"
                              title="Demote to client"
                            >
                              <UserMinus size={15} />
                              Demote
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateRole(u.id, "admin")}
                              className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-semibold text-xs"
                              title="Promote to admin"
                            >
                              <UserCheck size={15} />
                              Promote
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmDeleteId(u.id)}
                            className="text-slate-400 hover:text-rose-600"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No accounts found matching your search parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Settings Tab Component
const SettingsPage = ({ user, token, showToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  // Settings fields
  const [gmailUser, setGmailUser] = useState("");
  const [gmailAppPassword, setGmailAppPassword] = useState("");
  const [brevoApiKey, setBrevoApiKey] = useState("");
  const [brevoSenderEmail, setBrevoSenderEmail] = useState("");
  const [brevoSenderName, setBrevoSenderName] = useState("");
  const [preferredProvider, setPreferredProvider] = useState("auto");
  
  // Test email state
  const [testEmail, setTestEmail] = useState("");
  const [testProvider, setTestProvider] = useState("active");
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }

  const [activeMailerStatus, setActiveMailerStatus] = useState("Checking...");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load mailer settings.");
      
      const config = data.data;
      setGmailUser(config.gmailUser || "");
      setGmailAppPassword(config.hasGmailAppPassword ? "********" : "");
      setBrevoApiKey(config.hasBrevoApiKey ? "********" : "");
      setBrevoSenderEmail(config.brevoSenderEmail || "");
      setBrevoSenderName(config.brevoSenderName || "");
      setPreferredProvider(config.preferredProvider || "auto");
      
      // Determine active mailer status string
      const active = config.preferredProvider === "auto"
        ? (config.hasGmailAppPassword ? "gmail" : (config.hasBrevoApiKey ? "brevo" : "logger"))
        : config.preferredProvider;
      
      if (active === "gmail") {
        setActiveMailerStatus("Gmail Active");
      } else if (active === "brevo") {
        setActiveMailerStatus("Brevo Active");
      } else {
        setActiveMailerStatus("Logger Fallback");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error fetching mailer settings", "error");
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          gmailUser,
          gmailAppPassword,
          brevoApiKey,
          brevoSenderEmail,
          brevoSenderName,
          preferredProvider,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save settings.");
      
      showToast("Configuration saved successfully", "success");
      
      const config = data.data;
      setGmailAppPassword(config.hasGmailAppPassword ? "********" : "");
      setBrevoApiKey(config.hasBrevoApiKey ? "********" : "");
      
      // Determine active mailer status string
      const active = config.preferredProvider === "auto"
        ? (config.hasGmailAppPassword ? "gmail" : (config.hasBrevoApiKey ? "brevo" : "logger"))
        : config.preferredProvider;
      
      if (active === "gmail") {
        setActiveMailerStatus("Gmail Active");
      } else if (active === "brevo") {
        setActiveMailerStatus("Brevo Active");
      } else {
        setActiveMailerStatus("Logger Fallback");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error saving settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmail) {
      showToast("Please enter a test recipient email address", "error");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API_URL}/admin/settings/test-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          testEmail,
          provider: testProvider,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Test email delivery failed.");
      
      setTestResult({ success: true, message: "Verification email dispatched! Check your inbox/spam folder." });
      showToast("Test email sent!", "success");
    } catch (err) {
      console.error(err);
      setTestResult({ success: false, message: err.message || "Delivery failed. Please check key validity." });
      showToast("Test email failed to send", "error");
    } finally {
      setTesting(false);
    }
  };

  const profileDetails = [
    { label: "Admin name", value: user?.name },
    { label: "Email Address", value: user?.email },
    { label: "Access level", value: "Super Administrator", extra: "Full Read/Write Access" },
    { label: "API Base URL", value: API_URL, code: true },
    { label: "Node environment", value: "Development (JSON Storage)", code: true },
  ];

  const fieldClass = "h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-emerald-500 transition-all";

  return (
    <div className="space-y-6">
      <SectionHeader title="Workspace Configuration" description="View account details, permissions, and server integration settings." />

      {loading ? (
        <div className="flex h-60 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
            <span className="text-sm font-bold text-slate-500">Loading configurations...</span>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Admin Profile */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Admin Profile Details</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                {profileDetails.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{item.label}</span>
                    <span className={`text-sm font-bold text-slate-900 block ${item.code ? "font-mono text-xs bg-slate-50 border border-slate-100 px-2.5 py-1 rounded w-fit" : ""}`}>
                      {item.value}
                    </span>
                    {item.extra && <span className="text-[10px] text-slate-400 font-semibold">{item.extra}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Email Integrations Form */}
            <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Email Gateway Settings</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Configure active/fallback mailer details used to dispatch user verification and confirmation emails.</p>
              </div>

              {/* Provider Selection */}
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Preferred Email Provider">
                  <select
                    value={preferredProvider}
                    onChange={(e) => setPreferredProvider(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="auto">Auto-Detect (Priority: Gmail &gt; Brevo)</option>
                    <option value="gmail">Gmail SMTP (Nodemailer)</option>
                    <option value="brevo">Brevo Transactional API (Fetch)</option>
                    <option value="logger">Development Console Logger (Mock)</option>
                  </select>
                </FormField>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 border-t border-slate-100 pt-5">
                {/* Brevo Settings Card */}
                <div className="space-y-4 border-r border-slate-100 pr-0 sm:pr-6">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    Brevo Transactional API
                  </h4>
                  <FormField label="Brevo API Key">
                    <input
                      type="password"
                      value={brevoApiKey}
                      onChange={(e) => setBrevoApiKey(e.target.value)}
                      placeholder={brevoApiKey ? "********" : "Paste Brevo SMTP API key"}
                      className={fieldClass}
                    />
                  </FormField>
                  <FormField label="Verified Sender Email">
                    <input
                      type="email"
                      value={brevoSenderEmail}
                      onChange={(e) => setBrevoSenderEmail(e.target.value)}
                      placeholder="e.g. hello@yourdomain.com"
                      className={fieldClass}
                    />
                  </FormField>
                  <FormField label="Sender Display Name">
                    <input
                      type="text"
                      value={brevoSenderName}
                      onChange={(e) => setBrevoSenderName(e.target.value)}
                      placeholder="e.g. StayNest Customer Service"
                      className={fieldClass}
                    />
                  </FormField>
                </div>

                {/* Gmail Settings Card */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    Gmail SMTP Gateway
                  </h4>
                  <FormField label="Gmail User Email">
                    <input
                      type="email"
                      value={gmailUser}
                      onChange={(e) => setGmailUser(e.target.value)}
                      placeholder="e.g. example@gmail.com"
                      className={fieldClass}
                    />
                  </FormField>
                  <FormField label="Gmail App Password">
                    <input
                      type="password"
                      value={gmailAppPassword}
                      onChange={(e) => setGmailAppPassword(e.target.value)}
                      placeholder={gmailAppPassword ? "********" : "16-char Google App Password"}
                      className={fieldClass}
                    />
                  </FormField>
                  <div className="text-[10px] text-slate-400 font-medium leading-normal bg-slate-50 border border-slate-100 p-3 rounded-lg mt-4">
                    <strong>Gmail Configuration Tip:</strong> 2-Step Verification must be enabled on your Gmail account to generate and use a 16-character App Password.
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 font-bold text-white text-sm transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    "Save Configuration"
                  )}
                </button>
              </div>
            </form>

            {/* Connection Tester */}
            <form onSubmit={handleTestEmail} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Gateway Connection Tester</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Dispatch a live verification/test email to confirm that your SMTP/API settings are correct.</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <FormField label="Recipient Email Address">
                    <input
                      type="email"
                      required
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="enter.your.email@domain.com"
                      className={fieldClass}
                    />
                  </FormField>
                </div>
                <FormField label="Gateway to Test">
                  <select
                    value={testProvider}
                    onChange={(e) => setTestProvider(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="active">Active Provider</option>
                    <option value="gmail">Gmail Gateway</option>
                    <option value="brevo">Brevo Gateway</option>
                  </select>
                </FormField>
              </div>

              {testResult && (
                <div className={`p-4 rounded-lg flex items-start gap-3 border ${
                  testResult.success 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}>
                  <span className="mt-0.5">
                    {testResult.success ? (
                      <CheckCircle2 size={18} className="text-emerald-700" />
                    ) : (
                      <AlertCircle size={18} className="text-rose-700" />
                    )}
                  </span>
                  <div className="text-xs">
                    <p className="font-bold">{testResult.success ? "Test Succeeded" : "Connection/Delivery Failure"}</p>
                    <p className="mt-0.5 font-medium leading-relaxed">{testResult.message}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={testing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 font-bold text-slate-700 text-sm transition-all disabled:opacity-50 bg-white"
                >
                  {testing ? (
                    <>
                      <Loader2 className="animate-spin text-slate-500" size={16} />
                      Testing Delivery...
                    </>
                  ) : (
                    "Send Test Email"
                  )}
                </button>
              </div>
            </form>

          </div>

          {/* Right Column: Status & Statistics */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between h-fit space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">Workspace Info</h3>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Properties sync</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Mailer status</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      activeMailerStatus === "Gmail Active" 
                        ? "text-rose-700 bg-rose-50"
                        : activeMailerStatus === "Brevo Active"
                        ? "text-blue-700 bg-blue-50"
                        : "text-slate-500 bg-slate-100"
                    }`}>
                      {activeMailerStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">JSON Database</span>
                    <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">Healthy</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                StayNest Admin v2.0. Built with React, Tailwind CSS, Express, and Recharts. Access tokens automatically expire after 24 hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Main Dashboard Component
const AdminDashboard = () => {
  const { token, user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);

  const [activePage, setActivePage] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const loadDashboardData = useCallback(async () => {
    setIsPageLoading(true);
    try {
      // 1. Load Summary
      const summaryRes = await fetch(`${API_URL}/admin/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const summaryData = await summaryRes.json();
      if (!summaryRes.ok) throw new Error(summaryData.message || "Failed to load summary.");
      setSummary(summaryData.data);

      // 2. Load Properties
      const propertiesRes = await fetch(`${API_URL}/admin/properties`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const propertiesData = await propertiesRes.json();
      if (!propertiesRes.ok) throw new Error(propertiesData.message || "Failed to load properties.");
      setProperties(propertiesData.data);

      // 3. Load Inquiries
      const inquiriesRes = await fetch(`${API_URL}/admin/inquiries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const inquiriesData = await inquiriesRes.json();
      if (!inquiriesRes.ok) throw new Error(inquiriesData.message || "Failed to load inquiries.");
      setInquiries(inquiriesData.data);

      // 4. Load Users
      const usersRes = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersRes.json();
      if (!usersRes.ok) throw new Error(usersData.message || "Failed to load users.");
      setUsers(usersData.data);

    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsPageLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [loadDashboardData, token]);

  const renderActivePage = () => {
    if (isPageLoading && !summary) {
      return (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-emerald-700" size={36} />
          <p className="text-sm font-bold text-slate-600">Loading admin workspace...</p>
        </div>
      );
    }

    switch (activePage) {
      case "listings":
        return (
          <ListingsPage
            properties={properties}
            token={token}
            onRefresh={loadDashboardData}
            showToast={showToast}
          />
        );
      case "inquiries":
        return (
          <InquiriesPage
            inquiries={inquiries}
            token={token}
            onRefresh={loadDashboardData}
            showToast={showToast}
          />
        );
      case "users":
        return (
          <UsersPage
            users={users}
            token={token}
            onRefresh={loadDashboardData}
            showToast={showToast}
            currentUserId={user?.id}
          />
        );
      case "settings":
        return <SettingsPage user={user} token={token} showToast={showToast} />;
      default:
        return <OverviewPage summary={summary} inquiries={inquiries} users={users} />;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="lg:grid lg:grid-cols-[18rem_1fr]">
        <AdminSidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          user={user}
          logout={logout}
        />

        <div className="min-w-0 px-6 py-6 lg:px-10 lg:py-8 space-y-6">
          {/* Header Dashboard Bar */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <ShieldCheck size={16} />
                StayNest Admin Hub
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight capitalize">{activePage}</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadDashboardData}
                disabled={isPageLoading}
                className="hidden md:flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
              >
                {isPageLoading ? <Loader2 className="animate-spin text-emerald-700 mr-2" size={14} /> : null}
                Refresh Data
              </button>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="flex h-10 w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 lg:hidden shadow-sm hover:bg-slate-50 transition"
              >
                <Menu size={16} />
                Menu
              </button>
            </div>
          </div>

          {renderActivePage()}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
};

const fallbackPropertyImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

// Export Entry Point with Login Wrapper
export default function Admin() {
  const { user, adminLogin, adminSignup, logout } = useAuth();
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  if (user?.role === "admin") {
    return <AdminDashboard />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (mode === "signup" && password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (mode === "signup" && password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await adminLogin(email, password);
      } else {
        await adminSignup(name, email, password);
      }
    } catch (error) {
      setFormError(error.message || "Admin authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[0.9fr_1.1fr]">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <section
        className="hidden bg-cover bg-center lg:block relative"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.72)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/60 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white z-10 space-y-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-300">
            <ShieldCheck size={18} />
            StayNest Administrator Workspace
          </p>
          <h1 className="max-w-xl text-5xl font-extrabold leading-tight tracking-tight">
            Seamlessly control listings, verify inquiries, and scale operations.
          </h1>
          <p className="text-sm font-medium text-slate-300 max-w-md">
            Authorize new listing creations, toggle moderator access levels, and follow up directly on user inquiries.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div>
            <Link to="/" className="inline-block text-3xl font-extrabold tracking-tight text-slate-900">
              Stay<span className="text-emerald-700">Nest</span>
            </Link>
            <h2 className="mt-6 text-2xl font-extrabold text-slate-900">
              {mode === "signin" ? "Admin login" : "Create admin account"}
            </h2>
            <p className="mt-1 text-sm text-slate-500 font-medium">
              {mode === "signin"
                ? "Enter your credentials to unlock the admin panel."
                : "Create an administrator profile to begin."}
            </p>
          </div>

          {user && user.role !== "admin" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 font-semibold flex items-center justify-between">
              <span>You are signed in as a client. Please log out first.</span>
              <button onClick={logout} className="font-bold text-amber-900 underline ml-2 shrink-0">
                Log out
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
            {[
              { id: "signin", label: "Sign In" },
              { id: "signup", label: "Sign Up" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setMode(item.id);
                  setFormError("");
                }}
                className={`h-10 rounded-lg text-sm font-bold tracking-wide transition-all ${
                  mode === item.id ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-800 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-slate-400 transition"
                    placeholder="Enter name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Gmail Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-slate-400 transition"
                  placeholder="admin@gmail.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-11 pr-10 text-sm text-slate-900 outline-none focus:bg-white focus:border-slate-400 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none focus:bg-white focus:border-slate-400 transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (user && user.role !== "admin")}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 font-bold text-white shadow-sm hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin text-white" size={20} />
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In to Dashboard" : "Create Admin Account"}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs font-medium text-slate-400">
            Looking for a customer account?{" "}
            <Link to={mode === "signin" ? "/login" : "/signup"} className="font-bold text-emerald-700 hover:underline">
              Open Customer Portal
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
