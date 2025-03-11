from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from .models import ClientDetails
from .forms import LoginForm

def home(request):
    return render(request, 'app/main.html')

def login_view(request):
    return render(request, 'app/login.html')

def display(request):
    return render(request, 'app/display.html')

def dashboard(request):
    client_details = ClientDetails.objects.all()
    context = {
        'client_details': client_details
    }
    return render(request, 'app/dashboard.html', context=context)
