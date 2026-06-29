import { useState, useRef, useEffect, useCallback } from "react";

const SHADES = {
  "Whites & Beiges": [
    { name: "White Silk", code: "L171", hex: "#F8F4EE" },
    { name: "Chloe Diamond", code: "8785", hex: "#F5EEF0" },
    { name: "Sonnet", code: "L146", hex: "#F2E8DF" },
    { name: "Morning Glory", code: "0765", hex: "#F5E8D8" },
    { name: "Icy Peak", code: "L109", hex: "#EEE8E2" },
    { name: "Bonewhite", code: "0964", hex: "#E8E0D5" },
    { name: "French Cream", code: "25YY 83/103", hex: "#F5DFC0" },
    { name: "Pebble White", code: "L136", hex: "#EDE0CF" },
    { name: "Sugared Nut", code: "L126", hex: "#F0E2C0" },
    { name: "Enlighten-N", code: "4148", hex: "#EDE0D2" },
    { name: "Tusk Tusk", code: "30YY 79/070", hex: "#EAD9C4" },
    { name: "Confetti", code: "8300", hex: "#EAE0D5" },
    { name: "Winter Morn", code: "7228", hex: "#D8DFE8" },
    { name: "Ski Adventure", code: "02BB 81/030", hex: "#D0D8E2" },
    { name: "Romance", code: "10BB 83/020", hex: "#DCDFE8" },
    { name: "Magnolia", code: "0387", hex: "#F5CFA8" },
    { name: "Dawn Dew-N", code: "L190", hex: "#EDD8B8" },
    { name: "Meadow Lark", code: "8499", hex: "#F0D8B8" },
    { name: "Cashmere-N", code: "2119", hex: "#EDE0CE" },
    { name: "Cane Beige", code: "9563", hex: "#E8D0B0" },
    { name: "Baked Biscuit", code: "8579", hex: "#DEC8A0" },
    { name: "Sound of Music", code: "8756", hex: "#C8B8A8" },
    { name: "Grey Flannel", code: "8331", hex: "#C0BCBA" },
    { name: "Aluminium", code: "8337", hex: "#B0B4B8" },
    { name: "Smoke-N", code: "0616", hex: "#B0B0B0" },
    { name: "Brandy", code: "4115", hex: "#8C6848" },
    { name: "Brownstone", code: "4234", hex: "#907060" },
    { name: "Old Brick", code: "8613", hex: "#8C4840" },
  ],
  "Yellows & Pinks": [
    { name: "Candle Light", code: "7900", hex: "#FDF0C0" },
    { name: "Blush", code: "80YR 75/057", hex: "#F5DDD0" },
    { name: "Mid Cream", code: "0358", hex: "#F5D8A8" },
    { name: "Solemn Yellow", code: "7882", hex: "#F8D888" },
    { name: "Marigold", code: "7986", hex: "#F8C870" },
    { name: "Raffia", code: "7929", hex: "#F8D898" },
    { name: "Hearth", code: "7930", hex: "#F8D880" },
    { name: "Pineapple-N", code: "0399", hex: "#F8D060" },
    { name: "Warm Peach", code: "10YY 77/125", hex: "#F8C880" },
    { name: "Funny Feeling", code: "50YR 78/064", hex: "#F5C8C8" },
    { name: "Coral Rocks", code: "8097", hex: "#F5C0B8" },
    { name: "Essence", code: "8099", hex: "#F5C8C0" },
    { name: "Mango Duet", code: "7977", hex: "#F8C080" },
    { name: "Pink BB", code: "8034", hex: "#F5B8B8" },
    { name: "Sunshine Peach-N", code: "9934", hex: "#F8C8A0" },
    { name: "Romantic Pink", code: "50RR 75/068", hex: "#F0C8D0" },
    { name: "Hacienda Clay", code: "7936", hex: "#F0A860" },
    { name: "Nursery Pink", code: "8058", hex: "#F5C0C8" },
  ],
  "Oranges & Reds": [
    { name: "Morning Dream", code: "7904", hex: "#F8E860" },
    { name: "Polka", code: "7869", hex: "#F8C800" },
    { name: "Mango Shake", code: "7960", hex: "#F8A830" },
    { name: "Orange Crush", code: "7959", hex: "#F07820" },
    { name: "Sunrise", code: "526", hex: "#F06020" },
    { name: "Signal Red", code: "—", hex: "#E82020" },
    { name: "PO Red", code: "—", hex: "#E81818" },
    { name: "Terracotta-N", code: "0427", hex: "#C06840" },
  ],
  "Blues & Greens": [
    { name: "Delicate Violet", code: "7164", hex: "#D8D0E0" },
    { name: "Innocence", code: "7211", hex: "#D0D0E8" },
    { name: "Lavender Secret", code: "7163", hex: "#D8D0E8" },
    { name: "Lilac Feather-N", code: "9630", hex: "#C8B8D8" },
    { name: "Orchid Bloom", code: "7168", hex: "#B0A0C8" },
    { name: "Snow Princess", code: "7332", hex: "#D8E8E8" },
    { name: "Star Gaze", code: "7364", hex: "#C8E0D8" },
    { name: "Blueberry Mash", code: "14BB 55/113", hex: "#90A8C0" },
    { name: "Summer Sky", code: "7274", hex: "#B8D0E0" },
    { name: "Alliance", code: "1203", hex: "#A8C0D0" },
    { name: "Pigeon Blue-N", code: "0122", hex: "#90A8C0" },
    { name: "Blue Bay", code: "7329", hex: "#A8C0D0" },
    { name: "Electric Blue Plus", code: "—", hex: "#2090C8" },
    { name: "Menthol", code: "L116", hex: "#D0E8D8" },
    { name: "Green Whisper", code: "2425", hex: "#C8D8C8" },
    { name: "Green Sleeves-N", code: "2420", hex: "#B8D0B8" },
    { name: "Tree Of Life", code: "7691", hex: "#C0C8A8" },
    { name: "Mint Crush", code: "7547", hex: "#B0D0B8" },
    { name: "Poplar Grove", code: "7584", hex: "#98B898" },
    { name: "Mehendi-N", code: "2361", hex: "#607850" },
  ],
};

// ── Designer Paint Combinations (exact from SM Paints shade card) ──────────────
const DESIGNER_COLLECTIONS = [
  {
    id: "warm-inviting",
    collection: "Warm & Inviting",
    mood: "Cosy, uplifting, welcoming",
    why: "A rich earthy taupe paired with a warm soft beige creates a balanced, harmonious interior — grounded yet luminous.",
    shades: [
      { name: "Ancient Pottery", hex: "#A8836A", desc: "A rich, earthy taupe that adds depth and warmth." },
      { name: "Indian Painting", hex: "#E8D5B8", desc: "A warm, soft beige that creates balance and harmony." },
    ],
  },
  {
    id: "warm-vibrant",
    collection: "Warm & Vibrant",
    mood: "Balanced, harmonious, modern",
    why: "Warm greige and creamy white amplify each other — the greige adds sophistication while the white keeps the space bright and timeless.",
    shades: [
      { name: "Toasty Grey", hex: "#B8A898", desc: "A warm greige that adds softness and sophistication." },
      { name: "European White", hex: "#F0EAE0", desc: "A creamy white that brightens the space and feels timeless." },
    ],
  },
  {
    id: "warm-sophisticated",
    collection: "Warm & Sophisticated",
    mood: "Luxurious, grounded, comfortable",
    why: "Caramel and warm brown tones layer beautifully — the caramel adds cosiness while the brown grounds the space with quiet luxury.",
    shades: [
      { name: "Creamy Toffee", hex: "#C8885A", desc: "A warm, inviting caramel tone that adds cosiness and comfort." },
      { name: "Creme Brulee", hex: "#8B5E3C", desc: "A rich, warm brown that adds depth, grounding and elegance." },
    ],
  },
  {
    id: "warm-neutral-elegance",
    collection: "Warm Neutral Elegance",
    mood: "Elegant, timeless, sophisticated",
    why: "Warm beige and soft greige work together to create a luxurious, welcoming space where light and depth coexist beautifully.",
    shades: [
      { name: "Shadowbox", hex: "#9E9488", desc: "A soft, elegant greige that adds depth and sophistication." },
      { name: "Church Street", hex: "#EDE4D4", desc: "A warm, creamy beige that brings light and timeless charm." },
    ],
  },
  {
    id: "golden-luxury",
    collection: "Golden Luxury",
    mood: "Radiant, energetic, opulent",
    why: "Radiant gold and deep rich gold create a dramatic, opulent space — both warm and full of energy that commands attention.",
    shades: [
      { name: "Warm Gold", hex: "#C8A040", desc: "A warm, radiant gold that adds energy and brightness." },
      { name: "Rich Brocade", hex: "#A07820", desc: "A deep, luxurious gold that brings depth and elegance." },
    ],
  },
  {
    id: "earthy-sophistication",
    collection: "Earthy Sophistication",
    mood: "Grounded, warm, refined",
    why: "Earthy caramel and rich brown work together to create a sophisticated palette that feels natural and deeply inviting.",
    shades: [
      { name: "Maple Fantasy", hex: "#B87848", desc: "A warm, inviting caramel tone that adds softness and comfort." },
      { name: "Dark Safari", hex: "#6B4028", desc: "A rich, grounded brown that adds depth and sophistication." },
    ],
  },
  {
    id: "warm-inviting-red",
    collection: "Warm & Inviting — Reds",
    mood: "Vibrant, cheerful, bold",
    why: "Warm coral and rich bold red create a striking focal point — cheerful energy paired with deep sophistication.",
    shades: [
      { name: "Oriental Coral", hex: "#C85848", desc: "A warm, vibrant coral that adds cheerfulness and energy." },
      { name: "Matador", hex: "#8B2020", desc: "A rich, bold red that adds depth, sophistication and a striking focal point." },
    ],
  },
  {
    id: "warm-vibrant-orange",
    collection: "Warm & Vibrant — Oranges",
    mood: "Energetic, earthy, sun-drenched",
    why: "Vibrant earthy orange and rich warm terracotta bring Mediterranean energy — a palette alive with warmth and vitality.",
    shades: [
      { name: "Moroccan Sands", hex: "#D87830", desc: "A vibrant, earthy orange that brings energy and warmth." },
      { name: "Sunset Flame", hex: "#C05828", desc: "A rich, warm terracotta that adds depth and cosiness." },
    ],
  },
  {
    id: "warm-sophisticated-terracotta",
    collection: "Warm & Sophisticated — Terracotta",
    mood: "Earthy, soft, timeless",
    why: "Warm terracotta and earthy chestnut brown create a nature-inspired palette with enduring elegance and depth.",
    shades: [
      { name: "Mars Dust", hex: "#C07050", desc: "A warm, earthy terracotta that adds softness and inviting energy." },
      { name: "Spanish Chestnut", hex: "#703020", desc: "A rich, earthy brown that adds depth, sophistication and timeless elegance." },
    ],
  },
  {
    id: "warm-inviting-pink",
    collection: "Warm & Inviting — Pinks",
    mood: "Cheerful, uplifting, charming",
    why: "A bold vibrant rose paired with a soft delicate pink perfectly balances energy and gentleness — beautiful in any social space.",
    shades: [
      { name: "Royal Rose", hex: "#B02858", desc: "A warm, vibrant rose that adds cheerfulness and energy." },
      { name: "Sophia", hex: "#F0C8D8", desc: "A soft, delicate pink that brings light and a gentle charm." },
    ],
  },
  {
    id: "warm-vibrant-coral",
    collection: "Warm & Vibrant — Coral",
    mood: "Warm, soft, layered",
    why: "Rich earthy terracotta and warm coral blush complement beautifully — depth and softness in perfect harmony.",
    shades: [
      { name: "Downing Street", hex: "#A04030", desc: "A rich, earthy terracotta that adds depth and warmth." },
      { name: "Rich Blush", hex: "#E8A098", desc: "A warm coral blush that adds softness and cosiness." },
    ],
  },
  {
    id: "warm-sophisticated-pink",
    collection: "Warm & Sophisticated — Pinks",
    mood: "Bold, balanced, elegant",
    why: "A lively bold pink grounded by a soft muted pink — expressive vibrancy with refined elegance.",
    shades: [
      { name: "Gorgeous Pink", hex: "#C83068", desc: "A bold, lively pink that adds vibrancy and personality." },
      { name: "Destiny", hex: "#E8B8C8", desc: "A soft, muted pink that brings balance and elegance." },
    ],
  },
  {
    id: "warm-inviting-blue",
    collection: "Warm & Inviting — Blues",
    mood: "Calm, grounded, confident",
    why: "Soft airy blue and deep grounding blue create a cosy, uplifting atmosphere with quiet sophistication.",
    shades: [
      { name: "Swordplay", hex: "#8898B8", desc: "A soft, airy blue that brings calm and subtle freshness." },
      { name: "Wisdom Light", hex: "#303858", desc: "A deep, grounding blue that adds depth and quiet confidence." },
    ],
  },
  {
    id: "warm-vibrant-blue",
    collection: "Warm & Vibrant — Blues",
    mood: "Serene, modern, open",
    why: "Blue-grey and misty grey-blue create a serene, liveable palette — visual openness and calm sophistication.",
    shades: [
      { name: "Pebble Drift", hex: "#5878A0", desc: "A balanced blue-grey that feels serene, modern and liveable." },
      { name: "Denim Drift", hex: "#90A0B8", desc: "A light, misty grey-blue that adds softness and visual openness." },
    ],
  },
  {
    id: "warm-sophisticated-blue",
    collection: "Warm & Sophisticated — Blues",
    mood: "Gentle, welcoming, refined",
    why: "Gentle elegant blue with rich refined blue — depth and sophistication that adds timeless character to any space.",
    shades: [
      { name: "Ceremonial Blue", hex: "#6888A8", desc: "A gentle, elegant blue that creates a serene and welcoming feel." },
      { name: "Noble Blue", hex: "#283858", desc: "A rich, refined blue that adds depth, sophistication and timeless character." },
    ],
  },
  {
    id: "naturally-balanced",
    collection: "Naturally Balanced",
    mood: "Grounded, earthy, natural",
    why: "Deep olive and fresh uplifting yellow-green mirror nature's own palette — grounded and harmonious for nature-inspired interiors.",
    shades: [
      { name: "Otters Dam", hex: "#5A6838", desc: "Grounded, earthy and natural — a deep olive that anchors the space." },
      { name: "English Apple", hex: "#B8C040", desc: "Fresh, uplifting and harmonious — a bright yellow-green that lifts the mood." },
    ],
  },
  {
    id: "earthy-harmony",
    collection: "Earthy Harmony",
    mood: "Deep, fresh, balanced",
    why: "Forest green depth paired with fresh yellow-green creates a palette that is earthy, lively, and full of natural energy.",
    shades: [
      { name: "Brazilian Forest", hex: "#406040", desc: "Depth, natural and grounded — a rich forest green." },
      { name: "Highland Dash", hex: "#A0A828", desc: "Fresh, uplifting and harmonious — a warm yellow-green." },
    ],
  },
  {
    id: "calm-sophistication",
    collection: "Calm Sophistication",
    mood: "Tranquil, peaceful, refined",
    why: "Soft tranquil green and rich peaceful teal layer calm and sophistication — a restful palette for bedrooms and living spaces.",
    shades: [
      { name: "Forest Glen", hex: "#6A9888", desc: "A soft, tranquil green that brings calm and freshness." },
      { name: "Serene Moments", hex: "#307068", desc: "A rich, peaceful teal that adds depth and sophistication." },
    ],
  },
];


function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

// Gold overlay colour
const GOLD_R = 212, GOLD_G = 175, GOLD_B = 55, GOLD_A = 0.45;

// SM Paints logo (embedded)
const SM_LOGO_SRC = "data:image/png;base64,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";




// ── LAB Color Space — Shade Comparison Analysis ───────────────────────────────
// All similarity finding and comparison generation uses CIE LAB + Delta E 2000.
// RGB is only used for rendering (applyRealisticPaint).

function parseHex(hex) {
  return {
    r: parseInt(hex.slice(1,3),16),
    g: parseInt(hex.slice(3,5),16),
    b: parseInt(hex.slice(5,7),16),
  };
}

// sRGB → Linear RGB (inverse gamma)
function srgbToLinear(v) {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// Linear RGB → XYZ (D65 illuminant)
function rgbToXyz(r, g, b) {
  const lr = srgbToLinear(r), lg = srgbToLinear(g), lb = srgbToLinear(b);
  return {
    x: lr*0.4124564 + lg*0.3575761 + lb*0.1804375,
    y: lr*0.2126729 + lg*0.7151522 + lb*0.0721750,
    z: lr*0.0193339 + lg*0.1191920 + lb*0.9503041,
  };
}

// XYZ → CIE LAB (D65 reference white)
function xyzToLab(x, y, z) {
  const Xn=0.95047, Yn=1.00000, Zn=1.08883;
  const f = t => t > 0.008856 ? Math.cbrt(t) : (7.787*t + 16/116);
  const fx=f(x/Xn), fy=f(y/Yn), fz=f(z/Zn);
  return { L: 116*fy - 16, a: 500*(fx-fy), b: 200*(fy-fz) };
}

// hex → LAB
function hexToLab(hex) {
  const {r,g,b} = parseHex(hex);
  const xyz = rgbToXyz(r,g,b);
  return xyzToLab(xyz.x, xyz.y, xyz.z);
}

// Delta E 2000 — perceptually uniform colour difference
function deltaE2000(lab1, lab2) {
  const { L:L1, a:a1, b:b1 } = lab1;
  const { L:L2, a:a2, b:b2 } = lab2;
  const kL=1, kC=1, kH=1;
  const C1=Math.sqrt(a1*a1+b1*b1), C2=Math.sqrt(a2*a2+b2*b2);
  const Cab=( C1+C2)/2;
  const Cab7=Math.pow(Cab,7);
  const G=0.5*(1-Math.sqrt(Cab7/(Cab7+Math.pow(25,7))));
  const a1p=a1*(1+G), a2p=a2*(1+G);
  const C1p=Math.sqrt(a1p*a1p+b1*b1), C2p=Math.sqrt(a2p*a2p+b2*b2);
  const h1p = (Math.atan2(b1,a1p)*180/Math.PI+360)%360;
  const h2p = (Math.atan2(b2,a2p)*180/Math.PI+360)%360;
  const dLp = L2-L1;
  const dCp = C2p-C1p;
  let dhp;
  if (C1p*C2p===0) dhp=0;
  else if (Math.abs(h2p-h1p)<=180) dhp=h2p-h1p;
  else if (h2p-h1p > 180) dhp=h2p-h1p-360;
  else dhp=h2p-h1p+360;
  const dHp=2*Math.sqrt(C1p*C2p)*Math.sin(dhp*Math.PI/360);
  const Lbp=(L1+L2)/2;
  const Cbp=(C1p+C2p)/2;
  let hbp;
  if (C1p*C2p===0) hbp=h1p+h2p;
  else if (Math.abs(h1p-h2p)<=180) hbp=(h1p+h2p)/2;
  else if (h1p+h2p<360) hbp=(h1p+h2p+360)/2;
  else hbp=(h1p+h2p-360)/2;
  const T = 1
    - 0.17*Math.cos((hbp-30)*Math.PI/180)
    + 0.24*Math.cos(2*hbp*Math.PI/180)
    + 0.32*Math.cos((3*hbp+6)*Math.PI/180)
    - 0.20*Math.cos((4*hbp-63)*Math.PI/180);
  const SL=1+0.015*Math.pow(Lbp-50,2)/Math.sqrt(20+Math.pow(Lbp-50,2));
  const SC=1+0.045*Cbp;
  const SH=1+0.015*Cbp*T;
  const Cbp7=Math.pow(Cbp,7);
  const RC=2*Math.sqrt(Cbp7/(Cbp7+Math.pow(25,7)));
  const dTheta=30*Math.exp(-Math.pow((hbp-275)/25,2));
  const RT=-Math.sin(2*dTheta*Math.PI/180)*RC;
  return Math.sqrt(
    Math.pow(dLp/(kL*SL),2)+
    Math.pow(dCp/(kC*SC),2)+
    Math.pow(dHp/(kH*SH),2)+
    RT*(dCp/(kC*SC))*(dHp/(kH*SH))
  );
}

// colorDistance: Delta E 2000 between two hex values
function colorDistance(hexA, hexB) {
  return deltaE2000(hexToLab(hexA), hexToLab(hexB));
}

// LAB-based shade metrics for human-readable comparison
function shadeLabMetrics(hex) {
  const lab = hexToLab(hex);
  // Chroma = distance from grey axis in LAB
  const chroma = Math.sqrt(lab.a*lab.a + lab.b*lab.b);
  // Hue angle in degrees
  const hue = (Math.atan2(lab.b, lab.a)*180/Math.PI+360)%360;
  return { L: lab.L, a: lab.a, b: lab.b, chroma, hue };
}

function generateComparison(selected, candidate) {
  const s = shadeLabMetrics(selected.hex);
  const c = shadeLabMetrics(candidate.hex);
  const lines = [];

  // L* axis — lightness (0=black, 100=white)
  const dL = c.L - s.L;
  if      (dL >  4) lines.push("Noticeably lighter");
  else if (dL >  1.5) lines.push("Slightly lighter");
  else if (dL < -4) lines.push("Noticeably darker");
  else if (dL < -1.5) lines.push("Slightly darker");

  // a* axis — negative=green, positive=red/pink
  const da = c.a - s.a;
  if      (da >  2.5) lines.push("More pink / rosy undertone");
  else if (da >  1.0) lines.push("Slightly more pink / rosy");
  else if (da < -2.5) lines.push("Less pink — greener / more neutral");
  else if (da < -1.0) lines.push("Slightly less pink");

  // b* axis — negative=blue, positive=yellow/warm
  const db = c.b - s.b;
  if      (db >  3) lines.push("Noticeably warmer / more yellow");
  else if (db >  1.2) lines.push("Slightly warmer / more yellow");
  else if (db < -3) lines.push("Noticeably cooler / more blue-grey");
  else if (db < -1.2) lines.push("Slightly cooler undertone");

  // Chroma — colourfulness
  const dC = c.chroma - s.chroma;
  if      (dC >  3) lines.push("More colourful / saturated");
  else if (dC < -3) lines.push("More muted / closer to neutral");

  if (lines.length === 0) lines.push("Very similar — subtle tonal difference");
  return lines.slice(0, 4);
}

function findSimilarShades(selected, allShades, maxResults = 5) {
  const selLab = hexToLab(selected.hex);
  const others = allShades.filter(s => s.name !== selected.name);
  return others
    .map(s => ({ shade: s, dist: deltaE2000(selLab, hexToLab(s.hex)) }))
    .sort((a,b) => a.dist - b.dist)
    .slice(0, maxResults)
    .map(({ shade, dist }) => ({
      shade,
      dist,
      bullets: generateComparison(selected, shade),
    }));
}

// Shade Enhancement helper ─────────────────────────────────────────────────────
// For very light shades the luminance-based formula desaturates so heavily that
// similar whites/beiges look identical.  We boost the chroma (colour deviation
// from grey) of the paint colour before applying it, making subtle tints pop
// while keeping shadows and highlights intact.
function applyRealisticPaint(origR, origG, origB, paintR, paintG, paintB, opacity, renderMode) {
  if (renderMode !== "realistic") {
    // Vibrant mode – flat overlay
    return [
      Math.round(origR * (1 - opacity) + paintR * opacity),
      Math.round(origG * (1 - opacity) + paintG * opacity),
      Math.round(origB * (1 - opacity) + paintB * opacity),
    ];
  }
  // Shade Enhancement: boost chroma by pulling channels away from grey
  const ENHANCE = 1.55; // amplify colour difference vs grey (tune here)
  const paintLum = 0.299 * paintR + 0.587 * paintG + 0.114 * paintB;
  const eR = Math.min(255, Math.max(0, paintLum + (paintR - paintLum) * ENHANCE));
  const eG = Math.min(255, Math.max(0, paintLum + (paintG - paintLum) * ENHANCE));
  const eB = Math.min(255, Math.max(0, paintLum + (paintB - paintLum) * ENHANCE));

  // Luminance-preserving realistic blend
  const shadeLum = (0.299 * eR + 0.587 * eG + 0.114 * eB) / 255;
  const luminance = (0.299 * origR + 0.587 * origG + 0.114 * origB) / 255;
  const lightFactor = luminance / Math.max(shadeLum, 0.01);
  const tR = Math.min(255, eR * lightFactor);
  const tG = Math.min(255, eG * lightFactor);
  const tB = Math.min(255, eB * lightFactor);

  return [
    Math.round(origR * (1 - opacity) + tR * opacity),
    Math.round(origG * (1 - opacity) + tG * opacity),
    Math.round(origB * (1 - opacity) + tB * opacity),
  ];
}

export default function Visualizer() {
  const [image, setImage] = useState(null);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const [selectedShade, setSelectedShade] = useState(null);
  const [opacity, setOpacity] = useState(0.65);
  const [brushSize, setBrushSize] = useState(32);
  const [tolerance, setTolerance] = useState(35);
  const [activeCategory, setActiveCategory] = useState(Object.keys(SHADES)[0]);
  const [step, setStep] = useState(1);
  const [tool, setTool] = useState("brush"); // brush | eraser | select
  const [isPainting, setIsPainting] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sm_paint_designs") || "[]"); } catch { return []; }
  });
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [compareShades, setCompareShades] = useState([]); // up to 4 shades
  const [designerCategory, setDesignerCategory] = useState("Neutrals");
  const [renderMode, setRenderMode] = useState("realistic"); // "realistic" | "vibrant"
  const [showSplit, setShowSplit] = useState(false);
  const [splitShadeB, setSplitShadeB] = useState(null); // second shade for split view
  const [splitShadeA, setSplitShadeA] = useState(null); // first shade for split view (overrides selectedShade)
  const [showCompare, setShowCompare] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareDataUrl, setShareDataUrl] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const canvasRef = useRef(null);       // overlay mask canvas
  const displayRef = useRef(null);      // composite display canvas
  const imgRef = useRef(null);          // hidden img element
  const undoStack = useRef([]);          // array of mask ImageData snapshots

  // Draw composite: image + gold selection preview OR coloured mask
  const redraw = useCallback(() => {
    const display = displayRef.current;
    const mask = canvasRef.current;
    const img = imgRef.current;
    if (!display || !mask || !img) return;
    const ctx = display.getContext("2d");
    ctx.clearRect(0, 0, display.width, display.height);
    ctx.drawImage(img, 0, 0, display.width, display.height);

    // Before mode: show original photo only, no overlays
    if (showBefore) return;

    const maskCtx = mask.getContext("2d");
    const maskData = maskCtx.getImageData(0, 0, mask.width, mask.height);
    const out = ctx.getImageData(0, 0, display.width, display.height);

    if (selectedShade) {
      const { r: paintR, g: paintG, b: paintB } = hexToRgb(selectedShade.hex);
      for (let i = 0; i < maskData.data.length; i += 4) {
        const alpha = maskData.data[i + 3] / 255;
        if (alpha > 0) {
          const [nR,nG,nB] = applyRealisticPaint(
            out.data[i], out.data[i+1], out.data[i+2],
            paintR, paintG, paintB,
            alpha * opacity, renderMode
          );
          out.data[i] = nR; out.data[i+1] = nG; out.data[i+2] = nB;
        }
      }
    } else {
      // No shade chosen: show semi-transparent gold overlay on selected mask area
      for (let i = 0; i < maskData.data.length; i += 4) {
        const alpha = maskData.data[i + 3] / 255;
        if (alpha > 0) {
          const blend = alpha * GOLD_A;
          out.data[i]     = Math.round(out.data[i]     * (1 - blend) + GOLD_R * blend);
          out.data[i + 1] = Math.round(out.data[i + 1] * (1 - blend) + GOLD_G * blend);
          out.data[i + 2] = Math.round(out.data[i + 2] * (1 - blend) + GOLD_B * blend);
        }
      }
    }

    ctx.putImageData(out, 0, 0);
  }, [selectedShade, opacity, showBefore, renderMode]);

  useEffect(() => { redraw(); }, [redraw]);

  // Auto-set designer category when shade changes
  useEffect(() => {
    if (!selectedShade) return;
    const hex = selectedShade.hex;
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    const l = (max+min)/2/255;
    const s = max===min ? 0 : (l>0.5 ? (max-min)/(2*255-max-min) : (max-min)/(max+min));
    if (s < 0.12) { setDesignerCategory("Neutrals"); return; }
    let h = 0;
    if (max===r) h = ((g-b)/(max-min)+6)%6*60;
    else if (max===g) h = ((b-r)/(max-min)+2)*60;
    else h = ((r-g)/(max-min)+4)*60;
    if (h<20||h>=340)        setDesignerCategory("Reds & Oranges");
    else if (h<50)           setDesignerCategory("Reds & Oranges");
    else if (h<80)           setDesignerCategory("Neutrals");
    else if (h<165)          setDesignerCategory("Greens");
    else if (h<290)          setDesignerCategory("Blues");
    else                     setDesignerCategory("Pinks");
  }, [selectedShade]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Save current mask state onto undo stack before any destructive action
  const saveUndo = () => {
    const mask = canvasRef.current;
    if (!mask) return;
    const snap = mask.getContext("2d").getImageData(0, 0, mask.width, mask.height);
    undoStack.current.push(snap);
    if (undoStack.current.length > 30) undoStack.current.shift(); // cap at 30 steps
  };

  const undo = () => {
    if (undoStack.current.length === 0) return;
    const mask = canvasRef.current;
    if (!mask) return;
    const prev = undoStack.current.pop();
    mask.getContext("2d").putImageData(prev, 0, 0);
    redraw();
  };

  const paint = (e) => {
    e.preventDefault();
    if (!isPainting || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e, canvasRef.current);
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
    }
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
    redraw();
  };

  const autoSelectWall = (e) => {
    const mask = canvasRef.current;
    const img = imgRef.current;
    if (!mask || !img) return;

    const { x, y } = getPos(e, mask);
    const cx = Math.floor(x);
    const cy = Math.floor(y);
    const w = mask.width;
    const h = mask.height;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(img, 0, 0, w, h);
    const imgData = tempCtx.getImageData(0, 0, w, h);
    const pixels = imgData.data;

    const idx = (cy * w + cx) * 4;
    const seedR = pixels[idx];
    const seedG = pixels[idx + 1];
    const seedB = pixels[idx + 2];

    // Helper: perceptual brightness of a pixel index
    const brightness = (pi) =>
      0.299 * pixels[pi] + 0.587 * pixels[pi + 1] + 0.114 * pixels[pi + 2];

    // Helper: colour distance between two pixel indices
    const colorDist = (ai, bi) =>
      Math.abs(pixels[ai]     - pixels[bi]) +
      Math.abs(pixels[ai + 1] - pixels[bi + 1]) +
      Math.abs(pixels[ai + 2] - pixels[bi + 2]);

    // Edge strength threshold: scales with tolerance so a loose selection
    // allows softer edges, a tight selection stops at finer edges.
    // At tolerance=35 (default) the edge cap is ~28; at 90 it's ~55; at 10 it's ~12.
    const edgeCap = Math.round(tolerance * 0.62 + 6);

    const visited = new Uint8Array(w * h);
    const queue = [cx + cy * w];
    visited[cx + cy * w] = 1;
    const filled = [];

    // For each queued pixel we also store its parent pixel index so we can
    // measure the local step-to-step edge change.
    // We encode [pos, parentPixelIndex] together — use two arrays for clarity.
    const parentPi = new Int32Array(w * h).fill(-1);
    const seedPi = (cy * w + cx) * 4;

    // Seed-relative match: candidate must be close to the original seed colour.
    const seedMatch = (pi) =>
      Math.abs(pixels[pi]     - seedR) <= tolerance &&
      Math.abs(pixels[pi + 1] - seedG) <= tolerance &&
      Math.abs(pixels[pi + 2] - seedB) <= tolerance;

    // Local edge check: the step from parent → candidate must not cross a
    // strong edge (large colour jump or strong brightness jump).
    const noStrongEdge = (fromPi, toPi) => {
      // Raw colour channel jump between adjacent pixels
      if (colorDist(fromPi, toPi) > edgeCap * 3) return false;
      // Brightness jump (catches dark furniture against light walls, etc.)
      if (Math.abs(brightness(fromPi) - brightness(toPi)) > edgeCap * 1.4) return false;
      return true;
    };

    while (queue.length > 0) {
      const pos = queue.shift();
      filled.push(pos);
      const px = pos % w;
      const py = Math.floor(pos / w);
      const fromPi = parentPi[pos] >= 0 ? parentPi[pos] : seedPi;

      const neighbors = [
        px > 0     ? pos - 1 : -1,
        px < w - 1 ? pos + 1 : -1,
        py > 0     ? pos - w : -1,
        py < h - 1 ? pos + w : -1,
      ];
      for (const n of neighbors) {
        if (n < 0 || visited[n]) continue;
        const npi = n * 4;
        if (seedMatch(npi) && noStrongEdge(fromPi, npi)) {
          visited[n] = 1;
          parentPi[n] = pos * 4; // store pixel byte offset of parent
          queue.push(n);
        }
      }
    }

    const maskCtx = mask.getContext("2d");
    maskCtx.globalCompositeOperation = "source-over";
    maskCtx.fillStyle = "rgba(255,255,255,0.85)";
    for (const pos of filled) {
      const px = pos % w;
      const py = Math.floor(pos / w);
      maskCtx.fillRect(px, py, 1, 1);
    }
    maskCtx.globalCompositeOperation = "source-over";

    redraw();
  };

  const startPaint = (e) => {
    e.preventDefault();
    if (tool === "select") {
      saveUndo();
      autoSelectWall(e);
      return;
    }
    saveUndo();
    setIsPainting(true);
    paint(e);
  };

  const stopPaint = () => setIsPainting(false);

  const clearMask = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    redraw();
  };

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 900;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        setImageSize({ w, h });
        imgRef.current = img;
        setTimeout(() => {
          if (canvasRef.current) {
            canvasRef.current.width = w;
            canvasRef.current.height = h;
            canvasRef.current.getContext("2d").clearRect(0, 0, w, h);
          }
          if (displayRef.current) {
            displayRef.current.width = w;
            displayRef.current.height = h;
          }
          redraw();
        }, 50);
      };
      img.src = e.target.result;
      setImage(e.target.result);
      setStep(2);
    };
    reader.readAsDataURL(file);
  };

  const downloadResult = () => {
    const link = document.createElement("a");
    link.download = `SM_Paint_${selectedShade?.name || "preview"}.jpg`;
    link.href = displayRef.current.toDataURL("image/jpeg", 0.92);
    link.click();
  };

  const reset = () => {
    setImage(null); setSelectedShade(null);
    setOpacity(0.5); setStep(1); setTool("brush");
    imgRef.current = null;
  };

  const saveDesign = () => {
    const mask = canvasRef.current;
    const maskData = mask ? mask.toDataURL("image/png") : null;
    const display = displayRef.current;
    const thumbnail = display ? display.toDataURL("image/jpeg", 0.5) : null;
    const design = {
      id: Date.now().toString(),
      name: `Design ${new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`,
      timestamp: Date.now(),
      image,
      maskData,
      thumbnail,
      shade: selectedShade,
      opacity,
      imageSize,
    };
    const updated = [design, ...savedDesigns];
    setSavedDesigns(updated);
    localStorage.setItem("sm_paint_designs", JSON.stringify(updated));
  };

  const loadDesign = (design) => {
    setSelectedShade(design.shade);
    setOpacity(design.opacity || 0.5);
    setImageSize(design.imageSize);
    setImage(design.image);
    setStep(3);
    setShowSavedPanel(false);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setTimeout(() => {
        const mask = canvasRef.current;
        const display = displayRef.current;
        if (mask && display) {
          mask.width = design.imageSize.w;
          mask.height = design.imageSize.h;
          display.width = design.imageSize.w;
          display.height = design.imageSize.h;
          if (design.maskData) {
            const maskImg = new Image();
            maskImg.onload = () => {
              mask.getContext("2d").clearRect(0, 0, mask.width, mask.height);
              mask.getContext("2d").drawImage(maskImg, 0, 0);
              redraw();
            };
            maskImg.src = design.maskData;
          } else {
            mask.getContext("2d").clearRect(0, 0, mask.width, mask.height);
            redraw();
          }
        }
      }, 80);
    };
    img.src = design.image;
  };

  const deleteDesign = (id) => {
    const updated = savedDesigns.filter(d => d.id !== id);
    setSavedDesigns(updated);
    localStorage.setItem("sm_paint_designs", JSON.stringify(updated));
  };

  const commitRename = (id) => {
    const updated = savedDesigns.map(d => d.id === id ? { ...d, name: renameVal || d.name } : d);
    setSavedDesigns(updated);
    localStorage.setItem("sm_paint_designs", JSON.stringify(updated));
    setRenamingId(null);
  };

  // Renders the current image+mask with a given shade into a data URL (for compare grid)
  const renderShadeToDataURL = useCallback((shade) => {
    const mask = canvasRef.current;
    const img = imgRef.current;
    if (!mask || !img) return null;
    const w = mask.width, h = mask.height;
    const offscreen = document.createElement("canvas");
    offscreen.width = w; offscreen.height = h;
    const ctx = offscreen.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    const maskCtx = mask.getContext("2d");
    const maskData = maskCtx.getImageData(0, 0, w, h);
    const out = ctx.getImageData(0, 0, w, h);
    const { r: paintR, g: paintG, b: paintB } = hexToRgb(shade.hex);
    for (let i = 0; i < maskData.data.length; i += 4) {
      const alpha = maskData.data[i + 3] / 255;
      if (alpha > 0) {
        const [nR,nG,nB] = applyRealisticPaint(
          out.data[i], out.data[i+1], out.data[i+2],
          paintR, paintG, paintB,
          alpha * opacity, renderMode
        );
        out.data[i] = nR; out.data[i+1] = nG; out.data[i+2] = nB;
      }
    }
    ctx.putImageData(out, 0, 0);
    return offscreen.toDataURL("image/jpeg", 0.85);
  }, [opacity, renderMode]);

  const addToCompare = (shade) => {
    setCompareShades(prev => {
      if (prev.find(s => s.name === shade.name)) return prev; // already added
      if (prev.length >= 4) return prev; // max 4
      return [...prev, shade];
    });
  };


  // Renders a split-wall image: left half = shadeA, right half = shadeB
  const renderSplitToDataURL = useCallback((shadeA, shadeB, dividerRatio = 0.5) => {
    const mask = canvasRef.current;
    const img = imgRef.current;
    if (!mask || !img || !shadeA || !shadeB) return null;
    const w = mask.width, h = mask.height;
    const offscreen = document.createElement("canvas");
    offscreen.width = w; offscreen.height = h;
    const ctx = offscreen.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    const maskCtx = mask.getContext("2d");
    const maskData = maskCtx.getImageData(0, 0, w, h);
    const out = ctx.getImageData(0, 0, w, h);
    const { r: aR, g: aG, b: aB } = hexToRgb(shadeA.hex);
    const { r: bR, g: bG, b: bB } = hexToRgb(shadeB.hex);
    const split = Math.round(w * dividerRatio);
    for (let i = 0; i < maskData.data.length; i += 4) {
      const alpha = maskData.data[i + 3] / 255;
      if (alpha > 0) {
        const px = (i / 4) % w;
        const useLeft = px < split;
        const [nR,nG,nB] = applyRealisticPaint(
          out.data[i], out.data[i+1], out.data[i+2],
          useLeft ? aR : bR, useLeft ? aG : bG, useLeft ? aB : bB,
          alpha * opacity, renderMode
        );
        out.data[i] = nR; out.data[i+1] = nG; out.data[i+2] = nB;
      }
    }
    ctx.putImageData(out, 0, 0);
    // Solid white divider line
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(split, 0); ctx.lineTo(split, h); ctx.stroke();
    // Handle circle on divider
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath(); ctx.arc(split, h/2, 14, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#0D1B3E";
    ctx.font = "bold 13px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⇔", split, h/2 + 5);
    ctx.textAlign = "left";
    // LEFT label pill
    const fSize = Math.max(11, Math.round(w * 0.016));
    ctx.font = `bold ${fSize}px Georgia, serif`;
    const aW = ctx.measureText(shadeA.name).width;
    const bW = ctx.measureText(shadeB.name).width;
    const PAD = 10, PH = fSize + 10;
    // Left pill
    ctx.fillStyle = "rgba(13,27,62,0.82)";
    roundRect(ctx, 10, 10, aW + PAD*2, PH, 5); ctx.fill();
    ctx.strokeStyle = "rgba(200,170,80,0.6)"; ctx.lineWidth = 1;
    roundRect(ctx, 10, 10, aW + PAD*2, PH, 5); ctx.stroke();
    ctx.fillStyle = "#E8CC70";
    ctx.fillText(shadeA.name, 10 + PAD, 10 + PH - 6);
    // Swatch dot left
    ctx.beginPath(); ctx.arc(10 + PAD + aW + 6, 10 + PH/2, 5, 0, Math.PI*2);
    ctx.fillStyle = shadeA.hex; ctx.fill();
    // Right pill
    ctx.font = `bold ${fSize}px Georgia, serif`;
    ctx.fillStyle = "rgba(13,27,62,0.82)";
    roundRect(ctx, split + 10, 10, bW + PAD*2, PH, 5); ctx.fill();
    ctx.strokeStyle = "rgba(200,170,80,0.6)"; ctx.lineWidth = 1;
    roundRect(ctx, split + 10, 10, bW + PAD*2, PH, 5); ctx.stroke();
    ctx.fillStyle = "#E8CC70";
    ctx.fillText(shadeB.name, split + 10 + PAD, 10 + PH - 6);
    ctx.beginPath(); ctx.arc(split + 10 + PAD + bW + 6, 10 + PH/2, 5, 0, Math.PI*2);
    ctx.fillStyle = shadeB.hex; ctx.fill();
    return offscreen.toDataURL("image/jpeg", 0.9);
  }, [opacity, renderMode]);

  // Helper for rounded rect (canvas has no native roundRect in all browsers)
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
  }

  const removeFromCompare = (name) => setCompareShades(prev => prev.filter(s => s.name !== name));

  // Build a branded share card PNG on an offscreen canvas
  const generateShareCard = useCallback(async () => {
    const display = displayRef.current;
    const img = imgRef.current;
    if (!display || !img || !selectedShade) return;

    const roomW = display.width;
    const roomH = display.height;
    const FOOTER = 110;        // height of branded strip below the photo
    const CARD_W = roomW;
    const CARD_H = roomH + FOOTER;

    const card = document.createElement("canvas");
    card.width = CARD_W;
    card.height = CARD_H;
    const ctx = card.getContext("2d");

    // ── room preview (same pixel data already on displayRef) ──────────────────
    ctx.drawImage(display, 0, 0, roomW, roomH);

    // ── footer background ─────────────────────────────────────────────────────
    ctx.fillStyle = "#0D1B3E";
    ctx.fillRect(0, roomH, CARD_W, FOOTER);

    // thin gold top border on footer
    ctx.fillStyle = "#C8AA50";
    ctx.fillRect(0, roomH, CARD_W, 2);

    // ── shade swatch circle ───────────────────────────────────────────────────
    const swatchX = 48, swatchY = roomH + FOOTER / 2;
    ctx.beginPath();
    ctx.arc(swatchX, swatchY, 28, 0, Math.PI * 2);
    ctx.fillStyle = selectedShade.hex;
    ctx.fill();
    ctx.strokeStyle = "rgba(200,170,80,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // ── shade name + code ─────────────────────────────────────────────────────
    const textX = swatchX + 44;
    ctx.fillStyle = "#F5F0E8";
    ctx.font = `bold ${Math.round(CARD_W * 0.022)}px Georgia, serif`;
    ctx.fillText(selectedShade.name, textX, swatchY - 8);

    ctx.fillStyle = "rgba(245,240,232,0.45)";
    ctx.font = `${Math.round(CARD_W * 0.016)}px Georgia, serif`;
    ctx.fillText(`Code: ${selectedShade.code}  ·  ${selectedShade.hex}`, textX, swatchY + 14);

    // ── SM Paints logo (real image, right-aligned in footer) ────────────────────
    await new Promise((resolve) => {
      const logoImg = new Image();
      logoImg.onload = () => {
        // Target height = FOOTER - 24px padding; maintain aspect ratio
        const logoH = FOOTER - 24;
        const logoW = logoImg.width * (logoH / logoImg.height);
        const logoX = CARD_W - logoW - 16;
        const logoY = roomH + (FOOTER - logoH) / 2;
        ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
        resolve();
      };
      logoImg.onerror = resolve; // fallback: skip logo if it fails
      logoImg.src = SM_LOGO_SRC;
    });

    return card.toDataURL("image/png");
  }, [selectedShade, opacity]);

  const openShareModal = async () => {
    const url = await generateShareCard();
    if (url) { setShareDataUrl(url); setShowShare(true); }
  };

  const handleNativeShare = async () => {
    if (!shareDataUrl) return;
    try {
      const res = await fetch(shareDataUrl);
      const blob = await res.blob();
      const file = new File([blob], `SM_Paint_${selectedShade?.name || "design"}.png`, { type: "image/png" });
      await navigator.share({ title: `SM Paints – ${selectedShade?.name}`, text: `Check out this wall colour: ${selectedShade?.name} (${selectedShade?.code})`, files: [file] });
    } catch {
      // fallback: just download
      const a = document.createElement("a");
      a.download = `SM_Paint_${selectedShade?.name || "design"}.png`;
      a.href = shareDataUrl; a.click();
    }
  };

  const handleDownloadShare = () => {
    if (!shareDataUrl) return;
    const a = document.createElement("a");
    a.download = `SM_Paint_${selectedShade?.name || "design"}.png`;
    a.href = shareDataUrl; a.click();
  };

  const goldBtn = {
    background: "linear-gradient(135deg,#C8AA50,#E8CC70)",
    border: "none", borderRadius: 8, padding: "8px 18px",
    color: "#0D1B3E", fontSize: 13, fontWeight: "bold",
    cursor: "pointer", letterSpacing: 0.5,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0D1B3E", fontFamily: "'Georgia',serif", color: "#F5F0E8" }}>

      {/* Header */}
      <header style={{ padding: "0.65rem 1.5rem", borderBottom: "1px solid rgba(200,170,80,0.18)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(8,16,40,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <img src={SM_LOGO_SRC} alt="SM Paints" style={{ height: 44, width: "auto", objectFit: "contain" }} />
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
          {image && (
            <button onClick={saveDesign} style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "linear-gradient(135deg,#C8AA50,#E8CC70)", border: "none", color: "#0D1B3E", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: "700", letterSpacing: 0.3, boxShadow: "0 2px 8px rgba(200,170,80,0.3)" }}>
              💾 Save
            </button>
          )}
          <button onClick={() => setShowSavedPanel(v => !v)} style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: showSavedPanel ? "rgba(200,170,80,0.15)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(200,170,80,0.35)", color: "#C8AA50", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, transition: "all 0.2s" }}>
            🗂 {savedDesigns.length > 0 ? `Saved (${savedDesigns.length})` : "Saved"}
          </button>
          {image && compareShades.length > 0 && (
            <button onClick={() => setShowCompare(true)} style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(200,170,80,0.08)", border: "1px solid rgba(200,170,80,0.3)", color: "#C8AA50", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>
              ⊞ Compare ({compareShades.length})
            </button>
          )}
          {image && <button onClick={reset} style={{ background: "transparent", border: "1px solid rgba(200,170,80,0.25)", color: "rgba(200,170,80,0.6)", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, transition: "all 0.2s" }}>↺ Reset</button>}
        </div>
      </header>

      {/* Steps bar */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0", padding: "0.7rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}>
        {[{ n: 1, label: "Upload Photo", icon: "📷" }, { n: 2, label: "Select Wall", icon: "✨" }, { n: 3, label: "Visualize", icon: "🎨" }].map(({ n, label, icon }, idx) => (
          <div key={n} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.3rem 0.8rem", borderRadius: 20,
              background: step >= n ? "rgba(200,170,80,0.12)" : "transparent",
              border: step >= n ? "1px solid rgba(200,170,80,0.3)" : "1px solid transparent",
              transition: "all 0.3s" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%",
                background: step > n ? "#C8AA50" : step === n ? "linear-gradient(135deg,#C8AA50,#E8CC70)" : "rgba(255,255,255,0.08)",
                color: step >= n ? "#0D1B3E" : "rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: "bold", flexShrink: 0 }}>
                {step > n ? "✓" : n}
              </div>
              <span style={{ fontSize: 11, fontWeight: step === n ? "bold" : "normal", color: step === n ? "#E8CC70" : step > n ? "rgba(200,170,80,0.7)" : "rgba(255,255,255,0.25)", transition: "color 0.3s", whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {idx < 2 && <div style={{ width: 32, height: 1, background: "rgba(200,170,80,0.2)", margin: "0 0.1rem" }} />}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: "2rem" }}>
            {/* Hero text */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#C8AA50", letterSpacing: 4, marginBottom: "0.75rem", opacity: 0.8 }}>PAINT VISUALIZER</div>
              <h1 style={{ fontSize: 32, fontWeight: "300", margin: "0 0 0.5rem", letterSpacing: 1, lineHeight: 1.2 }}>See your wall in any colour</h1>
              <p style={{ color: "rgba(245,240,232,0.4)", fontSize: 14, margin: 0 }}>Upload a photo · Select your wall · Pick a shade</p>
            </div>
            {/* Upload cards */}
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", justifyContent: "center" }}>
              {[
                { ref: cameraInputRef, icon: "📷", label: "Take Photo", sub: "Open camera" },
                { ref: fileInputRef, icon: "🖼️", label: "Upload Photo", sub: "From gallery" },
              ].map(({ ref, icon, label, sub }, i) => (
                <div key={i} onClick={() => ref.current?.click()}
                  style={{ width: 180, height: 160, border: "1.5px dashed rgba(200,170,80,0.3)", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer",
                    background: "linear-gradient(135deg,rgba(200,170,80,0.05),rgba(200,170,80,0.02))", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#C8AA50"; e.currentTarget.style.background="rgba(200,170,80,0.08)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(200,170,80,0.3)"; e.currentTarget.style.background="linear-gradient(135deg,rgba(200,170,80,0.05),rgba(200,170,80,0.02))"; e.currentTarget.style.transform="none"; }}>
                  <div style={{ fontSize: 36, lineHeight: 1 }}>{icon}</div>
                  <div style={{ fontSize: 14, color: "#E8CC70", fontWeight: "600" }}>{label}</div>
                  <div style={{ fontSize: 11, color: "rgba(245,240,232,0.3)" }}>{sub}</div>
                </div>
              ))}
            </div>
            {/* Feature badges */}
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center" }}>
              {["✨ Smart Wall Select","🎨 80+ Shades","⊡ Split Compare","📊 LAB Analysis","💾 Save Designs"].map(f => (
                <span key={f} style={{ fontSize: 10, color: "rgba(200,170,80,0.6)", border: "1px solid rgba(200,170,80,0.2)", borderRadius: 20, padding: "3px 10px", background: "rgba(200,170,80,0.04)" }}>{f}</span>
              ))}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          </div>
        )}

        {/* STEP 2 & 3 — Main workspace */}
        {step >= 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.25rem", alignItems: "start" }}>

            {/* Canvas area */}
            <div>
              {/* Active shade pill */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                {selectedShade ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(200,170,80,0.1)", border: "1px solid rgba(200,170,80,0.25)", borderRadius: 20, padding: "4px 12px 4px 6px" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: selectedShade.hex, border: "1.5px solid rgba(200,170,80,0.5)", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#E8CC70", fontWeight: "600", letterSpacing: 0.5 }}>{selectedShade.name}</span>
                    <span style={{ fontSize: 9, color: "rgba(200,170,80,0.45)" }}>{selectedShade.code}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: "rgba(245,240,232,0.3)", letterSpacing: 1 }}>SELECT A SHADE TO BEGIN</div>
                )}
              </div>

              {/* Toolbar */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.7rem", padding: "0.5rem 0.65rem", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" }}>
                {/* Tool group */}
                <div style={{ display: "flex", gap: "0.25rem", background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "2px" }}>
                  {[
                    { id: "brush",  icon: "🖌", label: "Brush"  },
                    { id: "eraser", icon: "✏️", label: "Eraser" },
                    { id: "select", icon: "✨", label: "Select"  },
                  ].map(t => (
                    <button key={t.id} onClick={() => setTool(t.id)}
                      style={{ padding: "5px 11px", borderRadius: 6, fontSize: 12, fontWeight: t.id===tool?"700":"400", cursor: "pointer", border: "none", transition: "all 0.15s",
                        background: tool===t.id ? "linear-gradient(135deg,#C8AA50,#E8CC70)" : "transparent",
                        color: tool===t.id ? "#0D1B3E" : "rgba(245,240,232,0.5)" }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
                {/* Divider */}
                <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.08)" }} />
                {/* Secondary actions */}
                <button onClick={undo} title="Undo" style={{ padding: "5px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: "1px solid rgba(200,170,80,0.2)", background: "transparent", color: "rgba(200,170,80,0.6)", transition: "all 0.15s" }}>↩</button>
                <button onClick={clearMask} style={{ padding: "5px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: "1px solid rgba(255,80,80,0.2)", background: "transparent", color: "rgba(255,100,100,0.7)", transition: "all 0.15s" }}>🗑</button>
                {/* Before/After */}
                <button onClick={() => setShowBefore(v => !v)}
                  style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: "600", cursor: "pointer", transition: "all 0.2s", letterSpacing: 0.3,
                    border: showBefore ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(200,170,80,0.25)",
                    background: showBefore ? "rgba(255,255,255,0.12)" : "transparent",
                    color: showBefore ? "#FFFFFF" : "rgba(200,170,80,0.6)" }}>
                  {showBefore ? "◀ Before" : "After ▶"}
                </button>
                {/* Slider */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginLeft: "auto" }}>
                  <span style={{ fontSize: 10, color: "rgba(245,240,232,0.35)", whiteSpace: "nowrap" }}>{tool === "select" ? "Tolerance" : "Brush"}</span>
                  <input type="range"
                    min={tool === "select" ? 10 : 8}
                    max={tool === "select" ? 90 : 80}
                    step={tool === "select" ? 1 : 4}
                    value={tool === "select" ? tolerance : brushSize}
                    onChange={e => tool === "select" ? setTolerance(parseInt(e.target.value)) : setBrushSize(parseInt(e.target.value))}
                    style={{ width: 80, accentColor: "#C8AA50" }} />
                  <span style={{ fontSize: 11, color: "#E8CC70", minWidth: 22, textAlign: "right" }}>{tool === "select" ? tolerance : brushSize}</span>
                </div>
              </div>

              {/* Canvas stack */}
              <div style={{ position: "relative", display: "inline-block", width: "100%", borderRadius: 12, overflow: "hidden", cursor: tool === "eraser" ? "cell" : tool === "select" ? "pointer" : "crosshair" }}>
                <canvas ref={displayRef} style={{ display: "block", width: "100%", borderRadius: 12 }} />
                <canvas
                  ref={canvasRef}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, borderRadius: 12 }}
                  onMouseDown={startPaint}
                  onMouseMove={paint}
                  onMouseUp={stopPaint}
                  onMouseLeave={stopPaint}
                  onTouchStart={startPaint}
                  onTouchMove={paint}
                  onTouchEnd={stopPaint}
                />
              </div>

              {/* Hint */}
              {!selectedShade && (
                <div style={{ marginTop: "0.65rem", padding: "0.6rem 1rem", background: "rgba(200,170,80,0.06)", borderRadius: 8, border: "1px solid rgba(200,170,80,0.15)", fontSize: 11, color: "rgba(245,240,232,0.4)", textAlign: "center", letterSpacing: 0.3 }}>
                  Pick a shade from the panel → then brush or select your wall
                </div>
              )}

              {/* Intensity + Rendering + Actions */}
              {selectedShade && (
                <div style={{ marginTop: "0.7rem", background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "0.85rem 1rem", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {/* Intensity row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
                    <span style={{ fontSize: 11, color: "rgba(245,240,232,0.5)", whiteSpace: "nowrap" }}>Intensity</span>
                    <input type="range" min="10" max="90" step="1" value={Math.round(opacity * 100)} onChange={e => setOpacity(parseInt(e.target.value) / 100)} style={{ flex: 1, accentColor: "#C8AA50" }} />
                    <span style={{ fontSize: 12, color: "#E8CC70", fontWeight: "bold", minWidth: 30, textAlign: "right" }}>{Math.round(opacity * 100)}%</span>
                  </div>
                  {/* Rendering mode + actions row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 10, color: "rgba(245,240,232,0.35)" }}>Mode:</span>
                    {["realistic","vibrant"].map(mode => (
                      <button key={mode} onClick={() => setRenderMode(mode)}
                        style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: "600", cursor: "pointer", transition: "all 0.15s",
                          border: renderMode===mode ? "1px solid #C8AA50" : "1px solid rgba(200,170,80,0.2)",
                          background: renderMode===mode ? "rgba(200,170,80,0.15)" : "transparent",
                          color: renderMode===mode ? "#E8CC70" : "rgba(245,240,232,0.35)" }}>
                        {mode.charAt(0).toUpperCase()+mode.slice(1)}
                      </button>
                    ))}
                    <div style={{ marginLeft: "auto", display: "flex", gap: "0.4rem" }}>
                      <button onClick={downloadResult} style={{ ...goldBtn, padding: "6px 14px", fontSize: 12 }}>↓ Download</button>
                      <button onClick={openShareModal} style={{ padding: "6px 14px", background: "rgba(200,170,80,0.1)", border: "1px solid rgba(200,170,80,0.35)", borderRadius: 8, color: "#C8AA50", fontSize: 12, fontWeight: "700", cursor: "pointer" }}>↗ Share</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Shade picker panel */}
            <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              {/* Panel header */}
              <div style={{ padding: "0.7rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(200,170,80,0.05)" }}>
                <div style={{ fontSize: 10, color: "#C8AA50", letterSpacing: 2.5, fontWeight: "700" }}>CHOOSE A SHADE</div>
              </div>
              <div style={{ padding: "0.75rem" }}>
              {/* Category tabs — horizontal scrollable pills */}
              <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.75rem", overflowX: "auto", paddingBottom: "2px" }}>
                {Object.keys(SHADES).map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    style={{ padding: "4px 11px", borderRadius: 20, fontSize: 10, fontWeight: "600", whiteSpace: "nowrap", cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
                      border: activeCategory===cat ? "1px solid #C8AA50" : "1px solid rgba(255,255,255,0.1)",
                      background: activeCategory===cat ? "rgba(200,170,80,0.15)" : "rgba(255,255,255,0.03)",
                      color: activeCategory===cat ? "#E8CC70" : "rgba(245,240,232,0.4)" }}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* Shade swatches */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.4rem", maxHeight: 380, overflowY: "auto" }}>
                {SHADES[activeCategory].map(shade => {
                  const isSelected = selectedShade?.name === shade.name;
                  return (
                    <div key={shade.name} onClick={() => { setSelectedShade(shade); setStep(3); }} title={`${shade.name} (${shade.code})`}
                      style={{ borderRadius: 8, overflow: "hidden", cursor: "pointer", transition: "all 0.18s",
                        border: isSelected ? "2px solid #E8CC70" : "1.5px solid rgba(255,255,255,0.06)",
                        transform: isSelected ? "scale(1.05)" : "scale(1)",
                        boxShadow: isSelected ? "0 0 12px rgba(200,170,80,0.35)" : "0 1px 4px rgba(0,0,0,0.3)" }}>
                      <div style={{ height: 46, background: shade.hex }} />
                      <div style={{ padding: "3px 4px", background: "rgba(0,0,0,0.35)", fontSize: 8.5, color: isSelected ? "#E8CC70" : "rgba(245,240,232,0.65)", textAlign: "center", lineHeight: 1.4, fontWeight: isSelected ? "700" : "400" }}>
                        {shade.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected shade info + Compare */}
              {selectedShade && (
                <>
                  <div style={{ marginTop: "0.75rem", padding: "0.65rem 0.75rem", background: "linear-gradient(135deg,rgba(200,170,80,0.1),rgba(200,170,80,0.04))", borderRadius: 8, border: "1px solid rgba(200,170,80,0.25)", display: "flex", alignItems: "center", gap: "0.65rem" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: selectedShade.hex, border: "2px solid rgba(200,170,80,0.45)", flexShrink: 0, boxShadow: `0 0 12px ${selectedShade.hex}44` }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: "700", color: "#F5F0E8", letterSpacing: 0.2 }}>{selectedShade.name}</div>
                      <div style={{ fontSize: 9.5, color: "rgba(245,240,232,0.4)", marginTop: 2 }}>{selectedShade.hex} · Code: {selectedShade.code}</div>
                    </div>
                  </div>

                  {/* Shade Comparison Analysis */}
                  {(() => {
                    // Flatten all catalog shades
                    const allShades = Object.values(SHADES).flat();
                    const similar = findSimilarShades(selectedShade, allShades, 5);
                    return (
                      <div style={{ marginTop: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                        {/* Header */}
                        <div style={{ padding: "0.55rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ fontSize: 10, color: "#C8AA50", letterSpacing: 1.5, fontWeight: "bold" }}>🔍 HOW THIS SHADE COMPARES</span>
                        </div>
                        {/* Comparison rows */}
                        {similar.map(({ shade, bullets }) => (
                          <div key={shade.name} style={{ padding: "0.55rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            {/* Shade identity row */}
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                              <div style={{ width: 22, height: 22, borderRadius: 4, background: shade.hex, border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: 11, fontWeight: "bold", color: "#F5F0E8" }}>{shade.name}</span>
                                <span style={{ fontSize: 9, color: "rgba(245,240,232,0.35)", marginLeft: 6 }}>{shade.code}</span>
                              </div>
                            </div>
                            {/* Comparison bullets */}
                            <div style={{ paddingLeft: "1.6rem" }}>
                              {bullets.map((b, i) => (
                                <div key={i} style={{ fontSize: 9, color: "rgba(245,240,232,0.55)", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: "0.3rem" }}>
                                  <span style={{ color: "#C8AA50", flexShrink: 0 }}>·</span>{b}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  {/* Compare slot chips */}
                  <div style={{ marginTop: "0.6rem" }}>
                    <div style={{ fontSize: 10, color: "rgba(245,240,232,0.35)", letterSpacing: 1, marginBottom: "0.35rem" }}>COMPARE SHADES ({compareShades.length}/4)</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.4rem" }}>
                      {compareShades.map(s => (
                        <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(200,170,80,0.3)", borderRadius: 20, padding: "2px 8px 2px 5px", fontSize: 10, color: "#E8CC70" }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.hex, flexShrink: 0 }} />
                          {s.name}
                          <span onClick={() => removeFromCompare(s.name)} style={{ cursor: "pointer", color: "rgba(245,240,232,0.35)", marginLeft: 2, fontSize: 11 }}>✕</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        onClick={() => addToCompare(selectedShade)}
                        disabled={compareShades.length >= 4 || compareShades.find(s => s.name === selectedShade.name)}
                        style={{ flex: 1, background: compareShades.find(s => s.name === selectedShade.name) ? "rgba(255,255,255,0.04)" : "rgba(200,170,80,0.12)", border: "1px solid rgba(200,170,80,0.35)", borderRadius: 6, padding: "5px 0", color: compareShades.find(s => s.name === selectedShade.name) ? "rgba(200,170,80,0.35)" : "#C8AA50", fontSize: 11, cursor: compareShades.length >= 4 || compareShades.find(s => s.name === selectedShade.name) ? "default" : "pointer" }}
                      >
                        {compareShades.find(s => s.name === selectedShade.name) ? "✓ Added" : compareShades.length >= 4 ? "Max 4 reached" : "+ Add to Compare"}
                      </button>
                      {compareShades.length >= 2 && (
                        <button onClick={() => setShowCompare(true)} style={{ background: "linear-gradient(135deg,#C8AA50,#E8CC70)", border: "none", borderRadius: 6, padding: "5px 10px", color: "#0D1B3E", fontSize: 11, fontWeight: "bold", cursor: "pointer" }}>
                          ⊞ View
                        </button>
                      )}
                      {selectedShade && compareShades.length >= 1 && (
                        <button onClick={() => { setSplitShadeB(compareShades[0]); setShowSplit(true); }} style={{ background: "rgba(200,170,80,0.15)", border: "1px solid rgba(200,170,80,0.4)", borderRadius: 6, padding: "5px 10px", color: "#C8AA50", fontSize: 11, fontWeight: "bold", cursor: "pointer" }} title="Split wall: current shade vs first compare shade">
                          ⊡ Split
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Designer Paint Combinations — category filtered */}
                  {(() => {
                    // Map each category to collection ids from the shade card
                    const CAT_MAP = {
                      "Neutrals":      ["warm-inviting","warm-vibrant","warm-sophisticated","warm-neutral-elegance","golden-luxury","earthy-sophistication"],
                      "Reds & Oranges":["warm-inviting-red","warm-vibrant-orange","warm-sophisticated-terracotta"],
                      "Pinks":         ["warm-inviting-pink","warm-vibrant-coral","warm-sophisticated-pink"],
                      "Blues":         ["warm-inviting-blue","warm-vibrant-blue","warm-sophisticated-blue"],
                      "Greens":        ["naturally-balanced","earthy-harmony","calm-sophistication"],
                    };

                    // Auto-detect default category from selected shade hex
                    const detectCategory = (hex) => {
                      const r = parseInt(hex.slice(1,3),16);
                      const g = parseInt(hex.slice(3,5),16);
                      const b = parseInt(hex.slice(5,7),16);
                      const max = Math.max(r,g,b), min = Math.min(r,g,b);
                      const l = (max+min)/2/255;
                      if (max === min) return "Neutrals";
                      const s = max===min ? 0 : (l>0.5 ? (max-min)/(2*255-max-min) : (max-min)/(max+min));
                      // low saturation = neutral
                      if (s < 0.12) return "Neutrals";
                      // hue
                      let h = 0;
                      if (max===r) h = ((g-b)/(max-min)+6)%6*60;
                      else if (max===g) h = ((b-r)/(max-min)+2)*60;
                      else h = ((r-g)/(max-min)+4)*60;
                      if (h<20||h>=340)  return "Reds & Oranges";
                      if (h<50)          return "Reds & Oranges";
                      if (h<80)          return "Neutrals"; // yellow → neutrals
                      if (h<165)         return "Greens";
                      if (h<255)         return "Blues";
                      if (h<290)         return "Blues";
                      return "Pinks";
                    };

                    // Set default category when shade changes (one-time derivation)
                    const autocat = detectCategory(selectedShade.hex);

                    const CATS = ["Neutrals","Reds & Oranges","Pinks","Blues","Greens"];
                    const activeCat = designerCategory;
                    const shownIds = CAT_MAP[activeCat] || [];
                    const shown = DESIGNER_COLLECTIONS.filter(c => shownIds.includes(c.id));

                    return (
                      <div style={{ marginTop: "0.85rem" }}>
                        <div style={{ fontSize: 10, color: "#C8AA50", letterSpacing: 2, marginBottom: "0.4rem" }}>✦ DESIGNER PAINT COMBINATIONS</div>
                        <div style={{ fontSize: 9, color: "rgba(245,240,232,0.35)", marginBottom: "0.55rem" }}>Curated from the SM Paints shade card · Auto-suggested: <span style={{color:"rgba(200,170,80,0.7)"}}>{autocat}</span></div>

                        {/* Category filter tabs */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.7rem" }}>
                          {CATS.map(cat => (
                            <button key={cat} onClick={() => setDesignerCategory(cat)}
                              style={{ padding: "3px 9px", borderRadius: 20, fontSize: 9, fontWeight: "bold", cursor: "pointer", letterSpacing: 0.3, transition: "all 0.18s",
                                border: activeCat===cat ? "1px solid #C8AA50" : "1px solid rgba(200,170,80,0.25)",
                                background: activeCat===cat ? "rgba(200,170,80,0.18)" : "transparent",
                                color: activeCat===cat ? "#E8CC70" : "rgba(245,240,232,0.4)" }}>
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Collection cards */}
                        {shown.map(col => {
                          // Build shade objects compatible with setSelectedShade
                          const ds1 = { name: col.shades[0].name, hex: col.shades[0].hex, code: "Designer" };
                          const ds2 = { name: col.shades[1].name, hex: col.shades[1].hex, code: "Designer" };
                          const btnBase = { border: "none", borderRadius: 5, padding: "4px 8px", fontSize: 9, fontWeight: "bold", cursor: "pointer", letterSpacing: 0.3 };
                          return (
                            <div key={col.id} style={{ background: "linear-gradient(135deg,rgba(200,170,80,0.06),rgba(200,170,80,0.02))", border: "1px solid rgba(200,170,80,0.22)", borderRadius: 10, padding: "0.75rem", marginBottom: "0.6rem" }}>
                              <div style={{ fontSize: 12, fontWeight: "bold", color: "#E8CC70", marginBottom: "2px", letterSpacing: 0.4 }}>{col.collection}</div>
                              <div style={{ fontSize: 10, color: "rgba(245,240,232,0.45)", fontStyle: "italic", marginBottom: "0.55rem" }}>{col.mood}</div>

                              {/* Shade swatches */}
                              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.55rem" }}>
                                {col.shades.map((s, si) => {
                                  const ds = si === 0 ? ds1 : ds2;
                                  const isActive = selectedShade && selectedShade.hex === ds.hex;
                                  return (
                                    <div key={s.name} style={{ flex: 1, background: "rgba(0,0,0,0.2)", borderRadius: 7, overflow: "hidden",
                                      border: isActive ? "2px solid #E8CC70" : "1px solid rgba(255,255,255,0.07)",
                                      transform: isActive ? "scale(1.03)" : "scale(1)", transition: "all 0.15s" }}>
                                      <div style={{ height: 36, background: s.hex }} />
                                      <div style={{ padding: "4px 5px" }}>
                                        <div style={{ fontSize: 9, fontWeight: "bold", color: "#F5F0E8", lineHeight: 1.3 }}>{s.name}</div>
                                        <div style={{ fontSize: 8, color: "rgba(245,240,232,0.4)", lineHeight: 1.3, marginTop: 1 }}>{s.desc}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Action buttons */}
                              <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.45rem", flexWrap: "wrap" }}>
                                <button
                                  onClick={() => { setSelectedShade(ds1); setStep(3); }}
                                  style={{ ...btnBase, background: selectedShade && selectedShade.hex === ds1.hex ? "linear-gradient(135deg,#C8AA50,#E8CC70)" : "rgba(200,170,80,0.15)",
                                    color: selectedShade && selectedShade.hex === ds1.hex ? "#0D1B3E" : "#C8AA50",
                                    border: "1px solid rgba(200,170,80,0.35)" }}>
                                  🎨 {col.shades[0].name}
                                </button>
                                <button
                                  onClick={() => { setSelectedShade(ds2); setStep(3); }}
                                  style={{ ...btnBase, background: selectedShade && selectedShade.hex === ds2.hex ? "linear-gradient(135deg,#C8AA50,#E8CC70)" : "rgba(200,170,80,0.15)",
                                    color: selectedShade && selectedShade.hex === ds2.hex ? "#0D1B3E" : "#C8AA50",
                                    border: "1px solid rgba(200,170,80,0.35)" }}>
                                  🎨 {col.shades[1].name}
                                </button>
                                <button
                                  onClick={() => { setSplitShadeA(ds1); setSplitShadeB(ds2); setShowSplit(true); }}
                                  style={{ ...btnBase, background: "rgba(255,255,255,0.06)", color: "rgba(245,240,232,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}>
                                  ⊡ Split Compare
                                </button>
                              </div>

                              <div style={{ fontSize: 9, color: "rgba(245,240,232,0.5)", lineHeight: 1.5, borderTop: "1px solid rgba(200,170,80,0.12)", paddingTop: "0.4rem" }}>
                                <span style={{ color: "#C8AA50", fontWeight: "bold" }}>Why it works: </span>{col.why}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </>
              )}
              </div>{/* end padding wrapper */}
            </div>
          </div>
        )}
      </div>

      {/* Split-Wall Comparison Modal */}
      {showSplit && (() => {
        const effA = splitShadeA || selectedShade;
        const effB = splitShadeB;
        if (!effA || !effB) return null;
        const splitUrl = renderSplitToDataURL(effA, effB);
        const QUICK_PAIRS = [
          { aName:"White Silk",   aHex:"#F8F4EE", aCode:"L171",          bName:"Bonewhite",    bHex:"#E8E0D5", bCode:"0964" },
          { aName:"White Silk",   aHex:"#F8F4EE", aCode:"L171",          bName:"Chloe Diamond",bHex:"#F5EEF0", bCode:"8785" },
          { aName:"Bonewhite",    aHex:"#E8E0D5", aCode:"0964",          bName:"Pebble White", bHex:"#EDE0CF", bCode:"L136" },
          { aName:"French Cream", aHex:"#F5DFC0", aCode:"25YY 83/103",   bName:"Pebble White", bHex:"#EDE0CF", bCode:"L136" },
          { aName:"Grey Flannel", aHex:"#C0BCBA", aCode:"8331",          bName:"Aluminium",    bHex:"#B0B4B8", bCode:"8337" },
        ];
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 310, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem" }}
               onClick={e => { if (e.target === e.currentTarget) setShowSplit(false); }}>
            <div style={{ background: "#0D1B3E", borderRadius: 16, border: "1px solid rgba(200,170,80,0.3)", maxWidth: 720, width: "100%", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}>

              {/* Header */}
              <div style={{ padding: "0.9rem 1.25rem", borderBottom: "1px solid rgba(200,170,80,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#0D1B3E", zIndex: 1 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: "bold", color: "#E8CC70", letterSpacing: 1 }}>⊡ SPLIT WALL COMPARISON</div>
                  <div style={{ fontSize: 11, color: "rgba(245,240,232,0.4)", marginTop: 2 }}>
                    <span style={{ color: "#C8AA50" }}>{effA.name}</span> <span style={{color:"rgba(245,240,232,0.3)"}}>vs</span> <span style={{ color: "#C8AA50" }}>{effB.name}</span>
                  </div>
                </div>
                <button onClick={() => setShowSplit(false)} style={{ background: "transparent", border: "none", color: "rgba(245,240,232,0.5)", fontSize: 20, cursor: "pointer" }}>✕</button>
              </div>

              <div style={{ padding: "1rem" }}>

                {/* Split image */}
                {splitUrl
                  ? <img src={splitUrl} alt="Split comparison" style={{ width: "100%", borderRadius: 10, display: "block", border: "1px solid rgba(255,255,255,0.07)" }} />
                  : <div style={{ padding: "2rem", textAlign: "center", color: "rgba(245,240,232,0.3)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10 }}>Paint a wall area first to see the split preview.</div>
                }

                {/* Shade A / B controls */}
                <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.85rem" }}>
                  {/* Shade A */}
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "0.6rem 0.75rem", border: "1px solid rgba(200,170,80,0.2)" }}>
                    <div style={{ fontSize: 9, color: "#C8AA50", letterSpacing: 1, marginBottom: "0.35rem" }}>◀ LEFT (SHADE A)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                      <div style={{ width: 26, height: 26, borderRadius: 5, background: effA.hex, border: "2px solid rgba(200,170,80,0.4)", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: "bold", color: "#F5F0E8" }}>{effA.name}</div>
                        <div style={{ fontSize: 9, color: "rgba(245,240,232,0.4)" }}>{effA.code}</div>
                      </div>
                    </div>
                    {selectedShade && selectedShade.name !== effA.name && (
                      <button onClick={() => setSplitShadeA(selectedShade)}
                        style={{ fontSize: 9, background: "rgba(200,170,80,0.12)", border: "1px solid rgba(200,170,80,0.3)", borderRadius: 5, padding: "3px 7px", color: "#C8AA50", cursor: "pointer" }}>
                        Use current shade here
                      </button>
                    )}
                  </div>
                  {/* Shade B */}
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "0.6rem 0.75rem", border: "1px solid rgba(200,170,80,0.2)" }}>
                    <div style={{ fontSize: 9, color: "#C8AA50", letterSpacing: 1, marginBottom: "0.35rem" }}>▶ RIGHT (SHADE B)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                      <div style={{ width: 26, height: 26, borderRadius: 5, background: effB.hex, border: "2px solid rgba(200,170,80,0.4)", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: "bold", color: "#F5F0E8" }}>{effB.name}</div>
                        <div style={{ fontSize: 9, color: "rgba(245,240,232,0.4)" }}>{effB.code}</div>
                      </div>
                    </div>
                    {selectedShade && selectedShade.name !== effB.name && (
                      <button onClick={() => setSplitShadeB(selectedShade)}
                        style={{ fontSize: 9, background: "rgba(200,170,80,0.12)", border: "1px solid rgba(200,170,80,0.3)", borderRadius: 5, padding: "3px 7px", color: "#C8AA50", cursor: "pointer" }}>
                        Use current shade here
                      </button>
                    )}
                  </div>
                </div>

                {/* Compare against chips from compareShades list */}
                {compareShades.length > 0 && (
                  <div style={{ marginTop: "0.6rem" }}>
                    <div style={{ fontSize: 9, color: "rgba(245,240,232,0.3)", letterSpacing: 1, marginBottom: "0.3rem" }}>SWAP FROM YOUR COMPARE LIST</div>
                    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                      {compareShades.map(s => (
                        <div key={s.name} style={{ display: "flex", gap: "0.25rem" }}>
                          <button onClick={() => setSplitShadeA(s)}
                            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "3px 7px", borderRadius: 20, fontSize: 9, cursor: "pointer",
                              border: effA.name===s.name ? "1px solid #C8AA50" : "1px solid rgba(200,170,80,0.2)",
                              background: effA.name===s.name ? "rgba(200,170,80,0.18)" : "rgba(255,255,255,0.03)",
                              color: effA.name===s.name ? "#E8CC70" : "rgba(245,240,232,0.45)" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.hex }} />◀ {s.name}
                          </button>
                          <button onClick={() => setSplitShadeB(s)}
                            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "3px 7px", borderRadius: 20, fontSize: 9, cursor: "pointer",
                              border: effB.name===s.name ? "1px solid #C8AA50" : "1px solid rgba(200,170,80,0.2)",
                              background: effB.name===s.name ? "rgba(200,170,80,0.18)" : "rgba(255,255,255,0.03)",
                              color: effB.name===s.name ? "#E8CC70" : "rgba(245,240,232,0.45)" }}>
                            ▶ {s.name} <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.hex }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick pair suggestions */}
                <div style={{ marginTop: "0.75rem" }}>
                  <div style={{ fontSize: 9, color: "rgba(245,240,232,0.3)", letterSpacing: 1, marginBottom: "0.35rem" }}>⚡ QUICK PAIRS — SIMILAR LIGHT SHADES</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    {QUICK_PAIRS.map((p, i) => (
                      <button key={i}
                        onClick={() => {
                          setSplitShadeA({ name: p.aName, hex: p.aHex, code: p.aCode });
                          setSplitShadeB({ name: p.bName, hex: p.bHex, code: p.bCode });
                        }}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "6px 10px", borderRadius: 8, cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                          border: (effA.name===p.aName && effB.name===p.bName) ? "1px solid #C8AA50" : "1px solid rgba(255,255,255,0.07)",
                          background: (effA.name===p.aName && effB.name===p.bName) ? "rgba(200,170,80,0.12)" : "rgba(255,255,255,0.03)" }}>
                        <div style={{ width: 18, height: 18, borderRadius: 3, background: p.aHex, border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: "rgba(245,240,232,0.7)", fontWeight: "bold" }}>{p.aName}</span>
                        <span style={{ fontSize: 10, color: "rgba(245,240,232,0.3)" }}>vs</span>
                        <div style={{ width: 18, height: 18, borderRadius: 3, background: p.bHex, border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: "rgba(245,240,232,0.7)", fontWeight: "bold" }}>{p.bName}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Download */}
              <div style={{ padding: "0 1rem 1rem" }}>
                <button onClick={() => { if(!splitUrl) return; const a = document.createElement("a"); a.download = `SM_Split_${effA.name}_vs_${effB.name}.jpg`; a.href = splitUrl; a.click(); }}
                  style={{ width: "100%", background: "linear-gradient(135deg,#C8AA50,#E8CC70)", border: "none", borderRadius: 8, padding: "0.75rem", color: "#0D1B3E", fontSize: 14, fontWeight: "bold", cursor: "pointer" }}>
                  ↓ Download Split Comparison
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Share Design Modal */}
      {showShare && shareDataUrl && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={e => { if (e.target === e.currentTarget) setShowShare(false); }}>
          <div style={{ background: "#0D1B3E", borderRadius: 16, border: "1px solid rgba(200,170,80,0.3)", maxWidth: 560, width: "100%", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}>
            {/* Modal header */}
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(200,170,80,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: "bold", color: "#E8CC70", letterSpacing: 1 }}>↗ SHARE DESIGN</div>
              <button onClick={() => setShowShare(false)} style={{ background: "transparent", border: "none", color: "rgba(245,240,232,0.5)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>
            {/* Preview card */}
            <div style={{ padding: "1rem" }}>
              <img src={shareDataUrl} alt="Share card preview" style={{ width: "100%", borderRadius: 10, display: "block", border: "1px solid rgba(255,255,255,0.06)" }} />
            </div>
            {/* Action buttons */}
            <div style={{ padding: "0 1rem 1.25rem", display: "flex", gap: "0.75rem" }}>
              <button onClick={handleDownloadShare} style={{ flex: 1, background: "linear-gradient(135deg,#C8AA50,#E8CC70)", border: "none", borderRadius: 8, padding: "0.75rem", color: "#0D1B3E", fontSize: 14, fontWeight: "bold", cursor: "pointer", letterSpacing: 0.5 }}>
                ↓ Download PNG
              </button>
              {typeof navigator !== "undefined" && navigator.share && (
                <button onClick={handleNativeShare} style={{ flex: 1, background: "rgba(200,170,80,0.12)", border: "1px solid rgba(200,170,80,0.4)", borderRadius: 8, padding: "0.75rem", color: "#C8AA50", fontSize: 14, fontWeight: "bold", cursor: "pointer", letterSpacing: 0.5 }}>
                  ↗ Share via…
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compare Shades Modal */}
      {showCompare && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", flexDirection: "column" }} onClick={e => { if (e.target === e.currentTarget) setShowCompare(false); }}>
          <div style={{ background: "#0D1B3E", borderBottom: "1px solid rgba(200,170,80,0.25)", padding: "0.9rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: "bold", color: "#E8CC70", letterSpacing: 1 }}>⊞ COMPARE SHADES</div>
              <div style={{ fontSize: 11, color: "rgba(245,240,232,0.35)", marginTop: 2 }}>Side-by-side preview on your wall</div>
            </div>
            <button onClick={() => setShowCompare(false)} style={{ background: "transparent", border: "1px solid rgba(200,170,80,0.3)", color: "#C8AA50", padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>✕ Close</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(compareShades.length, 2)}, 1fr)`, gap: "1rem", maxWidth: 1000, margin: "0 auto" }}>
              {compareShades.map((shade, idx) => {
                const dataUrl = renderShadeToDataURL(shade);
                return (
                  <div key={shade.name} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ position: "relative" }}>
                      {dataUrl
                        ? <img src={dataUrl} alt={shade.name} style={{ width: "100%", display: "block" }} />
                        : <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(245,240,232,0.3)", fontSize: 13 }}>No mask painted yet</div>
                      }
                      <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(13,27,62,0.85)", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: "bold", color: "#E8CC70" }}>Option {idx + 1}</div>
                    </div>
                    <div style={{ padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: shade.hex, border: "2px solid rgba(200,170,80,0.4)", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: "bold", color: "#F5F0E8" }}>{shade.name}</div>
                        <div style={{ fontSize: 10, color: "rgba(245,240,232,0.4)" }}>{shade.hex} · {shade.code}</div>
                      </div>
                      <button onClick={() => removeFromCompare(shade.name)} style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 6, padding: "4px 8px", color: "#FF8080", fontSize: 11, cursor: "pointer" }}>✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {compareShades.length === 0 && (
              <div style={{ textAlign: "center", color: "rgba(245,240,232,0.3)", fontSize: 14, paddingTop: "3rem" }}>No shades added yet. Close this and use "+ Add to Compare" under a shade.</div>
            )}
          </div>
        </div>
      )}

      {/* Saved Designs Panel */}
      {showSavedPanel && (
        <div style={{ position: "fixed", top: 0, right: 0, width: 320, height: "100vh", background: "#0D1B3E", borderLeft: "1px solid rgba(200,170,80,0.25)", zIndex: 100, display: "flex", flexDirection: "column", boxShadow: "-8px 0 32px rgba(0,0,0,0.5)" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(200,170,80,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, color: "#E8CC70", fontWeight: "bold", letterSpacing: 1 }}>🗂 SAVED DESIGNS</div>
            <button onClick={() => setShowSavedPanel(false)} style={{ background: "transparent", border: "none", color: "rgba(245,240,232,0.5)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem" }}>
            {savedDesigns.length === 0 && (
              <div style={{ textAlign: "center", color: "rgba(245,240,232,0.3)", fontSize: 13, marginTop: "2rem" }}>No saved designs yet.<br/>Click 💾 Save Design to save one.</div>
            )}
            {savedDesigns.map(d => (
              <div key={d.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, marginBottom: "0.75rem", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
                {/* Thumbnail */}
                {d.thumbnail && <img src={d.thumbnail} alt={d.name} style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />}
                <div style={{ padding: "0.6rem 0.75rem" }}>
                  {/* Name / rename */}
                  {renamingId === d.id ? (
                    <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.5rem" }}>
                      <input
                        value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") commitRename(d.id); if (e.key === "Escape") setRenamingId(null); }}
                        autoFocus
                        style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid #C8AA50", borderRadius: 5, padding: "3px 8px", color: "#F5F0E8", fontSize: 12 }}
                      />
                      <button onClick={() => commitRename(d.id)} style={{ background: "#C8AA50", border: "none", borderRadius: 5, padding: "3px 8px", color: "#0D1B3E", fontSize: 12, cursor: "pointer", fontWeight: "bold" }}>✓</button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: "bold", color: "#F5F0E8", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                  )}
                  {/* Shade + time */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.6rem" }}>
                    {d.shade && <div style={{ width: 14, height: 14, borderRadius: 3, background: d.shade.hex, border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }} />}
                    <span style={{ fontSize: 10, color: "rgba(245,240,232,0.4)" }}>{d.shade ? d.shade.name : "No shade"} · {new Date(d.timestamp).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button onClick={() => loadDesign(d)} style={{ flex: 1, background: "linear-gradient(135deg,#C8AA50,#E8CC70)", border: "none", borderRadius: 6, padding: "5px 0", color: "#0D1B3E", fontSize: 11, fontWeight: "bold", cursor: "pointer" }}>▶ Load</button>
                    <button onClick={() => { setRenamingId(d.id); setRenameVal(d.name); }} style={{ flex: 1, background: "rgba(200,170,80,0.1)", border: "1px solid rgba(200,170,80,0.3)", borderRadius: 6, padding: "5px 0", color: "#C8AA50", fontSize: 11, cursor: "pointer" }}>✏ Rename</button>
                    <button onClick={() => deleteDesign(d.id)} style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 6, padding: "5px 8px", color: "#FF8080", fontSize: 11, cursor: "pointer" }}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer style={{ textAlign: "center", padding: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: "2rem", fontSize: 10, color: "rgba(245,240,232,0.15)", letterSpacing: 1.5 }}>SM PAINT INDUSTRIES · Galleria Weatherproof &amp; Vespa · Paint Visualizer</footer>
    </div>
  );
}
