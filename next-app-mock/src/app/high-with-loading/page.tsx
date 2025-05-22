import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import SomeClient from './SomeClient'
function delay(ms:number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
const Page  = async ()=>{
    await connection()
    await delay(1000)
    return <div>
        <div style={{
            height: '2000px'
        }}>
            dsfsdfds
        </div>
        <Link href="/">
            Lets-go to main
        </Link>
       <Suspense>
         <SomeClient/>
       </Suspense>
    </div>
}
export default Page
