import { useState } from 'react';

export const useValidateAddUser = (newUser) => {
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    const { name, email, password, role } = newUser;

    if (name.trim().length < 5) {
      setErrorMessage('Name must be at least 5 characters long.');
      return { isValid: false, errorMessage: 'Name must be at least 5 characters long.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Invalid email format.');
      return { isValid: false, errorMessage: 'Invalid email format.' };
    }

    if (password.trim().length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return { isValid: false, errorMessage: 'Password must be at least 6 characters long.' };
    }

    if (!role) {
      setErrorMessage('Role is required.');
      return { isValid: false, errorMessage: 'Role is required.' };
    }

    // Trimming and resetting the state with trimmed values
    const formattedUser = {
      ...newUser,
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
    };

    setErrorMessage('');
    return { isValid: true, formattedUser };
  };

  return { errorMessage, validate };
};
