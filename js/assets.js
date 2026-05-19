const ASSETS = [
  {
    id: "dev-console-pro",
    name: "Dev Console Pro",
    description: "Powerful in-game developer console for Unity.",
    longDescription: "DevConsolePro is a runtime developer console for Unity designed to simplify debugging, testing, and interaction with your game during play mode. " +
        "It provides a structured command system that allows developers to execute commands, modify variables, and control game behavior in real time. " +
        "The system is fully customizable and extensible, allowing developers to define their own commands, group them logically, and expose variables through a simple and intuitive API. ",
    price: "$20",
    tags: ["Tools", "Debug"],
    storeUrl: "https://assetstore.unity.com/packages/your-link-here",
    thumb: "img/DevConsolePro/DevConsoleProPreviewImage_0.png",
    screenshots: [
      "img/DevConsolePro/DevConsoleProCoverImage_4.png",
      "img/DevConsolePro/DevConsoleProCoverImage_5.png",
      "img/DevConsolePro/DevConsoleProCoverImage_6.png",
      "img/DevConsolePro/DevConsoleProCoverImage_7.png",
      "img/DevConsolePro/DevConsoleProCoverImage_1.png",
      "img/DevConsolePro/DevConsoleProCoverImage_2.png",
      "img/DevConsolePro/DevConsoleProCoverImage_3.png",
    ],
    features: [
      "Register commands with a single [ConsoleCommand] attribute",
      "Filters logs by Info, Warning, Error, and Exception",
      "Persistent command history with arrow-key navigation",
      "Configurable toggle hotkey and UI theme",
      "Works on PC, mobile, and console builds",
      "Stack trace viewer for exceptions",
      "Autocomplete for registered commands",
    ],
    version: "1.3.0",
    unity: "2022.3+",
    unityVersions: [
      { version: "6000.4.5f1",  pipelines: { "Built-in": true,  "URP": true,  "HDRP": true  } },
      { version: "2022.3.13f1",  pipelines: { "Built-in": true,  "URP": true,  "HDRP": true } },
    ],
    pipelines: ["Built-in", "URP", "HDRP"],
    platforms: ["Windows", "macOS", "Linux", "iOS", "Android", "WebGL"],
    dependencies: [
      { name: "TextMeshPro", version: "v3.0.6", required: true,  url: "https://docs.unity3d.com/Packages/com.unity.textmeshpro@latest" },
      { name: "Unity UI (uGUI)", version: "v2.5.0", required: true,  url: "https://docs.unity3d.com/Packages/com.unity.ugui@2.5/manual/index.html" },
    ],
    docsPage: "docs/dev-console-pro.html",
    quickStart: `using DevConsolePro;
using UnityEngine;

[DevConsole("player")]
public class PlayerController : MonoBehaviour
{
    [ConsoleCommand("Teleport the player")]
    public void Teleport(float x, float y, float z)
    {
        transform.position = new Vector3(x, y, z);
    }
}

// At runtime: press F1 and type
// > player.teleport 0 5 0`,
    changelog: [
      {
        version: "1.3.0", date: "2026-04-09",
        added: [
          "Log filter toolbar — Log / Warning / Error toggle buttons above the output; all three can be toggled independently including all-off",
          "Per-type log text colors — tag and message body each have their own color per log type, configurable via <code>DevConsoleTheme</code>",
          "Smart auto-scroll — output only snaps to bottom when already near the bottom; preserves scroll position while reading history",
          "<code>DevConsoleProExample</code> — single racing-car themed example covering attributes, runtime registration, enums, <code>ConsoleArgs</code>, <code>ConsoleTextTable</code>, and <code>ConsoleIgnore</code>",
        ],
        changed: [
          "Fast Enter Play Mode support — <code>DevConsoleAPI</code> and <code>ConsoleLogService</code> now reset static state via <code>[RuntimeInitializeOnLoadMethod(SubsystemRegistration)]</code>, preventing stale state on second Play session",
          "<code>ReflectedConsoleCommand</code> — <code>GetParameters()</code> called once in constructor instead of twice",
          "<code>ConsoleArgumentHintService</code> — <code>s_tokenDelimiters</code> extracted to <code>static readonly char[]</code>, eliminates per-call array allocation on cache miss",
          "<code>ConsoleInputSanitizer</code> — three <code>TrimEnd()</code> branches consolidated into one",
          "<code>ConsoleTextTable</code> — full XML documentation added to all public methods",
          "<code>ReflectedConsoleCommand</code> — default description changed from literal <code>&quot;&lt;none&gt;&quot;</code> to <code>string.Empty</code>",
        ],
        fixed: [
          "Suggestion items not clickable with mouse — clicking a suggestion now commits it to the input field instead of only highlighting it",
          "<code>DevConsolePro.Editor.asmdef</code> — now correctly references the runtime assembly and restricts to Editor platform",
        ],
      },
      {
        version: "1.2.0", date: "2026-03-30",
        added: [
          "<code>Register&lt;T1, T2, T3, T4&gt;</code> — typed four-argument overload for runtime command registration",
          "<code>Register(string, Delegate)</code> — escape hatch for 5+ argument commands; reflects parameter types automatically",
          "<code>ConsoleRegistry.CommandNames</code> — pre-built sorted name list, eliminates per-keypress LINQ allocation",
          "<code>ConsoleRegistry.CommandSegments</code> — pre-split dot-segments parallel to <code>CommandNames</code>, used by suggestion system",
          "Name validated at registration — <code>null</code> or whitespace name throws <code>ArgumentException</code> immediately",
          "Parameter types validated at registration via <code>ConsoleArgConverter.AssertSupported</code>",
        ],
        changed: [
          "<code>DevConsoleAPI</code> internal structure refactored — shared <code>RegisterTyped</code> core helper eliminates repeated logic across all typed overloads",
          "<code>DevConsoleAPI.Register(IConsoleCommand)</code> now uses bubble-insert to maintain sorted order",
          "<code>ConsoleLogEntry.Timestamp</code> is now <code>DateTime.UtcNow</code> — avoids per-log local timezone lookup",
          "<code>DevConsoleOutputView</code> — incremental append: only new log entries are instantiated; full rebuild only on first open or after <code>Clear()</code>",
          "<code>DevConsoleSuggestionView</code> — fixed item pool: suggestion rows are rebound in place instead of destroyed and re-instantiated on every keypress",
        ],
      },
      {
        version: "1.1.0", date: "2026-03-22",
        added: [
          "<code>DevConsoleAPI.Register</code> — runtime command registration without attributes",
          "Typed overloads: <code>Register&lt;T&gt;</code>, <code>Register&lt;T1,T2&gt;</code>, <code>Register&lt;T1,T2,T3&gt;</code> with automatic ghost hints",
          "<code>DevConsoleAPI.Unregister(string)</code> — removes a command at runtime, returns <code>bool</code>",
          "<code>DevConsoleAPI.OnCommandExecuted</code> — event fired after every successful command execution",
          "<code>ConsoleArgConverter</code> — shared conversion utility used by both reflected and delegate command paths",
          "<code>RuntimeRegistrationExample</code> — demonstrates Register, Unregister, and OnCommandExecuted",
        ],
        changed: [
          "<code>ConsoleRegistry</code> now accepts <code>IConsoleCommand</code> directly via <code>Register(IConsoleCommand)</code>",
        ],
      },
      {
        version: "1.0.0", date: "2026-03-21",
        added: [
          "Initial command registration and execution pipeline with reflection-based command discovery",
          "Input sanitization, parsing, and command history navigation",
          "Context-aware suggestion system with segmented command support (<code>group.command</code>)",
          "Keyboard navigation (↑ ↓), Tab commit, mouse interaction, and default no-selection state",
          "Runtime console UI — TMP input, suggestion dropdown, output log, input ghost hints",
          "Support for <code>[DevConsole]</code>, <code>[ConsoleCommand]</code>, and <code>[ConsoleVariable]</code> attributes",
          "Modular assembly structure: <code>DevConsolePro</code>, <code>DevConsolePro.Tests</code>",
        ],
      },
    ],
  },
  {
    id: "instant-localization",
    name: "Instant Localization",
    description: "CSV-based localization workflow with editor tooling, QA, and auto-translate pipeline.",
    longDescription: "Instant Localization is a great solution for adding infinite-language support to your Unity projects. " +
        "It relies on a static system that loads all localization data from CSV files stored in the Resources folder. " +
        "It also includes an Auto-Translate feature that can generate translations using external machine translation services such as DeepL and Microsoft Azure Translator. " +
        "It runs entirely in the editor, so no assets or scripts from the package are included in builds.",
    price: "$25",
    // salePrice: "$0",
    tags: ["Translator", "Editor"],
    storeUrl: "https://assetstore.unity.com/packages/tools/utilities/instant-localization-345178",
    thumb: "img/InstantLocalization/InstantLocalizationPreviewImage_0.png",
    screenshots: [
      "https://www.youtube.com/watch?v=sOU9y1pgckE",
      "https://www.youtube.com/watch?v=QZA0iVRCPUQ",
      "img/InstantLocalization/InstantLocalizationCoverImage_1.png",
      "img/InstantLocalization/InstantLocalizationCoverImage_2.png"],
    features: [
      "CSV-based string management — edit in any spreadsheet app",
      "Custom Editor window with live preview",
      "Auto-translate pipeline via Google Translate API",
      "QA checker that flags missing or duplicate keys",
      "Runtime language switching with zero scene reload",
      "Supports pluralisation and string formatting",
      "Zero runtime dependencies",
    ],
    version: "1.2.3",
    unity: "2022.3+",
    unityVersions: [
      { version: "6000.4.5f1",  pipelines: { "Built-in": true,  "URP": true,  "HDRP": true  } },
      { version: "2022.3.13f1",  pipelines: { "Built-in": true,  "URP": true,  "HDRP": true  } },
    ],
    pipelines: ["Built-in", "URP", "HDRP"],
    platforms: ["Windows", "macOS", "Linux", "iOS", "Android", "WebGL"],
    dependencies: [
      { name: "TextMeshPro",     version: "v3.0.6", required: true,  url: "https://docs.unity3d.com/Packages/com.unity.textmeshpro@latest" },
      { name: "DeepL API",       version: "v2",     required: false, url: "https://www.deepl.com/en/pro-api" },
      { name: "Azure Translate", version: "v3.0",   required: false, url: "https://learn.microsoft.com/en-us/azure/ai-services/translator/" },
    ],
    docsPage: "docs/instant-localization.html",
    quickStart: `using InstantLocalization;
using UnityEngine;

public class LanguageButton : MonoBehaviour
{
    public void SwitchToGerman()
    {
        LocalizationSystem.SetLanguage("German");
    }

    void Start()
    {
        // Read a localized string by key
        string greeting = LocalizationSystem.GetLocalisedValue("welcome_message");
        Debug.Log(greeting);
    }
}

// Or attach the LocalizeText component to any TextMeshProUGUI
// and pick a key from the Localization Window.`,
    changelog: [
      {
        version: "1.2.3", date: "2026-02-24",
        items: [
          "Added public website documentation page with full setup guide and script reference",
          "Updated documentation structure — single package README with online docs as source of truth",
        ],
      },
      {
        version: "1.2.2", date: "2026-02-08",
        items: [
          "Updated DeepL provider to use header-based authorization (<code>Authorization: DeepL-Auth-Key</code>) following DeepL's deprecation of legacy form-body auth",
          "Fixed AuthenticationFailed errors occurring despite valid DeepL API keys",
          "Prevented empty or invalid DeepL responses from being cached as valid results",
          "Improved Azure provider validation to properly detect and report empty responses",
        ],
      },
      {
        version: "1.2.1", date: "2026-02-07",
        items: [
          "Fixed CSV corruption where translated files could start with duplicated <code>key,</code> header rows",
          "Prevented Auto-Translate from treating data rows as header rows",
          "Clarified Auto-Translate end-to-end flow: CSV → policies → provider → preview → apply",
        ],
      },
      {
        version: "1.2.0", date: "2025-12-14",
        items: [
          "Introduced the Auto-Translate Window (DeepL &amp; Azure support)",
          "Batch processing to comply with provider rate limits",
          "Translation preview before applying changes to CSV",
          "Options to preserve or overwrite existing translations",
        ],
      },
      {
        version: "1.1.1", date: "2025-11-30",
        items: [
          "<code>LocalizeText</code> now updates instantly when changing the key in the Inspector (via <code>OnValidate()</code> + <code>[ExecuteAlways]</code>)",
          "Confirmed runtime localization loads correctly via <code>RuntimeInitializeOnLoadMethod</code>",
          "Separated Editor-only code using <code>#if UNITY_EDITOR</code>",
        ],
      },
      {
        version: "1.1.0", date: "2025-11-27",
        items: [
          "Fully reworked Key Selector Window with modular architecture",
          "Virtualised list rendering for large CSV files — major performance improvement",
          "Favourite keys always appear at the top; saved persistently via ScriptableObject",
          "Improved search — results sorted by match position",
          "Fixed ArgumentException errors when quickly searching in large lists",
        ],
      },
      {
        version: "1.0.2", date: "2025-10-14",
        items: [
          "Added <code>LocalizeText</code> component with auto-update via <code>OnLanguageChanged</code>",
          "Added Editor menu items: <strong>Open Localization Window</strong> and <strong>Update Texts</strong>",
          "Added search text highlighting inside list items",
          "Missing translations now display the key as fallback",
        ],
      },
      {
        version: "1.0.1", date: "2025-08-21",
        items: [
          "Introduced <code>LocalizationSystem</code> with public API: <code>SetLanguage()</code>, <code>GetLocalisedValue()</code>, <code>OnLanguageChanged</code>, <code>Language</code>",
          "Automatic CSV loading from Resources folder",
          "Initial version of the Key Selector Window",
        ],
      },
      {
        version: "1.0.0", date: "2025-06-01",
        items: [
          "Initial release",
          "CSV-based localization with TextMeshPro support",
          "First prototype of the Editor Localization Window",
        ],
      },
    ],
  },
];