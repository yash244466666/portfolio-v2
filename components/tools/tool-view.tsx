"use client"

import { lazy, Suspense } from "react"
import { getToolById } from "@/lib/content/tools/utils"
import ToolHeader from "@/components/tools/tool-header"

// Core
const PdfConverter = lazy(() => import("@/components/tools/core/pdf-converter"))
const CurrencyConverter = lazy(() => import("@/components/tools/core/currency-converter"))
const UnitConverter = lazy(() => import("@/components/tools/core/unit-converter"))
const TimestampConverter = lazy(() => import("@/components/tools/core/timestamp-converter"))
const NumberBaseConverter = lazy(() => import("@/components/tools/core/number-base-converter"))
const HashGenerator = lazy(() => import("@/components/tools/core/hash-generator"))
const ImageCompressor = lazy(() => import("@/components/tools/core/image-compressor"))

// Dev
const JsonFormatter = lazy(() => import("@/components/tools/dev/json-formatter"))
const Base64Tool = lazy(() => import("@/components/tools/dev/base64-tool"))
const QrGenerator = lazy(() => import("@/components/tools/dev/qr-generator"))
const PasswordGenerator = lazy(() => import("@/components/tools/dev/password-generator"))
const ColorPicker = lazy(() => import("@/components/tools/dev/color-picker"))
const LoremIpsumGenerator = lazy(() => import("@/components/tools/dev/lorem-ipsum-generator"))
const MarkdownPreview = lazy(() => import("@/components/tools/dev/markdown-preview"))
const RegexTester = lazy(() => import("@/components/tools/dev/regex-tester"))
const UrlEncoder = lazy(() => import("@/components/tools/dev/url-encoder"))
const HtmlEntityEncoder = lazy(() => import("@/components/tools/dev/html-entity-encoder"))
const JwtDecoder = lazy(() => import("@/components/tools/dev/jwt-decoder"))
const SvgOptimizer = lazy(() => import("@/components/tools/dev/svg-optimizer"))
const CssGradientGenerator = lazy(() => import("@/components/tools/dev/css-gradient-generator"))
const ColorPaletteFromImage = lazy(() => import("@/components/tools/dev/color-palette-from-image"))
const CsvJsonConverter = lazy(() => import("@/components/tools/dev/csv-json-converter"))
const YamlJsonConverter = lazy(() => import("@/components/tools/dev/yaml-json-converter"))
const XmlFormatter = lazy(() => import("@/components/tools/dev/xml-formatter"))
const SqlFormatter = lazy(() => import("@/components/tools/dev/sql-formatter"))
const IcalGenerator = lazy(() => import("@/components/tools/dev/ical-generator"))
const VcardGenerator = lazy(() => import("@/components/tools/dev/vcard-generator"))
const Rot13Cipher = lazy(() => import("@/components/tools/dev/rot13-cipher"))
const MorseCodeTranslator = lazy(() => import("@/components/tools/dev/morse-code-translator"))
const HmacGenerator = lazy(() => import("@/components/tools/dev/hmac-generator"))
const UuidGenerator = lazy(() => import("@/components/tools/dev/uuid-generator"))
const BoxShadowGenerator = lazy(() => import("@/components/tools/dev/box-shadow-generator"))
const BorderRadiusGenerator = lazy(() => import("@/components/tools/dev/border-radius-generator"))
const TextShadowGenerator = lazy(() => import("@/components/tools/dev/text-shadow-generator"))
const FlexboxPlayground = lazy(() => import("@/components/tools/dev/flexbox-playground"))
const GridGenerator = lazy(() => import("@/components/tools/dev/grid-generator"))
const TriangleGenerator = lazy(() => import("@/components/tools/dev/triangle-generator"))
const HttpStatusCodes = lazy(() => import("@/components/tools/dev/http-status-codes"))
const MimeTypeLookup = lazy(() => import("@/components/tools/dev/mime-type-lookup"))
const DnsLookup = lazy(() => import("@/components/tools/dev/dns-lookup"))
const OpenGraphPreview = lazy(() => import("@/components/tools/dev/open-graph-preview"))
const MetaTagGenerator = lazy(() => import("@/components/tools/dev/meta-tag-generator"))
const TextToSlug = lazy(() => import("@/components/tools/dev/text-to-slug"))
const UnicodeLookup = lazy(() => import("@/components/tools/dev/unicode-lookup"))
const AsciiTable = lazy(() => import("@/components/tools/dev/ascii-table"))
const FakeDataGenerator = lazy(() => import("@/components/tools/dev/fake-data-generator"))
const GradientBorderGenerator = lazy(() => import("@/components/tools/dev/gradient-border-generator"))
const AnimationCssGenerator = lazy(() => import("@/components/tools/dev/animation-css-generator"))
const GlassmorphismGenerator = lazy(() => import("@/components/tools/dev/glassmorphism-generator"))
const NeumorphismGenerator = lazy(() => import("@/components/tools/dev/neumorphism-generator"))
const ChartGenerator = lazy(() => import("@/components/tools/dev/chart-generator"))

// Text
const WordCounter = lazy(() => import("@/components/tools/text/word-counter"))
const CaseConverter = lazy(() => import("@/components/tools/text/case-converter"))
const TextDiff = lazy(() => import("@/components/tools/text/text-diff"))
const RemoveDuplicates = lazy(() => import("@/components/tools/text/remove-duplicates"))
const EmojiPicker = lazy(() => import("@/components/tools/text/emoji-picker"))
const HashDiff = lazy(() => import("@/components/tools/text/hash-diff"))
const PomodoroTimer = lazy(() => import("@/components/tools/text/pomodoro-timer"))
const CronBuilder = lazy(() => import("@/components/tools/text/cron-builder"))
const FindReplace = lazy(() => import("@/components/tools/text/find-replace"))
const ReverseText = lazy(() => import("@/components/tools/text/reverse-text"))
const SortLines = lazy(() => import("@/components/tools/text/sort-lines"))
const AddLineNumbers = lazy(() => import("@/components/tools/text/add-line-numbers"))
const TrimWhitespace = lazy(() => import("@/components/tools/text/trim-whitespace"))
const InvisibleCharacterDetector = lazy(() => import("@/components/tools/text/invisible-character-detector"))
const NotesScratchpad = lazy(() => import("@/components/tools/text/notes-scratchpad"))
const BookmarkManager = lazy(() => import("@/components/tools/text/bookmark-manager"))

// Media
const AudioRecorder = lazy(() => import("@/components/tools/media/audio-recorder"))
const VideoToGif = lazy(() => import("@/components/tools/media/video-to-gif"))
const FileHashChecker = lazy(() => import("@/components/tools/media/file-hash-checker"))

// Security
const PasswordStrengthChecker = lazy(() => import("@/components/tools/security/password-strength-checker"))
const DataSanitizer = lazy(() => import("@/components/tools/security/data-sanitizer"))
const CspGenerator = lazy(() => import("@/components/tools/security/csp-generator"))
const CorsHeaderBuilder = lazy(() => import("@/components/tools/security/cors-header-builder"))
const RobotsTxtGenerator = lazy(() => import("@/components/tools/security/robots-txt-generator"))

// Math
const PercentageCalculator = lazy(() => import("@/components/tools/math/percentage-calculator"))
const AgeCalculator = lazy(() => import("@/components/tools/math/age-calculator"))
const TipCalculator = lazy(() => import("@/components/tools/math/tip-calculator"))
const GcdLcmCalculator = lazy(() => import("@/components/tools/math/gcd-lcm-calculator"))
const RomanNumeralConverter = lazy(() => import("@/components/tools/math/roman-numeral-converter"))
const BitwiseCalculator = lazy(() => import("@/components/tools/math/bitwise-calculator"))
const ColorBlindnessSimulator = lazy(() => import("@/components/tools/math/color-blindness-simulator"))
const Calculator = lazy(() => import("@/components/tools/math/calculator"))
const Stopwatch = lazy(() => import("@/components/tools/math/stopwatch"))
const CountdownTimer = lazy(() => import("@/components/tools/math/countdown-timer"))

const toolComponents: Record<string, React.ComponentType> = {
  // Core
  "pdf-converter": PdfConverter,
  "currency-converter": CurrencyConverter,
  "unit-converter": UnitConverter,
  "timestamp-converter": TimestampConverter,
  "number-base-converter": NumberBaseConverter,
  "hash-generator": HashGenerator,
  "image-compressor": ImageCompressor,
  // Dev
  "json-formatter": JsonFormatter,
  "base64-tool": Base64Tool,
  "qr-generator": QrGenerator,
  "password-generator": PasswordGenerator,
  "color-picker": ColorPicker,
  "lorem-ipsum-generator": LoremIpsumGenerator,
  "markdown-preview": MarkdownPreview,
  "regex-tester": RegexTester,
  "url-encoder": UrlEncoder,
  "html-entity-encoder": HtmlEntityEncoder,
  "jwt-decoder": JwtDecoder,
  "svg-optimizer": SvgOptimizer,
  "css-gradient-generator": CssGradientGenerator,
  "color-palette-from-image": ColorPaletteFromImage,
  "csv-json-converter": CsvJsonConverter,
  "yaml-json-converter": YamlJsonConverter,
  "xml-formatter": XmlFormatter,
  "sql-formatter": SqlFormatter,
  "ical-generator": IcalGenerator,
  "vcard-generator": VcardGenerator,
  "rot13-cipher": Rot13Cipher,
  "morse-code-translator": MorseCodeTranslator,
  "hmac-generator": HmacGenerator,
  "uuid-generator": UuidGenerator,
  "box-shadow-generator": BoxShadowGenerator,
  "border-radius-generator": BorderRadiusGenerator,
  "text-shadow-generator": TextShadowGenerator,
  "flexbox-playground": FlexboxPlayground,
  "grid-generator": GridGenerator,
  "triangle-generator": TriangleGenerator,
  "http-status-codes": HttpStatusCodes,
  "mime-type-lookup": MimeTypeLookup,
  "dns-lookup": DnsLookup,
  "open-graph-preview": OpenGraphPreview,
  "meta-tag-generator": MetaTagGenerator,
  "text-to-slug": TextToSlug,
  "unicode-lookup": UnicodeLookup,
  "ascii-table": AsciiTable,
  "fake-data-generator": FakeDataGenerator,
  "gradient-border-generator": GradientBorderGenerator,
  "animation-css-generator": AnimationCssGenerator,
  "glassmorphism-generator": GlassmorphismGenerator,
  "neumorphism-generator": NeumorphismGenerator,
  "chart-generator": ChartGenerator,
  // Text
  "word-counter": WordCounter,
  "character-counter": WordCounter,
  "case-converter": CaseConverter,
  "text-diff": TextDiff,
  "remove-duplicates": RemoveDuplicates,
  "emoji-picker": EmojiPicker,
  "hash-diff": HashDiff,
  "pomodoro-timer": PomodoroTimer,
  "cron-builder": CronBuilder,
  "find-replace": FindReplace,
  "reverse-text": ReverseText,
  "sort-lines": SortLines,
  "add-line-numbers": AddLineNumbers,
  "trim-whitespace": TrimWhitespace,
  "invisible-character-detector": InvisibleCharacterDetector,
  "notes-scratchpad": NotesScratchpad,
  "bookmark-manager": BookmarkManager,
  // Media
  "audio-recorder": AudioRecorder,
  "video-to-gif": VideoToGif,
  "file-hash-checker": FileHashChecker,
  // Security
  "password-strength-checker": PasswordStrengthChecker,
  "data-sanitizer": DataSanitizer,
  "csp-generator": CspGenerator,
  "cors-header-builder": CorsHeaderBuilder,
  "robots-txt-generator": RobotsTxtGenerator,
  // Math
  "percentage-calculator": PercentageCalculator,
  "age-calculator": AgeCalculator,
  "tip-calculator": TipCalculator,
  "gcd-lcm-calculator": GcdLcmCalculator,
  "roman-numeral-converter": RomanNumeralConverter,
  "bitwise-calculator": BitwiseCalculator,
  "color-blindness-simulator": ColorBlindnessSimulator,
  "calculator": Calculator,
  "stopwatch": Stopwatch,
  "countdown-timer": CountdownTimer,
}

function ToolFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  )
}

interface ToolViewProps {
  toolId: string
  onBack: () => void
  backLabel: string
}

export default function ToolView({ toolId, onBack, backLabel }: ToolViewProps) {
  const tool = getToolById(toolId)

  if (!tool) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-background/70 backdrop-blur-xl border border-border/50 rounded-3xl p-8 sm:p-12 shadow-2xl min-h-[600px] flex flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Tool Not Found</h2>
          <p className="text-muted-foreground mb-8">The tool you&apos;re looking for doesn&apos;t exist.</p>
          <button onClick={onBack} className="text-primary hover:underline">{backLabel}</button>
        </div>
      </div>
    )
  }

  const ToolComponent = toolComponents[toolId]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div id="tool-capture-area" className="bg-background/70 backdrop-blur-xl border border-border/50 rounded-3xl p-6 sm:p-10 shadow-2xl min-h-[600px] flex flex-col">
        <ToolHeader tool={tool} onBack={onBack} />
        <div className="mt-8 flex-1 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <div className="h-full bg-background/40 border border-border/30 rounded-2xl p-6 sm:p-8 shadow-inner">
            {ToolComponent ? (
              <Suspense fallback={<ToolFallback />}><ToolComponent /></Suspense>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <p className="text-muted-foreground text-center">This tool is not yet available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}