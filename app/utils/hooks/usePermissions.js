// app/utils/permitions/usePermissions.js
// This  is used to check if the user has the necessary permissions to access the page
import { menuLinks } from "@/app/components/config/menuConfig";

export const usePermissions = (page, role) => {
  const linksAllowed = menuLinks.filter((link) => link.roles.includes(role));
  const isAllowed = linksAllowed.some((link) => link.href === page);

  return isAllowed;
};
