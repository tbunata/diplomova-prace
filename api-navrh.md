# API
## user
    user POST
        vytvoreni noveho uzivatele
    user/{user_id} PUT
        aktualizace informaci o uzivateli
    user/{user_id} DELETE
        odstraneni uzivatele
    user/login GET
        prihlaseni uzivatele
    user/logout GET
        odhlaseni uzivatele
    user/{user_id}/change_password PUT
        zmena hesla uzivatele
    user/{user_id}/myOrders GET
        zobrazeni vsech objednavek uzivatele
    user/{user_id}/myOrders/{order_id} GET
        zobrazeni detailu objednavky
    user/{user_id}/myOrders/{order_id}/cancel_order DELETE
        zruseni objednavky ze strany uzivatele

## product
    product POST
        pridani noveho produktu
    product/{product_id} PUT
        uprava stavajicicho produktu
    product/{product_id} DELETE
        odstraneni stavajiciho produktu
    product/{product_id} GET
        zobrazeni detailu produktu
    product GET
        vylistovani produktu
    product/category GET
        zobrazeni kategorii
    product/category/{category_id} GET
        zobrazeni produktu v dane kategorii

## cart
    cart/{cart_id} POST
        pridani polozky do kosiku
    cart/{cart_id} DELETE
        odstraneni polozky z kosiku
    cart/{cart_id} PUT
        uprava polozky v kosiku - napr zmena poctu

## order
    order POST
        vytvoreni objednavky
    order/{order_id} PUT
        uprava stavajici objednavky
    order GET
        vylistovani objednavek
    order/{order_id} GET
        detail objednavky
    order/{order_id} DELETE
        zruseni objednavky
    