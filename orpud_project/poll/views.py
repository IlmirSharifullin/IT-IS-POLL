from bson import ObjectId
import datetime
from io import BytesIO

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
        # Получаем опрос по ID
        poll_id = ObjectId(poll_pk)
        poll = Poll.objects.get(id=poll_id)

        # Получаем все ответы для этого опроса
        answers = Answer.objects.filter(poll=poll)

        # Получаем общее количество ответивших
        total_answers = answers.count()

        # Получаем список ID пользователей, которые ответили на опрос
        answerer_ids = list(set([answer.author_id for answer in answers]))

        # Получаем информацию о пользователях из Django модели User
        User = get_user_model()
        users = User.objects.filter(id__in=answerer_ids)

        # Статистика по странам
        countries = users.values_list("country", flat=True)
        country_stats = {}
        for country in countries:
            country_stats[country] = country_stats.get(country, 0) + 1

        # Статистика по возрасту
        ages = []
        for user in users:
            age = (datetime.date.today() - user.birthdate).days // 365
            ages.append(age)

        # Статистика (соотношение) по полу
        genders = users.values_list("sex", flat=True)
        gender_stats = {
            "male": len([g for g in genders if g == "М"]),
            "female": len([g for g in genders if g == "Ж"]),
        }

        # Ответ
        response_data = {
            "poll_id": str(poll.id),
            "poll_title": poll.title,
            "total_respondents": total_answers,
            "answerer_ids": answerer_ids,
            "countries": country_stats,
            "age_statistics": {
                "min": min(ages) if ages else None,
                "max": max(ages) if ages else None,
                "average": sum(ages) / len(ages) if ages else None,
            },
            "gender_statistics": gender_stats,
        }

        return Response(response_data)

    except Poll.DoesNotExist:
        raise NotFound("Poll not found")
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_question_statistic(request, question_pk):
    try:
        question_id = ObjectId(question_pk)

        question = Question.objects.get(id=question_id)

        # Круговая диаграмма
        if question.type == "radio":
            question_answers = {}
            for choice in question.options:
                question_answers[choice] = Answer.objects.filter(
                    question=question_id, answers=choice
                ).count()
            return Response({"answers_count": question_answers})
        # Для вопросов с множественным выбором (checkbox)
        elif question.type == "checkbox":
            question_answers = {}
            for choice in question.options:
                # Ищем ответы, где выбран текущий вариант
                count = Answer.objects.filter(
                    question=question_id,
                    answers__contains=choice,  # Используем contains для поиска в массиве
                ).count()
                question_answers[choice] = count
            return Response({"answers_count": question_answers})
        # Облако слов
        elif question.type == "text":
            text_answers = Answer.objects.filter(question=question_id).values_list(
                "answers", flat=True
            )

            # Объединяем все ответы в один текст
            all_text = " ".join(text_answers)

            wordcloud = WordCloud(
                width=800,
                height=400,
                background_color="white",
                stopwords=None,
                min_font_size=10,
            ).generate(all_text)

            # Сохраняем облако слов в байты
            plt.figure(figsize=(8, 4), facecolor=None)
            plt.imshow(wordcloud)
            plt.axis("off")
            plt.tight_layout(pad=0)

            img_buffer = BytesIO()
            plt.savefig(img_buffer, format="png")
            plt.close()

            img_buffer.seek(0)
            img_bytes = img_buffer.getvalue()
            img_base64 = base64.b64encode(img_bytes).decode("utf-8")

            return Response(
                {
                    "type": "text",
                    "question": question.question,
                    "wordcloud": f"data:image/png;base64,{img_base64}",
                    "total_answers": len(text_answers),
                }
            )

        else:
            return Response(
                {"error": "Unsupported question type"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    except Question.DoesNotExist:
        raise NotFound("Poll not found")
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
