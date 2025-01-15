from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for registering a new user.
    """
    password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        # Authenticate with email (not username)
        try:
            user = User.objects.get(email=email)  # Fetch user by email
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        # Use `authenticate` with username
        user = authenticate(username=user.username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        attrs["user"] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing and updating user profiles.
    """
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for changing user passwords.
    """
    old_password = serializers.CharField(write_only=True, style={"input_type": "password"})
    new_password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})

    def validate_old_password(self, value):
        request = self.context.get("request")
        user = request.user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def save(self, **kwargs):
        user = self.context.get("request").user
        user.set_password(self.validated_data["new_password"])
        user.save()
