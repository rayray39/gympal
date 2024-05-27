from django.contrib import admin

# Register your models here.
from .models import User, Star, Booking, Review

admin.site.register(User)
admin.site.register(Star)
admin.site.register(Booking)
admin.site.register(Review)
