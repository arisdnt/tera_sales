import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard as FiDashboard, 
  CreditCard as FiCreditCard, 
  Truck as FiTruck, 
  DollarSign as FiDollarSign, 
  Package as FiPackage, 
  ShoppingCart as FiShoppingCart, 
  Users as FiUsers, 
  LogOut as FiLogOut,
  Minimize as FiMinimize,
  Maximize as FiMaximize,
  X as FiX,
  ChevronDown as FiChevronDown
} from "lucide-react";

type Props = {
  title?: string;
  tab?: string;
  onChangeTab?: (tab: string) => void;
  showNav?: boolean;
  rightSlot?: ReactNode;
};

export function Navbar({ title = "Tera Sales", tab, onChangeTab, rightSlot, showNav = true }: Props) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleMenuClick = (menuItem: string) => {
    onChangeTab?.(menuItem);
    setOpenDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdown]);

  return (
    <header
      className="sticky top-0 z-50 h-12 w-full bg-[#005461] border-b border-teal-700"
      data-tauri-drag-region
    >
      <div className="h-full w-full flex items-center justify-start px-5" data-tauri-drag-region>
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5" data-tauri-drag-region>
          <div className="w-6 h-6 bg-white flex items-center justify-center" aria-hidden="true">
            <svg className="w-3.5 h-3.5 text-[#005461]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white tracking-tight" data-tauri-drag-region>
            {title}
          </span>
        </div>

        {/* Navigation */}
        {showNav && (
          <nav className="flex items-center gap-1 ml-6" aria-label="Main Navigation">
            {/* Dashboard */}
            <NavButton
              active={tab === "dashboard"}
              onClick={() => handleMenuClick("dashboard")}
            >
              <FiDashboard className="mr-1.5" size={14} />
              Dashboard
            </NavButton>

            {/* Transaksi Dropdown */}
            <DropdownMenu
              label="Transaksi"
              icon={<FiCreditCard size={14} />}
              isOpen={openDropdown === "transaksi"}
              onToggle={() => setOpenDropdown(openDropdown === "transaksi" ? null : "transaksi")}
              items={[
                { label: "Pembayaran", value: "pembayaran", icon: <FiCreditCard size={16} /> },
                { label: "Pengiriman", value: "pengiriman", icon: <FiTruck size={16} /> },
                { label: "Pengeluaran", value: "pengeluaran", icon: <FiDollarSign size={16} /> },
                { label: "Setoran", value: "setoran", icon: <FiDollarSign size={16} /> },
              ]}
              activeTab={tab}
              onSelect={handleMenuClick}
            />

            {/* Master Produk Dropdown */}
            <DropdownMenu
              label="Master Produk"
              icon={<FiPackage size={14} />}
              isOpen={openDropdown === "master"}
              onToggle={() => setOpenDropdown(openDropdown === "master" ? null : "master")}
              items={[
                { label: "Produk", value: "produk", icon: <FiPackage size={16} /> },
                { label: "Toko", value: "toko", icon: <FiShoppingCart size={16} /> },
                { label: "Sales", value: "sales", icon: <FiUsers size={16} /> },
              ]}
              activeTab={tab}
              onSelect={handleMenuClick}
            />
          </nav>
        )}

        {/* Right Section - Logout Button & Window Controls */}
        <div className="flex items-center gap-2 ml-auto" data-tauri-drag-region="false">
          <button
            className="h-8 px-3 flex items-center text-xs font-semibold bg-transparent text-white hover:bg-red-600 hover:text-white transition-all duration-150"
            onClick={() => {
              // Handle logout logic here
              console.log("Logout clicked");
            }}
            title="Logout"
          >
            <FiLogOut className="mr-1.5" size={14} />
            Logout
          </button>
          <div className="flex items-center gap-0.5" data-tauri-drag-region="false">
          <button
            className="w-8 h-7 flex items-center justify-center hover:bg-teal-600 transition-colors"
            onClick={() => {
              // @ts-ignore
              if (window.__TAURI__) {
                // @ts-ignore
                window.__TAURI__.window.appWindow.minimize();
              }
            }}
            title="Minimize"
          >
            <FiMinimize size={12} className="text-white" />
          </button>
          <button
            className="w-8 h-7 flex items-center justify-center hover:bg-teal-600 transition-colors"
            onClick={() => {
              // @ts-ignore
              if (window.__TAURI__) {
                // @ts-ignore
                window.__TAURI__.window.appWindow.toggleMaximize();
              }
            }}
            title="Maximize"
          >
            <FiMaximize size={12} className="text-white" />
          </button>
          <button
            className="w-8 h-7 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
            onClick={() => {
              // @ts-ignore
              if (window.__TAURI__) {
                // @ts-ignore
                window.__TAURI__.window.appWindow.close();
              }
            }}
            title="Close"
          >
            <FiX size={12} className="text-white" />
          </button>
          </div>
        </div>
      </div>
    </header>
  );
}

type NavButtonProps = {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function NavButton({ active, onClick, children }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-8 px-3 flex items-center text-xs font-semibold transition-all duration-150",
        active
          ? "bg-white text-[#005461]"
          : "bg-transparent text-white hover:bg-teal-600 hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

type DropdownMenuProps = {
  label: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  items: { label: string; value: string; icon?: React.ReactNode }[];
  activeTab?: string;
  onSelect: (value: string) => void;
};

function DropdownMenu({ label, icon, isOpen, onToggle, items, activeTab, onSelect }: DropdownMenuProps) {
  const hasActiveChild = items.some(item => item.value === activeTab);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={[
          "h-8 px-3 flex items-center gap-1 text-xs font-semibold transition-all duration-150",
          hasActiveChild || isOpen
            ? "bg-white text-[#005461]"
            : "bg-transparent text-white hover:bg-teal-600 hover:text-white",
        ].join(" ")}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {label}
        <FiChevronDown
          className={`ml-1 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          size={12}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 shadow-lg z-50">
          {items.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onSelect(item.value)}
              className={[
                "w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center gap-3",
                activeTab === item.value
                  ? "bg-[#005461] text-white"
                  : "text-slate-700 hover:bg-slate-100",
              ].join(" ")}
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
