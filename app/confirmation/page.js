// app/confirmation/page.tsx

'use client';

import { useState } from 'react';
import { Box, Heading, Text, Button, useToast } from '@chakra-ui/react';
import { resendVerificationEmail } from '../actions/actions';

const ConfirmationPage = ({ searchParams }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const email = searchParams?.email || ''; // Optionally pass the email as a query param

  console.log(searchParams)

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: 'Email not provided.',
        description: 'Please provide an email to resend the verification.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      await resendVerificationEmail(email);
      toast({
        title: 'Verification Email Sent.',
        description: `A new verification email has been sent to ${email}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to resend email.',
        description: 'There was an issue resending the verification email. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Heading as="h1" size="xl" mb={6}>
        Confirm Your Email
      </Heading>
      <Box>
  <Text mb={4} className='text-center'>
    A confirmation email has been sent to <strong>{email}</strong>. 
    <br/><br/>
    Please check your inbox and click the confirmation link to verify your email address.
  </Text>
</Box>

      <Button
        colorScheme="blue"
        onClick={handleResendEmail}
        isLoading={loading}
      >
        Resend Verification Email
      </Button>
    </Box>
  );
};

export default ConfirmationPage;
