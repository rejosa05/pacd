from django import forms


class LoginForm(forms.Form):
    """
    Login form nga naka-match sa styling sa PACD Queuing System login page.
    Gigamit ang parehas nga Tailwind classes sa widget attrs para dili
    mabag-o ang design kung i-render pinaagi sa {{ form.field }}.
    """

    INPUT_CLASSES = (
        'w-full pl-9 border border-gray-300 dark:border-gray-600 '
        'dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2.5 text-sm '
        'focus:ring-2 focus:ring-green-600 focus:border-green-600'
    )

    username = forms.CharField(
        label='Username or Employee ID',
        max_length=150,
        required=True,
        widget=forms.TextInput(attrs={
            'id': 'username',
            'placeholder': 'e.g. juan.delacruz',
            'class': INPUT_CLASSES,
            'autofocus': True,
        })
    )

    password = forms.CharField(
        label='Password',
        required=True,
        widget=forms.PasswordInput(attrs={
            'id': 'password',
            'placeholder': '••••••••',
            'class': INPUT_CLASSES + ' pr-10',
        })
    )

    remember_me = forms.BooleanField(
        label='Remember me',
        required=False,
        widget=forms.CheckboxInput(attrs={
            'class': (
                'w-4 h-4 rounded border-gray-300 text-green-700 '
                'focus:ring-green-600 dark:border-gray-600 dark:bg-gray-700'
            )
        })
    )