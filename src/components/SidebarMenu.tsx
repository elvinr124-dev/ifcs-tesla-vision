import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { LogOut, LogIn } from "lucide-react";

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

  const getDashboardHref = () => {
    if (!user) return "/login";
    return user.role === "staff" ? "/dashboard/staff" : "/dashboard/client";
  };

  return (
    <div className="flex flex-col py-4 px-6">
      {menuGroups.map((group) => (
        <div key={group.label} className="mb-5">
          <h3 className="text-sm font-bold text-foreground mb-2">
            {translate(group.label)}
          </h3>
          <ul className="space-y-1 pl-4">
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
                    className={`flex items-center gap-2 text-sm py-1 transition-colors ${
                      isActive
                        ? "text-accent font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="text-muted-foreground">•</span>
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
        </div>
      ))}

      {/* Login / Sign Out */}
      <div className="border-t border-border pt-4 mt-2">
        {user ? (
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors w-full py-2"
          >
            <LogOut size={18} />
            {translate("Sign Out")}
          </button>
        ) : (
          <Link
            to="/login"
            onClick={onClose}
            className="flex items-center gap-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors w-full py-2"
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
