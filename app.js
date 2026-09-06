async function getData() {
  const url = "data.json";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(error.message);
  }
}
try{
    const res = await getData();


let test = ""
res.days.forEach(item => {
        text += `<div class="day">
                   <strong>${item.date_fa}</strong> — ${item.weekday}
                   <span class="sign">🜂 ${item.sign}</span>
                 </div>`;
      });
      document.getElementById("x").innerHTML = text;   // ← این خط جدید، نمایش میده
} catch(error){
    document.getElementById("x").textContent = "دیتا در دسترس نیست: " + error.message;
}

    
