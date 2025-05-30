import { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { fetchRoles, createRole, deleteRole } from "../../api/roles/roles";

export function RoleSelect({ value, onChange }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const loadRoles = async () => {
      const roles = await fetchRoles();
      setOptions(
        roles.map((role) => ({ value: role.id, label: role.role_name }))
      );
    };

    loadRoles();
  }, []);

  const handleCreate = async (inputValue) => {
    const newRole = await createRole(inputValue);
    const newOption = { value: newRole.id, label: newRole.role_name };
    setOptions((prevOptions) => [...prevOptions, newOption]);
    onChange(newOption);
  };

  const handleDelete = async (roleId) => {
    await deleteRole(roleId);
    setOptions((prevOptions) =>
      prevOptions.filter((option) => option.value !== roleId)
    );
  };

  return (
    <CreatableSelect
      isClearable
      value={value}
      options={options}
      onChange={onChange}
      onCreateOption={handleCreate}
      placeholder="Select or create role"
    />
  );
}
