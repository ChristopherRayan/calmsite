from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import AboutService, AboutUs, FrontendSettings, GalleryImage, StaffMember


GALLERY_ITEMS = [
    ("gallery-01-family-dinner.jpg", "Family Table", "Shared dining moments with loved ones.", 0),
    ("gallery-02-family-table.jpg", "Evening Gathering", "A warm modern African dining experience.", 1),
    ("gallery-03-girl-dining.jpg", "Celebration Seat", "Joyful guests savoring signature dishes.", 2),
    ("gallery-04-man-dining.jpg", "Guest Spotlight", "Premium hospitality with every plate.", 3),
    ("gallery-05-family-smiles.jpg", "Heritage Feast", "Community, culture, and cuisine together.", 4),
    ("gallery-06-holiday-table.jpg", "Festive Service", "Special occasions crafted with care.", 5),
]

TEAM_PHOTOS = {
    "Nala Banda": "gallery-03-girl-dining.jpg",
    "Peter Gondwe": "gallery-04-man-dining.jpg",
    "Thoko Tembo": "gallery-05-family-smiles.jpg",
    "Lameck Mbewe": "gallery-02-family-table.jpg",
}


class Command(BaseCommand):
    help = "Seed About Us page content (AboutUs, services, team, testimonials)."

    def handle(self, *args, **options):
        with transaction.atomic():
            about = AboutUs.get_solo()
            seed_dir = Path(__file__).resolve().parents[3] / "seed_gallery"

            defaults = {
                "title": "Where Every Meal Feels Like Home",
                "subtitle": "Our Heritage",
                "description": (
                    "Set in Luwinga near Simso Filling Station, The CalmTable serves modern Malawian cuisine "
                    "with polished hospitality. Our kitchen honors local flavors while elevating every plate."
                ),
                "quote": "Good food is the foundation of genuine happiness — we serve both.",
                "vision_title": "Vision",
                "vision_body": (
                    "Build a modern African dining brand where consistency, warmth, and quality define every table."
                ),
                "cuisine_title": "Mission",
                "cuisine_body": (
                    "Serve thoughtful Pan-African meals with polished hospitality in calm spaces where guests feel genuinely welcome."
                ),
                "service_title": "Service",
                "service_body": (
                    "Attentive hosting, smooth reservations, and thoughtful details from the first welcome."
                ),
                "years_serving": "12+",
                "menu_items": "80+",
                "rating": "4.9★",
            }

            updated = False
            for field, value in defaults.items():
                if not getattr(about, field, ""):
                    setattr(about, field, value)
                    updated = True
            if updated:
                about.save()

            if not about.about_image:
                hero_path = seed_dir / "gallery-01-family-dinner.jpg"
                if hero_path.exists():
                    with hero_path.open("rb") as fh:
                        about.about_image.save("about-hero.jpg", File(fh), save=True)

            for filename, title, description, order in GALLERY_ITEMS:
                image_path = seed_dir / filename
                if not image_path.exists():
                    continue
                gallery_image, _ = GalleryImage.objects.get_or_create(
                    about_us=about,
                    order=order,
                    defaults={
                        "title": title,
                        "description": description,
                        "is_active": True,
                    },
                )
                fields_to_update = []
                if gallery_image.title != title:
                    gallery_image.title = title
                    fields_to_update.append("title")
                if gallery_image.description != description:
                    gallery_image.description = description
                    fields_to_update.append("description")
                if not gallery_image.is_active:
                    gallery_image.is_active = True
                    fields_to_update.append("is_active")
                if fields_to_update:
                    gallery_image.save(update_fields=fields_to_update)
                with image_path.open("rb") as fh:
                    gallery_image.image.save(filename, File(fh), save=True)

            service_payload = [
                ("Fine Dining", "Seasonal menus with signature Malawian dishes and elevated plating.", 0),
                ("Private Events", "Elegant rooms for celebrations, corporate dinners, and intimate gatherings.", 1),
                ("Crafted Drinks", "Curated cocktails, teas, and coffee pairings to complete every course.", 2),
            ]

            if not AboutService.objects.filter(about_us=about).exists():
                AboutService.objects.bulk_create(
                    [
                        AboutService(
                            about_us=about,
                            title=title,
                            description=description,
                            order=order,
                            is_active=True,
                        )
                        for title, description, order in service_payload
                    ]
                )

            team_payload = [
                ("Nala Banda", StaffMember.Role.CHEF, "Executive Chef", "Leads our Malawian-inspired menu."),
                ("Peter Gondwe", StaffMember.Role.MANAGER, "Restaurant Manager", "Curates every guest experience."),
                ("Thoko Tembo", StaffMember.Role.CASHIER, "Guest Relations", "Ensures seamless service and care."),
                ("Lameck Mbewe", StaffMember.Role.WAITER, "Service Lead", "Coordinates the floor with precision."),
            ]

            for name, role, _title, bio in team_payload:
                member, _ = StaffMember.objects.get_or_create(
                    about_us=about,
                    full_name=name,
                    defaults={
                        "role": role,
                        "bio": bio,
                        "is_active": True,
                        "display_on_website": True,
                    },
                )
                fields_to_update = []
                if member.role != role:
                    member.role = role
                    fields_to_update.append("role")
                if member.bio != bio:
                    member.bio = bio
                    fields_to_update.append("bio")
                if not member.is_active:
                    member.is_active = True
                    fields_to_update.append("is_active")
                if not member.display_on_website:
                    member.display_on_website = True
                    fields_to_update.append("display_on_website")
                if fields_to_update:
                    member.save(update_fields=fields_to_update)

                photo_name = TEAM_PHOTOS.get(name)
                photo_path = seed_dir / photo_name if photo_name else None
                if photo_path and photo_path.exists():
                    with photo_path.open("rb") as fh:
                        member.photo.save(photo_name, File(fh), save=True)

            settings = FrontendSettings.get_solo()
            content = settings.resolved_content()
            home = content.get("home", {})
            testimonials = home.get("testimonials", [])
            if not testimonials:
                home["testimonials"] = [
                    {
                        "quote": "Every dish feels intentional. CalmTable made our family night unforgettable.",
                        "author": "Amara Nkhoma",
                    },
                    {
                        "quote": "The service was polished and warm. We felt truly hosted.",
                        "author": "Chisomo Banda",
                    },
                    {
                        "quote": "Fresh flavors, beautiful plating, and a calm atmosphere in the heart of Mzuzu.",
                        "author": "Takondwa Mwale",
                    },
                ]
                content["home"] = home
            if not content.get("about_page"):
                content["about_page"] = settings.resolved_content().get("about_page", {})
            if not content.get("home_page"):
                content["home_page"] = settings.resolved_content().get("home_page", {})
            settings.content = content
            settings.save()

        self.stdout.write(self.style.SUCCESS("Seeded About Us page content."))
