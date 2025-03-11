from django import forms
from .models import PacdUser, ClientDetails

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
    client_status = "Waiting"

    class Meta:
        model = ClientDetails
        fields = [
            'client_id', 'client_queue_no', 'client_lane_type', 'client_transaction_type', 'client_status', 'created_date'
        ]


class LoginForm(forms.ModelForm):
    username = forms.CharField(max_length=100, required=True)
    password = forms.CharField(widget=forms.PasswordInput, required=True)