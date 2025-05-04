# Импортируем настройки проекта.
from django.conf import settings

# Импортируем функцию, позволяющую серверу разработки отдавать файлы.
from django.conf.urls.static import static

from user.forms import CustomUserCreationForm
from rest_framework import routers

from django.contrib import admin
from django.urls import include, path, reverse_lazy

from django.contrib.auth.forms import UserCreationForm
from django.views.generic.edit import CreateView


from poll.views import PollViewSet, QuestionViewSet, AnswerViewSet

router = routers.DefaultRouter()
router.register(r"polls", PollViewSet, basename="poll")
router.register(r"questions", QuestionViewSet, basename="question")
router.register(r"answers", AnswerViewSet, basename="answer")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("pages/", include("pages.urls", namespace="pages")),
    path("news/", include("news.urls", namespace="news")),
    path("api/", include(router.urls)),
    path("api/", include("djoser.urls")),  # Работа с пользователями
    path("api/", include("djoser.urls.authtoken")),  # Работа с токенами
    # path("auth/", include("django.contrib.auth.urls")),
    # path(
    #     "auth/registration/",
    #     CreateView.as_view(
    #         template_name="registration/registration_form.html",
    #         form_class=CustomUserCreationForm,
    #         success_url=reverse_lazy("pages:about"),  # На замену
    #     ),
    #     name="registration",
    # ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


handler404 = "pages.views.page_not_found"
handler500 = "pages.views.server_error"
