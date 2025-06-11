from djoser.serializers import UserCreateSerializer
from rest_framework import serializers
from .models import MyUser

class CustomUserCreateSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = MyUser
        fields = ('username', 'password', 'email', 'sex', 'birthdate', 'country')

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyUser
        fields = ('id', 'username', 'email', 'sex', 'birthdate', 'country', 'is_staff')
        read_only_fields = ('id', 'is_staff')