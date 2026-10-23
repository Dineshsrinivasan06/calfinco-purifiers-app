# calfinco-purifiers-app

# Calfinco Purifiers

A mobile commerce prototype for Calfinco, built with Expo, React Native, and TypeScript. It demonstrates customer shopping, dealer wholesale ordering, and basic admin workflows for a water-purifier catalog.

> **Prototype status:** This repository is a functional demo, not a production commerce platform. It uses sample catalog and request data, stores demo state on the device, and does not include real user authentication, a shared backend, online payment processing, a standalone web admin panel, or automated Instagram publishing.

## Features

- **Customer shopping:** Browse and search products, filter by category, view product details, manage a cart, place a cash-on-delivery demo order, and view orders.
- **Dealer ordering:** View wholesale prices and place bulk orders in a dealer demo mode.
- **Admin workflows:** Update demo order statuses, review dealer applications, and view service requests.
- **Product catalog:** 50 seeded sample products across RO purifiers, UV/UF systems, filters, pumps, and accessories.
- **Local persistence:** Cart and demo records persist on the current device through AsyncStorage.

All three roles are demo modes in the same mobile app. They are not protected user accounts or server-enforced permissions.

## Technology

- Expo and Expo Router
- React Native and TypeScript
- pnpm workspace
- AsyncStorage for local demo persistence

## Run locally

### Requirements

- Node.js 24 or a compatible current Node.js release
- pnpm 10
- Expo Go on an Android device for QR-code testing

### Install and start

Run these commands from the repository root—the directory containing `package.json` and `pnpm-workspace.yaml`:

```bash
pnpm install --frozen-lockfile
pnpm --filter @workspace/calfinco-purifiers run typecheck
pnpm --filter @workspace/calfinco-purifiers exec expo start --lan
```

Scan the Expo QR code with Expo Go. For local-network testing, the computer and phone should be on the same Wi-Fi network.

In Replit, start the configured `artifacts/calfinco-purifiers: expo` workflow rather than starting Expo manually; the workflow supplies the Replit preview environment.

## Demo walkthrough

1. Select **Customer** to browse products, add items to the cart, and place a cash-on-delivery demo order.
2. Select **Dealer** to view wholesale pricing and try the bulk order flow.
3. Select **Admin** to update demo order statuses and review sample dealer or service requests.

Demo data is stored locally. It does not sync to other devices, and clearing the app's storage or reinstalling the app can remove it. Do not use real customer or payment data.

## Project structure

```text
artifacts/calfinco-purifiers/
├── app/                  # Expo Router screens and navigation
├── assets/images/        # App icon and product imagery
├── components/           # Shared UI and error-handling components
├── constants/            # Theme colors
├── data/catalog.ts       # Seeded product catalog
└── hooks/                # Theme and local demo-state hooks

lib/api-client-react/     # Workspace package referenced by the app
```

The detailed assignment checklist, source map, demo instructions, and production-readiness notes are in [`artifacts/calfinco-purifiers/README.md`](artifacts/calfinco-purifiers/README.md).

## Assignment scope and production gaps

| Capability | Current implementation |
| --- | --- |
| Customer, dealer, and admin experiences | Demonstration flows in one mobile app |
| Catalog | 50 seeded sample items; not connected to live stock or pricing |
| Orders and dealer applications | Sample/local records stored on the device |
| Payments | Cash-on-delivery demo only; Razorpay is not connected |
| Authentication and backend | Not connected; no cross-device synchronization |
| Web admin panel | Not included; the Admin mode is inside the mobile app |
| Daily AI Instagram content | Not automated or published |
| Android distribution | Source can be built locally; no signed APK is included |

Before production use, add real authentication and server-side authorization, a shared database, inventory validation, secure payment processing, and monitoring. Keep private API keys on a trusted server, never in the mobile app.

## Android build note

This repository does not include a generated native Android project or a prebuilt APK. A local Android build requires Android Studio and the Android SDK. Set a unique Android application ID in `artifacts/calfinco-purifiers/app.json` before generating native files with Expo Prebuild. A Google Play release additionally requires a production signing key and store setup.

There is no standalone Vercel admin URL in this repository. A separate web admin panel must be built and deployed before a live admin-panel link can be submitted.
