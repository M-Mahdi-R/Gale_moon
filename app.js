import broj from "./broj.json" with { type: "json" };

async function getData() {
  const response = await fetch(`data.json?v=${Date.now()}`); // ?v → کش رو می‌شکنه
  if (!response.ok) throw new Error(`Response status: ${response.status}`);
  return response.json();
}
  
try{
    const res = await getData();


let text = ""
res.days.forEach(item => {
        text += `<div class="day">
                   <strong>${item.date_fa}</strong> — ${item.weekday}
                   <span class="sign">🜂 ${item.sign}</span>
                   <p>${broj[item.sign] ?? "توضیح این برج هنوز نوشته نشده"}</p>
                 </div>` ;
      });
      document.getElementById("x").innerHTML = text;   // ← این خط جدید، نمایش میده
} catch(error){
    document.getElementById("x").textContent = "دیتا در دسترس نیست: " + error.message;
}

/////////////////////////////////////////////

function router() {
  const route = location.hash.slice(2);   // "#/m" → "m"
  if (route === "m") page.textContent = "سلام";
  else page.textContent = "صفحه اصلی";
}
window.addEventListener("hashchange", router);
router();  

export { broj, getData };
