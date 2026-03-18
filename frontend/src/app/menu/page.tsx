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
  const heroSignatureImage = signatureImage || '/images/food-placeholder.svg';

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
            <div className={styles.mheroDishShell} aria-hidden="true">
              <div className={styles.mheroDishGhost} />
              <div className={styles.mheroDish}>
                <div className={styles.mheroDishMedia}>
                  {heroSignatureImage && (
                    <Image
                      key={heroSignatureImage}
                      src={heroSignatureImage}
                      alt={signatureDish?.name ?? 'Signature dish'}
                      fill
                      priority
                      sizes="(max-width: 768px) min(100vw - 2rem, 360px), 460px"
                      unoptimized={shouldSkipImageOptimization(heroSignatureImage)}
                      className={styles.mheroDishImage}
                    />
                  )}
                </div>
                <div className={styles.mheroDishGloss} />
              </div>
            </div>
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
