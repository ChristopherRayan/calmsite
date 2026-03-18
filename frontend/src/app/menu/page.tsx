'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import styles from './page.module.css';

import { formatKwacha } from '@/lib/currency';
import { normalizeImageSource, shouldSkipImageOptimization } from '@/lib/image';
import { fetchMenuItems } from '@/lib/services';
import type { MenuItem } from '@/lib/types';

type RegionSectionId = 'southern' | 'east' | 'west' | 'central' | 'extras' | 'international';
type RegionFilter = 'all' | RegionSectionId;
type DietaryFilter = 'all' | 'veg' | 'gf' | 'sig';

const sectionMeta: Array<{
  id: RegionSectionId;
  number: string;
  tag: string;
  navLabel: string;
  navName: string;
  titleHtml: string;
  description: string;
  divider?: string;
}> = [
  {
    id: 'southern',
    number: '01',
    tag: 'Region 01 — Southern Africa',
    navLabel: 'Region 01',
    navName: 'Southern Africa',
    titleHtml: 'Grains, Greens<br />&amp; <em>Slow Comfort</em>',
    description:
      'The heartland of staple cooking — nsima, pap, and sadza anchor a menu of earthy legumes, leafy greens, and slow-cooked proteins that feel like home.',
    divider: '"Community-oriented meals, balanced use of grains, legumes & proteins."',
  },
  {
    id: 'east',
    number: '02',
    tag: 'Region 02 — East Africa',
    navLabel: 'Region 02',
    navName: 'East Africa',
    titleHtml: 'The <em>Swahili Coast</em><br />&amp; Beyond',
    description:
      'Coconut milk, aromatic spices, and the gentle heat of coastal cooking define this region\'s identity.',
    divider: '"Freshly prepared. Every dish has a story worth telling."',
  },
  {
    id: 'west',
    number: '03',
    tag: 'Region 03 — West Africa',
    navLabel: 'Region 03',
    navName: 'West Africa',
    titleHtml: 'Bold, <em>Hearty</em><br />&amp; Full of Depth',
    description:
      'Jollof rice, peanut stews, and plantain bring warmth, colour, and bold character to every table.',
    divider: '"Comfort, depth and familiarity — the hallmarks of African cooking."',
  },
  {
    id: 'central',
    number: '04',
    tag: 'Region 04 — Central Africa',
    navLabel: 'Region 04',
    navName: 'Central Africa',
    titleHtml: 'Root, Leaf<br />&amp; <em>Slow Fire</em>',
    description:
      'Cassava in every form, vegetable-forward stews, and proteins cooked until they surrender to flavour.',
  },
  {
    id: 'extras',
    number: '05',
    tag: 'Region 05 — Beverages & Extras',
    navLabel: 'Region 05',
    navName: 'Beverages & Extras',
    titleHtml: 'Beverages, Desserts<br />&amp; <em>Table Extras</em>',
    description:
      'A convenience view for drinks, desserts, and lighter finishers across the full menu.',
  },
  {
    id: 'international',
    number: '06',
    tag: 'On Request — International',
    navLabel: 'On Request',
    navName: 'International',
    titleHtml: 'International &amp;<br /><em>Global Dishes</em>',
    description:
      'CalmTable preserves a strong African identity while ensuring international adaptability for long-stay guests, tourists, and corporate groups.',
  },
];

const dietaryTabs: Array<{ label: string; value: DietaryFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Vegetarian', value: 'veg' },
  { label: 'Gluten-Free', value: 'gf' },
  { label: 'Signatures Only', value: 'sig' },
];

const intlCards = [
  {
    label: 'Pasta & European',
    title: 'Pasta Dishes',
    description:
      'Carbonara, arrabbiata, and simple olive oil variations with fresh herbs — available on request.',
  },
  {
    label: 'Asian-Inspired',
    title: 'Stir-Fried Rice & Noodles',
    description:
      'Simple, clean stir-fries with seasonal vegetables and protein — for groups and long-stay guests.',
  },
  {
    label: 'Morning Service',
    title: 'Continental Breakfast',
    description:
      'Fresh bread, eggs, seasonal fruit, yoghurt, and beverages — a calm start to the day.',
  },
  {
    label: 'Grill & Simple',
    title: 'Grilled Plates',
    description:
      'Simply grilled chicken, fish, or beef with seasonal sides — clean and universally welcoming.',
  },
  {
    label: 'Groups & Events',
    title: 'Custom Event Menus',
    description:
      'Bespoke menus for corporate events, NGOs, private celebrations, and group bookings.',
  },
];

const fallbackImages: Array<{ keywords: string[]; url: string }> = [
  { keywords: ['fish', 'chambo', 'butterfish'], url: '/images/dish-fish.svg' },
  { keywords: ['goat', 'beef', 'chicken', 'braai', 'braii', 'stew'], url: '/images/dish-meat.svg' },
  { keywords: ['tea', 'coffee', 'juice', 'drink', 'smoothie', 'ice'], url: '/images/dish-drink.svg' },
  { keywords: ['chapati', 'samoosa', 'dessert', 'cake', 'plantain', 'bread'], url: '/images/dish-snack.svg' },
];

const heroDishSvg = String.raw`<svg viewBox="0 0 600 520" xmlns="http://www.w3.org/2000/svg" fill="none">
  <defs>
    <radialGradient id="pgr" cx="42%" cy="35%" r="60%"><stop offset="0%" stop-color="#F5F0EB" stop-opacity=".92"/><stop offset="55%" stop-color="#E8E0D5" stop-opacity=".85"/><stop offset="100%" stop-color="#D5C9BB" stop-opacity=".75"/></radialGradient>
    <radialGradient id="ngr" cx="40%" cy="30%" r="60%"><stop offset="0%" stop-color="#F0E4CC" stop-opacity=".95"/><stop offset="50%" stop-color="#D4B880" stop-opacity=".9"/><stop offset="100%" stop-color="#B8963A" stop-opacity=".8"/></radialGradient>
    <radialGradient id="fgr" cx="45%" cy="35%" r="60%"><stop offset="0%" stop-color="#D4A068" stop-opacity=".95"/><stop offset="40%" stop-color="#B87840" stop-opacity=".9"/><stop offset="100%" stop-color="#7A4818" stop-opacity=".85"/></radialGradient>
    <radialGradient id="fsk" cx="50%" cy="40%" r="55%"><stop offset="0%" stop-color="#E8B870" stop-opacity=".9"/><stop offset="45%" stop-color="#C88840" stop-opacity=".85"/><stop offset="100%" stop-color="#8A5020" stop-opacity=".8"/></radialGradient>
    <linearGradient id="lgr" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F0E060" stop-opacity=".9"/><stop offset="100%" stop-color="#D4B820" stop-opacity=".85"/></linearGradient>
    <radialGradient id="sgr" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="#8A5020" stop-opacity=".72"/><stop offset="100%" stop-color="#4A2808" stop-opacity=".5"/></radialGradient>
    <radialGradient id="glowr" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="rgba(200,132,90,.16)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
    <filter id="sfb"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="dsh"><feDropShadow dx="0" dy="20" stdDeviation="32" flood-color="#000" flood-opacity=".45"/></filter>
    <filter id="stm"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  <ellipse cx="300" cy="280" rx="240" ry="180" fill="url(#glowr)" filter="url(#sfb)" opacity=".7"/>
  <g filter="url(#dsh)">
    <ellipse cx="300" cy="280" rx="210" ry="148" fill="url(#pgr)"/>
    <ellipse cx="300" cy="280" rx="210" ry="148" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="4"/>
    <ellipse cx="300" cy="280" rx="188" ry="132" fill="none" stroke="rgba(200,180,155,.22)" stroke-width="2"/>
    <ellipse cx="300" cy="280" rx="184" ry="128" fill="rgba(248,242,234,.35)"/>
  </g>
  <g><ellipse cx="246" cy="288" rx="96" ry="66" fill="url(#ngr)"/><ellipse cx="246" cy="272" rx="82" ry="54" fill="#EEE0B8" fill-opacity=".9"/><ellipse cx="246" cy="258" rx="64" ry="40" fill="#F4EAC8" fill-opacity=".88"/><ellipse cx="232" cy="246" rx="28" ry="16" fill="rgba(255,255,255,.2)"/></g>
  <g>
    <ellipse cx="356" cy="295" rx="130" ry="52" fill="rgba(0,0,0,.22)" filter="url(#sfb)"/>
    <ellipse cx="352" cy="278" rx="126" ry="50" fill="url(#fgr)"/>
    <ellipse cx="344" cy="270" rx="112" ry="42" fill="url(#fsk)"/>
    <ellipse cx="344" cy="270" rx="112" ry="42" fill="none" stroke="rgba(180,100,40,.22)" stroke-width="2"/>
    <line x1="298" y1="234" x2="310" y2="318" stroke="rgba(160,90,30,.2)" stroke-width="2.2"/>
    <line x1="322" y1="228" x2="330" y2="316" stroke="rgba(160,90,30,.18)" stroke-width="2"/>
    <line x1="348" y1="228" x2="354" y2="316" stroke="rgba(160,90,30,.18)" stroke-width="2"/>
    <ellipse cx="336" cy="260" rx="64" ry="18" fill="rgba(255,210,140,.14)"/>
    <path d="M 284 278 Q 266 245 272 278 Q 266 312 284 278 Z" fill="#7A4018" fill-opacity=".8"/>
    <path d="M 312 240 Q 326 278 312 316" stroke="rgba(55,18,2,.68)" stroke-width="6.5" fill="none" stroke-linecap="round"/>
    <path d="M 340 236 Q 352 278 340 318" stroke="rgba(55,18,2,.62)" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M 368 238 Q 378 278 368 316" stroke="rgba(55,18,2,.58)" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="462" cy="276" rx="30" ry="38" fill="#9A5828" fill-opacity=".88"/>
    <ellipse cx="470" cy="268" rx="18" ry="24" fill="#B86830" fill-opacity=".85"/>
    <circle cx="476" cy="262" r="9" fill="#1A0A02" fill-opacity=".9"/>
    <circle cx="476" cy="262" r="5.5" fill="#2C1208" fill-opacity=".85"/>
    <circle cx="479" cy="259" r="2.5" fill="rgba(255,255,255,.68)"/>
  </g>
  <ellipse cx="300" cy="342" rx="170" ry="30" fill="url(#sgr)" opacity=".6"/>
  <g opacity=".85"><ellipse cx="270" cy="192" rx="52" ry="24" fill="#4A7A30" fill-opacity=".88" transform="rotate(-18,270,192)"/><ellipse cx="300" cy="184" rx="44" ry="20" fill="#5A8A3A" fill-opacity=".85" transform="rotate(-5,300,184)"/><ellipse cx="328" cy="190" rx="40" ry="18" fill="#4A7A30" fill-opacity=".88" transform="rotate(10,328,190)"/><line x1="254" y1="206" x2="278" y2="180" stroke="rgba(25,75,8,.4)" stroke-width="2"/><line x1="296" y1="202" x2="306" y2="176" stroke="rgba(25,75,8,.35)" stroke-width="1.8"/></g>
  <g><circle cx="200" cy="348" r="36" fill="url(#lgr)"/><circle cx="200" cy="348" r="30" fill="rgba(240,220,60,.56)"/><circle cx="200" cy="348" r="22" fill="rgba(250,235,100,.46)"/><line x1="200" y1="318" x2="200" y2="378" stroke="rgba(200,160,20,.42)" stroke-width="2.2"/><line x1="172" y1="332" x2="228" y2="364" stroke="rgba(200,160,20,.42)" stroke-width="2.2"/><line x1="172" y1="364" x2="228" y2="332" stroke="rgba(200,160,20,.42)" stroke-width="2.2"/><circle cx="200" cy="348" r="7" fill="rgba(255,235,80,.65)"/><circle cx="200" cy="348" r="36" fill="none" stroke="rgba(220,180,30,.36)" stroke-width="3"/></g>
  <g opacity=".7"><ellipse cx="388" cy="230" rx="8" ry="3.5" fill="#5A8A30" transform="rotate(22,388,230)"/><ellipse cx="406" cy="220" rx="7" ry="3" fill="#4A7A28" transform="rotate(-10,406,220)"/><ellipse cx="372" cy="224" rx="6" ry="2.5" fill="#5A8A30" transform="rotate(34,372,224)"/></g>
  <g filter="url(#stm)" opacity=".32"><path d="M 268 160 Q 256 120 270 82 Q 284 44 268 14" stroke="rgba(255,255,255,.55)" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M 300 148 Q 288 108 302 70 Q 316 34 300 6" stroke="rgba(255,255,255,.48)" stroke-width="5.5" fill="none" stroke-linecap="round"/><path d="M 334 154 Q 322 114 336 76 Q 350 38 334 10" stroke="rgba(255,255,255,.5)" stroke-width="6" fill="none" stroke-linecap="round"/></g>
  <ellipse cx="300" cy="280" rx="200" ry="142" fill="none" stroke="rgba(210,160,90,.06)" stroke-width="55"/>
</svg>`;

function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

function resolveImageUrl(item: MenuItem) {
  if (item.image_url) {
    return normalizeImageSource(item.image_url);
  }

  const haystack = normalizeText(`${item.name} ${item.description}`);
  const fallback = fallbackImages.find((entry) =>
    entry.keywords.some((keyword) => haystack.includes(keyword))
  );
  return normalizeImageSource(fallback?.url ?? '');
}

function getDishFlags(item: MenuItem) {
  const tags = item.dietary_tags.map((tag) => normalizeText(tag));
  return {
    veg: tags.includes('vegetarian') || tags.includes('vegan'),
    gf: tags.includes('gluten-free') || tags.includes('glutenfree'),
    sig: item.is_featured || tags.includes('signature') || tags.includes('sig'),
  };
}

function getRegionItems(items: MenuItem[], regionId: RegionSectionId) {
  if (regionId === 'extras') {
    return items.filter((item) => item.category === 'drinks' || item.category === 'desserts');
  }
  return items.filter((item) => item.region === regionId);
}

function matchesDiet(item: MenuItem, diet: DietaryFilter) {
  const flags = getDishFlags(item);
  if (diet === 'veg') {
    return flags.veg;
  }
  if (diet === 'gf') {
    return flags.gf;
  }
  if (diet === 'sig') {
    return flags.sig;
  }
  return true;
}

function matchesSearch(item: MenuItem, term: string) {
  if (!term) {
    return true;
  }
  const haystack = normalizeText(`${item.name} ${item.description} ${item.category} ${item.region}`);
  return haystack.includes(term);
}

function formatRegionName(regionId: RegionSectionId) {
  return sectionMeta.find((section) => section.id === regionId)?.navName ?? 'CalmTable';
}

function buildHeroQuote(item: MenuItem | null) {
  if (!item?.description) {
    return 'Freshly prepared and served with calm intention.';
  }
  return item.description.length > 72 ? `${item.description.slice(0, 69).trim()}...` : item.description;
}

function renderPrice(value: number | string) {
  const formatted = formatKwacha(value);
  const [currency, ...rest] = formatted.split(' ');
  return (
    <>
      <span>{currency}</span>
      {rest.join(' ')}
    </>
  );
}

function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchMenuItems();
        if (active) {
          setItems(data.filter((item) => item.is_available));
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load menu.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return { items, loading };
}

export default function MenuPage() {
  const { items, loading } = useMenuItems();
  const [activeRegion, setActiveRegion] = useState<RegionFilter>('all');
  const [activeDiet, setActiveDiet] = useState<DietaryFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterBar, setShowFilterBar] = useState(false);

  const searchValue = normalizeText(searchTerm);

  const signatureDish = useMemo(() => {
    if (!items.length) {
      return null;
    }
    return items.find((item) => item.is_featured) ?? [...items].sort((a, b) => b.ordered_count - a.ordered_count)[0] ?? null;
  }, [items]);

  const signatureImage = signatureDish ? resolveImageUrl(signatureDish) : '';

  const sections = useMemo(() => {
    return sectionMeta.map((section) => {
      const sourceItems = getRegionItems(items, section.id);
      const filteredItems = sourceItems.filter(
        (item) => matchesDiet(item, activeDiet) && matchesSearch(item, searchValue)
      );
      const featured = filteredItems.find((item) => getDishFlags(item).sig) ?? filteredItems[0] ?? null;
      const rest = featured ? filteredItems.filter((item) => item.id !== featured.id) : filteredItems;
      return {
        ...section,
        sourceItems,
        filteredItems,
        featured,
        rest,
      };
    });
  }, [items, activeDiet, searchValue]);

  const visibleSections = useMemo(() => {
    if (activeRegion === 'all') {
      return sections;
    }
    return sections.filter((section) => section.id === activeRegion);
  }, [activeRegion, sections]);

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
      { threshold: 0.08 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [visibleSections.length, loading]);

  useEffect(() => {
    const hero = document.getElementById('menu-hero');
    if (!hero) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFilterBar(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-62px 0px 0px 0px' }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  function handleRegionChange(region: RegionFilter) {
    setActiveRegion(region);
    setActiveDiet('all');
    setSearchTerm('');
  }

  function renderDish(item: MenuItem, featured = false) {
    const flags = getDishFlags(item);
    const imageUrl = resolveImageUrl(item);

    return (
      <article key={item.id} className={`${styles.dish} ${featured ? styles.dishFeatured : ''}`}>
        <div className={styles.dishImg}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.name}
              fill
              sizes={featured ? '(max-width: 768px) 100vw, 240px' : '(max-width: 768px) 100vw, 360px'}
              unoptimized={shouldSkipImageOptimization(imageUrl)}
            />
          ) : (
            <div className={styles.dishPlaceholder}>Image coming soon</div>
          )}
        </div>
        <div className={styles.dishInfo}>
          <p className={styles.dishOrigin}>
            {featured ? `Chef's Signature · ${formatRegionName(item.region as RegionSectionId)}` : formatRegionName(item.region as RegionSectionId)}
          </p>
          <p className={styles.dishName}>{item.name}</p>
          <p className={styles.dishDesc}>{item.description}</p>
          <div className={styles.dishTags}>
            {flags.sig && <span className={`${styles.dtag} ${styles.dtagSig}`}>Signature</span>}
            {flags.veg && <span className={`${styles.dtag} ${styles.dtagVeg}`}>Vegetarian</span>}
            {flags.gf && <span className={`${styles.dtag} ${styles.dtagGf}`}>Gluten-Free</span>}
          </div>
        </div>
        <p className={styles.dishPrice}>{renderPrice(item.price)}</p>
      </article>
    );
  }

  return (
    <div className={styles.menu}>
      <section className={styles.mhero} id="menu-hero">
        <div className={styles.mheroGrain} />
        <div className={styles.mheroGlow} />
        <div className={styles.mheroInner}>
          <div className={styles.mheroLeft}>
            <p className={styles.mheroKicker}>Pan-African &amp; Global Cuisine</p>
            <h1 className={styles.mheroH1}>
              <span className={styles.h1Line1}>Honest food.</span>
              <span className={styles.h1Line2}>Calm moments.</span>
              <span className={styles.h1Line3}>Eat well.</span>
            </h1>
            <span className={styles.mheroSwoosh} aria-hidden="true">
              <svg viewBox="0 0 260 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 4 18 Q 50 4 130 14 Q 200 22 256 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            <p className={styles.mheroDesc}>
              Fresh from the African continent — multiple regions, rotating dishes, and one shared table. International specials always available on request.
            </p>
            <div className={styles.mheroBtns}>
              <Link href="#southern" className={styles.mheroBtnFill}>
                Explore the Menu
              </Link>
              <Link href="/#reservations" className={styles.mheroBtnOut}>
                Book a Table
              </Link>
            </div>
            <div className={styles.mheroSocial}>
              <div className={styles.mheroAvs}>
                <span>ZP</span>
                <span>NM</span>
                <span>BT</span>
                <span className={styles.mheroAvsMore}>5k+</span>
              </div>
              <p className={styles.mheroSocTxt}>
                <strong>5,000+ happy guests</strong> — and counting
              </p>
            </div>
          </div>

          <div className={styles.mheroRight}>
            <div className={styles.heroDishNameplate}>
              <p className={styles.hdnpLabel}>Chef&apos;s Signature</p>
              <p className={styles.hdnpName}>{signatureDish?.name ?? 'Chambo & Nsima'}</p>
              <p className={styles.hdnpQuote}>“{buildHeroQuote(signatureDish)}”</p>
            </div>
            <div className={styles.mheroDish} aria-hidden="true" dangerouslySetInnerHTML={{ __html: heroDishSvg }} />
            <div className={styles.heroStatRow}>
              <div className={styles.heroStatPill}>
                <p className={styles.hspVal}>{signatureDish ? formatKwacha(signatureDish.price) : 'MWK 7,500'}</p>
                <p className={styles.hspLbl}>Price</p>
              </div>
              <div className={styles.heroStatPill}>
                <p className={styles.hspVal}>{signatureDish?.average_rating ? `${signatureDish.average_rating.toFixed(1)} ★` : '4.9 ★'}</p>
                <p className={styles.hspLbl}>Rating</p>
              </div>
              <div className={styles.heroStatPill}>
                <p className={styles.hspVal}>25 min</p>
                <p className={styles.hspLbl}>Prep</p>
              </div>
            </div>
          </div>
        </div>

        <nav className={styles.mheroRegions} aria-label="Filter menu by region">
          <button type="button" className={`${styles.mhr} ${activeRegion === 'all' ? styles.mhrOn : ''}`} onClick={() => handleRegionChange('all')}>
            <p className={styles.mhrLbl}>All</p>
            <p className={styles.mhrNm}>All Regions</p>
          </button>
          {sectionMeta.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`${styles.mhr} ${activeRegion === section.id ? styles.mhrOn : ''}`}
              onClick={() => handleRegionChange(section.id)}
            >
              <p className={styles.mhrLbl}>{section.navLabel}</p>
              <p className={styles.mhrNm}>{section.navName}</p>
            </button>
          ))}
        </nav>
      </section>

      <div className={styles.menuPhil}>
        <blockquote>
          <span>“</span>Simple food. Clean ingredients. <span>Honest cooking.</span><span>”</span>
        </blockquote>
        <p className={styles.menuPhilNote}>
          CalmTable Cuisine Philosophy
          <br />
          All regions · All occasions
        </p>
      </div>

      <div className={`${styles.filterBar} ${showFilterBar ? styles.filterBarVisible : ''}`} id="filterBar">
        <div className={styles.fbRow}>
          <span className={styles.fbGroupLbl}>Region</span>
          <div className={styles.fbTabs}>
            <button type="button" className={`${styles.fbTab} ${activeRegion === 'all' ? styles.fbTabActive : ''}`} onClick={() => handleRegionChange('all')}>
              All Regions
            </button>
            {sectionMeta.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`${styles.fbTab} ${activeRegion === section.id ? styles.fbTabActive : ''}`}
                onClick={() => handleRegionChange(section.id)}
              >
                {section.navName}
              </button>
            ))}
          </div>
          <div className={styles.fbRight}>
            <input
              className={styles.fbSearch}
              type="text"
              placeholder="Search dishes…"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>
        <div className={styles.fbRow}>
          <span className={styles.fbGroupLbl}>Dietary</span>
          <div className={styles.fbTabs}>
            {dietaryTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                className={`${styles.fbTab} ${styles.fbTabDiet} ${activeDiet === tab.value ? styles.fbTabActive : ''}`}
                onClick={() => setActiveDiet(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {signatureDish && (
          <div className={styles.fbDishRow}>
            <div className={styles.fbDishImg}>
              {signatureImage ? (
                <Image
                  src={signatureImage}
                  alt={signatureDish.name}
                  fill
                  sizes="52px"
                  unoptimized={shouldSkipImageOptimization(signatureImage)}
                />
              ) : null}
            </div>
            <div className={styles.fbDishInfo}>
              <p className={styles.fbDishName}>{signatureDish.name}</p>
              <div className={styles.fbDishTags}>
                <span className={`${styles.fbDishTag} ${styles.fbDishTagHi}`}>Signature</span>
                <span className={styles.fbDishTag}>{formatRegionName(signatureDish.region as RegionSectionId)}</span>
              </div>
              <p className={styles.fbDishDesc}>{signatureDish.description}</p>
            </div>
            <div className={styles.fbDishStats}>
              <div className={styles.fbStat}>
                <p className={styles.fbStatN}>{signatureDish.average_rating ? signatureDish.average_rating.toFixed(1) : '4.9'}</p>
                <p className={styles.fbStatL}>Rating</p>
              </div>
              <div className={styles.fbStat}>
                <p className={styles.fbStatN}>{formatKwacha(signatureDish.price)}</p>
                <p className={styles.fbStatL}>Price</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.menuBody}>
        {!loading && activeRegion === 'all' && (
          <section className={styles.menuSection}>
            <div className={styles.msHeader}>
              <div>
                <span className={styles.msRegionTag}>All Regions — CalmTable Menu</span>
                <h2 className={styles.msTitle}>
                  Pan-African regions
                  <br />
                  &amp; <em>global dishes</em>
                </h2>
                <p className={styles.msDesc}>
                  Browse every section together. Region, dietary, and search filters work together without hiding the structure of the menu.
                </p>
              </div>
              <div>
                <p className={styles.msOriginN}>ALL</p>
              </div>
            </div>
          </section>
        )}

        {loading && (
          <section className={styles.menuSection}>
            <div className={styles.msHeader}>
              <div>
                <span className={styles.msRegionTag}>Loading menu</span>
                <h2 className={styles.msTitle}>Preparing calm dishes…</h2>
                <p className={styles.msDesc}>Just a moment while we bring the menu to the table.</p>
              </div>
            </div>
          </section>
        )}

        {!loading &&
          visibleSections.map((section) => (
            <section key={section.id} className={styles.menuSection} id={section.id}>
              <div className={`${styles.msHeader} ${styles.reveal}`} data-reveal>
                <div>
                  <span className={styles.msRegionTag}>{section.tag}</span>
                  <h2 className={styles.msTitle} dangerouslySetInnerHTML={{ __html: section.titleHtml }} />
                  <p className={styles.msDesc}>{section.description}</p>
                </div>
                <div>
                  <p className={styles.msOriginN}>{section.number}</p>
                </div>
              </div>
              {section.filteredItems.length === 0 ? (
                <div className={styles.secEmpty}>No dishes match this filter.</div>
              ) : (
                <div className={styles.dishGrid}>
                  {section.featured && renderDish(section.featured, true)}
                  {section.rest.map((item) => renderDish(item))}
                </div>
              )}
              {section.divider ? (
                <div className={styles.dividerBand}>
                  <div className={styles.dbLine} />
                  <p className={styles.dbText}>{section.divider}</p>
                  <div className={styles.dbLine} />
                </div>
              ) : null}
            </section>
          ))}
      </div>

      <div className={styles.legend}>
        <p className={styles.legendTitle}>Dietary Guide</p>
        <div className={styles.legendItems}>
          <div className={styles.liItem}>
            <span className={`${styles.liBadge} ${styles.liBadgeSig}`}>Signature</span>
            <span>Chef&apos;s recommended dish</span>
          </div>
          <div className={styles.liItem}>
            <span className={`${styles.liBadge} ${styles.liBadgeVeg}`}>Vegetarian</span>
            <span>No meat or fish</span>
          </div>
          <div className={styles.liItem}>
            <span className={`${styles.liBadge} ${styles.liBadgeGf}`}>Gluten-Free</span>
            <span>No wheat or gluten</span>
          </div>
        </div>
      </div>

      <section className={styles.intlSection} id="international-info">
        <div className={styles.intlInner}>
          <div className={`${styles.intlHeader} ${styles.reveal}`} data-reveal>
            <h2 className={styles.intlH2}>
              International &amp;
              <br />
              <em>Global Dishes</em>
            </h2>
            <p className={styles.intlNote}>
              CalmTable preserves a strong African identity while ensuring international adaptability. Available on request, as rotating specials, and for long-stay guests, tourists, and corporate groups.
            </p>
          </div>
          <div className={`${styles.intlGrid} ${styles.reveal} ${styles.d1}`} data-reveal>
            {intlCards.map((card) => (
              <div key={card.title} className={styles.ig}>
                <p className={styles.igLabel}>{card.label}</p>
                <p className={styles.igTitle}>{card.title}</p>
                <p className={styles.igDesc}>{card.description}</p>
              </div>
            ))}
            <div className={`${styles.ig} ${styles.igQuote}`}>
              <p>
                “International adaptability
                <br />
                without losing African identity.”
              </p>
            </div>
          </div>
          <p className={`${styles.intlCta} ${styles.reveal} ${styles.d2}`} data-reveal>
            To request an international dish or discuss a custom event menu,
            <br />
            <strong>speak with our team at the table or contact us in advance.</strong>
          </p>
        </div>
      </section>

      <div className={`${styles.menuCta} ${styles.reveal}`} data-reveal>
        <div className={styles.mcLeft}>
          <h2>
            Ready to
            <br />
            <em>eat well?</em>
          </h2>
          <p>Reserve your table. Guests are never rushed.</p>
        </div>
        <Link href="/#reservations" className={styles.mcBtn}>
          Reserve a Table
        </Link>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div>
              <span className={styles.fBrandName}>CalmTable</span>
              <p className={styles.fBrandTag}>
                “A peaceful dining space where wholesome food, warm hospitality, and calm moments come together.”
              </p>
            </div>
            <div className={styles.fCol}>
              <h5>Navigate</h5>
              <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/menu">Menu</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className={styles.fCol}>
              <h5>Menu Regions</h5>
              <ul>
                {sectionMeta.map((section) => (
                  <li key={section.id}><Link href={`#${section.id}`}>{section.navName}</Link></li>
                ))}
                <li><Link href="#international-info">International</Link></li>
              </ul>
            </div>
            <div className={styles.fCol}>
              <h5>Follow</h5>
              <ul>
                <li><Link href="#">Instagram</Link></li>
                <li><Link href="#">Facebook</Link></li>
                <li><Link href="#">TikTok</Link></li>
                <li><Link href="#">WhatsApp</Link></li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© 2026 CalmTable. Dine with Dignity.</span>
            <span>Pan-African &amp; Global Dining</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
