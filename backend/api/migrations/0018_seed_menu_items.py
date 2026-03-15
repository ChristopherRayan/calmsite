from decimal import Decimal

from django.db import migrations


def seed_menu_items(apps, schema_editor):
    MenuItem = apps.get_model("api", "MenuItem")

    items = [
        # Starch Meals (Mains)
        ("Eggs (2)", "mains", "Two eggs prepared to your liking, served as a light yet protein-rich main.", "7000"),
        (
            "Beef Stew/Fried/Boiled",
            "mains",
            "Tender beef prepared in your choice of a rich gravy, crispy fry, or healthy boil.",
            "8000",
        ),
        (
            "Goat Stew/Fried/Boiled",
            "mains",
            "Savory local goat meat cooked until tender in stew, fried, or boiled styles.",
            "8000",
        ),
        (
            "Local Chicken Stew/Fried/Boiled",
            "mains",
            "Authentic local chicken prepared in traditional stewed or fried varieties.",
            "9000",
        ),
        (
            "Hybrid Fried Chicken Piece",
            "mains",
            "A succulent, well-seasoned piece of hybrid chicken fried to a golden crisp.",
            "8500",
        ),
        (
            "Hybrid Braii 1/4 Chicken",
            "mains",
            "A quarter portion of hybrid chicken, flame-grilled braii-style for a smoky finish.",
            "13000",
        ),
        (
            "Fried Open Chambo (Medium)",
            "mains",
            "Fresh Lake Malawi tilapia butterflied and fried until perfectly crisp.",
            "17800",
        ),
        (
            "Fried Open Chambo (Large)",
            "mains",
            "Fresh Lake Malawi tilapia butterflied and fried until perfectly crisp.",
            "25000",
        ),
        (
            "Smoked Butterfish (Medium)",
            "mains",
            "Delicate butterfish infused with deep smoky flavors for a rich, salty treat.",
            "25000",
        ),
        (
            "Smoked Butterfish (Large)",
            "mains",
            "Delicate butterfish infused with deep smoky flavors for a rich, salty treat.",
            "30000",
        ),
        (
            "Goat Soup",
            "mains",
            "A hearty, warming broth filled with tender pieces of goat meat and local spices.",
            "10000",
        ),
        (
            "Goat Khwasukhwasu",
            "mains",
            "A specialized, dry-fried goat delicacy known for its intense, concentrated flavor.",
            "10000",
        ),
        # Served with Nsima or Rice (Mains)
        (
            "Beans",
            "mains",
            "Protein-packed local beans slow-cooked in a savory, seasoned tomato base.",
            "6000",
        ),
        (
            "Masamba Otendera",
            "mains",
            "Fresh local green vegetables prepared with a smooth, rich peanut powder sauce.",
            "5500",
        ),
        (
            "Special Veggies",
            "mains",
            "A vibrant mix of seasonal garden vegetables sauteed with light seasoning.",
            "6000",
        ),
        # Extras (Starters)
        (
            "Beef Relish (Extra)",
            "starters",
            "Extra serving of slow-cooked beef relish to add to any plate.",
            "7000",
        ),
        (
            "Goat Relish (Extra)",
            "starters",
            "Extra serving of slow-cooked goat relish to add to any plate.",
            "7000",
        ),
        (
            "Chicken Relish (Hybrid)",
            "starters",
            "Add a side of fried hybrid chicken to your order.",
            "7000",
        ),
        (
            "Chicken Relish (Local)",
            "starters",
            "Add a side of flavorful local chicken to your order.",
            "10000",
        ),
        (
            "Extra Eggs",
            "starters",
            "A supplementary serving of eggs to boost the protein in your meal.",
            "7000",
        ),
        (
            "Nsima (Piece)",
            "starters",
            "A single extra portion of the traditional, fluffy maize-based staple.",
            "1000",
        ),
        (
            "Rice (Side)",
            "starters",
            "A full side order of steamed rice.",
            "6000",
        ),
        (
            "Chips (Side)",
            "starters",
            "A full side order of potato chips.",
            "6000",
        ),
        (
            "Boiled Irish (Side)",
            "starters",
            "A full side order of healthy boiled potatoes.",
            "6000",
        ),
        # Snacks (Starters)
        (
            "Plain Chapati",
            "starters",
            "Soft, flaky unleavened flatbread, perfect on its own or for dipping.",
            "2000",
        ),
        (
            "Chapati with Egg (1)",
            "starters",
            "Handmade chapati served with one egg for a filling breakfast.",
            "3000",
        ),
        (
            "Chapati with Eggs (2)",
            "starters",
            "Handmade chapati served with two eggs for a filling breakfast.",
            "3500",
        ),
        (
            "Chapati with Beef/Chicken Stirfry",
            "starters",
            "A savory wrap-style snack featuring seasoned meat sauteed with vegetables.",
            "8000",
        ),
        (
            "Chicken Wrap",
            "starters",
            "Freshly grilled chicken and crisp salad tucked into a soft, easy-to-eat wrap.",
            "10000",
        ),
        (
            "Samoosa",
            "starters",
            "Crispy, triangular pastry pockets filled with savory spiced meat or vegetables.",
            "2500",
        ),
        (
            "Doughnuts",
            "starters",
            "Soft, sweet fried dough - a classic treat to pair with your morning tea.",
            "1500",
        ),
        # Beverages (Drinks)
        (
            "Soft Drink (Glass)",
            "drinks",
            "Chilled carbonated soda served in a classic glass bottle.",
            "1500",
        ),
        (
            "Soft Drink (Plastic)",
            "drinks",
            "Chilled carbonated soda served in a convenient plastic bottle.",
            "1700",
        ),
        ("Water", "drinks", "Pure, refreshing bottled water.", "1000"),
        (
            "Hot Drinks (Tea/Coffee/Chocolate)",
            "drinks",
            "Black tea, Rooibos, Coffee, or rich Hot Chocolate. Price varies up to 4,500.",
            "2500",
        ),
        (
            "Milk",
            "drinks",
            "Fresh milk served hot or cold.",
            "3500",
        ),
        (
            "Extra Milk",
            "drinks",
            "An extra splash of milk for your tea or coffee.",
            "1000",
        ),
        # Desserts
        (
            "Ice-Cream (Cone)",
            "desserts",
            "A sweet, creamy frozen dessert served in a crunchy cone.",
            "5000",
        ),
        (
            "Ice-Cream (Cup)",
            "desserts",
            "A sweet, creamy frozen dessert served in a chilled cup.",
            "6000",
        ),
    ]

    for name, category, description, price in items:
        obj, created = MenuItem.objects.get_or_create(
            name=name,
            category=category,
            defaults={
                "description": description,
                "price": Decimal(price),
                "is_available": True,
                "is_featured": False,
                "dietary_tags": [],
            },
        )
        if created:
            continue

        # If the item already exists, only fill blank fields to avoid overwriting admin edits.
        dirty = False
        if not obj.description:
            obj.description = description
            dirty = True
        if not obj.price:
            obj.price = Decimal(price)
            dirty = True
        if obj.is_available is None:
            obj.is_available = True
            dirty = True
        if dirty:
            obj.save()


def unseed_menu_items(apps, schema_editor):
    MenuItem = apps.get_model("api", "MenuItem")
    names = [
        "Eggs (2)",
        "Beef Stew/Fried/Boiled",
        "Goat Stew/Fried/Boiled",
        "Local Chicken Stew/Fried/Boiled",
        "Hybrid Fried Chicken Piece",
        "Hybrid Braii 1/4 Chicken",
        "Fried Open Chambo (Medium)",
        "Fried Open Chambo (Large)",
        "Smoked Butterfish (Medium)",
        "Smoked Butterfish (Large)",
        "Goat Soup",
        "Goat Khwasukhwasu",
        "Beans",
        "Masamba Otendera",
        "Special Veggies",
        "Beef Relish (Extra)",
        "Goat Relish (Extra)",
        "Chicken Relish (Hybrid)",
        "Chicken Relish (Local)",
        "Extra Eggs",
        "Nsima (Piece)",
        "Rice (Side)",
        "Chips (Side)",
        "Boiled Irish (Side)",
        "Plain Chapati",
        "Chapati with Egg (1)",
        "Chapati with Eggs (2)",
        "Chapati with Beef/Chicken Stirfry",
        "Chicken Wrap",
        "Samoosa",
        "Doughnuts",
        "Soft Drink (Glass)",
        "Soft Drink (Plastic)",
        "Water",
        "Hot Drinks (Tea/Coffee/Chocolate)",
        "Milk",
        "Extra Milk",
        "Ice-Cream (Cone)",
        "Ice-Cream (Cup)",
    ]
    MenuItem.objects.filter(name__in=names).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0017_about_services"),
    ]

    operations = [
        migrations.RunPython(seed_menu_items, unseed_menu_items),
    ]
