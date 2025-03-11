from django import forms
from .models import ClientDetails
from django.utils import timezone

class ClientDetailsForm(forms.ModelForm):
    TRANSACTION_TYPE_CHOICES = (
        ('Inquiry', 'Inquiry'),
        ('Request', 'Request'),
        ('Submit Documents', 'Submit Documents'),
        ('Others', 'Others'),
    )

    LANE_TYPE_CHOICES = (
        ('Regular', 'Regular'),
        ('Priority', 'Priority'),
    )

    client_fullname = forms.CharField(max_length=100, required=True)
    client_transaction_type = forms.ChoiceField(choices=TRANSACTION_TYPE_CHOICES)
    client_lane_type = forms.ChoiceField(choices=LANE_TYPE_CHOICES)

    class Meta:
        model = ClientDetails
        fields = ['client_fullname', 'client_transaction_type', 'client_lane_type']
    
    def safe (self, commit=True):
        instance = super().safe(commit=False)
        instance.timestamp = timezone.now()
        if commit:
            isinstance.save()
        return instance


class LoginForm(forms.ModelForm):
    username = forms.CharField(max_length=100, required=True)
    password = forms.CharField(widget=forms.PasswordInput, required=True)