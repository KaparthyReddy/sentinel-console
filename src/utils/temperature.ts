export function isOutOfRange(temperatureC: number, minC: number, maxC: number): boolean {
  return temperatureC < minC || temperatureC > maxC;
}

/** How far outside the allowed range a reading is (0 when within range). */
export function excursionDelta(temperatureC: number, minC: number, maxC: number): number {
  if (temperatureC > maxC) return Number((temperatureC - maxC).toFixed(2));
  if (temperatureC < minC) return Number((minC - temperatureC).toFixed(2));
  return 0;
}
