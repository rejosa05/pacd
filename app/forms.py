from django import forms
from .models import ClientDetails, AccountDetails
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
    password = forms.CharField(widget=forms.PasswordInput(),label="Password", required=True)
    class Meta:
        model = AccountDetails
        fields = ['username', 'password', 'first_name', 'last_name', 'divisions', 'unit', 'position']
    def clean_username(self):
        username = self.cleaned_data.get('username')
        if AccountDetails.objects.filter(username=username).exists():
            raise forms.ValidationError("Username already exists.")
        return username