from django.shortcuts import render


def index(request):
    return render(request, 'index.html')

def kiosk(request):
    return render(request, 'pages/kiosk.html')

def dashboard(request):
    return render(request, 'pages/dashboard.html')

def transaction(request):
    return render(request, 'pages/transaction.html')

def user(request):
    return render(request, 'pages/users.html')

def logs(request):
    return render(request, 'pages/logs.html')

def display(request):
    return render(request, 'pages/display.html')