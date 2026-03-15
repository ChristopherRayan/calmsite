from pathlib import Path

from django.core.files import File
from django.db import migrations


def seed_gallery_images(apps, schema_editor):
    AboutUs = apps.get_model("api", "AboutUs")
    GalleryImage = apps.get_model("api", "GalleryImage")

    about_us, _ = AboutUs.objects.get_or_create(id=1)
    if GalleryImage.objects.filter(about_us=about_us).exists():
        return

    base_dir = Path(__file__).resolve().parents[2]
    seed_dir = base_dir / "seed_gallery"
    if not seed_dir.exists():
        return

    items = [
        ("gallery-01-family-dinner.jpg", "Family Table", "Shared dining moments with loved ones.", 0),
        ("gallery-02-family-table.jpg", "Evening Gathering", "A warm modern African dining experience.", 1),
        ("gallery-03-girl-dining.jpg", "Celebration Seat", "Joyful guests savoring signature dishes.", 2),
        ("gallery-04-man-dining.jpg", "Guest Spotlight", "Premium hospitality with every plate.", 3),
        ("gallery-05-family-smiles.jpg", "Heritage Feast", "Community, culture, and cuisine together.", 4),
        ("gallery-06-holiday-table.jpg", "Festive Service", "Special occasions crafted with care.", 5),
    ]

    for filename, title, description, order in items:
        image_path = seed_dir / filename
        if not image_path.exists():
            continue

        with image_path.open("rb") as fh:
            image_file = File(fh, name=f"gallery/{filename}")
            record = GalleryImage(
                about_us=about_us,
                title=title,
                description=description,
                order=order,
                is_active=True,
            )
            record.image.save(filename, image_file, save=False)
            record.save()


def unseed_gallery_images(apps, schema_editor):
    AboutUs = apps.get_model("api", "AboutUs")
    GalleryImage = apps.get_model("api", "GalleryImage")
    about_us, _ = AboutUs.objects.get_or_create(id=1)
    GalleryImage.objects.filter(about_us=about_us).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0019_menu_item_images"),
    ]

    operations = [
        migrations.RunPython(seed_gallery_images, unseed_gallery_images),
    ]
