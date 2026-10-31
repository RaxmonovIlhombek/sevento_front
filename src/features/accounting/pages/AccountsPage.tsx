import { useState } from 'react'

import { useAccounts, useCreateAccount } from '../api/accounting.api'

export function AccountsPage() {
  const { data, isPending } = useAccounts()
  const create = useCreateAccount()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('asset')

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Hisoblar rejasi</h1>
      <form
        className="flex gap-2 mb-4"
        onSubmit={(e) => {
          e.preventDefault()
          create.mutate({ code, name, account_type: type, normal_balance: 'debit', is_postable: true } as never)
          setCode('')
          setName('')
        }}
      >
        <input className="border px-2 py-1" placeholder="Kod" value={code} onChange={(e) => setCode(e.target.value)} />
        <input className="border px-2 py-1" placeholder="Nomi" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="border px-2 py-1" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="asset">Aktiv</option>
          <option value="liability">Passiv</option>
          <option value="equity">Kapital</option>
          <option value="income">Daromad</option>
          <option value="expense">Xarajat</option>
        </select>
        <button className="bg-blue-600 text-white px-3 py-1 rounded" type="submit">
          Qo'shish
        </button>
      </form>
      {isPending && <p>Yuklanmoqda...</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Kod</th>
            <th className="border px-2">Nomi</th>
            <th className="border px-2">Turi</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((a) => (
            <tr key={a.id}>
              <td className="border px-2">{a.code}</td>
              <td className="border px-2">{a.name}</td>
              <td className="border px-2">{a.account_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
