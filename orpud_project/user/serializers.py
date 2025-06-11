from djoser.serializers import UserCreateSerializer
from .models import MyUser

class CustomUserCreateSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = MyUser
        fields = ('username', 'password', 'email', 'sex', 'birthdate', 'country')