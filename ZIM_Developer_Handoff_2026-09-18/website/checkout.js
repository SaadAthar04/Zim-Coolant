function renderOrder(){
const orderItems=PreviewBag.getItems();
let subtotal=0;
const orderList=document.querySelector('#checkout-items');orderList.replaceChildren();
if(!orderItems.length){const empty=document.createElement('p');empty.textContent='Your cart is empty.';orderList.append(empty);}
for(const item of orderItems){const product=CATALOG[item.product],variant=product.variants.find(v=>v.asset===item.asset);const row=document.createElement('div');row.className='cart-item';const img=document.createElement('img');img.src=`assets/${variant.asset}-front.webp`;img.alt=product.name;const info=document.createElement('div'),title=document.createElement('h3'),description=document.createElement('p');title.textContent=productTitle(product,variant);description.textContent=[variant.volume,variant.color,`Qty ${item.quantity}`].filter(Boolean).join(' · ');const price=document.createElement('p');price.textContent=`Rs. ${(variant.price*item.quantity).toLocaleString('en-PK')}`;subtotal+=variant.price*item.quantity;info.append(title,description,price);row.append(img,info);orderList.append(row);}
document.querySelector('#checkout-subtotal').textContent=`Rs. ${subtotal.toLocaleString('en-PK')}`;
}
renderOrder();document.addEventListener('cartchange',renderOrder);
