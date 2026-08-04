import json
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from ..models import ClientDetails


# @login_required
def client_transaction_page(request):
    """Ipakita ang HTML page — ang data mismo kuhaon sa JS via Fetch API."""
    return render(request, 'pages/client_transaction.html')


def _broadcast(action, actor, profile_id=None):
    """I-notify ang tanan connected WebSocket clients nga naay pagbag-o."""
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'user_management',
        {
            'type': 'user_list_changed',
            'action': action,
            'actor': actor,
            'profile_id': profile_id,
        }
    )

def _serialize_client(client):
    return {
        'id': client.id,
        'queue_no': client.client_queue_no,
        'full_name': f"{client.client_firstname} {client.client_lastname}".strip(),
        'lane': client.client_lane_type,
        'transaction_type': 'General',
        'status': client.client_status,
        'contact_number': client.client_contact,
        'address': client.client_address,
        'gender': client.client_gender,
        'organization': client.client_org,
        'date_created': client.date_created.isoformat() if client.date_created else None,
    }


# @login_required
@require_http_methods(["GET"])
def list_clients(request):
    clients = ClientDetails.objects.all().order_by('-date_created')
    return JsonResponse({
        'success': True,
        'clients': [_serialize_client(c) for c in clients],
    })


# @login_required
# @require_http_methods(["GET"])
# def list_options(request):
#     return JsonResponse({
#         'success': True,
#         'positions': list(Position.objects.values_list('name', flat=True)),
#         'divisions': list(Division.objects.values_list('name', flat=True)),
#         'units': list(Unit.objects.values_list('name', flat=True)),
#     })


# @login_required
# @require_http_methods(["GET"])
# def get_user(request, profile_id):
#     try:
#         profile = AccountDetails.objects.select_related('user', 'position', 'division', 'unit').get(pk=profile_id)
#         return JsonResponse({'success': True, 'data': _serialize_profile(profile)})
#     except AccountDetails.DoesNotExist:
#         return JsonResponse({'success': False, 'error': 'Wala nakit-i ang user.'}, status=404)


# @login_required
# @require_http_methods(["POST"])
# def add_user(request):
#     first_name = request.POST.get('first_name', '').strip()
#     last_name = request.POST.get('last_name', '').strip()
#     username = request.POST.get('user', '').strip()          # name="user" sa form
#     email = request.POST.get('email', '').strip()
#     contact = request.POST.get('contact', '').strip()
#     password = request.POST.get('password', '')
#     position_name = request.POST.get('position', '').strip()
#     division_name = request.POST.get('divisions', '').strip()  # name="divisions" sa form
#     unit_name = request.POST.get('unit', '').strip()

#     if not all([first_name, last_name, username, password]):
#         return JsonResponse({'success': False, 'error': 'Palihug e-fill up ang tanan required fields.'}, status=400)

#     if User.objects.filter(username=username).exists():
#         return JsonResponse({'success': False, 'error': 'Naa nay naka-gamit ani nga username.'}, status=400)

#     try:
#         user = User.objects.create(
#             first_name=first_name,
#             last_name=last_name,
#             username=username,
#             email=email,
#             password=make_password(password),
#         )

#         profile = AccountDetails.objects.create(
#             user=user,
#             contact_number=contact,
#             position=_get_or_create(Position, position_name),
#             division=_get_or_create(Division, division_name),
#             unit=_get_or_create_unit(unit_name),
#             status='Active',
#         )

#         _broadcast('added', request.user.username, profile.id)

#         return JsonResponse({
#             'success': True,
#             'message': f'Malampuson nga na-add si {user.first_name} {user.last_name}.',
#             'data': _serialize_profile(profile),
#         })

#     except Exception as e:
#         return JsonResponse({'success': False, 'error': str(e)}, status=500)


# @login_required
# @require_http_methods(["POST"])
# def edit_user(request, profile_id):
#     try:
#         profile = AccountDetails.objects.select_related('user').get(pk=profile_id)
#         user = profile.user

#         user.first_name = request.POST.get('first_name', user.first_name).strip()
#         user.last_name = request.POST.get('last_name', user.last_name).strip()
#         user.email = request.POST.get('email', '').strip()

#         new_password = request.POST.get('password', '').strip()
#         if new_password:
#             user.password = make_password(new_password)
#         user.save()

#         profile.contact_number = request.POST.get('contact', profile.contact_number).strip()
#         profile.position = _get_or_create(Position, request.POST.get('position', '').strip())
#         profile.division = _get_or_create(Division, request.POST.get('divisions', '').strip())
#         profile.unit = _get_or_create_unit(request.POST.get('unit', '').strip())

#         status = request.POST.get('status')
#         if status in ['Active', 'Inactive']:
#             profile.status = status

#         profile.save()

#         _broadcast('updated', request.user.username, profile.id)

#         return JsonResponse({
#             'success': True,
#             'message': f'Malampuson nga na-update si {user.first_name} {user.last_name}.',
#             'data': _serialize_profile(profile),
#         })

#     except AccountDetails.DoesNotExist:
#         return JsonResponse({'success': False, 'error': 'Wala nakit-i ang user.'}, status=404)
#     except Exception as e:
#         return JsonResponse({'success': False, 'error': str(e)}, status=500)


# @login_required
# @require_http_methods(["POST"])
# def toggle_status(request, profile_id):
#     try:
#         profile = AccountDetails.objects.get(pk=profile_id)
#         profile.status = 'Inactive' if profile.status == 'Active' else 'Active'
#         profile.save()

#         _broadcast('status_toggled', request.user.username, profile.id)

#         return JsonResponse({'success': True, 'status': profile.status})
#     except AccountDetails.DoesNotExist:
#         return JsonResponse({'success': False, 'error': 'Wala nakit-i ang user.'}, status=404)


# @login_required
# @require_http_methods(["POST"])
# def delete_user(request, profile_id):
#     try:
#         profile = AccountDetails.objects.select_related('user').get(pk=profile_id)
#         profile.user.delete()  # cascade

#         _broadcast('deleted', request.user.username, profile_id)

#         return JsonResponse({'success': True})
#     except AccountDetails.DoesNotExist:
#         return JsonResponse({'success': False, 'error': 'Wala nakit-i ang user.'}, status=404)


# # ------------------------------------------------------------
# def _get_or_create(model_class, name):
#     if not name:
#         return None
#     obj, _created = model_class.objects.get_or_create(name=name)
#     return obj


# def _get_or_create_unit(name):
#     if not name:
#         return None
#     obj, _created = Unit.objects.get_or_create(name=name)
#     return obj