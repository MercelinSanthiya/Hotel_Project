import privacy from "../../assets/images/privacy.jpg";
import terms from "../../assets/images/terms.jpg";
import cookie from "../../assets/images/cookie.webp";
import access from "../../assets/images/acces.jpeg";


export const legalContent = {
  "privacy-policy": {
    title: "Privacy Policy",
    tagline: "How we collect, use, and protect your information.",
    heroImage: privacy,
    updated: "Last updated: August 2026",
    sections: [
      {
        heading: "What we collect",
        body:
          "When you create an account, make a booking, or contact us, we collect information such as your name, email address, phone number, and booking details (dates, room or experience selected, and payment status). We also collect basic technical information like your browser type and IP address to keep StayNest secure.",
      },
      {
        heading: "How we use it",
        body:
          "We use your information to process bookings, send booking confirmations and updates, respond to enquiries, and improve StayNest. We never sell your personal information to third parties.",
      },
      {
        heading: "Cookies",
        body:
          "We use a small number of cookies to keep you signed in and to remember your preferences. See our Cookie Preferences page for more detail and how to manage them.",
      },
      {
        heading: "Your choices",
        body:
          "You can review or update your account details at any time from your Profile page, and you can request that we delete your account and associated data by contacting reservations@staynest.com.",
      },
    ],
  },
  "terms-of-use": {
    title: "Terms of Use",
    tagline: "The guidelines that keep StayNest fair for everyone.",
    heroImage: terms,
    updated: "Last updated: August 2026",
    sections: [
      {
        heading: "Using StayNest",
        body:
          "By creating an account or making a booking through StayNest, you agree to provide accurate information and to use the site only for genuine personal bookings and enquiries.",
      },
      {
        heading: "Bookings & cancellations",
        body:
          "A booking is held as \"Pending\" until confirmed by our team. You may cancel a pending booking at any time from your Profile page before it is confirmed. Cancelled bookings remain visible in your profile on the day they were cancelled and are then removed the following day.",
      },
      {
        heading: "Offers & pricing",
        body:
          "Any percentage discount shown against a room or experience is valid only until the expiry date and time displayed with the offer, after which standard pricing applies automatically.",
      },
      {
        heading: "Liability",
        body:
          "StayNest and its staff make reasonable efforts to keep listed availability, pricing, and offers accurate and up to date, but occasional errors may occur; we will always contact you before charging or confirming a booking affected by such an error.",
      },
    ],
  },
  "cookie-preferences": {
    title: "Cookie Preferences",
    tagline: "A quick look at what we store and why.",
    heroImage: cookie,
    updated: "Last updated: August 2026",
    sections: [
      {
        heading: "Essential cookies",
        body:
          "These keep you signed in to your account and let you complete a booking. They can't be switched off, as the site won't function correctly without them.",
      },
      {
        heading: "Preference cookies",
        body:
          "These remember small choices you make while browsing, such as the last filters you used on the Rooms & Suites or Experiences pages, so you don't have to reset them every visit.",
      },
      {
        heading: "Managing cookies",
        body:
          "You can clear cookies at any time from your browser's settings. Doing so will sign you out of StayNest and reset any saved preferences.",
      },
    ],
  },
  accessibility: {
    title: "Accessibility",
    tagline: "Building StayNest to work well for every guest.",
    heroImage: access,
    updated: "Last updated: August 2026",
    sections: [
      {
        heading: "Our commitment",
        body:
          "We want everyone to be able to browse rooms, dining, and experiences and complete a booking on StayNest, regardless of ability. We aim to follow recognised web accessibility guidance across the site.",
      },
      {
        heading: "What we're doing",
        body:
          "This includes clear text alternatives for images, keyboard-friendly navigation and forms, and sufficient colour contrast throughout the site.",
      },
      {
        heading: "Let us know",
        body:
          "If you run into anything on StayNest that's difficult to use, please contact reservations@staynest.com and let us know which page it was on — we'll look into it.",
      },
    ],
  },
};