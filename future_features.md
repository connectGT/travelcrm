# 🗂️ ConnectGT CRM — Future Features Backlog

> This file tracks planned features to be built later. Review and prioritize regularly.

---

## 🔴 HIGH PRIORITY

### 1. Itinerary & Quotation Database Upload
**What:** Allow agents to upload their previously prepared itineraries and quotations into the CRM database, so they become part of the suggestion engine pool.

**Why:** Right now the suggestion engine only finds quotes from trips already created in the CRM. Agents have years of past data in Excel, Word, or PDF — this feature unlocks all of that.

**Planned formats to support:**
- Excel (.xlsx) — structured rows per day/hotel
- PDF — parsed with AI extraction
- Manual form entry — day-by-day UI builder

**How it would work:**
1. Agent goes to a new "Quote Library" section
2. Uploads a file OR fills in a form manually
3. Fills destination tags (e.g., Srinagar 2N, Gulmarg 1N, Pahalgam 2N)
4. Saves to the Quote Library database (not linked to any trip)
5. These quotes become available in the suggestion engine for any future matching trip

**Models needed:**
- `QuoteTemplate` — standalone quote not linked to a specific trip
- `ItineraryDay` — day-by-day activities linked to a QuoteTemplate or Quote
- `TemplateHotelItem` — hotel assignments for templates

**Status:** ⏳ Not started — waiting for core pipeline to stabilize

---

## 🟡 MEDIUM PRIORITY

### 2. WhatsApp / Email Lead Auto-Parsing
**What:** When a new WhatsApp or Email lead comes in, auto-parse the message using AI to extract: destination, dates, pax count, budget hints, and pre-fill the RawLead fields automatically.

**Why:** Currently agents must manually read the raw message and fill in destination/date/pax. Auto-parsing will make the pipeline nearly zero-touch.

**Status:** ⏳ Not started

---

### 3. Quote PDF Branding & Sending
**What:** Generate a branded PDF of the quotation and send it directly to the client via WhatsApp or Email from within the CRM.

**Why:** Currently agents export a PDF and manually send. In-app sending = faster turnaround + tracking (read receipts).

**Status:** ⏳ Not started — PDF generation backend exists, needs frontend trigger + WhatsApp API

---

### 4. Agent Performance Dashboard
**What:** A dashboard showing per-agent stats: leads converted, average response time, revenue generated, trips closed, follow-up completion rate.

**Why:** Management visibility and incentive tracking.

**Status:** ⏳ Not started

---

## 🟢 LOW PRIORITY / NICE TO HAVE

### 5. Client Portal (Read-Only)
**What:** A unique link sent to the client where they can view their quotation, trip itinerary, and hotel list. No login required — shareable link.

**Why:** Premium experience for clients. Reduces back-and-forth.

**Status:** ⏳ Not started

### 6. Budget Range Filtering in Suggestions
**What:** On the suggestion engine, allow filtering by estimated budget per person (based on historical hotel costs stored in past quotes).

**Why:** A ₹20,000 budget client shouldn't see a ₹80,000 quote suggestion.

**Status:** ⏳ Not started — depends on Quote Library feature being built first

---

*Last updated: 2026-05-28*
*Update this file whenever a new feature idea comes up or a feature ships.*
