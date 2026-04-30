from ...models import DivisionLog, AccountDetails
from ..services.transaction_history_log_service import transaction_log
from django.utils import timezone

today = timezone.now()

def update_transactions(id, user, dfciencs, remarks, form):
    account = AccountDetails.objects.filter(user=user).first()
    transaction = DivisionLog.objects.get(id=id)
    transaction.process_owner_id = account
    transaction.deficiencies = dfciencs
    transaction.remarks = remarks
    transaction.form = form
    transaction.save()


    #history_log
    transaction_log(transaction, account, action = 'Update')



    