# Импортируем настройки проекта.
from django.conf import settings

# Импортируем функцию, позволяющую серверу разработки отдавать файлы.
from django.conf.urls.static import static

from user.forms import CustomUserCreationForm

from django.contrib import admin
from django.urls import include, path, reverse_lazy

from django.contrib.auth.forms import UserCreationForm
from django.views.generic.edit import CreateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("pages/", include("pages.urls", namespace="pages")),
    path("auth/", include("django.contrib.auth.urls")),
    path(
        "auth/registration/",
        CreateView.as_view(
            template_name="registration/registration_form.html",
            form_class=CustomUserCreationForm,
            success_url=reverse_lazy("pages:about"),  # На замену
        ),
        name="registration",
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


handler404 = "pages.views.page_not_found"
handler500 = "pages.views.server_error"
