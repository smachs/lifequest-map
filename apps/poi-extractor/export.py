from playwright.sync_api import sync_playwright
from dataclasses import dataclass, asdict, field
from urllib.parse import urlparse, parse_qs
import pandas as pd
import argparse
import json
import re

l1=[]
l2=[]

Name = ""
Introduction = ""
Lat = 0
Lng = 0

names_list=[]
intro_list=[]
lat_list=[]
lng_list=[]

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        page.goto("https://www.google.com/maps/@32.9817464,70.1930781,3.67z?", timeout=60000)
        page.wait_for_timeout(1000)

        page.locator('//input[@id="searchboxinput"]').fill(search_for)
        page.wait_for_timeout(1000)

        page.keyboard.press("Enter")
        page.wait_for_timeout(1000)

       
        page.hover('//a[contains(@href, "https://www.google.com/maps/place")]')

        
        previously_counted = 0
        while True:
            page.mouse.wheel(0, 10000)
            page.wait_for_timeout(3000)

            if (page.locator( '//a[contains(@href, "https://www.google.com/maps/place")]').count() >= total):
                print(page)
                listings = page.locator( '//a[contains(@href, "https://www.google.com/maps/place")]').all()[:total]
                listings = [listing.locator("xpath=..") for listing in listings]
                print(f"Total Found: {len(listings)}")
                break
            else: #The loop should not run infinitely
                if (page.locator( '//a[contains(@href, "https://www.google.com/maps/place")]' ).count() == previously_counted ):
                    listings = page.locator( '//a[contains(@href, "https://www.google.com/maps/place")]' ).all()
                    print(f"Arrived at all available\nTotal Found: {len(listings)}")
                    break
                else:
                    previously_counted = page.locator( '//a[contains(@href, "https://www.google.com/maps/place")]' ).count()
                    print( f"Currently Found: ", page.locator( '//a[contains(@href, "https://www.google.com/maps/place")]' ).count(), )

       
        # scraping
        for listing in listings:
            parsed_url = urlparse(listing.page.url)
            query_params = parse_qs(parsed_url.query)
            lat_pattern = r"@(-?\d+\.\d+)"
            lng_pattern = r",(-?\d+\.\d+)"

            listing.click()
            page.wait_for_timeout(5000)
           
            name_xpath = '//div[@class="TIHn2 "]//h1[@class="DUwDvf lfPIob"]'
            address_xpath = '//button[@data-item-id="address"]//div[contains(@class, "fontBodyMedium")]'
            website_xpath = '//a[@data-item-id="authority"]//div[contains(@class, "fontBodyMedium")]'
            phone_number_xpath = '//button[contains(@data-item-id, "phone:tel:")]//div[contains(@class, "fontBodyMedium")]'
            
            info1='//div[@class="LTs0Rc"][1]'#store
            info2='//div[@class="LTs0Rc"][2]'#pickup
            info3='//div[@class="LTs0Rc"][3]'#delivery
            opens_at_xpath='//button[contains(@data-item-id, "oh")]//div[contains(@class, "fontBodyMedium")]'#time
            opens_at_xpath2='//div[@class="MkV9"]//span[@class="ZDu9vd"]//span[2]'
            place_type_xpath='//div[@class="LBgpqf"]//button[@class="DkEaL "]'#type of place
            intro_xpath='//div[@class="WeS02d fontBodyMedium"]//div[@class="PYvSYb "]'
            Lat = float(re.search(lat_pattern, parsed_url.path).group(1))
            Lng = float(re.search(lng_pattern, parsed_url.path).group(1))

            if page.locator(name_xpath).count() > 0:
                Name = page.locator(name_xpath).inner_text()
                names_list.append(Name)
                #l1.append(page.locator(name_xpath).inner_text())
                print(f"Name: ${Name}, Latitude: {Lat}, Longitude: {Lng}")
            else:
                Name = ""
                names_list.append(Name)
            if page.locator(intro_xpath).count() > 0:
                Introduction = page.locator(intro_xpath).inner_text()
                intro_list.append(Introduction)
            else:
                Introduction = ""
                intro_list.append("None Found")
            if Lat:
                lat_list.append(Lat)
            else:
                Lat = 0
            if Lng:
                lng_list.append(Lng)
            else:
                Lng = 0

        df = pd.DataFrame(list(zip(names_list,intro_list,lat_list,lng_list)), columns =['name','about','lat','lng'])
        
        data = df.to_dict(orient='records')
        with open('output.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False)

        browser.close()
        print(df.head())

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-s", "--search", type=str)
    parser.add_argument("-t", "--total", type=int)
    args = parser.parse_args()

    if args.search:
        search_for = args.search
    else:
        search_for = "Restaurants in Rio de Janeiro, Brazil"
    if args.total:
        total = args.total
    else:
        total = 1

    main()
