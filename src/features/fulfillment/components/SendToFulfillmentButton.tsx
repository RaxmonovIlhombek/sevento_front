import { Truck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { errorMessage } from '@/shared/api/errors'
import { Button, FormField, Input, Modal, PhoneInput, toast } from '@/shared/ui'

import { useSendToFulfillment } from '../api/fulfillment.api'

/** Savdodan keyin: buyurtmani omborchiga (taxlash) → operator → kuryerga yuboradi. */
export function SendToFulfillmentButton({
  saleId,
  defaultAddress = '',
  defaultPhone = '',
}: {
  saleId: number
  defaultAddress?: string
  defaultPhone?: string
}) {
  const navigate = useNavigate()
  const send = useSendToFulfillment()
  const [open, setOpen] = useState(false)
  const [address, setAddress] = useState(defaultAddress)
  const [phone, setPhone] = useState(defaultPhone)
  const [note, setNote] = useState('')

  const submit = () =>
    send.mutate(
      { sale: saleId, address: address.trim(), contact_phone: phone, note: note.trim() },
      {
        onSuccess: () => {
          toast.success('Buyurtma omborchiga yuborildi')
          setOpen(false)
          navigate('/fulfillment')
        },
        onError: (error) => toast.error(errorMessage(error)),
      },
    )

  return (
    <>
      <Button
        variant="secondary"
        icon={<Truck className="size-4" />}
        onClick={() => setOpen(true)}
        data-testid="sale-send-fulfillment"
      >
        Yetkazishga yuborish
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Yetkazishga yuborish"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Bekor qilish
            </Button>
            <Button loading={send.isPending} disabled={!address.trim()} onClick={submit}>
              Yuborish
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <FormField label="Manzil" required>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} autoFocus />
          </FormField>
          <FormField label="Mijoz telefoni">
            <PhoneInput value={phone} onChange={setPhone} />
          </FormField>
          <FormField label="Izoh">
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </FormField>
        </div>
      </Modal>
    </>
  )
}
