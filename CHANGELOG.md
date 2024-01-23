# next-scroll-restorer

## 0.9.4

### Patch Changes

- 2f3b482: Fix bug where safari workaround caused revert to previous scroll position when spwiping to the top of the website.
- 2f3b482: Add integration tests with simulation of Safari scroll reset bug.
  Finally, make working workaround for this bug.

## 0.9.3

### Patch Changes

- be75ad0: Fix bug where safari workaround caused revert to previous scroll position when spwiping to the top of the website.

## 0.9.2

### Patch Changes

- eb273a2: Update readme to use suspense
- eb273a2: Increase threshold for Safari scroll reset bug workaround, because sometimes Safari browser fires it even after 700ms.

## 0.9.1

### Patch Changes

- 8874f56: Fix Test CI to run on release merge.

## 0.9.0

### Minor Changes

- 776dc72: Added many tests with complex cases and stress situations. In my opinion, 100% of cases in real-world browser are coveraged by tests.
- 776dc72: Fixed broken behaviour of previous version.

### Patch Changes

- 776dc72: Rewritten component from scratch to match all existing tests.
- 776dc72: More test for scroll behaviour. Test for history replaceState limitation described in https://github.com/sveltejs/kit/issues/365
- 776dc72: Prevent error Unhandled Rejection (SecurityError): Attempt to use history.pushState() more than 100 times per 30 seconds react.
- 776dc72: Workaround for Safari resetting scroll position.

## 0.8.0

### Minor Changes

- 97980df: Save scroll position to window history instead of local storage.

### Patch Changes

- 97980df: Update README with all the latest features.
- 97980df: Update Readme with the latest updates. Restructure to be more informative and clean.

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
