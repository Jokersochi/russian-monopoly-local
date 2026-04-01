import asyncio
from playwright.async_api import async_playwright
import os

async def run_verification():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Connect to the dev server
        try:
            await page.goto("http://localhost:8080/")
        except Exception as e:
            print(f"Error: Could not connect to dev server: {e}")
            await browser.close()
            return

        print("Page loaded. Setting up game...")

        # 1. Setup Game (assuming 4 players by default)
        # Click the "Start Game" button (using Russian text from ru.json)
        start_button = page.get_by_role("button", name="Начать игру")
        await start_button.click()
        await page.wait_for_timeout(1000)

        # Screenshot initial state
        await page.screenshot(path="verification/final_initial.png")
        print("Game started. Initial state captured.")

        # 2. Verify Space to Roll
        print("Testing [Space] to roll...")
        await page.keyboard.press("Space")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="verification/final_after_roll.png")

        # Check if phase changed (DiceRoller button should show sum or rolling status)
        # We can check for the presence of the roll result text
        roll_text = page.locator("text=Сумма:")
        if await roll_text.is_visible():
            print("SUCCESS: [Space] triggered dice roll.")
        else:
            print("FAILURE: [Space] did not trigger dice roll.")

        # 3. Verify B to Buy (if landed on buyable property)
        # Note: Position 0 is Start, a roll of 5 lands on Omsk (buyable)
        # Our screenshots will confirm if the buy button appeared.
        buy_button = page.get_by_role("button", name="Купить [B]")
        if await buy_button.is_visible():
            print("Testing [B] to buy...")
            await page.keyboard.press("b")
            await page.wait_for_timeout(1000)
            await page.screenshot(path="verification/final_after_buy.png")

            # If bought, current player should change or phase should go back to rolling
            # The buy button should disappear
            if not await buy_button.is_visible():
                print("SUCCESS: [B] triggered property purchase.")
            else:
                print("FAILURE: [B] did not trigger purchase.")
        else:
            print("Skipping [B] test: Current cell not buyable or insufficient funds.")

        # 4. Verify P to Pass
        # Roll again for the next player
        print("Rolling for next player to test [P]...")
        await page.keyboard.press("Space")
        await page.wait_for_timeout(1000)

        pass_button = page.get_by_role("button", name="Пас [P]")
        if await pass_button.is_visible():
            print("Testing [P] to pass...")
            await page.keyboard.press("p")
            await page.wait_for_timeout(1000)
            await page.screenshot(path="verification/final_after_pass.png")

            if not await pass_button.is_visible():
                print("SUCCESS: [P] triggered pass action.")
            else:
                print("FAILURE: [P] did not trigger pass.")
        else:
            print("Skipping [P] test: No pass button visible.")

        await browser.close()

if __name__ == "__main__":
    os.makedirs("verification", exist_ok=True)
    asyncio.run(run_verification())
