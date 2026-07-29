from django.shortcuts import render
from django.contrib.auth.decorators import login_required

def userView(request):
    return render(request, 'pages/users.html')