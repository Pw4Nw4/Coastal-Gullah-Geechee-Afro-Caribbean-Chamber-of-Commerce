// ============================================================
//  Q&A KNOWLEDGE BASE — used by the site chat assistant (js/chat.js)
//  and as the source of truth for training/prompting any AI assistant.
//
//  Rules for editing:
//   - Only put facts the chamber has confirmed. Entries marked
//     review:true are drafts the chamber must verify before launch.
//   - q = questions people might ask (add many phrasings, they drive matching).
//   - a = the answer. Optional link = [label, url] shown under the answer.
//     Optional form: "newsletter" shows the email + zip sign-up under the answer.
//   - Anything not covered falls through to FALLBACK (never guess).
//   - PAGE_TIPS (at the end) are what the assistant says on its own about each page.
// ============================================================

const ASSISTANT = {
  name: "Chamber Assistant",
  // The Sankofa bird's speech bubble, shown once per visit a few seconds after the first page loads.
  // Each option opens the chat and asks it; "other" just opens the chat.
  hello: { title: "Welcome to the chamber!", text: "How can I help you today?", options: ["How do I join?", "Get chamber news"], other: "Something else" },
  greeting: "Hi! I can answer questions about the chamber, membership, events, grants and Gullah Geechee heritage. What would you like to know?",
  // Starter buttons shown when the chat opens
  suggestions: ["How do I join?", "What does membership cost?", "Get chamber news", "What is Gullah Geechee?", "What events are coming up?"],
  // The newsletter sign-up the assistant shows in the chat (saved like the site's other email signups)
  signup: { button: "Sign me up", thanks: "You're on the list! Watch your inbox for chamber news.", failed: "Sorry, that didn't go through. Please try again, or call 912-417-9591." },
};

// If the question isn't covered, the assistant says this and offers to pass it to the team.
// Sent questions are saved on the server with the other form submissions (see server/forms.js).
const FALLBACK = {
  text: "I don't have a confirmed answer to that yet, and I don't want to guess. I can send your question to our team, or you can call us at 912-417-9591.",
  emailLabel: "Your email, so we can reply (optional)",
  sendLabel: "Send my question to the team",
  thanks: "Thank you! A team member will reply by email.",
  thanksNoEmail: "Thank you! Your question was passed to the team. For a reply, call 912-417-9591.",
  failed: "Sorry, your question didn't go through. Please try again, or call 912-417-9591.",
};

// Guardrails for any AI model that uses this file as its knowledge.
const SYSTEM_PROMPT = `You are the Chamber Assistant for the Coastal Gullah Geechee & Afro-Caribbean Chamber of Commerce (Savannah, GA).
Mission: educate, empower, and advocate for Gullah Geechee, Afro-Caribbean, minority-owned, and women-owned businesses on the Georgia Coast and beyond. Tagline: Culture at the center, commerce as the pathway forward. Motto: Build Business. Preserve Culture. Strengthen Legacy.
Tone: warm, respectful, plain language, short answers. Treat Gullah Geechee and Afro-Caribbean culture with care and accuracy.
Answer ONLY from the Q&A below. If the answer is not there, or is marked as unconfirmed, say you don't know, do not invent names, dates, prices, deadlines, or grant details, and offer to send the question to the team (phone 912-417-9591, appointment-based office at 1305 Barnard Street, PMB #40, Savannah, GA).
Never give legal, tax, or financial advice; point people to the team or a professional.
Never collect payment details or passwords in chat. For text-message marketing, only sign people up with clear opt-in consent.`;

const QA = [
  // ---------- About the chamber ----------
  { id: "what-is", topic: "About",
    q: ["what is the chamber", "who are you", "what do you do", "tell me about the chamber", "about us", "what is this organization"],
    a: "We're the Coastal Gullah Geechee & Afro-Caribbean Chamber of Commerce. We educate, empower, and advocate for Gullah Geechee, Afro-Caribbean, minority-owned, and women-owned businesses across the Georgia Coast and beyond. Culture is our foundation and commerce is the pathway forward.",
    link: ["Our story", "about.html"] },
  { id: "why-started", topic: "About",
    q: ["why was the chamber started", "why did you start", "why do you exist", "history", "our story", "how did the chamber begin"],
    a: "The chamber started because our communities didn't have representation. We are different, and we wanted a space where Gullah Geechee and Afro-Caribbean entrepreneurs and the culture itself are seen, represented, and supported.",
    link: ["About us", "about.html"] },
  { id: "pillars", topic: "About",
    q: ["what are your programs", "what are the pillars", "what services do you offer", "what do you offer", "focus areas"],
    a: "Our four pillars are: 1) Business Incubator & Resource Pipeline (education, mentorship, certifications, tools), 2) Cultural Tourism & Economic Equity (lifting artisans and heritage-centered businesses), 3) Educational Assets & Land Preservation (ownership support and protecting ancestral land), and 4) Collective Economic Voice (advocacy for underrepresented business communities).",
    link: ["See programs & events", "events.html"] },
  { id: "who-can-join", topic: "Membership",
    q: ["who can join", "am i eligible", "do i have to own a business", "can individuals join", "can i join if i am not gullah geechee", "who is the chamber for"],
    a: "There's a place for everyone: business owners, people who back a business, and anyone who wants to preserve the culture. Our focus is Gullah Geechee, Afro-Caribbean, minority-owned, and women-owned businesses, and supporters are welcome too.",
    link: ["Membership", "membership.html"] },
  { id: "benefit", topic: "Membership",
    q: ["what's in it for me", "what do i get", "benefits", "why should i join", "how will it benefit me", "member benefits", "is it worth it"],
    a: "Members get a directory listing, workshops and mentorship, first look at grant and funding leads, networking (mixers and markets), promotion through social spotlights and our newsletter, and a collective voice on policy that affects coastal businesses.",
    link: ["See member benefits", "membership.html"] },
  { id: "join", topic: "Membership",
    q: ["how do i join", "how to become a member", "sign up", "apply for membership", "become a member", "join the chamber", "membership application"],
    a: "Choose a membership level on the Membership page, fill in your details, and pay securely online through Stripe. A team member follows up with next steps.",
    link: ["Start your membership", "membership.html#join"] },
  { id: "cost", topic: "Membership",
    q: ["how much does membership cost", "membership price", "membership fees", "what are the membership levels", "tiers", "dues", "how much to join"],
    a: "Membership levels are Youngpreneur $50, Solopreneur $150, Legacy Partners $140, Legacy Partners II $275, The Blueprint $325, The Black Card $725, Gold Partners $2,525, and Platinum Partners $5,525. Every membership also includes a one-time $25 registration fee, so for example Youngpreneur totals $75 at checkout.",
    link: ["Membership levels", "membership.html#join"] },
  { id: "which-level", topic: "Membership",
    q: ["which membership level is right for me", "which level should i choose", "what level fits me", "membership requirements", "who is each level for", "difference between the levels", "which tier", "nonprofit membership", "membership for my business", "youngpreneur", "solopreneur", "legacy partners", "the blueprint", "the black card", "gold partners", "platinum partners", "corporate sponsor"],
    a: "It depends on who's joining. Youngpreneur is for young entrepreneurs 15 or younger. Solopreneur is for solo business owners. Legacy Partners is for nonprofits and community organizations with 1 to 2 employees, and Legacy Partners II for those with 3 or more. The Blueprint is for small businesses with 10 or fewer employees, and The Black Card for businesses with 11 or more. Gold Partners and Platinum Partners are for corporate sponsors. Not sure? Call 912-417-9591 and we'll help you choose.",
    link: ["Compare membership levels", "membership.html#join"] },
  { id: "pay", topic: "Membership",
    q: ["how do i pay", "payment methods", "can i pay online", "do you take credit cards", "stripe", "pay dues"],
    a: "Pick your level on the Membership page, fill in your details, and pay securely online through Stripe (credit or debit card). The membership price plus the $25 registration fee are shown before you pay, and you get a receipt by email.",
    link: ["Contact us", "contact.html"] },
  { id: "directory-list", topic: "Directory",
    q: ["how do i get listed", "business directory", "list my business", "add my business", "how to be in the directory", "find a business"],
    a: "Members get a directory profile with a description, photos or logo, category, area, ownership badges, and links to your website, phone, and social media. You can search the directory by name, category, or area.",
    link: ["Browse the directory", "directory.html"] },
  { id: "directory-cost", topic: "Directory",
    q: ["is the directory free", "does it cost to be listed", "do i have to be a member to be listed"],
    a: "Directory listings are a member benefit. Join at a membership level that includes a listing (the team can confirm which).",
    link: ["Join & get listed", "membership.html"] },

  // ---------- Events, grants, resources ----------
  { id: "events", topic: "Events",
    q: ["what events are coming up", "upcoming events", "events calendar", "when is the next event", "what is happening", "event schedule", "workshops"],
    a: "We host workshops, markets, clinics, mixers, and celebrations throughout the year. The Programs & Events page always has the current schedule, plus photos and videos from past events.",
    link: ["See upcoming events", "events.html"] },
  { id: "rsvp", topic: "Events",
    q: ["how do i rsvp", "register for an event", "event tickets", "are events free", "event cost"],
    a: "Use the RSVP button next to the event, or contact us and we'll help you. Cost and registration details vary by event and are listed with each event.",
    link: ["Contact us", "contact.html"] },
  { id: "host-event", topic: "Events",
    q: ["can i host an event", "sponsor an event", "partner with you", "partnership", "sponsorship", "can we collaborate"],
    a: "Yes. We partner with artists, schools, churches, and local businesses. Send us your idea through the Contact page and choose the Sponsorship / Partnership topic.",
    link: ["Get in touch", "contact.html"] },
  { id: "past-events", topic: "Events",
    q: ["past events", "photos of events", "event pictures", "gallery", "videos"],
    a: "You can see photos and videos from past events on the Programs & Events page.",
    link: ["Photo gallery", "events.html#gallery"] },
  { id: "grants", topic: "Resources", review: true,
    q: ["grants", "how do i get a grant", "funding", "who received the grant", "grant opportunities", "loans", "capital", "grant winners"],
    a: "We share grant and funding opportunities with members through our resource pipeline, and we plan to feature each month's grant recipients with pictures and videos. I don't have specific grant names, amounts, or deadlines confirmed yet, so please contact the team for current opportunities.",
    link: ["Business resources & grants", "resources.html"] },
  { id: "certification", topic: "Resources",
    q: ["minority certification", "women owned certification", "mbe", "wbe", "how do i get certified", "vendor certification", "government contracts"],
    a: "We offer guidance on minority-owned (MBE), women-owned (WBE), and local vendor certifications, which can open the door to contracts. Contact the team to get started.",
    link: ["Get help certifying", "resources.html"] },
  { id: "mentorship", topic: "Resources",
    q: ["mentorship", "business incubator", "i want to start a business", "business plan help", "bookkeeping", "training", "classes"],
    a: "Our business incubator pairs members with mentors and helps with business planning, bookkeeping, and marketing basics. Workshops and webinars are shared with members and listed on the events page.",
    link: ["Resources", "resources.html"] },
  { id: "land", topic: "Resources",
    q: ["heirs property", "land preservation", "protect my land", "ancestral land", "land ownership", "title clearing"],
    a: "Land preservation is one of our pillars. We offer education and connect families with partners to help keep ancestral land, including heirs' property guidance. This is general education, not legal advice, so please also consult an attorney.",
    link: ["Land resources", "resources.html"] },
  { id: "tourism", topic: "Resources",
    q: ["cultural tourism", "promote my tour", "heritage tour", "get my craft in front of visitors", "tourism"],
    a: "Our cultural tourism work helps artisans and heritage-centered businesses reach visitors. Members can be listed in the directory and featured in our social spotlights and newsletter.",
    link: ["See the directory", "directory.html"] },

  // ---------- Culture & education (review before launch) ----------
  { id: "gullah", topic: "Culture",
    q: ["what is gullah geechee", "who are the gullah geechee", "gullah geechee meaning", "what does gullah geechee mean", "gullah"],
    a: "The Gullah Geechee are descendants of enslaved West and Central Africans who lived and labored on the coastal plantations of the Carolinas, Georgia, and Florida. Their relative isolation on the Sea Islands and coast let them preserve a distinctive language, foodways, music, crafts, and spiritual traditions, seen in sweetgrass baskets, indigo and haint-blue traditions, rice cultivation, storytelling, and the Gullah language.",
    link: ["Learn more", "about.html#gullah"] },
  { id: "corridor", topic: "Culture",
    q: ["gullah geechee cultural heritage corridor", "heritage corridor", "national heritage area"],
    a: "The Gullah Geechee Cultural Heritage Corridor was designated by Congress in 2006 to recognize and help protect this heritage. It stretches along the coast from North Carolina to Florida.",
    link: ["About us", "about.html"] },
  { id: "haint-blue", topic: "Culture",
    q: ["what is haint blue", "haint blue meaning", "why blue", "why are porch ceilings blue", "colors of the site"],
    a: "Haint blue is the soft blue painted on porch ceilings and doors in Gullah Geechee tradition, believed to keep spirits (\"haints\") away. It's the pale blue on this site, alongside the chamber's gold, blue, teal and sepia brown.",
    link: ["About us", "about.html"] },
  { id: "sankofa", topic: "Culture", review: true,
    q: ["what is sankofa", "sankofa", "sankofa bird", "what does sankofa mean", "why a bird", "who are you bird", "the bird"],
    a: "Sankofa is an Adinkra symbol of the Akan people of Ghana. The word means \"go back and get it\": learn from the past to build the future. The Sankofa bird looks back for the egg on its back, and it's on our seal and our emblem.",
    link: ["About us", "about.html"] },
  { id: "sweetgrass", topic: "Culture",
    q: ["sweetgrass baskets", "what are sweetgrass baskets", "basket weaving"],
    a: "Sweetgrass baskets are coiled baskets handwoven from sweetgrass, a craft passed down through generations of Gullah Geechee artisans. Members who make baskets can be featured in our directory.",
    link: ["Browse artisans", "directory.html"] },
  { id: "afro-caribbean", topic: "Culture", review: true,
    q: ["what is afro caribbean", "afro caribbean connection", "africans and caribbeans", "caribbean heritage", "why caribbean"],
    a: "Gullah Geechee, African, and Afro-Caribbean communities share deep roots in the Atlantic African diaspora. The chamber brings these communities together to support businesses and celebrate shared and distinct traditions. (Detailed story coming soon.)",
    link: ["About us", "about.html"] },
  { id: "robert-smalls", topic: "Culture", review: true,
    q: ["who is robert smalls", "robert smalls", "robert smalls story"],
    a: "Robert Smalls was born enslaved in Beaufort, South Carolina. In 1862 he took command of the Confederate ship CSS Planter and sailed it, with his family and others, to freedom with the Union Navy. He later became a U.S. Congressman. He is a celebrated figure in Gullah Geechee history.",
    link: ["Our heritage stories", "about.html"] },
  { id: "verdite", topic: "Culture", review: true,
    q: ["what is verdite", "verdite", "green stone zimbabwe", "verdic green stone", "green stone"],
    a: "Verdite is a green stone found in southern Africa, including Zimbabwe. [Chamber to add: why verdite matters to our story and how it connects to the culture we celebrate.]",
    link: ["About us", "about.html"] },

  // ---------- Contact, newsletter, support ----------
  { id: "contact", topic: "Contact",
    q: ["how do i contact you", "phone number", "email address", "address", "where are you located", "office hours", "can i visit", "appointment", "location"],
    a: "Call 912-417-9591. Our office is at 1305 Barnard Street, PMB #40, Savannah, GA, and we operate by appointment and at community programs and events. You can also use the Contact page.",
    link: ["Contact us", "contact.html"] },
  { id: "newsletter", topic: "Contact",
    q: ["get chamber news", "chamber news", "news", "newsletter", "subscribe", "email list", "get updates", "email updates", "stay in the loop", "mailing list"],
    a: "Join our email list with your email and zip code to get chamber news, events, funding leads and member spotlights. It's free and you can unsubscribe anytime. Sign up right here, or with the sign-up form on any page.",
    form: "newsletter" },
  { id: "text", topic: "Contact", review: true,
    q: ["text messages", "sms", "text alerts", "text updates", "opt out", "stop texts"],
    a: "Text updates are coming soon. We will only text you if you clearly opt in, and you'll always be able to opt out. Standard message and data rates may apply.",
    link: ["Contact us", "contact.html"] },
  { id: "donate", topic: "Support",
    q: ["how do i donate", "donation", "give", "support the chamber", "sponsor", "volunteer"],
    a: "You can support us by donating, sponsoring, volunteering, or joining. Call 912-417-9591 or send us a message and we'll help you give, volunteer or sponsor.",
    link: ["Contact us", "contact.html"] },
  { id: "social", topic: "Contact",
    q: ["social media", "instagram", "facebook", "tiktok", "linkedin", "follow you"],
    a: "Find us on Instagram (@gullahgeecheecaribbeanchamber) and TikTok (@gullahgeecheecaribbeancc). More channels are coming.",
    link: ["Contact us", "contact.html"] },
  { id: "team", topic: "About", review: true,
    q: ["who runs the chamber", "who is the founder", "leadership", "board", "team", "ambassadors", "who is the president"],
    a: "Our leadership and ambassadors are listed on the About page. (Names and titles are being added.) For anything specific, contact the team.",
    link: ["Leadership", "about.html"] },
  { id: "report", topic: "About", review: true,
    q: ["six month report", "6 month report", "what have you accomplished", "impact", "results", "proof of what you have done"],
    a: "We plan to publish a 6-month report showing our team, the people we serve, and proof of what we've done. It isn't published yet. Check back soon or subscribe to the newsletter.",
    link: ["About us", "about.html"] },
  { id: "hello", topic: "Chat",
    q: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "how are you"],
    a: "Hello! Welcome. I'm happy to help with questions about the chamber, membership, events, grants, or Gullah Geechee heritage. What can I help you with?" },
  { id: "thanks", topic: "Chat",
    q: ["thanks", "thank you", "appreciate it", "that helps", "great", "bye", "goodbye"],
    a: "You're welcome! If you think of anything else, I'm here. Culture at the center, commerce as the pathway forward." },
  { id: "human", topic: "Chat",
    q: ["talk to a person", "speak to someone", "human", "real person", "representative", "call me"],
    a: "Of course. Call 912-417-9591 or send a message through the Contact page and a team member will respond.",
    link: ["Contact us", "contact.html"] },
];

// ============================================================
//  PAGE TIPS: what the assistant says on its own about each page.
//  After the welcome, on each new page the bird "thinks", then shares one of that page's tips, picked at random
//  (see js/chat.js). Keep each one true to what the page says, and short (one or two sentences).
//   - ask = a question the button asks in the chat: "Question?" (the label too) or ["Label", "Question?"].
//     Check it gets the intended answer; ["Label", ""] just opens the chat.
//   - link = ["Label", "url or #anchor on the page"]
//  A few use the site data in js/data.js, so they stay current when it changes (left out if the data is empty).
// ============================================================
const PAGE_TIPS = (() => {
  // typeof keeps this file usable on its own (say, by an AI pipeline) without js/data.js loaded first
  const tiers = typeof TIERS !== "undefined" ? TIERS : [];
  const cheapest = tiers.reduce((a, t) => (!a || t.price < a.price ? t : a), null);
  const fee = typeof REGISTRATION_FEE !== "undefined" ? REGISTRATION_FEE : null;
  const next = typeof EVENTS !== "undefined" ? EVENTS[0] : null;
  const date = (e) => `${e.m.charAt(0)}${e.m.slice(1).toLowerCase()} ${Number(e.d)}`;
  const site = typeof SITE !== "undefined" ? SITE : { phone: "912-417-9591", phoneHref: "tel:+19124179591" };
  const news = ["Sign me up", "Get chamber news"];

  const tips = {
    "index.html": [
      { text: "We're the chamber for Gullah Geechee, Afro-Caribbean, minority-owned and women-owned businesses across the Georgia Coast.", ask: "Who can join?" },
      tiers.length && { text: `There are ${tiers.length} membership levels, from Youngpreneurs to corporate partners, and every price is shown up front.`, ask: "Which level should I choose?" },
      { text: "Looking for a caterer, a heritage tour or a sweetgrass basket? Search the member directory right on this page.", link: ["Search members", "#dir-title"] },
      { text: "Our work stands on four pillars: a business incubator, cultural tourism, land preservation and a collective economic voice.", ask: "What are the pillars?" },
      { text: "Get chamber news by email: events, grant leads and member spotlights. It's free.", ask: news },
    ],
    "about.html": [
      { text: "Our communities built businesses on this coast for generations, often without a seat at the table. The chamber was started to change that.", ask: "Why was the chamber started?" },
      { text: "The Gullah Geechee kept their language, foodways, music and craft alive along the Southern coast for generations.", ask: "What is Gullah Geechee?" },
      { text: "See the pale blue around the site? It's haint blue, the color painted on Lowcountry porch ceilings.", ask: "What is haint blue?" },
      { text: "I'm the Sankofa bird from our seal. Sankofa means “go back and get it”: learn from the past to build the future.", ask: "What is Sankofa?" },
      { text: "There's a place for everyone here: join, volunteer, sponsor or partner with us.", ask: ["How can I help?", "How can I support the chamber?"] },
    ],
    "events.html": [
      next && { text: `Next on the calendar: ${next.title}, ${date(next)} (${next.where}).`, link: ["See the details", "#upcoming-title"] },
      { text: "We host workshops, markets, clinics, mixers and celebrations up and down the coast.", ask: "What events are coming up?" },
      { text: "Have an idea for an event? We partner with artists and makers, schools, churches and local businesses.", ask: "Can I host an event?" },
      { text: "Want to come to one? Each event has an RSVP button, and we're happy to help you sign up.", ask: "How do I RSVP?" },
      { text: "Never miss one: the newsletter brings new events, grant leads and member news to your inbox.", ask: news },
    ],
    "directory.html": [
      { text: "Every listing here is a chamber member: a neighbor, an artisan, a keeper of tradition.", link: ["Search the directory", "#q"] },
      { text: "Shopping with purpose? Filter by Gullah Geechee, Afro-Caribbean, minority-owned or women-owned.", link: ["Filter by ownership", "#chips"] },
      { text: "Own a business? Members get a profile here with photos, links and ownership badges.", ask: "How do I get listed?" },
      { text: "Listings are a member benefit. Ask me which levels include one.", ask: "Is the directory free?" },
      { text: "Sweetgrass baskets are handwoven by Gullah Geechee artisans, a craft passed down for generations.", ask: "What are sweetgrass baskets?" },
    ],
    "resources.html": [
      { text: "Members hear about new grants, microloans and community lenders first.", ask: "How do I get a grant?" },
      { text: "MBE and WBE certifications can open the door to contracts, and we can guide you through them.", ask: "How do I get certified?" },
      { text: "Starting out? The business incubator pairs you with a mentor for your plan, bookkeeping and marketing.", ask: ["Tell me more", "Business incubator"] },
      { text: "Heirs' property can put family land at risk. We share education and partners to help families keep it.", ask: ["Heirs' property", "Heirs property"] },
      { text: "Run a tour or make a heritage craft? The cultural tourism toolkit helps you reach visitors.", ask: ["Cultural tourism", "Cultural tourism"] },
    ],
    "membership.html": [
      cheapest && { text: `Memberships start at $${cheapest.price} for the ${cheapest.name} level. Every price is shown up front${fee ? `, plus a one-time $${fee} registration fee` : ""}.`, ask: "What does membership cost?" },
      { text: "Not sure which level fits? Each one matches who's joining: solo owners, nonprofits, small businesses or corporate partners.", ask: "Which level should I choose?" },
      { text: "Members get a directory listing, workshops, first look at grant leads, networking, promotion and a collective voice.", ask: ["What's included?", "Member benefits"] },
      { text: "Paying is secure: you check out on Stripe, and we never see or store your card.", ask: "How do I pay?" },
      { text: "Signing up a young entrepreneur? For Youngpreneurs (15 and under), a parent or guardian fills in the form.", ask: ["About Youngpreneur", "Youngpreneur"] },
    ],
    "contact.html": [
      { text: `Prefer to talk? Call ${site.phone}. We meet by appointment and at our community programs and events.`, link: [`Call ${site.phone}`, site.phoneHref] },
      { text: "Pick a topic in the form, like membership, events or sponsorship, so the right person gets back to you.", link: ["Write to us", "#contact-form"] },
      { text: "Want to sponsor or partner? Choose “Sponsorship or partnership” in the form and tell us your idea.", ask: ["Partnership ideas", "Sponsorship"] },
      { text: "Follow along on Instagram and TikTok for member spotlights and event news.", ask: ["Where to follow", "Social media"] },
      { text: "Rather ask me first? I can answer questions about membership, events and grants right now.", ask: ["Ask the assistant", ""] },
    ],
  };
  // Drop the data-driven tips whose data is empty
  return Object.fromEntries(Object.entries(tips).map(([page, list]) => [page, list.filter(Boolean)]));
})();
