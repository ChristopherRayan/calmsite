'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import styles from './page.module.css';

import { fetchMenuItems } from '@/lib/services';
import { formatKwacha } from '@/lib/currency';
import { normalizeImageSource, shouldSkipImageOptimization } from '@/lib/image';
import type { MenuItem } from '@/lib/types';

const categoryTabs = [
  { label: 'All Dishes', value: 'all' },
  { label: 'Starters', value: 'starters' },
  { label: 'Mains', value: 'mains' },
  { label: 'Desserts', value: 'desserts' },
  { label: 'Drinks', value: 'drinks' },
  { label: 'Vegetarian', value: 'veg' },
  { label: 'Gluten-Free', value: 'gf' },
] as const;

type DisplayRegion = 'southern' | 'east' | 'west' | 'central' | 'international';
type FilterCategory = (typeof categoryTabs)[number]['value'];
type FilterRegion = 'all' | DisplayRegion;

const sectionMeta: Array<{
  id: DisplayRegion;
  number: string;
  tag: string;
  title_html: string;
  description: string;
  divider?: string;
}> = [
  {
    id: 'southern',
    number: '01',
    tag: 'Region 01 — Southern Africa',
    title_html: 'Grains &amp; Greens<br/>&amp; <em>Slow Comfort</em>',
    description:
      "The heartland of staple cooking — nsima, pap, and sadza anchor a menu of earthy legumes, leafy greens, and slow-cooked proteins that feel like home.",
    divider: '"Community-oriented meals, balanced use of grains, legumes & proteins."',
  },
  {
    id: 'east',
    number: '02',
    tag: 'Region 02 — East Africa',
    title_html: 'The <em>Swahili Coast</em><br/>&amp; Beyond',
    description:
      "Where the Indian Ocean meets the African interior — coconut milk, aromatic spices, and the gentle heat of coastal cooking define this region's identity.",
    divider: '"Freshly prepared. Every dish has a story worth telling."',
  },
  {
    id: 'west',
    number: '03',
    tag: 'Region 03 — West Africa',
    title_html: 'Bold, <em>Hearty</em><br/>&amp; Full of Depth',
    description:
      'West African cooking announces itself — jollof rice, peanut stews, and plantain bring warmth, colour, and bold character to every table.',
    divider: '"Comfort, depth and familiarity — the hallmarks of African cooking."',
  },
  {
    id: 'central',
    number: '04',
    tag: 'Region 04 — Central Africa',
    title_html: 'Root, Leaf<br/>&amp; <em>Slow Fire</em>',
    description:
      'Central African cooking is patient and generous — cassava in every form, vegetable-forward stews, and proteins cooked until they surrender to flavour.',
  },
  {
    id: 'international',
    number: '05',
    tag: 'On Request — International',
    title_html: 'Global Dishes<br/>&amp; <em>On Request</em>',
    description:
      'International dishes are available on request, as rotating specials, and for long-stay guests, tourists, and corporate groups.',
  },
];

const fallbackImages: Array<{ keywords: string[]; url: string }> = [
  {
    keywords: ['chambo', 'butterfish', 'fish'],
    url: '/images/dish-fish.svg',
  },
  {
    keywords: ['goat', 'beef', 'chicken', 'stew', 'braii', 'braai'],
    url: '/images/dish-meat.svg',
  },
  {
    keywords: ['chapati', 'samoosa', 'doughnut', 'wrap'],
    url: '/images/dish-snack.svg',
  },
  {
    keywords: ['tea', 'coffee', 'milk', 'water', 'drink', 'ice-cream', 'juice'],
    url: '/images/dish-drink.svg',
  },
];

const intlCards = [
  {
    label: 'Pasta & European',
    title: 'Pasta Dishes',
    description:
      'Classic pasta preparations available on request — carbonara, arrabbiata, and simple olive oil variations with fresh herbs.',
  },
  {
    label: 'Asian-Inspired',
    title: 'Stir-Fried Rice & Noodles',
    description:
      'Simple, clean stir-fries with seasonal vegetables and protein of choice — available for groups and long-stay guests.',
  },
  {
    label: 'Morning Service',
    title: 'Continental Breakfast',
    description:
      'Fresh bread, eggs prepared to order, seasonal fruit, yoghurt, and beverages — a calm start to the day.',
  },
  {
    label: 'Grill & Simple',
    title: 'Grilled Plates',
    description:
      'Simply grilled chicken, fish, or beef with seasonal sides — clean, straightforward, and universally welcoming.',
  },
  {
    label: 'Groups & Events',
    title: 'Custom Event Menus',
    description:
      'Bespoke menus designed for corporate events, NGO gatherings, private celebrations, and group bookings of any size.',
  },
];

function normalize(value: string) {
  return value.toLowerCase();
}

function resolveRegion(item: MenuItem): DisplayRegion {
  const region = (item.region || '').toLowerCase();
  if (region === 'east' || region === 'west' || region === 'central' || region === 'international') {
    return region as DisplayRegion;
  }
  const combined = normalize(`${item.name} ${item.description}`);
  if (combined.includes('jollof') || combined.includes('groundnut') || combined.includes('plantain') || combined.includes('egusi')) {
    return 'west';
  }
  if (combined.includes('pilau') || combined.includes('swahili') || combined.includes('chapati') || combined.includes('ugali')) {
    return 'east';
  }
  if (combined.includes('cassava') || combined.includes('saka') || combined.includes('fufu')) {
    return 'central';
  }
  return 'southern';
}

function resolveImageUrl(item: MenuItem) {
  if (item.image_url) {
    return normalizeImageSource(item.image_url);
  }

  const haystack = normalize(`${item.name} ${item.description}`);
  const fallback = fallbackImages.find((entry) =>
    entry.keywords.some((keyword) => haystack.includes(keyword))
  );
  return normalizeImageSource(fallback?.url ?? '');
}

function getTags(item: MenuItem) {
  const tags = item.dietary_tags.map((tag) => normalize(tag));
  return {
    isVeg: tags.includes('vegetarian') || tags.includes('vegan'),
    isGlutenFree: tags.includes('gluten-free') || tags.includes('glutenfree'),
    isSpicy: tags.includes('spicy') || tags.includes('hot'),
    isSignature: item.is_featured || tags.includes('signature') || tags.includes('sig'),
    isBestSeller: item.ordered_count > 6,
  };
}

export default function MenuPage() {
  const { items, loading } = useMenuItems();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRegionFilter, setActiveRegionFilter] = useState<FilterRegion>('all');
  const [activeRegion, setActiveRegion] = useState<DisplayRegion>('southern');
  const signatureDish = useMemo(() => {
    if (!items.length) {
      return null;
    }
    const featured = items.find((item) => item.is_featured);
    if (featured) {
      return featured;
    }
    return [...items].sort((a, b) => (b.ordered_count ?? 0) - (a.ordered_count ?? 0))[0] ?? null;
  }, [items]);
  const signatureImage = signatureDish ? resolveImageUrl(signatureDish) : '';

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
      { threshold: 0.06 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [items.length]);

  function getCurrentRegionFromScroll(): DisplayRegion {
    const offset = 3.5 * 16 + 52 + 40;
    let current: DisplayRegion = 'southern';
    sectionMeta.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el && el.getBoundingClientRect().top <= offset) {
        current = section.id;
      }
    });
    return current;
  }

  useEffect(() => {
    function handleScroll() {
      if (activeRegionFilter !== 'all') {
        return;
      }
      setActiveRegion(getCurrentRegionFromScroll());
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeRegionFilter]);

  const searchLower = searchTerm.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    const matchesSearch = (item: MenuItem) => {
      if (!searchLower) {
        return true;
      }
      const text = `${item.name} ${item.description}`.toLowerCase();
      return text.includes(searchLower);
    };

    const matchesFilter = (item: MenuItem) => {
      if (activeFilter === 'all') {
        return true;
      }
      if (activeFilter === 'veg') {
        const tags = getTags(item);
        return tags.isVeg;
      }
      if (activeFilter === 'gf') {
        const tags = getTags(item);
        return tags.isGlutenFree;
      }
      return item.category === activeFilter;
    };

    return sectionMeta
      .filter((section) => activeRegionFilter === 'all' || section.id === activeRegionFilter)
      .map((section) => {
        const sectionItems = items.filter(
          (item) =>
            resolveRegion(item) === section.id &&
            matchesFilter(item) &&
            matchesSearch(item)
        );
        const featured = sectionItems.find((item) => item.is_featured) ?? sectionItems[0] ?? null;
        const rest = featured ? sectionItems.filter((item) => item.id !== featured.id) : sectionItems;
        return {
          ...section,
          items: sectionItems,
          featured,
          rest,
        };
      });
  }, [items, activeFilter, searchLower, activeRegionFilter]);

  const visibleSections = useMemo(() => {
    if (activeRegionFilter !== 'all') {
      return filteredSections;
    }

    if (searchLower || activeFilter !== 'all') {
      return filteredSections.filter((section) => section.items.length > 0);
    }

    return filteredSections;
  }, [filteredSections, searchLower, activeFilter, activeRegionFilter]);

  function handleRegionFilter(region: FilterRegion) {
    if (region === 'all') {
      setActiveRegionFilter('all');
      setActiveRegion(getCurrentRegionFromScroll());
      return;
    }

    setActiveRegionFilter(region);
    setActiveRegion(region);
  }

  function jumpTo(sectionId: DisplayRegion) {
    handleRegionFilter(sectionId);
    const target = document.getElementById('filterBar');
    if (!target) {
      return;
    }
    const offset = 62;
    const y = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  return (
    <div className={styles.menu}>
      <section className={styles.mhero}>
        <div className={styles.mheroCanvas} />
        <div className={styles.mheroGrain} />
        
        <div className={styles.mheroInner}>
          <div className={styles.mheroLeft}>
            <p className={styles.mheroKicker}>Pan-African & Global Cuisine</p>
            <div className={styles.menuPhilHero}>
              <blockquote>
                &ldquo;Simple food. Clean ingredients. Honest cooking.&rdquo;
              </blockquote>
            </div>
            <h1 className={styles.mheroH1}>
              <span className={styles.h1Our}>Our</span>
              <span className={styles.h1Menu}>Menu</span>
            </h1>
            <div className={styles.mheroSub}>
              <div className={styles.mheroSubBar} />
              <p className={styles.mheroSubTxt}>
                Freshly prepared. Community-oriented. Rooted in the honest, balanced cooking traditions of the African
                continent — with international dishes available on request.
              </p>
            </div>
            <p className={styles.mheroScroll}>
              Scroll to explore <span className={styles.mheroScrollBar} />
            </p>
          </div>

          <div className={styles.mheroRight}>
            {signatureDish && (
              <>
                <div className={styles.mheroMeta}>
                  <span className={styles.mmLine} />
                  Chef&apos;s selection · Today
                  <span className={styles.mmDot} />
                </div>
                <div className={styles.mheroCard}>
                  <div className={styles.mcImg}>
                    {signatureImage ? (
                      <Image
                        src={signatureImage}
                        alt={signatureDish.name}
                        fill
                        sizes="(max-width: 540px) calc(100vw - 1.5rem), (max-width: 900px) min(100vw - 2rem, 420px), 410px"
                        className={styles.mcImage}
                        unoptimized={shouldSkipImageOptimization(signatureImage)}
                        priority
                      />
                    ) : (
                      <div className={styles.heroSignatureFallback} />
                    )}
                    <div className={styles.mcImgFade} />
                    <span className={styles.mcImgBadge}>Chef&apos;s Signature</span>
                    <span className={styles.mcImgPrice}>{formatKwacha(signatureDish.price)}</span>
                  </div>

                  <div className={styles.mcBody}>
                    <div className={styles.mcDishRow}>
                      <div>
                      <p className={styles.mcDishName}>{signatureDish.name}</p>
                      <div className={styles.mcTags}>
                        <span className={`${styles.mcTag} ${styles.mcTagHi}`}>Signature</span>
                        <span className={styles.mcTag}>{resolveRegion(signatureDish)}</span>
                        <span className={styles.mcTag}>{signatureDish.category}</span>
                        {getTags(signatureDish).isGlutenFree && <span className={styles.mcTag}>Gluten-Free</span>}
                      </div>
                    </div>
                    </div>
                    <p className={styles.mcDesc}>{signatureDish.description}</p>
                  </div>

                  <div className={styles.mcStats}>
                    <div className={styles.mcStat}>
                      <p className={styles.mcStatN}>{sectionMeta.find((section) => section.id === resolveRegion(signatureDish))?.tag.split('—')[1]?.trim() || 'Signature'}</p>
                      <p className={styles.mcStatL}>Region</p>
                    </div>
                    <div className={styles.mcStatSep} />
                    <div className={styles.mcStat}>
                      <p className={styles.mcStatN}>4.9★</p>
                      <p className={styles.mcStatL}>Rating</p>
                    </div>
                    <div className={styles.mcStatSep} />
                    <div className={styles.mcStat}>
                      <p className={styles.mcStatN}>25 min</p>
                      <p className={styles.mcStatL}>Prep</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.mcCta}
                    onClick={() => jumpTo(resolveRegion(signatureDish))}
                  >
                    <span>View in full menu</span>
                    <span className={styles.mcCtaArrow}>→</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <nav className={styles.mheroRegions} aria-label="Navigate regions">
        <button
          type="button"
          className={`${styles.mhr} ${activeRegionFilter === 'all' ? styles.mhrOn : ''}`}
          onClick={() => handleRegionFilter('all')}
        >
          <p className={styles.mhrLbl}>All</p>
          <p className={styles.mhrNm}>Regions</p>
        </button>
        {sectionMeta.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`${styles.mhr} ${
              (activeRegionFilter === section.id || (activeRegionFilter === 'all' && activeRegion === section.id))
                ? styles.mhrOn
                : ''
            }`}
            onClick={() => handleRegionFilter(section.id)}
          >
            <p className={styles.mhrLbl}>{section.tag.split('—')[0].trim()}</p>
            <p className={styles.mhrNm}>{section.tag.split('—')[1]?.trim() || section.tag}</p>
          </button>
        ))}
      </nav>

      <Link href="/#reservations" className={styles.reserveFloat}>
        Book Reservation
      </Link>

      <div className={styles.filterBar} id="filterBar">
        <div className={styles.filterRow}>
          <div className={styles.filterTabs}>
            {categoryTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                className={`${styles.filterTab} ${activeFilter === tab.value ? styles.filterTabActive : ''}`}
                onClick={() => setActiveFilter(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className={styles.filterRight}>
            <span className={`${styles.filterBadge} ${styles.filterBadgeVeg}`}>● Veg-friendly</span>
            <input
              className={styles.filterSearch}
              type="text"
              placeholder="Search dishes…"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.menuBody}>
        {loading && (
          <section className={styles.menuSection}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionTag}>Loading menu</span>
                <h2 className={styles.sectionTitle}>Preparing calm dishes…</h2>
                <p className={styles.sectionDesc}>Just a moment while we bring the menu to the table.</p>
              </div>
            </div>
          </section>
        )}

        {!loading && visibleSections.length === 0 && (
          <section className={styles.menuSection}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionTag}>No dishes</span>
                <h2 className={styles.sectionTitle}>No menu items found.</h2>
                <p className={styles.sectionDesc}>Try another filter or clear your search to see more dishes.</p>
              </div>
            </div>
          </section>
        )}

        {!loading &&
          visibleSections.map((section) => (
            <section key={section.id} className={styles.menuSection} id={section.id} data-cat={section.id}>
              <div className={`${styles.sectionHeader} ${styles.reveal}`} data-reveal>
                <div>
                  <span className={styles.sectionTag}>{section.tag}</span>
                  <h2 className={styles.sectionTitle} dangerouslySetInnerHTML={{ __html: section.title_html }} />
                  <p className={styles.sectionDesc}>{section.description}</p>
                </div>
                <div className={styles.sectionOrigin}>
                  <p className={styles.sectionOriginNum}>{section.number}</p>
                </div>
              </div>
              {section.items.length === 0 ? (
                <div className={styles.emptyState}>
                  No dishes available yet in this category. Update the menu in admin to populate this section.
                </div>
              ) : (
                <div className={styles.dishGrid}>
                  {section.featured && (
                    <article className={`${styles.dish} ${styles.dishFeatured}`}>
                      {renderDishMedia(section.featured)}
                      <div className={styles.dishInfo}>
                        <p className={styles.dishOrigin}>Chef&apos;s Signature · {section.tag.split('—')[1]?.trim()}</p>
                        <p className={styles.dishName}>{section.featured.name}</p>
                        <p className={styles.dishDesc}>{section.featured.description}</p>
                        {renderDishTags(section.featured)}
                      </div>
                      <p className={styles.dishPrice}>{renderPrice(section.featured.price)}</p>
                    </article>
                  )}
                  {section.rest.map((item) => (
                    <article key={item.id} className={styles.dish}>
                      {renderDishMedia(item)}
                      <div className={styles.dishInfo}>
                        <p className={styles.dishOrigin}>{section.tag.split('—')[1]?.trim()}</p>
                        <p className={styles.dishName}>{item.name}</p>
                        <p className={styles.dishDesc}>{item.description}</p>
                        {renderDishTags(item)}
                      </div>
                      <p className={styles.dishPrice}>{renderPrice(item.price)}</p>
                    </article>
                  ))}
                </div>
              )}
              {section.divider && (
                <div className={styles.dividerBand}>
                  <div className={styles.dividerLine} />
                  <p className={styles.dividerText}>{section.divider}</p>
                  <div className={styles.dividerLine} />
                </div>
              )}
            </section>
          ))}
      </div>

      <div className={styles.legend}>
        <p className={styles.legendTitle}>Dietary Guide</p>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <span className={`${styles.legendBadge} ${styles.legendBadgeSig}`}>Signature</span>
            <span>Chef&apos;s recommended dish</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendBadge} ${styles.legendBadgeVeg}`}>Vegetarian</span>
            <span>No meat or fish</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendBadge} ${styles.legendBadgeGf}`}>Gluten-Free</span>
            <span>No wheat or gluten</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendBadge} ${styles.legendBadgeHot}`}>Hot</span>
            <span>Contains chilli</span>
          </div>
        </div>
      </div>

      <section className={styles.intlSection} id="international-info">
        <div className={styles.intlInner}>
          <div className={`${styles.intlHeader} ${styles.reveal}`} data-reveal>
            <div>
              <p className={styles.ey} style={{ color: 'var(--acc)', marginBottom: '1rem' }}>
                On Request & Rotating Specials
              </p>
              <h2 className={styles.intlTitle}>
                International &<br />
                <em>Global Dishes</em>
              </h2>
            </div>
            <p className={styles.intlNote}>
              CalmTable preserves a strong African identity while ensuring international adaptability. These dishes are
              available on request, as rotating specials, and for long-stay guests, tourists, and corporate groups.
            </p>
          </div>
          <div className={`${styles.intlGrid} ${styles.reveal} ${styles.d1}`} data-reveal>
            {intlCards.map((card) => (
              <div key={card.title} className={styles.intlCard}>
                <p className={styles.intlLabel}>{card.label}</p>
                <p className={styles.intlCardTitle}>{card.title}</p>
                <p className={styles.intlCardDesc}>{card.description}</p>
              </div>
            ))}
            <div className={`${styles.intlCard} ${styles.intlQuoteCard}`}>
              <p
                style={{
                  fontFamily: 'var(--font-playfair), serif',
                  fontStyle: 'italic',
                  fontSize: '1.2rem',
                  fontWeight: 300,
                  color: 'rgba(240,230,214,.25)',
                  textAlign: 'center',
                  lineHeight: 1.6,
                }}
              >
                &ldquo;International adaptability<br />without losing African identity.&rdquo;
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
        <div className={styles.menuCtaLeft}>
          <h2>
            Ready to<br />
            <em>eat well?</em>
          </h2>
          <p>Reserve your table. Guests are never rushed.</p>
        </div>
        <Link href="/#reservations" className={styles.menuCtaBtn}>
          Reserve a Table
        </Link>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div>
              <span className={styles.footerBrandName}>CalmTable</span>
              <p className={styles.footerBrandTag}>
                &ldquo;A peaceful dining space where wholesome food, warm hospitality, and calm moments come together.&rdquo;
              </p>
            </div>
            <div className={styles.footerCol}>
              <h5>Navigate</h5>
              <ul>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/menu">Menu</Link>
                </li>
                <li>
                  <Link href="/about">About Us</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h5>Menu Sections</h5>
              <ul>
                {sectionMeta.map((section) => (
                  <li key={section.id}>
                    <Link href={`/menu#${section.id}`}>{section.tag.split('—')[1]?.trim()}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/menu#international">International</Link>
                </li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h5>Follow</h5>
              <ul>
                <li>
                  <Link href="#">Instagram</Link>
                </li>
                <li>
                  <Link href="#">Facebook</Link>
                </li>
                <li>
                  <Link href="#">TikTok</Link>
                </li>
                <li>
                  <Link href="#">WhatsApp</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© 2026 CalmTable. Dine with Dignity.</span>
            <span>Pan-African & Global Dining</span>
          </div>
        </div>
      </footer>
    </div>
  );
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

function renderDishMedia(item: MenuItem) {
  const resolvedImage = resolveImageUrl(item);
  return (
    <div className={styles.dishMedia}>
      {resolvedImage ? (
        <Image
          src={resolvedImage}
          alt={item.name}
          fill
          sizes="(max-width: 900px) 100vw, 96px"
          unoptimized={shouldSkipImageOptimization(resolvedImage)}
        />
      ) : (
        <div className={styles.dishPlaceholder}>
          <p className={styles.dishPlaceholderText}>Image managed in admin</p>
        </div>
      )}
    </div>
  );
}

function renderDishTags(item: MenuItem) {
  const tags = getTags(item);
  const pills: Array<{ className: string; label: string }> = [];
  if (tags.isSignature) {
    pills.push({ className: styles.dishTagSig, label: 'Signature' });
  }
  if (tags.isVeg) {
    pills.push({ className: styles.dishTagVeg, label: 'Vegetarian' });
  }
  if (tags.isGlutenFree) {
    pills.push({ className: styles.dishTagGf, label: 'Gluten-Free' });
  }
  if (tags.isSpicy) {
    pills.push({ className: styles.dishTagHot, label: 'Hot' });
  }
  if (tags.isBestSeller) {
    pills.push({ className: styles.dishTagSig, label: 'Best Seller' });
  }

  if (pills.length === 0) {
    return null;
  }

  return (
    <div className={styles.dishTags}>
      {pills.map((pill) => (
        <span key={`${item.id}-${pill.label}`} className={`${styles.dishTag} ${pill.className}`}>
          {pill.label}
        </span>
      ))}
    </div>
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
          setItems(data);
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
