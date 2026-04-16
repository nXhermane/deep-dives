export enum State {
  PENDING,
  FULFILLED,
  REJECTED,
}

type OnFulfilled<T, TResult1> = (value: T) => TResult1 | MyPromise<TResult1>;
type OnRejected<TResult2> = (reason: unknown) => TResult2 | MyPromise<TResult2>;

interface CallbackHandler<T, TResult1, TResult2> {
  onfulfilled?: OnFulfilled<T, TResult1> | null;
  onrejected?: OnRejected<TResult2> | null;
  resolve: (value: TResult1 | TResult2) => void;
  reject: (reason: unknown) => void;
}

class MyPromise<T> {
  private state: State = State.PENDING;
  private value: T | undefined;
  private reason: unknown;
  private callbacks: CallbackHandler<T, unknown, unknown>[] = [];

  constructor(
    executor: (
      resolve: (value: T) => void,
      reject: (reason: unknown) => void,
    ) => void,
  ) {
    const resolve = (value: T) => {
      if (this.state !== State.PENDING) return;
      this.state = State.FULFILLED;
      this.value = value;
      queueMicrotask(() => {
        this.callbacks.forEach((handler) => this.handleCallback(handler));
      });
    };

    const reject = (reason: unknown) => {
      if (this.state !== State.PENDING) return;
      this.state = State.REJECTED;
      this.reason = reason;
      queueMicrotask(() => {
        this.callbacks.forEach((handler) => this.handleCallback(handler));
      });
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | MyPromise<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | MyPromise<TResult2>)
      | undefined
      | null,
  ): MyPromise<TResult1 | TResult2> {
    return new MyPromise<TResult1 | TResult2>((resolve, reject) => {
      const handler: CallbackHandler<T, TResult1, TResult2> = {
        onfulfilled: onfulfilled || undefined,
        onrejected: onrejected || undefined,
        resolve,
        reject,
      };

      if (this.state === State.PENDING) {
        this.callbacks.push(handler as CallbackHandler<T, unknown, unknown>);
      } else {
        queueMicrotask(() => this.handleCallback(handler));
      }
    });
  }

  private handleCallback<TResult1, TResult2>(
    handler: CallbackHandler<T, TResult1, TResult2>,
  ): void {
    try {
      if (this.state === State.FULFILLED) {
        if (handler.onfulfilled) {
          const result = handler.onfulfilled(this.value as T);
          this.resolveWith(handler.resolve, handler.reject, result);
        } else {
          handler.resolve(this.value as TResult1);
        }
      } else if (this.state === State.REJECTED) {
        if (handler.onrejected) {
          const result = handler.onrejected(this.reason);
          this.resolveWith(handler.resolve, handler.reject, result);
        } else {
          handler.reject(this.reason);
        }
      }
    } catch (error) {
      handler.reject(error);
    }
  }

  private resolveWith<TResult>(
    resolve: (value: TResult) => void,
    reject: (reason: unknown) => void,
    result: TResult | MyPromise<TResult>,
  ): void {
    if (result instanceof MyPromise) {
      result.then(resolve, reject);
    } else {
      resolve(result);
    }
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | MyPromise<TResult>)
      | undefined
      | null,
  ): MyPromise<T | TResult> {
    return this.then(undefined, onrejected);
  }

  static resolve<T>(value: T): MyPromise<T> {
    return new MyPromise<T>((resolve) => resolve(value));
  }

  static reject(reason: any): MyPromise<never> {
    return new MyPromise<never>((_, reject) => reject(reason));
  }

  static all<T>(values: Array<T | MyPromise<T>>): MyPromise<T[]> {
    return new MyPromise<T[]>((resolve, reject) => {
      const results: T[] = [];
      let completedCount = 0;
      if (values.length === 0) {
        resolve(results);
        return;
      }
      values.forEach((value, index) => {
        const promise =
          value instanceof MyPromise ? value : MyPromise.resolve(value);
        promise.then(
          (resolvedValue) => {
            results[index] = resolvedValue;
            completedCount++;

            if (completedCount === values.length) {
              resolve(results);
            }
          },
          (error) => {
            reject(error);
          },
        );
      });
    });
  }
}

console.log("Test de MyPromise...");

const p = new MyPromise<number>((resolve) => {
  console.log("1. Executor synchrone");
  setTimeout(() => {
    console.log("3. Résolution asynchrone");
    resolve(42);
  }, 500);
});

p.then((val) => {
  console.log(`4. Premier then: ${val}`);
  return val * 2;
})
  .then((val) => {
    console.log(`5. Deuxième then (chaîné): ${val}`);
    return new MyPromise((resolve) => {
      setTimeout(() => resolve("Success!"), 200);
    });
  })
  .then((val) => {
    console.log(`6. Troisième then (après une promise retournée): ${val}`);
  });

console.log("2. Fin du script principal");

console.log("Test de MyPromise.all()...");

const promise1 = new MyPromise<number>((resolve) => {
  setTimeout(() => {
    console.log("Promise 1 résolue");
    resolve(10);
  }, 100);
});

const promise2 = new MyPromise<number>((resolve) => {
  setTimeout(() => {
    console.log("Promise 2 résolue");
    resolve(20);
  }, 200);
});

const promise3 = 30; 
MyPromise.all([promise1, promise2, promise3]).then((results) => {
  console.log(`MyPromise.all() résolue: [${results.join(", ")}]`);
});

const failingPromise = new MyPromise<number>((_, reject) => {
  setTimeout(() => {
    reject(new Error("Échec!"));
  }, 50);
});

MyPromise.all([promise1, failingPromise])
  .then((results) => {
    console.log("Cela ne devrait pas s'exécuter",results);
  })
  .catch((error) => {
    console.log(` MyPromise.all() rejetée: ${error.message}`);
  });

MyPromise.all([]).then((results) => {
  console.log(
    `MyPromise.all([]) résolue: [${results.join(", ")}] (longueur: ${results.length})`,
  );
});
