#!/usr/bin/env python3
"""
Update all documentation pages with modern Figma-style design.

Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light).
All Rights Reserved. PATENT PENDING.
"""

import re
from pathlib import Path

# Modern design template
MODERN_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --secondary: #8b5cf6;
            --accent: #ec4899;
            --danger: #ef4444;
            --success: #10b981;
            --warning: #f59e0b;
            --dark: #0f172a;
            --dark-light: #1e293b;
            --gray: #64748b;
            --gray-light: #cbd5e1;
            --white: #ffffff;
            --gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --gradient-2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--dark);
            color: var(--white);
            line-height: 1.6;
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
        }}

        body::before {{
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background:
                radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
            z-index: 0;
            animation: pulse 10s ease-in-out infinite;
        }}

        @keyframes pulse {{
            0%, 100% {{ opacity: 1; }}
            50% {{ opacity: 0.8; }}
        }}

        .container {{
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            position: relative;
            z-index: 1;
        }}

        .back-link {{
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 50px;
            color: var(--white);
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            margin-bottom: 32px;
        }}

        .back-link:hover {{
            background: rgba(99, 102, 241, 0.2);
            border-color: var(--primary);
            transform: translateX(-4px);
        }}

        .doc-card {{
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 48px;
            margin-top: 24px;
        }}

        h1 {{
            font-size: 3rem;
            font-weight: 700;
            background: var(--gradient-1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 16px;
        }}

        .tagline {{
            font-size: 1.25rem;
            color: var(--gray-light);
            margin-bottom: 32px;
        }}

        .warning-box {{
            background: rgba(239, 68, 68, 0.1);
            border-left: 4px solid var(--danger);
            padding: 20px;
            border-radius: 8px;
            margin: 32px 0;
        }}

        .warning-box strong {{
            color: var(--danger);
            font-size: 1.1em;
        }}

        h2 {{
            font-size: 1.75rem;
            font-weight: 600;
            color: var(--primary);
            margin-top: 40px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
        }}

        p {{
            color: var(--gray-light);
            margin-bottom: 16px;
        }}

        ul {{
            list-style: none;
            margin: 16px 0;
        }}

        ul li {{
            color: var(--gray-light);
            padding: 8px 0;
            padding-left: 28px;
            position: relative;
        }}

        ul li::before {{
            content: '▹';
            position: absolute;
            left: 8px;
            color: var(--primary);
            font-size: 1.2em;
        }}

        code {{
            background: rgba(99, 102, 241, 0.2);
            color: var(--primary);
            padding: 4px 8px;
            border-radius: 6px;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
            font-size: 0.9em;
        }}

        pre {{
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 12px;
            padding: 24px;
            overflow-x: auto;
            margin: 16px 0;
        }}

        pre code {{
            background: none;
            color: var(--gray-light);
            padding: 0;
        }}

        .footer {{
            text-align: center;
            margin-top: 48px;
            padding-top: 32px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--gray);
            font-size: 0.9em;
        }}
    </style>
</head>
<body>
    <div class="container">
        <a href="../index.html" class="back-link">← Back to All Tools</a>

        <div class="doc-card">
            <h1>{icon} {tool_name}</h1>
            <p class="tagline"><strong>{tagline}</strong></p>

            {warning}

            {content}

            <div class="footer">
                Copyright © 2025 Joshua Hendricks Cole (DBA: Corporation of Light).<br>
                All Rights Reserved. PATENT PENDING.
            </div>
        </div>
    </div>
</body>
</html>
'''

def extract_content(html):
    """Extract content sections from existing HTML."""
    # Extract title
    title_match = re.search(r'<title>(.*?)</title>', html)
    title = title_match.group(1) if title_match else "Documentation"

    # Extract h1 (with icon and name)
    h1_match = re.search(r'<h1>(.*?)</h1>', html)
    h1 = h1_match.group(1) if h1_match else ""

    # Split icon and name
    icon = ""
    tool_name = ""
    if h1:
        parts = h1.split(None, 1)
        if len(parts) == 2:
            icon = parts[0]
            tool_name = parts[1]
        else:
            tool_name = h1

    # Extract tagline (first <p><strong>)
    tagline_match = re.search(r'<p><strong>(.*?)</strong></p>', html)
    tagline = tagline_match.group(1) if tagline_match else ""

    # Extract warning box
    warning_match = re.search(r'<div class="warning">(.*?)</div>', html, re.DOTALL)
    warning = ""
    if warning_match:
        warning = f'<div class="warning-box">{warning_match.group(1)}</div>'

    # Extract content sections (everything after warning until copyright)
    content_match = re.search(
        r'</div>\s*<h2>(.*?)<p style="margin-top: 40px',
        html,
        re.DOTALL
    )
    content = ""
    if content_match:
        content = "<h2>" + content_match.group(1)

    return {
        'title': title,
        'icon': icon,
        'tool_name': tool_name,
        'tagline': tagline,
        'warning': warning,
        'content': content
    }

def update_doc_page(file_path):
    """Update a single documentation page."""
    print(f"Updating {file_path.name}...")

    # Read original
    original_html = file_path.read_text()

    # Extract content
    data = extract_content(original_html)

    # Generate new HTML
    new_html = MODERN_TEMPLATE.format(**data)

    # Write updated version
    file_path.write_text(new_html)
    print(f"✓ Updated {file_path.name}")

def main():
    docs_dir = Path("/Users/noone/docs")
    doc_files = sorted(docs_dir.glob("*.html"))

    print(f"\nUpdating {len(doc_files)} documentation pages with modern design...\n")

    for doc_file in doc_files:
        update_doc_page(doc_file)

    print(f"\n✓ Successfully updated all {len(doc_files)} documentation pages!\n")

if __name__ == "__main__":
    main()
