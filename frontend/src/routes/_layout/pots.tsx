import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { Suspense, useState } from "react"
import { AddPotDialog } from "@/components/Pots/AddPotDialog"
import { PotCard } from "@/components/Pots/PotCard"
import { Button } from "@/components/ui/button"
import { getPotsQueryOptions } from "@/queries/pots"

export const Route = createFileRoute("/_layout/pots")({
  component: Pots,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(getPotsQueryOptions()),
  head: () => ({
    meta: [{ title: "Pots - Finance App" }],
  }),
})

function PotsContent() {
  const [addOpen, setAddOpen] = useState(false)
  const { data: pots } = useSuspenseQuery(getPotsQueryOptions())
  const usedThemes = pots.map((p) => p.theme)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pots</h1>
        <Button
          className="h-13 bg-[#201F24] hover:bg-[#201F24]/90"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="size-4" />
          Add New Pot
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pots.map((pot) => (
          <PotCard key={pot.id} pot={pot} usedThemes={usedThemes} />
        ))}
      </div>
      <AddPotDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        usedThemes={usedThemes}
      />
    </div>
  )
}

function Pots() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PotsContent />
    </Suspense>
  )
}
