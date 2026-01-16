// Mock API service for development
// Replace this with real backend endpoints when available

// Mock data generators
const generateMockServices = () => ({
  updatedAt: new Date().toISOString(),
  items: [
    {
      id: "1",
      label: "Winter Road Maintenance Update",
      url: "https://www.greatersudbury.ca/city-hall/news-and-public-notices/",
      date: new Date().toISOString(),
    },
    {
      id: "2",
      label: "New Recreation Programs Available",
      url: "https://www.greatersudbury.ca/city-hall/news-and-public-notices/",
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "3",
      label: "City Council Meeting Notice",
      url: "https://www.greatersudbury.ca/city-hall/news-and-public-notices/",
      date: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
});

const generateMockEvents = () => ({
  updatedAt: new Date().toISOString(),
  items: [
    {
      id: "1",
      label: "Sudbury Winter Festival",
      url: "https://discoversudbury.ca/list/",
      date: new Date(Date.now() + 604800000).toISOString(),
    },
    {
      id: "2",
      label: "Community Market Day",
      url: "https://discoversudbury.ca/list/",
      date: new Date(Date.now() + 1209600000).toISOString(),
    },
    {
      id: "3",
      label: "Local Art Exhibition",
      url: "https://discoversudbury.ca/list/",
      date: new Date(Date.now() + 1814400000).toISOString(),
    },
  ],
});

const generateMockBusinesses = () => ({
  updatedAt: new Date().toISOString(),
  items: [
    {
      id: "1",
      label: "Downtown Coffee Shop",
      url: "https://dataportal.greatersudbury.ca/",
    },
    {
      id: "2",
      label: "Local Hardware Store",
      url: "https://dataportal.greatersudbury.ca/",
    },
    {
      id: "3",
      label: "Family Restaurant",
      url: "https://dataportal.greatersudbury.ca/",
    },
  ],
});

// Cache simulation
const cache = {
  services: null,
  events: null,
  businesses: null,
  servicesTime: 0,
  eventsTime: 0,
  businessesTime: 0,
};

const CACHE_DURATION = {
  services: 60000, // 1 minute
  events: 120000, // 2 minutes
  businesses: 300000, // 5 minutes
};

// Mock API endpoints
export const mockApi = {
  async getServices() {
    const now = Date.now();
    if (cache.services && (now - cache.servicesTime) < CACHE_DURATION.services) {
      return cache.services;
    }
    const data = generateMockServices();
    cache.services = data;
    cache.servicesTime = now;
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return data;
  },

  async getEvents() {
    const now = Date.now();
    if (cache.events && (now - cache.eventsTime) < CACHE_DURATION.events) {
      return cache.events;
    }
    const data = generateMockEvents();
    cache.events = data;
    cache.eventsTime = now;
    await new Promise((resolve) => setTimeout(resolve, 300));
    return data;
  },

  async getBusinesses() {
    const now = Date.now();
    if (cache.businesses && (now - cache.businessesTime) < CACHE_DURATION.businesses) {
      return cache.businesses;
    }
    const data = generateMockBusinesses();
    cache.businesses = data;
    cache.businessesTime = now;
    await new Promise((resolve) => setTimeout(resolve, 300));
    return data;
  },
};

