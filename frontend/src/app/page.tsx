'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

import styles from './page.module.css';

import { defaultFrontendSettings } from '@/lib/frontend-settings';
import { fetchFeaturedMenuItems, fetchFrontendSettings } from '@/lib/services';
import { normalizeImageSource, shouldSkipImageOptimization } from '@/lib/image';
import type { FrontendContentPayload, HomePageContent, MenuItem } from '@/lib/types';

const fallbackHomePage: HomePageContent = {
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
      guests: ['1 guest', '2 guests', '3 guests', '4 guests', '5 guests', '6 guests', '7 – 10 guests', '11+ (private event)'],
      occasions: [
        'Regular dining',
        'Business lunch',
        'Birthday',
        'Anniversary',
        'Private event',
        'Other',
      ],
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
    note:
      'CalmTable is designed as a multi-location brand — each format shares the same core DNA, with local menu adaptations.',
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
      '"A peaceful dining space where wholesome food, warm hospitality, and calm moments come together."',
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
};

const TESTIMONIAL_INTERVAL = 6500;
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export default function HomePage() {
  const [settings, setSettings] = useState<FrontendContentPayload>(defaultFrontendSettings);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [reservationTime, setReservationTime] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationGuests, setReservationGuests] = useState('2 guests');
  const [reservationOccasion, setReservationOccasion] = useState('Regular dining');
  const [reservationNote, setReservationNote] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [reservationStatus, setReservationStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [featuredDish, setFeaturedDish] = useState<MenuItem | null>(null);
  const intervalRef = useRef<number | null>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], ['0%', '20%']);

  useEffect(() => {
    let active = true;
    async function loadSettings() {
      try {
        const data = await fetchFrontendSettings();
        if (active) {
          setSettings(data);
        }
      } catch (_error) {
        // Keep fallback content.
      }
    }

    void loadSettings();
    async function loadFeaturedDish() {
      try {
        const dishes = await fetchFeaturedMenuItems();
        if (active && dishes.length > 0) {
          setFeaturedDish(dishes[0]);
        }
      } catch (_error) {
        // Keep no featured dish.
      }
    }

    void loadFeaturedDish();
    return () => {
      active = false;
    };
  }, []);

  const today = useMemo(() => {
    const t = new Date();
    return t.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    setReservationDate(today);
  }, [today]);

  const homePage = settings.home_page || fallbackHomePage;
  const reservation = homePage.reservation || fallbackHomePage.reservation;
  const marquee = homePage.marquee || fallbackHomePage.marquee;
  const brand = homePage.brand || fallbackHomePage.brand;
  const pillars = homePage.pillars || fallbackHomePage.pillars;
  const cuisine = homePage.cuisine || fallbackHomePage.cuisine;
  const service = homePage.service || fallbackHomePage.service;
  const testimonials = homePage.testimonials || fallbackHomePage.testimonials;
  const community = homePage.community || fallbackHomePage.community;
  const formats = homePage.formats || fallbackHomePage.formats;
  const gallery = homePage.gallery || fallbackHomePage.gallery;
  const finalCta = homePage.final_cta || fallbackHomePage.final_cta;
  const footer = homePage.footer || fallbackHomePage.footer;

  const legacyHome = settings.home ?? defaultFrontendSettings.home;
  const heroBg = normalizeImageSource(legacyHome.hero_bg_image) || '/images/hero-placeholder.png';

  const testimonialsList = testimonials.items?.length ? testimonials.items : fallbackHomePage.testimonials.items;

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!nodes.length) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealIn);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.07 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [settings]);

  useEffect(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    if (testimonialsList.length > 1) {
      intervalRef.current = window.setInterval(() => {
        setActiveTestimonial((prev) => (prev + 1) % testimonialsList.length);
      }, TESTIMONIAL_INTERVAL);
    }
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [testimonialsList.length]);

  useEffect(() => {
    if (activeTestimonial >= testimonialsList.length) {
      setActiveTestimonial(0);
    }
  }, [activeTestimonial, testimonialsList.length]);

  function handleDotClick(index: number) {
    setActiveTestimonial(index);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    if (testimonialsList.length > 1) {
      intervalRef.current = window.setInterval(() => {
        setActiveTestimonial((prev) => (prev + 1) % testimonialsList.length);
      }, TESTIMONIAL_INTERVAL);
    }
  }

  async function handleReserveSubmit() {
    if (!reservationTime || !guestName || !guestEmail) {
      window.alert('Please fill in your name, email, and select a time.');
      return;
    }

    setReservationStatus('submitting');
    try {
      const partySizeStr = reservationGuests.split(' ')[0];
      const partySize = parseInt(partySizeStr, 10) || 2;

      await createReservation({
        name: guestName,
        email: guestEmail,
        phone: guestPhone,
        date: reservationDate,
        time_slot: reservationTime,
        party_size: partySize,
        special_requests: `${reservationOccasion}. ${reservationNote}`.trim(),
      });

      setReservationStatus('done');
      // Reset form or keep success state
      window.setTimeout(() => {
        setReservationStatus('idle');
        setGuestName('');
        setGuestEmail('');
        setGuestPhone('');
        setReservationNote('');
      }, 5000);
    } catch (error) {
      console.error('Reservation failed:', error);
      setReservationStatus('error');
      window.alert('Sorry, something went wrong with your reservation. Please try again.');
      setReservationStatus('idle');
    }
  }

  const marqueeItems = [...marquee.items, ...marquee.items];
  const galleryItems = (gallery.items?.length ? gallery.items : fallbackHomePage.gallery.items).slice(0, 6);
  const activeTestimonialItem = testimonialsList[activeTestimonial] || testimonialsList[0];

  return (
    <div className={styles.home}>
      {/* ─── FLOATING RESERVATION BUTTON ─────────────────────────────── */}
      <a
        href="#reservations"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-amber-600 hover:scale-105 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        Book a Table
      </a>

      {/* ─── HERO (previous style) ─────────────────────────────── */}
      <section className="relative h-[100dvh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 w-full h-full transform-gpu">
          <Image
            src={heroBg}
            alt="The CalmTable ambiance"
            fill
            className="object-cover"
            priority
            unoptimized={shouldSkipImageOptimization(heroBg)}
          />
        </motion.div>

        <div className="absolute inset-0 bg-cream/35 dark:bg-cream/55 backdrop-blur-[2px]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-cream/70 dark:from-cream/70 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgb(var(--cream-rgb))_100%)] opacity-45" />

        <div className="page-shell relative z-10 flex flex-col items-center justify-center text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl"
          >
            <motion.p variants={fadeInUp} className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500 mb-6">
              {legacyHome.hero_eyebrow}
            </motion.p>
            <motion.h1
              variants={fadeInUp}
              className="font-heading text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-2xl"
            >
              {legacyHome.hero_title_prefix}{' '}
              <em className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400">
                {legacyHome.hero_title_emphasis}
              </em>{' '}
              <br className="max-sm:hidden" />
              {legacyHome.hero_title_suffix}
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-8 mx-auto max-w-2xl text-sm text-ink dark:text-white/70 sm:text-base leading-relaxed font-light"
            >
              {legacyHome.hero_description}
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center rounded-full border border-white/30 dark:border-white/30 bg-white/5 backdrop-blur-sm px-8 py-4 font-bold uppercase tracking-[0.15em] text-[10px] text-ink dark:text-white transition-all hover:bg-white/10 w-full sm:w-auto dark:hover:border-white/40"
              >
                Explore Menu
              </Link>
            </motion.div>

            {/* ─── SIGNATURE DISH ─────────────────────────────── */}
            {featuredDish && (
              <motion.div
                variants={fadeInUp}
                className="mt-10 inline-flex items-center gap-3 rounded-full bg-amber-500/90 backdrop-blur-sm px-5 py-2 text-white shadow-lg"
              >
                <span className="text-xs font-bold uppercase tracking-wider">Chef&apos;s Signature</span>
                <span className="w-px h-4 bg-white/40" />
                <span className="text-sm font-medium">{featuredDish.name}</span>
                <span className="text-xs opacity-80">—</span>
                <span className="text-sm font-bold">K{featuredDish.price}</span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── RESERVATION WIDGET ─────────────────────────────── */}
      <section className={styles.resSection} id="reservations">
        <div className={`${styles.resWidget} ${styles.reveal}`} data-reveal>
          <div className={styles.resLeft}>
            <p className={styles.resTag}>{reservation.tag}</p>
            <h2 className={styles.resHeading} dangerouslySetInnerHTML={{ __html: reservation.title_html }} />
            <p className={styles.resNote}>{reservation.note}</p>
            <div className={styles.resHours}>
              {reservation.hours.map((row) => (
                <div key={row.day} className={styles.resHoursRow}>
                  <span className={styles.resHoursDay}>{row.day}</span>
                  <span className={styles.resHoursTime}>{row.hours}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.resRight}>
            <p className={styles.resFormTitle}>{reservation.form.title}</p>
            <div className={styles.resGrid}>
              <div className={`${styles.resField} ${styles.resFull}`}>
                <label htmlFor="rname">Full Name</label>
                <input
                  type="text"
                  id="rname"
                  placeholder="Your Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.resField}>
                <label htmlFor="remail">Email Address</label>
                <input
                  type="email"
                  id="remail"
                  placeholder="your@email.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.resField}>
                <label htmlFor="rphone">Phone Number</label>
                <input
                  type="tel"
                  id="rphone"
                  placeholder="+265..."
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                />
              </div>

              <div className={styles.resField}>
                <label htmlFor="rd">Date</label>
                <input
                  type="date"
                  id="rd"
                  min={today}
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                />
              </div>
              <div className={styles.resField}>
                <label htmlFor="rt">Time</label>
                <select id="rt" value={reservationTime} onChange={(event) => setReservationTime(event.target.value)}>
                  <option value="">— Select —</option>
                  {reservation.form.times.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.resField}>
                <label htmlFor="rg">Guests</label>
                <select id="rg" value={reservationGuests} onChange={(e) => setReservationGuests(e.target.value)}>
                  {reservation.form.guests.map((guest) => (
                    <option key={guest} value={guest}>
                      {guest}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.resField}>
                <label htmlFor="ro">Occasion</label>
                <select id="ro" value={reservationOccasion} onChange={(e) => setReservationOccasion(e.target.value)}>
                  {reservation.form.occasions.map((occasion) => (
                    <option key={occasion} value={occasion}>
                      {occasion}
                    </option>
                  ))}
                </select>
              </div>
              <div className={`${styles.resField} ${styles.resFull}`}>
                <label htmlFor="rn">Special requests (optional)</label>
                <input
                  type="text"
                  id="rn"
                  placeholder={reservation.form.request_placeholder}
                  value={reservationNote}
                  onChange={(e) => setReservationNote(e.target.value)}
                />
              </div>
            </div>
            <button
              className={styles.resSubmit}
              type="button"
              onClick={handleReserveSubmit}
              disabled={reservationStatus === 'submitting'}
            >
              {reservationStatus === 'submitting'
                ? 'Requesting...'
                : reservationStatus === 'done'
                ? reservation.form.success_label
                : reservation.form.submit_label}
            </button>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ───────────────────────────────────────── */}
      <div className={styles.marqueeStrip}>
        <div className={styles.marqueeTrack}>
          {marqueeItems.map((item, index) => (
            <span key={`${item}-${index}`}>
              {item}
              <span className={styles.marqueeDot}> ✦ </span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── BRAND STATEMENT ───────────────────────────────── */}
      <section className={styles.brand}>
        <div className={styles.brandBgNum}>CT</div>
        <div className={styles.brandInner}>
          <div className={styles.brandMain}>
            <p className={`${styles.ey} ${styles.reveal}`} data-reveal>
              {brand.eyebrow}
            </p>
            <h2
              className={`${styles.brandQuote} ${styles.reveal} ${styles.d1}`}
              data-reveal
              dangerouslySetInnerHTML={{ __html: brand.quote_html }}
            />
            <p className={`${styles.brandBody} ${styles.reveal} ${styles.d2}`} data-reveal>
              {brand.body}
            </p>
            <div className={`${styles.brandPills} ${styles.reveal} ${styles.d3}`} data-reveal>
              {brand.pills.map((pill) => (
                <span key={pill} className={styles.brandPill}>
                  {pill}
                </span>
              ))}
            </div>
            <Link href={brand.cta_href} className={`${styles.brandCta} ${styles.reveal} ${styles.d4}`} data-reveal>
              {brand.cta_label}
            </Link>
          </div>
          <div className={`${styles.brandAside} ${styles.reveal} ${styles.d2}`} data-reveal>
            {brand.stats.map((stat) => (
              <div key={stat.label} className={styles.brandStat}>
                <div className={styles.brandStatN}>{stat.value}</div>
                <div className={styles.brandStatL}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONCEPT PILLARS ───────────────────────────────── */}
      <section className={styles.pillars}>
        <div className={`${styles.pillarsTop} ${styles.reveal}`} data-reveal>
          <p className={styles.ey} style={{ marginBottom: '1rem' }}>
            {pillars.eyebrow}
          </p>
          <h2
            className={styles.serif}
            style={{ fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 300, lineHeight: 1.1 }}
            dangerouslySetInnerHTML={{ __html: pillars.title_html }}
          />
        </div>
        <div className={styles.pillarsScroll}>
          {pillars.items.map((item, index) => (
            <div key={item.title} className={`${styles.pc} ${styles.reveal} ${styles[`d${index + 1}`] || ''}`} data-reveal>
              <div className={styles.pcNum}>{item.number}</div>
              <div className={styles.pcBody}>
                <p className={styles.pcTitle}>{item.title}</p>
                <p className={styles.pcDesc}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CUISINE ───────────────────────────────────────── */}
      <section className={styles.cuisine}>
        <div className={`${styles.cuisineGlow} ${styles.g1}`} />
        <div className={`${styles.cuisineGlow} ${styles.g2}`} />
        <div className={styles.cuisineInner}>
          <div className={styles.cuisineHeader}>
            <div className={styles.reveal} data-reveal>
              <p className={styles.ey} style={{ color: 'var(--acc)', marginBottom: '1.25rem' }}>
                {cuisine.eyebrow}
              </p>
              <h2 className={styles.cuisineH2} dangerouslySetInnerHTML={{ __html: cuisine.title_html }} />
            </div>
            <div className={`${styles.reveal} ${styles.d1}`} data-reveal>
              <p className={styles.cuisineDesc}>{cuisine.description}</p>
            </div>
          </div>
          <div className={`${styles.cuisineRegions} ${styles.reveal} ${styles.d2}`} data-reveal>
            {cuisine.regions.map((region) => {
              const sectionMap: Record<string, string> = {
                'Southern Africa': 'starch',
                'East Africa': 'nsima',
                'West Africa': 'snacks',
                'Central Africa': 'beverages',
              };
              const sectionId = sectionMap[region.region] || 'starch';
              return (
                <Link key={region.region} href={`/menu#${sectionId}`} className={styles.cr}>
                  <div>
                    <p className={styles.crRegion}>{region.region}</p>
                    <p className={styles.crName}>{region.name}</p>
                  </div>
                  <div className={styles.crDishes}>
                    {region.dishes.map((dish) => (
                      <span key={dish} className={styles.crDish}>
                        {dish}
                      </span>
                    ))}
                  </div>
                  <span className={styles.crArrow}>→</span>
                </Link>
              );
            })}
          </div>
          <div className={`${styles.cuisineIntl} ${styles.reveal} ${styles.d3}`} data-reveal>
            <p>
              <strong>International & Global Dishes</strong> — {cuisine.intl_note}
            </p>
            <Link href={cuisine.link_href} className={styles.cuisineLink}>
              {cuisine.link_label}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SERVICE ─────────────────────────────────────── */}
      <section className={styles.service}>
        <div className={styles.serviceInner}>
          <div>
            <p className={`${styles.ey} ${styles.reveal}`} data-reveal style={{ marginBottom: '1.25rem' }}>
              {service.eyebrow}
            </p>
            <h2
              className={`${styles.serviceH2} ${styles.reveal} ${styles.d1}`}
              data-reveal
              dangerouslySetInnerHTML={{ __html: service.title_html }}
            />
            <p className={`${styles.serviceBody} ${styles.reveal} ${styles.d2}`} data-reveal>
              {service.body}
            </p>
            <blockquote className={`${styles.serviceRule} ${styles.reveal} ${styles.d3}`} data-reveal>
              {service.quote}
            </blockquote>
          </div>
          <div className={styles.serviceRight}>
            {service.steps.map((step, index) => (
              <div key={step.title} className={`${styles.sflow} ${styles.reveal} ${styles[`d${index}`] || ''}`} data-reveal>
                <span className={styles.sflowN}>{step.number}</span>
                <div>
                  <p className={styles.sflowTitle}>{step.title}</p>
                  <p className={styles.sflowDesc}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────────── */}
      <section className={styles.social}>
        <div className={styles.socialInner}>
          <div className={`${styles.socialHd} ${styles.reveal}`} data-reveal>
            <p className={styles.ey} style={{ marginBottom: '1rem' }}>
              {testimonials.eyebrow}
            </p>
            <h2 dangerouslySetInnerHTML={{ __html: testimonials.title_html }} />
          </div>
          <div className={styles.tfProg}>
            <div key={activeTestimonial} className={styles.tfBar} />
          </div>
          <div className={`${styles.testFeatured} ${styles.reveal} ${styles.d1}`} data-reveal>
            <p className={styles.tfQuote}>“{activeTestimonialItem.quote}”</p>
            <p className={styles.tfAuthor}>— {activeTestimonialItem.author}</p>
          </div>
          <div className={styles.tfDots}>
            {testimonialsList.map((item, index) => (
              <button
                key={item.author}
                type="button"
                className={`${styles.tfd} ${index === activeTestimonial ? styles.tfdActive : ''}`}
                aria-label={`Testimonial ${index + 1}`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMUNITY ─────────────────────────────────── */}
      <section className={styles.community}>
        <div className={styles.communityInner}>
          <div className={styles.communityLeft}>
            <p className={`${styles.ey} ${styles.reveal}`} data-reveal style={{ marginBottom: '1.25rem' }}>
              {community.eyebrow}
            </p>
            <h2
              className={`${styles.communityH2} ${styles.reveal} ${styles.d1}`}
              data-reveal
              dangerouslySetInnerHTML={{ __html: community.title_html }}
            />
            <p className={`${styles.communityBody} ${styles.reveal} ${styles.d2}`} data-reveal>
              {community.body}
            </p>
            <div className={`${styles.commPills} ${styles.reveal} ${styles.d3}`} data-reveal>
              {community.pills.map((pill) => (
                <span key={pill} className={styles.commPill}>
                  {pill}
                </span>
              ))}
            </div>
          </div>
          <div className={`${styles.communityRight} ${styles.reveal} ${styles.d2}`} data-reveal>
            {community.items.map((item) => (
              <div key={item.title} className={styles.commItem}>
                <span className={styles.commIc}>{item.icon}</span>
                <div>
                  <p className={styles.commTitle}>{item.title}</p>
                  <p className={styles.commDesc}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FORMATS ───────────────────────────────────── */}
      <section className={styles.formats}>
        <div className={styles.formatsInner}>
          <div className={`${styles.formatsTop} ${styles.reveal}`} data-reveal>
            <div>
              <p className={styles.ey} style={{ color: 'var(--acc)', marginBottom: '1rem' }}>
                {formats.eyebrow}
              </p>
              <h2 className={styles.formatsH2} dangerouslySetInnerHTML={{ __html: formats.title_html }} />
            </div>
            <p className={styles.formatsNote}>{formats.note}</p>
          </div>
          <div className={`${styles.formatsList} ${styles.reveal} ${styles.d1}`} data-reveal>
            {formats.items.map((item) => (
              <div key={item.title} className={styles.fmt}>
                <div className={styles.fmtNum}>{item.number}</div>
                <p className={styles.fmtTitle}>{item.title}</p>
                <p className={styles.fmtDesc}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GALLERY ───────────────────────────────────── */}
      <section className={styles.gallery}>
        <div className={`${styles.galleryHead} ${styles.reveal}`} data-reveal>
          <p className={styles.ey} style={{ marginBottom: '1rem' }}>
            {gallery.eyebrow}
          </p>
          <h2
            className={styles.serif}
            style={{ fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 300, lineHeight: 1.1 }}
            dangerouslySetInnerHTML={{ __html: gallery.title_html }}
          />
        </div>
        <div className={`${styles.galleryGrid} ${styles.reveal} ${styles.d1}`} data-reveal>
          {galleryItems.map((item) => (
            <div key={item.label} className={styles.gi}>
              <div
                className={styles.giFill}
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,.4), transparent 60%), url(${normalizeImageSource(item.image)})`,
                }}
              >
                <span className={styles.giLbl}>{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─────────────────────────────────── */}
      <section className={styles.finalCta}>
        <div className={`${styles.finalCtaInner} ${styles.reveal}`} data-reveal>
          <h2 className={styles.fcH} dangerouslySetInnerHTML={{ __html: finalCta.title_html }} />
          <p className={styles.fcSub}>{finalCta.subtitle}</p>
          <Link href={finalCta.button_href} className={styles.fcBtn}>
            {finalCta.button_label}
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div>
              <span className={styles.fBrandName}>{settings.brand_name || 'CalmTable'}</span>
              <p className={styles.fBrandTagline}>{footer.tagline}</p>
            </div>
            {footer.columns.map((column) => (
              <div key={column.title} className={styles.fCol}>
                <h5>{column.title}</h5>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className={styles.footerBottom}>
            <span>{footer.bottom_left}</span>
            <span>{footer.bottom_right}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
