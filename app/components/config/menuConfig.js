import { FiHome, FiUsers, FiLogOut } from "react-icons/fi";
import { CiUnlock } from "react-icons/ci";
import { FaChartBar } from "react-icons/fa";

export const menuLinks = [
  {
    href: "/",
    text: "Inicio",
    icon: FiHome,
    roles: ["admin", "back-office", "auditor"],
  },
  {
    href: "/users",
    text: "Usuarios",
    icon: FiUsers,
    roles: ["admin"],
  },
  {
    href: "/back-office",
    text: "Desencriptador",
    icon: CiUnlock,
    roles: ["admin", "back-office"],
  },
  {
    href: "/admin",
    text: "Reportes",
    icon: FaChartBar,
    roles: ["admin"],
  },
];

// Shared logout config
export const logoutLink = {
  href: "#logout",
  text: "Salir",
  icon: FiLogOut,
  roles: [],
};
