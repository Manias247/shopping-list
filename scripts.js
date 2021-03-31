if (typeof Vue != "undefined") {
  var app = new Vue({
    el: "#vue-app",
    data: {
      user: "Gabriela",
      newProductName: "",
      newProductNameError: false,
      products: [
        {
          id: 0,
          name: "Testowy produkt 1",
          purchaseStatus: false,
          price: 1.01,
        },
        {
          id: 1,
          name: "Testowy produkt 2",
          purchaseStatus: true,
          price: 3.21,
        },
        {
          id: 2,
          name: "Testowy produkt 3",
          purchaseStatus: true,
          price: 39.99,
        },
        {
          id: 3,
          name: "Testowy produkt 4",
          purchaseStatus: true,
          price: 13.21,
        },
      ],
      productsPurchasedCount: 0,
      sumPricePurchasedProducts: 0,
      filteredProducts: [],
      filterStatus: "all",
    },

    created() {
      // Przypisanie listy produktów do nowej zmiennej na której będziemy
      this.filteredProducts = this.products;

      // Wyświetlenie Podsumowania kupionych produtów
      this.purchasedProducts();

      Notification.requestPermission().then(function (result) {
        console.log(result);
      })
    },
    methods: {
    
     
      dragover(ev, id) {
        ev.dataTransfer.dropEffect = "move"
      },
      drop(ev, id) {
        let zrzut = ev.dataTransfer.getData("text/plain")
        console.log("zrzut: " + zrzut)
        let srcidx = this.filteredProducts.findIndex(el => el.id == zrzut)
        let destidx = this.filteredProducts.findIndex(el => el.id == id)
        let [src] = this.filteredProducts.splice(srcidx, 1)
        console.log(src)
        this.filteredProducts.splice(destidx, 0, src)
      },
      dragstart(ev, id) {
        console.log("zaczynamy przeciągać element " + id)
        ev.dataTransfer.setData("text/plain", id)
      },

      purchasedProducts() {
        this.products.forEach((product) => {
          if (product.purchaseStatus) {
            // Zmiana ilości kupionych produktów
            this.productsPurchasedCount += 1;
            // Sumowanie wartości kupionych produktów na podstawie statusu (właściwość "purchaseStatus" z obiektu produktu)
            this.sumPricePurchasedProducts += product.price;
            // Zaokręglenie w celu ominięcie "błędu" sumowania liczb zmiennoprzecinkowych
            this.sumPricePurchasedProducts = parseFloat(
              this.sumPricePurchasedProducts.toFixed(2)
            );
          }
        });
      },
      updatePurchaseStatus(currentProduct) {
        this.products.find((product) => {
          if (product.id == currentProduct.id) {
            // Jeśli produkt jest oznaczony jako kupiony to zwiększamy sumę kupionych produktów i ilość
            if (product.purchaseStatus) {
              this.productsPurchasedCount += 1;
              this.sumPricePurchasedProducts += product.price;
            }
            // Jeśli produkt nie jest oznaczony jako kupiony to odejmujemy kwotę produktu od sumy kupionych produktów, ilość również zmniejszamy
            else {
              this.productsPurchasedCount -= 1;
              this.sumPricePurchasedProducts -= product.price;
            }

            // Aktualizacja sumy kupionych produktów
            this.sumPricePurchasedProducts = parseFloat(
              this.sumPricePurchasedProducts.toFixed(2)
            );
          }
        });

        // Aktualizacja przefiltrowanej listy produtków
        this.filterByStatus(this.filterStatus, this.filteredProducts);
      },
      updateProductPrice(currentProduct) {
        // Aktualizacja kwoty zakupionych produktów jeśli wybrany produkt jest oznaczony jako kupiony
        if (currentProduct.purchaseStatus) {
          this.products.find((product) => {
            if (product.id == currentProduct.id) {
              this.sumPricePurchasedProducts += product.price;

              this.sumPricePurchasedProducts = parseFloat(
                this.sumPricePurchasedProducts.toFixed(2)
              );
            }
          });

          // Resetowanie wartości
          this.productsPurchasedCount = 0;
          this.sumPricePurchasedProducts = 0;

          // i ponowne przeliczenie podsumowania
          this.purchasedProducts();
        }
      },
      removeProduct(currentProduct) {
        
        // Usunięcie klikniętego produktu na podstawie jego ID z listy produktów
        this.products = this.products.filter(
          (product) => product.id != currentProduct.id
        );
        

        // Aktualizacja kwoty zakupionych produktów tylko wtedy jeśli wybrany produkt jest oznaczony jako kupiony
        if (currentProduct.purchaseStatus) {
          // Aktualizacja kwoty
          this.sumPricePurchasedProducts -= currentProduct.price;
          this.sumPricePurchasedProducts = parseFloat(
            this.sumPricePurchasedProducts.toFixed(2)
          );
          // Zmiejszenie liczby kupionych produktów
          this.productsPurchasedCount -= 1;
        }

        // Po usunięciu prodktu aktualizacja tablicy/listy produktów (this.filteredProducts)
        this.filterByStatus(this.filterStatus);
       
        
      },
      sendNotificationRemove() {
        if (removeProduct(product) == true) 
          {
            let header = "Zmieniłaś listę zakupów"
            let text = 'Usunięto produkt.'
            var notification = new Notification(header, {body:text})
            setTimeout(notification.close.bind(notification), 4000);
            console.log("wysłano")
          };
        },
      

      addNewProduct() {
        if (this.newProductName.length > 0) {
          // Generowanie ID nowo dodanego produktu
          const lastProduct = this.products[this.products.length - 1];
          const idProducut = lastProduct ? lastProduct.id + 1 : 0;
          // Ukrycie komunikatu błędu
          this.newProductNameError = false;

          // Dodanie nowego produktu
          this.products.push({
            id: idProducut,
            name: this.newProductName,
            purchaseStatus: false,
            price: 0,
          });
          // Resetowanie aktywnego filtra na "Wszystkie"
          this.filterByStatus("all");
          // Resetowanie inputa po dodaniu nowego produktu
          this.newProductName = "";
        } else {
          // Wyświetlenie komunikatu błędu
          this.newProductNameError = true;
        }
      },
      // Metoda uruchamiana na inpucie, gdzie podajemy nazwę produktu
      onChangeNewProductName() {
        // Na podstawie tej zmiennej komunikat błędu jest wyświetlany lub ukrywany
        this.newProductNameError = !!this.newProductName.length === 0;
      },
      filterByStatus(filterStatus, filterData = this.products) {
        // Ustawienie wartości aktywnego filtra
        this.filterStatus = filterStatus;

        // Zmiana listy produktów na podstawie aktywnego filtra
        switch (this.filterStatus) {
          case "all":
            this.filteredProducts = this.products;
            break;
          case "purchased":
            this.filteredProducts = filterData.filter(
              (product) => product.purchaseStatus
            );
            break;
          case "tobuy":
            this.filteredProducts = filterData.filter(
              (product) => !product.purchaseStatus
            );
            break;
        }
      },
      inputId(baseName, id) {
        // Metod zwracająca identyfikatora inputa. Generowany na podstawie stringa (stała wartość) i pola "id" z obiektu produktu
        return `${baseName}-${id}`;
      },
      disabledStatusInputPurchase(product) {
        // Sprawdzenie czy cena produktu jest większa niż 0. Metoda służy do zmiany stanu disabled inputa "kupione"
        return !product.price * 100 > 0;
      },
    },
  });
} else {
  document.body.innerHTML = `<div class="wrapper message-error">Nie udało się wczytać biblioetki Vue.js.</div>`;
}
