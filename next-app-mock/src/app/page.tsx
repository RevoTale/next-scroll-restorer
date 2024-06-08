import Link from 'next/link'
const Page  = ()=>{
    return <div>
        <div style={{
            height: '3300px'
        }}>
            dsfsdfds
        </div>
        <Link href="/low-page">
            Lets-go to low-page
        </Link>
        <Link href="/?fff=fff" scroll={false}>
            Lets-go without scroll
        </Link>
    </div>
}
export default Page
