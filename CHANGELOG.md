# next-scroll-restorer

## 0.7.1

### Patch Changes

- 075cc6e: Add option to delay scroll restoration.

## 0.7.0

### Minor Changes

- 2d1c8a1: Make tests more complex to cover a wider range of issues. Redesign scroll restorer to pass them. Removed unnecessary complexity of scroll restorer.
- 2d1c8a1: Add end-to-end testing of `ScrollRestorer` in real NextJS application.

### Patch Changes

- 2d1c8a1: Add tests that stress out scroll restorer. It showed up a bug I experienced in Safari browser with recent NextJS 14 minor versions.

## 0.6.15

### Patch Changes

- 3ef329d: Add support for NextJS 14.
- 3ef329d: Export scroll restorer as a hook.

## 0.6.14

### Patch Changes

- 6985c58: Improve README

## 0.6.13

### Patch Changes

- a228a70: Fix readme headings
- 49711f2: fix bundle preparation

## 0.6.12

### Patch Changes

- 7500bfa: Readme guide

## 0.6.11

### Patch Changes

- 0437a7f: fix repository naming occurrences

## 0.6.10

### Patch Changes

- f2ece35: Fix release process

## 0.6.9

### Patch Changes

- 9b83c24: Fix release process

## 0.6.8

### Patch Changes

- 01d9913: Introduced scroll restoration component that performs much better than alternatives, but can only be used for `appDir` NextJS apps.
