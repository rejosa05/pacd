from ...models import TransactionHistory

def create_transaction(divisionLog, account):
    TransactionHistory.objects.create(
        division_log = divisionLog,
        accounts = account,
        action = 'Created'
    )

def update_transaction():
    print('Update')

def serving_transaction():
    print('Serving')


def skipped_transaction():
    print('Skipped')