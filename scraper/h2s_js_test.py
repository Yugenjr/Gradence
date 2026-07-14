import asyncio
from curl_cffi import requests
import json
import re

async def main():
    async with requests.AsyncSession(impersonate="chrome110") as session:
        r = await session.get("https://hack2skill.com/hackathons")
        js_files = re.findall(r'src="([^"]+\.js)"', r.text)
        print('JS Files:', js_files)
        
        for js_file in js_files:
            js_url = js_file if js_file.startswith('http') else f"https://hack2skill.com{js_file if js_file.startswith('/') else '/' + js_file}"
            print(f"Fetching {js_url}")
            r2 = await session.get(js_url)
            # Find URLs that look like API endpoints
            apis = re.findall(r'[\'"](https://[^/\'"]+vision\.hack2skill\.com/[^\'"]+)[\'"]', r2.text)
            if apis:
                print("Found endpoints:", set(apis))

if __name__ == "__main__":
    asyncio.run(main())
