from rest_framework import serializers

class UserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    fullname = serializers.CharField()
    mobileno = serializers.CharField()
    password = serializers.CharField(write_only=True, required=True) 


class TaskSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=200)
    description = serializers.CharField()
    status = serializers.ChoiceField(choices=["pending", "in_progress", "completed"])
    created_by = serializers.CharField()
