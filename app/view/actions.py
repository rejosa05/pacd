from django.http import JsonResponse
from ..models import ClientDetails, DivisionLog, AccountDetails
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
            division_log.action_type = 'Resolved'
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
                action_type = 'Forwarded',
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

def skipped_client_unit(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            client_id = request.POST.get('client_id')
            user = request.session.get('username')

            client = DivisionLog.objects.get(client_id__id=client_id)
            client.action_type = 'Skipped'
            client.user = user
            client.save()

            return JsonResponse({'message': 'Client skipped successfully!'})

        except ClientDetails.DoesNotExist:
            return JsonResponse({'message': 'Client not found'}, status=404)
        except Exception as e:
            print(f"Error in update_client_status_skipped: {e}")
            return JsonResponse({'message': 'Internal Server Error'}, status=500)

    return JsonResponse({'message': 'Invalid request'}, status=400)

def update_client_status_served(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            today = timezone.now()
            user = request.session.get('username')
            users = AccountDetails.objects.filter(user=user).first()
            client_id = request.POST.get('client_id')
            transaction_details = request.POST.get('transaction_details')
            remarks = request.POST.get('remarks')
            resolutions = request.POST.get('resolutions')
            action_type = 'Resolved'
            status = 'Completed'
            
            client = ClientDetails.objects.get(id=client_id)
            client.client_status = action_type
            client.user = user
            client.save()
            
            DivisionLog.objects.create(
            client_id_id=client_id,
            action_type = action_type,
            division=users.divisions,
            unit=users.unit,
            transaction_details=transaction_details,
            remarks = remarks,
            form = resolutions,
            unit_user = user,
            user=user,
            date_resolved = today,
            status = status,
            date=today
            )

            return JsonResponse({'message': 'Client forwarded successfully!', 'client_queue_no': client.client_queue_no})
        except ClientDetails.DoesNotExist:
            return JsonResponse({'message': 'Client not found'}, status=404)
        except Exception as e:
            print(f"Error in update_client_status_served: {e}")  # Log the error
            return JsonResponse({'message': 'Internal Server Error'}, status=500)
    return JsonResponse({'message': 'Invalid request'}, status=400)


def  update_user_details(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            account_id = request.POST.get('account_id')
            first_name = request.POST.get('first_name')
            last_name = request.POST.get('last_name')
            position = request.POST.get('position')
            division = request.POST.get('division')
            unit = request.POST.get('unit')
            user = request.POST.get('user')
            password = request.POST.get('password')
            email = request.POST.get('email')
            contact = request.POST.get('contact')
            status = request.POST.get('status')

            print(account_id)
            account = AccountDetails.objects.get(id=account_id)
            account.first_name = first_name
            account.last_name = last_name
            account.position = position
            account.divisions = division
            account.unit = unit
            account.user = user
            account.password = password
            account.email = email
            account.contact = contact
            account.status = status       
            account.save()

            return JsonResponse({'message': 'UPDATE successfully!'})
        except DivisionLog.DoesNotExist:
            return JsonResponse({'message': 'Client not found'}, status=404)
        except Exception as e:
            print(f"Error in update_client_status_forwarded: {e}")
            return JsonResponse({'message': 'Internal Server Error'}, status=500)

    return JsonResponse({'message': 'Invalid request'}, status=400)

