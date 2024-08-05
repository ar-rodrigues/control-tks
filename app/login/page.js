'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { Input, Button, Box, Heading } from '@chakra-ui/react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const router = useRouter() 
    
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      //console.log(data, error);
      if (error) throw error;
      alert('Login successful!');

      // Redirect to the dashboard or another page after successful login
      if(data.user) router.refresh()
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setFormData({ email: '', password: '' });
    }
  };

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Heading as="h1" size="xl" mb={6}>
        Login
      </Heading>
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <Button type="submit" colorScheme="blue" width="full">
          Login
        </Button>
      </form>
    </Box>
  );
};

export default Login;
