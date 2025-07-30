from django.shortcuts import render, redirect
from django.contrib import messages
from ..models import ServicesDetails
from ..forms import AuthorizedPersonnelForm
from ..utils.utils import *
from django.http import HttpResponseForbidden
from django.http import JsonResponse
from django.utils import timezone


def serviceList(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        services = ServicesDetails.objects.all().order_by('-service_code')
        serviceList = [
            {   
                'id': service.id,
                'service_name': service.service_name,
                'service_code': service.service_code,
                'division': service.division,
                'unit': service.unit,
                'classification': service.classification,
            }
            for service in services
        ]

        totalServices  = get_total_services()
        print(totalServices)
        return JsonResponse({
            'serviceList': serviceList,
            'totalServices': totalServices
            })
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)
    
def accounts(request):
    if request.method == 'POST':
        form = AuthorizedPersonnelForm(request.POST)
        
        if form.is_valid():
            username = form.cleaned_data.get("user")
            
            if AccountDetails.objects.filter(user=username).exists():
                messages.error(request, "User already exists!")
            else:
                account = form.save(commit=False)
                account.set_password(form.cleaned_data["password"])
                account.created_by = request.session.get('username')
                account.save()
                messages.success(request, "Account created successfully!")
                return redirect("account")
        else:
            messages.error(request, "User already exists!")
    else:
        form = AuthorizedPersonnelForm()
    
    username = request.session.get('username')
    
    if not username:
        return redirect("login")
    
    user = AccountDetails.objects.filter(user=username).first()

    if not user or user.unit != "PACD":
        return HttpResponseForbidden("Access denied. PACD users only.")
    
    return render(request, 'app/account.html', {'form': form, 'user': user})
