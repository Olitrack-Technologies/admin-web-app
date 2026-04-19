import dynamic from "next/dynamic"

const DynamicDashboardMap = dynamic(() => import("./maps/Dashboard"), {
  ssr: false,
})

const DashboardMap = () => {
  return (
    <div className="w-full h-full ">
      <DynamicDashboardMap />
    </div>
  )
}

export default DashboardMap
