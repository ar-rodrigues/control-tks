import React from 'react';
import { Box } from '@chakra-ui/react';

const IFramePage = () => {
  const iframeCode = `https://app.powerbi.com/view?r=eyJrIjoiZDQzOGJjMzgtN2M1Ny00ZjA3LWExZDItZWY0ZDU0ZTYyNmUxIiwidCI6Ijk2NDYyYWMzLTYwMzktNGE1YS1iYWI5LTBjMmY5YjNkYzFiYSJ9`;

  return (
    <Box p={4} w={"100vw"} h={"100vh"}>
      <iframe title="TEST_DEMO" width="80%" height="100%" src={iframeCode} frameborder="0" allowFullScreen="true"></iframe>
    </Box>
  );
};

export default IFramePage;
