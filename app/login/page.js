'use client';
import { useState } from 'react';
import { login, signup } from '../actions/actions';
import { Input, Button, Box, Heading, InputGroup, InputRightElement, IconButton, Text } from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login(formData);
    } catch (error) {
      setError('Credenciales incorrectas. Intente otra vez.');
      setTimeout(()=>{
        setError(null)
      }, 3000)
    }
    setLoading(false);
  };

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Heading as="h1" size="xl" mb={6}>
        Login
      </Heading>
      <form 
        className="space-y-4"
        onKeyDown={(e)=>{
          if (e.key === 'Enter') handleLogin()
        }}>
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          name="email"
          id="email"
        />
        <InputGroup>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            name="password"
            id="password"
          />
          <InputRightElement width="4.5rem">
            <IconButton
              h="1.75rem"
              size="sm"
              onClick={()=> setShowPassword(!showPassword)}
              icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
            />
          </InputRightElement>
        </InputGroup>
        <Button
          type="button"
          colorScheme="blue"
          width="full"
          onClick={handleLogin}
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
