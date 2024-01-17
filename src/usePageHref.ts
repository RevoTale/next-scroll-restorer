import {usePathname, useSearchParams} from "next/navigation"
import {useMemo} from "react"

const usePageHref = ()=>{
    const pathname = usePathname()
    const params = useSearchParams()
    return useMemo(()=>{
        const search = params.toString()
        return `${pathname}${search === ''?'':`?${search}`}`
    },[pathname,params])
}
export default usePageHref
