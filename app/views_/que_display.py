from django.shortcuts import render

def que_display_page(request):
    return render(request, 'pages/que_display.html')