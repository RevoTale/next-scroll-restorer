# NextJs Scroll Restorer
![NPM Version](https://img.shields.io/npm/v/next-scroll-restorer)
![NPM Downloads](https://img.shields.io/npm/dm/next-scroll-restorer)
![NPM License](https://img.shields.io/npm/l/next-scroll-restorer)
![npm bundle size](https://img.shields.io/bundlephobia/min/next-scroll-restorer)
![NPM Type Definitions](https://img.shields.io/npm/types/next-scroll-restorer)

[next-scroll-restorer](https://www.npmjs.com/package/next-scroll-restorer) handles scroll restoration for Next.js apps built with **app** directory. 
Fixed bugs related to forward/backward browser navigation that Next.js team ignored.

**Important!** This component works only for application written with [**Next.js 'app' directory**](https://nextjs.org/docs/app).
## Install
- `npm install next-scroll-restorer`  for [NPM](https://www.npmjs.com/package/next-scroll-restorer)
- `pnpm add next-scroll-restorer`  for [pnpm](https://pnpm.io)
- `yarn add next-scroll-restorer` for [Yarn](https://yarnpkg.com)

## Key features
- 100% of codebase written in Typescript
- Can be used at any nesting `layout.tsx` file. Root layout isn't required.
- Fixed bug where built-in Next.js scroll restoration is not immediate
- Fixed annoying bug where [scroll position forgotten by Next.js built-in scroll restoration.](https://github.com/vercel/next.js/issues/53777)
- Extensive testing in different browsers with [Playwright](https://github.com/microsoft/playwright) testing library.
## Presequences 
Before you start, keep in mind following rules.
- Keep disabled native `scrollRestoration` option in Next.js config to avoid conflicts.
- **Skip this rule for Next.js [14.1.0](https://github.com/vercel/next.js/releases/tag/v14.1.0) and higher.** In case your Next.js version is less than [14.1.0](https://github.com/vercel/next.js/releases/tag/v14.1.0) then you should enable `windowHistorySupport` in your Next.js config under `expermimental` property.
  [Since Next.js 14.1.0 browser history support is enabled by default.](https://github.com/vercel/next.js/pull/60557)
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental:{
        //Only For Next.js versions prior to 14.1.0 because it is enabled by default since version 14.1.0 
        windowHistorySupport:true 
    },
}
module.exports = nextConfig
```


## Usage

### Step 1
Create component named `ClientSideScrollRestorer` in your `src` directory with `useScrollRestorer` hook and `"use client"` directive to prevent server errors.

**src/ClientSideScrollRestorer.tsx**
```tsx
"use client"
import {useScrollRestorer} from 'next-scroll-restorer';
const ClientSideScrollRestorer = () => {
    useScrollRestorer()
    return <></>
}
export default ClientSideScrollRestorer
```
### Step 2
Import component created in a previous step to your root layout file (layout.tsx).
Wrap it wih [React](https://react.dev/reference/react/Suspense) `<Suspense/>` to avoid possible [client-side deopting for entire page](https://nextjs.org/docs/messages/deopted-into-client-rendering). 

**app/layout.tsx**
```tsx
import ClientSideScrollRestorer from '../src/ClientSideScrollRestorer'
import {ReactNode, Suspense} from "react";

type Props = {
    children: ReactNode
}
const RootLayout = ({children}) => {
    return (
        <html lang="uk">
        <body>{children}</body>
            <Suspense>
              <ClientSideScrollRestorer/>
            </Suspense>
        </html>
    )
}

export default RootLayout
```
It can be any nesting layout shared by [group of routes](https://nextjs.org/docs/app/building-your-application/routing/route-groups) in case you do not want to enable scroll restoration for the whole application.

