from ...models import TransactionHistory

def transaction_log(divisionLog, account, action):
    TransactionHistory.objects.create(
        division_log = divisionLog,
        accounts = account,
        action = action
    )

def update_transaction():
    TransactionHistory
    print('Update')

def serving_transaction():
    print('Serving')


def skipped_transaction():
    
    print('Skipped')