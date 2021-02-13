import random
from bs4 import BeautifulSoup
import requests


if __name__ == '__main__':
    bbt = ["Brewed", "Creamy"]
    bTea = []
    bFlavors = []
    cFlavors = []
    toppings = []

    page = requests.get('https://cafezionj.com/')
    soup = BeautifulSoup(page.text, 'html.parser')

    teas = soup.find_all('ul', class_='menu')

    for x in teas[5]:
        bTea.append(x.contents[0].contents[0].contents[0])

    brewedFlavors = soup.find(class_='menu__flavors')

    for x in brewedFlavors:
        bFlavors.append(x.contents[0].contents[0])

    flavorNames = soup.find(class_='col-12 mb-4')

    for x in flavorNames.contents[4]:
        cFlavors.append(x.contents[0].contents[0])

    top = soup.find_all("div", class_='col-12 my-4')
    for x in range(len(top[1].contents[2].contents)):
        topping = top[1].contents[2].contents[x].contents[0].contents[0].contents[0]
        price = float(top[1].contents[2].contents[x].contents[2].contents[2].contents[0])
        toppings.append((topping, price))


    # print(toppings)
    teaType = ""
    flavor = []
    topping = ""
    milk = random.choice([True, False])

    totalPriceReg = 0
    totalPriceLarge = 0

    print("Your random bubble tea combo from Cafe Zio!")
    print()

    bbtType = random.choice(bbt)
    teaType = ""
    if bbtType == "Brewed":
        teaType = random.choice(bTea)
        loop = random.choice([1, 2])
        for x in range(loop):
            flavor.append(random.choice(bFlavors))
        if len(flavor) > 1 and flavor[0] == flavor[1]:
            flavor.pop()
        topping = random.choice(toppings)
        totalPriceReg += topping[1]
        totalPriceLarge += topping[1]
    else:
        loop = random.choice([1, 2])
        for x in range(loop):
            flavor.append(random.choice(cFlavors))
        if len(flavor) > 1 and flavor[0] == flavor[1]:
            flavor.pop()
        topping = random.choice(toppings)
        totalPriceReg += topping[1]
        totalPriceLarge += topping[1]


    if bbtType == 'Brewed':
        if milk:
            print(bbtType +" "+teaType + " with Milk")
            totalPriceReg += 3
            totalPriceLarge += 3.50
        else:
            print(teaType + " " + bbtType + " Bubble Tea")
            totalPriceReg += 2.75
            totalPriceLarge += 3.25
    else:
        print(bbtType + " Bubble Tea")
        totalPriceReg += 4
        totalPriceLarge += 4.75

    if len(flavor) > 1:
        print("With " + flavor[0] + " and " + flavor[1] + " Flavor")
    else:
        print("With " + flavor[0] + " Flavor")

    print("And "+ topping[0] + " as the topping!")
    print("Prices:")
    print("Regular Size: $" + str(totalPriceReg))
    print("Large Size: $" + str(totalPriceLarge))
    print()

