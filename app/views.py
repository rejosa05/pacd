from django.shortcuts import render
from django.http import HttpResponse

def home(request):
    return HttpResponse('Hello World')


def display(request):
    print('display page')
    #return HttpResponse('Display Page')
    return render(request, 'app/display.html')
# Create your views here.
