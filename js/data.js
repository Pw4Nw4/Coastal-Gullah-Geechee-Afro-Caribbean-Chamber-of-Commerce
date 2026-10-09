// ============================================================
//  SITE CONTENT — edit this file to update the whole site.
//  Everything marked sample:true is PLACEHOLDER. While
//  SAMPLE_DATA is true, dashed "Draft" notes show where content
//  still needs replacing. Replace members/events/photos/leaders,
//  then set SAMPLE_DATA = false to hide the notes and any
//  sections that are still empty.
// ============================================================
const SAMPLE_DATA = true;

const SITE = {
  name: "Coastal Gullah Geechee & Afro-Caribbean Chamber of Commerce",
  short: "Coastal Gullah Geechee & Afro-Caribbean Chamber",
  phone: "912-417-9591",
  phoneHref: "tel:+19124179591",
  email: "info@coastalgullahgeecheeafrocarribeanchamber.com", // confirm real address
  address: "1305 Barnard Street, PMB #40, Savannah, GA",
  donate: "#", // paste your donation link here; "Donate" links stay hidden while this is "#"
  checkoutEndpoint: "/.netlify/functions/create-checkout", // serverless function that starts Stripe Checkout
  // Social links set to "#" are hidden until a real URL is added
  social: [
    { label: "Facebook", url: "#" },
    { label: "Instagram", url: "https://instagram.com/gullahgeecheecaribbeanchamber" },
    { label: "LinkedIn", url: "#" },
    { label: "TikTok", url: "https://tiktok.com/@gullahgeecheecaribbeancc" },
  ],
};

// Directory categories
const CATEGORIES = ["Food & Hospitality", "Arts & Crafts", "Professional Services", "Retail & Fashion", "Tours & Culture", "Health & Wellness", "Construction & Trades", "Education & Media"];
const AREAS = ["Savannah", "Brunswick", "Darien / McIntosh", "Liberty County", "St. Simons / Sapelo", "Other Coastal GA"];

// Member directory (all sample entries — replace with real members)
const MEMBERS = [
  { name: "Sweetgrass Basket Studio", cat: "Arts & Crafts", area: "Savannah", tags: ["Women-owned", "Gullah Geechee"], desc: "Handwoven sweetgrass baskets and weaving workshops rooted in generations of tradition.", url: "#", phone: "", sample: true },
  { name: "Low Country Kitchen Collective", cat: "Food & Hospitality", area: "Savannah", tags: ["Minority-owned", "Afro-Caribbean"], desc: "Red rice, okra soup, and Caribbean-Gullah fusion catering for events of any size.", url: "#", phone: "", sample: true },
  { name: "Haint Blue Tours", cat: "Tours & Culture", area: "Darien / McIntosh", tags: ["Gullah Geechee"], desc: "Guided heritage tours of historic Gullah Geechee communities and landmarks.", url: "#", phone: "", sample: true },
  { name: "Indigo & Thread", cat: "Retail & Fashion", area: "Brunswick", tags: ["Women-owned"], desc: "Indigo-dyed apparel and home goods inspired by Lowcountry textile heritage.", url: "#", phone: "", sample: true },
  { name: "Marsh Wellness Co.", cat: "Health & Wellness", area: "Liberty County", tags: ["Minority-owned", "Women-owned"], desc: "Herbal remedies, holistic wellness, and community health education.", url: "#", phone: "", sample: true },
  { name: "Heritage Land & Title Advisors", cat: "Professional Services", area: "Savannah", tags: ["Minority-owned"], desc: "Heirs' property guidance, land preservation planning, and title clearing support.", url: "#", phone: "", sample: true },
  { name: "Island Rhythm Media", cat: "Education & Media", area: "St. Simons / Sapelo", tags: ["Afro-Caribbean"], desc: "Photography, video, and storytelling for cultural events and small businesses.", url: "#", phone: "", sample: true },
  { name: "Ancestral Builders", cat: "Construction & Trades", area: "Other Coastal GA", tags: ["Minority-owned"], desc: "Home restoration and new builds respecting traditional coastal architecture.", url: "#", phone: "", sample: true },
];

// Events (sample dates — replace)
const EVENTS = [
  { m: "NOV", d: "08", title: "Business Incubator Info Session", type: "Workshop", where: "Savannah · Hybrid", desc: "Meet the team, learn about mentorship, certifications and the resource pipeline.", url: "contact.html", sample: true },
  { m: "NOV", d: "22", title: "Heritage Makers Market", type: "Community", where: "Savannah", desc: "Artisans, food vendors and live music. Shop Gullah Geechee and Afro-Caribbean businesses.", url: "contact.html", sample: true },
  { m: "DEC", d: "06", title: "Heirs' Property & Land Preservation Clinic", type: "Education", where: "Darien", desc: "Free sessions on protecting ancestral land, with attorneys and advocates on hand.", url: "contact.html", sample: true },
  { m: "JAN", d: "17", title: "Annual Membership Mixer", type: "Networking", where: "Savannah", desc: "Connect with members, ambassadors and partners. Food, music and door prizes.", url: "contact.html", sample: true },
];

// Past event pictures. Put photos in /images/events and list them here, newest first:
//   { src: "images/events/makers-market-1.jpg", cap: "Heritage Makers Market, November 2026" }
// The gallery sections stay hidden until at least one photo is listed.
const GALLERY = [];

// Videos. Paste a YouTube video ID (the part after v=). Videos without an id are skipped,
// and the video sections stay hidden until at least one has an id.
const VIDEOS = [
  { id: "", title: "Chamber Highlights" },
  { id: "", title: "Member Spotlight" },
  { id: "", title: "What is Gullah Geechee?" },
];

// Leadership & ambassadors (About page). Add a headshot path like "images/leaders/jane-doe.jpg"
// as img, or leave img empty to show the person's initials. Sample entries only show while SAMPLE_DATA is true.
const LEADERS = [
  { name: "Leader name", role: "Founder & President", img: "", sample: true },
  { name: "Leader name", role: "Vice President", img: "", sample: true },
  { name: "Ambassador name", role: "Ambassador", img: "", sample: true },
  { name: "Ambassador name", role: "Ambassador", img: "", sample: true },
];

// Membership levels: names, groups and descriptions from the live site's membership page, prices (in dollars)
// from its checkout. Every membership also pays REGISTRATION_FEE. "fit" is the short who-qualifies tag shown
// next to the name; guardian: true shows the parent/guardian note in the form. Ids and prices must match
// netlify/functions/create-checkout.js, which decides what Stripe charges.
// "includes" lists what the level comes with; includesFrom names the level it builds on ("Everything in X, plus").
// includesDraft: true marks a PROPOSAL the chamber hasn't approved: it shows with a "Draft" label while SAMPLE_DATA
// is true and is hidden once SAMPLE_DATA is false. Set includesDraft to false after the chamber confirms the list.
const REGISTRATION_FEE = 25;
const TIERS = [
  { id: "youngpreneur", group: "Individuals", name: "Youngpreneur", fit: "Ages 15 and under", price: 50, guardian: true,
    blurb: "For emerging young entrepreneurs, 15 or younger, building skills, connections and confidence.",
    includesDraft: true, includes: ["Youth workshops and mentorship", "Invitations to chamber events", "A chance to be featured in member spotlights"] },
  { id: "solopreneur", group: "Individuals", name: "Solopreneur", fit: "Solo business owners", price: 150,
    blurb: "For independent solo business owners ready to increase visibility and grow their network.",
    includesDraft: true, includes: ["Directory listing for your business", "Workshops, mentorship and technical help", "Grant and funding leads", "Networking events and mixers"] },
  { id: "legacy-partners", group: "Nonprofits & community organizations", name: "Legacy Partners", fit: "1–2 employees", price: 140,
    blurb: "For nonprofit and community organizations with 1 to 2 employees and dedicated volunteers, aligned with the Chamber's mission.",
    includesDraft: true, includes: ["Directory listing for your organization", "Workshops, mentorship and technical help", "Grant and funding leads", "Networking events and community partnerships"] },
  { id: "legacy-partners-2", group: "Nonprofits & community organizations", name: "Legacy Partners II", fit: "3 or more employees", price: 275,
    blurb: "For nonprofit and community organizations with 3 or more employees and dedicated volunteers, with or without a brick-and-mortar location, aligned with the Chamber's mission.",
    includesDraft: true, includesFrom: "legacy-partners", includes: ["Spotlights in the newsletter and on social media", "Opportunities to co-host chamber programs"] },
  { id: "the-blueprint", group: "Businesses", name: "The Blueprint", fit: "10 or fewer employees", price: 325,
    blurb: "For small business owners with 10 or fewer employees seeking resources, education, promotion and strategic connections.",
    includesDraft: true, includes: ["Directory listing with logo, photos and links", "Workshops, mentorship and certification guidance", "Grant and funding leads", "Member spotlights and promotion", "Strategic introductions and networking"] },
  { id: "the-black-card", group: "Businesses", name: "The Black Card", fit: "11 or more employees", price: 725,
    blurb: "For established businesses with 11 or more employees seeking elevated visibility, engagement and leadership opportunities.",
    includesDraft: true, includesFrom: "the-blueprint", includes: ["Featured placement in the directory", "Priority spotlights on chamber platforms", "Leadership roles on committees and at events"] },
  { id: "gold-partners", group: "Corporate partners", name: "Gold Partners", fit: "Corporate sponsors", price: 2525,
    blurb: "For corporate partners committed to supporting business growth and community impact by sponsoring events and gaining community visibility at the gold level.",
    includesDraft: true, includes: ["Gold-level sponsorship of chamber events", "Logo recognition at events and on chamber platforms", "Featured directory listing", "Networking with chamber leaders and members"] },
  { id: "platinum-partners", group: "Corporate partners", name: "Platinum Partners", fit: "Premier corporate sponsors", price: 5525, featured: true,
    blurb: "For premier corporate partners seeking the Chamber's highest level of visibility and engagement by sponsoring events and gaining community visibility at the platinum level.",
    includesDraft: true, includesFrom: "gold-partners", includes: ["Premier, platinum-level event sponsorship", "Top recognition across chamber events and platforms", "Speaking opportunities at chamber events"] },
];
