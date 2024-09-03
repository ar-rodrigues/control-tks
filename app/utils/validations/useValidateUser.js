import { useState } from 'react';

export const useValidateUser = (newUser) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const { name, email, password, role } = newUser;
    const newErrors = {};

    if (!name || name.trim().length < 5) {
      newErrors.name = 'Name must be at least 5 characters long.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      newErrors.email = 'Invalid email format.';
    }

    if (!password || password.trim().length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    if (!role) {
      newErrors.role = 'Role is required.';
    }

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  return { errors, validate };
};
