import AsyncStorage from "@react-native-async-storage/async-storage";

interface CacheItem<T> {
    value: T;
    timestamp: number;
    ttl: number;
}

const CACHE_PREFIX = "api_cache_";

export const cacheService = {
    /**
     * Stores a value in the cache with a specified TTL.
     * @param key The cache key
     * @param value The value to store
     * @param ttlMinutes Time to live in minutes (default: 60)
     */
    async set<T>(key: string, value: T, ttlMinutes: number = 60): Promise<void> {
        const item: CacheItem<T> = {
            value,
            timestamp: Date.now(),
            ttl: ttlMinutes * 60 * 1000,
        };
        try {
            await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
        } catch (e) {
            console.warn("Cache set failed", e);
        }
    },

    /**
     * Retrieves a value from the cache if it hasn't expired.
     * @param key The cache key
     * @returns The cached value or null if expired/not found
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await AsyncStorage.getItem(CACHE_PREFIX + key);
            if (!value) return null;

            const item: CacheItem<T> = JSON.parse(value);
            const now = Date.now();

            if (now - item.timestamp > item.ttl) {
                // Item expired
                await AsyncStorage.removeItem(CACHE_PREFIX + key);
                return null;
            }

            return item.value;
        } catch (e) {
            console.warn("Cache get failed", e);
            return null;
        }
    },

    /**
     * Removes a specific item from the cache.
     * @param key The cache key
     */
    async remove(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(CACHE_PREFIX + key);
        } catch (e) {
            console.warn("Cache remove failed", e);
        }
    },

    /**
     * Clears all API cache items.
     */
    async clearAll(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
            if (cacheKeys.length > 0) {
                await AsyncStorage.multiRemove(cacheKeys);
            }
        } catch (e) {
            console.warn("Cache clear failed", e);
        }
    },
};
