from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from .models import ClientDetails
from .forms import ClientDetailsForm

def home(request):
    print('hello world')
    return render(request, 'app/base.html')

def login_view(request):
    return render(request, 'app/login.html')

def display(request):
    client_details = ClientDetails.objects.all()[:10]
    context = {
        'client_details': client_details
    }
    return render(request, 'app/display.html', context = context)

def dashboard(request):
    print('dashboard')
    return render(request, 'app/dashboard.html',)

def success(request):
    return render(request, 'app/display.html', {'message': 'Data saved successfully!'})

# Client paghtag ug detayle -- fixed/need comment
def client_details(request):
    if request.method == 'POST':
        form = ClientDetailsForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('success_page')
    else:
         form = ClientDetailsForm()
    return render(request, 'app/client.html', {'form': form})

def account_user(request):
    return render(request, 'app/account.html')