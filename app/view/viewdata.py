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
    
def get_client(request, id):
    try:
        client = DivisionLog.objects.get(client_id__id=id)
        print(client.client_id)
        data = {
            'client_id': client.client_id.id,
            'client_que': client.client_id.client_queue_no,
            'client_fullname': client.client_id.client_fullname,
            'client_lane_type': client.client_id.client_lane_type,
            'client_transaction_type': client.client_id.client_transaction_type,
        }
        return JsonResponse(data)
    except DivisionLog.DoesNotExist:
        return JsonResponse({"error": "Client not found"}, status=404)
    