from django import forms
from .models import ClientDetails, AccountDetails
from django.utils import timezone
from django.contrib.auth.hashers import check_password, is_password_usable

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

    GENDER_CHOICES = (
        ('Male','Male'),
        ('Female','Female'),
    )

    client_gender = forms.ChoiceField(choices=GENDER_CHOICES)
    client_transaction_type = forms.ChoiceField(choices=TRANSACTION_TYPE_CHOICES)
    client_lane_type = forms.ChoiceField(choices=LANE_TYPE_CHOICES)
    client_contact = forms.CharField(max_length=11, required=True, label="Contact Number", widget=forms.TextInput(attrs={'placeholder': 'Contact Number'}))

    class Meta:
        model = ClientDetails
        fields = ['client_fullname', 'client_contact' , 'client_gender', 'client_transaction_type', 'client_lane_type']
    
    def safe (self, commit=True):
        instance = super().safe(commit=False)
        instance.timestamp = timezone.now()
        if commit:
            isinstance.save()
        return instance
    
class LoginForm(forms.Form):
    username = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Username'}), required=True, label="Username")
    password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Password'}), required=True, label="Password")

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get("user")
        password = cleaned_data.get("password")

        if username and password:
            try:
                user = AccountDetails.objects.get(user=username)
                
                if not is_password_usable(user.password) or not check_password(password, user.password):
                    raise forms.ValidationError("Invalid username or password.")
            except AccountDetails.DoesNotExist:
                raise forms.ValidationError("Invalid username or password.")
        
        return cleaned_data

class AuthorizedPersonnelForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput(),label="Password", required=True)
    class Meta:
        model = AccountDetails
        fields = ['user', 'password', 'first_name', 'last_name', 'divisions', 'unit', 'position']
    def clean_username(self):
        user = self.cleaned_data.get('user')
        if AccountDetails.objects.filter(user=user).exists():
            raise forms.ValidationError("Username already exists.")
        return user