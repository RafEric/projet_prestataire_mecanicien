from django.db.models import Avg, Count

from users.models import MechanicProfile

from .models import Review


def update_mechanic_rating_stats(mechanic):
    stats = Review.objects.filter(mechanic=mechanic).aggregate(
        avg=Avg("rating"),
        count=Count("id"),
    )
    try:
        profile = mechanic.mechanic_profile
        profile.average_rating = stats["avg"] or 0
        profile.total_reviews = stats["count"] or 0
        profile.save(update_fields=["average_rating", "total_reviews"])
    except MechanicProfile.DoesNotExist:
        pass