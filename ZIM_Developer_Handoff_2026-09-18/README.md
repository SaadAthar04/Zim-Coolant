t# ZIM Chemicals — Developer Handoff
Prepared 18 September 2026.

## Start here
1. Extract the entire ZIP before opening any files.
2. Open START_HERE.html for the change list, product table and image gallery.
3. Open website/index.html for the working design reference. Navigation uses relative links, so the folder can be reviewed locally. No installation or build step is required. If local browser policies interfere, serve website/ using any static web server.
4. Published reference: https://zimx-product-preview.heymeelan.chatgpt.site

## Package contents
- website/: complete static reference source (HTML, CSS, JavaScript and all required assets).
- images/web/: all 23 website images, named by product, size, colour and view; ATF deliberately has no size in its name. These are identical copies of website/assets/ for easy import.
- images/originals/: the eight latest supplied 4 Liter PNG masters, renamed descriptively. These files are unedited originals. The corresponding website WebP files are lossless and pixel-identical to them.
- products.csv: 10 sellable variants with titles, prices, descriptions and image mappings.
- product-content.json: complete product copy, benefits, directions, variants and prices.
- image-manifest.csv: filename, dimensions, format, byte size and SHA-256 checksum for each image.

## Required changes to the existing website
- ZIM coolant product titles: ZIM Anti-Rust Coolant - 1 Liter / 4 Liter.
- ZIMX product titles: ZIMX Anti-Freeze and Anti-Boil - 1 Liter / 4 Liter.
- ZIMX range name and description: ZIMX Anti-Freeze & Anti-Boil. Description explicitly mentions advanced formula, anti-freeze and anti-boil protection.
- Remaining titles: ZIM Gear Oil; ZIM ATF (Auto Transmission Fluid).
- The repeated ZIMX 1 Liter entry in the brief was interpreted as one 1 Liter and one 4 Liter product.
- Use Liter throughout the editable website text, including headings, selectors, metadata, alt text, cart and checkout.
- ATF: no size selector, size suffix, volume metadata, or capacity text in customer-facing copy. Use its product record for purchasing without rendering a size section.
- Replace all eight 4 Liter front/back images with the latest supplied versions in this package. Keep their labels, proportions and pixels intact.
- Home cards: remove image padding, use object-fit: cover and object-position: center, and retain the 10:11 frame. This uniformly scales the square image and crops only the outer sides; never stretch width and height independently. Inspect both bottle and podium edges if the frame ratio changes.
- Product gallery: use object-fit: contain so the full supplied image is shown. Keep front/back controls accessible but do not display Front/Back/Nozzle captions under thumbnails.
- Nozzle is included only with red/green ZIMX 1 Liter variants. It is not included with either 4 Liter range or ZIM Anti-Rust Coolant.
- Keep Add to Cart and Buy Now; Buy Now adds the selected variant and quantity before opening checkout.

## Prices (PKR)
ZIM Anti-Rust Coolant 1 Liter: 349
ZIM Anti-Rust Coolant 4 Liter: 1,349
ZIMX Anti-Freeze and Anti-Boil 1 Liter: 749
ZIMX Anti-Freeze and Anti-Boil 4 Liter: 2,999
ZIM Gear Oil: 649
ZIM ATF (Auto Transmission Fluid): 399
Red and green share the same price for each size.

## Source guide
- index.html: homepage banner, categories and product cards.
- product.html: shared gallery and product-page structure.
- catalog.js: canonical content, prices, image paths and productTitle() naming helper.
- app.js: product selection, dynamic title, size/colour controls, gallery, nozzle eligibility and purchase buttons.
- style.css: shared responsive styling. Font stack: Arial, Helvetica, sans-serif.
- cart.js / checkout.js: demonstration cart and order summary.
- announcements.js: scrolling header strip and pause control.
- assets/: final images used by the reference pages.

## Integration boundary
This is a UI reference package, not a replacement production storefront. Port the layout, assets and copy into the existing zimchemicals.com project and preserve its existing authentication, dashboard, product IDs, inventory, order processing and payment/shipping integrations. Connect purchase controls to the existing backend. The supplied cart uses browser-session storage and checkout intentionally does not submit real orders. Validate prices and stock on the server, not from this demo JavaScript. Do not replace the existing application with this static folder.

Retain established live URLs or add redirects if names/slugs change. Use the data files to map the visual variants to the existing database records. An internal ATF variant key of standard is used only by this reference; map it to the existing ATF SKU.

## Artwork issue for owner review
The supplied red ZIM Anti-Rust Coolant 4 Liter FRONT image has a badge reading 1968, while the website says Since 1988. The image is intentionally unchanged as requested. Obtain corrected approved artwork before the final production release. Text printed inside supplied images has not been rewritten; the Liter spelling and new names apply to editable website text. Do not regenerate labels from AI if exact packaging text is required.

## Verification and acceptance
Completed: eight PNG/WebP pixel comparisons; all 10 catalog variants and their front/back files checked; static HTML asset links checked; JavaScript syntax checked; old editable brand names, old ATF capacity text and Litre spelling removed.
Before production: review desktop and mobile in the existing application; test colour/size switching, front/back views, correct prices, ATF with no size section, eligible nozzle content, cart quantities and Buy Now routing. Verify the real shipping threshold and order flow with the existing backend. The static package is not a claim that production checkout has been implemented.
