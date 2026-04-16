/**
 * 🧠 MyPromise from Scratch
 */

type State = "PENDING" | "FULFILLED" | "REJECTED";

class MyPromise<T> {
  // TODO: Implémenter le cœur de la Promise
  
  constructor(executor: (resolve: (value: T) => void, reject: (reason: any) => void) => void) {
    // TODO
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | MyPromise<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | MyPromise<TResult2>) | undefined | null
  ): MyPromise<TResult1 | TResult2> {
    // TODO
    return null as any;
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | MyPromise<TResult>) | undefined | null
  ): MyPromise<T | TResult> {
    return this.then(undefined, onrejected);
  }

  static resolve<T>(value: T): MyPromise<T> {
    // TODO
    return null as any;
  }

  static reject(reason: any): MyPromise<never> {
    // TODO
    return null as any;
  }
}

// --- Zone de Test ---

console.log("🚀 Test de MyPromise...");

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
