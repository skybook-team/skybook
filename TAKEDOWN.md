# SkyBookFare takedown status

Date: 2026-11-10 (America/Los_Angeles)

## Done in this repository
- Homepage replaced with offline notice
- Route pages and APIs removed or neutralized
- `vercel.json` GitHub deploys disabled
- Robots disallow-all; empty sitemap

## Still live outside this repo
- Production site at https://www.skybookfare.com continues to serve an existing Vercel deployment (`skybook` / `prj_K2kANLuNtafsC1PpRnNCva0jWLyr`).
- This Vercel account can see the domain binding but cannot pause, delete, or redeploy that project (404/403).
- DNS for skybookfare.com is on GoDaddy nameservers (`ns69/ns70.domaincontrol.com`), not managed in-repo.
- https://skybook.pages.dev remains a separate Cloudflare Pages host.

## Required to fully stop page loads
1. In the Vercel account that owns project **skybook**, pause or delete the project (or remove `skybookfare.com` / `www.skybookfare.com`).
2. Or at GoDaddy, remove/change A/CNAME records that point at Vercel.
3. Disable or delete the Cloudflare Pages project for `skybook.pages.dev` if that host should also go offline.
