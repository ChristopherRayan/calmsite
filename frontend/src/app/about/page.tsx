'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import {
    fetchAboutUs,
    fetchFrontendSettings,
    fetchGalleryImages,
    fetchPublicMembers,
} from '@/lib/services';
import type { FrontendContentPayload, MembersResponseItem } from '@/lib/types';
import { normalizeImageSource, shouldSkipImageOptimization } from '@/lib/image';

import styles from './page.module.css';

const fallbackAboutPage = {
    hero: {
        eyebrow: 'Our Story',
        titleHtml: 'A calm place<br/>to <em>gather</em><br/>&amp; eat well.',
        description:
            'CalmTable was born from a simple conviction — that food tastes better when served without rush, noise, or pressure. We are a peace-first dining concept rooted in Pan-African cuisine, built for every kind of guest, in every kind of city.',
        quote:
            '"A calm, welcoming table where people gather to enjoy well-prepared food, meaningful conversation, and unhurried moments."',
        visualText: 'Pan-African Dining',
        stats: [
            { value: '4+', label: 'African Regions' },
            { value: '∞', label: 'Calm Moments' },
            { value: '1', label: 'Shared Table' },
        ],
    },
    visionMission: [
        {
            icon: '◎',
            title: 'Our Vision',
            body:
                'To establish CalmTable as a recognised calm dining brand — known for African cuisine, warm hospitality, and consistently peaceful dining environments across multiple locations, cities, and countries.',
        },
        {
            icon: '◈',
            title: 'Our Mission',
            body:
                'To serve authentic African dishes from across the continent, complemented by selected international meals on request, in a calm, respectful, and professionally managed setting — wherever CalmTable operates.',
        },
    ],
    values: [
        {
            title: 'Calm & Comfort',
            body:
                'Peaceful, unhurried dining — always. Guests are never rushed. Our spaces are designed for lingering, reflecting, and connecting.',
        },
        {
            title: 'Hospitality',
            body:
                'Every guest is welcomed with respect and genuine warmth — from the first greeting to the final goodbye, no exceptions.',
        },
        {
            title: 'Quality & Consistency',
            body:
                'Reliable food and service across every CalmTable location. The same standard, no matter where in Africa or beyond you find us.',
        },
        {
            title: 'Inclusivity',
            body:
                'Culturally neutral and globally welcoming. Our table is open to families, professionals, travellers, and communities alike.',
        },
        {
            title: 'Sustainability',
            body:
                'Responsible sourcing, local suppliers, and operations that respect the people and environments we are part of.',
        },
    ],
    valuesQuote: '"Simple food.<br/>Clean ingredients.<br/>Honest cooking."',
    serviceFlow: [
        {
            title: 'Calm welcome',
            body: 'Every guest is greeted warmly before anything else. No queue pressure, no rush to be seated.',
        },
        {
            title: 'Menu guidance',
            body: 'Optional and personalised — especially helpful for first-time guests exploring Pan-African dishes for the first time.',
        },
        {
            title: 'Flexible ordering',
            body: 'Special requests, dietary needs, international options — always accommodated without fuss or judgement.',
        },
        {
            title: 'Unhurried pacing',
            body: 'Food served neatly and on time, with no pressure to leave. Guests are always welcome to stay.',
        },
    ],
    formats: [
        {
            title: 'CalmTable — Flagship',
            body: 'Full dining experience with Pan-African core menu and international specials on request.',
        },
        {
            title: 'CalmTable Café',
            body: 'Lighter fare and beverages — ideal for work meetings, quiet mornings, and short visits.',
        },
        {
            title: 'CalmTable Garden',
            body: 'Outdoor dining concept for locations with natural spaces and open-air ambience.',
        },
        {
            title: 'CalmTable Catering',
            body: 'Custom menus for events, NGOs, corporate groups, and special gatherings of any size.',
        },
        {
            title: 'CalmTable Express',
            body: 'Limited-menu format for transit hubs, university canteens, and travel corridors.',
        },
    ],
    community: {
        title: 'Community & Responsibility',
        description:
            'CalmTable integrates responsibly into every community it enters — not as a brand imposing itself, but as a neighbour contributing genuine value.',
        cards: [
            {
                icon: '◉',
                title: 'Local Sourcing',
                body: 'We give preference to local suppliers and farmers — building supply chains that support the communities we serve in, with fair procurement practices throughout.',
            },
            {
                icon: '◎',
                title: 'Employment & Training',
                body: 'We hire locally and invest in staff development. CalmTable is a training ground for cooks, servers, and future hospitality professionals.',
            },
            {
                icon: '◈',
                title: 'Waste Reduction',
                body: 'Food-waste reduction and responsible operations are long-term commitments — from portion control to composting programmes in mature locations.',
            },
            {
                icon: '○',
                title: 'Cultural Respect',
                body: 'We carry deep respect for regional food cultures. CalmTable is values-based and carries no ideological positioning — quality and responsibility only.',
            },
            {
                icon: '◇',
                title: 'Inclusive Access',
                body: 'Discount days for students, quiet mornings for seniors, and family-friendly pricing — making calm dining accessible beyond a privileged few.',
            },
        ],
        mottoHtml: 'No ideological positioning —<br/><span>quality and responsibility only.</span>',
        pills: [
            'Student discounts',
            'Quiet mornings for seniors',
            'Local farmer partnerships',
            'Faith-neutral values',
            'Composting (long-term)',
            'Local employment first',
            'Fair procurement',
            'Food-waste reduction',
        ],
    },
    team: {
        title: 'Our Team',
        description:
            'A calm brand starts with calm people. Our team shares one philosophy — every guest deserves genuine care, not performative service.',
    },
    gallery: {
        title: 'Gallery',
        description: 'The spaces, the food, and the atmosphere that define every CalmTable experience.',
    },
    cta: {
        title: 'Come to the table.',
        description: 'Find your nearest CalmTable location and reserve your seat.',
        button: 'Make a Reservation',
    },
};

export default function AboutPage() {
    const [settings, setSettings] = useState<FrontendContentPayload | null>(null);
    const [teamMembers, setTeamMembers] = useState<MembersResponseItem[]>([]);
    const [galleryImages, setGalleryImages] = useState<{ src: string; title?: string; description: string }[]>([]);
    const [galleryLoaded, setGalleryLoaded] = useState(false);
    const [aboutUsData, setAboutUsData] = useState<{
        title: string;
        subtitle: string;
        description: string;
        quote: string;
        about_image?: string | null;
        services?: { title: string; description: string; order?: number; is_active?: boolean }[];
        vision_title: string;
        vision_body: string;
        cuisine_title: string;
        cuisine_body: string;
        service_title: string;
        service_body: string;
        years_serving: string;
        menu_items: string;
        rating: string;
    } | null>(null);

    useEffect(() => {
        fetchFrontendSettings().then(setSettings).catch(console.error);
    }, []);

    useEffect(() => {
        fetchPublicMembers().then(setTeamMembers).catch(() => setTeamMembers([]));
    }, []);

    useEffect(() => {
        fetchGalleryImages()
            .then((images) => {
                if (images && images.length > 0) {
                    setGalleryImages(images);
                    setGalleryLoaded(true);
                } else {
                    setGalleryImages([]);
                    setGalleryLoaded(false);
                }
            })
            .catch(() => {
                setGalleryImages([]);
                setGalleryLoaded(false);
            });
    }, []);

    useEffect(() => {
        fetchAboutUs()
            .then((data) => {
                if (data) {
                    setAboutUsData(data);
                }
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        const elements = Array.from(document.querySelectorAll(`.${styles.reveal}`));
        if (!('IntersectionObserver' in window)) {
            elements.forEach((el) => el.classList.add(styles.revealIn));
            return;
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
        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const aboutPage = (settings as any)?.about_page ?? fallbackAboutPage;
    const hero = aboutPage.hero ?? fallbackAboutPage.hero;
    const heroTitleHtml = hero.titleHtml || hero.title_html || fallbackAboutPage.hero.titleHtml;
    const visionMission = aboutPage.visionMission || aboutPage.vision_mission || fallbackAboutPage.visionMission;
    const values = aboutPage.values ?? fallbackAboutPage.values;
    const serviceFlow = aboutPage.serviceFlow || aboutPage.service_flow || fallbackAboutPage.serviceFlow;
    const formats = aboutPage.formats ?? fallbackAboutPage.formats;
    const community = aboutPage.community ?? fallbackAboutPage.community;
    const teamIntro = aboutPage.team ?? fallbackAboutPage.team;
    const galleryIntro = aboutPage.gallery ?? fallbackAboutPage.gallery;
    const cta = aboutPage.cta ?? fallbackAboutPage.cta;

    const resolvedTeam = teamMembers.length > 0 ? teamMembers : [];

    const galleryItems = useMemo(() => {
        if (galleryLoaded && galleryImages.length > 0) {
            return galleryImages.map((item) => ({
                ...item,
                src: normalizeImageSource(item.src),
            }));
        }
        return [] as { src: string; title?: string; description: string }[];
    }, [galleryLoaded, galleryImages]);

  const heroDescription = aboutUsData?.description || hero.description;
  const heroQuote = aboutUsData?.quote || hero.quote;
  const heroVisualText = hero.visualText || hero.visual_text || fallbackAboutPage.hero.visualText;
  const valuesQuoteHtml = aboutPage.valuesQuote || aboutPage.values_quote_html || fallbackAboutPage.valuesQuote;
  const communityMottoHtml = community.mottoHtml || community.motto_html || fallbackAboutPage.community.mottoHtml;
  const heroImage = normalizeImageSource(
    aboutUsData?.about_image || settings?.home?.about_image || ''
  );

    const visionCard = {
        icon: visionMission[0]?.icon ?? '◎',
        title: aboutUsData?.vision_title || visionMission[0]?.title,
        body: aboutUsData?.vision_body || visionMission[0]?.body,
    };
    const missionCard = {
        icon: visionMission[1]?.icon ?? '◈',
        title: aboutUsData?.cuisine_title || visionMission[1]?.title,
        body: aboutUsData?.cuisine_body || visionMission[1]?.body,
    };

    const servicesFlow = serviceFlow.length > 0 ? serviceFlow : fallbackAboutPage.serviceFlow;
    const formatCards = formats.length > 0 ? formats : fallbackAboutPage.formats;

    const teamCards = resolvedTeam.length > 0
        ? resolvedTeam.map((member) => ({
            name: member.name,
            role: member.role,
            photo: member.photo,
        }))
        : [
            { name: 'Founder & Director', role: 'Leadership & Vision', photo: '' },
            { name: 'Head Chef', role: 'Pan-African Cuisine', photo: '' },
            { name: 'Operations Lead', role: 'Service & Standards', photo: '' },
            { name: 'Guest Experience', role: 'Hospitality & Care', photo: '' },
        ];

    return (
        <div className={styles.page}>
            <section className={styles.hero} id="story">
                <div className={`${styles.heroTxt} ${styles.reveal}`}>
                    <p className={styles.eyebrow}>{hero.eyebrow}</p>
                    <h1
                        className={styles.heroTitle}
                        dangerouslySetInnerHTML={{ __html: heroTitleHtml }}
                    />
                    <p className={styles.heroDesc}>{heroDescription}</p>
                    <blockquote className={styles.heroQuote}>{heroQuote}</blockquote>
                </div>
        <div className={`${styles.heroVis} ${styles.reveal} ${styles.delay1}`}>
          <div className={styles.visTop}>
            {heroImage ? (
              <Image
                src={heroImage}
                alt="Pan-African Dining"
                fill
                className={styles.visTopImage}
                unoptimized={shouldSkipImageOptimization(heroImage)}
                priority
              />
            ) : null}
            <div className={styles.visTopOverlay} />
            <div className={styles.visDots} />
            <span className={styles.visTopText}>{heroVisualText}</span>
          </div>
                    <div className={styles.visBottom}>
                        {hero.stats.map((stat: { value: string; label: string }) => (
                            <div key={stat.label}>
                                <div className={styles.statNum}>{stat.value}</div>
                                <div className={styles.statLbl}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`${styles.sec} ${styles.vm}`}>
                <div className={`${styles.secHd} ${styles.reveal}`}>
                    <h2>Vision &amp; Mission</h2>
                    <p>
                        Everything we do traces back to two guiding commitments — a vision for what CalmTable will become,
                        and a mission for how we serve every single day.
                    </p>
                </div>
                <div className={`${styles.vmGrid} ${styles.reveal} ${styles.delay1}`}>
                    {[visionCard, missionCard].map((card) => (
                        <div key={card.title} className={styles.vmCard}>
                            <div className={styles.vmIcon}>{card.icon}</div>
                            <h3>{card.title}</h3>
                            <p>{card.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className={`${styles.sec} ${styles.vals}`}>
                <div className={`${styles.secHd} ${styles.reveal}`}>
                    <h2>What We Stand For</h2>
                    <p>
                        Five principles shape every decision we make — from how we design our spaces to how we welcome every
                        guest through the door.
                    </p>
                </div>
                <div className={`${styles.valGrid} ${styles.reveal} ${styles.delay1}`}>
                    {values.map((value, index) => (
                        <div key={value.title} className={styles.valCard}>
                            <div className={styles.valNum}>{String(index + 1).padStart(2, '0')}</div>
                            <h4>{value.title}</h4>
                            <p>{value.body}</p>
                        </div>
                    ))}
                    <div className={`${styles.valCard} ${styles.valQuote}`}>
                        <blockquote dangerouslySetInnerHTML={{ __html: valuesQuoteHtml }} />
                    </div>
                </div>
            </section>

            <section className={`${styles.sec} ${styles.svc}`}>
                <div className={`${styles.secHd} ${styles.reveal}`}>
                    <h2>How We Serve</h2>
                    <p>
                        Our service model is standardised but deeply human — enabling consistency at scale while ensuring every
                        guest feels personally cared for.
                    </p>
                </div>
                <div className={styles.svcInner}>
                    <div className={`${styles.reveal}`}>
                        {servicesFlow.map((step: { title: string; body: string }, index: number) => (
                            <div key={step.title} className={styles.flowStep}>
                                <div className={styles.stepDot}>{index + 1}</div>
                                <div className={styles.stepTxt}>
                                    <h5>{step.title}</h5>
                                    <p>{step.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={`${styles.reveal} ${styles.delay1}`}>
                        <p className={styles.fmtLbl}>Our Formats</p>
                        {formatCards.map((format: { title: string; body: string }) => (
                            <div key={format.title} className={styles.fmtCard}>
                                <h5>{format.title}</h5>
                                <p>{format.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.comm}>
                <div className={`${styles.secHd} ${styles.reveal}`}>
                    <h2>
                        Community &amp;<br />Responsibility
                    </h2>
                    <p>{community.description}</p>
                </div>
                <div className={`${styles.commGrid} ${styles.reveal} ${styles.delay1}`}>
                    {community.cards.map((card: { icon: string; title: string; body: string }) => (
                        <div key={card.title} className={styles.commCard}>
                            <div className={styles.commIc}>{card.icon}</div>
                            <h4>{card.title}</h4>
                            <p>{card.body}</p>
                        </div>
                    ))}
                    <div className={`${styles.commCard} ${styles.commMotto}`}>
                        <blockquote dangerouslySetInnerHTML={{ __html: communityMottoHtml }} />
                    </div>
                </div>
                <div className={`${styles.pills} ${styles.reveal} ${styles.delay2}`}>
                    {community.pills.map((pill: string) => (
                        <span key={pill} className={styles.pill}>
                            {pill}
                        </span>
                    ))}
                </div>
            </section>

            <section className={`${styles.sec} ${styles.team}`}>
                <div className={`${styles.secHd} ${styles.reveal}`}>
                    <h2>{teamIntro.title}</h2>
                    <p>{teamIntro.description}</p>
                </div>
                <div className={`${styles.teamGrid} ${styles.reveal} ${styles.delay1}`}>
                    {teamCards.map((member) => {
                        const photo = member.photo ? normalizeImageSource(member.photo) : '';
                        return (
                            <div key={member.name} className={styles.tmCard}>
                                <div className={styles.tmAv}>
                                    {photo ? (
                                        <Image
                                            src={photo}
                                            alt={member.name}
                                            width={320}
                                            height={320}
                                            className="h-full w-full object-cover"
                                            unoptimized={shouldSkipImageOptimization(photo)}
                                        />
                                    ) : (
                                        <span>{member.name.charAt(0)}</span>
                                    )}
                                </div>
                                <h4>{member.name}</h4>
                                <p>{member.role}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className={styles.gal}>
                <div className={`${styles.galHd} ${styles.reveal}`}>
                    <div className={styles.secHd}>
                        <h2>{galleryIntro.title}</h2>
                        <p>{galleryIntro.description}</p>
                    </div>
                </div>
                <div className={`${styles.galScroll} ${styles.reveal} ${styles.delay1}`}>
                    {galleryItems.length > 0 ? (
                        galleryItems.map((item) => (
                            <div key={item.src} className={styles.galItem}>
                                <div
                                    className={styles.galBg}
                                    style={{
                                        backgroundImage: `linear-gradient(to top,rgba(0,0,0,.5) 0%,transparent 55%), url(${item.src})`,
                                    }}
                                >
                                    <span className={styles.galLbl}>{item.title || 'CalmTable'}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.galItem}>
                            <div
                                className={styles.galBg}
                                style={{
                                    backgroundImage:
                                        'linear-gradient(to top,rgba(0,0,0,.5) 0%,transparent 55%),linear-gradient(135deg,#7A5038,#C8845A)',
                                }}
                            >
                                <span className={styles.galLbl}>The Dining Room</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <div className={`${styles.ctaBand} ${styles.reveal}`}>
                <h2>{cta.title}</h2>
                <p>{cta.description}</p>
                <button className={styles.ctaBtn} type="button">
                    {cta.button}
                </button>
            </div>
        </div>
    );
}
