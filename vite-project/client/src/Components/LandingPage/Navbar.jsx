import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, LogOut, Menu, User, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="fixed top-0 z-50 flex h-[76px] w-full items-center justify-between border-b border-slate-200 bg-white/95 px-5 shadow-sm backdrop-blur md:px-8">
      <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
        <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-700 text-white">
          <Building2 size={21} />
        </span>
        <span className="text-2xl font-bold tracking-tight text-slate-950">
          Stay<span className="text-emerald-700">Nest</span>
        </span>
      </Link>

      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 md:hidden"
        aria-label="Toggle navigation"
      >
        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      <ul className="mr-4 flex items-center gap-7 max-md:hidden">
        {[
          { name: "Rentals", path: "/rent" },
          { name: "Buy", path: "/buy" },
          { name: "Find an Agent", path: "/find-an-agent" },
          { name: "Contact", path: "/Contact" },
        ].map((item) => (
          <li key={item.path} className="relative group">
            <Link
              to={item.path}
              className={`
                text-sm font-semibold text-slate-700
                ${isActive(item.path) ? "text-emerald-700" : ""}
                transition-colors duration-300 py-2 block
              `}
            >
              {item.name}
              <span
                className={`
                  absolute left-0 -bottom-0.5 h-0.5 bg-emerald-700
                  transition-all duration-300
                  ${isActive(item.path) ? "w-full" : "w-0 group-hover:w-full"}
                `}
              ></span>
            </Link>
          </li>
        ))}

        {user ? (
          <li className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <User size={16} className="text-emerald-700" />
              {user.name}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <LogOut size={16} />
              Logout
            </button>
          </li>
        ) : (
          <li>
            <button
              onClick={() => navigate("/login")}
              className="rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              Sign in
            </button>
          </li>
        )}
      </ul>

      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-[76px] z-40 border-t border-slate-200 bg-white shadow-lg md:hidden">
          <ul className="flex flex-col gap-2 p-4">
            {[
              { name: "Rentals", path: "/rent" },
              { name: "Buy", path: "/buy" },
              { name: "Find an Agent", path: "/find-an-agent" },
              { name: "Contact", path: "/Contact" },
            ].map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={closeMenu}
                  className={`block rounded-md px-3 py-2 font-semibold text-slate-700 transition-colors duration-300 ${
                    isActive(item.path)
                      ? "bg-emerald-50 text-emerald-700"
                      : ""
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}

            {user ? (
              <>
                <li className="flex items-center gap-1.5 border-t border-slate-100 px-3 py-2 font-semibold text-slate-700">
                  <User size={16} className="text-emerald-700" />
                  {user.name}
                </li>
                <li>
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-950 px-3 py-2 font-semibold text-white transition hover:bg-slate-800"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="border-t border-slate-100 pt-2">
                <button
                  onClick={() => {
                    navigate("/login");
                    closeMenu();
                  }}
                  className="w-full rounded-md bg-emerald-700 px-3 py-2 text-center font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                >
                  Sign in
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;