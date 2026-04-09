import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, GraduationCap, Languages, Briefcase, Copy, DollarSign, CreditCard, ShoppingCart, LayoutDashboard, User, HelpCircle, Mail, Users, UserCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

interface SidebarMenuProps {
  onClose: () => void;
}

const menuGroups = [
  {
    label: "Services",
    icon: GraduationCap,
    children: [
      { label: "Evaluations", href: "/evaluations", icon: GraduationCap },
      { label: "Translations", href: "/translations", icon: Languages },
      { label: "Consulting", href: "/consulting", icon: Briefcase },
      { label: "Duplicate Report", href: "/duplicate-reports", icon: Copy },
    ],
  },
  {
    label: "Billing & Plans",
    icon: DollarSign,
    children: [
      { label: "Pricing", href: "/pricing", icon: DollarSign },
      { label: "Payment", href: "/payment", icon: CreditCard },
      { label: "Cart", href: "/cart", icon: ShoppingCart },
    ],
  },
  {
    label: "Client Portal",
    icon: LayoutDashboard,
    children: [
      { label: "My Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Account", href: "/account", icon: User },
    ],
  },
  {
    label: "Support & Help",
    icon: HelpCircle,
    children: [
      { label: "FAQ", href: "/faq", icon: HelpCircle },
      { label: "Contact", href: "/contact", icon: Mail },
    ],
  },
  {
    label: "Company",
    icon: Users,
    children: [
      { label: "About Us", href: "/about", icon: Users },
      { label: "Career Opportunities", href: "/careers", icon: UserCheck },
    ],
  },
];

const SidebarMenu = ({ onClose }: SidebarMenuProps) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { translate } = useLocale();

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const getDashboardHref = () => {
    if (!user) return "/login";
    return user.role === "staff" ? "/dashboard/staff" : "/dashboard/client";
  };

  return (
    <div className="flex flex-col py-2">
      {menuGroups.map((group) => {
        // Hide Client Portal if not logged in
        if (group.label === "Client Portal" && !user) return null;

        const isOpen = !!openGroups[group.label];
        const GroupIcon = group.icon;
        const hasActiveChild = group.children.some((c) =>
          c.href === "/dashboard"
            ? location.pathname.startsWith("/dashboard")
            : location.pathname === c.href
        );

        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
                hasActiveChild
                  ? "text-accent"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <GroupIcon size={20} className={hasActiveChild ? "text-accent" : "text-muted-foreground"} />
              <span className="text-sm font-semibold tracking-wide flex-1 text-left">
                {translate(group.label)}
              </span>
              <ChevronDown
                size={16}
                className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="bg-muted/30">
                {group.children.map((child) => {
                  const ChildIcon = child.icon;
                  const href =
                    child.href === "/dashboard" ? getDashboardHref() : child.href;
                  const isActive =
                    child.href === "/dashboard"
                      ? location.pathname.startsWith("/dashboard")
                      : location.pathname === child.href;

                  return (
                    <Link
                      key={child.label}
                      to={href}
                      onClick={onClose}
                      className={`flex items-center gap-4 pl-14 pr-6 py-3 transition-all duration-200 ${
                        isActive
                          ? "bg-accent/10 text-accent border-r-4 border-accent"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <ChildIcon size={18} className={isActive ? "text-accent" : "text-muted-foreground"} />
                      <span className="text-sm font-medium tracking-wide">
                        {translate(child.label)}
                      </span>
                      {child.href === "/cart" && totalItems > 0 && (
                        <span className="ml-auto w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                          {totalItems}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Login link when not logged in */}
      {!user && (
        <Link
          to="/login"
          onClick={onClose}
          className={`flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
            location.pathname.startsWith("/login") || location.pathname === "/signup"
              ? "bg-accent/10 text-accent border-r-4 border-accent"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <User size={20} className={location.pathname.startsWith("/login") ? "text-accent" : "text-muted-foreground"} />
          <span className="text-sm font-semibold tracking-wide">{translate("Login")}</span>
        </Link>
      )}
    </div>
  );
};

export default SidebarMenu;
