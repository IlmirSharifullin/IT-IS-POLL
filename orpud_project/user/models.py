from django.contrib.auth.models import AbstractUser
from django.db import models


class MyUser(AbstractUser):
    bio = models.TextField("Дополнительная информация", blank=True)
    sex = models.CharField(max_length=1, null=False, blank=False)
    birthdate = models.DateField(null=False, blank=False)
    country = models.CharField(max_length=255, null=False, blank=False)
