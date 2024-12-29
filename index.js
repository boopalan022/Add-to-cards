
let dessertsList = document.querySelector(".desserts__list");
let cartList = document.querySelector(".cart__list");
let confirmList = document.querySelector(".confirm__list");
let confirmBox = document.querySelector(".container__confirm");
let emptyCart = document.querySelector(".cart__body.empty");
let fullCart = document.querySelector(".cart__body.full");
let cartQuantity = document.querySelector(".cart__title .quantity");
let orderPrice = document.querySelector(".container__cart .order-price");
let confirmTotalPrice = document.querySelector(".container__confirm .order-price");
let confirmBtn = document.querySelector(".confirm-order");
let newOrderBtn = document.querySelector(".new-order");

getData("GET", "./data.json");

// Assign unique ID for each element of the data
let id = 0;

class Dessert {
  constructor(id, name, category, price, image, quantity = 1) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.image = image;
    this.quantity = quantity;
  }
}

class CartItem {
  constructor(dessert) {
    this.id = dessert.id;
    this.name = dessert.name;
    this.category = dessert.category;
    this.price = dessert.price;
    this.image = dessert.image;
    this.quantity = dessert.quantity;
  }
}

// Cart object where it has all methods
class Cart {
  constructor() {
    this.dessertsArray = [];
    this.cartArray = [];
    this.totalPrice = 0;
  }

  addToDessertsArray(dessert) {
    this.dessertsArray.push(dessert);
  }

  handleDessertClick(parent, target) {
    let id = parent.dataset.id;
    let addBtn = parent.querySelector(".add-btn");
    let increaseBtn = parent.querySelector('img[alt="increase"]');
    let decreaseBtn = parent.querySelector('img[alt="decrease"]');

    if (target == addBtn || [...addBtn.children].includes(target)) {
      this.updateCart(id);
    } else if (target == increaseBtn) {
      this.increment(id);
    } else if (target == decreaseBtn) {
      this.decrement(id);
    }
  }

  updateCart(id) {
    cartList.innerHTML = "";
    this.totalPrice = 0;
    this.dessertsArray.forEach((dessert) => {
      if (dessert["id"] == id) {
        let existingItem = this.cartArray.find((item) => item["id"] == dessert["id"]);
        if (!existingItem) {
          let newCartItem = new CartItem(dessert);
          this.cartArray.push(newCartItem);
        }
      }
    });

    this.cartArray.forEach((item) => {
      this.totalPrice += item["quantity"] * item["price"];
      this.updateDOM(item);
    });

    localStorage["cart"] = JSON.stringify(cart.cartArray);
  }

  increment(id) {
    this.cartArray.forEach((dessert) => {
      if (dessert["id"] == id) {
        dessert.quantity++;
        this.updateCart(id);
      }
    });
  }

  decrement(id) {
    this.cartArray.forEach((dessert) => {
      if (dessert["id"] == id) {
        if (dessert.quantity > 0) {
          dessert.quantity--;
        }
        this.updateCart(id);
      }
    });
  }

  updateDOM(item) {
    let dessertParent = document.querySelector(`.desserts__list li[data-id="${item.id}"`);

    if (item.quantity > 0) {
      let li = document.createElement("li");
      li.className = "cart__box";
      li.dataset.id = item.id;
      li.innerHTML = `
        <div class="wrapper">
          <span class="item__name">${item.name}</span>
          <span class="item__info">
            <span class="item__quantity">${item.quantity}x</span>
            <span class="item__price">@ $${item.price.toFixed(2)}</span>
            <span class="item__total"> $${(item.price * item.quantity).toFixed(2)}</span>
          </span>
        </div>
        <img src="./assets/images/icon-remove-item.svg" alt="remove" />`;

      cartList.appendChild(li);
      dessertParent.querySelector(".card__image img").classList.add("selected");
      dessertParent.querySelector(".add-btn").classList.remove("active");
      dessertParent.querySelector(".quantity-btn").classList.add("active");
    } else {
      item.quantity = 0;
      dessertParent.querySelector(".card__image img").classList.remove("selected");
      dessertParent.querySelector(".add-btn").classList.add("active");
      dessertParent.querySelector(".quantity-btn").classList.remove("active");
    }

    this.cartArray = this.cartArray.filter((item) => item.quantity != 0);
    dessertParent.querySelector(".number").innerHTML = item.quantity;
    cartQuantity.innerHTML = `(${this.cartArray.length})`;
    orderPrice.innerHTML = `$${this.totalPrice.toFixed(2)}`;

    if (this.cartArray.length == 0) {
      emptyCart.classList.add("active");
      fullCart.classList.remove("active");
    } else {
      emptyCart.classList.remove("active");
      fullCart.classList.add("active");
    }
  }

  removeCartBox(parent, target) {
    let id = parent.dataset.id;
    let removeBtn = parent.querySelector('img[alt="remove"]');
    if (target == removeBtn) {
      this.cartArray.forEach((item) => (item["id"] == id ? (item.quantity = 0) : false));
      this.updateCart(id);
    }
  }

  confirmOrder() {
    // Send cartArray to the server
    confirmBox.classList.add("active");
    document.body.classList.add("inactive");
    this.cartArray.forEach((item) => {
      let li = document.createElement("li");
      li.className = "cart__box";
      li.innerHTML = `
        <div class="main-wrapper">
          <img src="${item.image["thumbnail"]}" alt="" />
          <div class="sub-wrapper">
            <span class="item__name">${item.name}</span>
            <span class="item__info">
              <span class="item__quantity">${item.quantity}x</span>
              <span class="item__price">@ $${item.price.toFixed(2)}</span>
            </span>
          </div>
        </div>
        <span class="item__total">$${(item.price * item.quantity).toFixed(2)}</span>`;
      confirmTotalPrice.innerHTML = `$${this.totalPrice.toFixed(2)}`;
      confirmList.appendChild(li);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  resetCart() {
    this.cartArray.forEach((item) => {
      item.quantity = 0;
      this.updateCart(item);
    });
    this.cartArray = [];
    this.totalPrice = 0;
    confirmList.innerHTML = "";
    confirmTotalPrice.innerHTML = `$${this.totalPrice.toFixed(2)}`;
    localStorage["cart"] = "";
  }
}

let cart = new Cart();
cartQuantity.innerHTML = `(${cart.cartArray.length})`;
orderPrice.innerHTML = `$${cart.totalPrice.toFixed(2)}`;

function getData(method, url) {
  let request = new XMLHttpRequest();
  request.open(method, url);
  request.send();
  request.onreadystatechange = function () {
    if (this.status == 200 && this.readyState == 4) {
      let data = JSON.parse(this.responseText);
      data.forEach((data) => {
        id++;
        let dessert = new Dessert(id, data["name"], data["category"], data["price"], data["image"]);
        cart.addToDessertsArray(dessert);
        let dessertCard = document.createElement("li");
        dessertCard.className = "dessert__card";
        dessertCard.dataset.id = dessert.id;
        dessertCard.innerHTML = `
            <div class="card__image">
              <picture>
                <source media="(min-width: 992px)" srcset=${dessert.image["desktop"]} />
                <source media="(min-width: 768px)" srcset=${dessert.image["tablet"]} />
                <img src=${dessert.image["mobile"]} alt="${dessert.name}" />
              </picture>
              <div class="btns">
                <button class="add-btn active">
                  <img src="./assets/images/icon-add-to-cart.svg" alt="add" />
                  Add to Cart
                </button>
                <button class="quantity-btn">
                  <img src="./assets/images/icon-decrement-quantity.svg" alt="decrease" />
                  <span class="number">${dessert.quantity}</span>
                  <img src="./assets/images/icon-increment-quantity.svg" alt="increase" />
                </button>
              </div>
            </div>
            <div class="card__body">
              <span class="card__type">${dessert.category}</span>
              <span class="card__title">${dessert.name}</span>
              <span class="card__price">$${dessert.price.toFixed(2)}</span>
            </div>`;
        dessertsList.appendChild(dessertCard);
      });
      let app = document.querySelector(".container");
      app.addEventListener("click", (e) => {
        let dessertCard = e.target.closest(".dessert__card");
        let cartBox = e.target.closest(".cart__box");
        if (dessertCard != null) {
          cart.handleDessertClick(dessertCard, e.target);
        } else if (cartBox != null) {
          cart.removeCartBox(cartBox, e.target);
        } else if (e.target == confirmBtn) {
          cart.confirmOrder();
        } else if (e.target == newOrderBtn) {
          confirmBox.classList.remove("active");
          document.body.classList.remove("inactive");
          cart.resetCart();
        }
      });
      // Check if there's something in local storage and pass the ID & Quantity
      if (localStorage["cart"]) {
        let data = JSON.parse(localStorage["cart"]);
        data.forEach((item) => {
          cart.dessertsArray.forEach((dessert) => {
            if (item["id"] == dessert["id"]) {
              dessert["quantity"] = item["quantity"];
            }
          });
          cart.updateCart(item["id"]);
        });
      }
    }
  };
}
