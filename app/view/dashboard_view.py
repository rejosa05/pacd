from django.shortcuts import render, redirect
from ..models import AccountDetails

def dashboard(request):
    username = request.session.get('username')

    if not username:
        return redirect("login")
    
    user = AccountDetails.objects.filter(user=username).first()

    if user.unit == 'PACD':
        return redirect('pacd_dashboard')
    else:
        return redirect('unit_dashboards')