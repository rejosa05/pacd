from django.shortcuts import render
from django.http import HttpResponse

def home(request):
    return render(request, 'app/main.html')

def display(request):
    return render(request, 'app/display.html')
# Create your views here.
