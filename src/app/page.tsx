"use client"
import { Button } from '@/components/ui/button'
import { Toaster,toast } from 'sonner'
const Page = () => {
  return (
    <div className='flex justify-center items-center flex-col min-h-screen bg-black text-white'>
      <Toaster position='top-center' richColors />
      <div className='text-6xl  font-bold animate__animated animate__bounce text-center'>
  Coming Soon!
      </div>
      <Button className='mt-12' onClick={()=>{
        toast.success("we are launching soon!");
      }}>Click me</Button>
    </div>
  )
}

export default Page