const cartBtn = document.querySelector('.cart-btn')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')
const cartDOM = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartItems = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const productsDOM = document.querySelector('.products-center')

let cart = []

let buttonsDOM = []

// letolti a termeket
class Products{
  async getProducts(){
    try{ 
      let response = await fetch('products.json')
      let products = await response.json()
      products = products.items
      let result = products.map(item=>{
        const{title, price}=item.fields
        const{id}=item.sys
        const image = item?.fields?.image?.fields?.file?.url
        return{title, price, id, image}
      })
      return result

    }catch(error){
      console.log(error)}
  }
}

// kiírja

class UI{
  displayProducts(products){
   
    let display = ""
    products.forEach(item=>{
      
      display += `<article class="product">
      <div class="img-container">
        <img src=${item.image} alt="product" class="product-img" >
        <button class="bag-btn" data-id=${item.id}><i class="fas fa-shopping-cart"></i>add to cart</button>
      </div>
      <h3>${item.title}</h3>
      <h4>$${item.price}</h4>
    </article>`
    })
    productsDOM.innerHTML = display 
  }

  // szedjuk ossze a gombokat
  getButtons(){
    let buttons = [...document.querySelectorAll('.bag-btn')]
    buttonsDOM = buttons
    buttons.forEach(button=>{
      let id = button.dataset.id
      let inCart = cart.find(item=>item.id === id)
      if(inCart){
       button.innerText = "In Cart";
       button.disabled = true;
      }button.addEventListener('click', (e)=>{
        let currentTarget = e.target.dataset.id
        e.target.innerText = "In Cart"
        e.target.disabled = true;
        // megkaptuk az itemeket
        let itemToCart = {...Storeage.getProducts(currentTarget), amount: 1}
        // beraltuk akosárba
        cart = [...cart, itemToCart]
        // bellitani az kosaereteket a total price ereteket
        this.setCartValues(cart)
        //kiiratni a kosar tartalmat
        this.addCartItem(itemToCart)
        //overlay és a kosar megjelenitese
        this.showCart()
        // kosar mentese localstoreage
        Storeage.saveCart(cart)
        // induljon egy App oldal betolteskor ami lekerdezi mi van kosarban es kiirja

      })
      
    })
   
  }  
  setCartValues(cart){
    let totalPrice = 0
    let totalItem = 0
    cart.map(item=>{
      totalPrice += item.price;
      totalItem += item.amount
    })
    cartTotal.innerText = parseFloat(totalPrice.toFixed(2))
    cartItems.innerText= totalItem

    console.log(totalPrice);
  }
  addCartItem(itemToCart){
    let div = document.createElement('div')
    div.classList.add('cart-item')
    div.innerHTML = `<img src=${itemToCart.image} alt="">
    <div>
     <h4>${itemToCart.title}</h4>
     <h5>$${itemToCart.price}</h5>
      <span class="remove-item">remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${itemToCart.id}></i>
      <p class="item-amount">${itemToCart.amount}</p>
      <i class="fas fa-chevron-down"></i>
    </div>`
    cartContent.appendChild(div)
  }
  showCart(){
    cartBtn.addEventListener('click', ()=>{
      cartOverlay.classList.add('transparentBcg')
      cartDOM.classList.add('showCart')
    })
    closeCartBtn.addEventListener('click', ()=>{
      cartOverlay.classList.remove('transparentBcg')
      cartDOM.classList.remove('showCart')
    })
  }

  setupApp(){
  cart = Storeage.getCart()
  this.setCartValues(cart)
  this.populateCart(cart)
  this.showCart()
  

}

populateCart(cart){
  cart.forEach(item=>this.addCartItem(item))
}

getButtonsFunction(){
  clearCartBtn.addEventListener('click',()=>{
    this.clearCart()
  })}


  clearCart(){
    let itemsInCart = cart.map(item=>item.id)
    itemsInCart.forEach(item=>this.removeItem(item))
    while(cartContent.children.length > 0){
      cartContent.removeChild(cartContent.children[0])
    }
  }

  removeItem(id){
    cart = cart.filter(item=>item.id != id)
    this.setCartValues(cart)
    Storeage.saveCart(cart)

    let button = this.getSingleButton(id)
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
    }
  
  getSingleButton(id){
    return buttonsDOM.find(button=>button.dataset.id === id)
  }






}
// tárolja

class Storeage{
  static saveData(data){
  let result = localStorage.getItem('products', JSON.stringify(data))
  return result
  }

  static getProducts(currentTarget){
    let products = JSON.parse(localStorage.getItem('products'))
    let itemToCart = products.find(item=>item.id === currentTarget)
    return itemToCart
  }
  static saveCart(cart){
    localStorage.setItem('cart', JSON.stringify(cart))
  }
 static getCart(){
   return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
 }
 
}

document.addEventListener('DOMContentLoaded', ()=>{
 const display = new UI
 const products = new Products
 
 // induljon egy App oldal betolteskor ami lekerdezi mi van kosarban es kiirja
 display.setupApp()

 products.getProducts().then(data=>{display.displayProducts(data); Storeage.saveData(data)})
 .then(()=>{display.getButtons(); display.getButtonsFunction()})
  

})