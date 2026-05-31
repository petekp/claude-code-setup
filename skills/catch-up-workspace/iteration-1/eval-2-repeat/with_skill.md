Since your last check-in — TL;DR
Cache is on, the projects list no longer hangs, and a server overload bug we hit along the way is fixed. Nothing needs you right now.

What changed
- Turned on the 5-minute cache you approved. Screens now reuse recent data instead of refetching every time.
- The projects list used to load all 2,000 projects at once and freeze the page. It now loads 50 at a time with a "load more" button.
- Fixed a bug we found while testing that: the server started rejecting requests because every scroll was reloading everything. Each page now caches on its own, and we confirmed the rejections stopped.

Why
- Loading 2,000 projects in one shot was what made the page hang. Paging it in keeps things responsive.
- The overload bug came from the cache not telling pages apart, so it kept re-fetching the whole list. Fixing how pages are tracked solved it.

Your call
- Nothing needs you right now. The cache decision is settled and the page issues are resolved.
