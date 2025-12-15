import './chunk-V4OQ3NZ2.js';

// node_modules/web-vitals/dist/web-vitals.js
var e = -1;
var t = t2 => {
  addEventListener(
    'pageshow',
    n2 => {
      n2.persisted && ((e = n2.timeStamp), t2(n2));
    },
    true
  );
};
var n = (e2, t2, n2, i2) => {
  let s2, o2;
  return r2 => {
    t2.value >= 0 &&
      (r2 || i2) &&
      ((o2 = t2.value - (s2 ?? 0)),
      (o2 || void 0 === s2) &&
        ((s2 = t2.value),
        (t2.delta = o2),
        (t2.rating = ((e3, t3) =>
          e3 > t3[1] ? 'poor' : e3 > t3[0] ? 'needs-improvement' : 'good')(t2.value, n2)),
        e2(t2)));
  };
};
var i = e2 => {
  requestAnimationFrame(() => requestAnimationFrame(() => e2()));
};
var s = () => {
  const e2 = performance.getEntriesByType('navigation')[0];
  if (e2 && e2.responseStart > 0 && e2.responseStart < performance.now()) return e2;
};
var o = () => {
  const e2 = s();
  return e2?.activationStart ?? 0;
};
var r = (t2, n2 = -1) => {
  const i2 = s();
  let r2 = 'navigate';
  e >= 0
    ? (r2 = 'back-forward-cache')
    : i2 &&
      (document.prerendering || o() > 0
        ? (r2 = 'prerender')
        : document.wasDiscarded
          ? (r2 = 'restore')
          : i2.type && (r2 = i2.type.replace(/_/g, '-')));
  return {
    name: t2,
    value: n2,
    rating: 'good',
    delta: 0,
    entries: [],
    id: `v5-${Date.now()}-${Math.floor(8999999999999 * Math.random()) + 1e12}`,
    navigationType: r2,
  };
};
var c = /* @__PURE__ */ new WeakMap();
function a(e2, t2) {
  return (c.get(e2) || c.set(e2, new t2()), c.get(e2));
}
var d = class {
  t;
  i = 0;
  o = [];
  h(e2) {
    if (e2.hadRecentInput) return;
    const t2 = this.o[0],
      n2 = this.o.at(-1);
    (this.i &&
    t2 &&
    n2 &&
    e2.startTime - n2.startTime < 1e3 &&
    e2.startTime - t2.startTime < 5e3
      ? ((this.i += e2.value), this.o.push(e2))
      : ((this.i = e2.value), (this.o = [e2])),
      this.t?.(e2));
  }
};
var h = (e2, t2, n2 = {}) => {
  try {
    if (PerformanceObserver.supportedEntryTypes.includes(e2)) {
      const i2 = new PerformanceObserver(e3 => {
        Promise.resolve().then(() => {
          t2(e3.getEntries());
        });
      });
      return (i2.observe({ type: e2, buffered: true, ...n2 }), i2);
    }
  } catch {}
};
var f = e2 => {
  let t2 = false;
  return () => {
    t2 || (e2(), (t2 = true));
  };
};
var u = -1;
var l = /* @__PURE__ */ new Set();
var m = () =>
  'hidden' !== document.visibilityState || document.prerendering ? 1 / 0 : 0;
var p = e2 => {
  if ('hidden' === document.visibilityState) {
    if ('visibilitychange' === e2.type) for (const e3 of l) e3();
    isFinite(u) ||
      ((u = 'visibilitychange' === e2.type ? e2.timeStamp : 0),
      removeEventListener('prerenderingchange', p, true));
  }
};
var v = () => {
  if (u < 0) {
    const e2 = o(),
      n2 = document.prerendering
        ? void 0
        : globalThis.performance
            .getEntriesByType('visibility-state')
            .filter(t2 => 'hidden' === t2.name && t2.startTime > e2)[0]?.startTime;
    ((u = n2 ?? m()),
      addEventListener('visibilitychange', p, true),
      addEventListener('prerenderingchange', p, true),
      t(() => {
        setTimeout(() => {
          u = m();
        });
      }));
  }
  return {
    get firstHiddenTime() {
      return u;
    },
    onHidden(e2) {
      l.add(e2);
    },
  };
};
var g = e2 => {
  document.prerendering ? addEventListener('prerenderingchange', () => e2(), true) : e2();
};
var y = [1800, 3e3];
var E = (e2, s2 = {}) => {
  g(() => {
    const c2 = v();
    let a2,
      d2 = r('FCP');
    const f2 = h('paint', e3 => {
      for (const t2 of e3)
        'first-contentful-paint' === t2.name &&
          (f2.disconnect(),
          t2.startTime < c2.firstHiddenTime &&
            ((d2.value = Math.max(t2.startTime - o(), 0)),
            d2.entries.push(t2),
            a2(true)));
    });
    f2 &&
      ((a2 = n(e2, d2, y, s2.reportAllChanges)),
      t(t2 => {
        ((d2 = r('FCP')),
          (a2 = n(e2, d2, y, s2.reportAllChanges)),
          i(() => {
            ((d2.value = performance.now() - t2.timeStamp), a2(true));
          }));
      }));
  });
};
var b = [0.1, 0.25];
var L = (e2, s2 = {}) => {
  const o2 = v();
  E(
    f(() => {
      let c2,
        f2 = r('CLS', 0);
      const u2 = a(s2, d),
        l2 = e3 => {
          for (const t2 of e3) u2.h(t2);
          u2.i > f2.value && ((f2.value = u2.i), (f2.entries = u2.o), c2());
        },
        m2 = h('layout-shift', l2);
      m2 &&
        ((c2 = n(e2, f2, b, s2.reportAllChanges)),
        o2.onHidden(() => {
          (l2(m2.takeRecords()), c2(true));
        }),
        t(() => {
          ((u2.i = 0),
            (f2 = r('CLS', 0)),
            (c2 = n(e2, f2, b, s2.reportAllChanges)),
            i(() => c2()));
        }),
        setTimeout(c2));
    })
  );
};
var P = 0;
var T = 1 / 0;
var _ = 0;
var M = e2 => {
  for (const t2 of e2)
    t2.interactionId &&
      ((T = Math.min(T, t2.interactionId)),
      (_ = Math.max(_, t2.interactionId)),
      (P = _ ? (_ - T) / 7 + 1 : 0));
};
var w;
var C = () => (w ? P : (performance.interactionCount ?? 0));
var I = () => {
  'interactionCount' in performance ||
    w ||
    (w = h('event', M, { type: 'event', buffered: true, durationThreshold: 0 }));
};
var F = 0;
var k = class {
  u = [];
  l = /* @__PURE__ */ new Map();
  m;
  p;
  v() {
    ((F = C()), (this.u.length = 0), this.l.clear());
  }
  L() {
    const e2 = Math.min(this.u.length - 1, Math.floor((C() - F) / 50));
    return this.u[e2];
  }
  h(e2) {
    if ((this.m?.(e2), !e2.interactionId && 'first-input' !== e2.entryType)) return;
    const t2 = this.u.at(-1);
    let n2 = this.l.get(e2.interactionId);
    if (n2 || this.u.length < 10 || e2.duration > t2.P) {
      if (
        (n2
          ? e2.duration > n2.P
            ? ((n2.entries = [e2]), (n2.P = e2.duration))
            : e2.duration === n2.P &&
              e2.startTime === n2.entries[0].startTime &&
              n2.entries.push(e2)
          : ((n2 = { id: e2.interactionId, entries: [e2], P: e2.duration }),
            this.l.set(n2.id, n2),
            this.u.push(n2)),
        this.u.sort((e3, t3) => t3.P - e3.P),
        this.u.length > 10)
      ) {
        const e3 = this.u.splice(10);
        for (const t3 of e3) this.l.delete(t3.id);
      }
      this.p?.(n2);
    }
  }
};
var A = e2 => {
  const t2 = globalThis.requestIdleCallback || setTimeout;
  'hidden' === document.visibilityState
    ? e2()
    : ((e2 = f(e2)),
      addEventListener('visibilitychange', e2, { once: true, capture: true }),
      t2(() => {
        (e2(), removeEventListener('visibilitychange', e2, { capture: true }));
      }));
};
var B = [200, 500];
var S = (e2, i2 = {}) => {
  if (
    !globalThis.PerformanceEventTiming ||
    !('interactionId' in PerformanceEventTiming.prototype)
  )
    return;
  const s2 = v();
  g(() => {
    I();
    let o2,
      c2 = r('INP');
    const d2 = a(i2, k),
      f2 = e3 => {
        A(() => {
          for (const t3 of e3) d2.h(t3);
          const t2 = d2.L();
          t2 && t2.P !== c2.value && ((c2.value = t2.P), (c2.entries = t2.entries), o2());
        });
      },
      u2 = h('event', f2, { durationThreshold: i2.durationThreshold ?? 40 });
    ((o2 = n(e2, c2, B, i2.reportAllChanges)),
      u2 &&
        (u2.observe({ type: 'first-input', buffered: true }),
        s2.onHidden(() => {
          (f2(u2.takeRecords()), o2(true));
        }),
        t(() => {
          (d2.v(), (c2 = r('INP')), (o2 = n(e2, c2, B, i2.reportAllChanges)));
        })));
  });
};
var N = class {
  m;
  h(e2) {
    this.m?.(e2);
  }
};
var q = [2500, 4e3];
var x = (e2, s2 = {}) => {
  g(() => {
    const c2 = v();
    let d2,
      u2 = r('LCP');
    const l2 = a(s2, N),
      m2 = e3 => {
        s2.reportAllChanges || (e3 = e3.slice(-1));
        for (const t2 of e3)
          (l2.h(t2),
            t2.startTime < c2.firstHiddenTime &&
              ((u2.value = Math.max(t2.startTime - o(), 0)), (u2.entries = [t2]), d2()));
      },
      p2 = h('largest-contentful-paint', m2);
    if (p2) {
      d2 = n(e2, u2, q, s2.reportAllChanges);
      const o2 = f(() => {
          (m2(p2.takeRecords()), p2.disconnect(), d2(true));
        }),
        c3 = e3 => {
          e3.isTrusted && (A(o2), removeEventListener(e3.type, c3, { capture: true }));
        };
      for (const e3 of ['keydown', 'click', 'visibilitychange'])
        addEventListener(e3, c3, { capture: true });
      t(t2 => {
        ((u2 = r('LCP')),
          (d2 = n(e2, u2, q, s2.reportAllChanges)),
          i(() => {
            ((u2.value = performance.now() - t2.timeStamp), d2(true));
          }));
      });
    }
  });
};
var H = [800, 1800];
var O = e2 => {
  document.prerendering
    ? g(() => O(e2))
    : 'complete' !== document.readyState
      ? addEventListener('load', () => O(e2), true)
      : setTimeout(e2);
};
var $ = (e2, i2 = {}) => {
  let c2 = r('TTFB'),
    a2 = n(e2, c2, H, i2.reportAllChanges);
  O(() => {
    const d2 = s();
    d2 &&
      ((c2.value = Math.max(d2.responseStart - o(), 0)),
      (c2.entries = [d2]),
      a2(true),
      t(() => {
        ((c2 = r('TTFB', 0)), (a2 = n(e2, c2, H, i2.reportAllChanges)), a2(true));
      }));
  });
};
export {
  b as CLSThresholds,
  y as FCPThresholds,
  B as INPThresholds,
  q as LCPThresholds,
  H as TTFBThresholds,
  L as onCLS,
  E as onFCP,
  S as onINP,
  x as onLCP,
  $ as onTTFB,
};
//# sourceMappingURL=web-vitals.js.map
