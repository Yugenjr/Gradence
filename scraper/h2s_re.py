import re

html = open('h2s.html', encoding='utf-8').read()
links = re.findall(r'href="([^"]+)"', html)
events = [l for l in links if 'event' in l or 'hackathon' in l]
print(list(set(events)))
