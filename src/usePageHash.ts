import {usePathname, useSearchParams} from "next/navigation";
import {useMemo} from "react";

const usePageHash = ()=>{
    const pathname = usePathname()
    const params = useSearchParams()
    return useMemo(()=>`${pathname}?${params.toString()}`,[pathname,params])
}
export default usePageHash
