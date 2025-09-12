try {
  (() => {
    var P = __STORYBOOK_API__,
      {
        ActiveTabs: T,
        Consumer: b,
        ManagerContext: g,
        Provider: h,
        RequestResponseError: f,
        addons: n,
        combineParameters: v,
        controlOrMetaKey: C,
        controlOrMetaSymbol: R,
        eventMatchesShortcut: x,
        eventToShortcut: M,
        experimental_MockUniversalStore: k,
        experimental_UniversalStore: E,
        experimental_requestResponse: U,
        experimental_useUniversalStore: B,
        isMacLike: I,
        isShortcutTaken: K,
        keyToSymbol: L,
        merge: N,
        mockChannel: w,
        optionOrAltSymbol: J,
        shortcutMatchesShortcut: V,
        shortcutToHumanString: Y,
        types: F,
        useAddonState: X,
        useArgTypes: q,
        useArgs: H,
        useChannel: j,
        useGlobalTypes: z,
        useGlobals: D,
        useParameter: G,
        useSharedState: Q,
        useStoryPrepared: W,
        useStorybookApi: Z,
        useStorybookState: $,
      } = __STORYBOOK_API__;
    var S = (() => {
        let e;
        return (
          typeof window < "u"
            ? (e = window)
            : typeof globalThis < "u"
              ? (e = globalThis)
              : typeof window < "u"
                ? (e = window)
                : typeof self < "u"
                  ? (e = self)
                  : (e = {}),
          e
        );
      })(),
      p = "tag-filters",
      _ = "static-filter";
    n.register(p, (e) => {
      let i = Object.entries(S.TAGS_OPTIONS ?? {}).reduce((t, r) => {
        let [o, u] = r;
        return (u.excludeFromSidebar && (t[o] = !0), t);
      }, {});
      e.experimental_setFilter(_, (t) => {
        let r = t.tags ?? [];
        return (
          (r.includes("dev") || t.type === "docs") &&
          r.filter((o) => i[o]).length === 0
        );
      });
    });
  })();
} catch (e) {
  console.error(
    "[Storybook] One of your manager-entries failed: " + import.meta.url,
    e,
  );
}
