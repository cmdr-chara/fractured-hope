import { classNames } from "@quartz-community/utils/lang";
import { simplifySlug, resolveRelative } from "@quartz-community/utils/path";
import { jsxs, jsx } from "preact/jsx-runtime";

// src/util/lang.ts

// src/i18n/locales/en-US.ts
var en_US_default = {
  components: {
    backlinks: {
      title: "Backlinks",
      noBacklinksFound: "No backlinks found",
    },
  },
};

// src/i18n/locales/ar-SA.ts
var ar_SA_default = {
  components: {
    backlinks: {
      title: "\u0648\u0635\u0644\u0627\u062A \u0627\u0644\u0639\u0648\u062F\u0629",
      noBacklinksFound:
        "\u0644\u0627 \u064A\u0648\u062C\u062F \u0648\u0635\u0644\u0627\u062A \u0639\u0648\u062F\u0629",
    },
  },
};

// src/i18n/locales/ca-ES.ts
var ca_ES_default = {
  components: {
    backlinks: {
      title: "Retroenlla\xE7",
      noBacklinksFound: "No s'han trobat retroenlla\xE7os",
    },
  },
};

// src/i18n/locales/cs-CZ.ts
var cs_CZ_default = {
  components: {
    backlinks: {
      title: "P\u0159\xEDchoz\xED odkazy",
      noBacklinksFound: "Nenalezeny \u017E\xE1dn\xE9 p\u0159\xEDchoz\xED odkazy",
    },
  },
};

// src/i18n/locales/de-DE.ts
var de_DE_default = {
  components: {
    backlinks: {
      title: "Backlinks",
      noBacklinksFound: "Keine Backlinks gefunden",
    },
  },
};

// src/i18n/locales/en-GB.ts
var en_GB_default = {
  components: {
    backlinks: {
      title: "Backlinks",
      noBacklinksFound: "No backlinks found",
    },
  },
};

// src/i18n/locales/es-ES.ts
var es_ES_default = {
  components: {
    backlinks: {
      title: "Retroenlaces",
      noBacklinksFound: "No se han encontrado retroenlaces",
    },
  },
};

// src/i18n/locales/fa-IR.ts
var fa_IR_default = {
  components: {
    backlinks: {
      title: "\u0628\u06A9\u200C\u0644\u06CC\u0646\u06A9\u200C\u0647\u0627",
      noBacklinksFound: "\u0628\u062F\u0648\u0646 \u0628\u06A9\u200C\u0644\u06CC\u0646\u06A9",
    },
  },
};

// src/i18n/locales/fi-FI.ts
var fi_FI_default = {
  components: {
    backlinks: {
      title: "Takalinkit",
      noBacklinksFound: "Takalinkkej\xE4 ei l\xF6ytynyt",
    },
  },
};

// src/i18n/locales/fr-FR.ts
var fr_FR_default = {
  components: {
    backlinks: {
      title: "Liens retour",
      noBacklinksFound: "Aucun lien retour trouv\xE9",
    },
  },
};

// src/i18n/locales/he-IL.ts
var he_IL_default = {
  components: {
    backlinks: {
      title: "\u05E7\u05D9\u05E9\u05D5\u05E8\u05D9\u05DD \u05D7\u05D5\u05D6\u05E8\u05D9\u05DD",
      noBacklinksFound:
        "\u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D5 \u05E7\u05D9\u05E9\u05D5\u05E8\u05D9\u05DD \u05D7\u05D5\u05D6\u05E8\u05D9\u05DD",
    },
  },
};

// src/i18n/locales/hu-HU.ts
var hu_HU_default = {
  components: {
    backlinks: {
      title: "Visszautal\xE1sok",
      noBacklinksFound: "Nincs visszautal\xE1s",
    },
  },
};

// src/i18n/locales/id-ID.ts
var id_ID_default = {
  components: {
    backlinks: {
      title: "Tautan Balik",
      noBacklinksFound: "Tidak ada tautan balik ditemukan",
    },
  },
};

// src/i18n/locales/it-IT.ts
var it_IT_default = {
  components: {
    backlinks: {
      title: "Link entranti",
      noBacklinksFound: "Nessun link entrante",
    },
  },
};

// src/i18n/locales/ja-JP.ts
var ja_JP_default = {
  components: {
    backlinks: {
      title: "\u30D0\u30C3\u30AF\u30EA\u30F3\u30AF",
      noBacklinksFound: "\u30D0\u30C3\u30AF\u30EA\u30F3\u30AF\u306F\u3042\u308A\u307E\u305B\u3093",
    },
  },
};

// src/i18n/locales/kk-KZ.ts
var kk_KZ_default = {
  components: {
    backlinks: {
      title:
        "\u0410\u0440\u0442\u049B\u0430 \u0441\u0456\u043B\u0442\u0435\u043C\u0435\u043B\u0435\u0440",
      noBacklinksFound:
        "\u0410\u0440\u0442\u049B\u0430 \u0441\u0456\u043B\u0442\u0435\u043C\u0435\u043B\u0435\u0440 \u0442\u0430\u0431\u044B\u043B\u043C\u0430\u0434\u044B",
    },
  },
};

// src/i18n/locales/ko-KR.ts
var ko_KR_default = {
  components: {
    backlinks: {
      title: "\uBC31\uB9C1\uD06C",
      noBacklinksFound: "\uBC31\uB9C1\uD06C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    },
  },
};

// src/i18n/locales/lt-LT.ts
var lt_LT_default = {
  components: {
    backlinks: {
      title: "Atgalin\u0117s Nuorodos",
      noBacklinksFound: "Atgalini\u0173 Nuorod\u0173 Nerasta",
    },
  },
};

// src/i18n/locales/nb-NO.ts
var nb_NO_default = {
  components: {
    backlinks: {
      title: "Tilbakekoblinger",
      noBacklinksFound: "Ingen tilbakekoblinger funnet",
    },
  },
};

// src/i18n/locales/nl-NL.ts
var nl_NL_default = {
  components: {
    backlinks: {
      title: "Backlinks",
      noBacklinksFound: "Geen backlinks gevonden",
    },
  },
};

// src/i18n/locales/pl-PL.ts
var pl_PL_default = {
  components: {
    backlinks: {
      title: "Odno\u015Bniki zwrotne",
      noBacklinksFound: "Brak po\u0142\u0105cze\u0144 zwrotnych",
    },
  },
};

// src/i18n/locales/pt-BR.ts
var pt_BR_default = {
  components: {
    backlinks: {
      title: "Backlinks",
      noBacklinksFound: "Sem backlinks encontrados",
    },
  },
};

// src/i18n/locales/ro-RO.ts
var ro_RO_default = {
  components: {
    backlinks: {
      title: "Leg\u0103turi \xEEnapoi",
      noBacklinksFound: "Nu s-au g\u0103sit leg\u0103turi \xEEnapoi",
    },
  },
};

// src/i18n/locales/ru-RU.ts
var ru_RU_default = {
  components: {
    backlinks: {
      title:
        "\u041E\u0431\u0440\u0430\u0442\u043D\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438",
      noBacklinksFound:
        "\u041E\u0431\u0440\u0430\u0442\u043D\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044E\u0442",
    },
  },
};

// src/i18n/locales/th-TH.ts
var th_TH_default = {
  components: {
    backlinks: {
      title:
        "\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48\u0E01\u0E25\u0E48\u0E32\u0E27\u0E16\u0E36\u0E07",
      noBacklinksFound:
        "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48\u0E42\u0E22\u0E07\u0E21\u0E32\u0E2B\u0E19\u0E49\u0E32\u0E19\u0E35\u0E49",
    },
  },
};

// src/i18n/locales/tr-TR.ts
var tr_TR_default = {
  components: {
    backlinks: {
      title: "Backlinkler",
      noBacklinksFound: "Backlink bulunamad\u0131",
    },
  },
};

// src/i18n/locales/uk-UA.ts
var uk_UA_default = {
  components: {
    backlinks: {
      title:
        "\u0417\u0432\u043E\u0440\u043E\u0442\u043D\u0456 \u043F\u043E\u0441\u0438\u043B\u0430\u043D\u043D\u044F",
      noBacklinksFound:
        "\u0417\u0432\u043E\u0440\u043E\u0442\u043D\u0438\u0445 \u043F\u043E\u0441\u0438\u043B\u0430\u043D\u044C \u043D\u0435 \u0437\u043D\u0430\u0439\u0434\u0435\u043D\u043E",
    },
  },
};

// src/i18n/locales/vi-VN.ts
var vi_VN_default = {
  components: {
    backlinks: {
      title: "Li\xEAn k\u1EBFt ng\u01B0\u1EE3c",
      noBacklinksFound: "Kh\xF4ng c\xF3 li\xEAn k\u1EBFt ng\u01B0\u1EE3c n\xE0o",
    },
  },
};

// src/i18n/locales/zh-CN.ts
var zh_CN_default = {
  components: {
    backlinks: {
      title: "\u53CD\u5411\u94FE\u63A5",
      noBacklinksFound: "\u65E0\u6CD5\u627E\u5230\u53CD\u5411\u94FE\u63A5",
    },
  },
};

// src/i18n/locales/zh-TW.ts
var zh_TW_default = {
  components: {
    backlinks: {
      title: "\u53CD\u5411\u9023\u7D50",
      noBacklinksFound: "\u7121\u6CD5\u627E\u5230\u53CD\u5411\u9023\u7D50",
    },
  },
};

// src/i18n/index.ts
var locales = {
  "en-US": en_US_default,
  "ar-SA": ar_SA_default,
  "ca-ES": ca_ES_default,
  "cs-CZ": cs_CZ_default,
  "de-DE": de_DE_default,
  "en-GB": en_GB_default,
  "es-ES": es_ES_default,
  "fa-IR": fa_IR_default,
  "fi-FI": fi_FI_default,
  "fr-FR": fr_FR_default,
  "he-IL": he_IL_default,
  "hu-HU": hu_HU_default,
  "id-ID": id_ID_default,
  "it-IT": it_IT_default,
  "ja-JP": ja_JP_default,
  "kk-KZ": kk_KZ_default,
  "ko-KR": ko_KR_default,
  "lt-LT": lt_LT_default,
  "nb-NO": nb_NO_default,
  "nl-NL": nl_NL_default,
  "pl-PL": pl_PL_default,
  "pt-BR": pt_BR_default,
  "ro-RO": ro_RO_default,
  "ru-RU": ru_RU_default,
  "th-TH": th_TH_default,
  "tr-TR": tr_TR_default,
  "uk-UA": uk_UA_default,
  "vi-VN": vi_VN_default,
  "zh-CN": zh_CN_default,
  "zh-TW": zh_TW_default,
};
function i18n(locale) {
  return locales[locale] || en_US_default;
}

// src/components/styles/backlinks.scss
var backlinks_default =
  ".backlinks {\n  flex-direction: column;\n}\n.backlinks > h3 {\n  font-size: 1rem;\n  margin: 0;\n}\n.backlinks > ul.overflow {\n  list-style: none;\n  padding: 0;\n  margin: 0.5rem 0;\n  max-height: calc(100% - 2rem);\n  overscroll-behavior: contain;\n}\n.backlinks > ul.overflow > li > a {\n  background-color: transparent;\n}";
var OverflowList = ({ children, ...props }) => {
  return /* @__PURE__ */ jsxs("ul", {
    ...props,
    class: [props.class, "overflow"].filter(Boolean).join(" "),
    id: props.id,
    children: [children, /* @__PURE__ */ jsx("li", { class: "overflow-end" })],
  });
};
var numLists = 0;
var OverflowList_default = () => {
  const id = `list-${numLists++}`;
  return {
    OverflowList: (props) => /* @__PURE__ */ jsx(OverflowList, { ...props, id }),
    overflowListAfterDOMLoaded: `
document.addEventListener("nav", (e) => {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const parentUl = entry.target.parentElement
      if (!parentUl) return
      if (entry.isIntersecting) {
        parentUl.classList.remove("gradient-active")
      } else {
        parentUl.classList.add("gradient-active")
      }
    }
  })

  const ul = document.getElementById("${id}")
  if (!ul) return

  const end = ul.querySelector(".overflow-end")
  if (!end) return

  observer.observe(end)
})
`,
  };
};
var defaultOptions = {
  hideWhenEmpty: true,
};
function backlinkTargets(currentSlug, aliases = []) {
  return /* @__PURE__ */ new Set([currentSlug, ...aliases.map((alias) => simplifySlug(alias))]);
}
function selectBacklinkSources(allFiles, currentSlug, aliases = []) {
  const targets = backlinkTargets(currentSlug, aliases);
  return allFiles.filter(
    (file) => file.unlisted !== true && file.links?.some((link) => targets.has(simplifySlug(link))),
  );
}
var Backlinks_default = (opts) => {
  const options = { ...defaultOptions, ...opts };
  const { OverflowList: OverflowList2, overflowListAfterDOMLoaded } = OverflowList_default();
  const Backlinks = ({ fileData, allFiles, displayClass, cfg }) => {
    const slug = simplifySlug(fileData.slug);
    const aliases = fileData.frontmatter?.aliases ?? [];
    const locale = cfg.locale ?? "en-US";
    const backlinkFiles = selectBacklinkSources(allFiles, slug, aliases);
    if (options.hideWhenEmpty && backlinkFiles.length === 0) {
      return null;
    }
    return /* @__PURE__ */ jsxs("div", {
      class: classNames(displayClass, "backlinks"),
      children: [
        /* @__PURE__ */ jsx("h3", { children: i18n(locale).components.backlinks.title }),
        /* @__PURE__ */ jsx(OverflowList2, {
          children:
            backlinkFiles.length > 0
              ? backlinkFiles.map((f) =>
                  /* @__PURE__ */ jsx("li", {
                    children: /* @__PURE__ */ jsx("a", {
                      href: resolveRelative(fileData.slug, f.slug),
                      class: "internal",
                      children: f.frontmatter?.title,
                    }),
                  }),
                )
              : /* @__PURE__ */ jsx("li", {
                  class: "backlink-empty",
                  children: i18n(locale).components.backlinks.noBacklinksFound,
                }),
        }),
      ],
    });
  };
  Backlinks.css = backlinks_default;
  Backlinks.afterDOMLoaded = overflowListAfterDOMLoaded;
  return Backlinks;
};

export { Backlinks_default as Backlinks };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map
