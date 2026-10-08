# Website SEO and publishing

`npm run build` emits `dist/site` with static rendered headings, explanatory copy, FAQ and real source/release links. React adds the interactive editor in the browser. The default is intentionally `noindex,nofollow`, robots disallow and an empty sitemap because no public address has been chosen.

Set `PUBLIC_SITE_URL` to the actual HTTPS address, optionally including a deployment subpath, in the build environment or root `.env.local`. Example command syntax: `PUBLIC_SITE_URL=<real-https-address> npm run build`. Do not substitute a made-up domain. The build then emits a matching canonical, OG URL, SoftwareApplication schema with a zero-price Offer, robots and one sitemap location. The site uses relative asset URLs so a subpath deployment works. Credentials, query strings and fragments are rejected in the configured URL.

Publish only `dist/site` to static HTTPS hosting. Do not publish the desktop editor bundle as if it could capture screens in a browser. Configure redirects to the single canonical address and keep the exact site URL consistent. After deployment, verify HTTP success, canonical and sitemap on the public hostname, then submit the sitemap to a search console if desired. No search ranking or indexing guarantee is made.

There are no fake reviews, download counters, scan badges, paid plans or invented public installers. Public binary availability, OS validation and signing must be updated from actual release evidence. The release-status text currently keeps Windows/macOS validation pending and directs Linux users to the validation report.
