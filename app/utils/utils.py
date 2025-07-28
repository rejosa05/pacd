from ..models import DivisionLog, ClientDetails, AccountDetails
from django.utils import timezone

def notify(user, today):
    today = timezone.now()
    account = AccountDetails.objects.filter(user=user).first()
    unit = account.unit

    if unit == 'PACD':
        notifications = ClientDetails.objects.filter(client_status='Pending', client_created_date__date=today).count()
    else:
        notifications = DivisionLog.objects.filter(action_type='Pending', unit=unit, date__date=today).count()

    return notifications

def get_clients(unit):
    
    getClients = []

    if unit == 'PACD':
        clients = DivisionLog.objects.all().order_by('-client_id')
    else:
        clients = DivisionLog.objects.filter(unit=unit).order_by('-client_id')
        
    for client in clients:
        getClients.append({
            'id': client.id,
            'client_id': f"#CTS-{client.client_id.id}",
            'client_fullname': f"{client.client_id.client_firstname} {client.client_id.client_lastname}",
            'client_division': client.division,
            'client_unit': client.unit,
            'client_status': client.status,
            'date_started': client.date.isoformat() if client.date else None,
            'form': client.form,
            'date_served': client.date.isoformat() if client.date else None,
        })
    return getClients

def get_totals(date, unit):
    status = 'Completed'
    if unit == 'PACD':
        queryTotal = DivisionLog.objects.all()
    else:
        queryTotal = DivisionLog.objects.filter(unit=unit)
    
    total = queryTotal.count()

    getTotals =  {
            'totalAdd': queryTotal.filter(date__date=date).count(),
            'totalTransaction': total,
            'totalCompleted': queryTotal.filter(status=status).count(),
            'totalRD': queryTotal.filter(division='RD/ARD').count(),
            'totalMSD': queryTotal.filter(division='MSD').count(),
            'totalLHSD': queryTotal.filter(division='LHSD').count(),
            'totalRLED': queryTotal.filter(division='RLED').count(),
            
            'totalCSM': queryTotal.filter(form='CSM').count(),
            'totalCSS': queryTotal.filter(form='CSS').count(),
        }
    return getTotals
def get_percentage(totals):
    total = totals.get('totalTransaction') or 1
    getPercentage =  {
        'percentAdd': f"+{round((totals['totalAdd'] / total) * 100, 2)}%",
        'percentCompleted': f"{round((totals['totalCompleted'] / total) * 100, 2)}%",
        'percentRD': f"{round((totals['totalRD'] / total) * 100, 2)}%",
        'percentMSD': f"{round((totals['totalMSD'] / total) * 100, 2)}%",
        'percentLHSD': f"{round((totals['totalLHSD'] / total) * 100, 2)}%",
        'percentRLED': f"{round((totals['totalRLED'] / total) * 100, 2)}%",

        'percentCSM': f"{round((totals['totalCSM'] / total) * 100, 2)}%",
        'percentCSS': f"{round((totals['totalCSS'] / total) * 100, 2)}%"
    }

    return getPercentage

def get_total_accounts():
    account = AccountDetails.objects.all()

    totalAccounts = {
        'totalAccounts': account.count(),
        'totalActive': account.filter(status='Active').count(),
        'totalForApproval': account.filter(status='For Approval').count(),
        'totalInactive': account.filter(status='Inactive').count(),
    }

    return totalAccounts

def transaction_history(date, unit):
    getTransaction = []

    if unit == 'PACD':
        transactions = DivisionLog.objects.filter(date__date=date).order_by('-date')

    else:
        transactions = DivisionLog.objects.filter(unit=unit, date__date=date).order_by('-date')

    for transaction in transactions:
        getTransaction.append({
            'id': transaction.id,
            'client_id_primary': transaction.client_id.id,
            'client_id': f"#CTS-{transaction.client_id.id}",
            'client_queue_no': transaction.client_id.client_queue_no,
            'client_fullname': f"{transaction.client_id.client_firstname} {transaction.client_id.client_lastname}",
            'client_org': transaction.client_id.client_org,
            'client_division': transaction.division,
            'client_unit': transaction.unit,
            'action_type': transaction.client_id.client_lane_type,
            'transaction_type': transaction.transaction_type,
            'transactions_details': transaction.transaction_details,
            'status': transaction.status,
            'date_resolved': transaction.date_resolved.isoformat() if transaction.date_resolved else None,
        })
    return getTransaction


def pending_transaction(today, unit):
    pendingTransactions = []
    if unit == 'PACD':
        pending_clients = ClientDetails.objects.filter(client_status='Pending', client_created_date__date=today)
        for client in pending_clients:
            pendingTransactions.append({
                'client_id': client.id,
                'client_queue_no': client.client_queue_no,
                'client_fullname': client.client_firstname + ' ' + client.client_lastname,
                'client_lane_type': client.client_lane_type,
                'client_transaction_type': 'Screening',
                'client_status': client.client_status,
                'client_gender': client.client_gender,
                'date_created': client.client_created_date.isoformat() if client.client_created_date else None,
            })
    else:
        pending_clients = DivisionLog.objects.filter(unit=unit, status='Pending', date__date=today)
        for client in pending_clients:
            pendingTransactions.append({
                'id': client.id,
                'client_id': client.client_id.id,
                'client_queue_no': client.client_id.client_queue_no,
                'client_fullname': client.client_id.client_firstname + ' ' + client.client_id.client_lastname,
                'client_lane_type': client.client_id.client_lane_type,
                'client_transaction_type': client.transaction_type,
                'client_transaction_details': client.transaction_details,
                'client_status': client.status,
                'date_created': client.date.isoformat() if client.date else None,
            })
    
    return pendingTransactions

def serving_client_unit_list(today, user):
    servingTransaction = []
    if user == 'Sys':
        serving  = DivisionLog.objects.filter(date__date=today, status='Serving').order_by('-date')
    else:
        serving  = DivisionLog.objects.filter(date__date=today, unit_user=user , status='Serving').order_by('-date')
    
    for client in serving:
        servingTransaction.append({
            'id': client.id,
            'client_id': f"#CTS-{client.client_id.id}",
            'client_queue_no': client.client_id.client_queue_no,
            'client_fullname': f"{client.client_id.client_firstname} {client.client_id.client_lastname}",
            'client_lane_type': client.client_id.client_lane_type,
            'client_transaction_type': client.transaction_type,
            'client_division': client.division,
            'client_unit': client.unit,
            'transaction_details': client.transaction_details,
            'client_status': client.status,
            'date_created': client.date.isoformat() if client.date else None,
        })
    return servingTransaction

def transaction_status(today, account):
    if account == 'PACD':
        countTransactionStatus = {
            'totalTransaction': DivisionLog.objects.filter(date__date=today).count(),
            'totalCompleted': DivisionLog.objects.filter(status='Completed', date__date=today).count(),
            'totalServing': DivisionLog.objects.filter(status='Serving', date__date=today).count(),
            'totalSkipped': DivisionLog.objects.filter(status='Skipped', date__date=today).count()
        }
    else:
        countTransactionStatus= {
            'totalTransaction': DivisionLog.objects.filter(unit=account, date__date=today).count(),
            'totalServing': DivisionLog.objects.filter(unit=account, status='Serving', date__date=today).count(),
            'totalCompleted': DivisionLog.objects.filter(unit=account, status='Completed', date__date=today).count(),
            'totalSkipped': DivisionLog.objects.filter(unit=account, status='Skipped', date__date=today).count()
        }
    return countTransactionStatus
    