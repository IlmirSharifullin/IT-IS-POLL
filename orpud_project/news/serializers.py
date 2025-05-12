import base64

from django.core.files.base import ContentFile
from rest_framework import serializers

from .models import News, NewsComment, NewsReaction


class Base64ImageField(serializers.ImageField):
    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith("data:image"):
            format, imgstr = data.split(";base64,")
            ext = format.split("/")[-1]

            data = ContentFile(base64.b64decode(imgstr), name="temp." + ext)

        return super().to_internal_value(data)


class NewsSerializer(serializers.ModelSerializer):
    image = Base64ImageField(required=False, allow_null=True)

    class Meta:
        model = News
        fields = ("id", "author", "title", "text", "image",)
        read_only_fields = ('author', 'created_at', 'updated_at',)


class NewsCommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = NewsComment
        fields = ("id", "author", "text")
        read_only_fields = ('author', 'created_at', 'updated_at')


class NewsReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsReaction
        fields = ("id", "news", "author", "is_like")
        read_only_fields = ('author', 'news', 'created_at', 'updated_at')
        unique_together = ('news', 'author')
