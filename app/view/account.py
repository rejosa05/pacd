from django.shortcuts import render, redirect
from django.contrib import messages
from ..models import AccountDetails
from ..forms import AuthorizedPersonnelForm
from ..utils.utils import *
from django.http import HttpResponseForbidden
from django.http import JsonResponse
from django.utils import timezone


def accountList(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        account = AccountDetails.objects.all().order_by('-date_created')
        accountList = [
            {   
                'id': accounts.id,
                'acc_id': f"#DOHXIII-{accounts.id}",
                'full_name': accounts.first_name + ' ' + accounts.last_name,
                'position': accounts.position,
                'divisions': accounts.divisions,
                'unit': accounts.unit,
                'email': accounts.email,
                'contact': accounts.contact,
                'user': accounts.user,
                'password': accounts.password,
                'status': accounts.status,
                'date_created': accounts.date_created.isoformat() if accounts.date_created else None,
            }
            for accounts in account
        ]

        totalAccounts  = get_total_accounts()
        return JsonResponse({
            'accountList': accountList,
            'totalAccount': totalAccounts
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
