from ..models import ClientDetails, DivisionLog

def transaction_status(today, account):
    if account == 'PACD':
        countTransactionStatus = {
            'totalWaiting' : ClientDetails.objects.filter(date_created__date=today).count(),
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

