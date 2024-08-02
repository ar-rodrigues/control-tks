'use client'
import { Link } from '@chakra-ui/next-js'
import { supabase } from './lib/supabase'

export default function Home() {
  const setNewView = async () => {
    const {data, error} = await supabase
    .from('views')
    .insert({
      name: 'Home'
    })
    if(data) console.log(data)
    if(error) console.log(error)
  }

  setNewView()
  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-24">
      <Link href='/about' color='blue.400' _hover={{ color: 'blue.500' }}>
      Hello World!
    </Link>
    </main>
  );
}
