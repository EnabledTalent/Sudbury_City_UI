# Backend Setup Guide for Real-Time Data Extraction

This guide explains how to set up backend endpoints to replace the mock API with real data from Sudbury sources.

## Current Setup

The frontend is configured to use **mock data** by default. To switch to real API endpoints:

1. Set `REACT_APP_API_BASE_URL` in your `.env` file
2. Set `REACT_APP_USE_MOCK_API=false` in your `.env` file

## Backend Options

### Option 1: Express.js Server (Recommended)

Create a separate Express server to handle API requests.

#### Installation

```bash
npm install express rss-parser node-cache cors
```

#### Server Setup (`server.js`)

```javascript
const express = require("express");
const cors = require("cors");
const Parser = require("rss-parser");
const NodeCache = require("node-cache");

const app = express();
const parser = new Parser();
const cache = new NodeCache({ stdTTL: 60 });

app.use(cors());
app.use(express.json());

// City Services & Updates (RSS Feed)
app.get("/api/sudbury/services", async (req, res) => {
  try {
    const cached = cache.get("services");
    if (cached) return res.json(cached);

    // Replace with actual RSS feed URL from Greater Sudbury
    const FEED_URL = process.env.SUDBURY_NEWS_RSS_URL || 
      "https://www.greatersudbury.ca/city-hall/news-and-public-notices/feed/";

    const feed = await parser.parseURL(FEED_URL);

    const payload = {
      updatedAt: new Date().toISOString(),
      items: (feed.items || []).slice(0, 10).map((x) => ({
        id: x.guid || x.link,
        label: x.title || "Update",
        url: x.link,
        date: x.isoDate || x.pubDate || null,
      })),
    };

    cache.set("services", payload, 60); // Cache for 60 seconds
    res.json(payload);
  } catch (e) {
    console.error("Services error:", e);
    res.status(500).json({ error: "Failed to load services updates" });
  }
});

// Community Events
app.get("/api/sudbury/events", async (req, res) => {
  try {
    const cached = cache.get("events");
    if (cached) return res.json(cached);

    // Option A: Eventbrite API (requires token)
    // const EVENTBRITE_TOKEN = process.env.EVENTBRITE_TOKEN;
    // const response = await fetch(
    //   `https://www.eventbriteapi.com/v3/events/search/?location.address=Sudbury&token=${EVENTBRITE_TOKEN}`
    // );
    // const data = await response.json();

    // Option B: Scrape Discover Sudbury events page
    // Option C: Use WordPress REST API if available

    // Placeholder: return mock data structure
    const payload = {
      updatedAt: new Date().toISOString(),
      items: [], // Replace with actual event data
    };

    cache.set("events", payload, 120); // Cache for 2 minutes
    res.json(payload);
  } catch (e) {
    console.error("Events error:", e);
    res.status(500).json({ error: "Failed to load events" });
  }
});

// Local Businesses (Open Data Portal)
app.get("/api/sudbury/businesses", async (req, res) => {
  try {
    const cached = cache.get("businesses");
    if (cached) return res.json(cached);

    // Open Data Portal API endpoint
    // Check: https://dataportal.greatersudbury.ca/swagger/ui/index
    const API_URL = process.env.SUDBURY_BUSINESS_API_URL || 
      "https://dataportal.greatersudbury.ca/api/v1/business-licenses";

    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Upstream error");

    const json = await response.json();

    const payload = {
      updatedAt: new Date().toISOString(),
      items: (json || []).slice(0, 10).map((b, idx) => ({
        id: b.id || b.licenceNumber || idx,
        label: b.businessName || b.name || "Business",
        url: b.website || "https://dataportal.greatersudbury.ca/",
      })),
    };

    cache.set("businesses", payload, 300); // Cache for 5 minutes
    res.json(payload);
  } catch (e) {
    console.error("Businesses error:", e);
    res.status(500).json({ error: "Failed to load businesses" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
```

#### Environment Variables (`.env`)

```env
SUDBURY_NEWS_RSS_URL=https://www.greatersudbury.ca/city-hall/news-and-public-notices/feed/
SUDBURY_BUSINESS_API_URL=https://dataportal.greatersudbury.ca/api/v1/business-licenses
EVENTBRITE_TOKEN=your_eventbrite_token_here
PORT=3001
```

#### Update React App `.env`

```env
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_USE_MOCK_API=false
```

### Option 2: Next.js API Routes

If using Next.js, create API routes in `pages/api/sudbury/`:

- `pages/api/sudbury/services.js`
- `pages/api/sudbury/events.js`
- `pages/api/sudbury/businesses.js`

### Option 3: Proxy Setup (Create React App)

Add to `package.json`:

```json
{
  "proxy": "http://localhost:3001"
}
```

Then update API calls to use relative paths (already done in the code).

## Data Sources

### 1. City Services & Updates (RSS)
- **Source**: Greater Sudbury News and Public Notices
- **URL**: Check city website for RSS feed URL
- **Format**: RSS/XML

### 2. Community Events
- **Option A**: Eventbrite API (requires API token)
- **Option B**: Discover Sudbury website scraping
- **Option C**: WordPress REST API (if available)

### 3. Local Businesses
- **Source**: Greater Sudbury Open Data Portal
- **URL**: https://dataportal.greatersudbury.ca/
- **API Docs**: https://dataportal.greatersudbury.ca/swagger/ui/index
- **Format**: JSON API

## Testing

1. Start backend server: `node server.js`
2. Update React app `.env` to point to backend
3. Restart React dev server
4. Check browser console for API calls
5. Verify data appears in ResidentHub tiles

## Notes

- Caching is implemented to reduce API calls
- Error handling is included for failed requests
- Mock data is used as fallback during development
- All endpoints return consistent JSON structure

