# Spotex Website — Project Status

> Yeh file har kaam ke baad update hogi. Naya session shuru ho to sab se pehle yahi parhein.
> Last updated: 2026-11-25 (certificates section + company info sheet website pe)

**Full plan:** [docs/website-plan.html](docs/website-plan.html) · Online: https://claude.ai/artifact/2rXDHU6CmeQ9LgbaR4LMDx

---

## Faisle jo ho chuke hain (decisions)

| Topic | Faisla |
|---|---|
| Domain | **Sirf naya fresh domain** (naam abhi final nahi). Purana `spotexint.com` is project mein use nahi hoga, koi redirect nahi |
| Languages | **English, German, Norwegian, Italian, French** (5; French zaroori, 2026-11-23 confirm). Country se auto: Germany/Austria → DE, Norway → NO, Italy → IT, France/Monaco/Luxembourg → FR, Switzerland → browser language, baaki saari duniya → EN |
| Stack | **Ek hi Next.js project** (App Router) + Tailwind + next-intl + GSAP. API = Next.js API routes (Node.js). Express **nahi** |
| Database | MongoDB Atlas (Frankfurt region) + Mongoose |
| Hosting | **Sirf Vercel** (website + admin + API) |
| Images | Cloudinary, browser se seedha signed upload |
| Design | Pure white background, bright red (#de0000) + black, Bebas Neue (headings) + Montserrat (text). Paragraph text near-black (#111). Red glow / dark backgrounds pasand nahi |
| Content | Purani site se sirf idea lena hai, text ya design copy nahi karna. spotexint.com ki videos use nahi karni |
| Hero | Scroll-driven "Spotlight" hero (SPOTEX logo → letters bikharte hain → products upar se girte hain, callout lines ke saath) |

---

## ✅ Ho chuka (done)

### Demo website (`demo/` folder, local: `node demo-server.js demo 5173` → http://localhost:5173)
- [x] `demo/index.html` — poori scroll "film" website: Hero → In-house → Fabric → Uniforms → Custom → Collection (3D ring) → Belts → Factory → Export map → Contact
- [x] Naya scroll Spotlight hero main site mein laga diya (5 products: SI-JJU-1001, SI-JU-1005, SI-JJU-1002, SI-MS-1001, SI-GBP-1001)
- [x] Hero mein callout labels copy/product-info pe overlap nahi karte (har screen size pe khud jagah dhoondte hain)
- [x] Hero ke baad film mein dress ki position wala bug fix
- [x] Product click → popup details
- [x] Paragraph text ka colour clear black
- [x] 1366×600, 1440×900 aur mobile (390×844) pe check
- [x] Backups: `v1`…`v8`, `index-v8-hero-reel.html`, `index-v9-en-only.html`, `hero-a-v1-outline.html`, aur alag hero concepts `hero-a/b/c.html`

### Planning
- [x] Purani site (spotexint.com) ka poora audit: pages, khaali pages, SEO masle, takrate facts
- [x] Master plan: pages, product page, admin portal, stack, database, API, SEO, creative pages, roadmap, launch checklist (`docs/website-plan.html`)
- [x] Languages final (4), stack final (Next.js-only on Vercel)

---

## ⏳ Pending — company se chahiye (client)

- [x] Naye domain ka naam final + kharidna (user: ho gaya, 2026-11-25)
- [x] Facts confirm: 1989, 50+ staff, 100+ clients (2026-11-25). Alibaba Gold Member saal abhi baaki
- [x] Phone/WhatsApp: +92 300 9648142; timing Sat–Thu 9–18, Friday off (2026-11-25)
- [x] Company info sheet website pe (2026-11-25): MOQ 30, sample 7–10 din, capacity 12–15k/mahina, 30 looms + machines, judo 750 GSM, BJJ 280–550 GSM, IBJJF colours, 9 weaves, pant fabrics, DTF/digital print, naye nogi/belt/bag items category text mein
- [ ] Database mein haath se: SI-JU-1007 aur SI-JU-1008 ka weight 700 → 750; blog "Judo gi weights explained" mein 700 → 750; Admin Settings mein phone (agar wahan purana number save hai)
- [ ] Naye products (spats, Muay Thai shorts, key chains, karate/master/metal-loop belts, duffel bags waghaira) ki photos + codes, taa ke catalogue mein alag product ban saken
- [ ] Logo ka original vector file (AI/SVG/PDF) — warna naya vector banwana hai (yeh sawal abhi tak jawab ka muntazir hai)
- [x] Certificates (7 scans) Factory page pe laga diye — `public/certificates/`, section "Certificates" + click pe bari image (2026-11-25)
- [ ] ISO 9001:2015 ki **current (valid)** copy — jo scan mila wo 09 Feb 2019 tak valid tha
- [ ] Har product ki 4–6 photos (white background) + specs (fabric, GSM, sizes, colours, MOQ, lead time)
- [ ] Factory ke 10 departments ki apni photos aur chhoti videos
- [ ] Size charts, MOQ, payment terms, shipping terms (FOB / DDP)
- [ ] Asli testimonials / case studies (ijazat ke saath)
- [ ] German, Norwegian, Italian ke native translators

## ⏳ Pending — development: 3 din ka plan

> Deadline: 2–3 din. Is liye pehle launch mein sirf zaroori cheezein. Baaki "Launch ke baad" list mein hain.
> Jab tak naya domain na mile, site Vercel ke free link (`xyz.vercel.app`) pe live hogi; domain baad mein 10 minute mein jud jata hai.

### Din 1 · Website (frontend) — ✅ ho gaya (2026-11-16), code: Spotex folder hi project root hai
- [x] Next.js 15 + Tailwind 4 + next-intl (en/de/no/it) + country → language middleware (sirf homepage pe)
- [x] Har language ke apne URLs (jaise `/de/produkte`, `/no/produkter`, `/it/prodotti`) + hreflang/canonical
- [x] Design system demo se: rang, fonts, buttons, header (mobile menu), footer, language switcher
- [x] Home: scroll Spotlight hero + poori film (fabric, uniforms, custom, collection ring, belts, factory, export map) + CTA
- [x] Products, Category aur Product detail pages (70 products, 8 categories, specs table, gallery, related products, Product schema)
- [x] Private Label, Factory (10 departments + quality + CSR), About, Contact, 404
- [x] Charon languages ka poora text (AI translation; native translator se check baaki)
- [x] Checked: 1366×600 aur mobile, TypeScript + lint clean
- [x] Saari product photos (96) aur logo `public/` mein copy (ek-baar wali script git history mein hai, folder se hata di); purani site pe ab koi dependency nahi
- [x] Hero: naya headline "Custom uniforms, made in-house", har product pe 4–5 callouts asal jagah pe, ghoomti laal ring
- [ ] `npm run build` (production build) abhi nahi chalaya — dev server chal raha tha; Din 3 deploy se pehle

### Din 2 · Backend + Admin
> API = Server Actions (App Router). Database na ho to site built-in data pe chalti hai.
- [x] MongoDB connection + models: products, inquiries (`src/lib/db/`) — local test DB pe check
- [x] Seed script `npm run db:seed` (70 products; dobara chalane se admin edits nahi mitti)
- [x] Website products database se (cache, admin save pe fauran refresh)
- [x] Admin login + products CRUD (naya/edit/delete/Live-Hidden) — test hua; delete aur Live/Hidden button browser mein check baaki
- [x] Quote/Contact form → MongoDB + email; inquiry inbox (status, note, delete), spam limit 5/ghanta — code bana, poora test baaki
- [x] Atlas connect (`.env.local`), 70 products + 3 blog articles database mein (2026-11-23)
- [x] Atlas password badal diya, `.env.local` se connection check OK (2026-11-25)
- [ ] Vercel mein `MONGODB_URI`
- [x] Admin → Blog: naya article, edit, draft/publish, delete; website blog database se — browser mein check baaki
- [x] Cloudinary upload: API route `/admin/api/upload-signature` + "Upload photos" button (products + blog cover) — code bana
- [x] Cloudinary keys `.env.local` mein; 96 catalogue photos Cloudinary pe (ek-baar wali script, kaam ke baad hata di), database + `src/data` seed files ke links badal gaye; purane→naye links `docs/cloudinary-images.json` (2026-11-25)
- [x] Categories database mein (`CategoryModel`): naam + description 5 languages, cover photo (Cloudinary), Live/Switched off, position. Admin → Categories → Edit (2026-11-25)
- [ ] Browser mein check: category edit + save, cover upload, switch off karne pe website se category ghayab
- [ ] Vercel pe bhi `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` daalne hain
- Note: `public/products/` mein ab sirf 9 photos + `details/` hain (About, departments, home film ki design photos). Baaki 87 Cloudinary pe hain, local se hata di (2026-11-25)
- [x] Settings page: email, phone, WhatsApp, address, facts admin se badlein → database → poori website pe (2026-11-24)
- [x] Resend domain `spotexinternational.com` verified; `.env.local` mein RESEND_API_KEY / INQUIRY_TO_EMAIL (inquiry@spotexinternational.com) / INQUIRY_FROM_EMAIL
- [x] Reply: portal mein box nahi (user ne mana kiya). "Reply by e-mail" button email app kholta hai (customer, subject, salaam aur asal message pehle se bhare); baat-cheet mailbox mein (2026-11-24)
- [x] Admin: Messages ka alag page; Settings mein social links (footer icons); portal mein tool ke naam kahin nahi dikhte

### Din 3 · SEO + launch
- [ ] Har page ka title/description (5 languages), sitemap, robots, hreflang + x-default, structured data (Organization, Product, Breadcrumb)
- [ ] Privacy, Cookies, Terms, Impressum + cookie consent banner
- [ ] Speed (images, fonts), mobile aur 1366×600 pe overlap check
- [ ] Vercel pe deploy, forms aur emails test
- [ ] Search Console + Analytics (domain milte hi)

### Launch ke baad (baad mein)
- [ ] Editor/Sales roles, 2FA, CSV export, dashboard, activity log
- [ ] Blog, FAQ, Size charts, Fabric guide, Catalog PDF, Markets pages
- [ ] Gi Builder, size calculator, competition checker
- [ ] Native translators se DE/NO/IT/FR ka review
- [ ] Har mahine 2–4 blog posts, backlinks

### Shuru karne ke liye abhi chahiye (aap se)
- [x] Vercel account (GitHub se login)
- [x] MongoDB Atlas account (free M0 cluster) ka connection string
- [x] Cloudinary account (free) ki keys
- [x] Email bhejne ke liye Resend account (free) ki key, aur kis email pe inquiries aayen
- [x] Sahi phone number aur WhatsApp number

## Notes
- Project root = `Spotex/` folder (pehle `web/` subfolder tha, 2026-11-23 ko root pe le aaye). Chalane ke liye: Spotex folder mein `npm run dev` → http://localhost:3000
- Database: `.env.local` mein `MONGODB_URI` daal kar `npm run db:seed` (70 products database mein)
- Har kaam ke baad is file mein `[ ]` ko `[x]` karein aur "Last updated" badlein.
