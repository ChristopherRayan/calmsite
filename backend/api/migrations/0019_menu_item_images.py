from urllib.parse import quote

from django.db import migrations


def seed_menu_item_images(apps, schema_editor):
    MenuItem = apps.get_model("api", "MenuItem")

    name_to_file = {
        # Starch Meals (Mains)
        "Eggs (2)": "EGGS.jpg",
        "Beef Stew/Fried/Boiled": "hq720.jpg",
        "Goat Stew/Fried/Boiled": "GOAT STEW.jpg",
        "Local Chicken Stew/Fried/Boiled": "Local Chicken.jpg",
        "Hybrid Fried Chicken Piece": "Hybrid Fried Chicken Piece.webp",
        "Hybrid Braii 1/4 Chicken": "Hybrid Brail.jpg",
        "Fried Open Chambo (Medium)": "Fried Open Chambo.jpg",
        "Fried Open Chambo (Large)": "Fried Open Chambo.jpg",
        "Smoked Butterfish (Medium)": "Smoked Butterfish.jpg",
        "Smoked Butterfish (Large)": "Smoked Butterfish.jpg",
        "Goat Soup": "Goat Soup.jpg",
        "Goat Khwasukhwasu": "Goat Khwasukhwasu.webp",
        # Served with Nsima or Rice (Mains)
        "Beans": "rice beans.jpg",
        "Masamba Otendera": "nsima vegetables.png",
        "Special Veggies": "nsima exotic veg.jpg",
        # Extras (Starters)
        "Beef Relish (Extra)": "hq720.jpg",
        "Goat Relish (Extra)": "GOAT STEW.jpg",
        "Chicken Relish (Hybrid)": "Hybrid Fried Chicken Piece.webp",
        "Chicken Relish (Local)": "Local Chicken.jpg",
        "Extra Eggs": "EGGS.jpg",
        "Nsima (Piece)": "nsima.jpg",
        "Rice (Side)": "rice.jpg",
        "Chips (Side)": "chips.jpg",
        "Boiled Irish (Side)": "boiled irish.jpg",
        # Snacks (Starters)
        "Plain Chapati": "Plain Chapati.jpg",
        "Chapati with Egg (1)": "Chapati with Eggs.jpg",
        "Chapati with Eggs (2)": "Chapati with Eggs.jpg",
        "Chapati with Beef/Chicken Stirfry": "Chapati with Beef Stirfry.webp",
        "Chicken Wrap": "Chicken Wrap.jpg",
        "Samoosa": "Samoosa.jpg",
        "Doughnuts": "Doughnuts.jpg",
        # Beverages (Drinks)
        "Soft Drink (Glass)": "Soft Drinks glass.jpg",
        "Soft Drink (Plastic)": "Soft Drinks plastic.avif",
        "Water": "water drink.jpg",
        "Hot Drinks (Tea/Coffee/Chocolate)": "Hot Beverages (Coffee).jpg",
        "Milk": "milk.jpg",
        "Extra Milk": "milk.jpg",
        # Desserts
        "Ice-Cream (Cone)": "Ice-cream (Cone ).webp",
        "Ice-Cream (Cup)": "Ice-cream (Cup).jpg",
    }

    for name, filename in name_to_file.items():
        try:
            item = MenuItem.objects.get(name=name)
        except MenuItem.DoesNotExist:
            continue

        if not filename:
            continue

        if item.image_url:
            continue

        item.image_url = f"/menu/{quote(filename)}"
        item.save(update_fields=["image_url"])


def unseed_menu_item_images(apps, schema_editor):
    MenuItem = apps.get_model("api", "MenuItem")
    for item in MenuItem.objects.all():
        if item.image_url and item.image_url.startswith("/menu/"):
            item.image_url = ""
            item.save(update_fields=["image_url"])


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0018_seed_menu_items"),
    ]

    operations = [
        migrations.RunPython(seed_menu_item_images, unseed_menu_item_images),
    ]
