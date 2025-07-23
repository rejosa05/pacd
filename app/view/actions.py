from django.http import JsonResponse
from ..models import ClientDetails, DivisionLog, AccountDetails
from django.utils import timezone

def forwarded_client_to_unit(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            client_id = request.POST.get('client_id')
            org_name = request.POST.get('org_name')
            type = request.POST.get('transaction_type')
            division = request.POST.get('division')
            unit = request.POST.get('unit')
            transaction_details = request.POST.get('transaction_details')
            username = request.session.get('username')
            today = timezone.now()

            client = ClientDetails.objects.get(id=client_id)
            client.client_status = 'Serving'
            client.user = username
            client.client_org = org_name
            client.save()

            DivisionLog.objects.create(
                client_id_id=client_id,
                action_type = 'Pending',
                division=division,
                unit=unit,
                transaction_type = type,
                transaction_details=transaction_details,
                status= 'Pending',
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
            today = timezone.now()

            client = ClientDetails.objects.get(id=client_id)
            client.client_status = 'Skipped'
            client.user = user
            client.save()

            DivisionLog.objects.create(
                client_id_id=client_id,
                action_type = 'Skipped',
                transaction_type = type,
                status= 'Skipped',
                user=user,
                date=today
            )

            return JsonResponse({'message': 'Client skipped successfully!', 'client_queue_no': client.client_queue_no})

        except ClientDetails.DoesNotExist:
            return JsonResponse({'message': 'Client not found'}, status=404)
        except Exception as e:
        
            return JsonResponse({'message': 'Internal Server Error'}, status=500)

    return JsonResponse({'message': 'Invalid request'}, status=400)

def skipped_client_unit(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            client_id = request.POST.get('client_id')
            user = request.session.get('username')
            today = timezone.now()

            client = DivisionLog.objects.get(client_id__id=client_id)
            client.action_type = 'Skipped'
            client.user = user
            client.date = today
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
            org_name = request.POST.get('org_name')
            type = request.POST.get('transactions_type')
            transaction_details = request.POST.get('transaction_details')
            remarks = request.POST.get('remarks')
            resolutions = request.POST.get('resolutions')
            action_type = 'Resolved'
            status = 'Completed'
            
            client = ClientDetails.objects.get(id=client_id)
            client.client_status = action_type
            client.user = user
            client.client_org = org_name
            client.save()
            
            DivisionLog.objects.create(
            client_id_id=client_id,
            action_type = action_type,
            transaction_type = type,
            division=users.divisions,
            unit=users.unit,
            transaction_details=transaction_details,
            remarks = remarks,
            form = resolutions,
            unit_user = user,
            user=users.user,
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

def update_client_status_served_unit(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            client_id = request.POST.get('selectedClient')
            user = request.session.get('username')
            users = AccountDetails.objects.filter(user=user).first()
            unit = users.unit
            remarks = request.POST.get('remarks')
            resolutions = request.POST.get('resolutions')
            today = timezone.now()

            client = DivisionLog.objects.get(id=client_id, unit=unit)
            client.action_type = 'Resolved'
            client.unit_user = user
            client.form = resolutions
            client.date_resolved = today
            client.remarks = remarks
            client.status = 'Completed'
            client.save()

            return JsonResponse({'message': 'Client resolved successfully!'})

        except DivisionLog.DoesNotExist:
            return JsonResponse({'message': 'Client not found'}, status=404)
        except Exception as e:
            print(f"Error in update_client_status_resolved: {e}")
            return JsonResponse({'message': 'Internal Server Error'}, status=500)

    return JsonResponse({'message': 'Invalid request'}, status=400)

def update_status_to_served(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            client_id = request.POST.get('selectedClient')
            user = request.session.get('username')
            users = AccountDetails.objects.filter(user=user).first()
            unit = users.unit
            remarks = request.POST.get('remarks')
            resolutions = request.POST.get('resolutions')
            today = timezone.now()

            client = DivisionLog.objects.get(id=client_id, unit=unit)
            client.action_type = 'Processing'
            client.unit_user = user
            client.form = resolutions
            client.date_resolved = today
            client.remarks = remarks
            client.status = 'Serving'
            client.save()

            return JsonResponse({'message': 'Client resolved successfully!'})

        except DivisionLog.DoesNotExist:
            return JsonResponse({'message': 'Client not found'}, status=404)
        except Exception as e:
            print(f"Error in update_client_status_resolved: {e}")
            return JsonResponse({'message': 'Internal Server Error'}, status=500)

    return JsonResponse({'message': 'Invalid request'}, status=400)

def repeat_transactions(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            client_id = request.POST.get('client_id')
            org_name = request.POST.get('org_name')
            type = request.POST.get('transaction_type')
            division = request.POST.get('division')
            unit = request.POST.get('unit')
            transaction_details = request.POST.get('transaction_details')
            username = request.session.get('username')
            today = timezone.now()

            client = ClientDetails.objects.get(id=client_id)
            client.client_status = 'Serving'
            client.user = username
            client.client_org = org_name
            client.save()

            DivisionLog.objects.create(
                client_id_id=client_id,
                action_type = 'Processing',
                division=division,
                unit=unit,
                transaction_type = type,
                transaction_details=transaction_details,
                status= 'Processing',
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