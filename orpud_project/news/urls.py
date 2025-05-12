from rest_framework import routers

from django.urls import include, path

from news.views import NewsViewSet, NewsReactionViewSet, NewsCommentViewSet

app_name = "news"

router_news = routers.DefaultRouter()
router_news.register(r"news", NewsViewSet),
router_news.register(
    r"news/(?P<news_pk>\d+)/comments", NewsCommentViewSet, basename="comments"
),
router_news.register(
    r"news/(?P<news_pk>\d+)/reactions", NewsReactionViewSet, basename="reactions"
)

urlpatterns = [
    path("", include(router_news.urls)),
]
