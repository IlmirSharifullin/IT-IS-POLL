import base64

from django.core.files.base import ContentFile
from rest_framework import serializers

from .models import News, NewsComment, NewsReaction, Tag


class Base64ImageField(serializers.ImageField):
    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith("data:image"):
            format, imgstr = data.split(";base64,")
            ext = format.split("/")[-1]

            data = ContentFile(base64.b64decode(imgstr), name="temp." + ext)

        return super().to_internal_value(data)
    

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'title')
        read_only_fields = ('id', 'title')


class NewsSerializer(serializers.ModelSerializer):
    image = Base64ImageField(required=False, allow_null=True)
    tags = serializers.SlugRelatedField(
        many=True,
        slug_field='title',
        queryset=Tag.objects.all(),
        required=False
    )

    class Meta:
        model = News
        fields = ("id", "author", "title", "text", "image", "tags")
        read_only_fields = ('author', 'created_at', 'updated_at')

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        news = News.objects.create(**validated_data)
        news.tags.set(tags_data)
        return news

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        if tags_data is not None:
            instance.tags.set(tags_data)
        return super().update(instance, validated_data)


class NewsCommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = NewsComment
        fields = ("id", "news", "author", "text")
        read_only_fields = ('author', 'created_at', 'updated_at')


class NewsReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsReaction
        fields = ("id", "news", "author", "is_like")
        read_only_fields = ('author', 'news', 'created_at', 'updated_at')
        unique_together = ('news', 'author')
