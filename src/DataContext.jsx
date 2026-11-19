import { createContext, useContext, useEffect, useState } from 'react'
import { cached, loadData, saveData } from './store.js'

const Ctx = createContext(null)
export const useData = () => useContext(Ctx)

export function DataProvider({ children }) {
  const [data, setData] = useState(cached)

  useEffect(() => {
    loadData().then(setData).catch(() => { /* se queda con la copia local */ })
  }, [])

  // Guarda y actualiza la tienda. `next` es el objeto completo o una función (data) => data.
  const save = async (next) => {
    const value = typeof next === 'function' ? next(data) : next
    const saved = await saveData(value)
    setData(saved)
    return saved
  }

  return <Ctx.Provider value={{ ...data, save, data }}>{children}</Ctx.Provider>
}
