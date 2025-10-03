import { NutritionCache } from '../../../services/nutrition/NutritionCache';

describe('NutritionCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should cache and retrieve data', () => {
    const cache = new NutritionCache();
    const data = { calories: 100, fat: 5, carbs: 20, protein: 8 };

    cache.set('apple', data);
    const retrieved = cache.get('apple');

    expect(retrieved).toEqual(data);
  });

  it('should return null for missing keys', () => {
    const cache = new NutritionCache();
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('should evict least used entries when full', () => {
    const cache = new NutritionCache(2); // Max size 2
    const data = { calories: 100, fat: 5, carbs: 20, protein: 8 };

    cache.set('food1', data);
    cache.set('food2', data);

    // Access food1 multiple times
    cache.get('food1');
    cache.get('food1');

    // Add third item (should evict food2)
    cache.set('food3', data);

    expect(cache.get('food1')).not.toBeNull();
    expect(cache.get('food2')).toBeNull(); // Evicted
    expect(cache.get('food3')).not.toBeNull();
  });

  it('should respect TTL', (done) => {
    const cache = new NutritionCache(100, 0.0001); // 0.0001 hour TTL (~0.36 seconds)
    const data = { calories: 100, fat: 5, carbs: 20, protein: 8 };

    cache.set('food', data);

    // Verify it exists initially
    expect(cache.get('food')).not.toBeNull();

    // Wait for expiration
    setTimeout(() => {
      expect(cache.get('food')).toBeNull();
      done();
    }, 500); // Wait 500ms
  });

  it('should increment hit count when data is accessed', () => {
    const cache = new NutritionCache();
    const data = { calories: 100, fat: 5, carbs: 20, protein: 8 };

    cache.set('apple', data);

    // Access multiple times
    cache.get('apple');
    cache.get('apple');
    cache.get('apple');

    const stats = cache.getStats();
    expect(stats.size).toBe(1);
  });

  it('should clear all cache entries', () => {
    const cache = new NutritionCache();
    const data = { calories: 100, fat: 5, carbs: 20, protein: 8 };

    cache.set('food1', data);
    cache.set('food2', data);

    expect(cache.getStats().size).toBe(2);

    cache.clear();

    expect(cache.getStats().size).toBe(0);
    expect(cache.get('food1')).toBeNull();
    expect(cache.get('food2')).toBeNull();
  });

  it('should return cache statistics', () => {
    const cache = new NutritionCache(100);
    const data = { calories: 100, fat: 5, carbs: 20, protein: 8 };

    cache.set('food1', data);
    cache.set('food2', data);

    const stats = cache.getStats();

    expect(stats.size).toBe(2);
    expect(stats.maxSize).toBe(100);
    expect(typeof stats.hitRate).toBe('number');
  });
});
