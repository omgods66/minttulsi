import "server-only";

const orderLocks = new Map<string, Promise<void>>();

export async function withOrderLock<T>(
  orderId: string,
  task: () => Promise<T>,
): Promise<T> {
  const previous = orderLocks.get(orderId) ?? Promise.resolve();
  let release!: () => void;
  const currentLock = new Promise<void>((resolve) => {
    release = resolve;
  });
  const queuedLock = previous.then(() => currentLock);

  orderLocks.set(orderId, queuedLock);
  await previous;

  try {
    return await task();
  } finally {
    release();

    if (orderLocks.get(orderId) === queuedLock) {
      orderLocks.delete(orderId);
    }
  }
}
