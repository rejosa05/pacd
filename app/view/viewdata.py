from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from ..models import AccountDetails, DivisionLog

def get_account(request, id):
    try:
        account = AccountDetails.objects.get(pk=id)
        data = {
            "id": account.id + 0,
            "first_name": account.first_name,
            "last_name": account.last_name,
            "contact": account.contact,
            "email": account.email,
            "position": account.position,
            "divisions": account.divisions,
            "unit": account.unit,
            "user": account.user,
            "status": account.status,
            "date_created": account.date_created,
        }
        return JsonResponse(data)
    except AccountDetails.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    
def get_client_data (request, id):
    try:
        account = AccountDetails.objects.get(pk=id)
        data = {
            "id": account.id + 0,
            "first_name": account.first_name,
            "last_name": account.last_name,
            "contact": account.contact,
            "email": account.email,
            "position": account.position,
            "divisions": account.divisions,
            "unit": account.unit,
            "user": account.user,
            "status": account.status,
            "date_created": account.date_created,
        }
        return JsonResponse(data)
    except AccountDetails.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    