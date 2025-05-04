import datetime

from django.conf import settings
from django.contrib.auth import get_user_model

import mongoengine
from mongoengine import (
    Document,
    StringField,
    DateTimeField,
    IntField,
    ListField,
    ReferenceField,
    DynamicField,
)

mongoengine.connect(
    settings.DATABASES["mongodb"]["database"],
    host=settings.DATABASES["mongodb"]["host"],
    port=settings.DATABASES["mongodb"]["port"],
    username=settings.DATABASES["mongodb"]["username"],
    password=settings.DATABASES["mongodb"]["password"],
)


class DateTimeDocument(Document):
    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)

    meta = {"abstract": True}


class Question(DateTimeDocument):
    type = StringField(required=True)
    question = StringField(required=True)
    options = ListField(StringField())


class Poll(DateTimeDocument):
    author_id = IntField(required=True)
    title = StringField(max_length=200)
    description = StringField(max_length=200)
    questions = ListField(ReferenceField(Question))


class Answer(DateTimeDocument):
    answerer_id = IntField(required=True)
    poll = ReferenceField(Poll)
    question = ReferenceField(Question)
    answers = DynamicField(required=True)
