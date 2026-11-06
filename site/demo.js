// Unsaved concept preview using actual CATEGORY_META labels and icons.
const data=JSON.parse(document.querySelector('#category-data').textContent);
const important=document.querySelector('#important'),urgent=document.querySelector('#urgent');
function render(){const key=important.checked?(urgent.checked?'harvest':'plant'):(urgent.checked?'thin':'dry');const c=data[key];document.querySelector('#result').className='category '+key;document.querySelector('#result-icon').src=c.icon;document.querySelector('#result-title').textContent=c.title;document.querySelector('#result-meaning').textContent=c.meaning;document.querySelector('#result-body').textContent=c.body;}
important.addEventListener('change',render);urgent.addEventListener('change',render);render();
