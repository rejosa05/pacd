from ...models import TransactionHistory

def create_transaction(divisionLog, account, dfciences, status, remarks, forms):
    TransactionHistory.objects.create(
        division_log = divisionLog,
        accounts = account,
        action = 'Created',
        deficiencies = dfciences,
        status = status,
        remarks = remarks,
        form = forms
    )

def update_transaction():
    print('Update')

def serving_transaction():
    print('Serving')


def skipped_transaction():
    print('Skipped')