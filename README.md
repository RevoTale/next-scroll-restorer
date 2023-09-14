# NextJs Scroll Restorer

Scroll restoration for NextJs apps built with **app** directory. Fixed bugs that NextJs team does not fix.

Important! This component is developed only for **app directory**.

##Install

- `pnpm add next-scroll-restorer`  for [pnpm](https://pnpm.io)
- `yarn add next-scroll-restorer` for [Yarn](https://yarnpkg.com)

##Usage
Import component to your root layout
(or layout shared by (https://nextjs.org/docs/app/building-your-application/routing/route-groups)[group of routes]).

layout.tsx
```tsx
import {ScrollRestorer} from 'next-scroll-restorer'
import {ReactNode} from "react";

type Props = {
    children: ReactNode
}
const RootLayout = ({children}) => {
    return (
        <html lang="uk">
            <body>{children}</body>
            <ScrollRestorer/>
        </html>
    )
}

export default RootLayout
```

##Key features
- 100% of codebase written in Typescript
- Fixes bug when scroll restoration iss not immediate
- Fixed annoying bug https://github.com/vercel/next.js/issues/53777
- Can be used at any nesting `layout.tsx` file. Root layout isn't required.
- Zero-config
