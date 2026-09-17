import { useState } from 'react'
import { Pressable, Share } from 'react-native'
import { observer } from 'mobx-react-lite'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

import { copyToClipboard, getShareUrl } from '@/shared/utils/forms.utils'
import { rootStore } from '@/store/root.store'

export default observer(function ShareNamesBtn() {
  const formStore = rootStore.formStore
  const names = formStore.names
  const [isSharing, setIsSharing] = useState(false)

  if (!names) return null

  const handleShareClick = async () => {
    setIsSharing(true)
    try {
      const url = getShareUrl(names)
      await copyToClipboard(url)
      await Share.share({ message: url })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Pressable onPress={handleShareClick} disabled={isSharing} className="p-2">
      <FontAwesome6 name="share-nodes" solid size={14} color="#2563eb" />
    </Pressable>
  )
})
