// valtozok

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

//ez szerzi meg a termékeket
class Products{
  async getProducts(){
    try{
      let result = await fetch('products.json')
      let data = await result.json()
      let products = data.items
      products = products.map(item=>{
        const{title, price}=item.fields;
        const{id}=item.sys;
        const image = item?.fields?.image?.fields?.file?.url
        return {title, price, id, image}
      })
      return products
    }catch(error){
      console.log(error);
    }
  }

}

// ez jeleníti meg 

class UI{
displayProducts(products){
  let result = ""
  products.forEach(product=>{
    result += `<article class="product">
    <div class="img-container">
      <img src=${product.image} alt="product" class="product-img" >
      <button class="bag-btn" data-id=${product.id}><i class="fas fa-shopping-cart"></i>add to cart</button>
    </div>
    <h3>${product.title}</h3>
    <h4>$${product.price}</h4>
  </article>`})
  productsDOM.innerHTML = result
};

getBagButtons(){
  const buttons = [...document.getElementsByClassName('bag-btn')]
  buttonsDOM = buttons
  buttons.forEach(button=>{
     let id= button.dataset.id
     let inCart = cart.find(item=>{item.id === id})
     if(inCart){
       button.innerText = "In Cart";
       button.disabled = true;
     }
     button.addEventListener('click', (e)=>{
     e.target.innerText = "In Cart";
     e.target.disabled = true;
     let cartItem = {...Storeage.getProduct(id), amount: 1}
     // kosarba rakas
     cart = [...cart, cartItem]
     // ertekek beallitasa
     this.setCartValues(cart) 
     // kosar tartalma div-be
     this.addCartItem(cartItem)   
     // kosar kiiratasa
     this.showCart()
     // kosar mentese a locastoreageba
     Storeage.saveCart(cart)
    })
  }) 
 } 

 setCartValues(cart){
  let priceTotal = 0
  let itemsTotal = 0
  cart.map(item=>{
    priceTotal += item.price * item.amount;
    itemsTotal += item.amount;
  })
  cartTotal.innerText = parseFloat(priceTotal.toFixed(2))
  
  cartItems.innerText = itemsTotal
 }
 
 addCartItem(item){
  let  div = document.createElement('div')
  div.classList.add('cart-item')
     div.innerHTML = `<img src=${item.image} alt="">
    <div>
     <h4>${item.title}</h4>
     <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>`
    //console.log(item);
  
  cartContent.appendChild(div)
  }


  showCart(){
    cartOverlay.classList.add('transparentBcg')
    cartDOM.classList.add('showCart')
    closeCartBtn.addEventListener('click',()=>{
      cartOverlay.classList.remove('transparentBcg')
      cartDOM.classList.remove('showCart')
    })
   
  }

  
  // setupAPP
  setupApp(){
    cart = Storeage.getCart()
    this.setCartValues(cart)
    this.poulaterCart(cart)
    cartBtn.addEventListener('click', this.showCart)
  }

  poulaterCart(cart){
    cart.forEach(item=>{this.addCartItem(item)})
    
  }

  cartLogic(){
    clearCartBtn.addEventListener('click', ()=>{
      this.clearCart()
    })
    cartContent.addEventListener('click', (e)=>{
      if(e.target.classList.contains('remove-item')){
        let id = e.target.dataset.id
        this.removeItem(id)
        let item = e.target.parentElement.parentElement;
        cartContent.removeChild(item)
      }else if(e.target.classList.contains('fa-chevron-up')){
        let addAmount = e.target.dataset.id
        let findItem = cart.find(item =>item.id==addAmount)
        findItem.amount ++
        Storeage.saveCart(cart)
        this.setCartValues(cart)
        let amount = e.target.parentElement.children[1]
        amount.innerText ++  
      }else if(e.target.classList.contains('fa-chevron-down')){
        let lowerAmount = e.target.dataset.id
        let findItem = cart.find(item =>item.id==lowerAmount)
        findItem.amount --
        if(findItem.amount <= 0){
          this. removeItem(lowerAmount)
          let item = e.target.parentElement.parentElement;
          cartContent.removeChild(item)
         }
        Storeage.saveCart(cart)
        this.setCartValues(cart)
        let amount = e.target.parentElement.children[1]
        amount.innerText -- 
      }
         
    })
  }
  

  clearCart(){
   let itemsInCart = cart.map(item=>item.id)
   itemsInCart.forEach(id=>this.removeItem(id))
   while(cartContent.children.length > 0){
     console.log(cartContent.children)
     cartContent.removeChild(cartContent.children[0])
     
   }
  }

  removeItem(id){
    cart = cart.filter(item=>item.id !=id)
    this.setCartValues(cart)
    Storeage.saveCart(cart)
    
    // gombkezeles torles utan 

    let button = this.getSingleButton(id)
    console.log(button)
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
  }

  getSingleButton(id){
    return buttonsDOM.find(button=>button.dataset.id === id)
}

}
  //ez tárolja

class Storeage{
static saveProducts(products){
  localStorage.setItem('products', JSON.stringify(products))
}
static getProduct(id){
  let products = JSON.parse(localStorage.getItem('products'))
  return products.find(product=>product.id === id)
}
static saveCart(cart){
  localStorage.setItem('cart', JSON.stringify(cart))
}
static getCart(){
  return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')):[]
}

}

document.addEventListener('DOMContentLoaded', ()=>{
  const ui = new UI()
  const products = new Products()

  // setup App
  ui.setupApp()

  products.getProducts()
  .then(products=>{ui.displayProducts(products); Storeage.saveProducts(products)})
  .then(()=>{ui.getBagButtons(); ui.cartLogic()})
})
