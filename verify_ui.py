import os
from playwright.sync_api import sync_playwright

os.makedirs('/home/jules/verification/screenshots', exist_ok=True)
os.makedirs('/home/jules/verification/videos', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://localhost:8080')
    page.locator('button', has_text='✨').click()
    page.wait_for_timeout(2000)
    page.screenshot(path='/home/jules/verification/screenshots/player_panel.png')
    browser.close()
