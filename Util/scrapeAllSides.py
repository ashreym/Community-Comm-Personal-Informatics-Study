import time
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import numpy as np
import pandas as pd

rating=0
pagedowns=120
count=0
cnt = 0
noUrl=0
browser = webdriver.Chrome('*** PATH TO CHROMEDRIVER ***') #Download chromedriver from https://chromedriver.chromium.org/downloads and save it to a known location
browser.get("https://www.allsides.com/media-bias/media-bias-ratings?field_featured_bias_rating_value=All&field_news_source_type_tid%5B2%5D=2&field_news_source_type_tid%5B3%5D=3&field_news_source_type_tid%5B4%5D=4&field_news_bias_nid_1%5B1%5D=1&field_news_bias_nid_1%5B2%5D=2&field_news_bias_nid_1%5B3%5D=3&title=")
time.sleep(1)
elem = browser.find_element_by_tag_name('body')

print('********initialize pagedown********') #Scroll to bottom of webpage to be sure entire document is rendered.
while pagedowns:
    elem.send_keys(Keys.PAGE_DOWN)
    time.sleep(0.2)
    pagedowns-=1
print('********pagedown ended********')

data=[] 
urls=[] #Save the url of each news sources' AllSides profile so we can visit those pages later & extract those sources' domains.

evenTable = browser.find_elements_by_xpath(".//tr[@class='even']") #even/odd are just alternating elements in the table
oddTable = browser.find_elements_by_xpath(".//tr[@class='odd']")
oddFirst = browser.find_elements_by_xpath(".//tr[@class='odd views-row-first']") #odd-first and even-last are edge cases in the table
evenLast = browser.find_elements_by_xpath(".//tr[@class='even views-row-last']")

#For each row in the table, collect the given name, url, bias image, and community feedback
for i in range(len(evenTable)):
    name = evenTable[i].find_elements_by_xpath(".//td[@class='views-field views-field-title source-title']")[0]
    url = name.find_elements_by_xpath(".//a")[0].get_attribute('href')
    img = evenTable[i].find_elements_by_xpath(".//td[@class='views-field views-field-field-bias-image']")
    link = img[0].find_elements_by_xpath(".//a")
    link=link[0].get_attribute('href')
    arr=link.split('/')

    feedback = evenTable[i].find_elements_by_xpath(".//td[@class='views-field views-field-nothing community-feedback']")
    feedback = feedback[0].text.split('\n')
    print(count)
    print(feedback)
    if(len(feedback)>1):
        feedback = feedback[0]+' '+feedback[1]
    else:
        feedback = feedback[0]

    data.append({"source":name.text, "bias":arr[4], "feedback":feedback, "URL":""})
    urls.append(url)
    count+=1


for i in range(len(oddTable)):
    name = oddTable[i].find_elements_by_xpath(".//td[@class='views-field views-field-title source-title']")[0]
    url = name.find_elements_by_xpath(".//a")[0].get_attribute('href')
    img = oddTable[i].find_elements_by_xpath(".//td[@class='views-field views-field-field-bias-image']")
    link = img[0].find_elements_by_xpath(".//a")
    link=link[0].get_attribute('href')
    arr=link.split('/')

    feedback = oddTable[i].find_elements_by_xpath(".//td[@class='views-field views-field-nothing community-feedback']")
    feedback = feedback[0].text.split('\n')
    print(count)
    print(feedback)
    if(len(feedback)>1):
        feedback = feedback[0]+' '+feedback[1]
    else:
        feedback = feedback[0]

    data.append({"source":name.text, "bias":arr[4], "feedback":feedback, "URL":""})
    urls.append(url)
    count+=1

for i in range(len(oddFirst)):
    name = oddFirst[i].find_elements_by_xpath(".//td[@class='views-field views-field-title source-title']")[0]
    url = name.find_elements_by_xpath(".//a")[0].get_attribute('href')
    img = oddFirst[i].find_elements_by_xpath(".//td[@class='views-field views-field-field-bias-image']")
    link = img[0].find_elements_by_xpath(".//a")
    link=link[0].get_attribute('href')
    arr=link.split('/')

    feedback = oddTable[i].find_elements_by_xpath(".//td[@class='views-field views-field-nothing community-feedback']")
    feedback = feedback[0].text.split('\n')
    print(count)
    print(feedback)
    if(len(feedback)>1):
        feedback = feedback[0]+' '+feedback[1]
    else:
        feedback = feedback[0]

    data.append({"source":name.text, "bias":arr[4], "feedback":feedback, "URL":""})
    urls.append(url)
    count+=1

for i in range(len(evenLast)):
    name = evenLast[i].find_elements_by_xpath(".//td[@class='views-field views-field-title source-title']")[0]
    url = name.find_elements_by_xpath(".//a")[0].get_attribute('href')
    img = evenLast[i].find_elements_by_xpath(".//td[@class='views-field views-field-field-bias-image']")
    link = img[0].find_elements_by_xpath(".//a")
    link = link[0].get_attribute('href')
    arr = link.split('/')

    feedback = evenLast[i].find_elements_by_xpath(".//td[@class='views-field views-field-nothing community-feedback']")
    feedback = feedback[0].text.split('\n')
    print(count)
    print(feedback)
    if(len(feedback)>1):
        feedback = feedback[0]+' '+feedback[1]
    else:
        feedback = feedback[0]

    data.append({"source":name.text, "bias":arr[4], "feedback":feedback, "URL":""})
    urls.append(url)
    count+=1

print(data)
print('items found: '+str(count))

#For each url in urls[], visit that page and obtain the news sources' domain to store in our csv file.
for i in range(len(urls)):
    browser.get(urls[i])
    time.sleep(1)

    name = browser.find_elements_by_xpath(".//div[@class='latest_news_source']")[0]
    nameText = name.find_elements_by_xpath(".//h1")[0].text

    div = browser.find_element_by_xpath(".//div[@class='full-news-source']")
    try:
        grid = div.find_elements_by_xpath(".//div[@class='dynamic-grid']")[0]
        href = grid.find_elements_by_xpath(".//a")[0].get_attribute('href')
        try:
            data[i]["URL"] = href
        except Exception as e:
            print("that didn't work!")
            print(e)
            cnt+=1
    except Exception as e:
        print("no grid for: " + nameText + " ?")
        print(e)
        data[i]["URL"] = "***NO URL FOUND***"
        noUrl+=1