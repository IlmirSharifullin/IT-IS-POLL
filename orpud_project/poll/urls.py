from rest_framework import routers

from django.urls import include, path

from poll.views import (
    PollViewSet,
    QuestionViewSet,
    AnswerViewSet,
    get_poll_statistic,
    get_question_statistic,
)

router_polls = routers.DefaultRouter()
router_polls.register(r"polls", PollViewSet, basename="polls")
router_polls.register(r"questions", QuestionViewSet, basename="questions")
router_polls.register(r"answers", AnswerViewSet, basename="answers")

app_name = "poll"

urlpatterns = [
    path("", include(router_polls.urls)),
    path("polls/<poll_pk>/statics/", get_poll_statistic),
    path("questions/<question_pk>/statics/", get_question_statistic),
]
