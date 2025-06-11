from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend

from .serializers import (
    NewsCommentSerializer,
    NewsReactionSerializer,
    NewsSerializer,
    TagSerializer,
)
from .models import News, NewsComment, NewsReaction, Tag
from .permissions import IsAdminOrReadOnly, OwnerOrReadOnly, ReadOnly


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    pagination_class = None


class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    permission_classes = (IsAdminOrReadOnly,)
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = (
        "title",
        "tags__title",
    )

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class NewsCommentViewSet(viewsets.ModelViewSet):
    serializer_class = NewsCommentSerializer
    permission_classes = (OwnerOrReadOnly,)

    def get_queryset(self):
        return NewsComment.objects.filter(news_id=self.kwargs["news_pk"])

    def get_permissions(self):
        if self.action == "retrieve":
            return (ReadOnly(),)
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, news_id=self.kwargs["news_pk"])


class NewsReactionViewSet(viewsets.ModelViewSet):
    serializer_class = NewsReactionSerializer
    permission_classes = (OwnerOrReadOnly,)

    def get_queryset(self):
        return NewsReaction.objects.filter(news_id=self.kwargs["news_pk"])

    def get_permissions(self):
        if self.action == "retrieve":
            return (ReadOnly(),)
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, news_id=self.kwargs["news_pk"])
