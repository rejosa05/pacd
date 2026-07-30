import json

from django.shortcuts import render, redirect
from django.contrib import messages
from ..models import AccountDetails
from ..forms import AuthorizedPersonnelForm
from ..utils.utils import *
from django.http import HttpResponseForbidden
from django.http import JsonResponse


def accountList(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        account = AccountDetails.objects.all().order_by('-created_at')
        accountList = [serialize_account(accounts) for accounts in account]

        totalAccounts  = get_total_accounts()
        return JsonResponse({
            'accountList': accountList,
            'totalAccount': totalAccounts
            })
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)
    

def serialize_account(account):
    return {
        'id': account.id,
        'acc_id': f"#DOHXIII-{account.id}",
        'full_name': f"{account.first_name} {account.last_name}",
        'position': account.position,
        'divisions': account.divisions,
        'unit': account.unit,
        'email': account.email,
        'contact': account.contact,
        'user': account.user,
        'status': account.status,
        'date_created': account.date_created.isoformat() if account.date_created else None,
    }


def create_account(request):
    username = request.session.get('username')
    if not username:
        return JsonResponse({'message': 'Authentication required'}, status=403)

    user = AccountDetails.objects.filter(user=username).first()
    if not user or user.unit != 'PACD':
        return JsonResponse({'message': 'Access denied. PACD users only.'}, status=403)

    if request.method != 'POST':
        return JsonResponse({'message': 'Invalid request method'}, status=405)

    try:
        request_data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        request_data = request.POST.dict()

    form = AuthorizedPersonnelForm(request_data)
    if not form.is_valid():
        return JsonResponse({'errors': form.errors}, status=400)

    username_value = form.cleaned_data.get('user')
    if AccountDetails.objects.filter(user=username_value).exists():
        return JsonResponse({'message': 'User already exists!'}, status=400)

    account = form.save(commit=False)
    account.set_password(form.cleaned_data['password'])
    account.created_by = request.session.get('username')
    account.save()

    return JsonResponse({
        'message': 'Account created successfully!',
        'account': serialize_account(account)
    }, status=201)


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
