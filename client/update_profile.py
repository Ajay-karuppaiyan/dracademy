import sys

with open(r'c:\Users\AJAY\Pictures\Dr-Academy\client\src\pages\profile\Profile.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_ui_start = 312 # 0-indexed, so line 313
top_half = lines[:new_ui_start]

with open(r'/tmp/profile_ui.jsx', 'r', encoding='utf-8') as f:
    bottom_half = f.read()

with open(r'c:\Users\AJAY\Pictures\Dr-Academy\client\src\pages\profile\Profile.jsx', 'w', encoding='utf-8') as f:
    f.writelines(top_half)
    f.write(bottom_half)
