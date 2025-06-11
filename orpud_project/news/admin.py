from django.contrib import admin
from .models import News, NewsComment, NewsReaction, Tag

# Register your models here.

admin.site.register(News)
admin.site.register(NewsComment)
admin.site.register(NewsReaction)
admin.site.register(Tag)
