const $=selector=>document.querySelector(selector);
const params=new URLSearchParams(location.search);
const productId=Object.hasOwn(CATALOG,params.get('product'))?params.get('product'):'zimx';
const product=CATALOG[productId];
let variant=product.variants.find(v=>v.size===params.get('size')&&v.color===(params.get('color')||'')) || product.variants.find(v=>v.size===params.get('size')) || product.variants.find(v=>productId==='zimx'&&v.size==='4'&&v.color==='green') || product.variants[0];
let view='front',quantity=1;
const includesNozzle=v=>productId==='zimx' && v.size==='1';
const allowedViews=v=>includesNozzle(v)?['front','back','nozzle']:['front','back'];
const asset=(v=view)=>v==='nozzle'?'assets/zimx-nozzle.webp':`assets/${variant.asset}-${v}.webp`;

$('#product-intro').textContent=product.intro;
$('#product-category').textContent=(productId==='zimx'?'ZIMX':'ZIM')+' / '+product.category.toUpperCase();
$('#breadcrumb-name').textContent=product.name;$('#breadcrumb-category').textContent=product.category;
document.title=product.name+' | ZIM Chemicals';document.querySelector('meta[name="description"]').content=product.intro;
$('#description-copy').textContent=product.details;
for(const [selector,values] of [['#product-benefits',product.benefits],['#product-directions',product.directions]]){const list=$(selector);list.replaceChildren();values.forEach(value=>{const li=document.createElement('li');li.textContent=value;list.append(li)})}
$('#usage-note').hidden=!product.usageNote;$('#usage-note').textContent=product.usageNote||'';
$('.color-field .note').textContent=product.note;
const sizes=[...new Set(product.variants.map(v=>v.size))];
$('.sizes').replaceChildren();
$('.size-field').hidden=productId==='atf';
(productId==='atf'?[]:sizes).forEach(size=>{const button=document.createElement('button');button.dataset.size=size;const label=document.createElement('strong');label.textContent=product.variants.find(v=>v.size===size).volume;button.append(label);button.onclick=()=>{variant=product.variants.find(v=>v.size===size&&v.color===variant.color)||product.variants.find(v=>v.size===size);render()};$('.sizes').append(button)});
$('.color-field').hidden=!product.variants.some(v=>v.color);
if(productId==='zimx'){
  const thumb=document.createElement('button');thumb.className='thumb';thumb.dataset.view='nozzle';thumb.setAttribute('aria-pressed','false');thumb.hidden=true;
  const image=document.createElement('img');image.alt='Included pouring nozzle';image.src=asset('nozzle');
  const text=document.createElement('span');text.textContent='Nozzle';thumb.append(image,text);$('.thumbs').append(thumb);
}
document.querySelectorAll('[data-color]').forEach(button=>button.onclick=()=>{const selected=product.variants.find(v=>v.size===variant.size&&v.color===button.dataset.color);if(selected){variant=selected;render()}});
function render(){
  $('#product-title').textContent=productTitle(product,variant);
  $('#breadcrumb-name').textContent=productTitle(product,variant);
  document.title=productTitle(product,variant)+' | ZIM Chemicals';
  if(!allowedViews(variant).includes(view))view='front';
  $('#nozzle-included').hidden=!includesNozzle(variant);
  const nozzleThumb=$('[data-view="nozzle"]');if(nozzleThumb)nozzleThumb.hidden=!includesNozzle(variant);
  $('#mainimg').src=asset();$('#mainimg').alt=view==='nozzle'?'Transparent flexible pouring nozzle, included free with red and green ZIMX 1L bottles':[product.name,variant.volume,variant.color,view+' view'].filter(Boolean).join(', ');
  $('.hero-image').classList.toggle('nozzle-photo',view==='nozzle');
  $('#largeimg').src=asset();$('#largeimg').alt=$('#mainimg').alt;
  $('#frontthumb').src=asset('front');$('#backthumb').src=asset('back');
  $('#image-label').textContent=view==='nozzle'?'INCLUDED FREE · ZIMX 1L':variant.color.toUpperCase();
  $('#color-name').textContent=variant.color?variant.color[0].toUpperCase()+variant.color.slice(1):'';
  document.querySelectorAll('[data-size]').forEach(b=>{const active=b.dataset.size===variant.size;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',active)});
  document.querySelectorAll('[data-color]').forEach(b=>{const active=b.dataset.color===variant.color;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',active);b.disabled=!product.variants.some(v=>v.size===variant.size&&v.color===b.dataset.color)});
  document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===view;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',active)});
  $('.price').innerHTML=`Rs. ${variant.price.toLocaleString('en-PK')} <span>PKR</span>`;
  $('#qty').textContent=quantity;$('#minus').disabled=quantity===1;$('#plus').disabled=quantity===99;
}
document.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{if(allowedViews(variant).includes(button.dataset.view)){view=button.dataset.view;render()}});
$('#minus').onclick=()=>{quantity=Math.max(1,quantity-1);render()};$('#plus').onclick=()=>{quantity=Math.min(99,quantity+1);render()};
$('#zoom').onclick=()=>$('#lightbox').showModal();$('#lightbox .close').onclick=()=>$('#lightbox').close();
$('#lightbox').addEventListener('click',event=>{const dialog=$('#lightbox');if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
$('#add').onclick=()=>PreviewBag.add(productId,variant.asset,quantity);
$('#buy-now').onclick=()=>{PreviewBag.add(productId,variant.asset,quantity,false);location.href='checkout.html';};
render();
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'configure_product_preview',description:'Select an available bottle size, colour and image view for this product. Does not add to cart or place an order.',inputSchema:{type:'object',properties:{size:{type:'string',enum:sizes},color:{type:'string',enum:[...new Set(product.variants.map(v=>v.color))]},view:{type:'string',enum:productId==='zimx'?['front','back','nozzle']:['front','back']}},required:['size','color','view'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!input)throw Error('Invalid selection');const selected=product.variants.find(v=>v.size===input.size&&v.color===input.color);if(!selected)throw Error('This size and colour combination is unavailable');if(!allowedViews(selected).includes(input.view))throw Error('This image view is unavailable for this bottle');variant=selected;view=input.view;render();return {product:productId,size:variant.size,color:variant.color,view}}})).catch(()=>{})}catch{}}
