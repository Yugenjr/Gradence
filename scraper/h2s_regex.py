import asyncio
from curl_cffi import requests
import re

async def x():
    async with requests.AsyncSession(impersonate='chrome110') as s:
        r = await s.get('https://hack2skill.com/assets/index-ce67c0a3.js')
        matches = re.findall(r'[\'\"](/[^\'\"]*api[^\'\"]*)[\'\"]', r.text) + re.findall(r'[\'\"]([^\'\"]*hackathon[^\'\"]*)[\'\"]', r.text)
        print("Matches:")
        for m in set(matches):
            print(m)
asyncio.run(x())
