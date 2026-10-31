// =============================================================================
// CURRENCY CATALOG
// =============================================================================
// Active fiat currencies quoted by open.er-api.com/v6 (checked October 2026).
// Non-country codes (CLF, CNH, XDR) and retired currencies (BGN, HRK, SLL, ZWL)
// are excluded so the pickers never offer an option that cannot convert.
//
// Names and symbols come from ICU (Intl.DisplayNames / Intl.NumberFormat), with
// manual overrides for codes ICU does not name and for symbols ICU reports as
// the ISO code. searchTerms adds country, territory, and alias matches that are
// not already substrings of the English name.

export interface CurrencyInfo {
  /** ISO 4217 code, e.g. "BDT". */
  code: string
  /** English display name, e.g. "Bangladeshi Taka". */
  name: string
  /** Display and search symbol where one exists, e.g. "৳". */
  symbol?: string
  /** Country, territory, or alias terms used by the picker search. */
  searchTerms?: string[]
}

export const currencies: CurrencyInfo[] = [
  {
    code: "AED",
    name: "United Arab Emirates Dirham",
    symbol: "د.إ",
    searchTerms: ["UAE", "Emirates", "Dubai", "Abu Dhabi"],
  },
  {
    code: "AFN",
    name: "Afghan Afghani",
    symbol: "؋",
  },
  {
    code: "ALL",
    name: "Albanian Lek",
    symbol: "L",
  },
  {
    code: "AMD",
    name: "Armenian Dram",
    symbol: "֏",
  },
  {
    code: "ANG",
    name: "Netherlands Antillean Guilder",
  },
  {
    code: "AOA",
    name: "Angolan Kwanza",
    symbol: "Kz",
  },
  {
    code: "ARS",
    name: "Argentine Peso",
    symbol: "$",
    searchTerms: ["Argentina"],
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "$",
    searchTerms: ["Australia"],
  },
  {
    code: "AWG",
    name: "Aruban Florin",
  },
  {
    code: "AZN",
    name: "Azerbaijani Manat",
    symbol: "₼",
  },
  {
    code: "BAM",
    name: "Bosnia-Herzegovina Convertible Mark",
    symbol: "KM",
  },
  {
    code: "BBD",
    name: "Barbadian Dollar",
    symbol: "$",
  },
  {
    code: "BDT",
    name: "Bangladeshi Taka",
    symbol: "৳",
    searchTerms: ["Bangladesh", "taka"],
  },
  {
    code: "BHD",
    name: "Bahraini Dinar",
    symbol: ".د.ب",
  },
  {
    code: "BIF",
    name: "Burundian Franc",
    symbol: "FBu",
  },
  {
    code: "BMD",
    name: "Bermudan Dollar",
    symbol: "$",
  },
  {
    code: "BND",
    name: "Brunei Dollar",
    symbol: "$",
  },
  {
    code: "BOB",
    name: "Bolivian Boliviano",
    symbol: "Bs",
  },
  {
    code: "BRL",
    name: "Brazilian Real",
    symbol: "R$",
    searchTerms: ["Brazil"],
  },
  {
    code: "BSD",
    name: "Bahamian Dollar",
    symbol: "$",
  },
  {
    code: "BTN",
    name: "Bhutanese Ngultrum",
    symbol: "Nu.",
  },
  {
    code: "BWP",
    name: "Botswanan Pula",
    symbol: "P",
  },
  {
    code: "BYN",
    name: "Belarusian Ruble",
    symbol: "Br",
  },
  {
    code: "BZD",
    name: "Belize Dollar",
    symbol: "$",
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "$",
    searchTerms: ["Canada"],
  },
  {
    code: "CDF",
    name: "Congolese Franc",
    symbol: "FC",
  },
  {
    code: "CHF",
    name: "Swiss Franc",
    searchTerms: ["Switzerland"],
  },
  {
    code: "CLP",
    name: "Chilean Peso",
    symbol: "$",
  },
  {
    code: "CNY",
    name: "Chinese Yuan",
    symbol: "¥",
    searchTerms: ["China", "RMB", "renminbi"],
  },
  {
    code: "COP",
    name: "Colombian Peso",
    symbol: "$",
  },
  {
    code: "CRC",
    name: "Costa Rican Colón",
    symbol: "₡",
  },
  {
    code: "CUP",
    name: "Cuban Peso",
    symbol: "$",
  },
  {
    code: "CVE",
    name: "Cape Verdean Escudo",
    symbol: "Esc",
  },
  {
    code: "CZK",
    name: "Czech Koruna",
    symbol: "Kč",
    searchTerms: ["Czechia", "Czech Republic"],
  },
  {
    code: "DJF",
    name: "Djiboutian Franc",
    symbol: "Fdj",
  },
  {
    code: "DKK",
    name: "Danish Krone",
    symbol: "kr",
    searchTerms: ["Denmark"],
  },
  {
    code: "DOP",
    name: "Dominican Peso",
    symbol: "$",
    searchTerms: ["Dominican Republic"],
  },
  {
    code: "DZD",
    name: "Algerian Dinar",
    symbol: "د.ج",
  },
  {
    code: "EGP",
    name: "Egyptian Pound",
    symbol: "E£",
    searchTerms: ["Egypt"],
  },
  {
    code: "ERN",
    name: "Eritrean Nakfa",
    symbol: "Nfk",
  },
  {
    code: "ETB",
    name: "Ethiopian Birr",
    symbol: "Br",
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    searchTerms: ["EU", "European Union", "Europe", "euro"],
  },
  {
    code: "FJD",
    name: "Fijian Dollar",
    symbol: "$",
  },
  {
    code: "FKP",
    name: "Falkland Islands Pound",
    symbol: "£",
  },
  {
    code: "FOK",
    name: "Faroese Króna",
    symbol: "kr",
    searchTerms: ["Faroe Islands"],
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    searchTerms: ["UK", "United Kingdom", "Britain", "Great Britain", "England", "sterling"],
  },
  {
    code: "GEL",
    name: "Georgian Lari",
    symbol: "₾",
  },
  {
    code: "GGP",
    name: "Guernsey Pound",
    symbol: "£",
    searchTerms: ["Guernsey"],
  },
  {
    code: "GHS",
    name: "Ghanaian Cedi",
    symbol: "GH₵",
  },
  {
    code: "GIP",
    name: "Gibraltar Pound",
    symbol: "£",
  },
  {
    code: "GMD",
    name: "Gambian Dalasi",
    symbol: "D",
  },
  {
    code: "GNF",
    name: "Guinean Franc",
    symbol: "FG",
  },
  {
    code: "GTQ",
    name: "Guatemalan Quetzal",
    symbol: "Q",
  },
  {
    code: "GYD",
    name: "Guyanaese Dollar",
    symbol: "$",
  },
  {
    code: "HKD",
    name: "Hong Kong Dollar",
    symbol: "$",
    searchTerms: ["Hong Kong"],
  },
  {
    code: "HNL",
    name: "Honduran Lempira",
    symbol: "L",
    searchTerms: ["Honduras"],
  },
  {
    code: "HTG",
    name: "Haitian Gourde",
  },
  {
    code: "HUF",
    name: "Hungarian Forint",
    symbol: "Ft",
    searchTerms: ["Hungary"],
  },
  {
    code: "IDR",
    name: "Indonesian Rupiah",
    symbol: "Rp",
    searchTerms: ["Indonesia"],
  },
  {
    code: "ILS",
    name: "Israeli New Shekel",
    symbol: "₪",
  },
  {
    code: "IMP",
    name: "Manx Pound",
    symbol: "£",
    searchTerms: ["Isle of Man"],
  },
  {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    searchTerms: ["India"],
  },
  {
    code: "IQD",
    name: "Iraqi Dinar",
    symbol: "ع.د",
  },
  {
    code: "IRR",
    name: "Iranian Rial",
    symbol: "﷼",
  },
  {
    code: "ISK",
    name: "Icelandic Króna",
    symbol: "kr",
  },
  {
    code: "JEP",
    name: "Jersey Pound",
    symbol: "£",
    searchTerms: ["Jersey"],
  },
  {
    code: "JMD",
    name: "Jamaican Dollar",
    symbol: "$",
  },
  {
    code: "JOD",
    name: "Jordanian Dinar",
    symbol: "د.ا",
    searchTerms: ["Jordan"],
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
  },
  {
    code: "KES",
    name: "Kenyan Shilling",
    symbol: "KSh",
    searchTerms: ["Kenya"],
  },
  {
    code: "KGS",
    name: "Kyrgyz Som",
    symbol: "⃀",
  },
  {
    code: "KHR",
    name: "Cambodian Riel",
    symbol: "៛",
  },
  {
    code: "KID",
    name: "Kiribati Dollar",
    symbol: "$",
    searchTerms: ["Kiribati"],
  },
  {
    code: "KMF",
    name: "Comorian Franc",
    symbol: "CF",
  },
  {
    code: "KRW",
    name: "South Korean Won",
    symbol: "₩",
    searchTerms: ["Korea", "South Korea"],
  },
  {
    code: "KWD",
    name: "Kuwaiti Dinar",
    symbol: "د.ك",
  },
  {
    code: "KYD",
    name: "Cayman Islands Dollar",
    symbol: "$",
  },
  {
    code: "KZT",
    name: "Kazakhstani Tenge",
    symbol: "₸",
  },
  {
    code: "LAK",
    name: "Laotian Kip",
    symbol: "₭",
    searchTerms: ["Laos"],
  },
  {
    code: "LBP",
    name: "Lebanese Pound",
    symbol: "L£",
    searchTerms: ["Lebanon"],
  },
  {
    code: "LKR",
    name: "Sri Lankan Rupee",
    symbol: "Rs",
  },
  {
    code: "LRD",
    name: "Liberian Dollar",
    symbol: "$",
  },
  {
    code: "LSL",
    name: "Lesotho Loti",
    symbol: "L",
  },
  {
    code: "LYD",
    name: "Libyan Dinar",
  },
  {
    code: "MAD",
    name: "Moroccan Dirham",
    symbol: "د.م.",
    searchTerms: ["Morocco"],
  },
  {
    code: "MDL",
    name: "Moldovan Leu",
    symbol: "L",
  },
  {
    code: "MGA",
    name: "Malagasy Ariary",
    symbol: "Ar",
    searchTerms: ["Madagascar"],
  },
  {
    code: "MKD",
    name: "Macedonian Denar",
    symbol: "ден",
  },
  {
    code: "MMK",
    name: "Myanmar Kyat",
    symbol: "K",
  },
  {
    code: "MNT",
    name: "Mongolian Tugrik",
    symbol: "₮",
  },
  {
    code: "MOP",
    name: "Macanese Pataca",
    symbol: "MOP$",
    searchTerms: ["Macau", "Macao"],
  },
  {
    code: "MRU",
    name: "Mauritanian Ouguiya",
    symbol: "UM",
  },
  {
    code: "MUR",
    name: "Mauritian Rupee",
    symbol: "Rs",
    searchTerms: ["Mauritius"],
  },
  {
    code: "MVR",
    name: "Maldivian Rufiyaa",
    symbol: "Rf",
    searchTerms: ["Maldives"],
  },
  {
    code: "MWK",
    name: "Malawian Kwacha",
    symbol: "MK",
  },
  {
    code: "MXN",
    name: "Mexican Peso",
    symbol: "$",
    searchTerms: ["Mexico"],
  },
  {
    code: "MYR",
    name: "Malaysian Ringgit",
    symbol: "RM",
    searchTerms: ["Malaysia"],
  },
  {
    code: "MZN",
    name: "Mozambican Metical",
    symbol: "MT",
    searchTerms: ["Mozambique"],
  },
  {
    code: "NAD",
    name: "Namibian Dollar",
    symbol: "$",
  },
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    searchTerms: ["Nigeria"],
  },
  {
    code: "NIO",
    name: "Nicaraguan Córdoba",
    symbol: "C$",
  },
  {
    code: "NOK",
    name: "Norwegian Krone",
    symbol: "kr",
    searchTerms: ["Norway"],
  },
  {
    code: "NPR",
    name: "Nepalese Rupee",
    symbol: "Rs",
  },
  {
    code: "NZD",
    name: "New Zealand Dollar",
    symbol: "$",
    searchTerms: ["New Zealand"],
  },
  {
    code: "OMR",
    name: "Omani Rial",
    symbol: "ر.ع.",
  },
  {
    code: "PAB",
    name: "Panamanian Balboa",
  },
  {
    code: "PEN",
    name: "Peruvian Sol",
  },
  {
    code: "PGK",
    name: "Papua New Guinean Kina",
  },
  {
    code: "PHP",
    name: "Philippine Peso",
    symbol: "₱",
    searchTerms: ["Philippines"],
  },
  {
    code: "PKR",
    name: "Pakistani Rupee",
    symbol: "Rs",
    searchTerms: ["Pakistan"],
  },
  {
    code: "PLN",
    name: "Polish Zloty",
    symbol: "zł",
    searchTerms: ["Poland"],
  },
  {
    code: "PYG",
    name: "Paraguayan Guarani",
    symbol: "₲",
  },
  {
    code: "QAR",
    name: "Qatari Riyal",
    symbol: "ر.ق",
  },
  {
    code: "RON",
    name: "Romanian Leu",
    symbol: "lei",
  },
  {
    code: "RSD",
    name: "Serbian Dinar",
    symbol: "дин.",
  },
  {
    code: "RUB",
    name: "Russian Ruble",
    symbol: "₽",
    searchTerms: ["Russia"],
  },
  {
    code: "RWF",
    name: "Rwandan Franc",
    symbol: "RF",
  },
  {
    code: "SAR",
    name: "Saudi Riyal",
    symbol: "ر.س",
    searchTerms: ["Saudi Arabia", "KSA", "﷼"],
  },
  {
    code: "SBD",
    name: "Solomon Islands Dollar",
    symbol: "$",
  },
  {
    code: "SCR",
    name: "Seychellois Rupee",
    symbol: "₨",
    searchTerms: ["Seychelles"],
  },
  {
    code: "SDG",
    name: "Sudanese Pound",
    symbol: "ج.س.",
  },
  {
    code: "SEK",
    name: "Swedish Krona",
    symbol: "kr",
    searchTerms: ["Sweden"],
  },
  {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "$",
    searchTerms: ["Singapore"],
  },
  {
    code: "SHP",
    name: "St. Helena Pound",
    symbol: "£",
  },
  {
    code: "SLE",
    name: "Sierra Leonean Leone",
    symbol: "Le",
  },
  {
    code: "SOS",
    name: "Somali Shilling",
    symbol: "Sh",
    searchTerms: ["Somalia"],
  },
  {
    code: "SRD",
    name: "Surinamese Dollar",
    symbol: "$",
    searchTerms: ["Suriname"],
  },
  {
    code: "SSP",
    name: "South Sudanese Pound",
    symbol: "£",
  },
  {
    code: "STN",
    name: "São Tomé & Príncipe Dobra",
    symbol: "Db",
  },
  {
    code: "SYP",
    name: "Syrian Pound",
    symbol: "£",
  },
  {
    code: "SZL",
    name: "Swazi Lilangeni",
    symbol: "L",
    searchTerms: ["Eswatini", "Swaziland"],
  },
  {
    code: "THB",
    name: "Thai Baht",
    symbol: "฿",
    searchTerms: ["Thailand"],
  },
  {
    code: "TJS",
    name: "Tajikistani Somoni",
    symbol: "SM",
  },
  {
    code: "TMT",
    name: "Turkmenistani Manat",
    symbol: "m",
  },
  {
    code: "TND",
    name: "Tunisian Dinar",
    symbol: "د.ت",
  },
  {
    code: "TOP",
    name: "Tongan Paʻanga",
    symbol: "T$",
  },
  {
    code: "TRY",
    name: "Turkish Lira",
    symbol: "₺",
    searchTerms: ["Turkey", "Türkiye"],
  },
  {
    code: "TTD",
    name: "Trinidad & Tobago Dollar",
    symbol: "$",
  },
  {
    code: "TVD",
    name: "Tuvaluan Dollar",
    symbol: "$",
    searchTerms: ["Tuvalu"],
  },
  {
    code: "TWD",
    name: "New Taiwan Dollar",
    symbol: "$",
  },
  {
    code: "TZS",
    name: "Tanzanian Shilling",
  },
  {
    code: "UAH",
    name: "Ukrainian Hryvnia",
    symbol: "₴",
  },
  {
    code: "UGX",
    name: "Ugandan Shilling",
  },
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    searchTerms: ["US", "USA", "United States", "America", "greenback"],
  },
  {
    code: "UYU",
    name: "Uruguayan Peso",
    symbol: "$",
  },
  {
    code: "UZS",
    name: "Uzbekistani Som",
    symbol: "so'm",
  },
  {
    code: "VES",
    name: "Venezuelan Bolívar",
  },
  {
    code: "VND",
    name: "Vietnamese Dong",
    symbol: "₫",
    searchTerms: ["Vietnam"],
  },
  {
    code: "VUV",
    name: "Vanuatu Vatu",
  },
  {
    code: "WST",
    name: "Samoan Tala",
  },
  {
    code: "XAF",
    name: "Central African CFA Franc",
    symbol: "FCFA",
    searchTerms: ["Central Africa", "Cameroon", "Chad", "Congo", "Gabon", "Equatorial Guinea", "Central African Republic"],
  },
  {
    code: "XCD",
    name: "East Caribbean Dollar",
    symbol: "$",
    searchTerms: ["East Caribbean", "Antigua", "Dominica", "Grenada", "Saint Lucia", "Saint Vincent", "Anguilla", "Montserrat", "Saint Kitts", "Barbuda"],
  },
  {
    code: "XCG",
    name: "Caribbean guilder",
    symbol: "Cg.",
    searchTerms: ["Curaçao", "Curacao", "Sint Maarten", "Caribbean"],
  },
  {
    code: "XOF",
    name: "West African CFA Franc",
    symbol: "F CFA",
    searchTerms: ["West Africa", "Benin", "Burkina Faso", "Ivory Coast", "Côte d'Ivoire", "Guinea-Bissau", "Mali", "Niger", "Senegal", "Togo"],
  },
  {
    code: "XPF",
    name: "CFP Franc",
    symbol: "CFPF",
    searchTerms: ["French Polynesia", "New Caledonia", "Wallis and Futuna", "Pacific"],
  },
  {
    code: "YER",
    name: "Yemeni Rial",
    symbol: "﷼",
  },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    searchTerms: ["South Africa"],
  },
  {
    code: "ZMW",
    name: "Zambian Kwacha",
    symbol: "ZK",
  },
  {
    code: "ZWG",
    name: "Zimbabwean Gold",
  },
]

/** Currencies shown first when the picker query is empty. */
export const POPULAR_CURRENCY_CODES = [
  "USD",
  "EUR",
  "GBP",
  "BDT",
  "INR",
  "JPY",
  "CNY",
  "AUD",
  "CAD",
] as const

export const currencyByCode = new Map(
  currencies.map((currency) => [currency.code, currency])
)

export function getCurrency(code: string): CurrencyInfo | undefined {
  return currencyByCode.get(code)
}

export function formatCurrencyLabel(currency: CurrencyInfo): string {
  return `${currency.code} — ${currency.name}`
}

/** Case- and accent-insensitive normalization shared by search and matching. */
export function normalizeCurrencySearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

const searchIndex = new Map(
  currencies.map((currency) => {
    const haystack = [
      currency.code,
      currency.name,
      `${currency.code} — ${currency.name}`,
      currency.symbol ?? "",
      ...(currency.searchTerms ?? []),
    ].join(" ")
    return [currency.code, normalizeCurrencySearch(haystack)]
  })
)

export function matchesCurrency(currency: CurrencyInfo, query: string): boolean {
  const normalized = normalizeCurrencySearch(query)
  if (!normalized) return true
  return (searchIndex.get(currency.code) ?? "").includes(normalized)
}

export function searchCurrencies(query: string): CurrencyInfo[] {
  const normalized = normalizeCurrencySearch(query)
  if (!normalized) return currencies
  return currencies.filter((currency) => matchesCurrency(currency, normalized))
}

/** Popular currencies first, then the rest of the catalog by code. */
export function getDefaultCurrencyOptions(): CurrencyInfo[] {
  const popular = POPULAR_CURRENCY_CODES.map((code) => currencyByCode.get(code)).filter(
    (currency): currency is CurrencyInfo => Boolean(currency)
  )
  const popularCodes = new Set(popular.map((currency) => currency.code))
  return [
    ...popular,
    ...currencies.filter((currency) => !popularCodes.has(currency.code)),
  ]
}
