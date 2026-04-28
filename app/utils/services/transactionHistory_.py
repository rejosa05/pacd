from ...models import TransactionHistory

def create_transaction(id, divisionLog, account):
    TransactionHistory.objects.create(
        division_log = divisionLog,
        accounts = account,
        action = 'Created'
    )

def update_transaction():
    print('Update')

def serving_transaction():
    print('Serving')