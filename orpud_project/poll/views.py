from bson import ObjectId
import datetime
from io import BytesIO
from collections import Counter
import base64

from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound
from django.contrib.auth import get_user_model
from wordcloud import WordCloud
import matplotlib.pyplot as plt
from mongoengine.queryset import Q

from .models import Poll, Question, Answer
from .serializers import PollSerializer, QuestionSerializer, AnswerSerializer
from .permissions import OwnerOrReadOnly, ReadOnly
from .utils import get_age_distribution, get_word_frequency, generate_word_cloud


class PollViewSet(viewsets.ViewSet):
    serializer_class = PollSerializer
    permission_classes = (OwnerOrReadOnly,)

    def get_permissions(self):
        if self.action == "retrieve":
            return (ReadOnly(),)
        return super().get_permissions()

    def get_queryset(self):
        queryset = Poll.objects.all()
        tags = self.request.query_params.getlist("tags")
        author_id = self.request.query_params.get("author")
        title = self.request.query_params.get("title")
        if tags:
            queryset = queryset.filter(tags__in=tags)
        if author_id:
            queryset = queryset.filter(author_id=author_id)
        if title:
            queryset = queryset.filter(title__icontains=title)
        return queryset

    def get_object(self):
        try:
            poll_id = ObjectId(self.kwargs["pk"])
            return Poll.objects.get(id=poll_id)
        except (Poll.DoesNotExist, Exception):
            raise NotFound("Poll not found")

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        instance = self.get_object()
        serializer = self.serializer_class(instance, context={"request": request})
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(author_id=self.request.user.id)

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def _update(self, request, partial):
        instance = self.get_object()
        self.check_object_permissions(request, instance)
        serializer = self.serializer_class(
            instance, data=request.data, partial=partial, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        return self._update(request, partial=False)

    def partial_update(self, request, *args, **kwargs):
        return self._update(request, partial=True)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_object_permissions(request, instance)

        # Получаем ID всех вопросов опроса
        question_ids = [q.id for q in instance.questions]

        # Массовое удаление вопросов
        Question.objects.filter(id__in=question_ids).delete()

        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class QuestionViewSet(viewsets.ViewSet):
    serializer_class = QuestionSerializer
    permission_classes = (OwnerOrReadOnly,)

    def get_permissions(self):
        if self.action == "retrieve":
            return (ReadOnly(),)
        return super().get_permissions()

    def get_queryset(self):
        return Question.objects.filter()

    def get_object(self):
        try:
            author_id = ObjectId(self.kwargs["pk"])
            return Question.objects.get(id=author_id)
        except (Question.DoesNotExist, Exception):
            raise NotFound("Answer not found")

    def retrieve(self, request, pk=None):
        instance = self.get_object()
        serializer = self.serializer_class(instance, context={"request": request})
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(author_id=self.request.user.id)

    def _update(self, request, partial):
        instance = self.get_object()
        self.check_object_permissions(request, instance)
        serializer = self.serializer_class(
            instance, data=request.data, partial=partial, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        return self._update(request, partial=False)

    def partial_update(self, request, *args, **kwargs):
        return self._update(request, partial=True)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_object_permissions(request, instance)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AnswerViewSet(viewsets.ViewSet):
    serializer_class = AnswerSerializer
    permission_classes = (OwnerOrReadOnly,)

    def get_permissions(self):
        if self.action == "retrieve":
            return (ReadOnly(),)
        return super().get_permissions()

    def get_queryset(self):
        return Answer.objects.filter()

    def get_object(self):
        try:
            answer_id = ObjectId(self.kwargs["pk"])
            return Answer.objects.get(id=answer_id)
        except (Answer.DoesNotExist, Exception):
            raise NotFound("Answer not found")

    def retrieve(self, request, pk=None):
        instance = self.get_object()
        serializer = self.serializer_class(instance, context={"request": request})
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(author_id=self.request.user.id)

    def _update(self, request, partial):
        instance = self.get_object()
        self.check_object_permissions(request, instance)
        serializer = self.serializer_class(
            instance, data=request.data, partial=partial, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        return self._update(request, partial=False)

    def partial_update(self, request, *args, **kwargs):
        return self._update(request, partial=True)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_object_permissions(request, instance)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def get_poll_statistic(request, poll_pk):
    try:
        poll = Poll.objects.get(id=ObjectId(poll_pk))
        answers = Answer.objects.filter(poll=poll)
        
        # Получаем ID пользователей (аналог values_list с flat=True)
        answerer_ids = list(set([answer.author_id for answer in answers]))
        
        # Получаем информацию о пользователях
        User = get_user_model()
        users = User.objects.filter(id__in=answerer_ids)
        
        # Статистика по странам
        country_stats = {}
        for user in users:
            country = user.country
            country_stats[country] = country_stats.get(country, 0) + 1
        
        # Преобразуем в формат для графика
        country_data = [{"name": k, "value": v} for k, v in country_stats.items()]
        
        # Статистика по возрасту
        ages = []
        for user in users:
            if user.birthdate:
                age = (datetime.date.today() - user.birthdate).days // 365
                ages.append(age)
        
        # Статистика по полу
        gender_stats = {
            "male": len([u for u in users if u.sex == "М"]),
            "female": len([u for u in users if u.sex == "Ж"])
        }
        
        return Response({
            "poll": {
                "id": str(poll.id),
                "title": poll.title,
                "total_answers": answers.count(),
                "total_respondents": len(answerer_ids)
            },
            "demographics": {
                "countries": sorted(country_data, key=lambda x: -x["value"]),
                "age": {
                    "min": min(ages) if ages else None,
                    "max": max(ages) if ages else None,
                    "average": round(sum(ages)/len(ages), 2) if ages else None,
                    "distribution": get_age_distribution(ages)
                },
                "gender": gender_stats
            }
        })
    
    except Poll.DoesNotExist:
        raise NotFound("Poll not found")
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_question_statistic(request, question_pk):
    try:
        question = Question.objects.get(id=ObjectId(question_pk))
        answers = Answer.objects.filter(question=question)
        
        if question.type == "radio":
            stats = []
            for option in question.options:
                count = len([a for a in answers if a.answers == option])
                stats.append({"name": option, "value": count})
            
            return Response({
                "type": "single_choice",
                "question": question.question,
                "total_answers": answers.count(),
                "options": stats
            })
            
        elif question.type == "checkbox":
            stats = []
            for option in question.options:
                count = len([a for a in answers if option in a.answers])
                stats.append({"name": option, "count": count})
            
            return Response({
                "type": "multiple_choice",
                "question": question.question,
                "total_answers": answers.count(),
                "options": sorted(stats, key=lambda x: -x["count"])
            })
            
        elif question.type == "text":
            text_answers = [a.answers for a in answers]
            word_freq = get_word_frequency(" ".join(text_answers))
            
            return Response({
                "type": "text",
                "question": question.question,
                "total_answers": len(text_answers),
                "word_cloud": generate_word_cloud(word_freq),
                "top_words": word_freq[:20]
            })
            
        return Response(
            {"error": "Unsupported question type"},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    except Question.DoesNotExist:
        raise NotFound("Question not found")
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
