import re

def update_template():
    with open('src/template.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Replace static src in hangar-real-photo with no src
    html = html.replace('src="assets/images/hangar/mig21.jpg"', '')
    html = html.replace('src=""', '')

    with open('src/template.html', 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(html)
    print("[OK] Updated src/template.html to eliminate static media src")

if __name__ == '__main__':
    update_template()
