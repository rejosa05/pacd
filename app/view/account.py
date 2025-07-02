from django.shortcuts import render, redirect
from django.contrib.auth import logout
from django.contrib import messages
from ..models import AccountDetails, SessionHistory
from django.http import JsonResponse

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
        return JsonResponse({'accountList': accountList})
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)