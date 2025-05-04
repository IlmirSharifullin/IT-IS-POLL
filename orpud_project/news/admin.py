from django.contrib import admin
from .models import News, NewsComment, NewsReaction

# Register your models here.

admin.site.register(News)
admin.site.register(NewsComment)
admin.site.register(NewsReaction)
