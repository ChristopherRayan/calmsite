// About page with gallery section
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchFrontendSettings, fetchPublicMembers, fetchGalleryImages, fetchAboutUs } from '@/lib/services';
import type { FrontendContentPayload, MembersResponseItem } from '@/lib/types';
import { normalizeImageSource, shouldSkipImageOptimization } from '@/lib/image';

const fallbackGalleryItems = [
    { src: '/images/gallery-1.png', title: 'Warm Interiors', description: 'Restaurant interior ambiance.' },
    { src: '/images/gallery-2.png', title: 'Signature Plates', description: 'Delicious plated dish.' },
    { src: '/images/gallery-3.png', title: 'Fresh Prep', description: 'Fresh ingredients preparation.' },
    { src: '/images/gallery-4.svg', title: 'Table Setting', description: 'Elegant table setting.' },
    { src: '/images/gallery-5.svg', title: 'Chef Craft', description: 'Chef preparing food.' },
    { src: '/images/reservation-bg.png', title: 'Cozy Dining', description: 'Cozy dining area.' },
];

const fallbackTestimonials = [
    {
        quote: 'The CalmTable turns every meal into an occasion. The flavors are rich, the service is flawless.',
        author: 'Zione Phiri',
    },
    {
        quote: 'We hosted our engagement dinner here and everything felt polished and intimate. Highly recommend.',
        author: 'Natasha Mbewe',
    },
    {
        quote: 'Every plate arrives with care. It is the most consistent dining experience in Mzuzu.',
        author: 'Brian Tembo',
    },
    {
        quote: 'The ambiance, the plating, the hospitality — it is all premium without feeling stiff.',
        author: 'Ethel Banda',
    },
];

const sectionShortcuts = [
    { id: 'about-heritage', label: 'Heritage' },
    { id: 'about-services', label: 'Services' },
    { id: 'about-testimonials', label: 'Testimonials' },
    { id: 'about-team', label: 'Our Team' },
    { id: 'about-gallery', label: 'Gallery' },
];

const fallbackTeam: MembersResponseItem[] = [
    {
        id: 1,
        name: 'Nala Banda',
        role: 'Executive Chef',
        bio: 'Leads our culinary direction with refined Malawian flavors and modern plating.',
        photo: '/images/avatar-placeholder.svg',
    },
    {
        id: 2,
        name: 'Peter Gondwe',
        role: 'Restaurant Manager',
        bio: 'Curates every guest experience from welcome to the final course.',
        photo: '/images/avatar-placeholder.svg',
    },
    {
        id: 3,
        name: 'Thoko Tembo',
        role: 'Pastry Specialist',
        bio: 'Crafts indulgent desserts with seasonal ingredients and signature artistry.',
        photo: '/images/avatar-placeholder.svg',
    },
    {
        id: 4,
        name: 'Lameck Mbewe',
        role: 'Sommelier',
        bio: 'Pairs each dish with wines and cocktails that elevate every bite.',
        photo: '/images/avatar-placeholder.svg',
    },
];

export default function AboutPage() {
    const [settings, setSettings] = useState<FrontendContentPayload | null>(null);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
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

    // Fetch gallery images from new API, fallback to settings
    useEffect(() => {
        fetchGalleryImages()
            .then((images) => {
                setGalleryImages(images ?? []);
                setGalleryLoaded(true);
            })
            .catch(() => {
                setGalleryImages([]);
                setGalleryLoaded(false);
            });
    }, []);

    // Fetch About Us data from new API
    useEffect(() => {
        fetchAboutUs()
            .then((data) => {
                if (data) {
                    setAboutUsData(data);
                }
            })
            .catch(console.error);
    }, []);

    const aboutImage =
        normalizeImageSource(aboutUsData?.about_image || '') ||
        normalizeImageSource(settings?.home.hero_bg_image || '') ||
        '/images/about-image.png';
    const testimonials = settings?.home.testimonials?.length ? settings.home.testimonials : fallbackTestimonials;

    // Use gallery from new API if available, otherwise fall back to settings
    const galleryItemsRaw = galleryLoaded
        ? galleryImages
        : (settings?.home.gallery_images ?? fallbackGalleryItems) as Array<
            { src: string; title?: string; description?: string } | string
        >;
    const normalizedGallery = galleryItemsRaw.map((item) =>
        typeof item === 'string' ? { src: item, title: '', description: '' } : item
    );
    const resolvedGallery = normalizedGallery.length > 0 ? normalizedGallery : [];
    const resolvedTeam = teamMembers.length > 0 ? teamMembers : fallbackTeam;

    const serviceIcons = [
        (
            <svg key="service-icon-1" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        (
            <svg key="service-icon-2" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        (
            <svg key="service-icon-3" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        ),
    ];

    const fallbackServices = [
        {
            title: 'Fine Dining',
            description: 'Exquisite culinary experiences with seasonal menus crafted by our award-winning chefs.',
        },
        {
            title: 'Private Events',
            description: 'Elegant spaces for celebrations, corporate gatherings, and intimate occasions.',
        },
        {
            title: 'Wine & Cocktails',
            description: 'Curated selections of premium wines and handcrafted cocktails for discerning palates.',
        },
    ];

    const normalizedServices = aboutUsData?.services?.filter(
        (service) => service && service.title && service.description && service.is_active !== false
    );
    const resolvedServices = normalizedServices && normalizedServices.length > 0 ? normalizedServices : fallbackServices;

    // Use About Us data from new API if available
    const resolvedTitle = aboutUsData?.title || 'Where Every Meal Is A Celebration';
    const resolvedSubtitle = aboutUsData?.subtitle || 'Our Heritage';
    const resolvedDescription =
        aboutUsData?.description ||
        settings?.about?.description ||
        'Near Simso Filling Station in Luwinga, we serve premium dishes in a warm family-restaurant setting.';
    const resolvedQuote =
        aboutUsData?.quote ||
        settings?.home.story_quote ||
        'A place where every moment becomes a memory, every dish tells a story.';
    const resolvedYears = aboutUsData?.years_serving || settings?.home.stats?.years_serving || '12+';
    const resolvedStats = {
        years_serving: resolvedYears,
        menu_items: aboutUsData?.menu_items || settings?.home.stats?.menu_items || '80+',
        rating: aboutUsData?.rating || settings?.home.stats?.rating || '4.9★',
    };
    const titleEmphasis = 'A Celebration';
    const hasTitleEmphasis = resolvedTitle.includes(titleEmphasis);
    const titleParts = hasTitleEmphasis ? resolvedTitle.split(titleEmphasis) : [resolvedTitle, ''];

    const aboutHighlights = aboutUsData
        ? [
            { title: aboutUsData.vision_title, description: aboutUsData.vision_body },
            { title: aboutUsData.cuisine_title, description: aboutUsData.cuisine_body },
            { title: aboutUsData.service_title, description: aboutUsData.service_body },
        ]
        : (settings?.home.about_features || [
            { title: 'Farm to Table', description: 'We source our ingredients from local farms and suppliers.' },
            { title: "Chef's Craft", description: 'Our experienced chefs bring passion to every dish.' },
        ]);

    useEffect(() => {
        if (activeTestimonial >= testimonials.length) {
            setActiveTestimonial(0);
        }
    }, [activeTestimonial, testimonials.length]);

    useEffect(() => {
        if (testimonials.length <= 1) {
            return;
        }

        const interval = window.setInterval(() => {
            setActiveTestimonial((current) => (current + 1) % testimonials.length);
        }, 6500);

        return () => window.clearInterval(interval);
    }, [testimonials.length]);

    return (
        <div className="min-h-screen bg-cream dark:bg-[#0a0604] pt-20">
            {/* Floating Section Shortcuts */}
            <nav className="about-shortcuts fixed left-1/2 top-14 z-50 hidden -translate-x-1/2 lg:flex" aria-label="About sections">
                <div className="relative flex h-14 items-center gap-6 rounded-full border border-woodAccent/25 bg-transparent px-4 shadow-[0_20px_50px_-35px_rgba(18,10,5,0.6)] backdrop-blur-md dark:border-woodAccent/30">
                    {sectionShortcuts.map((link) => (
                        <a
                            key={link.id}
                            href={`#${link.id}`}
                            className="group relative flex h-10 items-center gap-3 px-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-ink/70 transition-all hover:text-woodAccent dark:text-woodAccent/70 dark:hover:text-woodAccent"
                        >
                            <span className="h-[6px] w-[6px] rounded-full bg-woodAccent/60 transition-all group-hover:scale-125 group-hover:bg-woodAccent" />
                            <span className="whitespace-nowrap">{link.label}</span>
                            <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-woodAccent/80 transition-all duration-300 group-hover:w-full" />
                        </a>
                    ))}
                </div>
            </nav>

            <nav className="about-shortcuts fixed left-1/2 top-[calc(env(safe-area-inset-top)+4.5rem)] z-40 flex h-12 max-w-[92vw] -translate-x-1/2 items-center gap-5 overflow-x-auto rounded-full border border-woodAccent/25 bg-cream/90 px-5 shadow-[0_18px_40px_-30px_rgba(18,10,5,0.6)] backdrop-blur-md dark:border-woodAccent/30 dark:bg-[#0a0604]/85 lg:hidden" aria-label="About sections">
                {sectionShortcuts.map((link) => (
                    <a
                        key={link.id}
                        href={`#${link.id}`}
                        className="group relative flex h-10 items-center whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.28em] text-ink/70 transition-all hover:text-woodAccent dark:text-woodAccent/70 dark:hover:text-woodAccent"
                    >
                        {link.label}
                        <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-woodAccent/80 transition-all duration-300 group-hover:w-full" />
                    </a>
                ))}
            </nav>
            {/* About Section */}
            <section id="about-heritage" className="py-16 sm:py-24 scroll-mt-28">
                <div className="page-shell">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="relative">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl md:rounded-[3rem] border border-white/10 dark:border-white/10 ring-1 ring-white/5">
                                <Image
                                    src={aboutImage}
                                    alt="Inside The CalmTable"
                                    fill
                                    className="object-cover"
                                    unoptimized={shouldSkipImageOptimization(aboutImage)}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-cream dark:from-[#0a0604]/80 via-transparent to-transparent" />
                            </div>
                            {/* Floating Badge */}
                            <div className="absolute -bottom-6 -right-4 sm:-right-8 rounded-2xl bg-gradient-to-br from-[#2a1810]/95 to-[#1a0f08]/95 p-5 sm:p-6 backdrop-blur-md border border-amber-500/20 shadow-2xl">
                                <div className="text-center">
                                    <span className="block text-3xl sm:text-4xl font-bold text-amber-500 font-heading">
                                        {resolvedStats.years_serving}
                                    </span>
                                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-ink dark:text-white/70 mt-1 sm:mt-2">
                                        Years Serving
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-4">
                                {resolvedSubtitle}
                            </p>
                            <h1 className="font-heading text-4xl sm:text-5xl font-bold leading-tight mb-6">
                                {hasTitleEmphasis ? (
                                    <>
                                        {titleParts[0]}
                                        <em className="text-amber-400">{titleEmphasis}</em>
                                        {titleParts[1]}
                                    </>
                                ) : (
                                    resolvedTitle
                                )}
                            </h1>

                            <div className="w-16 h-[1px] bg-gradient-to-r from-amber-500 to-transparent mb-6" />

                            <blockquote className="text-lg sm:text-xl font-light italic text-ink dark:text-white/90 leading-relaxed mb-6 border-l-2 border-amber-500/40 pl-4 sm:pl-6">
                                &ldquo;{resolvedQuote}&rdquo;
                            </blockquote>

                            <p className="text-ink dark:text-white/60 leading-relaxed mb-8 text-sm sm:text-base">
                                {resolvedDescription}
                            </p>

                            <div className="grid sm:grid-cols-2 gap-6">
                                {aboutHighlights.map((feature, i) => (
                                    <div key={i}>
                                        <p className="font-bold text-amber-100 dark:text-amber-400 mb-2 font-heading tracking-wide">{feature.title}</p>
                                        <p className="text-sm text-ink dark:text-white/50 leading-relaxed">{feature.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Services Section - Premium */}
            <section id="about-services" className="py-16 sm:py-24 scroll-mt-28 bg-gradient-to-b from-cream to-amber-50/50 dark:from-[#1a1512] dark:to-[#0f0c09]">
                <div className="page-shell">
                    <header className="mb-16 text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-4">
                            What We Offer
                        </p>
                        <h2 className="font-heading text-4xl sm:text-5xl font-bold leading-tight mb-6">
                            Our <em className="text-amber-500">Premium Services</em>
                        </h2>
                        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-6" />
                        <p className="text-ink/70 dark:text-white/50 max-w-2xl mx-auto text-base sm:text-lg">
                            Experience exceptional dining and hospitality services tailored to create unforgettable moments.
                        </p>
                    </header>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {resolvedServices.map((service, index) => (
                            <div
                                key={index}
                                className="group relative p-8 rounded-2xl bg-white dark:bg-[#1a1512] border border-amber-100/30 dark:border-amber-800/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50/50 to-amber-100/20 dark:from-amber-900/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/90 to-amber-600/90 dark:from-amber-500/80 dark:to-amber-700/80 flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        {serviceIcons[index % serviceIcons.length]}
                                    </div>
                                    <h3 className="font-heading text-xl font-semibold text-ink dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                        {service.title}
                                    </h3>
                                    <p className="text-sm text-ink/60 dark:text-white/40 leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent group-hover:w-full transition-all duration-500" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <a
                            href="/menu"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold uppercase tracking-wider text-sm hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            Explore Our Menu
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="about-testimonials" className="relative py-20 sm:py-28 scroll-mt-28 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream to-amber-50/40 dark:from-[#0a0604] dark:via-[#120a05] dark:to-[#2a1810]/40" />
                <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-tableBrown/15 blur-[120px]" />
                <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-amber-500/10 blur-[140px]" />

                <div className="page-shell relative">
                    <header className="mb-12 text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-4">
                            Guest Stories
                        </p>
                        <h2 className="font-heading text-3xl sm:text-4xl font-bold leading-tight">
                            Testimonials That <em className="text-amber-400">Glide</em>
                        </h2>
                        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-6" />
                    </header>

                    <div className="relative mx-auto max-w-3xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTestimonial}
                                initial={{ opacity: 0, x: 80 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -80 }}
                                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                                className="relative overflow-hidden rounded-3xl border border-woodAccent/25 bg-white/70 dark:bg-[#1a0f08]/70 p-8 sm:p-10 backdrop-blur-xl shadow-[0_30px_80px_-50px_rgba(18,10,5,0.9)]"
                            >
                                <div className="absolute left-6 top-6 h-12 w-12 rounded-full bg-amber-500/10" />
                                <div className="absolute right-8 top-10 h-2 w-20 bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />
                                <p className="relative text-lg sm:text-xl font-light italic text-ink dark:text-white/85 leading-relaxed">
                                    “{testimonials[activeTestimonial].quote}”
                                </p>
                                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-woodAccent/70">
                                            Guest
                                        </p>
                                        <p className="font-heading text-xl text-ink dark:text-white">
                                            {testimonials[activeTestimonial].author}
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-woodAccent/60">
                                        {String(activeTestimonial + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
                                    </span>
                                </div>
                                <div className="mt-8 h-px w-full bg-woodAccent/25">
                                    <motion.span
                                        key={`progress-${activeTestimonial}`}
                                        className="block h-px bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300"
                                        style={{ transformOrigin: '0% 50%' }}
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 6.5, ease: 'linear' }}
                                    />
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-6 flex items-center justify-center gap-3">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setActiveTestimonial(index)}
                                    className={
                                        index === activeTestimonial
                                            ? 'h-2.5 w-10 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)] transition-all'
                                            : 'h-2.5 w-4 rounded-full bg-woodAccent/40 hover:bg-woodAccent/70 transition-all'
                                    }
                                    aria-label={`View testimonial ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Team Section */}
            <section id="about-team" className="py-20 sm:py-28 scroll-mt-28 bg-cream dark:bg-[#120a05]">
                <div className="page-shell">
                    <header className="mb-12 text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-4">
                            Our Team
                        </p>
                        <h2 className="font-heading text-3xl sm:text-4xl font-bold leading-tight">
                            The People Behind <em className="text-amber-400">Every Plate</em>
                        </h2>
                        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-6" />
                    </header>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {resolvedTeam.map((member) => {
                            const photo =
                                normalizeImageSource(member.photo || '') || '/images/avatar-placeholder.svg';
                            return (
                                <div
                                    key={member.id}
                                    className="group relative overflow-hidden rounded-3xl border border-woodAccent/20 bg-white/80 dark:bg-[#1a0f08]/70 p-6 shadow-[0_18px_50px_-35px_rgba(18,10,5,0.45)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_70px_-35px_rgba(18,10,5,0.55)]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-amber-900/10" />
                                    <div className="relative flex flex-col items-center text-center">
                                        <div className="relative h-24 w-24 overflow-hidden rounded-full border border-woodAccent/30 bg-woodAccent/10">
                                            <Image
                                                src={photo}
                                                alt={member.name}
                                                fill
                                                className="object-cover"
                                                unoptimized={shouldSkipImageOptimization(photo)}
                                            />
                                        </div>
                                        <p className="mt-5 font-heading text-xl text-ink dark:text-white">
                                            {member.name}
                                        </p>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-woodAccent/70 mt-2">
                                            {member.role}
                                        </p>
                                        <p className="mt-4 text-sm text-ink/60 dark:text-white/50 leading-relaxed">
                                            {member.bio}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            {resolvedGallery.length > 0 && (
                <section id="about-gallery" className="py-16 sm:py-24 scroll-mt-28 bg-woodAccent/5 dark:bg-[#1a0f08]/60">
                    <div className="page-shell">
                        <header className="mb-12 text-center">
                            <h2 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-[0.1em] text-woodAccent dark:text-woodAccent mb-4">
                                Our Gallery
                            </h2>
                            <p className="text-ink dark:text-woodAccent/70 max-w-2xl mx-auto">
                                Experience the ambiance of The CalmTable through our curated collection of photos
                                showcasing our restaurant, dishes, and memorable moments.
                            </p>
                        </header>

                        <div className="grid auto-rows-[180px] grid-cols-1 gap-5 sm:auto-rows-[200px] sm:grid-cols-3 lg:auto-rows-[220px] lg:grid-cols-4">
                            {resolvedGallery.slice(0, 6).map((image, index) => {
                                const span = [
                                    'sm:col-span-2 sm:row-span-2',
                                    'sm:col-span-1 sm:row-span-1',
                                    'sm:col-span-1 sm:row-span-2',
                                    'sm:col-span-2 sm:row-span-1',
                                    'sm:col-span-1 sm:row-span-1',
                                    'sm:col-span-1 sm:row-span-1',
                                ][index % 6];

                                const title = image.title?.trim() || 'Gallery highlight';
                                const description = image.description?.trim() || 'Gallery moment';

                                return (
                                    <div
                                        key={`${image.src}-${index}`}
                                        className={`group relative overflow-hidden rounded-2xl bg-woodAccent/10 dark:bg-[#2a1810] ${span}`}
                                    >
                                        <Image
                                            src={image.src}
                                            alt={title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f08]/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                        <div className="absolute inset-x-0 bottom-0 p-4 text-amber-100/90 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">{title}</p>
                                            <p className="mt-1 text-[11px] text-amber-100/70">{description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="border-t border-woodAccent/20 py-8 bg-cream dark:bg-[#0a0604]">
                <div className="page-shell">
                    <div className="flex flex-col gap-3 text-[11px] uppercase tracking-[0.1em] text-muted md:flex-row md:items-center md:justify-between">
                        <p>© 2026 The CalmTable. Dine with Dignity.</p>
                        <div className="flex gap-5 text-woodAccent/60">
                            <span>Instagram</span>
                            <span>Facebook</span>
                            <span>TikTok</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
