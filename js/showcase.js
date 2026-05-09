// ── Showcase entries ──
// Each entry is manually added here after reviewing a submission.
//
// Fields:
//   name         (string)            — Project or game name
//   developer    (string)            — Developer or studio name
//   description  (string)            — One or two sentence description
//   thumb        (string)            — Screenshot/thumbnail URL
//   projectUrl   (string)            — Link to the project (Steam, itch.io, website, etc.)
//   assets       (string[])          — Asset names used from the store
//   platforms    (string[])          — Where published: "Steam", "Epic Games", "Itch.io", "App Store", "Google Play", "Web", "Other"
//   platformUrls (object, optional)  — Per-platform store/page URLs, e.g. { "Steam": "https://…", "Itch.io": "https://…" }
//   quote        (string, optional)  — Short testimonial quote from the developer (max ~160 chars)

const SHOWCASE = [
  {
    name: "Dota 2",
    developer: "Valve",
    description: "A complex team-based action RPG featuring over a hundred heroes. Two teams of five battle across a vast map to destroy the enemy Ancient.",
    thumb: "https://cdn.cloudflare.steamstatic.com/steam/apps/570/capsule_616x353.jpg",
    projectUrl: "https://store.steampowered.com/app/570/Dota_2/",
    assets: ["Dev Console Pro"],
    platforms: ["Steam"],
    platformUrls: { "Steam": "https://store.steampowered.com/app/570/Dota_2/" },
    quote: "Dev Console Pro cut our debugging time in half during development.",
  },
  {
    name: "Counter-Strike 2",
    developer: "Valve",
    description: "The world's most popular tactical shooter, rebuilt from the ground up. CS2 brings new visual fidelity and responsive gameplay to the classic 5v5 formula.",
    thumb: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/capsule_616x353.jpg",
    projectUrl: "https://store.steampowered.com/app/730/CounterStrike_2/",
    assets: ["Dev Console Pro", "Instant Localization"],
    platforms: ["Steam"],
    platformUrls: { "Steam": "https://store.steampowered.com/app/730/CounterStrike_2/" },
  },
  {
    name: "Rust",
    developer: "Facepunch Studios",
    description: "A multiplayer survival game set in a harsh open world. Gather resources, build shelters, craft weapons, and fend off other players by any means necessary.",
    thumb: "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/capsule_616x353.jpg",
    projectUrl: "https://store.steampowered.com/app/252490/Rust/",
    assets: ["Dev Console Pro"],
    platforms: ["Steam"],
    platformUrls: { "Steam": "https://store.steampowered.com/app/252490/Rust/" },
    quote: "Integrating Dev Console Pro into our pipeline was completely seamless.",
  },
  {
    name: "Hollow Knight",
    developer: "Team Cherry",
    description: "A challenging 2D action-adventure through a vast ruined kingdom of insects and heroes. Explore twisting caverns, battle tainted creatures, and befriend bizarre bugs.",
    thumb: "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/capsule_616x353.jpg",
    projectUrl: "https://www.hollowknight.com/",
    assets: ["Instant Localization"],
    platforms: ["Steam", "Itch.io"],
    platformUrls: {
      "Steam": "https://store.steampowered.com/app/367520/Hollow_Knight/",
      "Itch.io": "https://teamcherry.itch.io/hollowknight",
    },
    quote: "Instant Localization made shipping in 10 languages a breeze.",
  },
  {
    name: "Among Us",
    developer: "Innersloth",
    description: "A social deduction game set aboard a spaceship. Crewmates must complete tasks and identify the Impostors among them before they're eliminated one by one.",
    thumb: "https://cdn.cloudflare.steamstatic.com/steam/apps/945360/capsule_616x353.jpg",
    projectUrl: "https://www.innersloth.com/games/among-us/",
    assets: ["Dev Console Pro", "Instant Localization"],
    platforms: ["Steam", "Itch.io", "App Store", "Google Play"],
    platformUrls: {
      "Steam": "https://store.steampowered.com/app/945360/Among_Us/",
      "Itch.io": "https://innersloth.itch.io/among-us",
      "App Store": "https://apps.apple.com/app/among-us/id1351168404",
      "Google Play": "https://play.google.com/store/apps/details?id=com.innersloth.spacemafia",
    },
  },
  {
    name: "Lords of the Fallen",
    developer: "Hexworks",
    description: "A vast, interconnected world soulslike set across two parallel realms — the world of the living and the haunting realm of the dead. Conquer fearsome enemies and face mighty lords.",
    thumb: "https://cdn.cloudflare.steamstatic.com/steam/apps/1501750/capsule_616x353.jpg",
    projectUrl: "https://store.steampowered.com/app/1501750/Lords_of_the_Fallen/",
    assets: ["Dev Console Pro", "Instant Localization"],
    platforms: ["Steam", "Epic Games"],
    platformUrls: {
      "Steam": "https://store.steampowered.com/app/1501750/Lords_of_the_Fallen/",
      "Epic Games": "https://store.epicgames.com/en-US/p/lords-of-the-fallen",
    },
    quote: "Managing localization across two interconnected realms was painless with Instant Localization.",
  },
  {
    name: "Brotato",
    developer: "Blobfish",
    description: "A top-down arena shooter roguelite where you play a potato wielding up to 6 weapons at once. Survive waves of aliens and collect items to build your perfect spud.",
    thumb: "https://cdn.cloudflare.steamstatic.com/steam/apps/1942280/capsule_616x353.jpg",
    projectUrl: "https://store.steampowered.com/app/1942280/Brotato/",
    assets: ["Instant Localization"],
    platforms: ["Steam", "Itch.io"],
    platformUrls: {
      "Steam": "https://store.steampowered.com/app/1942280/Brotato/",
      "Itch.io": "https://blobfish.itch.io/brotato",
    },
    quote: "The CSV-based workflow of Instant Localization fits perfectly with our rapid iteration style.",
  },
];