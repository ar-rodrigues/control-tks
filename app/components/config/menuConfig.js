import { FiHome, FiUsers, FiLogOut } from "react-icons/fi";
import { CiUnlock } from "react-icons/ci";
import { FaChartBar, FaCalendarAlt, FaUserTie } from "react-icons/fa";
import { BiRfid } from "react-icons/bi";

export const menuLinks = [
  {
    href: "/",
    text: "Inicio",
    icon: FiHome,
    roles: [],
  },
  {
    href: "/users",
    text: "Usuarios",
    icon: FiUsers,
    roles: ["admin", "rh", "direccion"],
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
    roles: ["admin", "rh", "direccion"],
  },
  {
    href: "/rfid-config",
    text: "RFID",
    icon: BiRfid,
    roles: ["admin"],
  },
  {
    href: "/planning",
    text: "Planificación",
    icon: FaCalendarAlt,
    roles: ["admin", "direccion"],
  },
  {
    href: "/auditors",
    text: "Auditores",
    icon: FaUserTie,
    roles: ["admin", "rh", "direccion", "coordinador"],
  },
];

// Shared logout config
export const logoutLink = {
  href: "#logout",
  text: "Salir",
  icon: FiLogOut,
  roles: [],
};
