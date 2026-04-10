import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { LogOut, LogIn, ChevronDown } from "lucide-react";

interface SidebarMenuProps {
  onClose: () => void;
}

const menuGroups = [
  {
    label: "Services",
    children: [
      { label: "Evaluations", href: "/evaluations" },
      { label: "Translations", href: "/translations" },
      { label: "Consulting", href: "/consulting" },
      { label: "Duplicate Report", href: "/duplicate-reports" },
    ],
  },
  {
    label: "Billing & Plans",
    children: [
      { label: "Pricing", href: "/pricing" },
      { label: "Payment", href: "/payment" },
      { label: "Cart", href: "/cart" },
    ],
  },
  {
    label: "Client Portal",
    children: [
      { label: "My Dashboard", href: "/dashboard" },
      { label: "My Account", href: "/account" },
    ],
  },
  {
    label: "Support & Help",
    children: [
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    label: "Company",
    children: [
      { label: "About Us", href: "/about" },
      { label: "Career Opportunities", href: "/careers" },
    ],
  },
];

const SidebarMenu = ({ onClose }: SidebarMenuProps) => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { translate } = useLocale();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const getDashboardHref = () => {
    if (!user) return "/login";
    return user.role === "staff" ? "/dashboard/staff" : "/dashboard/client";
  };

  return (
    <div className="flex flex-col py-4 px-5 space-y-1.5">
      {menuGroups.map((group) => {
        const isOpen = openGroups[group.label];
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className={`w-full flex items-center justify-between px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 border ${
                isOpen
                  ? "bg-accent text-accent-foreground border-accent shadow-md shadow-accent/15"
                  : "bg-card border-border text-foreground hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
              }`}
            >
              <span>{translate(group.label)}</span>
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <ul className="space-y-0.5 pl-3 pt-1.5 pb-2 animate-in slide-in-from-top-1 duration-200">
                {group.children.map((child) => {
                  const href =
                    child.href === "/dashboard" ? getDashboardHref() : child.href;
                  const isActive =
                    child.href === "/dashboard"
                      ? location.pathname.startsWith("/dashboard")
                      : location.pathname === child.href;

                  return (
                    <li key={child.label}>
                      <Link
                        to={href}
                        onClick={onClose}
                        className={`flex items-center gap-2.5 text-sm py-2.5 px-4 rounded-full transition-all duration-150 ${
                          isActive
                            ? "text-accent font-semibold bg-accent/10 border border-accent/20"
                            : "text-muted-foreground hover:text-accent hover:bg-accent/5"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-accent" : "bg-muted-foreground/40"}`} />
                        <span>{translate(child.label)}</span>
                        {child.href === "/cart" && totalItems > 0 && (
                          <span className="ml-auto w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                            {totalItems}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}

      {/* Login / Sign Out */}
      <div className="border-t border-border pt-3 mt-2">
        {user ? (
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-3 text-sm font-semibold text-muted-foreground hover:text-accent transition-colors w-full py-3 px-5 rounded-full hover:bg-accent/5"
          >
            <LogOut size={18} />
            {translate("Sign Out")}
          </button>
        ) : (
          <Link
            to="/login"
            onClick={onClose}
            className="flex items-center gap-3 text-sm font-semibold text-muted-foreground hover:text-accent transition-colors w-full py-3 px-5 rounded-full hover:bg-accent/5"
          >
            <LogIn size={18} />
            {translate("Login")}
          </Link>
        )}
      </div>
    </div>
  );
};

export default SidebarMenu;
