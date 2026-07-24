from django.shortcuts import render


def index(request):
    return render(request, 'index.html')

def kiosk(request):
    return render(request, 'pages/kiosk.html')

def dashboard(request):
    return render(request, 'pages/dashboard.html')

def transaction(request):
    return render(request, 'pages/transaction.html')