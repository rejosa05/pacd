import re

def clean_text(text):
    if not text:
        return ''
    return re.sub(r"[\'\"\n\r\\]", ' ', text).strip()
