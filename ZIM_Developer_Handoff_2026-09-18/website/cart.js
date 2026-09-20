/* The preview bag is local to this browser tab; it never creates an order. */
const PreviewBag = (() => {
  const key='zim-preview-bag';
  let items=[];
  const valid=item=>item && Object.hasOwn(CATALOG,item.product) && Number.isInteger(item.quantity) && item.quantity>0 && item.quantity<=99 && CATALOG[item.product].variants.some(v=>v.asset===item.asset);
  try {const saved=JSON.parse(sessionStorage.getItem(key)||'[]');if(Array.isArray(saved))items=saved.filter(valid);}catch{}
  function save(){try{sessionStorage.setItem(key,JSON.stringify(items));}catch{} render();document.dispatchEvent(new Event('cartchange'));}
  function render(){
    document.querySelector('#bagcount').textContent=items.reduce((n,i)=>n+i.quantity,0);
    const content=document.querySelector('#cart-content');content.replaceChildren();
    items.forEach((item,index)=>{
      const product=CATALOG[item.product],variant=product.variants.find(v=>v.asset===item.asset);
      const row=document.createElement('div');row.className='cart-item';
      const img=document.createElement('img');img.src=`assets/${variant.asset}-front.webp`;img.alt=product.name;
      const info=document.createElement('div'),title=document.createElement('h3'),description=document.createElement('p'),price=document.createElement('p'),remove=document.createElement('button');
      title.textContent=productTitle(product,variant);description.textContent=[variant.volume,variant.color?variant.color[0].toUpperCase()+variant.color.slice(1):'',`Qty ${item.quantity}`].filter(Boolean).join(' · ');price.textContent=`Rs. ${(variant.price*item.quantity).toLocaleString('en-PK')}`;remove.textContent='Remove';remove.className='remove';remove.onclick=()=>{items.splice(index,1);save()};
      info.append(title,description,price,remove);row.append(img,info);content.append(row);
    });
  }
  const dialog=document.querySelector('#cart');
  function open(){render();dialog.showModal();}
  document.querySelector('#bag').onclick=open;
  dialog.querySelector('.close').onclick=()=>dialog.close();
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
  render();
  return {getItems:()=>items.map(item=>({...item})),add(product,asset,quantity,show=true){const item={product,asset,quantity};if(!valid(item))throw Error('Invalid cart item');const existing=items.find(i=>i.product===product&&i.asset===asset);if(existing)existing.quantity=Math.min(99,existing.quantity+quantity);else items.push(item);save();if(show)open();}};
})();
