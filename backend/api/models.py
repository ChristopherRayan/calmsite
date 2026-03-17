"""Database models for menu, reservations, reviews, ordering, notifications, and staff members."""
from copy import deepcopy
import secrets
import string
from decimal import Decimal
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils import timezone


def default_frontend_content() -> dict:
    """Return default editable content payload for frontend pages."""
    return {
        "brand_name": "The CalmTable",
        "brand_tagline": "Dine with Dignity",
        "contact": {
            "address_line_1": "Near Simso Filling Station",
            "address_line_2": "Luwinga, Mzuzu, Malawi",
            "phone": "+265 999 000 000",
            "email": "hello@calmtable.mw",
            "whatsapp": "+265 888 000 000",
            "map_embed_url": "https://maps.google.com/maps?q=Simso%20Filling%20Station%2C%20Luwinga%2C%20Mzuzu%2C%20Malawi&t=&z=15&ie=UTF8&iwloc=&output=embed",
            "opening_hours": [
                {"day": "Monday - Friday", "hours": "07:00 - 21:00"},
                {"day": "Saturday", "hours": "08:00 - 22:00"},
                {"day": "Sunday", "hours": "Closed"},
            ],
        },
        "home": {
            "hero_eyebrow": "The CalmTable & Family Restaurant",
            "hero_title_prefix": "Modern fine dining with a",
            "hero_title_emphasis": "calm atmosphere",
            "hero_title_suffix": "and unforgettable flavors.",
            "hero_description": "Join us for handcrafted dishes, warm hospitality, and premium ambiance near Simso Filling Station, Luwinga, Mzuzu.",
            "hero_bg_image": "/images/hero-placeholder.png",
            "about_image": "/images/about-image.png",
            "story_quote": "Good food is the foundation of genuine happiness - we serve both.",
            "story_description": "The CalmTable started as a family kitchen with one promise: feed every guest with dignity and care. Today we serve Malawian favorites, fresh fish, and heritage recipes in a refined, welcoming setting.",
            "reservation_bg_image": "/images/reservation-bg.png",
            "about_features": [
                {"title": "Fresh Daily", "description": "Cooked every morning"},
                {"title": "Family Owned", "description": "Since 2012"},
                {"title": "Made with Care", "description": "Every single plate"},
            ],
            "why_items": [
                {"title": "Local Ingredients", "description": "We source directly from Malawian suppliers for daily freshness."},
                {"title": "Family Atmosphere", "description": "Every guest receives warm, dignified, and personal service."},
                {"title": "Fast Service", "description": "Meals arrive hot and quickly, without compromising quality."},
                {"title": "Hygiene First", "description": "Clean kitchen, strict standards, and consistent food safety."},
            ],
            "stats": {
                "years_serving": "12+",
                "menu_items": "80+",
                "rating": "4.9★",
            },
            "reservation_banner_title": "Book a Table for",
            "reservation_banner_emphasis": "An Unforgettable Evening",
            "reservation_banner_description": "Reserve your table in advance and let us prepare your premium dining experience.",
            "testimonials": [
                {"quote": "The Chambo was absolutely divine. I keep coming back because the quality never drops.", "author": "Amara Nkhoma"},
                {"quote": "Our family reunion was hosted perfectly. Warm service, great portions, and elegant atmosphere.", "author": "Chisomo Banda"},
                {"quote": "Best Masamba Otendera in Mzuzu. Authentic taste and consistently professional service.", "author": "Takondwa Mwale"},
            ],
            "gallery_images": [
                {"src": "/images/gallery-1.png", "title": "Warm Interiors", "description": "Warm interior lighting and dining ambience."},
                {"src": "/images/gallery-2.png", "title": "Signature Plate", "description": "Signature plated dish with seasonal garnish."},
                {"src": "/images/gallery-3.png", "title": "Fresh Prep", "description": "Fresh ingredients prepared for today’s service."},
                {"src": "/images/gallery-4.svg", "title": "Table Setting", "description": "Elegant table setting for evening guests."},
                {"src": "/images/gallery-5.svg", "title": "Chef Craft", "description": "Chef finishing touches on a premium course."},
                {"src": "/images/reservation-bg.png", "title": "Cozy Dining", "description": "Cozy dining space with intimate seating."},
            ],
        },
        "home_page": {
            "hero": {
                "kicker": "Pan-African & Global Dining",
                "title_html": "<span>A calm place to</span>gather<br/>&amp; <em>eat well.</em>",
                "side_label": "Est. CalmTable",
                "stats": [
                    {"value": "4+", "label": "African Regions"},
                    {"value": "80+", "label": "Menu Items"},
                    {"value": "4.9", "label": "Guest Rating"},
                ],
                "cta": {"label": "Reserve →", "sublabel": "Book your calm table"},
                "images": {"primary": "/images/hero_bg.jpg", "secondary": "/images/hero2_bg.jpg"},
            },
            "reservation": {
                "tag": "Reservations",
                "title_html": "Book your<br/>calm table",
                "note": "Guests are never rushed. We keep a seat ready for you — warm, unhurried, and always welcoming.",
                "hours": [
                    {"day": "Monday – Friday", "hours": "07:00 – 21:00"},
                    {"day": "Saturday", "hours": "08:00 – 22:00"},
                    {"day": "Sunday", "hours": "09:00 – 20:00"},
                    {"day": "Private Events", "hours": "By arrangement"},
                ],
                "form": {
                    "title": "Complete your booking",
                    "times": [
                        "07:00",
                        "07:30",
                        "08:00",
                        "08:30",
                        "12:00",
                        "12:30",
                        "13:00",
                        "13:30",
                        "18:00",
                        "18:30",
                        "19:00",
                        "19:30",
                        "20:00",
                        "20:30",
                    ],
                    "guests": [
                        "1 guest",
                        "2 guests",
                        "3 guests",
                        "4 guests",
                        "5 guests",
                        "6 guests",
                        "7 – 10 guests",
                        "11+ (private event)",
                    ],
                    "occasions": [
                        "Regular dining",
                        "Business lunch",
                        "Birthday",
                        "Anniversary",
                        "Private event",
                        "Other",
                    ],
                    "request_placeholder": "Dietary needs, seating preferences…",
                    "submit_label": "Confirm Reservation",
                    "success_label": "✓ Reservation Requested",
                },
            },
            "marquee": {
                "items": [
                    "A calm place to dine",
                    "African flavours. Calm moments.",
                    "Gather calmly. Eat well.",
                    "Where food meets peace.",
                    "Gather. Eat. Rest.",
                    "Simple food. Clean ingredients. Honest cooking.",
                ]
            },
            "brand": {
                "eyebrow": "Our Story",
                "quote_html": "A peace-first dining<br/>concept rooted in<br/><em>African flavour</em><br/>&amp; calm hospitality.",
                "body": (
                    "CalmTable was designed to be location-agnostic — operating successfully in cities, university towns, "
                    "border regions, and travel corridors across Africa and beyond. Every element, from the menu to the atmosphere, "
                    "is calibrated for one purpose: a genuinely calm, welcoming experience."
                ),
                "pills": [
                    "Pan-African Identity",
                    "Internationally Adaptable",
                    "Family-Friendly",
                    "Meeting-Ready",
                    "No rush, ever",
                    "Operationally Scalable",
                ],
                "cta_label": "Read our full story →",
                "cta_href": "/about",
                "stats": [
                    {"value": "12+", "label": "Years of calm service"},
                    {"value": "4+", "label": "African culinary regions"},
                    {"value": "80+", "label": "Dishes on the menu"},
                    {"value": "4.9", "label": "Average guest rating"},
                ],
            },
            "pillars": {
                "eyebrow": "What We Stand For",
                "title_html": "Five principles that<br/>define <em>every detail</em>",
                "items": [
                    {
                        "number": "01",
                        "title": "Calm & Comfort",
                        "description": "Peaceful, unhurried dining — always. Guests are never rushed. Our spaces are designed for lingering, reflecting, and connecting.",
                    },
                    {
                        "number": "02",
                        "title": "Hospitality",
                        "description": "Every guest is welcomed with respect and genuine warmth — from the first greeting to the final goodbye, no exceptions.",
                    },
                    {
                        "number": "03",
                        "title": "Quality & Consistency",
                        "description": "Reliable food and service across every CalmTable location. The same standard, wherever you find us — city, town, or transit hub.",
                    },
                    {
                        "number": "04",
                        "title": "Inclusivity",
                        "description": "Culturally neutral and globally welcoming. Families, professionals, travellers, students, and NGO workers are all equal at our table.",
                    },
                    {
                        "number": "05",
                        "title": "Sustainability",
                        "description": "Responsible sourcing, local supplier preference, fair procurement, and operations that actively respect the communities we serve.",
                    },
                ],
            },
            "cuisine": {
                "eyebrow": "Our Menu",
                "title_html": "Dishes from across<br/>the <em>African continent</em>",
                "description": (
                    "CalmTable celebrates African culinary diversity — freshly prepared, community-oriented, balanced. "
                    "International dishes are available on request and as rotating specials for global guests."
                ),
                "regions": [
                    {
                        "region": "Southern Africa",
                        "name": "Grains & Greens",
                        "dishes": ["Nsima / Pap / Sadza", "Beans & lentils", "Leafy greens", "Chicken, goat, fish"],
                    },
                    {
                        "region": "East Africa",
                        "name": "Swahili Coast",
                        "dishes": ["Pilau-style rice", "Coconut stews", "Chapati", "Swahili dishes"],
                    },
                    {
                        "region": "West Africa",
                        "name": "Bold & Hearty",
                        "dishes": ["Jollof-style rice", "Peanut stews", "Plantain", "Seasonal specials"],
                    },
                    {
                        "region": "Central Africa",
                        "name": "Root & Stew",
                        "dishes": ["Cassava meals", "Vegetable stews", "Slow proteins", "Rotating specials"],
                    },
                ],
                "intl_note": (
                    "International & Global Dishes — available on request, as rotating specials, "
                    "and for long-stay guests, tourists & corporate groups."
                ),
                "link_label": "View Full Menu",
                "link_href": "/menu",
            },
            "service": {
                "eyebrow": "How We Serve",
                "title_html": "Service that is<br/>calm, attentive,<br/><em>&amp; deeply human</em>",
                "body": (
                    "Our service model is standardised but never robotic — enabling consistency at scale while ensuring "
                    "every guest feels personally cared for. No performance. No pressure. Just presence."
                ),
                "quote": "\"Guests should feel welcome to stay — not rushed.\"",
                "steps": [
                    {
                        "number": "01",
                        "title": "Calm welcome",
                        "description": "Every guest is greeted warmly before anything else. No queue pressure, no rush to be seated.",
                    },
                    {
                        "number": "02",
                        "title": "Optional menu guidance",
                        "description": "Personalised help — especially for first-time guests discovering Pan-African cuisine.",
                    },
                    {
                        "number": "03",
                        "title": "Flexible ordering",
                        "description": "Special requests, dietary needs, international options — always accommodated without fuss.",
                    },
                    {
                        "number": "04",
                        "title": "Comfortable, unhurried pacing",
                        "description": "Food served neatly and on time. No pressure to leave. Guests are always welcome to linger.",
                    },
                    {
                        "number": "05",
                        "title": "Menu explained with care",
                        "description": "Especially for first-time visitors — every dish has a story, and our team is proud to tell it.",
                    },
                ],
            },
            "testimonials": {
                "eyebrow": "Guest Voices",
                "title_html": "What our guests <em>say</em>",
                "items": [
                    {
                        "quote": (
                            "The CalmTable turns every meal into an occasion. The flavors are rich, the service is warm — "
                            "nothing feels rushed."
                        ),
                        "author": "Zione Phiri",
                    },
                    {
                        "quote": "We hosted our engagement dinner here and everything felt polished and intimate. Highly recommend.",
                        "author": "Natasha Mbewe",
                    },
                    {
                        "quote": "Every plate arrives with genuine care. The most consistent dining experience I have found.",
                        "author": "Brian Tembo",
                    },
                    {
                        "quote": "The ambiance, the plating, the hospitality — all premium without feeling stiff or hurried.",
                        "author": "Ethel Banda",
                    },
                ],
            },
            "community": {
                "eyebrow": "Community & Responsibility",
                "title_html": "Responsible in every<br/>community we <em>enter</em>",
                "body": (
                    "CalmTable integrates responsibly into every location — not imposing, but contributing genuine value. "
                    "No ideological positioning — quality and responsibility only."
                ),
                "pills": [
                    "Student discounts",
                    "Quiet mornings for seniors",
                    "Local farmer partnerships",
                    "Local employment first",
                    "Food-waste reduction",
                    "Fair procurement",
                    "Faith-neutral values",
                ],
                "items": [
                    {
                        "icon": "◉",
                        "title": "Local Sourcing",
                        "description": "Preference for local suppliers and farmers — building supply chains that genuinely support the communities we operate in.",
                    },
                    {
                        "icon": "◎",
                        "title": "Employment & Training",
                        "description": "We hire locally and invest in staff development — CalmTable is a training ground for future hospitality professionals.",
                    },
                    {
                        "icon": "◈",
                        "title": "Cultural Respect",
                        "description": "Deep respect for regional food cultures. Values-based, not ideologically positioned.",
                    },
                    {
                        "icon": "◇",
                        "title": "Inclusive Access",
                        "description": "Discount days for students, quiet mornings for seniors — calm dining for everyone, not just a privileged few.",
                    },
                ],
            },
            "formats": {
                "eyebrow": "Growth & Scalability",
                "title_html": "CalmTable<br/><em>in every format</em>",
                "note": (
                    "CalmTable is designed as a multi-location brand — each format shares the same core DNA, "
                    "with local menu adaptations."
                ),
                "items": [
                    {
                        "number": "01",
                        "title": "Flagship",
                        "description": "Full dining experience with the complete Pan-African core menu and international specials on request.",
                    },
                    {
                        "number": "02",
                        "title": "CalmTable Café",
                        "description": "Lighter fare and beverages — ideal for work meetings, quiet mornings, and short visits.",
                    },
                    {
                        "number": "03",
                        "title": "Garden",
                        "description": "Outdoor dining for locations with natural spaces — the calm of nature brought to the table.",
                    },
                    {
                        "number": "04",
                        "title": "Catering",
                        "description": "Custom menus for events, NGOs, corporate groups, and special gatherings of any size.",
                    },
                    {
                        "number": "05",
                        "title": "Express",
                        "description": "Limited-menu format for transit hubs, university canteens, and travel corridors.",
                    },
                ],
            },
            "gallery": {
                "eyebrow": "Gallery",
                "title_html": "Spaces &amp; <em>moments</em>",
                "items": [
                    {"label": "The Dining Room", "image": "/images/gallery-1.png"},
                    {"label": "Garden Setting", "image": "/images/gallery-2.png"},
                    {"label": "Pan-African Menu", "image": "/images/gallery-3.png"},
                    {"label": "The Atmosphere", "image": "/images/gallery-4.svg"},
                    {"label": "Calm Evenings", "image": "/images/gallery-5.svg"},
                    {"label": "Community Table", "image": "/images/reservation-bg.png"},
                ],
            },
            "final_cta": {
                "title_html": "Come to<br/>the <em>table.</em>",
                "subtitle": "Find your nearest CalmTable location. Reserve your seat. Stay as long as you like.",
                "button_label": "Reserve a Table",
                "button_href": "#reservations",
            },
            "footer": {
                "tagline": "\"A peaceful dining space where wholesome food, warm hospitality, and calm moments come together.\"",
                "columns": [
                    {
                        "title": "Navigate",
                        "links": [
                            {"label": "Home", "href": "/"},
                            {"label": "Menu", "href": "/menu"},
                            {"label": "About Us", "href": "/about"},
                            {"label": "Contact", "href": "/contact"},
                            {"label": "Reservations", "href": "#reservations"},
                        ],
                    },
                    {
                        "title": "Formats",
                        "links": [
                            {"label": "Flagship", "href": "/menu"},
                            {"label": "CalmTable Café", "href": "/menu"},
                            {"label": "Garden", "href": "/menu"},
                            {"label": "Catering", "href": "/contact"},
                            {"label": "Express", "href": "/menu"},
                        ],
                    },
                    {
                        "title": "Follow",
                        "links": [
                            {"label": "Instagram", "href": "#"},
                            {"label": "Facebook", "href": "#"},
                            {"label": "TikTok", "href": "#"},
                            {"label": "WhatsApp", "href": "#"},
                        ],
                    },
                ],
                "bottom_left": "© 2026 CalmTable. Dine with Dignity.",
                "bottom_right": "Pan-African & Global Dining",
            },
        },
        "about": {
            "description": "Near Simso Filling Station in Luwinga, we serve premium dishes in a warm family-restaurant setting.",
            "cards": [
                {"title": "Vision", "body": "Build a modern Malawian dining brand where consistency, comfort, and quality define every table."},
                {"title": "Cuisine", "body": "Local favorites and signature mains from chambo to goat dishes, with curated snacks and beverages."},
                {"title": "Service", "body": "Fast reservations, smooth checkout, and attentive hosting for both casual and formal dining moments."},
            ],
        },
        "about_page": {
            "hero": {
                "eyebrow": "Our Story",
                "title_html": "A calm place<br/>to <em>gather</em><br/>&amp; eat well.",
                "description": "CalmTable was born from a simple conviction — that food tastes better when served without rush, noise, or pressure. We are a peace-first dining concept rooted in Pan-African cuisine, built for every kind of guest, in every kind of city.",
                "quote": "\"A calm, welcoming table where people gather to enjoy well-prepared food, meaningful conversation, and unhurried moments.\"",
                "visual_text": "Pan-African Dining",
                "stats": [
                    {"value": "4+", "label": "African Regions"},
                    {"value": "∞", "label": "Calm Moments"},
                    {"value": "1", "label": "Shared Table"},
                ],
            },
            "vision_mission": [
                {
                    "icon": "◎",
                    "title": "Our Vision",
                    "body": "To establish CalmTable as a recognised calm dining brand — known for African cuisine, warm hospitality, and consistently peaceful dining environments across multiple locations, cities, and countries.",
                },
                {
                    "icon": "◈",
                    "title": "Our Mission",
                    "body": "To serve authentic African dishes from across the continent, complemented by selected international meals on request, in a calm, respectful, and professionally managed setting — wherever CalmTable operates.",
                },
            ],
            "values": [
                {
                    "title": "Calm & Comfort",
                    "body": "Peaceful, unhurried dining — always. Guests are never rushed. Our spaces are designed for lingering, reflecting, and connecting.",
                },
                {
                    "title": "Hospitality",
                    "body": "Every guest is welcomed with respect and genuine warmth — from the first greeting to the final goodbye, no exceptions.",
                },
                {
                    "title": "Quality & Consistency",
                    "body": "Reliable food and service across every CalmTable location. The same standard, no matter where in Africa or beyond you find us.",
                },
                {
                    "title": "Inclusivity",
                    "body": "Culturally neutral and globally welcoming. Our table is open to families, professionals, travellers, and communities alike.",
                },
                {
                    "title": "Sustainability",
                    "body": "Responsible sourcing, local suppliers, and operations that respect the people and environments we are part of.",
                },
            ],
            "values_quote_html": "\"Simple food.<br/>Clean ingredients.<br/>Honest cooking.\"",
            "service_flow": [
                {
                    "title": "Calm welcome",
                    "body": "Every guest is greeted warmly before anything else. No queue pressure, no rush to be seated.",
                },
                {
                    "title": "Menu guidance",
                    "body": "Optional and personalised — especially helpful for first-time guests exploring Pan-African dishes for the first time.",
                },
                {
                    "title": "Flexible ordering",
                    "body": "Special requests, dietary needs, international options — always accommodated without fuss or judgement.",
                },
                {
                    "title": "Unhurried pacing",
                    "body": "Food served neatly and on time, with no pressure to leave. Guests are always welcome to stay.",
                },
            ],
            "formats": [
                {
                    "title": "CalmTable — Flagship",
                    "body": "Full dining experience with Pan-African core menu and international specials on request.",
                },
                {
                    "title": "CalmTable Café",
                    "body": "Lighter fare and beverages — ideal for work meetings, quiet mornings, and short visits.",
                },
                {
                    "title": "CalmTable Garden",
                    "body": "Outdoor dining concept for locations with natural spaces and open-air ambience.",
                },
                {
                    "title": "CalmTable Catering",
                    "body": "Custom menus for events, NGOs, corporate groups, and special gatherings of any size.",
                },
                {
                    "title": "CalmTable Express",
                    "body": "Limited-menu format for transit hubs, university canteens, and travel corridors.",
                },
            ],
            "community": {
                "title": "Community & Responsibility",
                "description": "CalmTable integrates responsibly into every community it enters — not as a brand imposing itself, but as a neighbour contributing genuine value.",
                "cards": [
                    {
                        "icon": "◉",
                        "title": "Local Sourcing",
                        "body": "We give preference to local suppliers and farmers — building supply chains that support the communities we serve in, with fair procurement practices throughout.",
                    },
                    {
                        "icon": "◎",
                        "title": "Employment & Training",
                        "body": "We hire locally and invest in staff development. CalmTable is a training ground for cooks, servers, and future hospitality professionals.",
                    },
                    {
                        "icon": "◈",
                        "title": "Waste Reduction",
                        "body": "Food-waste reduction and responsible operations are long-term commitments — from portion control to composting programmes in mature locations.",
                    },
                    {
                        "icon": "○",
                        "title": "Cultural Respect",
                        "body": "We carry deep respect for regional food cultures. CalmTable is values-based and carries no ideological positioning — quality and responsibility only.",
                    },
                    {
                        "icon": "◇",
                        "title": "Inclusive Access",
                        "body": "Discount days for students, quiet mornings for seniors, and family-friendly pricing — making calm dining accessible beyond a privileged few.",
                    },
                ],
                "motto_html": "No ideological positioning —<br/><span>quality and responsibility only.</span>",
                "pills": [
                    "Student discounts",
                    "Quiet mornings for seniors",
                    "Local farmer partnerships",
                    "Faith-neutral values",
                    "Composting (long-term)",
                    "Local employment first",
                    "Fair procurement",
                    "Food-waste reduction",
                ],
            },
            "team": {
                "title": "Our Team",
                "description": "A calm brand starts with calm people. Our team shares one philosophy — every guest deserves genuine care, not performative service.",
            },
            "gallery": {
                "title": "Gallery",
                "description": "The spaces, the food, and the atmosphere that define every CalmTable experience.",
            },
            "cta": {
                "title": "Come to the table.",
                "description": "Find your nearest CalmTable location and reserve your seat.",
                "button": "Make a Reservation",
            },
        },
        "members": {
            "description": "Create an account and unlock premium dining perks designed for regular guests and families.",
            "benefits": [
                {"title": "Priority Reservations", "description": "Members get early access to peak evening slots and seasonal tasting nights before public release."},
                {"title": "Member-only Offers", "description": "Receive curated discounts on signature dishes, family platters, and selected beverages every month."},
                {"title": "Birthday Rewards", "description": "Celebrate with a complimentary dessert pairing and a personalized table setup for your birthday booking."},
                {"title": "Faster Checkout", "description": "Saved account details and order history help members reorder favorites and complete checkout in seconds."},
            ],
        },
    }


def deep_merge_dict(base: dict, override: dict) -> dict:
    """Recursively merge override payload into base payload."""
    merged = deepcopy(base)
    for key, value in (override or {}).items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = deep_merge_dict(merged[key], value)
        else:
            merged[key] = value
    return merged


class MenuItem(models.Model):
    """A dish or drink available on the restaurant menu."""

    class Region(models.TextChoices):
        """Supported menu item regions."""

        SOUTHERN = "southern", "Southern Africa"
        EASTERN = "east", "East Africa"
        WESTERN = "west", "West Africa"
        CENTRAL = "central", "Central Africa"
        INTERNATIONAL = "international", "International"

    class Category(models.TextChoices):
        """Supported menu item categories."""

        STARTERS = "starters", "Starters"
        MAINS = "mains", "Mains"
        DESSERTS = "desserts", "Desserts"
        DRINKS = "drinks", "Drinks"

    name = models.CharField(max_length=120)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    region = models.CharField(max_length=20, choices=Region.choices, default=Region.SOUTHERN)
    category = models.CharField(max_length=20, choices=Category.choices)
    image_url = models.URLField(blank=True)
    image_file = models.ImageField(upload_to="menu_items/", blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    dietary_tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name",)
        indexes = [
            models.Index(fields=["is_available", "category"]),
            models.Index(fields=["region", "category"]),
            models.Index(fields=["is_featured", "is_available"]),
        ]

    def __str__(self) -> str:
        return self.name

    @property
    def preferred_image_url(self) -> str:
        """Return uploaded image URL first, with URL-field fallback."""
        if self.image_file:
            return self.image_file.url
        return self.image_url


class UserProfile(models.Model):
    """Extended profile metadata for customer and staff users."""

    class Role(models.TextChoices):
        MANAGER = "manager", "Manager"
        CHEF = "chef", "Chef"
        WAITER = "waiter", "Waiter / Waitress"
        CASHIER = "cashier", "Cashier"
        CLEANER = "cleaner", "Cleaning Staff"
        SECURITY = "security", "Security"
        DELIVERY = "delivery", "Delivery"
        OTHER = "other", "Other"
        CUSTOMER = "customer", "Customer"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    phone = models.CharField(max_length=30, blank=True)
    profile_image = models.ImageField(upload_to="profiles/", blank=True, null=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    must_change_password = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("user_id",)

    def __str__(self) -> str:
        return f"Profile<{self.user_id}>"


class FrontendSettings(models.Model):
    """Singleton JSON payload for editable frontend copy and media settings."""

    key = models.CharField(max_length=24, unique=True, default="default", editable=False)
    content = models.JSONField(default=default_frontend_content, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Homepage Settings"
        verbose_name_plural = "Homepage Settings"

    def __str__(self) -> str:
        return "Homepage Settings"

    @classmethod
    def get_solo(cls):
        """Return singleton frontend settings row, creating defaults if missing."""
        obj, _ = cls.objects.get_or_create(
            key="default",
            defaults={"content": default_frontend_content()},
        )
        return obj

    def resolved_content(self) -> dict:
        """Return content merged with defaults to keep older payloads compatible."""
        return deep_merge_dict(default_frontend_content(), self.content or {})


class GalleryImage(models.Model):
    """Gallery image with description for the About Us section."""

    about_us = models.ForeignKey(
        "AboutUs",
        on_delete=models.CASCADE,
        related_name="gallery_images",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=120, blank=True, help_text="Image title shown on hover")
    image = models.ImageField(upload_to="gallery/", help_text="Upload gallery image")
    description = models.CharField(max_length=255, blank=True, help_text="Description shown on hover")
    order = models.PositiveSmallIntegerField(default=0, help_text="Display order (0-5, max 6 images)")
    is_active = models.BooleanField(default=True, help_text="Show this image in gallery")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Gallery Image"
        verbose_name_plural = "Gallery Images"

    def __str__(self) -> str:
        return f"Gallery Image {self.order}: {self.description[:30] if self.description else 'No description'}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.order < 0 or self.order > 5:
            raise ValidationError({"order": "Order must be between 0 and 5 (max 6 images)"})

    def save(self, *args, **kwargs):
        if not self.about_us_id:
            self.about_us = AboutUs.get_solo()
        self.clean()
        super().save(*args, **kwargs)


class AboutUs(models.Model):
    """About Us section content management."""

    about_image = models.ImageField(upload_to="about/", blank=True, null=True)
    title = models.CharField(max_length=255, default="Where Every Meal Is A Celebration")
    subtitle = models.CharField(max_length=100, default="Our Heritage", help_text="Small eyebrow text")
    description = models.TextField(help_text="Main description text")
    quote = models.TextField(help_text="Featured quote")
    vision_title = models.CharField(max_length=100, default="Vision")
    vision_body = models.TextField(help_text="Vision card content")
    cuisine_title = models.CharField(max_length=100, default="Mission")
    cuisine_body = models.TextField(help_text="Mission card content")
    service_title = models.CharField(max_length=100, default="Service")
    service_body = models.TextField(help_text="Service card content")
    years_serving = models.CharField(max_length=20, default="12+", help_text="Years serving stat")
    menu_items = models.CharField(max_length=20, default="80+", help_text="Menu items stat")
    rating = models.CharField(max_length=20, default="4.9★", help_text="Rating stat")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "About Us"
        verbose_name_plural = "About Us"

    def __str__(self) -> str:
        return "About Us Section"

    @classmethod
    def get_solo(cls):
        """Return singleton About Us, creating defaults if missing."""
        obj, _ = cls.objects.get_or_create(
            id=1,
            defaults={
                "title": "Where Every Meal Is A Celebration",
                "subtitle": "Our Heritage",
                "description": "Near Simso Filling Station in Luwinga, we serve premium dishes in a warm family-restaurant setting.",
                "quote": "Good food is the foundation of genuine happiness - we serve both.",
                "vision_title": "Vision",
                "vision_body": "Build a modern Malawian dining brand where consistency, comfort, and quality define every table.",
                "cuisine_title": "Mission",
                "cuisine_body": "Serve calm, honest Pan-African dining with warm hospitality, consistent standards, and an experience guests can trust every day.",
                "service_title": "Service",
                "service_body": "Fast reservations, smooth checkout, and attentive hosting for both casual and formal dining moments.",
                "years_serving": "12+",
                "menu_items": "80+",
                "rating": "4.9★",
            }
        )
        return obj


class AboutService(models.Model):
    """Service cards displayed on the About Us page."""

    about_us = models.ForeignKey(
        AboutUs,
        on_delete=models.CASCADE,
        related_name="services",
    )
    title = models.CharField(max_length=120)
    description = models.TextField()
    order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "About Service"
        verbose_name_plural = "About Services"

    def __str__(self) -> str:
        return self.title


class Table(models.Model):
    """A physical dining table that can be reserved."""

    table_number = models.CharField(max_length=10, unique=True, db_index=True)
    capacity = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(20)])
    description = models.CharField(max_length=100, blank=True, help_text="e.g., 'Window Seat', 'Quiet Corner', 'VIP'")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["table_number"]

    def __str__(self) -> str:
        return f"Table {self.table_number} (Seats {self.capacity})"

    def is_available_for_slot(self, date, time_slot, duration_hours):
        """
        Check if table is available for a given date, start time, and duration.
        Returns True if no conflicts exist; False if overlapping reservation found.
        """
        from datetime import datetime, timedelta
        
        if not self.is_active:
            return False

        # Convert time_slot to datetime for calculation
        start_dt = datetime.combine(date, time_slot)
        end_dt = start_dt + timedelta(hours=duration_hours)

        # Query for conflicting reservations
        active_statuses = [Reservation.Status.PENDING, Reservation.Status.CONFIRMED]
        conflicting = Reservation.objects.filter(
            table=self,
            date=date,
            status__in=active_statuses,
        )

        for res in conflicting:
            res_start_dt = datetime.combine(res.date, res.time_slot)
            res_end_dt = res_start_dt + timedelta(hours=res.party_duration_hours)

            # Check for time overlap
            if start_dt < res_end_dt and end_dt > res_start_dt:
                return False

        return True


class Reservation(models.Model):
    """A reservation request for a specific date and time slot."""

    class Status(models.TextChoices):
        """Supported lifecycle states for reservations."""

        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reservations",
    )
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    date = models.DateField()
    time_slot = models.TimeField()
    party_size = models.PositiveSmallIntegerField()
    table = models.ForeignKey(
        Table,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reservations",
    )
    party_duration_hours = models.PositiveSmallIntegerField(default=2, validators=[MinValueValidator(1), MaxValueValidator(8)])
    special_requests = models.TextField(blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    confirmation_code = models.CharField(max_length=8, unique=True, db_index=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["date", "time_slot", "status"]),
            models.Index(fields=["user", "date"]),
        ]

    def __str__(self) -> str:
        return f"{self.confirmation_code} - {self.name}"

    @staticmethod
    def user_has_completed_reservation(user) -> bool:
        """Return whether a user has at least one past confirmed reservation."""
        if not user or not user.is_authenticated:
            return False

        now_local = timezone.localtime(timezone.now())
        base_filter = Q(status=Reservation.Status.CONFIRMED) & (
            Q(date__lt=now_local.date())
            | Q(date=now_local.date(), time_slot__lt=now_local.time().replace(second=0, microsecond=0))
        )

        user_filter = Q(user=user)
        if user.email:
            user_filter |= Q(email__iexact=user.email)

        return Reservation.objects.filter(base_filter & user_filter).exists()

    def clean(self) -> None:
        now_local = timezone.localtime(timezone.now())
        original_date = None
        original_time_slot = None
        if self.pk:
            original = Reservation.objects.filter(pk=self.pk).values("date", "time_slot").first()
            if original:
                original_date = original["date"]
                original_time_slot = original["time_slot"]

        schedule_changed = (
            self.pk is None
            or original_date != self.date
            or original_time_slot != self.time_slot
        )

        if self.party_size < 1 or self.party_size > 20:
            raise ValidationError({"party_size": "Party size must be between 1 and 20."})

        # Validate table assignment
        if not self.table:
            raise ValidationError({"table": "A table must be selected for this reservation."})

        if self.party_size > self.table.capacity:
            raise ValidationError(
                {"party_size": f"Party size ({self.party_size}) exceeds table capacity ({self.table.capacity})."}
            )

        if schedule_changed:
            if self.date < now_local.date():
                raise ValidationError({"date": "Reservations cannot be made for past dates."})

            if self.date == now_local.date() and self.time_slot <= now_local.time().replace(second=0, microsecond=0):
                raise ValidationError({"time_slot": "Reservations cannot be made for past time slots."})

            # Validate time is within open hours
            open_hour = getattr(settings, 'RESERVATION_OPEN_HOUR', 17)
            close_hour = getattr(settings, 'RESERVATION_CLOSE_HOUR', 21)
            if self.time_slot.hour < open_hour or self.time_slot.hour >= close_hour:
                raise ValidationError(
                    {"time_slot": f"Reservations are only available between {open_hour}:00 and {close_hour}:00."}
                )

            # Check if selected table is available for the requested time slot and duration
            if self.table and not self.table.is_available_for_slot(self.date, self.time_slot, self.party_duration_hours):
                raise ValidationError(
                    {"table": f"Table {self.table.table_number} is not available for the selected date and time. Please choose another table or time slot."}
                )

        active_statuses = [self.Status.PENDING, self.Status.CONFIRMED]
        if self.status in active_statuses:
            existing = Reservation.objects.filter(
                date=self.date,
                time_slot=self.time_slot,
                status__in=active_statuses,
            )
            if self.pk:
                existing = existing.exclude(pk=self.pk)

            if existing.count() >= settings.MAX_RESERVATIONS_PER_SLOT:
                raise ValidationError(
                    {"time_slot": "This time slot is fully booked. Please choose another slot."}
                )

    @staticmethod
    def generate_confirmation_code(length: int = 8) -> str:
        """Generate a random uppercase alphanumeric confirmation code."""
        alphabet = string.ascii_uppercase + string.digits
        return "".join(secrets.choice(alphabet) for _ in range(length))

    def save(self, *args, **kwargs):
        if not self.confirmation_code:
            while True:
                candidate = self.generate_confirmation_code()
                if not Reservation.objects.filter(confirmation_code=candidate).exists():
                    self.confirmation_code = candidate
                    break

        self.full_clean()
        return super().save(*args, **kwargs)


class Review(models.Model):
    """A user-submitted rating and comment for a menu item."""

    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(fields=["menu_item", "user"], name="unique_review_per_user_per_item")
        ]

    def __str__(self) -> str:
        return f"Review<{self.menu_item_id}:{self.user_id}>"


class Order(models.Model):
    """A customer order and Stripe payment tracking record."""

    class Status(models.TextChoices):
        """Supported lifecycle states for customer orders."""

        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        ASSIGNED = "assigned", "Assigned to Chef"
        PREPARING = "preparing", "Preparing"
        READY = "ready", "Ready"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    order_number = models.CharField(max_length=20, unique=True, editable=False, blank=True, null=True)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )
    customer_name = models.CharField(max_length=120, blank=True)
    customer_email = models.EmailField(blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    notes = models.TextField(blank=True)
    stripe_payment_intent_id = models.CharField(max_length=120, blank=True)  # legacy optional payment id
    assigned_chef = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_orders",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["customer", "status", "created_at"]),
            models.Index(fields=["order_number"]),
        ]

    def __str__(self) -> str:
        customer_label = self.customer_name or "Guest"
        return f"Order {self.order_number or self.pk} — {customer_label}"

    @property
    def user(self):
        """Backwards-compatible alias for previous field naming."""
        return self.customer

    @property
    def email(self) -> str:
        """Backwards-compatible alias for previous field naming."""
        return self.customer_email

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"CC-{uuid.uuid4().hex[:8].upper()}"
        if self.customer:
            full_name = f"{self.customer.first_name} {self.customer.last_name}".strip()
            if not self.customer_name:
                self.customer_name = full_name or self.customer.get_username() or self.customer.email or "Guest"
            if not self.customer_email:
                self.customer_email = self.customer.email or ""
        super().save(*args, **kwargs)


class AdminNotification(models.Model):
    """Staff notification payload for operational events like new orders."""

    class Type(models.TextChoices):
        NEW_ORDER = "new_order", "New Order"
        STATUS_UPDATE = "status_update", "Status Update"
        RESERVATION = "reservation", "New Reservation"
        AUDIT = "audit", "Audit"
        GENERAL = "general", "General"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="admin_notifications",
    )
    reservation = models.ForeignKey(
        "Reservation",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="admin_notifications",
    )
    title = models.CharField(max_length=160)
    message = models.TextField()
    link_url = models.URLField(max_length=400, blank=True, null=True)
    notif_type = models.CharField(max_length=30, choices=Type.choices, default=Type.GENERAL)
    payload = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["recipient", "is_read", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"AdminNotification<{self.id}:{self.recipient_id}>"


class OrderItem(models.Model):
    """A single purchasable item attached to an order."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.PROTECT,
        related_name="order_items",
        null=True,
        blank=True,
    )
    item_name = models.CharField(max_length=200, blank=True)
    item_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        ordering = ("id",)

    def __str__(self) -> str:
        return f"{self.quantity}x {self.item_name or self.menu_item_id}"

    def clean(self) -> None:
        if self.quantity < 1:
            raise ValidationError({"quantity": "Quantity must be at least 1."})

    def save(self, *args, **kwargs):
        if not self.item_name and self.menu_item_id:
            self.item_name = self.menu_item.name
        if self.item_price <= 0 and self.unit_price > 0:
            self.item_price = self.unit_price
        if self.unit_price <= 0 and self.item_price > 0:
            self.unit_price = self.item_price

        computed_total = Decimal(self.quantity) * self.unit_price
        self.line_total = computed_total
        self.subtotal = computed_total
        self.full_clean()
        return super().save(*args, **kwargs)


class StaffMember(models.Model):
    """Admin-managed staff profile cards for the public members page."""

    about_us = models.ForeignKey(
        "AboutUs",
        on_delete=models.CASCADE,
        related_name="team_members",
        null=True,
        blank=True,
    )
    class Role(models.TextChoices):
        CHEF = "chef", "Chef"
        WAITER = "waiter", "Waiter / Waitress"
        CASHIER = "cashier", "Cashier"
        MANAGER = "manager", "Manager"
        CLEANER = "cleaner", "Cleaning Staff"
        SECURITY = "security", "Security"
        DELIVERY = "delivery", "Delivery"
        OTHER = "other", "Other"

    full_name = models.CharField(max_length=150)
    role = models.CharField(max_length=30, choices=Role.choices)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    photo = models.ImageField(upload_to="staff/", blank=True, null=True)
    bio = models.TextField(blank=True)
    hire_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    display_on_website = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("role", "full_name")

    def __str__(self) -> str:
        return f"{self.full_name} ({self.get_role_display()})"

    def save(self, *args, **kwargs):
        if not self.about_us_id:
            self.about_us = AboutUs.get_solo()
        return super().save(*args, **kwargs)
