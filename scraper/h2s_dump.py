import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        page = await b.new_page()
        await page.goto('https://hack2skill.com/hackathons', wait_until='networkidle')
        await page.wait_for_timeout(3000)
        links = await page.evaluate('''() => Array.from(document.querySelectorAll('a')).map(a => a.href + ' | ' + a.innerText)''')
        for l in links:
            if l.strip():
                print(l.encode('ascii', 'ignore').decode())
        await b.close()

if __name__ == '__main__':
    asyncio.run(run())
