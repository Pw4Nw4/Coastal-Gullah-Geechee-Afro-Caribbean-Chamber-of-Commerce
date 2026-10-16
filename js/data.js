// ============================================================
//  SITE CONTENT — edit this file to update the whole site.
//  Publish only chamber-confirmed content. Empty collections
//  show useful contact paths or keep unfilled media sections hidden.
//  SAMPLE_DATA is reserved for explicitly labeled internal drafts.
// ============================================================
const SAMPLE_DATA = false;

const SITE = {
  name: "Coastal Gullah Geechee & Afro-Caribbean Chamber of Commerce",
  short: "Coastal Gullah Geechee & Afro-Caribbean Chamber",
  phone: "912-417-9591",
  phoneHref: "tel:+19124179591",
  email: "info@coastalgullahgeecheeafrocarribeanchamber.com", // confirm real address
  address: "1305 Barnard Street, PMB #40, Savannah, GA",
  donate: "https://www.zeffy.com/en-US/donation-form/support-the-coastal-gullah-geechee-and-afro-caribbean-chamber-of-commerce",
  checkoutEndpoint: "/api/checkout", // starts Stripe Checkout (server/checkout.js)
  formsEndpoint: "/api/forms", // saves signups, messages and chat questions (server/forms.js)
  // Social links set to "#" are hidden until a real URL is added
  social: [
    { label: "Facebook", url: "https://www.facebook.com/profile.php?id=61590918141660" },
    { label: "Instagram", url: "https://instagram.com/gullahgeecheecaribbeanchamber" },
    { label: "LinkedIn", url: "#" },
    { label: "TikTok", url: "https://tiktok.com/@gullahgeecheecaribbeancc" },
  ],
};

// Directory categories
const CATEGORIES = ["Food & Hospitality", "Arts & Crafts", "Professional Services", "Retail & Fashion", "Tours & Culture", "Health & Wellness", "Construction & Trades", "Education & Media"];
const AREAS = ["Savannah", "Brunswick", "Darien / McIntosh", "Liberty County", "St. Simons / Sapelo", "Other Coastal GA"];

// Add chamber-confirmed member businesses here; no illustrative listings are published.
const MEMBERS = [];

// Add confirmed dates and registration links when the chamber announces an event.
const EVENTS = [];

// Past event pictures. Put photos in /images/events and list them here, newest first:
//   { src: "images/events/makers-market-1.jpg", cap: "Heritage Makers Market, November 2026" }
// The gallery sections stay hidden until at least one photo is listed.
const GALLERY = [];

// Videos for "Watch and listen" on the events page. Three kinds:
//   YouTube:   { id: "VIDEO_ID", title }                 (the part after v= in the link)
//   Instagram: { instagram: "CODE", title, credit }      (the part after /reel/ in the link)
//   Our file:  { file: "videos/name.mp4", title, credit } (an MP4 in /videos; only with the owner's permission)
// Instagram videos show through Instagram's own embed, so they stay credited to whoever posted them; credit names
// the maker under the video for every kind. With a key, a page can also show one video by itself:
// <div data-video="key"></div>. The video section stays hidden until there's at least one video.
const VIDEOS = [
  { key: "what-is-gullah-geechee", instagram: "DcBnmNQuZSC", title: "“What is Gullah Geechee?” Our grand opening", credit: "Regine Stepherson (@iamqueenreginee)" },
  { key: "ribbon-cutting", instagram: "DbyTgOnAlem", title: "Our ribbon-cutting ceremony", credit: "Rinnie Renee (@rinsbeautybar_)" },
  // Hosted here with Dee Daniels Media's permission (their trailer for the episode, Instagram reel Da022G5NG8u)
  { key: "why-we-started", file: "videos/made-of-savannah-podcast-trailer.mp4", title: "Our story on the Made of Savannah Podcast", credit: "Dee Daniels Media (@deedanielsmedia)" },
];

// Gold and Platinum partners for the "Our partners" strip on the home page. Add each as
//   { name: "Partner Name", logo: "images/partners/partner-name.png", url: "https://partner.example" }
// logo and url are optional (the name shows without a logo). The strip stays hidden until one is listed.
const PARTNERS = [];

// Leadership & ambassadors verified against the chamber's official leadership page.
// Add an approved headshot path as img, or leave it empty to show the person's initials.
const LEADERS = [
  { name: "Mahogany Bowers", role: "President", img: "" },
  { name: "Dora Jenkins", role: "Vice Chairman", img: "" },
  { name: "Jahva Walker", role: "Treasurer", img: "" },
  { name: "Dr. Sally Ann Gray", role: "Chief Ambassador", img: "" },
];

// Membership levels: names, groups and descriptions from the live site's membership page, prices (in dollars)
// from its checkout. Every membership also pays REGISTRATION_FEE. "fit" is the short who-qualifies tag shown
// next to the name; guardian: true shows the parent/guardian note in the form. Ids and prices must match
// server/checkout.js, which decides what Stripe charges.
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
