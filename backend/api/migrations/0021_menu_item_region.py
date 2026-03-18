"""Add region field to menu items."""
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0020_seed_gallery_images"),
    ]

    operations = [
        migrations.AddField(
            model_name="menuitem",
            name="region",
            field=models.CharField(
                choices=[
                    ("southern", "Southern Africa"),
                    ("east", "East Africa"),
                    ("west", "West Africa"),
                    ("central", "Central Africa"),
                    ("beverages", "Beverages"),
                    ("international", "International"),
                ],
                default="southern",
                max_length=20,
            ),
        ),
        migrations.AddIndex(
            model_name="menuitem",
            index=models.Index(fields=["region", "category"], name="api_menuite_region_7f7c9c_idx"),
        ),
    ]
