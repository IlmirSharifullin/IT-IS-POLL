# Импортируем настройки проекта.
from django.conf import settings

# Импортируем функцию, позволяющую серверу разработки отдавать файлы.
from django.conf.urls.static import static
from django.views.generic import TemplateView

from django.contrib import admin
from django.urls import include, path

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.urls import path, re_path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("poll.urls")),
    path("api/v1/", include("news.urls")),
    path("api/v1/", include("djoser.urls")),  # Работа с пользователями
    path("api/v1/", include("djoser.urls.jwt")),  # Работа с токенами
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

schema_view = get_schema_view(
    openapi.Info(
        title="ORPUD API",
        default_version="v1",
        description="Документация для проекта ORPUD",
        # terms_of_service="URL страницы с пользовательским соглашением",
        contact=openapi.Contact(email="Вадим лох"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns += [
    re_path(
        r"^swagger(?P<format>\.json|\.yaml)$",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
]

# handler404 = "pages.views.page_not_found"
# handler500 = "pages.views.server_error"
