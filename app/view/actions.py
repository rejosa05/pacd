from django.http import JsonResponse
from ..models import ClientDetails, DivisionLog, AccountDetails
from django.utils import timezone

def forwarded_client_to_unit(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            user = request.session.get('username')
            account = AccountDetails.objects.filter(user=user).first()
            client_id = request.POST.get('client_id')
            org_name = request.POST.get('org_name')
            type = request.POST.get('transaction_type')
            division = request.POST.get('division')
            unit = request.POST.get('unit')
            transaction_details = request.POST.get('transaction_details')
            today = timezone.now()

            print(account.id)

            client = ClientDetails.objects.get(id=client_id)
            client.client_status = 'Serving'
            client.user = user
            client.client_org = org_name
            client.save()

            DivisionLog.objects.create(
                client_id_id=client_id,
                pacd_officer_id_id = account.id,
                action_type = 'Pending',
                division=division,
                unit=unit,
                transaction_type = type,
                transaction_details=transaction_details,
                status= 'Pending',
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

# pacd resolved
def update_client_status_served(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            today = timezone.now()
            client_id = request.POST.get('client_id')
            user = request.session.get('username')
            users = AccountDetails.objects.filter(user=user).first()
            org_name = request.POST.get('org_name')
            type = request.POST.get('transactions_type')
            transaction_details = request.POST.get('transaction_details')
            resolutions = request.POST.get('resolutions')
            remarks = request.POST.get('remarks')

            srvc_avail = request.POST.get('srvc_avail')
            deficiencies = request.POST.get('deficiencies')
            cc_cover = request.POST.get('cc_cover')
            requirements_met = request.POST.get('requirements_met')
            request_processed = request.POST.get('request_processed')   
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
            date=today,
            service_avail = srvc_avail,
            deficiencies = deficiencies,
            cc_cover = cc_cover,
            requirements_met =  requirements_met,
            request_catered = request_processed
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


# process for unit resolved
def update_client_status_served_unit(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            today = timezone.now()
            transaction_id = request.POST.get('transaction-id')
            user = request.session.get('username')
            users = AccountDetails.objects.filter(user=user).first()

            srvc_avail = request.POST.get('srvc_avail')
            deficiencies = request.POST.get('deficiencies')
            remarks = request.POST.get('remarks')
            resolutions = request.POST.get('resolutions')
            

            # New fields (Q1, Q2, Q3)
            cc_cover = request.POST.get('cc_cover')  # Q1
            requirements_met = request.POST.get('requirements_met')  # Q2
            request_processed = request.POST.get('request_processed')  # Q3 (make sure JS sends this)


            client = DivisionLog.objects.get(id=transaction_id, unit=users.unit)
            client.action_type = 'Resolved'
            client.form = resolutions
            client.date_resolved = today
            client.remarks = remarks
            client.status = 'Completed'
            client.service_avail = srvc_avail
            client.deficiencies = deficiencies

            # Save Q1, Q2, Q3 into DB
            client.cc_cover = cc_cover
            client.requirements_met = requirements_met
            client.request_catered = request_processed

            client.save()

            return JsonResponse({'message': 'Client resolved successfully!'})

        except DivisionLog.DoesNotExist:
            return JsonResponse({'message': 'Client not found'}, status=404)
        except Exception as e:
            print(f"Error in update_client_status_served_unit: {e}")
            return JsonResponse({'message': 'Internal Server Error'}, status=500)

    return JsonResponse({'message': 'Invalid request'}, status=400)


#serving
def serving_client_unit(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            transaction_id = request.POST.get('transaction-id')
            user = request.session.get('username')
            account = AccountDetails.objects.filter(user=user).first()

            client = DivisionLog.objects.get(id=transaction_id)
            client.action_type = 'Processing'
            client.status = 'Serving'
            client.process_owner_id_id = account.id
            client.save()

            return JsonResponse({'message': 'Client serving!!!!'})

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