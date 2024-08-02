'use client'
import { Link } from '@chakra-ui/next-js'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-24">
      <Link href='/about' color='blue.400' _hover={{ color: 'blue.500' }}>
      Hello World!
    </Link>
    </main>
  );
}
