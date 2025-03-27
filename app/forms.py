from django import forms
from .models import ClientDetails
from django.utils import timezone
from django.contrib.auth.models import User

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

    DIVISION_TYPE_CHOICES = (
        ('MSD', 'MSD'),
        ('RLED', 'RLED'),
        ('RD/ARD', 'RD/ARD'),
        ('LHSD','LHSD')
    )

    client_fullname = forms.CharField(max_length=100, required=True)
    client_transaction_type = forms.ChoiceField(choices=TRANSACTION_TYPE_CHOICES)
    client_lane_type = forms.ChoiceField(choices=LANE_TYPE_CHOICES)
    client_division_type = forms.ChoiceField(choices=DIVISION_TYPE_CHOICES,widget=forms.Select(attrs={'class': 'category-choice'}))

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


class AuthorizedPersonnelForm(forms.ModelForm):
    DIVISION_CHOICES = (
        ('MSD', 'MSD'),
        ('RLED', 'RLED'),
        ('RD/ARD', 'RD/ARD'),
        ('LHSD', 'LHSD'),
    )

    username = forms.CharField(max_length=100, required=True)
    password = forms.CharField(widget=forms.PasswordInput(),label="Password", required=True)
    first_name = forms.CharField(max_length=100, required=True)
    lastname = forms.CharField(max_length=100, required=True)
    position = forms.CharField(max_length=100, required=True)
    division = forms.ChoiceField(choices=DIVISION_CHOICES, required=True, widget=forms.Select(attrs={'class': 'form-control', 'id': 'division-select'}))
    unit = forms.ChoiceField(required=False, widget=forms.Select(attrs={'class': 'form-control', 'id': 'unit-select'}))

    class Meta:
        model = User
        fields = ['username', 'password', 'first_name', 'last_name', 'division', 'unit', 'position']