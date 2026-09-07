import broj from "./broj.json" with { type: "json" };

async function getData() {
  const response = await fetch(`data.json?v=${Date.now()}`);
  if (!response.ok) throw new Error(`Response status: ${response.status}`);
  return response.json();
}

export { broj, getData };
