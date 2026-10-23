# Calfinco Purifiers — source and handoff guide

This is the Round 1 mobile-app prototype for Calfinco Purifiers. The source is an Expo / React Native app written in TypeScript. It is runnable as a demo, but it is **not a production commerce system yet**: customer, dealer, and admin modes are demo roles, data is stored on one device, checkout is cash on delivery, and Instagram publishing is not connected.

## Assignment requirements and current status

| Requirement from the brief | Current status |
| --- | --- |
| Android shopping app for water purifiers and related products | Implemented as an Expo mobile app; the current Replit preview is a development preview, not a signed Play Store release. |
| Customer shopping experience | Implemented: browse/search, categories, product details, cart, cash-on-delivery checkout, and order history. |
| Dealer / wholesale experience | Implemented as a demo role: wholesale prices, bulk order flow, and dealer order status. |
| Admin order, dealer, and service desk | Implemented as a demo role: change order status, approve/decline dealer requests, and review service requests. |
| Catalog with 50+ items | Implemented with 50 seeded sample products across RO purifiers, UV/UF, filters, pumps, and parts/accessories. Product data and images are demo content, not a live inventory feed. |
| Firebase or another backend | Not connected. The current prototype saves cart and demo records in AsyncStorage on the current device. It does not sync between users or devices. |
| Razorpay test checkout | Not connected. Checkout currently records cash on delivery; it does not charge a card or verify a payment. |
| Local / free-tier services | No external service is required to run the demo. Choose and configure production services before adding live accounts, storage, payments, or scheduled jobs. |
| Daily AI product image, caption, and hashtags for Instagram | Not automated. The admin screen includes a content-status area, but it does not generate content or publish to Instagram. |
| Prioritize quality over quantity | The prototype focuses on a complete, navigable core shopping/admin flow rather than claiming unconnected production integrations. |

## What is included

- A customer/dealer/admin demo-mode switch.
- Searchable product catalog with category filtering and product details.
- Cart quantity controls and checkout that creates a demo order.
- Dealer wholesale prices and bulk order handling.
- Demo order history/status changes, dealer approvals, and service requests.
- A daily-content status area for the future Instagram workflow.
- Local persistence via AsyncStorage.
- Local images, app icon, colors, and Expo Router setup.

### Source map

```text
artifacts/calfinco-purifiers/
├── app/
│   ├── _layout.tsx                 # App providers and root navigation
│   ├── +not-found.tsx              # Unknown-route screen
│   └── (tabs)/
│       ├── _layout.tsx             # Main app navigation container
│       └── index.tsx               # Shopping, dealer, admin, service, and content UI
├── assets/images/                  # App icon and product imagery
├── components/                     # Error and keyboard-aware components
├── constants/colors.ts              # Brand color tokens
├── data/catalog.ts                 # 50 sample products and categories
├── hooks/
│   ├── useColors.ts                 # Theme colors
│   └── useDemoStore.ts              # Demo records and AsyncStorage persistence
├── app.json                         # Expo app configuration
└── package.json                     # App dependencies and scripts
```

The app lives inside a pnpm workspace. The source download includes the workspace manifests and the small `lib/api-client-react` workspace package required by the app's package configuration.

## Run the project in this Replit

1. Open the `Calfinco Purifiers` artifact in Replit.
2. Wait for the `expo` workflow to start. If it is stopped, restart that workflow from the Replit workflow controls.
3. Open the app preview. For a physical Android phone, use Replit's Expo QR/phone preview flow and open it with Expo Go.
4. In the app, switch between **Customer**, **Dealer**, and **Admin** to explore each demo flow.

The preview is for development and demonstration. It is not the same as an APK/AAB that can be submitted to Google Play.

## Run from the downloaded source on a computer

The ZIP contains a small pnpm workspace, not preinstalled packages. Use Node.js 24 or a compatible current Node release and pnpm 10.

1. Extract `calfinco-purifiers-source.zip`.
2. Open a terminal in the extracted `calfinco-purifiers-source` folder — the folder containing `package.json` and `pnpm-workspace.yaml`.
3. Install the dependencies:

   ```bash
   pnpm install --frozen-lockfile
   ```

4. Check the TypeScript source:

   ```bash
   pnpm --filter @workspace/calfinco-purifiers run typecheck
   ```

5. Start Expo on your local network:

   ```bash
   pnpm --filter @workspace/calfinco-purifiers exec expo start --lan
   ```

6. Scan the Expo QR code with Expo Go on an Android phone on the same network. If your computer and phone cannot reach each other over the local network, use the tunnel option offered by Expo or use the Replit preview flow.

In Replit, use the configured `expo` workflow rather than launching Expo manually; Replit injects preview environment settings into that workflow.

### Windows install troubleshooting

The downloadable source package is configured to install optional native packages for the computer's operating system. If you see an error mentioning a missing module such as `@lightningcss/win32-x64-msvc`, stop Expo and use a fresh extraction of the latest source ZIP. Do not copy an old `node_modules` folder into it. If reinstalling inside the same extracted folder, remove its old dependencies from PowerShell at the workspace root:

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force artifacts/calfinco-purifiers/node_modules -ErrorAction SilentlyContinue
pnpm install --frozen-lockfile
```

## Test the demo flows

1. **Customer:** browse the catalog, search or select a category, open a product, add it to the cart, and place an order. The payment label is cash on delivery.
2. **Dealer:** switch to Dealer, review wholesale pricing, add items, and submit a bulk order. The app marks dealer orders as awaiting approval.
3. **Admin:** switch to Admin, advance an order status, approve or decline a sample dealer request, and review the service/content areas.
4. Changes are saved locally in the app's storage on that device. They are not visible to another phone or user.
5. To reset the demo data, clear the app's storage in the device/app settings or reinstall the app. Do not use demo data as business records.

## Step-by-step path from prototype to the requested production project

1. **Confirm the business rules.** Finalize product SKUs, real prices, dealer discount rules, minimum order quantities, service coverage, return policy, and order statuses. Replace the sample catalog and product imagery with approved Calfinco data.
2. **Add real authentication and roles.** Use an authentication provider and enforce customer, dealer, and admin permissions on the server. Remove the in-app role switch from production; hiding an admin button is not access control.
3. **Add a backend and database.** Store users, dealer applications, products, stock, carts/orders, service requests, and payment records in a secured backend. Add server-side validation and database access rules. Do not put privileged database credentials in the mobile app.
4. **Move product images and generated creatives to managed storage.** Restrict upload/read permissions and use approved, licensed brand assets.
5. **Add Razorpay test payments through a trusted server.** Create payment orders server-side, return only the public checkout information to the app, verify payment signatures server-side, and handle payment webhooks idempotently. Keep secret keys in Replit Secrets or another server-side secret manager; never embed them in the app.
6. **Build the Instagram content workflow.** Schedule a daily server-side job, generate an image and caption/hashtags, require review if the business needs approval, then publish only through the supported Instagram publishing API and an authorized professional account. Store job status and failures so missed posts can be retried safely. This app currently has no Instagram connection.
7. **Add operational protections.** Add input validation, error states, audit logs for admin actions, privacy/terms screens, secure handling of phone/address data, backups, rate limits, and monitoring.
8. **Test before release.** Test customer/dealer/admin permissions, stock and order edge cases, failed/cancelled payments, webhook retries, poor network behavior, screen sizes, accessibility, and Android devices. Use test credentials and test accounts until the business owner approves launch.
9. **Prepare an Android release.** Set the final app name, Android application ID, versioning, privacy details, signing key, and store listing. The current source has no generated native Android project or signing credentials. A local Android Studio/Android SDK build and Google Play Console account are needed for an Android store release; Replit's Expo publishing flow does not publish to Google Play.

## Important production gaps

- Demo role switching is not authentication or authorization.
- AsyncStorage is device-local and can be edited or erased by the device user; it is unsuitable as the source of truth for orders, stock, dealer approvals, or payments.
- Cash-on-delivery order creation is not Razorpay checkout.
- Product records, dealer applications, and service requests are seeded/demo data.
- The content area is not an AI generator, scheduler, or Instagram publisher.
- Do not enter real customer information or payment details into this demo.
