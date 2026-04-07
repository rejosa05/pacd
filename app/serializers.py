from rest_framework import serializers
from .models import ClientDetails

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientDetails
        fields = '__all__'