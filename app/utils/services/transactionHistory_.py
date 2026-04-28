from ...models import TransactionHistory
from django.utils import timezone

def create_transaction(id, divisionLog, account):
    today = timezone.now()
    TransactionHistory.objects.create(
        division_log = divisionLog,
        accounts = account,
        action = 'Created'
    )

def update_transaction():
    print('Update')

def serving_transaction():
    print('Serving')