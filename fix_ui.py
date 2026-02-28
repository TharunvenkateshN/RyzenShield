import re
import os

file_path = r'c:\Users\tharu\hackathons\RyzenShield\RyzenShield\electron-app\src\components\SecureBrowser.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the spaced-out class names and tags
# We use a broad regex to remove spaces around inner hyphens in classNames
# Matches space then hyphen then space, but only if surrounded by alphanumeric or brackets/underscores
content = re.sub(r'(?<=[a-zA-Z0-9_\[\]])\s+-\s+(?=[a-zA-Z0-9_\[\]])', '-', content)
content = re.sub(r'(?<=[a-zA-Z0-9_\[\]])\s+-\s+(?=[a-zA-Z0-9_\[\]])', '-', content) # Second pass

# Specific fixes for common cases that might have failed the regex
fixes = {
    'bg - black / 40': 'bg-black/40',
    'shadow - [0_0_30px_rgba(0, 0, 0, 0.5)]': 'shadow-[0_0_30px_rgba(0,0,0,0.5)]',
    'backdrop - blur - xl': 'backdrop-blur-xl',
    'rounded - 2xl': 'rounded-2xl',
    'shadow - [0_0_20px_rgba(249, 115, 22, 0.4)]': 'shadow-[0_0_20px_rgba(249,115,22,0.4)]',
    'shadow - [0_0_10px_rgba(239, 68, 68, 0.2)]': 'shadow-[0_0_10px_rgba(239,68,68,0.2)]',
    'shadow - [0_0_10px_rgba(34, 197, 94, 0.3)]': 'shadow-[0_0_10px_rgba(34,197,94,0.3)]',
    'shadow - [0_0_15px_rgba(249, 115, 22, 0.3)]': 'shadow-[0_0_15px_rgba(249,115,22,0.3)]',
    'active - tab - ': 'active-tab-',
    ' < span': ' <span',
    ' </span >': ' </span>',
}

for k, v in fixes.items():
    content = content.replace(k, v)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("UI Fix Applied Successfully")
