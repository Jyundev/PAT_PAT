export function makeRequestId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // UUID가 없을 때 안전한 난수 문자열 생성
  const arr = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues)
    globalThis.crypto.getRandomValues(arr);
  const rand = Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${Date.now()}-${rand}`;
}
