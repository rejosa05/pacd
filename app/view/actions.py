from django.http import JsonResponse
from ..models import ClientDetails, DivisionLog
from django.utils import timezone
def pacd_resolved_client(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        client_id = request.POST.get('client_id')
        remarks = request.POST.get('remarks')
        resolution = request.POST.get('resolution')
        username = request.session.get('username')
        today = timezone.now()

        try:
            division_log = DivisionLog.objects.get(client_id=client_id)
            division_log.action_type = 'resolved'
            division_log.status = 'Done'
            division_log.remarks = remarks
            division_log.form = resolution
            division_log.unit_user = username
            division_log.date_resolved = today
            division_log.save()
            return JsonResponse({'message': 'DivisionLog updated successfully'})

        except DivisionLog.DoesNotExist:
            print("DivisionLog not found for client_id:", client_id)
            return JsonResponse({'message': 'DivisionLog not found'}, status=404)
        except Exception as e:
            print("Unexpected error:", str(e))
            return JsonResponse({'message': str(e)}, status=500)

    return JsonResponse({'message': 'Invalid request'}, status=400)

def forwarded_client_to_unit(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            client_id = request.POST.get('client_id')
            division = request.POST.get('division')
            action_type = request.POST.get('action_type')
            unit = request.POST.get('unit')
            transaction_details = request.POST.get('transaction_details')
            username = request.session.get('username')
            today = timezone.now()

            client = ClientDetails.objects.get(id=client_id)
            client.client_status = 'Forwarded'
            client.user = username
            client.save()

            DivisionLog.objects.create(
                client_id_id=client_id,
                action_type = action_type,
                division=division,
                unit=unit,
                transaction_details=transaction_details,
                user=username,
                date=today
            )

            return JsonResponse({'message': 'Client forwarded successfully!', 'client_queue_no': client.client_queue_no})

        except ClientDetails.DoesNotExist:
            return JsonResponse({'message': 'Client not found'}, status=404)
        except Exception as e:
            print(f"Error in update_client_status_forwarded: {e}")
            return JsonResponse({'message': 'Internal Server Error'}, status=500)

    return JsonResponse({'message': 'Invalid request'}, status=400)


def skipped_client(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            client_id = request.POST.get('client_id')
            user = request.session.get('username')

            client = ClientDetails.objects.get(id=client_id)
            client.client_status = 'Skipped'
            client.user = user
            client.save()

            return JsonResponse({'message': 'Client skipped successfully!', 'client_queue_no': client.client_queue_no})

        except ClientDetails.DoesNotExist:
            return JsonResponse({'message': 'Client not found'}, status=404)
        except Exception as e:
            print(f"Error in update_client_status_skipped: {e}")
            return JsonResponse({'message': 'Internal Server Error'}, status=500)

    return JsonResponse({'message': 'Invalid request'}, status=400)