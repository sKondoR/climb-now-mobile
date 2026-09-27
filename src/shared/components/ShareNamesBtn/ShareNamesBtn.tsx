import { useState } from 'react'
import { Share } from 'react-native'
import { observer } from 'mobx-react-lite'

import { copyToClipboard, getShareUrl } from '@/shared/utils/forms.utils'
import { rootStore } from '@/store/root.store'
import { useIconColors } from '@/shared/theme'
import IconButton from '../IconButton/IconButton'

export default observer(function ShareNamesBtn() {
  const formStore = rootStore.formStore
  const names = formStore.names
  const [isSharing, setIsSharing] = useState(false)
  const iconColors = useIconColors()

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
    <IconButton
      icon="share-nodes"
      label="Поделиться списком скалолазов"
      color={iconColors.accent}
      onPress={handleShareClick}
      disabled={isSharing}
      busy={isSharing}
    />
  )
})
