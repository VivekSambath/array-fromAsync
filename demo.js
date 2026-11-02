// Live simulations for the example slides. They run the browser's real
// Array.fromAsync() against a fake fetch, so nothing goes over the network.

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A tiny console that prints each line with the time since Run was pressed.
function makeConsole(root) {
  const out = root.querySelector(".console");
  let t0 = 0;
  return {
    start() {
      out.textContent = "";
      t0 = performance.now();
    },
    log(text, kind = "") {
      const line = document.createElement("div");
      if (kind) line.className = kind;
      const secs = ((performance.now() - t0) / 1000).toFixed(2).padStart(5);
      line.textContent = `${secs}s  ${text}`;
      out.append(line);
      out.scrollTop = out.scrollHeight;
    },
  };
}

// ---------- fake API: 300 ms per request ----------
const USER_PAGES = [
  [{ id: 1, name: "Asha" }, { id: 2, name: "Ben" }],
  [{ id: 3, name: "Chen" }, { id: 4, name: "Dana" }],
  [],
];
const PRODUCTS = { 101: "Mug", 102: "Notebook", 103: "Pen" };

async function fakeFetch(url, log, failId = null) {
  log(`→ GET ${url}`);
  await sleep(300);

  const page = url.match(/page=(\d+)/);
  if (page) {
    const users = USER_PAGES[page[1] - 1] ?? [];
    log(`← ${users.length} users`);
    return { json: async () => users };
  }

  const id = Number(url.split("/").pop());
  if (id === failId) {
    log(`✗ ${id} failed (404)`, "err");
    throw new Error(`product ${id} not found`);
  }
  log(`← ${PRODUCTS[id]}`);
  return { json: async () => ({ id, name: PRODUCTS[id] }) };
}

// ---------- demos ----------
const demos = {
  // Syntax slide: the same mapFn with and without thisArg.
  async thisarg(root, c) {
    const pricing = {
      taxRate: 0.2,
      async addTax(price) {
        return price * (1 + this.taxRate);
      },
    };

    const withThis = await Array.fromAsync([10, 20], pricing.addTax, pricing);
    c.log(`with thisArg:    ${JSON.stringify(withThis)}`, "ok");

    try {
      const withoutThis = await Array.fromAsync([10, 20], pricing.addTax);
      c.log(`without thisArg: [${withoutThis.join(", ")}]  this.taxRate was undefined`, "err");
    } catch (err) {
      // In strict mode `this` is undefined, so reading taxRate throws instead.
      c.log(`without thisArg: ${err.name}: ${err.message}`, "err");
    }

    const withArrow = await Array.fromAsync([10, 20], (p) => pricing.addTax(p));
    c.log(`arrow function:  ${JSON.stringify(withArrow)}`, "ok");
  },

  // Real example 1: paginated API through an async generator.
  async pages(root, c) {
    async function* getUsers() {
      let page = 1;
      while (true) {
        const res = await fakeFetch(`/api/users?page=${page}`, c.log);
        const users = await res.json();
        if (users.length === 0) return;
        yield* users;
        page++;
      }
    }

    const allUsers = await Array.fromAsync(getUsers());
    c.log(`allUsers = ${JSON.stringify(allUsers.map((u) => u.name))}`, "ok");
  },

  // Real example 2: async mapFn, with an optional failure on 102.
  async cart(root, c) {
    const failId = root.querySelector("[name=fail]").checked ? 102 : null;
    const skip = root.querySelector("[name=mode]").value === "skip";
    const cartIds = [101, 102, 103];

    try {
      const products = await Array.fromAsync(cartIds, async (id) => {
        try {
          const res = await fakeFetch(`/api/products/${id}`, c.log, failId);
          return await res.json();
        } catch (err) {
          if (!skip) throw err;
          c.log(`  caught in mapFn, skipping ${id}`);
          return null;
        }
      });
      c.log(`products = ${JSON.stringify(products.map((p) => p && p.name))}`, "ok");
    } catch (err) {
      c.log(`rejected: ${err.message}. 103 was never requested.`, "err");
    }
  },

  // vs Promise.all(): the same three 1-second tasks, run both ways at once.
  async race(root, c) {
    const DURATION = 1000;
    const bars = (lane) => [...root.querySelectorAll(`[data-lane="${lane}"] .bar`)];

    for (const bar of root.querySelectorAll(".bar")) {
      bar.style.transition = "none";
      bar.style.width = "0";
    }
    root.offsetWidth; // apply the reset before animating

    const task = async (bar) => {
      bar.style.transition = `width ${DURATION}ms linear`;
      bar.style.width = "33%";
      await sleep(DURATION);
    };
    const timed = async (label, run) => {
      const t = performance.now();
      await run();
      c.log(`${label} done in ${((performance.now() - t) / 1000).toFixed(1)} s`, "ok");
    };

    await Promise.all([
      timed("Array.fromAsync():", () => Array.fromAsync(bars("seq"), task)),
      timed("Promise.all():    ", () => Promise.all(bars("par").map(task))),
    ]);
  },
};

// ---------- wire up the Run buttons ----------
for (const root of document.querySelectorAll("[data-demo]")) {
  const button = root.querySelector(".run");
  const c = makeConsole(root);

  button.addEventListener("click", async () => {
    c.start();
    if (typeof Array.fromAsync !== "function") {
      c.log("This browser doesn’t support Array.fromAsync() yet.", "err");
      return;
    }
    button.disabled = true;
    try {
      await demos[root.dataset.demo](root, c);
    } finally {
      button.disabled = false;
    }
  });
}
