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
        client = DivisionLog.objects.get(pk=id)
        data = {
            'id': client.id,
            'client_id': client.client_id_id,
            'client_que': client.client_id.client_queue_no,
            'client_fullname': client.client_id.client_firstname + ' ' + client.client_id.client_lastname,
            'client_org': client.client_id.client_org,
            'client_gender': client.client_id.client_gender,
            'client_lane_type': client.client_id.client_lane_type,
            'client_transaction_type': client.transaction_type,
            'client_transaction_details': client.transaction_details,
            'client_division': client.division,
            'client_unit': client.unit,
            'client_status': client.status,
            'client_remarks': client.remarks,
            'client_created': client.client_id.client_created_date.isoformat() if client.client_id.client_created_date else None,
            'client_forwarded': client.date.isoformat() if client.client_id.client_created_date else None,
            'client_resolved': client.date_resolved.isoformat() if client.date_resolved else None,
            'client_remarks': client.remarks,
            'client_user': client.unit_user,
        }
        return JsonResponse(data)
    except DivisionLog.DoesNotExist:
        return JsonResponse({"error": "Client not found"}, status=404)
    

    