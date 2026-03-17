"""Remove beverages region and normalize existing rows."""
from django.db import migrations, models


def migrate_beverages_region(apps, schema_editor):
    MenuItem = apps.get_model("api", "MenuItem")
    MenuItem.objects.filter(region="beverages").update(region="southern")


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0021_menu_item_region"),
    ]

    operations = [
        migrations.RunPython(migrate_beverages_region, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="menuitem",
            name="region",
            field=models.CharField(
                choices=[
                    ("southern", "Southern Africa"),
                    ("east", "East Africa"),
                    ("west", "West Africa"),
                    ("central", "Central Africa"),
                    ("international", "International"),
                ],
                default="southern",
                max_length=20,
            ),
        ),
    ]
