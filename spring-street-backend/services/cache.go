package services

import (
	"sync"
	"time"

	"github.com/yourusername/spring-street-backend/models"
)

type cacheItem struct {
	data       []models.OHLCBar
	expiration time.Time
}

type OHLCache struct {
	mu    sync.RWMutex
	items map[string]cacheItem
}

var globalCache = &OHLCache{
	items: make(map[string]cacheItem),
}

// Get attempts to fetch data from the cache. Returns nil if not found or expired.
func (c *OHLCache) Get(key string) []models.OHLCBar {
	c.mu.RLock()
	item, found := c.items[key]
	c.mu.RUnlock()

	if !found {
		return nil
	}
	if time.Now().After(item.expiration) {
		// Cache expired, remove it asynchronously
		go c.Delete(key)
		return nil
	}
	return item.data
}

// Set stores data in the cache with the given duration as TTL.
func (c *OHLCache) Set(key string, data []models.OHLCBar, duration time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items[key] = cacheItem{
		data:       data,
		expiration: time.Now().Add(duration),
	}
}

// Delete removes an item from the cache.
func (c *OHLCache) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.items, key)
}
