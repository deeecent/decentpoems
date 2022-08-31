import { writable } from "svelte/store";

export const panic = writable(false);

window.addEventListener("unhandledrejection", function (promiseRejectionEvent) {
  console.error("Unhandled Rejection");
  panic.set(true);
});

export class RecoverableError extends Error {
  parentError: unknown;

  constructor(message: string, e: unknown) {
    super(message);
    Object.setPrototypeOf(this, RecoverableError.prototype);
    this.parentError = e;
  }
}

export class Panic extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, RecoverableError.prototype);
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function retry(f: () => Promise<void>, catchAll = false) {
  return async () => {
    for (let i = 0; i < 3; i++) {
      try {
        return await f();
      } catch (e: any) {
        if (catchAll || e instanceof RecoverableError) {
          console.error("Retry", i + 1, e);
          await sleep(1000);
        } else {
          console.log("Unknown error");
          throw e;
        }
      }
    }
    console.error("Panic", f);
    panic.set(true);
    //throw new Panic("Panic");
  };
}
