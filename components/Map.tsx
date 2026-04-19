import dynamic from "next/dynamic"

const DynamicMap = dynamic(() => import("./MapDynamic"), {
  ssr: false,
})

const Map = (props) => {
  return (
    <div>
      <DynamicMap {...props} />
    </div>
  )
}

export default Map
