import re
from functools import wraps
from django.http import JsonResponse
from django.shortcuts import redirect

def clean_text(text):
    if not text:
        return ''
    return re.sub(r"[\'\"\n\r\\]", ' ', text).strip()

