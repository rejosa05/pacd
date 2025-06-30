from ..models import DivisionLog, ClientDetails
from django.utils import timezone

def get_clients():
    clients = DivisionLog.objects.filter().order_by('-client_id')
    getClients = []
    for client in clients:
        getClients.append({
            'client_id': f"#CTS-{client.client_id.id}",
            'client_fullname': f"{client.client_id.client_firstname} {client.client_id.client_lastname}",
            'client_division': client.division,
            'client_unit': client.unit,
            'client_status': client.status,
            'date_served': client.date.isoformat() if client.date else None,
        })
    return getClients

def get_pacd_clients(date):
    pending_clients = ClientDetails.objects.filter(
        client_status='Pending',
        client_created_date__date=date
    )
    return [
        {
            'client_id': client.id,
            'client_queue_no': client.client_queue_no,
            'client_fullname': f"{client.client_firstname} {client.client_lastname}",
            'client_lane_type': client.client_lane_type,
            'client_transaction_type': 'Screening',
            'client_status': client.client_status,
            'client_gender': client.client_gender,
        }
        for client in pending_clients
    ]

def get_unit_clients(unit, date):
    pending_clients = DivisionLog.objects.filter(
        unit=unit,
        status='Processing',
        date__date=date
    )
    return [
        {
            'client_id': client.client_id.id,
            'client_queue_no': client.client_id.client_queue_no,
            'client_fullname': f"{client.client_id.client_firstname} {client.client_id.client_lastname}",
            'client_lane_type': client.client_id.client_lane_type,
            'client_transaction_type': client.transaction_type,
            'client_status': client.status
        }
        for client in pending_clients
    ]


def get_pacd_totals(date):
    total = DivisionLog.objects.count() or 1
    
    return {
        'totalAdd': DivisionLog.objects.filter(date__date=date).count(),
        'totalTransaction': total,
        'totalCompleted': DivisionLog.objects.filter(status='Completed').count(),
        'totalRD': DivisionLog.objects.filter(division='RD/ARD').count(),
        'totalMSD': DivisionLog.objects.filter(division='MSD').count(),
        'totalLHSD': DivisionLog.objects.filter(division='LHSD').count(),
        'totalRLED': DivisionLog.objects.filter(division='RLED').count(),
    }


def get_unit_totals(unit, date):
    return {
        'totalTransaction': DivisionLog.objects.filter(unit=unit, date__date=date).count(),
        'totalCompleted': DivisionLog.objects.filter(unit=unit, status='Completed', date__date=date).count(),
        'totalSkipped': DivisionLog.objects.filter(unit=unit, status='Skipped', date__date=date).count(),
    }

def get_percentage(totals):
    total = totals.get('totalTransaction') or 1
    return {
        'percentAdd': f"+{round((totals['totalAdd'] / total) * 100, 2)}%",
        'percentCompleted': f"{round((totals['totalCompleted'] / total) * 100, 2)}%",
        'percentRD': f"{round((totals['totalRD'] / total) * 100, 2)}%",
        'percentMSD': f"{round((totals['totalMSD'] / total) * 100, 2)}%",
        'percentLHSD': f"{round((totals['totalLHSD'] / total) * 100, 2)}%",
        'percentRLED': f"{round((totals['totalRLED'] / total) * 100, 2)}%"
    }