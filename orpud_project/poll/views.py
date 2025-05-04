from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Poll, Question, Answer
from .serializers import PollSerializer, QuestionSerializer, AnswerSerializer
from bson import ObjectId
from rest_framework.exceptions import NotFound

class PollViewSet(viewsets.ModelViewSet):
    serializer_class = PollSerializer

    def get_queryset(self):
        return Poll.objects.filter(author_id=self.request.user.id)
    
    def get_object(self):
        try:
            poll_id = ObjectId(self.kwargs['pk'])
            return Poll.objects.get(id=poll_id, author_id=self.request.user.id)
        except (Poll.DoesNotExist, Exception):
            raise NotFound("Poll not found")
        
    def perform_create(self, serializer):
        serializer.save(author_id=self.request.user.id)

    def _update(self, request, partial):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        return self._update(request, partial=False)

    def partial_update(self, request, *args, **kwargs):
        return self._update(request, partial=True)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    queryset = Question.objects.all()

    def get_queryset(self):
        poll_id = self.request.query_params.get('poll_id')
        if poll_id:
            return Question.objects.filter(poll__id=poll_id)
        return super().get_queryset()

class AnswerViewSet(viewsets.ModelViewSet):
    serializer_class = AnswerSerializer

    def get_queryset(self):
        return Answer.objects.filter(answerer_id=self.request.user.id)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)