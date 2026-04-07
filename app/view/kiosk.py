from django.shortcuts import render, redirect
from ..forms import ClientDetailsForm
from ..utils.utils import send_queue_update


def client_details(request):
    if request.method == 'POST':
        form = ClientDetailsForm(request.POST)
        if form.is_valid():
            client = form.save()

            # 🔥 REAL-TIME UPDATE
            send_queue_update(client)

            return redirect('client_ticket', client_id=client.id)
    else:
        form = ClientDetailsForm()

    return render(request, 'app/client.html', {'form': form})
