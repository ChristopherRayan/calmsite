// Fallback frontend settings used when CMS payload is unavailable.
import type { FrontendContentPayload } from '@/lib/types';

export const defaultFrontendSettings: FrontendContentPayload = {
  brand_name: 'The CalmTable',
  brand_tagline: 'Dine with Dignity',
  contact: {
    address_line_1: 'Near Simso Filling Station',
    address_line_2: 'Luwinga, Mzuzu, Malawi',
    phone: '+265 999 000 000',
    email: 'hello@calmtable.mw',
    whatsapp: '+265 888 000 000',
    map_embed_url:
      'https://maps.google.com/maps?q=Simso%20Filling%20Station%2C%20Luwinga%2C%20Mzuzu%2C%20Malawi&t=&z=15&ie=UTF8&iwloc=&output=embed',
    opening_hours: [
      { day: 'Monday - Friday', hours: '07:00 - 21:00' },
      { day: 'Saturday', hours: '08:00 - 22:00' },
      { day: 'Sunday', hours: 'Closed' },
    ],
  },
  home: {
    hero_eyebrow: 'The CalmTable & Family Restaurant',
    hero_title_prefix: 'Modern fine dining with a',
    hero_title_emphasis: 'calm atmosphere',
    hero_title_suffix: 'and unforgettable flavors.',
    hero_description:
      'Join us for handcrafted dishes, warm hospitality, and premium ambiance near Simso Filling Station, Luwinga, Mzuzu.',
    hero_bg_image: '/images/hero-placeholder.png',
    about_image: '/images/hero-placeholder.png',
    story_quote: 'Good food is the foundation of genuine happiness - we serve both.',
    story_description:
      'The CalmTable started as a family kitchen with one promise: feed every guest with dignity and care. Today we serve Malawian favorites, fresh fish, and heritage recipes in a refined, welcoming setting.',
    about_features: [
      { title: 'Fresh Daily', description: 'Cooked every morning' },
      { title: 'Family Owned', description: 'Since 2012' },
      { title: 'Made with Care', description: 'Every single plate' },
    ],
    why_items: [
      { title: 'Local Ingredients', description: 'We source directly from Malawian suppliers for daily freshness.' },
      { title: 'Family Atmosphere', description: 'Every guest receives warm, dignified, and personal service.' },
      { title: 'Fast Service', description: 'Meals arrive hot and quickly, without compromising quality.' },
      { title: 'Hygiene First', description: 'Clean kitchen, strict standards, and consistent food safety.' },
    ],
    stats: {
      years_serving: '12+',
      menu_items: '80+',
      rating: '4.9★',
    },
    reservation_banner_title: 'Book a Table for',
    reservation_banner_emphasis: 'An Unforgettable Evening',
    reservation_banner_description:
      'Reserve your table in advance and let us prepare your premium dining experience.',
    reservation_bg_image: '/images/hero-placeholder.svg',
    testimonials: [
      {
        quote: 'The Chambo was absolutely divine. I keep coming back because the quality never drops.',
        author: 'Amara Nkhoma',
      },
      {
        quote: 'Our family reunion was hosted perfectly. Warm service, great portions, and elegant atmosphere.',
        author: 'Chisomo Banda',
      },
      {
        quote: 'Best Masamba Otendera in Mzuzu. Authentic taste and consistently professional service.',
        author: 'Takondwa Mwale',
      },
    ],
    gallery_images: [
      { src: '/images/gallery-1.png', title: 'Warm Interiors', description: 'Warm interior lighting and dining ambience.' },
      { src: '/images/gallery-2.svg', title: 'Signature Plate', description: 'Signature plated dish with seasonal garnish.' },
      { src: '/images/gallery-3.svg', title: 'Fresh Prep', description: 'Fresh ingredients prepared for today’s service.' },
      { src: '/images/gallery-4.svg', title: 'Table Setting', description: 'Elegant table setting for evening guests.' },
      { src: '/images/gallery-5.svg', title: 'Chef Craft', description: 'Chef finishing touches on a premium course.' },
      { src: '/images/reservation-bg.png', title: 'Cozy Dining', description: 'Cozy dining space with intimate seating.' },
    ],
  },
  home_page: {
    hero: {
      kicker: 'Pan-African & Global Dining',
      title_html: '<span>A calm place to</span>gather<br/>&amp; <em>eat well.</em>',
      side_label: 'Est. CalmTable',
      stats: [
        { value: '4+', label: 'African Regions' },
        { value: '80+', label: 'Menu Items' },
        { value: '4.9', label: 'Guest Rating' },
      ],
      cta: {
        label: 'Reserve →',
        sublabel: 'Book your calm table',
      },
      images: {
        primary: '/images/hero_bg.jpg',
        secondary: '/images/hero2_bg.jpg',
      },
    },
    reservation: {
      tag: 'Reservations',
      title_html: 'Book your<br/>calm table',
      note: 'Guests are never rushed. We keep a seat ready for you — warm, unhurried, and always welcoming.',
      hours: [
        { day: 'Monday – Friday', hours: '07:00 – 21:00' },
        { day: 'Saturday', hours: '08:00 – 22:00' },
        { day: 'Sunday', hours: '09:00 – 20:00' },
        { day: 'Private Events', hours: 'By arrangement' },
      ],
      form: {
        title: 'Complete your booking',
        times: [
          '07:00',
          '07:30',
          '08:00',
          '08:30',
          '12:00',
          '12:30',
          '13:00',
          '13:30',
          '18:00',
          '18:30',
          '19:00',
          '19:30',
          '20:00',
          '20:30',
        ],
        guests: [
          '1 guest',
          '2 guests',
          '3 guests',
          '4 guests',
          '5 guests',
          '6 guests',
          '7 – 10 guests',
          '11+ (private event)',
        ],
        occasions: ['Regular dining', 'Business lunch', 'Birthday', 'Anniversary', 'Private event', 'Other'],
        request_placeholder: 'Dietary needs, seating preferences…',
        submit_label: 'Confirm Reservation',
        success_label: '✓ Reservation Requested',
      },
    },
    marquee: {
      items: [
        'A calm place to dine',
        'African flavours. Calm moments.',
        'Gather calmly. Eat well.',
        'Where food meets peace.',
        'Gather. Eat. Rest.',
        'Simple food. Clean ingredients. Honest cooking.',
      ],
    },
    brand: {
      eyebrow: 'Our Story',
      quote_html: 'A peace-first dining<br/>concept rooted in<br/><em>African flavour</em><br/>&amp; calm hospitality.',
      body:
        'CalmTable was designed to be location-agnostic — operating successfully in cities, university towns, border regions, and travel corridors across Africa and beyond. Every element, from the menu to the atmosphere, is calibrated for one purpose: a genuinely calm, welcoming experience.',
      pills: [
        'Pan-African Identity',
        'Internationally Adaptable',
        'Family-Friendly',
        'Meeting-Ready',
        'No rush, ever',
        'Operationally Scalable',
      ],
      cta_label: 'Read our full story →',
      cta_href: '/about',
      stats: [
        { value: '12+', label: 'Years of calm service' },
        { value: '4+', label: 'African culinary regions' },
        { value: '80+', label: 'Dishes on the menu' },
        { value: '4.9', label: 'Average guest rating' },
      ],
    },
    pillars: {
      eyebrow: 'What We Stand For',
      title_html: 'Five principles that<br/>define <em>every detail</em>',
      items: [
        {
          number: '01',
          title: 'Calm & Comfort',
          description:
            'Peaceful, unhurried dining — always. Guests are never rushed. Our spaces are designed for lingering, reflecting, and connecting.',
        },
        {
          number: '02',
          title: 'Hospitality',
          description:
            'Every guest is welcomed with respect and genuine warmth — from the first greeting to the final goodbye, no exceptions.',
        },
        {
          number: '03',
          title: 'Quality & Consistency',
          description:
            'Reliable food and service across every CalmTable location. The same standard, wherever you find us — city, town, or transit hub.',
        },
        {
          number: '04',
          title: 'Inclusivity',
          description:
            'Culturally neutral and globally welcoming. Families, professionals, travellers, students, and NGO workers are all equal at our table.',
        },
        {
          number: '05',
          title: 'Sustainability',
          description:
            'Responsible sourcing, local supplier preference, fair procurement, and operations that actively respect the communities we serve.',
        },
      ],
    },
    cuisine: {
      eyebrow: 'Our Menu',
      title_html: 'Dishes from across<br/>the <em>African continent</em>',
      description:
        'CalmTable celebrates African culinary diversity — freshly prepared, community-oriented, balanced. International dishes are available on request and as rotating specials for global guests.',
      regions: [
        {
          region: 'Southern Africa',
          name: 'Grains & Greens',
          dishes: ['Nsima / Pap / Sadza', 'Beans & lentils', 'Leafy greens', 'Chicken, goat, fish'],
        },
        {
          region: 'East Africa',
          name: 'Swahili Coast',
          dishes: ['Pilau-style rice', 'Coconut stews', 'Chapati', 'Swahili dishes'],
        },
        {
          region: 'West Africa',
          name: 'Bold & Hearty',
          dishes: ['Jollof-style rice', 'Peanut stews', 'Plantain', 'Seasonal specials'],
        },
        {
          region: 'Central Africa',
          name: 'Root & Stew',
          dishes: ['Cassava meals', 'Vegetable stews', 'Slow proteins', 'Rotating specials'],
        },
      ],
      intl_note:
        'International & Global Dishes — available on request, as rotating specials, and for long-stay guests, tourists & corporate groups.',
      link_label: 'View Full Menu',
      link_href: '/menu',
    },
    service: {
      eyebrow: 'How We Serve',
      title_html: 'Service that is<br/>calm, attentive,<br/><em>&amp; deeply human</em>',
      body:
        'Our service model is standardised but never robotic — enabling consistency at scale while ensuring every guest feels personally cared for. No performance. No pressure. Just presence.',
      quote: '"Guests should feel welcome to stay — not rushed."',
      steps: [
        {
          number: '01',
          title: 'Calm welcome',
          description: 'Every guest is greeted warmly before anything else. No queue pressure, no rush to be seated.',
        },
        {
          number: '02',
          title: 'Optional menu guidance',
          description: 'Personalised help — especially for first-time guests discovering Pan-African cuisine.',
        },
        {
          number: '03',
          title: 'Flexible ordering',
          description: 'Special requests, dietary needs, international options — always accommodated without fuss.',
        },
        {
          number: '04',
          title: 'Comfortable, unhurried pacing',
          description: 'Food served neatly and on time. No pressure to leave. Guests are always welcome to linger.',
        },
        {
          number: '05',
          title: 'Menu explained with care',
          description: 'Especially for first-time visitors — every dish has a story, and our team is proud to tell it.',
        },
      ],
    },
    testimonials: {
      eyebrow: 'Guest Voices',
      title_html: 'What our guests <em>say</em>',
      items: [
        {
          quote:
            'The CalmTable turns every meal into an occasion. The flavors are rich, the service is warm — nothing feels rushed.',
          author: 'Zione Phiri',
        },
        {
          quote: 'We hosted our engagement dinner here and everything felt polished and intimate. Highly recommend.',
          author: 'Natasha Mbewe',
        },
        {
          quote: 'Every plate arrives with genuine care. The most consistent dining experience I have found.',
          author: 'Brian Tembo',
        },
        {
          quote: 'The ambiance, the plating, the hospitality — all premium without feeling stiff or hurried.',
          author: 'Ethel Banda',
        },
      ],
    },
    community: {
      eyebrow: 'Community & Responsibility',
      title_html: 'Responsible in every<br/>community we <em>enter</em>',
      body:
        'CalmTable integrates responsibly into every location — not imposing, but contributing genuine value. No ideological positioning — quality and responsibility only.',
      pills: [
        'Student discounts',
        'Quiet mornings for seniors',
        'Local farmer partnerships',
        'Local employment first',
        'Food-waste reduction',
        'Fair procurement',
        'Faith-neutral values',
      ],
      items: [
        {
          icon: '◉',
          title: 'Local Sourcing',
          description:
            'Preference for local suppliers and farmers — building supply chains that genuinely support the communities we operate in.',
        },
        {
          icon: '◎',
          title: 'Employment & Training',
          description:
            'We hire locally and invest in staff development — CalmTable is a training ground for future hospitality professionals.',
        },
        {
          icon: '◈',
          title: 'Cultural Respect',
          description: 'Deep respect for regional food cultures. Values-based, not ideologically positioned.',
        },
        {
          icon: '◇',
          title: 'Inclusive Access',
          description:
            'Discount days for students, quiet mornings for seniors — calm dining for everyone, not just a privileged few.',
        },
      ],
    },
    formats: {
      eyebrow: 'Growth & Scalability',
      title_html: 'CalmTable<br/><em>in every format</em>',
      note: 'CalmTable is designed as a multi-location brand — each format shares the same core DNA, with local menu adaptations.',
      items: [
        {
          number: '01',
          title: 'Flagship',
          description: 'Full dining experience with the complete Pan-African core menu and international specials on request.',
        },
        {
          number: '02',
          title: 'CalmTable Café',
          description: 'Lighter fare and beverages — ideal for work meetings, quiet mornings, and short visits.',
        },
        {
          number: '03',
          title: 'Garden',
          description: 'Outdoor dining for locations with natural spaces — the calm of nature brought to the table.',
        },
        {
          number: '04',
          title: 'Catering',
          description: 'Custom menus for events, NGOs, corporate groups, and special gatherings of any size.',
        },
        {
          number: '05',
          title: 'Express',
          description: 'Limited-menu format for transit hubs, university canteens, and travel corridors.',
        },
      ],
    },
    gallery: {
      eyebrow: 'Gallery',
      title_html: 'Spaces &amp; <em>moments</em>',
      items: [
        { label: 'The Dining Room', image: '/images/gallery-1.png' },
        { label: 'Garden Setting', image: '/images/gallery-2.png' },
        { label: 'Pan-African Menu', image: '/images/gallery-3.png' },
        { label: 'The Atmosphere', image: '/images/gallery-4.svg' },
        { label: 'Calm Evenings', image: '/images/gallery-5.svg' },
        { label: 'Community Table', image: '/images/reservation-bg.png' },
      ],
    },
    final_cta: {
      title_html: 'Come to<br/>the <em>table.</em>',
      subtitle: 'Find your nearest CalmTable location. Reserve your seat. Stay as long as you like.',
      button_label: 'Reserve a Table',
      button_href: '#reservations',
    },
    footer: {
      tagline:
        '\"A peaceful dining space where wholesome food, warm hospitality, and calm moments come together.\"',
      columns: [
        {
          title: 'Navigate',
          links: [
            { label: 'Home', href: '/' },
            { label: 'Menu', href: '/menu' },
            { label: 'About Us', href: '/about' },
            { label: 'Contact', href: '/contact' },
            { label: 'Reservations', href: '#reservations' },
          ],
        },
        {
          title: 'Formats',
          links: [
            { label: 'Flagship', href: '/menu' },
            { label: 'CalmTable Café', href: '/menu' },
            { label: 'Garden', href: '/menu' },
            { label: 'Catering', href: '/contact' },
            { label: 'Express', href: '/menu' },
          ],
        },
        {
          title: 'Follow',
          links: [
            { label: 'Instagram', href: '#' },
            { label: 'Facebook', href: '#' },
            { label: 'TikTok', href: '#' },
            { label: 'WhatsApp', href: '#' },
          ],
        },
      ],
      bottom_left: '© 2026 CalmTable. Dine with Dignity.',
      bottom_right: 'Pan-African & Global Dining',
    },
  },
  about: {
    description:
      'Near Simso Filling Station in Luwinga, we serve premium dishes in a warm family-restaurant setting.',
    cards: [
      {
        title: 'Vision',
        body: 'Build a modern Malawian dining brand where consistency, comfort, and quality define every table.',
      },
      {
        title: 'Cuisine',
        body: 'Local favorites and signature mains from chambo to goat dishes, with curated snacks and beverages.',
      },
      {
        title: 'Service',
        body: 'Fast reservations, smooth checkout, and attentive hosting for both casual and formal dining moments.',
      },
    ],
  },
  members: {
    description: 'Create an account and unlock premium dining perks designed for regular guests and families.',
    benefits: [
      {
        title: 'Priority Reservations',
        description: 'Members get early access to peak evening slots and seasonal tasting nights before public release.',
      },
      {
        title: 'Member-only Offers',
        description: 'Receive curated discounts on signature dishes, family platters, and selected beverages every month.',
      },
      {
        title: 'Birthday Rewards',
        description:
          'Celebrate with a complimentary dessert pairing and a personalized table setup for your birthday booking.',
      },
      {
        title: 'Faster Checkout',
        description: 'Saved account details and order history help members reorder favorites and complete checkout in seconds.',
      },
    ],
  },
};
