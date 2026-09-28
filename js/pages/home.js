import "../components/site-chrome.js";
import { ASSETS } from "../data/assets.js";
import { render } from "../lib/html.js";
import { installImageFallbacks } from "../lib/image-fallback.js";
import { assetCard } from "../components/asset-ui.js";

installImageFallbacks();
render(document.getElementById("asset-grid"), ASSETS.map(assetCard));
