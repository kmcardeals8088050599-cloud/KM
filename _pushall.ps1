$git = "C:\Program Files\Git\cmd\git.exe"
$repo = "C:\Users\Dell\OneDrive\Desktop\KM-main"

& $git -C $repo add server.ts
& $git -C $repo add server/whatsapp.ts
& $git -C $repo add server/insurance.ts
& $git -C $repo add server/priceAlerts.ts
& $git -C $repo add src/components/inventory/CarDetailsView.tsx
& $git -C $repo add src/components/inventory/CompareView.tsx
& $git -C $repo add src/components/common/CarCard.tsx
& $git -C $repo add src/components/common/CompareBar.tsx
& $git -C $repo add src/components/admin/AdminDashboard.tsx
& $git -C $repo add src/App.tsx
& $git -C $repo add .env.example
& $git -C $repo add supabase-schema.sql

$msg = @"
feat: 7 new features - WhatsApp alerts, AI descriptions, similar cars, daily report, comparison, insurance alerts, price drop alerts

FEATURE 1 - Auto WhatsApp Alert on New Lead/Exchange:
- server/whatsapp.ts: sendWhatsAppAlert(), buildNewLeadMessage(), buildNewExchangeMessage(), buildDailySummaryMessage(), buildPriceDropMessage()
- server.ts: fires WhatsApp alert after POST /api/leads and POST /api/exchange-requests (fire-and-forget)
- Env: WHATSAPP_ADMIN_PHONE, WHATSAPP_API_URL, WHATSAPP_API_TOKEN

FEATURE 2 - AI Auto-Generate Car Description:
- server.ts: POST /api/admin/generate-description (Gemini 2.0 Flash)
- AdminDashboard: AI Generate button next to description textarea
- Env: GEMINI_API_KEY

FEATURE 3 - Similar Cars Section:
- CarDetailsView: relatedCars prop now rendered as 3-card grid below main content
- Price Drop Alert subscription form added (Bell icon, phone input)
- CarCard imported and used for related cars display

FEATURE 4 - Daily Summary WhatsApp Report:
- server.ts: POST /api/admin/daily-report (auth required)
- AdminDashboard: new Alerts & Reports tab with Send Daily Report button + preview

FEATURE 5 - Car Comparison Tool:
- src/components/common/CompareBar.tsx: sticky bottom bar showing selected cars
- src/components/inventory/CompareView.tsx: full side-by-side comparison table
- CarCard: Add to Compare button (optional prop), isInCompare state
- App.tsx: compareCars state, /compare route, CompareBar rendered globally

FEATURE 6 - Insurance Expiry Alerts:
- server/insurance.ts: parseInsuranceExpiry(), getInsuranceAlerts() - parses "Valid till MMM YYYY" strings
- server.ts: GET /api/admin/insurance-alerts (auth required)
- AdminDashboard: Alerts tab shows expiring/expired cars with color coding

FEATURE 7 - Price Drop Alerts:
- server/priceAlerts.ts: subscribePriceAlert(), getAlertsForCar(), markAlertNotified()
- server.ts: POST /api/price-alerts/subscribe (public), GET /api/admin/price-alerts (admin)
- server.ts: PUT /api/cars/:id triggers WhatsApp to all subscribers if price drops
- CarDetailsView: price drop subscription form
- supabase-schema.sql: price_alerts table added
- .env.example: all new env vars documented
"@

& $git -C $repo commit -m $msg
Write-Output "--- COMMIT DONE ---"
& $git -C $repo push origin master 2>&1
Write-Output "--- PUSH DONE ---"
