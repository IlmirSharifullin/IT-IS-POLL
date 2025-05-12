from rest_framework import routers

from django.urls import include, path


from poll.views import PollViewSet, QuestionViewSet, AnswerViewSet

router_polls = routers.DefaultRouter()
router_polls.register(r"polls", PollViewSet, basename="poll")
router_polls.register(r"questions", QuestionViewSet, basename="question")
router_polls.register(r"answers", AnswerViewSet, basename="answer")

app_name = "poll"

urlpatterns = [
    path("", include(router_polls.urls)),
]
