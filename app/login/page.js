'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../actions/actions';
import { Input, Button, Box, Heading, InputGroup, InputRightElement, IconButton, Text } from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter(); // Use Next.js router for client-side redirection

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    setError(null);

    try {
      const result = await login(formData);
      if (!result.success) {
        setError('Credenciales incorrectas. Intente otra vez.');
      } else {
        // Redirect to home page on successful login
        router.push('/');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setTimeout(() => {
        setError(null);
      }, 3000);
      setLoading(false);
    }
  };

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Heading as="h1" size="xl" mb={6}>
        Login
      </Heading>
      <form className="space-y-4" onSubmit={handleLogin}>
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value.trim() })}
          required
          name="email"
          id="email"
        />
        <InputGroup>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value.trim() })}
            required
            name="password"
            id="password"
          />
          <InputRightElement width="4.5rem">
            <IconButton
              h="1.75rem"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            />
          </InputRightElement>
        </InputGroup>
        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          isLoading={loading}
        >
          Login
        </Button>
        {error && <Text color="red.500">{error}</Text>}
      </form>
    </Box>
  );
};

export default Login;
