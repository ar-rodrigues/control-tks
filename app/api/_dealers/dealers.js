export async function fetchDealers() {
    const res = await fetch('/api/dealers');
    if (!res.ok) {
      throw new Error('Failed to fetch roles');
    }
    return res.json();
  }

export async function fetchZonas() {
  const res = await fetch('/api/dealers/zonas');
  if(!res.ok) {
    throw new Error('Failed to fetch zonas')
  }
  return res.json();
}

export async function fetchEstados() {
  const res = await fetch('/api/dealers/estados');
  if(!res.ok) {
    throw new Error('Failed to fetch estados')
  }
  return res.json();
}

export async function fetchClientes() {
  const res = await fetch('/api/dealers/clientes');
  if(!res.ok) {
    throw new Error('Failed to fetch clientes')
  }
  return res.json();
}