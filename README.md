# NextJs Scroll Restorer

Scroll restoration for NextJS apps built with **app** directory. Fixed bugs that NextJS team does not fix.

Important! This component is developed only for **app directory**.

## Install

- `pnpm add next-scroll-restorer`  for [pnpm](https://pnpm.io)
- `yarn add next-scroll-restorer` for [Yarn](https://yarnpkg.com)

## Usage
Import component to your root layout
(or layout shared by (https://nextjs.org/docs/app/building-your-application/routing/route-groups)[group of routes]).
Disable native `scrollRestoration` option in NextJS config to avoid conflicts.

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

## Key features
- 100% of codebase written in Typescript
- Can be used at any nesting `layout.tsx` file. Root layout isn't required.
- Fixes bug where built-in NextJS scroll restoration is not immediate
- Fixes annoying bug where (https://github.com/vercel/next.js/issues/53777)[scroll position forgotten by NextJS built-in scroll restoration.]
- Zero-config
