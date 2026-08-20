/**
 * A four-line typed event bus.
 *
 * The palette, the console, the toast strip and the keyboard layer all need to
 * talk to each other from opposite ends of the tree. Threading callbacks
 * through every layout component would be worse than this.
 */

export type BusEvents = {
  "palette:open": void;
  "palette:close": void;
  "shortcuts:toggle": void;
  "console:focus": void;
  "console:run": string;
  "theme:cycle": { x: number; y: number } | undefined;
  toast: string;
};

type Handler<K extends keyof BusEvents> = (payload: BusEvents[K]) => void;

const handlers = new Map<keyof BusEvents, Set<Handler<never>>>();

export function on<K extends keyof BusEvents>(event: K, handler: Handler<K>) {
  let set = handlers.get(event);
  if (!set) {
    set = new Set();
    handlers.set(event, set);
  }
  set.add(handler as Handler<never>);

  return () => {
    set!.delete(handler as Handler<never>);
  };
}

export function emit<K extends keyof BusEvents>(
  event: K,
  ...args: BusEvents[K] extends void | undefined
    ? [payload?: BusEvents[K]]
    : [payload: BusEvents[K]]
) {
  const set = handlers.get(event);
  if (!set) return;
  for (const handler of [...set]) (handler as Handler<K>)(args[0] as BusEvents[K]);
}
