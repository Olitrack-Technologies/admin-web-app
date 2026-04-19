import dynamic from "next/dynamic"

const PlaybackDynamicMap = dynamic(() => import("./PlaybackMapDynamic"), {
  ssr: false,
})

const PlaybackMap = (props) => {
  return (
    <div>
      <PlaybackDynamicMap {...props} />
    </div>
  )
}

export default PlaybackMap
