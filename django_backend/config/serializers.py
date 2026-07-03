from rest_framework import serializers

from .models import ICPCAmbassadorApplication


class ICPCAmbassadorApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ICPCAmbassadorApplication
        fields = "__all__"

