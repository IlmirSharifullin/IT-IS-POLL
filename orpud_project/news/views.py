from rest_framework import viewsets
from .serializers import NewsCommentSerializer, NewsReactionSerializer, NewsSerializer
from .models import News, NewsComment, NewsReaction
from .permissions import IsAdminOrReadOnly, OwnerOrReadOnly, ReadOnly

# Create your views here.
class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    permission_classes = (IsAdminOrReadOnly,)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class NewsCommentViewSet(viewsets.ModelViewSet):
    serializer_class = NewsCommentSerializer
    permission_classes = (OwnerOrReadOnly,)

    def get_queryset(self):
        return NewsComment.objects.filter(news_id=self.kwargs['news_pk'])

    def get_permissions(self):
        if self.action == 'retrieve':
            return (ReadOnly(),)
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(
            author=self.request.user,
            news_id=self.kwargs['news_pk']
        )

class NewsReactionViewSet(viewsets.ModelViewSet):
    serializer_class = NewsReactionSerializer
    permission_classes = (OwnerOrReadOnly,)

    def get_queryset(self):
        return NewsReaction.objects.filter(news_id=self.kwargs['news_pk'])
    
    def get_permissions(self):
        if self.action == 'retrieve':
            return (ReadOnly(),)
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(
            author=self.request.user,
            news_id=self.kwargs['news_pk']
        )