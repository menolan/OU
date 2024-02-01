const rateLimitStore = new Map();

const checkRateLimit = async (key, { maxRequests, interval, waitTime }) => {
  const now = Date.now();
  let rateLimitData = rateLimitStore.get(key);

  if (!rateLimitData) {
    rateLimitData = { requests: 1, timestamp: now };
    rateLimitStore.set(key, rateLimitData);
    return true;
  }

  if (now - rateLimitData.timestamp < interval) {
    if (rateLimitData.requests < maxRequests) {
      rateLimitData.requests++;
      return true;
    } else {
      await new Promise(resolve => setTimeout(resolve, waitTime));
      rateLimitData.requests = 1;
      rateLimitData.timestamp = Date.now();
      return true;
    }
  } else {
    rateLimitData.requests = 1;
    rateLimitData.timestamp = now;
    return true;
  }
};

module.exports = { checkRateLimit };