import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone

from ..models import ClientDetails
from ..utils.websocket import send_queue_update


def client_register_page(request):
    """Ipakita ang registration form."""
    return render(request, 'pages/client_kiosk.html')


@require_http_methods(["POST"])
def register_client(request):
    """
    Mag-save sa client details ug mo-return sa queue number info
    nga gamiton sa frontend para i-print/ipakita ang queue slip.
    """
    first_name = request.POST.get('first_name', '').strip()
    last_name = request.POST.get('last_name', '').strip()
    contact_number = request.POST.get('contact_number', '').strip()
    address = request.POST.get('address', '').strip()
    sex = request.POST.get('sex', '').strip()
    lane = request.POST.get('lane', '').strip()
    org = request.POST.get('client_org', '').strip()

    if not all([first_name, last_name, contact_number, address, sex, lane]):
        return JsonResponse({'success': False, 'error': 'Palihug e-fill up ang tanan required fields.'}, status=400)

    normalized_sex = {'male': 'Male', 'female': 'Female'}.get(sex.lower(), sex.title())
    normalized_lane = {'priority': 'Priority', 'regular': 'Regular'}.get(lane.lower(), lane.title())

    try:
        client = ClientDetails.objects.create(
            client_firstname=first_name,
            client_lastname=last_name,
            client_contact=contact_number,
            client_address=address,
            client_gender=normalized_sex,
            client_lane_type=normalized_lane,
            client_org=org,
            client_status='Waiting',
        )

        send_queue_update(client)

        lane_prefix = 'P' if client.client_lane_type.lower() == 'priority' else 'R'
        queue_code = f"{lane_prefix}-{client.client_queue_no:03d}"

        return JsonResponse({
            'success': True,
            'message': 'Malampuson nga na-register. Ania ang imong queue number.',
            'data': {
                'queue_code': queue_code,
                'queue_no': client.client_queue_no,
                'lane_type': client.client_lane_type,
                'full_name': f"{client.client_firstname} {client.client_lastname}",
                'date_created': client.date_created.strftime('%B %d, %Y %I:%M %p'),
            }
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)