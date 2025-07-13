from django import forms
from .models import ClientDetails, AccountDetails
from django.utils import timezone
from django.contrib.auth.hashers import check_password, is_password_usable

class ClientDetailsForm(forms.ModelForm):
    LANE_TYPE_CHOICES = (
        ('Regular', 'Regular'),
        ('Priority', 'Priority'),
    )
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
    )
        
    client_lane_type = forms.ChoiceField(choices=LANE_TYPE_CHOICES)
    client_gender = forms.ChoiceField(choices=GENDER_CHOICES)
    client_firstname = forms.CharField(required=True, label="First Name", widget=forms.TextInput(attrs={'placeholder': 'Pangalan'}))
    client_lastname = forms.CharField(required=True, label="Last Name", widget=forms.TextInput(attrs={'placeholder': 'Apelyido'}))
    client_contact = forms.CharField(max_length=11, required=True, label="Contact Number", widget=forms.TextInput(attrs={'placeholder': 'Contact Number'}))

    class Meta:
        model = ClientDetails
        fields = ['client_firstname', 'client_lastname', 'client_gender', 'client_contact', 'client_lane_type']
    
    def safe (self, commit=True):
        instance = super().safe(commit=False)
        instance.timestamp = timezone.now()
        if commit:
            isinstance.save()
        return instance
    
class LoginForm(forms.Form):
    username = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Username', 'type': 'text'}), required=True, label="Username")
    password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Password', 'type': 'password'}), required=True, label="Password")

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
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'org'}),label="Password", required=True)
    email = forms.CharField(widget=forms.EmailInput(attrs={'class': 'org', 'placeholder': 'example@gmail.com' }), required=True)
    user = forms.CharField(widget=forms.TextInput(attrs={'class': 'org' }), required=True)
    first_name = forms.CharField(widget=forms.TextInput(attrs={'class': 'org', 'placeholder': 'Jhon' }), required=True)
    last_name = forms.CharField(widget=forms.TextInput(attrs={'class': 'org', 'placeholder': 'Doe' }), required=True)
    contact = forms.CharField(widget=forms.TextInput(attrs={'class': 'org'}), required=True)
    class Meta:
        model = AccountDetails
        fields = ['user', 'password', 'first_name', 'last_name',  'position', 'divisions', 'unit', 'email', 'contact','created_by']
    def clean_username(self):
        user = self.cleaned_data.get('user')
        if AccountDetails.objects.filter(user=user).exists():
            raise forms.ValidationError("Username already exists.")
        return user
    
