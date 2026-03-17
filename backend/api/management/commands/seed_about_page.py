from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import AboutService, AboutUs, FrontendSettings, StaffMember


class Command(BaseCommand):
    help = "Seed About Us page content (AboutUs, services, team, testimonials)."

    def handle(self, *args, **options):
        with transaction.atomic():
            about = AboutUs.get_solo()

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
                "cuisine_title": "Cuisine",
                "cuisine_body": (
                    "Signature chambo, slow-cooked goat, handcrafted chapati, and seasonal garden sides."
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
                seed_dir = Path(__file__).resolve().parents[3] / "seed_gallery"
                hero_path = seed_dir / "gallery-01-family-dinner.jpg"
                if hero_path.exists():
                    with hero_path.open("rb") as fh:
                        about.about_image.save("about-hero.jpg", File(fh), save=True)

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

            if not StaffMember.objects.filter(about_us=about).exists():
                StaffMember.objects.bulk_create(
                    [
                        StaffMember(
                            about_us=about,
                            full_name=name,
                            role=role,
                            bio=bio,
                            is_active=True,
                            display_on_website=True,
                        )
                        for name, role, _title, bio in team_payload
                    ]
                )

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
