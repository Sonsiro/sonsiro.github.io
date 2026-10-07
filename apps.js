const apps = [
  {name:"Sonsiro VPN",cat:"android",icon:"SV",desc:"Ứng dụng kết nối VPN nhanh, gọn và dễ sử dụng.",version:"v1.0.0",url:"#"},
  {name:"M3U Player",cat:"android",icon:"M3",desc:"Trình phát playlist M3U với giao diện tối giản.",version:"v2.1.0",url:"#"},
  {name:"Sonsiro Tools",cat:"tools",icon:"ST",desc:"Bộ công cụ tiện ích dành cho công việc hằng ngày.",version:"v1.4.2",url:"#"},
  {name:"Xray Config",cat:"android",icon:"XR",desc:"Quản lý và nhập cấu hình VLESS / Xray.",version:"v1.2.0",url:"#"},
  {name:"Sonsiro Desktop",cat:"windows",icon:"SD",desc:"Ứng dụng desktop dành cho Windows.",version:"v1.0.0",url:"#"},
  {name:"File Manager",cat:"android",icon:"FM",desc:"Quản lý file nhanh với giao diện liquid glass.",version:"v1.1.5",url:"#"}
];

const appsEl=document.querySelector("#apps"), search=document.querySelector("#search"), count=document.querySelector("#count"), empty=document.querySelector("#empty");
let active="all";

function render(){
  const q=search.value.trim().toLowerCase();
  const list=apps.filter(a=>(active==="all"||a.cat===active)&&(!q||`${a.name} ${a.desc}`.toLowerCase().includes(q)));
  appsEl.innerHTML=list.map(a=>`
    <article class="card glass">
      <div class="app-top"><div class="app-icon">${a.icon}</div><span class="badge">${a.cat}</span></div>
      <h3>${a.name}</h3><p>${a.desc}</p>
      <div class="card-bottom"><span class="version">${a.version}</span><a class="download" href="${a.url}" ${a.url!=="#"?'target="_blank" rel="noreferrer"':''}>Tải xuống ↓</a></div>
    </article>`).join("");
  count.textContent=`${list.length} ứng dụng`;
  empty.classList.toggle("show",list.length===0);
}
document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active"); active=btn.dataset.filter; render();
}));
search.addEventListener("input",render);
document.addEventListener("keydown",e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();search.focus()}
});
document.querySelector("#themeBtn").addEventListener("click",()=>document.body.classList.toggle("light"));
render();
