"""Management command to seed the database with region-complete menu items."""

from django.core.management.base import BaseCommand

from api.models import MenuItem


MENU_ITEMS = [
    {
        "name": "Chambo Bites",
        "description": "Charcoal-kissed Lake Malawi chambo bites with lemon salt and tomato relish.",
        "price": "3500.00",
        "region": MenuItem.Region.SOUTHERN,
        "category": MenuItem.Category.STARTERS,
        "is_featured": True,
        "dietary_tags": ["gluten-free", "signature"],
    },
    {
        "name": "Nsima & Goat Stew",
        "description": "Slow-braised goat stew served with soft nsima and seasonal greens.",
        "price": "8900.00",
        "region": MenuItem.Region.SOUTHERN,
        "category": MenuItem.Category.MAINS,
        "is_featured": True,
        "dietary_tags": ["gluten-free"],
    },
    {
        "name": "Banana Fritters",
        "description": "Golden banana fritters with cinnamon sugar and vanilla cream.",
        "price": "2500.00",
        "region": MenuItem.Region.SOUTHERN,
        "category": MenuItem.Category.DESSERTS,
        "is_featured": False,
        "dietary_tags": ["vegetarian"],
    },
    {
        "name": "Baobab Cooler",
        "description": "Chilled baobab fruit cooler with citrus and a gentle honey finish.",
        "price": "1700.00",
        "region": MenuItem.Region.SOUTHERN,
        "category": MenuItem.Category.DRINKS,
        "is_featured": False,
        "dietary_tags": ["gluten-free", "vegan"],
    },
    {
        "name": "Mandazi Basket",
        "description": "Fresh East African mandazi served warm with spiced coconut dip.",
        "price": "2200.00",
        "region": MenuItem.Region.EASTERN,
        "category": MenuItem.Category.STARTERS,
        "is_featured": False,
        "dietary_tags": ["vegetarian"],
    },
    {
        "name": "Pilau Chicken",
        "description": "Fragrant pilau rice layered with tender chicken, cardamom, and caramelised onion.",
        "price": "7600.00",
        "region": MenuItem.Region.EASTERN,
        "category": MenuItem.Category.MAINS,
        "is_featured": True,
        "dietary_tags": ["gluten-free", "signature"],
    },
    {
        "name": "Coconut Cassava Pudding",
        "description": "Silky cassava pudding with coconut cream and nutmeg.",
        "price": "2400.00",
        "region": MenuItem.Region.EASTERN,
        "category": MenuItem.Category.DESSERTS,
        "is_featured": False,
        "dietary_tags": ["vegetarian", "gluten-free"],
    },
    {
        "name": "Tamarind Ginger Juice",
        "description": "Bright tamarind juice balanced with fresh ginger and mint.",
        "price": "1600.00",
        "region": MenuItem.Region.EASTERN,
        "category": MenuItem.Category.DRINKS,
        "is_featured": False,
        "dietary_tags": ["vegan", "gluten-free"],
    },
    {
        "name": "Plantain Starter Plate",
        "description": "Sweet fried plantain with pepper sauce and black-eyed pea crumble.",
        "price": "2600.00",
        "region": MenuItem.Region.WESTERN,
        "category": MenuItem.Category.STARTERS,
        "is_featured": False,
        "dietary_tags": ["vegan", "gluten-free"],
    },
    {
        "name": "Jollof Rice & Chicken",
        "description": "Smoky jollof rice with grilled chicken and caramelised plantain.",
        "price": "7800.00",
        "region": MenuItem.Region.WESTERN,
        "category": MenuItem.Category.MAINS,
        "is_featured": True,
        "dietary_tags": ["gluten-free", "signature"],
    },
    {
        "name": "Groundnut Caramel Tart",
        "description": "Rich tart with roasted peanut caramel and a light cream finish.",
        "price": "2800.00",
        "region": MenuItem.Region.WESTERN,
        "category": MenuItem.Category.DESSERTS,
        "is_featured": False,
        "dietary_tags": ["vegetarian"],
    },
    {
        "name": "Hibiscus Zobo",
        "description": "Iced hibiscus drink with clove, ginger, and citrus zest.",
        "price": "1500.00",
        "region": MenuItem.Region.WESTERN,
        "category": MenuItem.Category.DRINKS,
        "is_featured": False,
        "dietary_tags": ["vegan", "gluten-free"],
    },
    {
        "name": "Cassava Leaf Croquettes",
        "description": "Crisp cassava croquettes with herb dip and smoked spice dust.",
        "price": "2400.00",
        "region": MenuItem.Region.CENTRAL,
        "category": MenuItem.Category.STARTERS,
        "is_featured": False,
        "dietary_tags": ["vegetarian"],
    },
    {
        "name": "Saka Saka & Beef",
        "description": "Slow-cooked cassava leaves with braised beef and cassava mash.",
        "price": "7400.00",
        "region": MenuItem.Region.CENTRAL,
        "category": MenuItem.Category.MAINS,
        "is_featured": True,
        "dietary_tags": ["gluten-free"],
    },
    {
        "name": "Forest Honey Custard",
        "description": "Smooth custard infused with local honey and toasted spice.",
        "price": "2300.00",
        "region": MenuItem.Region.CENTRAL,
        "category": MenuItem.Category.DESSERTS,
        "is_featured": False,
        "dietary_tags": ["vegetarian", "gluten-free"],
    },
    {
        "name": "Pineapple Mint Spritz",
        "description": "Fresh pineapple cooler with mint and a crisp sparkling finish.",
        "price": "1600.00",
        "region": MenuItem.Region.CENTRAL,
        "category": MenuItem.Category.DRINKS,
        "is_featured": False,
        "dietary_tags": ["vegan", "gluten-free"],
    },
    {
        "name": "Bruschetta Trio",
        "description": "Toasted bread with tomato, herb, and olive toppings for lighter international service.",
        "price": "3100.00",
        "region": MenuItem.Region.INTERNATIONAL,
        "category": MenuItem.Category.STARTERS,
        "is_featured": False,
        "dietary_tags": ["vegetarian"],
    },
    {
        "name": "Herb Butter Pasta",
        "description": "Fresh pasta tossed in herb butter with roasted vegetables and parmesan.",
        "price": "6900.00",
        "region": MenuItem.Region.INTERNATIONAL,
        "category": MenuItem.Category.MAINS,
        "is_featured": True,
        "dietary_tags": ["vegetarian"],
    },
    {
        "name": "Chocolate Mousse",
        "description": "Dark chocolate mousse with whipped cream and cocoa dust.",
        "price": "3200.00",
        "region": MenuItem.Region.INTERNATIONAL,
        "category": MenuItem.Category.DESSERTS,
        "is_featured": False,
        "dietary_tags": ["vegetarian", "gluten-free"],
    },
    {
        "name": "Citrus Sparkler",
        "description": "Sparkling citrus cooler with lemon, orange, and basil.",
        "price": "1800.00",
        "region": MenuItem.Region.INTERNATIONAL,
        "category": MenuItem.Category.DRINKS,
        "is_featured": False,
        "dietary_tags": ["vegan", "gluten-free"],
    },
]


class Command(BaseCommand):
    help = "Seed the database with region-complete menu items for testing."

    def handle(self, *args, **kwargs):
        created = 0
        updated = 0

        for item in MENU_ITEMS:
            _, was_created = MenuItem.objects.update_or_create(
                name=item["name"],
                defaults={
                    "description": item["description"],
                    "price": item["price"],
                    "region": item["region"],
                    "category": item["category"],
                    "is_available": True,
                    "is_featured": item["is_featured"],
                    "dietary_tags": item["dietary_tags"],
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Menu seed complete: {created} created, {updated} updated."
            )
        )
