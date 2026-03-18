"""Management command to seed Malawian restaurant staff team members."""
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand
from api.models import AboutUs, StaffMember


STAFF = [
    {
        "full_name": "Grace Chisomo Phiri",
        "role": StaffMember.Role.MANAGER,
        "bio": (
            "Grace has managed The CalmTable for over eight years, ensuring every guest "
            "leaves with a smile. Her warm leadership and deep knowledge of Malawian hospitality "
            "set the tone for the entire team."
        ),
        "display_on_website": True,
    },
    {
        "full_name": "Emmanuel Kondwani Mwale",
        "role": StaffMember.Role.CHEF,
        "bio": (
            "Chef Emmanuel trained in Lilongwe and brings fifteen years of culinary mastery to "
            "our kitchen. He is the creative force behind our signature chambo and heritage dishes."
        ),
        "display_on_website": True,
    },
    {
        "full_name": "Alinafe Temwa Banda",
        "role": StaffMember.Role.CHEF,
        "bio": (
            "Specialising in traditional Malawian street-food turned fine dining, Chef Alinafe "
            "crafts our starters and desserts with passion and innovation."
        ),
        "display_on_website": True,
    },
    {
        "full_name": "Takondwa Simeon Nkhata",
        "role": StaffMember.Role.WAITER,
        "bio": (
            "Takondwa is beloved by our regulars for his attentive, cheerful service and deep "
            "knowledge of our menu. He has been part of the CalmTable family for five years."
        ),
        "display_on_website": True,
    },
    {
        "full_name": "Madalitso Liya Kumwenda",
        "role": StaffMember.Role.WAITER,
        "bio": (
            "With a natural flair for hospitality, Madalitso ensures guests feel welcomed and "
            "comfortable from the moment they walk in to the moment they leave."
        ),
        "display_on_website": True,
    },
    {
        "full_name": "Yankho Precious Mvula",
        "role": StaffMember.Role.CASHIER,
        "bio": (
            "Yankho manages all customer payments with efficiency and a warm smile, making "
            "the checkout experience as pleasant as the meal itself."
        ),
        "display_on_website": True,
    },
]

STAFF_PHOTOS = {
    "Grace Chisomo Phiri": "gallery-05-family-smiles.jpg",
    "Emmanuel Kondwani Mwale": "gallery-04-man-dining.jpg",
    "Alinafe Temwa Banda": "gallery-03-girl-dining.jpg",
    "Takondwa Simeon Nkhata": "gallery-02-family-table.jpg",
    "Madalitso Liya Kumwenda": "gallery-01-family-dinner.jpg",
    "Yankho Precious Mvula": "gallery-06-holiday-table.jpg",
}


class Command(BaseCommand):
    help = "Seed the database with CalmTable staff team members."

    def handle(self, *args, **kwargs):
        about = AboutUs.get_solo()
        seed_dir = Path(__file__).resolve().parents[3] / "seed_gallery"
        created = 0
        skipped = 0
        for member_data in STAFF:
            obj, was_created = StaffMember.objects.get_or_create(
                full_name=member_data["full_name"],
                defaults={
                    "about_us": about,
                    "role": member_data["role"],
                    "bio": member_data["bio"],
                    "is_active": True,
                    "display_on_website": member_data["display_on_website"],
                },
            )
            if was_created:
                created += 1
            else:
                skipped += 1
                update_fields = []
                if not obj.about_us_id:
                    obj.about_us = about
                    update_fields.append("about_us")
                if not obj.display_on_website:
                    obj.display_on_website = True
                    update_fields.append("display_on_website")
                if not obj.is_active:
                    obj.is_active = True
                    update_fields.append("is_active")
                if update_fields:
                    obj.save(update_fields=update_fields)

            photo_name = STAFF_PHOTOS.get(obj.full_name)
            photo_path = seed_dir / photo_name if photo_name else None
            if photo_path and photo_path.exists():
                with photo_path.open("rb") as fh:
                    obj.photo.save(photo_name, File(fh), save=True)

        self.stdout.write(
            self.style.SUCCESS(
                f"Staff seed complete: {created} created, {skipped} already existed."
            )
        )
