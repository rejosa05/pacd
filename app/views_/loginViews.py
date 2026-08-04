from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from ..form.loginForm import LoginForm

def loginView(request):
    # # Kung naka-login na ang user, i-redirect diretso sa dashboard
    # if request.user.is_authenticated:
    #     return redirect('dashboard')

    form = LoginForm(request.POST or None)

    if request.method == 'POST':
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']

            user = authenticate(request, username=username, password=password)

            if user is not None:
                if user.is_active:
                    login(request, user)

                    # Remember me: extend session sa 2 weeks, kung wala, mag-expire pag close sa browser

                    next_url = request.GET.get('next', 'dashboard_')
                    return redirect(next_url)
                else:
                    messages.error(request, 'Kining account inactive na. Palihug contact sa admin.')
            else:
                messages.error(request, 'Sayop ang username o password.')
        else:
            messages.error(request, 'Palihug e-check ang imong gi-input.')

    return render(request, 'index.html', {'form': form})


@login_required
def logout_view(request):
    logout(request)
    messages.success(request, 'Malampuson ka nga na-logout.')
    return redirect('login_')