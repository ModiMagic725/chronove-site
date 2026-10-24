/**
 * CHRONOVÉ — content data.
 * Every figure below is invented for this fictional maison. It is stored per model
 * (not computed), so each watch carries its own specification.
 */

/** Fixed vocabulary used by filters and the configurator. */
export const COLLECTIONS = ['Classic', 'Sport', 'Skeleton', 'Complications', 'Limited Editions'];

export const CASE_MATERIALS = {
  steel:    { label: 'Steel',          swatch: '#B9BEC5' },
  titanium: { label: 'Titanium',       swatch: '#8E959E' },
  gold:     { label: 'Champagne gold', swatch: '#C5A46D' },
};

export const DIALS = {
  midnight:  { label: 'Midnight',  swatch: '#101318' },
  porcelain: { label: 'Porcelain', swatch: '#F4F1E9' },
  navy:      { label: 'Navy',      swatch: '#1D2A3A' },
  graphite:  { label: 'Graphite',  swatch: '#34383D' },
};

/**
 * The nine models.
 * `price` is in euro. `diameter`, `thickness`, `lugToLug` are in mm. `frequency` is in vibrations/hour.
 * `story` holds 3–4 paragraphs of page copy for the watch page.
 */
export const MODELS = [
  {
    id: 0, slug: 'meridian', name: 'Meridian', collection: 'Classic', price: 4200,
    tagline: 'The hour, drawn with a single steady line.',
    caseMaterial: 'steel', dial: 'porcelain', dialFinish: 'Grained porcelain-white, applied steel indices',
    diameter: 38, thickness: 8.9, lugToLug: 45.5, lugWidth: 20, weight: 62, crystal: 'Domed sapphire, inner anti-reflective coating',
    movement: { calibre: 'CV-01', type: 'Automatic', frequency: 28800, jewels: 26, powerReserve: 55, parts: 187 },
    waterResistance: 50, straps: ['Calf leather', 'Steel bracelet'], complications: ['Hours', 'Minutes', 'Small seconds'], edition: null,
    story: [
      'Meridian is the watch the maison builds everything else from. A 38 mm steel case, a dial with nothing on it that does not need to be there, and a calibre regulated to keep the same minute as the one before.',
      'The case is brushed on its flanks and polished only on the bezel step, so that light moves across it in two distinct bands. At 8.9 mm it slides under a shirt cuff without being asked.',
      'The porcelain-white dial is lightly grained, then fitted with faceted steel indices that catch the room rather than shout across it. The small seconds sit at six, balanced by a short signature at twelve.',
      'Inside, calibre CV-01 beats at 4 Hz and stores 55 hours. The rotor is skeletonised so the going train can be seen through the sapphire caseback.'
    ],
  },
  {
    id: 1, slug: 'aperture', name: 'Aperture', collection: 'Skeleton', price: 6900,
    tagline: 'Open the dial until only the mechanism remains.',
    caseMaterial: 'titanium', dial: 'midnight', dialFinish: 'Open-worked, midnight-black chapter ring',
    diameter: 39.5, thickness: 10.2, lugToLug: 47, lugWidth: 20, weight: 48, crystal: 'Flat sapphire front and back',
    movement: { calibre: 'CV-S2', type: 'Manual-wind skeleton', frequency: 21600, jewels: 21, powerReserve: 72, parts: 164 },
    waterResistance: 30, straps: ['Calf leather', 'Rubber'], complications: ['Hours', 'Minutes'], edition: null,
    story: [
      'Aperture removes the dial and keeps the argument. Every plate has been cut away until the barrel, the train and the balance are all visible from the front, each one finished to be looked at.',
      'The skeleton work is done by hand. Bridges are bevelled on all edges, wheel spokes are polished and the plates carry a fine linear grain so that the open spaces read as clean shadow.',
      'The grade 5 titanium case weighs 48 g with its strap. Its bead-blasted flanks stay matte; its polished chamfer picks out the line of the lug.',
      'A manual-wind calibre was the honest choice. Winding is a daily moment with a watch that exists to be watched.'
    ],
  },
  {
    id: 2, slug: 'tidal-300', name: 'Tidal 300', collection: 'Sport', price: 5100,
    tagline: 'Three hundred metres of calm.',
    caseMaterial: 'titanium', dial: 'navy', dialFinish: 'Sunburst navy, lume-filled indices',
    diameter: 42, thickness: 12.4, lugToLug: 49.5, lugWidth: 22, weight: 84, crystal: 'Flat sapphire with bevelled edge',
    movement: { calibre: 'CV-03', type: 'Automatic', frequency: 28800, jewels: 28, powerReserve: 70, parts: 201 },
    waterResistance: 300, straps: ['Rubber', 'Titanium bracelet'], complications: ['Hours', 'Minutes', 'Seconds', 'Date', 'Unidirectional dive bezel'], edition: null,
    story: [
      'Tidal 300 is built for people who actually get in the water. A screw-down crown, a screwed caseback and a ceramic dive bezel rated to 300 metres sit inside a 42 mm titanium case.',
      'The bezel has 120 clicks and no play, and the insert is cut so that numerals stay legible when the wrist is angled. The navy sunburst dial deepens from centre to edge.',
      'Lume is applied in thick, even layers. The hour hand is shaped differently from the minute hand so that the two can be told apart at a glance in poor light.',
      'Calibre CV-03 carries a 70-hour reserve, which means the watch is still running on Monday morning after a weekend on the shelf.'
    ],
  },
  {
    id: 3, slug: 'equinox', name: 'Equinox', collection: 'Complications', price: 12800,
    tagline: 'Day and night, in equal measure.',
    caseMaterial: 'gold', dial: 'midnight', dialFinish: 'Midnight enamel with gold moon-phase aperture',
    diameter: 40, thickness: 11.6, lugToLug: 47.5, lugWidth: 20, weight: 78, crystal: 'Domed sapphire, double anti-reflective coating',
    movement: { calibre: 'CV-C4', type: 'Automatic with annual calendar module', frequency: 28800, jewels: 33, powerReserve: 60, parts: 262 },
    waterResistance: 30, straps: ['Calf leather', 'Alligator-grain leather'], complications: ['Annual calendar', 'Moon phase', 'Day and month apertures'], edition: null,
    story: [
      'Equinox shows the date, the month and the phase of the moon, and asks you to adjust it only once a year, at the end of February.',
      'The moon-phase disc is a plate of enamelled midnight with a gold moon, accurate to one day in roughly 122 years. It turns inside an aperture at six that frames it like a small window.',
      'The champagne gold alloy was chosen for its warmth against the blue-black dial. The case is polished on the bezel and satin-brushed everywhere else, so the metal looks luminous instead of loud.',
      'An annual calendar is a more modest ambition than a perpetual one, and a more reliable one. The module has 62 additional parts and one clear job.'
    ],
  },
  {
    id: 4, slug: 'axiom', name: 'Axiom', collection: 'Classic', price: 4800,
    tagline: 'A rule you can wear.',
    caseMaterial: 'steel', dial: 'graphite', dialFinish: 'Brushed graphite, printed railway minute track',
    diameter: 39, thickness: 9.3, lugToLug: 46, lugWidth: 20, weight: 66, crystal: 'Domed sapphire, inner anti-reflective coating',
    movement: { calibre: 'CV-01', type: 'Automatic', frequency: 28800, jewels: 26, powerReserve: 55, parts: 187 },
    waterResistance: 50, straps: ['Calf leather', 'Steel bracelet'], complications: ['Hours', 'Minutes', 'Seconds'], edition: null,
    story: [
      'Axiom takes its proportions from drafting instruments. The 39 mm case is set at right angles to the lugs, the indices are cut to equal length and the dial is brushed in a single direction.',
      'The graphite dial is deliberately flat so that the printed railway track reads sharply. A sword-shaped hour hand and a long baton minute hand are contrasted by a slim champagne seconds hand.',
      'It shares calibre CV-01 with Meridian and takes its character from the dial alone, which is the point: one reliable engine, several quiet temperaments.',
      'The steel bracelet tapers from 20 mm to 16 mm and is secured by a folding clasp with two-stage micro-adjustment.'
    ],
  },
  {
    id: 5, slug: 'regatta', name: 'Regatta', collection: 'Sport', price: 5600,
    tagline: 'Five minutes to the start gun.',
    caseMaterial: 'steel', dial: 'navy', dialFinish: 'Matte navy with coloured countdown sector',
    diameter: 41, thickness: 12.9, lugToLug: 48.5, lugWidth: 22, weight: 92, crystal: 'Flat sapphire, anti-reflective coating both sides',
    movement: { calibre: 'CV-R5', type: 'Automatic with countdown timer', frequency: 28800, jewels: 31, powerReserve: 60, parts: 224 },
    waterResistance: 100, straps: ['Rubber', 'Sailcloth-pattern textile'], complications: ['Five-minute regatta countdown', 'Date'], edition: null,
    story: [
      'Regatta carries a five-minute countdown on its dial, the sequence a racing crew uses to time the approach to the start line.',
      'The countdown sector is a coloured wedge printed in four stages so that a glance reads remaining time without any arithmetic. Push once to start, once to synchronise to the nearest minute.',
      'The 41 mm steel case has large, squared pushers that can be operated with wet gloves. A rubber strap with a ventilated underside is supplied as standard.',
      'Calibre CV-R5 adds a dedicated timing module to the automatic base. Reserve is 60 hours and water resistance 100 metres.'
    ],
  },
  {
    id: 6, slug: 'solstice', name: 'Solstice', collection: 'Limited Editions', price: 18900,
    tagline: 'The longest day, ninety-nine times.',
    caseMaterial: 'gold', dial: 'porcelain', dialFinish: 'Grand-feu enamel, hand-painted Roman numerals',
    diameter: 38.5, thickness: 8.4, lugToLug: 45, lugWidth: 19, weight: 54, crystal: 'Domed sapphire box crystal',
    movement: { calibre: 'CV-U6', type: 'Manual-wind ultra-thin', frequency: 21600, jewels: 19, powerReserve: 48, parts: 148 },
    waterResistance: 30, straps: ['Hand-stitched calf leather'], complications: ['Hours', 'Minutes', 'Small seconds'], edition: 99,
    story: [
      'Solstice is limited to ninety-nine pieces, one for each day of the long summer light that gives the watch its name. Each carries its number on the caseback.',
      'The dial is fired grand-feu enamel, a process in which colour is fused to the metal at temperatures above 800 degrees. Roman numerals are painted by hand with a single-hair brush and fired again.',
      'At 8.4 mm it is the thinnest watch of the collection. The manual-wind calibre CV-U6 is only 2.9 mm high, and the case is cut so thin that the crystal is almost the entire profile.',
      'It comes with a hand-stitched strap, a travel case and a certificate signed at the bench.'
    ],
  },
  {
    id: 7, slug: 'lattice', name: 'Lattice', collection: 'Skeleton', price: 9400,
    tagline: 'The structure, made beautiful.',
    caseMaterial: 'gold', dial: 'graphite', dialFinish: 'Graphite-toned open lattice with gold-coloured bridges',
    diameter: 40, thickness: 10.8, lugToLug: 47.5, lugWidth: 20, weight: 71, crystal: 'Domed sapphire front, flat sapphire back',
    movement: { calibre: 'CV-S7', type: 'Automatic skeleton', frequency: 28800, jewels: 29, powerReserve: 64, parts: 198 },
    waterResistance: 30, straps: ['Calf leather', 'Alligator-grain leather'], complications: ['Hours', 'Minutes'], edition: null,
    story: [
      'Lattice is Aperture’s warmer sibling. Instead of a single open-worked dial, the bridges themselves are cut into a lattice that echoes the geometry of the gear train beneath.',
      'The skeletonised automatic calibre keeps its rotor in sight, a half-moon of gold-toned metal that sweeps across the open dial as the wrist moves.',
      'Every internal edge is bevelled and polished by hand, and the angles are crisp, not soft. It takes a skilled finisher about thirty hours to complete a single movement.',
      'The graphite-toned plates keep contrast high so that the hands are always legible against the structure.'
    ],
  },
  {
    id: 8, slug: 'perpetua', name: 'Perpetua', collection: 'Complications', price: 15400,
    tagline: 'A calendar that knows about leap years.',
    caseMaterial: 'steel', dial: 'midnight', dialFinish: 'Midnight lacquer, silver-toned sub-dials',
    diameter: 39.5, thickness: 12.1, lugToLug: 47, lugWidth: 20, weight: 74, crystal: 'Domed sapphire, double anti-reflective coating',
    movement: { calibre: 'CV-P8', type: 'Automatic with perpetual calendar module', frequency: 28800, jewels: 38, powerReserve: 60, parts: 289 },
    waterResistance: 30, straps: ['Calf leather', 'Steel bracelet'], complications: ['Perpetual calendar', 'Moon phase', 'Leap-year indicator'], edition: null,
    story: [
      'Perpetua is a perpetual calendar: set it once and it will keep the correct date, day, month and leap-year cycle until the year 2100, when a one-off correction is needed.',
      'Three silver-toned sub-dials sit on a midnight lacquer ground, spaced so that nothing crowds the centre. The leap-year indicator is a small aperture at four o’clock.',
      'The calendar mechanism is driven by a program wheel that completes one revolution every four years. It adds 89 parts to the base automatic movement.',
      'The 39.5 mm steel case has two correctors recessed into the flank, so that adjustments can be made with the supplied pen and not a fingernail.'
    ],
  },
];

/** Lookup helpers. */
export const bySlug = (s) => MODELS.find((m) => m.slug === s) || null;
export const byId = (i) => MODELS.find((m) => m.id === Number(i)) || null;

/** Formatting helpers shared by pages and cards. */
export const euro = (n) => '€' + n.toLocaleString('en');
/** Vibrations per hour count beats (half-oscillations), so frequency in Hz is vph / 7200. */
export const hz = (vph) => (vph / 7200).toString().replace(/\.0$/, '') + ' Hz';

/**
 * The spec table for a watch, as [label, value] pairs.
 * Used by the watch page and the comparison table so both read the same record.
 */
export function specRows(m) {
  const mv = m.movement;
  return [
    ['Collection', m.collection],
    ['Price', euro(m.price)],
    ['Case material', CASE_MATERIALS[m.caseMaterial].label],
    ['Case diameter', m.diameter + ' mm'],
    ['Thickness', m.thickness.toFixed(1) + ' mm'],
    ['Lug to lug', m.lugToLug.toFixed(1) + ' mm'],
    ['Lug width', m.lugWidth + ' mm'],
    ['Weight (on strap)', m.weight + ' g'],
    ['Crystal', m.crystal],
    ['Dial', m.dialFinish],
    ['Calibre', mv.calibre + ' · ' + mv.type],
    ['Frequency', mv.frequency.toLocaleString('en') + ' vph (' + hz(mv.frequency) + ')'],
    ['Jewels and parts', mv.jewels + ' jewels, ' + mv.parts + ' parts'],
    ['Power reserve', mv.powerReserve + ' h'],
    ['Water resistance', m.waterResistance + ' m'],
    ['Complications', m.complications.join(', ')],
    ['Straps', m.straps.join(', ')],
    ['Edition', m.edition ? 'Limited to ' + m.edition + ' pieces' : 'Permanent collection'],
  ];
}

/** Journal articles. */
export const ARTICLES = [
  { id: 0, slug: 'balance-wheel', title: 'Why the balance wheel beats', category: 'Horology', read: 4, summary: 'Every tick is a swing of a small wheel. Here is why frequency matters.',
    body: ['A balance wheel and hairspring form a harmonic oscillator, the same physics as a child’s swing. The wheel rotates one way, the spring pulls it back, and the cycle repeats at a rate set by the wheel’s inertia and the spring’s stiffness.',
      'A higher beat rate smooths the sweep of the seconds hand and makes the watch less sensitive to shocks and changes of position. It also needs more energy, which is why 4 Hz movements typically carry shorter power reserves than 3 Hz ones of the same size.',
      'Calibres in this maison run between 3 Hz and 4 Hz. The decision is made per watch: Aperture and Solstice use 3 Hz because they are wound by hand and carry the beauty of a slower rhythm; Tidal 300 uses 4 Hz because a diver’s watch should shrug off knocks.'] },
  { id: 1, slug: 'finishing-a-bridge', title: 'Finishing a bridge by hand', category: 'Craftsmanship', read: 5, summary: 'Anglage, perlage and why the unseen edges matter.',
    body: ['Chamfering a bridge edge removes burrs and creates a bright bevel. Done by hand, with a wooden peg and diamond paste, it takes an hour or more per plate, and a single slip means starting again.',
      'Perlage is the overlapping circular graining seen on baseplates. Each circle is made with a small rotating rod and must overlap the last by an exact fraction. The finish hides fingerprints and gives the metal a quiet depth.',
      'None of this makes the watch run more accurately. It exists because someone will one day open the caseback, and that person should find that the same standard was applied to what cannot be seen.'] },
  { id: 2, slug: 'titanium-vs-steel', title: 'Titanium versus steel', category: 'Engineering', read: 4, summary: 'Density, hardness and how each feels on the wrist.',
    body: ['Titanium is roughly 45 per cent lighter than stainless steel for the same volume. On a 42 mm sports watch that difference is the gap between a watch you notice and a watch you forget.',
      'It is also softer at the surface, which is why titanium cases are usually bead-blasted or given a hard coating. Steel takes a brighter polish and can be refinished many times.',
      'Titanium is hypoallergenic and warms quickly to skin temperature. Steel feels cooler at first and gains a satisfying heft. Neither is better; they answer different questions.'] },
  { id: 3, slug: 'reading-a-dial', title: 'Reading a dial at a glance', category: 'Design', read: 3, summary: 'Hand shapes, lume and contrast as engineering decisions.',
    body: ['Legibility is a system. Hand width, index length, colour contrast and the distance between the hands and the dial all work together, and removing one weakens the others.',
      'A dial is a user interface measured in tenths of a millimetre. If the hour hand is too similar to the minute hand, the eye hesitates. If an index is a fraction too wide, the dial looks crowded.',
      'The best dials do not look designed; they look inevitable. That effect takes months of drawings and prototypes to achieve.'] },
  { id: 4, slug: 'perpetual-calendar', title: 'The perpetual calendar, simplified', category: 'Horology', read: 6, summary: 'How a mechanism knows February has 29 days.',
    body: ['A cam makes one full turn every four years and tells the date wheel when to skip. Inside is a program wheel with 48 steps, one for each month of the four-year cycle.',
      'The idea is old; the miniaturisation is the achievement. A perpetual calendar module fits roughly ninety parts into the thickness of a coin.',
      'Most perpetual calendars will need a correction in the year 2100, when the Gregorian calendar skips a leap year. Perpetua will too.'] },
  { id: 5, slug: 'sapphire-explained', title: 'Sapphire, explained', category: 'Engineering', read: 3, summary: 'Why a synthetic crystal protects the dial.',
    body: ['Synthetic sapphire is grown from molten aluminium oxide. It ranks 9 on the Mohs scale, just below diamond, and resists scratches from almost everything it will ever meet.',
      'Its weakness is reflection. Bare sapphire reflects about 12 per cent of light per surface, which is why anti-reflective coatings are applied, usually on the inner side so that they cannot be scratched.',
      'Domed crystals are harder to cut and make the dial appear to float. Flat crystals are sharper and more modern. Both are cut from the same boule.'] },
];

/** Materials lab entries. Ratings are qualitative (0–100). */
export const MATERIALS = [
  { id: 'titanium', name: 'Titanium',       tone: '#8E959E', hardness: 60,  lightness: 90, shine: 40, text: 'Light and strong, with a soft grey tone. Often bead-blasted so that it stays quiet in the light.' },
  { id: 'steel',    name: 'Steel',          tone: '#B9BEC5', hardness: 55,  lightness: 45, shine: 75, text: 'The classic. Stainless steel takes both brushed and mirror polish and can be refinished many times.' },
  { id: 'ceramic',  name: 'Ceramic',        tone: '#2A2D33', hardness: 95,  lightness: 70, shine: 85, text: 'Extremely scratch-resistant and colour-stable, with a deep gloss. Used for the Tidal 300 dive bezel.' },
  { id: 'sapphire', name: 'Sapphire',       tone: '#9FD0E6', hardness: 100, lightness: 55, shine: 95, text: 'Transparent crystal for dials, cases and glass. Hard, clear and difficult to machine.' },
  { id: 'gold',     name: 'Champagne gold', tone: '#C5A46D', hardness: 25,  lightness: 15, shine: 90, text: 'A warm gold-coloured alloy. Soft, so it is used with care and finished to be worn rather than guarded.' },
];

/** Straps strip on the home page. */
export const STRAPS = [
  { id: 'calf',      name: 'Calf leather',      note: 'Vegetable-tanned, hand-stitched', fits: 'Meridian, Axiom, Solstice' },
  { id: 'bracelet',  name: 'Steel bracelet',    note: 'Tapered, micro-adjust clasp',     fits: 'Meridian, Axiom, Perpetua' },
  { id: 'rubber',    name: 'Rubber',            note: 'Ventilated, quick-release',       fits: 'Tidal 300, Regatta, Aperture' },
  { id: 'alligator', name: 'Alligator-grain',   note: 'Embossed calf, lined',            fits: 'Equinox, Lattice' },
  { id: 'titanium',  name: 'Titanium bracelet', note: 'Light, bead-blasted',             fits: 'Tidal 300' },
  { id: 'textile',   name: 'Sailcloth textile', note: 'Woven, salt-resistant',           fits: 'Regatta' },
];

/** Configurator choices (price deltas in euro, applied to the chosen base model). */
export const CONFIG = {
  strap:     [['Calf leather', 0], ['Steel bracelet', 900], ['Rubber', 300], ['Alligator-grain', 450]],
  finish:    [['As standard', 0], ['Bead-blasted case', 150], ['Polished bezel', 200]],
  engraving: [['None', 0], ['Caseback engraving', 120]],
};

/** Boutiques (fictional). */
export const BOUTIQUES = [
  { city: 'Geneva',    address: 'Rue du Rhône 41',      hours: 'Tue–Sat 10:00–18:30' },
  { city: 'Paris',     address: 'Rue Saint-Honoré 218', hours: 'Tue–Sat 11:00–19:00' },
  { city: 'London',    address: 'Bond Street 17',       hours: 'Mon–Sat 10:00–18:00' },
  { city: 'Singapore', address: 'Orchard Boulevard 3',  hours: 'Daily 11:00–20:00' },
];

/** Voices (testimonials) for the Owl Carousel on the journal page. Fictional. */
export const VOICES = [
  { name: 'A. Lindqvist', role: 'Architect, Stockholm',  quote: 'I wear Meridian to site visits. It has never once looked out of place, and never once looked like it was trying.' },
  { name: 'R. Okafor',    role: 'Marine surveyor, Lagos', quote: 'Tidal 300 took six months of salt and sun. The bezel still clicks like it did on day one.' },
  { name: 'M. Tanaka',    role: 'Pianist, Kyoto',         quote: 'Winding Aperture is the first thing I do each day. It is a small ritual that sets the tempo.' },
  { name: 'S. Haddad',    role: 'Collector, Beirut',      quote: 'Perpetua is the only perpetual calendar I own that I have never once needed to correct.' },
];

/** Timeline for heritage.html. */
export const TIMELINE = [
  { year: 'Year 1',  title: 'The founding idea',     text: 'Three watchmakers share a bench and a belief: time has structure, and the structure should be visible. The first prototypes are made from scrap steel and borrowed lathes.' },
  { year: 'Year 6',  title: 'First calibre',         text: 'Calibre CV-01 is sketched, scrapped and drawn again. The final version runs at 28,800 vph and keeps its reserve for 55 hours.' },
  { year: 'Year 11', title: 'The open dial',         text: 'The skeleton collection is imagined. Aperture is the first watch in which the movement is the dial.' },
  { year: 'Year 15', title: 'Perpetua',              text: 'A perpetual-calendar complication takes four years of development and 89 additional parts.' },
  { year: 'Today',   title: 'The Observatory opens', text: 'The maison publishes its workshop notes online and invites the curious to enter.' },
];

/** The five collections, used by the horizontal-scroll strip on the home page. `rep` is the model whose photo represents it. */
export const FAMILIES = [
  { name: 'Classic',          rep: 'meridian', text: 'Two- and three-hand watches with quiet dials, built to be worn every day.' },
  { name: 'Sport',            rep: 'tidal-300', text: 'Dive and regatta watches in titanium and steel, rated for real water.' },
  { name: 'Skeleton',         rep: 'aperture', text: 'Open-worked dials where the mechanism is the decoration.' },
  { name: 'Complications',    rep: 'equinox',  text: 'Calendars and moon phases that keep better track of the date than you do.' },
  { name: 'Limited Editions', rep: 'solstice', text: 'Ninety-nine pieces of grand-feu enamel and hand-painted numerals.' },
];
