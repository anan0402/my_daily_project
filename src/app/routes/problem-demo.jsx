import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'

import DefaultLayout from '@/app/layouts/default-layout/default-layout'
import InfinitySelectBox from '@/components/ui/infinity-select-box'
// import { fakeApi } from '@/testing/fake-api'
import './problem-demo.css'

function ProblemDemoRoute() {
  const [state, setState] = useState(0)
  // const [selectedValue, setSelectedValue] = useState('')
  // const [entities, setEntities] = useState({})
  // const [childrenMap, setChildrenMap] = useState({})
  // const [rootIds, setRootIds] = useState([])
  // const [rootCursor, setRootCursor] = useState(0)
  // const [rootHasMore, setRootHasMore] = useState(true)
  // const [loadingRoot, setLoadingRoot] = useState(false)
  // const [loadingChildren, setLoadingChildren] = useState({})
  // const [childCursors, setChildCursors] = useState({})
  // const [childHasMore, setChildHasMore] = useState({})

  // const mapById = (items) =>
  //   items.reduce((acc, item) => {
  //     acc[item.id] = item
  //     return acc
  //   }, {})

  // const loadRoot = async () => {
  //   if (loadingRoot || !rootHasMore) return

  //   setLoadingRoot(true)
  //   const res = await fakeApi({ parentId: null, cursor: rootCursor, limit: 10 })

  //   setEntities((prev) => ({ ...prev, ...mapById(res.data) }))
  //   setRootIds((prev) => [...prev, ...res.data.map((item) => item.id)])
  //   setRootCursor(res.nextCursor)
  //   setRootHasMore(res.hasMore)
  //   setLoadingRoot(false)
  // }

  // const loadChildren = async (parentId) => {
  //   if (loadingChildren[parentId] || childHasMore[parentId] === false) return

  //   setLoadingChildren((prev) => ({ ...prev, [parentId]: true }))
  //   const cursor = childCursors[parentId] ?? 0
  //   const res = await fakeApi({ parentId, cursor, limit: 10 })

  //   setEntities((prev) => ({ ...prev, ...mapById(res.data) }))
  //   setChildrenMap((prev) => ({
  //     ...prev,
  //     [parentId]: [...(prev[parentId] || []), ...res.data.map((item) => item.id)],
  //   }))
  //   setChildCursors((prev) => ({ ...prev, [parentId]: res.nextCursor }))
  //   setChildHasMore((prev) => ({ ...prev, [parentId]: res.hasMore }))
  //   setLoadingChildren((prev) => ({ ...prev, [parentId]: false }))
  // }

  // useEffect(() => {
  //   loadRoot()
  // }, [])

  useEffect(() => {
    setTimeout(() => {
      setState(1)
    }, 5000)
  }, [])

  console.log('hehe', state)
  return (
    <DefaultLayout>
      <Box className="problem-demo-page">
        {/* <Paper elevation={0} className="problem-demo-page__card">
          <Stack spacing={2}>
            <InfinitySelectBox
              value={selectedValue}
              onChange={(event) => setSelectedValue(event.target.value)}
              entities={entities}
              childrenMap={childrenMap}
              rootIds={rootIds}
              onLoadRoot={loadRoot}
              onLoadChildren={loadChildren}
            />
          </Stack>
        </Paper> */}

      </Box>
    </DefaultLayout>
  )
}

export default ProblemDemoRoute
