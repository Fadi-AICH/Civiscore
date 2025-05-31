import { Suspense } from "react"
import ExploreClient from "./explore-client"
import Loading from "./loading"

export default function ExplorePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ExploreClient />
    </Suspense>
  )
}