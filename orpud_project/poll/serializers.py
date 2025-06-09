from bson import ObjectId
import datetime

from rest_framework import serializers

from .models import Poll, Question, Answer


class ObjectIdField(serializers.Field):
    """Кастомное поле для обработки ObjectId"""

    def to_representation(self, value):
        return str(value)

    def to_internal_value(self, data):
        try:
            return ObjectId(data)
        except:
            raise serializers.ValidationError("Invalid ObjectId")


class BaseDocumentSerializer(serializers.Serializer):
    id = ObjectIdField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        abstract = True

    def update(self, instance, validated_data):
        instance.updated_at = datetime.datetime.now()
        return instance


class QuestionSerializer(BaseDocumentSerializer):
    type = serializers.CharField(required=True)
    question = serializers.CharField(required=True)
    options = serializers.ListField(
        child=serializers.CharField(), required=False, allow_empty=True
    )

    def create(self, validated_data):
        return Question.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        instance.type = validated_data.get("type", instance.type)
        instance.question = validated_data.get("question", instance.question)
        instance.options = validated_data.get("options", instance.options)
        instance.save()
        return instance


class PollSerializer(BaseDocumentSerializer):
    title = serializers.CharField(max_length=200, required=True)
    description = serializers.CharField(max_length=200, required=False)
    questions = QuestionSerializer(many=True)
    author_id = serializers.IntegerField(read_only=True)
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        default=list,
        allow_empty=True,
    )

    def create(self, validated_data):
        request = self.context.get("request")
        questions_data = validated_data.pop("questions")
        tags = validated_data.pop("tags", [])

        poll = Poll.objects.create(
            title=validated_data["title"],
            description=validated_data.get("description", ""),
            author_id=request.user.id if request else None,
            tags=tags,
        )

        for question_data in questions_data:
            question_data["author_id"] = request.user.id
            question = Question.objects.create(**question_data)
            poll.questions.append(question)

        poll.save()
        return poll

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        instance.title = validated_data.get("title", instance.title)
        instance.description = validated_data.get("description", instance.description)
        if "tags" in validated_data:
            instance.tags = validated_data["tags"]

        if "questions" in validated_data:
            for question in instance.questions:
                question.delete()
            instance.questions = []

            for question_data in validated_data["questions"]:
                question = Question.objects.create(**question_data)
                instance.questions.append(question)

        instance.save()
        return instance


class AnswerSerializer(BaseDocumentSerializer):
    question = ObjectIdField(required=True)
    answers = serializers.JSONField(required=True)
    poll = ObjectIdField(required=True)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["question"] = str(instance.question.id)
        data["poll"] = str(instance.poll.id)
        return data

    def validate(self, data):
        question = Question.objects.get(id=data["question"])

        if question.type == "text" and not isinstance(data["answers"], str):
            raise serializers.ValidationError("Text question requires string answer")

        if question.type == "radio" and not isinstance(data["answers"], str):
            raise serializers.ValidationError(
                "Radio question requires single string answer"
            )

        if question.type == "checkbox" and not isinstance(data["answers"], list):
            raise serializers.ValidationError(
                "Checkbox question requires list of answers"
            )

        return data

    def create(self, validated_data):
        return Answer.objects.create(
            question=Question.objects.get(id=validated_data["question"]),
            poll=Poll.objects.get(id=validated_data["poll"]),
            author_id=self.context["request"].user.id,
            answers=validated_data["answers"],
        )
